"""
Asset Reliability Services — client portal + admin API.

FastAPI + SQLModel. Admins sign in (Google ID token or a passcode) and manage
clients, projects (deep tracking: progress, budget, milestones, work logs,
photos, map coordinates). Each client gets a shareable link + 4-digit PIN and
sees only their own projects.

Secrets are read from the environment only — never committed:
  DATABASE_URL, JWT_SECRET, ADMIN_PASSCODE, GOOGLE_CLIENT_ID, ADMIN_EMAILS
"""
import os
import io
import random
import string
import smtplib
import hashlib
import hmac
import base64
import datetime as dt
from email.message import EmailMessage
from typing import Optional, List

import jwt
from fastapi import FastAPI, Depends, HTTPException, Header, Body, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import LargeBinary, Column, text
from sqlmodel import SQLModel, Field, Session, create_engine, select, Relationship
from PIL import Image
from fpdf import FPDF

# ─────────────────────────── config ───────────────────────────
DB_URL = os.environ.get("DATABASE_URL", "sqlite:///./ars.db")
if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-change-me")
ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "ars2026")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
ADMIN_EMAILS = [e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]

# SMTP (Django-style env names, shared with the wider project)
SMTP_HOST = os.environ.get("EMAIL_HOST", "")
SMTP_PORT = int(os.environ.get("EMAIL_PORT", "465") or "465")
SMTP_USER = os.environ.get("EMAIL_HOST_USER", "")
SMTP_PASS = os.environ.get("EMAIL_HOST_PASSWORD", "")
SMTP_SSL = os.environ.get("EMAIL_USE_SSL", "true").lower() in ("1", "true", "yes")
SMTP_FROM = os.environ.get("FROM_EMAIL", SMTP_USER)

connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}
engine = create_engine(DB_URL, echo=False, pool_pre_ping=True, connect_args=connect_args)

STATUSES = ["Planning", "Active", "On hold", "Completed"]

# ─────────────────────────── models ───────────────────────────
class Client(SQLModel, table=True):
    __tablename__ = "ars_client"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    slug: str = Field(index=True, unique=True)
    pin: str
    contact: str = ""
    email: str = ""
    created_at: str = Field(default_factory=lambda: dt.date.today().isoformat())

class Project(SQLModel, table=True):
    __tablename__ = "ars_project"
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: int = Field(index=True, foreign_key="ars_client.id")
    title: str
    type: str = "Condition monitoring"
    status: str = "Active"
    progress: int = 0
    budget: float = 0
    spent: float = 0
    location: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_date: str = ""
    due_date: str = ""
    description: str = ""
    created_at: str = Field(default_factory=lambda: dt.date.today().isoformat())

class WorkLog(SQLModel, table=True):
    __tablename__ = "ars_worklog"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True, foreign_key="ars_project.id")
    date: str = ""
    title: str = ""
    note: str = ""
    status: str = "Logged"

class Milestone(SQLModel, table=True):
    __tablename__ = "ars_milestone"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True, foreign_key="ars_project.id")
    title: str = ""
    due: str = ""
    done: bool = False

class Photo(SQLModel, table=True):
    __tablename__ = "ars_photo"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True, foreign_key="ars_project.id")
    url: str = ""
    caption: str = ""
    mime: str = ""
    data: Optional[bytes] = Field(default=None, sa_column=Column(LargeBinary))

def photo_out(ph: "Photo"):
    """Serialise a photo WITHOUT its binary blob (never send bytes as JSON)."""
    return {"id": ph.id, "project_id": ph.project_id, "url": ph.url, "caption": ph.caption}

class AdminUser(SQLModel, table=True):
    __tablename__ = "ars_admin"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = ""
    email: str = Field(index=True, unique=True)
    password_hash: str = ""
    created_at: str = Field(default_factory=lambda: dt.date.today().isoformat())

class Product(SQLModel, table=True):
    __tablename__ = "ars_product"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    sku: str = ""
    category: str = ""
    price: float = 0
    stock: int = 0
    reorder: int = 5
    image: str = ""
    active: bool = True
    created_at: str = Field(default_factory=lambda: dt.date.today().isoformat())

class SiteContent(SQLModel, table=True):
    __tablename__ = "ars_content"
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = "Article"
    title: str = ""
    slug: str = ""
    excerpt: str = ""
    body: str = ""
    status: str = "Draft"
    date: str = Field(default_factory=lambda: dt.date.today().isoformat())
    image: str = ""
    youtube: str = ""

# ── password hashing (pbkdf2, stdlib — no native deps) ──
def hash_pw(pw: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 120_000)
    return base64.b64encode(salt).decode() + "$" + base64.b64encode(dk).decode()

def verify_pw(pw: str, stored: str) -> bool:
    try:
        s, h = stored.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), base64.b64decode(s), 120_000)
        return hmac.compare_digest(base64.b64encode(dk).decode(), h)
    except Exception:
        return False

# ─────────────────────────── helpers ───────────────────────────
def new_slug(n=6):
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))

def new_pin():
    return f"{random.randint(0, 9999):04d}"

def make_token(sub: str, name: str = "", picture: str = ""):
    payload = {"sub": sub, "name": name, "picture": picture, "role": "admin",
               "exp": dt.datetime.utcnow() + dt.timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def require_admin(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    try:
        data = jwt.decode(authorization[7:], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    if data.get("role") != "admin":
        raise HTTPException(403, "Not an admin")
    return data

def project_dict(s: Session, p: Project, deep=True):
    d = {k: getattr(p, k) for k in ["id", "client_id", "title", "type", "status", "progress",
                                    "budget", "spent", "location", "lat", "lng", "start_date",
                                    "due_date", "description", "created_at"]}
    if deep:
        logs = s.exec(select(WorkLog).where(WorkLog.project_id == p.id)).all()
        mils = s.exec(select(Milestone).where(Milestone.project_id == p.id)).all()
        pics = s.exec(select(Photo).where(Photo.project_id == p.id)).all()
        d["worklogs"] = sorted([w.model_dump() for w in logs], key=lambda x: x["date"], reverse=True)
        d["milestones"] = [m.model_dump() for m in mils]
        d["photos"] = [photo_out(ph) for ph in pics]
    return d

def client_dict(s: Session, c: Client, deep=False):
    d = {"id": c.id, "name": c.name, "slug": c.slug, "pin": c.pin, "contact": c.contact,
         "email": c.email, "created_at": c.created_at}
    projs = s.exec(select(Project).where(Project.client_id == c.id)).all()
    d["projectCount"] = len(projs)
    if deep:
        d["projects"] = [project_dict(s, p) for p in projs]
    return d

# ─────────────────────────── app ───────────────────────────
app = FastAPI(title="ARS Portal API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False,
                   allow_methods=["*"], allow_headers=["*"])

def migrate():
    """Add columns to pre-existing tables (create_all only creates missing tables)."""
    stmts = [
        "ALTER TABLE ars_photo ADD COLUMN IF NOT EXISTS mime VARCHAR",
        "ALTER TABLE ars_photo ADD COLUMN IF NOT EXISTS data BYTEA",
    ]
    with engine.begin() as conn:
        for st in stmts:
            try:
                conn.execute(text(st))
            except Exception:
                pass

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    migrate()
    with Session(engine) as s:
        if not s.exec(select(Client)).first():
            seed(s)
        if not s.exec(select(AdminUser)).first():
            seed_admin(s)
        if not s.exec(select(Product)).first():
            seed_products(s)
        if not s.exec(select(SiteContent)).first():
            seed_content(s)

@app.get("/")
def root():
    return {"service": "ARS Portal API", "status": "ok", "statuses": STATUSES}

@app.get("/api/health")
def health():
    return {"ok": True}

# ── auth ──
class RegisterBody(BaseModel):
    name: str = ""
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str

@app.post("/api/admin/register")
def admin_register(body: RegisterBody):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(400, "Enter a valid email address")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    with Session(engine) as s:
        if s.exec(select(AdminUser).where(AdminUser.email == email)).first():
            raise HTTPException(400, "An account with that email already exists")
        u = AdminUser(name=body.name.strip() or email.split("@")[0], email=email, password_hash=hash_pw(body.password))
        s.add(u); s.commit(); s.refresh(u)
        return {"token": make_token(u.email, u.name), "admin": {"name": u.name, "email": u.email}}

@app.post("/api/admin/login")
def admin_login(body: LoginBody):
    email = body.email.strip().lower()
    with Session(engine) as s:
        u = s.exec(select(AdminUser).where(AdminUser.email == email)).first()
        if not u or not verify_pw(body.password, u.password_hash):
            raise HTTPException(401, "Wrong email or password")
        return {"token": make_token(u.email, u.name), "admin": {"name": u.name, "email": u.email}}

class GoogleBody(BaseModel):
    credential: str

@app.post("/api/auth/google")
def auth_google(body: GoogleBody):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as grequests
        info = id_token.verify_oauth2_token(body.credential, grequests.Request(), GOOGLE_CLIENT_ID)
    except Exception as e:
        raise HTTPException(401, f"Google verification failed: {e}")
    email = (info.get("email") or "").lower()
    if ADMIN_EMAILS and email not in ADMIN_EMAILS:
        raise HTTPException(403, "This Google account is not an authorised admin")
    return {"token": make_token(email, info.get("name", ""), info.get("picture", "")),
            "admin": {"name": info.get("name", email), "email": email, "picture": info.get("picture", "")}}

# ── client portal access ──
class AccessBody(BaseModel):
    code: str
    pin: str

@app.post("/api/portal/access")
def portal_access(body: AccessBody):
    with Session(engine) as s:
        c = s.exec(select(Client).where(Client.slug == body.code.strip().lower())).first()
        if not c or c.pin != body.pin.strip():
            raise HTTPException(401, "Invalid code or PIN")
        return {"client": {"name": c.name, "slug": c.slug, "contact": c.contact},
                "projects": [project_dict(s, p) for p in s.exec(select(Project).where(Project.client_id == c.id)).all()]}

# ── admin: clients ──
@app.get("/api/admin/clients")
def list_clients(admin=Depends(require_admin)):
    with Session(engine) as s:
        return [client_dict(s, c) for c in s.exec(select(Client)).all()]

@app.get("/api/admin/clients/{cid}")
def get_client(cid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(Client, cid)
        if not c:
            raise HTTPException(404, "Not found")
        return client_dict(s, c, deep=True)

class ClientBody(BaseModel):
    name: str
    contact: str = ""
    email: str = ""

@app.post("/api/admin/clients")
def create_client(body: ClientBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        slug = new_slug()
        while s.exec(select(Client).where(Client.slug == slug)).first():
            slug = new_slug()
        c = Client(name=body.name, contact=body.contact, email=body.email, slug=slug, pin=new_pin())
        s.add(c); s.commit(); s.refresh(c)
        return client_dict(s, c, deep=True)

@app.post("/api/admin/clients/{cid}/regenerate-pin")
def regen_pin(cid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(Client, cid)
        if not c:
            raise HTTPException(404, "Not found")
        c.pin = new_pin(); s.add(c); s.commit(); s.refresh(c)
        return {"pin": c.pin}

@app.delete("/api/admin/clients/{cid}")
def del_client(cid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(Client, cid)
        if not c:
            raise HTTPException(404, "Not found")
        for p in s.exec(select(Project).where(Project.client_id == cid)).all():
            _delete_project(s, p)
        s.commit()            # flush project (+children) deletes before removing the client
        s.delete(c); s.commit()
        return {"ok": True}

# ── admin: projects ──
class ProjectBody(BaseModel):
    title: str
    type: str = "Condition monitoring"
    status: str = "Active"
    progress: int = 0
    budget: float = 0
    spent: float = 0
    location: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_date: str = ""
    due_date: str = ""
    description: str = ""

@app.post("/api/admin/clients/{cid}/projects")
def create_project(cid: int, body: ProjectBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        if not s.get(Client, cid):
            raise HTTPException(404, "Client not found")
        p = Project(client_id=cid, **body.model_dump())
        s.add(p); s.commit(); s.refresh(p)
        return project_dict(s, p)

@app.patch("/api/admin/projects/{pid}")
def update_project(pid: int, body: dict = Body(...), admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Project, pid)
        if not p:
            raise HTTPException(404, "Not found")
        for k, v in body.items():
            if hasattr(p, k) and k not in ("id", "client_id"):
                setattr(p, k, v)
        s.add(p); s.commit(); s.refresh(p)
        return project_dict(s, p)

def _delete_project(s: Session, p: Project):
    for M in (WorkLog, Milestone, Photo):
        for row in s.exec(select(M).where(M.project_id == p.id)).all():
            s.delete(row)
    s.delete(p)

@app.delete("/api/admin/projects/{pid}")
def delete_project(pid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Project, pid)
        if not p:
            raise HTTPException(404, "Not found")
        _delete_project(s, p); s.commit()
        return {"ok": True}

# ── admin: nested (worklogs / milestones / photos) ──
class WorkLogBody(BaseModel):
    date: str = ""
    title: str = ""
    note: str = ""
    status: str = "Logged"

@app.post("/api/admin/projects/{pid}/worklogs")
def add_worklog(pid: int, body: WorkLogBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        if not s.get(Project, pid):
            raise HTTPException(404, "Project not found")
        w = WorkLog(project_id=pid, **body.model_dump())
        s.add(w); s.commit(); s.refresh(w)
        return w.model_dump()

class MilestoneBody(BaseModel):
    title: str
    due: str = ""

@app.post("/api/admin/projects/{pid}/milestones")
def add_milestone(pid: int, body: MilestoneBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        if not s.get(Project, pid):
            raise HTTPException(404, "Project not found")
        m = Milestone(project_id=pid, **body.model_dump())
        s.add(m); s.commit(); s.refresh(m)
        return m.model_dump()

@app.patch("/api/admin/milestones/{mid}")
def toggle_milestone(mid: int, body: dict = Body(...), admin=Depends(require_admin)):
    with Session(engine) as s:
        m = s.get(Milestone, mid)
        if not m:
            raise HTTPException(404, "Not found")
        m.done = bool(body.get("done", not m.done)); s.add(m); s.commit(); s.refresh(m)
        return m.model_dump()

class PhotoBody(BaseModel):
    url: str
    caption: str = ""

@app.post("/api/admin/projects/{pid}/photos")
def add_photo(pid: int, body: PhotoBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        if not s.get(Project, pid):
            raise HTTPException(404, "Project not found")
        ph = Photo(project_id=pid, url=body.url, caption=body.caption)
        s.add(ph); s.commit(); s.refresh(ph)
        return photo_out(ph)

def compress_image(raw: bytes, max_dim=1600, quality=82):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im.thumbnail((max_dim, max_dim))
    out = io.BytesIO(); im.save(out, format="JPEG", quality=quality, optimize=True)
    return out.getvalue(), "image/jpeg"

@app.post("/api/admin/projects/{pid}/upload")
async def upload_photo(pid: int, file: UploadFile = File(...), caption: str = Form(""), admin=Depends(require_admin)):
    with Session(engine) as s:
        if not s.get(Project, pid):
            raise HTTPException(404, "Project not found")
        raw = await file.read()
        if len(raw) > 15_000_000:
            raise HTTPException(413, "Image too large (max 15 MB)")
        try:
            data, mime = compress_image(raw)
        except Exception:
            raise HTTPException(400, "Could not read that image")
        ph = Photo(project_id=pid, caption=caption, mime=mime, data=data)
        s.add(ph); s.commit(); s.refresh(ph)
        ph.url = f"/api/photos/{ph.id}"; s.add(ph); s.commit(); s.refresh(ph)
        return photo_out(ph)

@app.get("/api/photos/{photo_id}")
def get_photo(photo_id: int):
    with Session(engine) as s:
        ph = s.get(Photo, photo_id)
        if not ph or not ph.data:
            raise HTTPException(404, "Not found")
        return Response(content=ph.data, media_type=ph.mime or "image/jpeg",
                        headers={"Cache-Control": "public, max-age=86400"})

@app.delete("/api/admin/photos/{photo_id}")
def del_photo(photo_id: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        ph = s.get(Photo, photo_id)
        if ph:
            s.delete(ph); s.commit()
        return {"ok": True}

# ── email delivery of the portal link + PIN ──
class NotifyBody(BaseModel):
    link: str

@app.post("/api/admin/clients/{cid}/notify")
def notify_client(cid: int, body: NotifyBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(Client, cid)
        if not c:
            raise HTTPException(404, "Not found")
        if not c.email:
            raise HTTPException(400, "This client has no email address on file")
        if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
            raise HTTPException(400, "Email sending is not configured on the server")
        html = f"""<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <div style="background:#17181c;color:#fff;padding:20px 24px"><b style="font-size:18px">Asset Reliability Services</b></div>
          <div style="border:1px solid #eee;border-top:0;padding:24px">
            <p>Hello {c.name},</p>
            <p>You can now follow your projects with us online — live progress, work history, site photos, costs and reports for every job.</p>
            <p style="margin:24px 0"><a href="{body.link}" style="background:#e2211c;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold">Open your portal</a></p>
            <p style="font-size:14px;color:#555">Or paste this link: <a href="{body.link}">{body.link}</a></p>
            <p style="font-size:15px">Your access PIN: <b style="font-size:22px;letter-spacing:3px">{c.pin}</b></p>
            <p style="font-size:12px;color:#999;margin-top:24px">Asset Reliability Services (Pvt) Ltd</p>
          </div></div>"""
        text = f"Hello {c.name},\n\nTrack your projects with Asset Reliability Services:\n{body.link}\nAccess PIN: {c.pin}\n\n— Asset Reliability Services (Pvt) Ltd"
        try:
            msg = EmailMessage(); msg["Subject"] = "Your Asset Reliability Services project portal"
            msg["From"] = SMTP_FROM; msg["To"] = c.email
            msg.set_content(text); msg.add_alternative(html, subtype="html")
            if SMTP_SSL:
                with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=25) as srv:
                    srv.login(SMTP_USER, SMTP_PASS); srv.send_message(msg)
            else:
                with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=25) as srv:
                    srv.starttls(); srv.login(SMTP_USER, SMTP_PASS); srv.send_message(msg)
        except Exception as e:
            raise HTTPException(502, f"Could not send email: {e}")
        return {"ok": True, "to": c.email}

# ── PDF report ──
def photo_blobs(s: Session, pid: int, limit=4):
    out = []
    for ph in s.exec(select(Photo).where(Photo.project_id == pid)).all():
        if len(out) >= limit:
            break
        b = ph.data
        if not b and ph.url.startswith("http"):
            try:
                import urllib.request
                b = urllib.request.urlopen(ph.url, timeout=8).read()
            except Exception:
                b = None
        if b:
            out.append((ph.caption or "", b))
    return out

def _t(s):
    """Core PDF fonts are latin-1 only — normalise smart punctuation, drop the rest."""
    s = str(s)
    for a, b in (("—", "-"), ("–", "-"), ("‘", "'"), ("’", "'"), ("“", '"'), ("”", '"'), ("…", "...")):
        s = s.replace(a, b)
    return s.encode("latin-1", "replace").decode("latin-1")

LM, RM, PW = 14, 14, 210            # left/right margin, page width
CW = PW - LM - RM                   # content width = 182

def build_report(client_name, p, photos):
    RED, DARK, GREY = (226, 33, 28), (23, 24, 28), (120, 120, 130)
    pdf = FPDF(format="A4"); pdf.set_margins(LM, 14, RM); pdf.set_auto_page_break(True, margin=18); pdf.add_page()
    pdf.set_fill_color(*DARK); pdf.rect(0, 0, PW, 26, "F")
    pdf.set_xy(LM, 8); pdf.set_text_color(255, 255, 255); pdf.set_font("Helvetica", "B", 15); pdf.cell(120, 8, "Asset Reliability Services")
    pdf.set_xy(LM, 16); pdf.set_font("Helvetica", "", 9); pdf.set_text_color(225, 225, 225); pdf.cell(120, 5, "Project report")
    pdf.set_xy(PW - RM - 46, 10); pdf.set_font("Helvetica", "B", 9); pdf.set_text_color(255, 170, 165); pdf.cell(46, 5, dt.date.today().isoformat(), align="R")

    pdf.set_xy(LM, 34); pdf.set_text_color(*DARK); pdf.set_font("Helvetica", "B", 20); pdf.multi_cell(CW, 9, _t(p["title"]))
    pdf.set_x(LM); pdf.set_text_color(*GREY); pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(CW, 6, _t(f'{client_name}   |   {p["type"]}   |   {p["status"]}   |   {p["progress"]}% complete'))
    pdf.ln(6)

    def head(t):
        pdf.set_x(LM); pdf.set_text_color(*RED); pdf.set_font("Helvetica", "B", 8); pdf.cell(CW, 5, _t(t.upper())); pdf.ln(7)
    def kv(k, v):
        y = pdf.get_y()
        pdf.set_xy(LM, y); pdf.set_text_color(*GREY); pdf.set_font("Helvetica", "", 9); pdf.cell(36, 6, _t(k))
        pdf.set_xy(LM + 36, y); pdf.set_text_color(*DARK); pdf.set_font("Helvetica", "", 9); pdf.multi_cell(CW - 36, 6, _t(v))

    head("Overview")
    kv("Contract value", "US$ %s" % f'{p["budget"]:,.0f}'); kv("Spent to date", "US$ %s" % f'{p["spent"]:,.0f}')
    kv("Schedule", f'{p.get("start_date","-") or "-"}  to  {p.get("due_date","-") or "-"}'); kv("Location", p.get("location") or "-")
    if p.get("description"):
        pdf.ln(1); kv("Summary", p["description"])
    if p.get("milestones"):
        pdf.ln(3); head("Milestones")
        for m in p["milestones"]:
            y = pdf.get_y()
            pdf.set_xy(LM, y); pdf.set_text_color(*((30, 150, 90) if m["done"] else RED)); pdf.set_font("Helvetica", "B", 11); pdf.cell(6, 6, "+" if m["done"] else "o")
            pdf.set_xy(LM + 6, y); pdf.set_text_color(*DARK); pdf.set_font("Helvetica", "", 9); pdf.multi_cell(CW - 6, 6, _t(f'{m["title"]}   ({m.get("due","")})'))
    if p.get("worklogs"):
        pdf.ln(3); head("Work history")
        for w in p["worklogs"]:
            pdf.set_x(LM); pdf.set_text_color(*RED); pdf.set_font("Helvetica", "B", 8); pdf.cell(CW, 5, _t(f'{w["date"]}   |   {w["status"]}')); pdf.ln(5)
            pdf.set_x(LM); pdf.set_text_color(*DARK); pdf.set_font("Helvetica", "B", 9); pdf.cell(CW, 5, _t(w["title"])); pdf.ln(5)
            if w.get("note"):
                pdf.set_x(LM); pdf.set_text_color(*GREY); pdf.set_font("Helvetica", "", 9); pdf.multi_cell(CW, 5, _t(w["note"]))
            pdf.ln(2)
    if photos:
        pdf.ln(3); head("Site photos")
        y = pdf.get_y()
        for i, (cap, b) in enumerate(photos):
            col = i % 2
            if col == 0 and i > 0:
                y += 62
            if y > 235:
                pdf.add_page(); y = 20
            try:
                pdf.image(io.BytesIO(b), x=LM + col * 92, y=y, w=88, h=56)
            except Exception:
                pass
        pdf.set_y(y + 60)
    return bytes(pdf.output())

@app.get("/api/admin/projects/{pid}/report")
def admin_report(pid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Project, pid)
        if not p:
            raise HTTPException(404, "Not found")
        c = s.get(Client, p.client_id)
        pdf = build_report(c.name if c else "", project_dict(s, p), photo_blobs(s, pid))
        return Response(pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="ARS-report-{pid}.pdf"'})

class ReportReq(BaseModel):
    code: str
    pin: str
    project_id: int

@app.post("/api/portal/report")
def client_report(body: ReportReq):
    with Session(engine) as s:
        c = s.exec(select(Client).where(Client.slug == body.code.strip().lower())).first()
        if not c or c.pin != body.pin.strip():
            raise HTTPException(401, "Invalid code or PIN")
        p = s.get(Project, body.project_id)
        if not p or p.client_id != c.id:
            raise HTTPException(404, "Not found")
        pdf = build_report(c.name, project_dict(s, p), photo_blobs(s, body.project_id))
        return Response(pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="ARS-report-{p.id}.pdf"'})

# ── admin: map (all projects with coords) ──
@app.get("/api/admin/map")
def admin_map(admin=Depends(require_admin)):
    with Session(engine) as s:
        out = []
        for p in s.exec(select(Project)).all():
            if p.lat is None or p.lng is None:
                continue
            c = s.get(Client, p.client_id)
            d = project_dict(s, p, deep=False)
            d["client"] = c.name if c else ""
            out.append(d)
        return out

def slugify(t):
    import re
    return re.sub(r"[^a-z0-9]+", "-", (t or "").lower()).strip("-")[:60]

# ─────────────────────────── inventory ───────────────────────────
def product_out(p):
    return {k: getattr(p, k) for k in ["id", "name", "sku", "category", "price", "stock", "reorder", "image", "active"]}

@app.get("/api/products")
def public_products():
    with Session(engine) as s:
        return [product_out(p) for p in s.exec(select(Product).where(Product.active == True)).all()]

@app.get("/api/admin/products")
def list_products(admin=Depends(require_admin)):
    with Session(engine) as s:
        return [product_out(p) for p in s.exec(select(Product)).all()]

class ProductBody(BaseModel):
    name: str
    sku: str = ""
    category: str = ""
    price: float = 0
    stock: int = 0
    reorder: int = 5
    image: str = ""
    active: bool = True

@app.post("/api/admin/products")
def create_product(body: ProductBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        p = Product(**body.model_dump()); s.add(p); s.commit(); s.refresh(p)
        return product_out(p)

@app.patch("/api/admin/products/{pid}")
def update_product_(pid: int, body: dict = Body(...), admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Product, pid)
        if not p:
            raise HTTPException(404, "Not found")
        for k, v in body.items():
            if hasattr(p, k) and k != "id":
                setattr(p, k, v)
        s.add(p); s.commit(); s.refresh(p)
        return product_out(p)

@app.post("/api/admin/products/{pid}/stock")
def adjust_stock(pid: int, body: dict = Body(...), admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Product, pid)
        if not p:
            raise HTTPException(404, "Not found")
        p.stock = max(0, p.stock + int(body.get("delta", 0))); s.add(p); s.commit(); s.refresh(p)
        return product_out(p)

@app.delete("/api/admin/products/{pid}")
def del_product(pid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        p = s.get(Product, pid)
        if p:
            s.delete(p); s.commit()
        return {"ok": True}

# ─────────────────────────── site content (CMS) ───────────────────────────
def content_out(c):
    return {k: getattr(c, k) for k in ["id", "type", "title", "slug", "excerpt", "body", "status", "date", "image", "youtube"]}

@app.get("/api/content")
def public_content():
    with Session(engine) as s:
        return [content_out(c) for c in s.exec(select(SiteContent).where(SiteContent.status == "Published")).all()]

@app.get("/api/admin/content")
def list_content(admin=Depends(require_admin)):
    with Session(engine) as s:
        return [content_out(c) for c in s.exec(select(SiteContent)).all()]

class ContentBody(BaseModel):
    type: str = "Article"
    title: str = ""
    slug: str = ""
    excerpt: str = ""
    body: str = ""
    status: str = "Draft"
    image: str = ""
    youtube: str = ""

@app.post("/api/admin/content")
def create_content(body: ContentBody, admin=Depends(require_admin)):
    with Session(engine) as s:
        d = body.model_dump()
        if not d.get("slug") and d.get("title"):
            d["slug"] = slugify(d["title"])
        c = SiteContent(**d); s.add(c); s.commit(); s.refresh(c)
        return content_out(c)

@app.patch("/api/admin/content/{cid}")
def update_content(cid: int, body: dict = Body(...), admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(SiteContent, cid)
        if not c:
            raise HTTPException(404, "Not found")
        for k, v in body.items():
            if hasattr(c, k) and k != "id":
                setattr(c, k, v)
        s.add(c); s.commit(); s.refresh(c)
        return content_out(c)

@app.delete("/api/admin/content/{cid}")
def del_content(cid: int, admin=Depends(require_admin)):
    with Session(engine) as s:
        c = s.get(SiteContent, cid)
        if c:
            s.delete(c); s.commit()
        return {"ok": True}

# ─────────────────────────── seed ───────────────────────────
def seed_admin(s: Session):
    s.add(AdminUser(name="ARS Admin", email="admin@ars.co.zw", password_hash=hash_pw(ADMIN_PASSCODE or "ARS-admin-2026")))
    s.commit()

def seed_products(s: Session):
    IMG = "https://demo-asset-reliability.onrender.com/img/photos"
    items = [
        ("SKF Deep-Groove Bearing 6205-2RS", "BRG-6205", "Bearings", 18.50, 240, 40, f"{IMG}/motors.jpg"),
        ("Triaxial Vibration Accelerometer", "SEN-VA3", "Condition Monitoring", 320.00, 26, 10, f"{IMG}/vibration.jpg"),
        ("FLIR E8-XT Thermal Camera", "THM-E8XT", "Condition Monitoring", 3950.00, 6, 3, f"{IMG}/thermography.jpg"),
        ("Ultrasonic Leak Detector", "UT-LD200", "Condition Monitoring", 1450.00, 9, 4, f"{IMG}/ultrasound.jpg"),
        ("Lithium EP2 Grease Cartridge 400g", "LUB-EP2", "Lubrication", 6.75, 480, 80, f"{IMG}/fluids.jpg"),
        ("2-Tonne Chain Lever Hoist", "LIF-CH2", "Lifting & Load", 210.00, 14, 5, f"{IMG}/lifting2.jpg"),
        ("Webbing Lifting Sling 3T x 3m", "LIF-WS3", "Lifting & Load", 42.00, 60, 15, f"{IMG}/crane.jpg"),
        ("Oil Sampling & Analysis Kit", "FLU-OSK", "Fluid Management", 85.00, 3, 6, f"{IMG}/fluids.jpg"),
    ]
    for n, sku, cat, price, stock, reorder, img in items:
        s.add(Product(name=n, sku=sku, category=cat, price=price, stock=stock, reorder=reorder, image=img))
    s.commit()

def seed_content(s: Session):
    IMG = "https://demo-asset-reliability.onrender.com/img/photos"
    items = [
        ("Article", "Why we say all failures are preventable", "The reliability mindset that turns unplanned downtime into a schedule.", "Published", f"{IMG}/vibration.jpg", ""),
        ("Case study", "Mimosa Mine: 6 months, zero unplanned mill stops", "How a monthly vibration route caught three bearing faults before failure.", "Published", f"{IMG}/motors.jpg", ""),
        ("Video", "Vibration analysis explained", "A two-minute primer on what our analysts actually measure.", "Published", f"{IMG}/vibration.jpg", "JFYd_UuAHa4"),
        ("Article", "Vibration or thermography — which do you need?", "Choosing the right condition-monitoring technique per asset class.", "Draft", f"{IMG}/thermography.jpg", ""),
        ("Standard", "Reading ISO 20816 vibration limits", "How the zones map to real maintenance decisions.", "Published", f"{IMG}/laser.jpg", ""),
        ("Article", "Getting oil analysis right on site", "Sampling technique is 80% of a useful oil report.", "Draft", f"{IMG}/fluids.jpg", ""),
    ]
    for t, title, excerpt, status, img, yt in items:
        s.add(SiteContent(type=t, title=title, slug=slugify(title), excerpt=excerpt, status=status, image=img, youtube=yt, body=excerpt))
    s.commit()

def seed(s: Session):
    IMG = "https://demo-asset-reliability.onrender.com/img/photos"
    demo = [
        dict(name="Mimosa Mine", contact="+263 77 000 0001", email="reliability@mimosa.co.zw", slug="mimosa", pin="1948",
             projects=[
                 dict(title="Concentrator Vibration Route", type="Vibration analysis", status="Active", progress=68,
                      budget=42000, spent=27500, location="Zvishavane", lat=-20.3339, lng=30.0680,
                      start_date="2026-05-04", due_date="2026-09-30",
                      description="Monthly vibration monitoring across 148 rotating assets in the concentrator, with prioritised action reports.",
                      logs=[("2026-08-05", "Route 8 completed", "Mill 2 pinion bearing flagged — action raised.", "Action required"),
                            ("2026-07-08", "Route 7 completed", "All assets within limits.", "Reviewed"),
                            ("2026-06-10", "Baseline re-established", "New accelerometer mounts fitted on ID fans.", "Reviewed")],
                      miles=[("Baseline survey", "2026-05-10", True), ("Q2 review", "2026-07-01", True), ("Q3 review", "2026-10-01", False)],
                      pics=[(f"{IMG}/vibration.jpg", "Concentrator drive train"), (f"{IMG}/motors.jpg", "Ball mill motor 2")]),
                 dict(title="Statutory Lifting Inspection", type="Lifting & load", status="Completed", progress=100,
                      budget=9800, spent=9800, location="Zvishavane", lat=-20.3401, lng=30.0725,
                      start_date="2026-07-14", due_date="2026-07-21",
                      description="Annual statutory load test and certification of overhead cranes and lifting tackle.",
                      logs=[("2026-07-21", "Certificates issued", "All 6 cranes passed. Certs valid 12 months.", "Certified")],
                      miles=[("On-site testing", "2026-07-18", True), ("Certification", "2026-07-21", True)],
                      pics=[(f"{IMG}/crane.jpg", "Overhead crane 3"), (f"{IMG}/lifting2.jpg", "Lifting tackle")]),
             ]),
        dict(name="Hwange Colliery", contact="+263 77 000 0002", email="plant@hwangecolliery.co.zw", slug="hwange", pin="1899",
             projects=[
                 dict(title="Thermography Survey — MCC Rooms", type="Thermography", status="On hold", progress=40,
                      budget=15600, spent=6200, location="Hwange", lat=-18.3647, lng=26.5000,
                      start_date="2026-06-01", due_date="2026-10-15",
                      description="Infrared survey of electrical distribution and motor control centres to catch hot joints before failure.",
                      logs=[("2026-08-02", "MCC Room B scanned", "Two hot terminations found — awaiting shutdown window.", "Action required")],
                      miles=[("MCC Room A", "2026-06-20", True), ("MCC Room B", "2026-08-02", True), ("MCC Room C", "2026-10-10", False)],
                      pics=[(f"{IMG}/thermography.jpg", "Thermal survey — MCC")]),
             ]),
    ]
    for cd in demo:
        projs = cd.pop("projects")
        c = Client(**{k: cd[k] for k in ("name", "contact", "email", "slug", "pin")})
        s.add(c); s.commit(); s.refresh(c)
        for pd in projs:
            logs = pd.pop("logs", []); miles = pd.pop("miles", []); pics = pd.pop("pics", [])
            p = Project(client_id=c.id, **pd); s.add(p); s.commit(); s.refresh(p)
            for d, t, n, st in logs:
                s.add(WorkLog(project_id=p.id, date=d, title=t, note=n, status=st))
            for t, du, dn in miles:
                s.add(Milestone(project_id=p.id, title=t, due=du, done=dn))
            for u, cap in pics:
                s.add(Photo(project_id=p.id, url=u, caption=cap))
            s.commit()
