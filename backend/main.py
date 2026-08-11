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
import random
import string
import datetime as dt
from typing import Optional, List

import jwt
from fastapi import FastAPI, Depends, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Session, create_engine, select, Relationship

# ─────────────────────────── config ───────────────────────────
DB_URL = os.environ.get("DATABASE_URL", "sqlite:///./ars.db")
if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-change-me")
ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "ars2026")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
ADMIN_EMAILS = [e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()]

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
        d["photos"] = [ph.model_dump() for ph in pics]
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

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        if s.exec(select(Client)).first():
            return
        seed(s)

@app.get("/")
def root():
    return {"service": "ARS Portal API", "status": "ok", "statuses": STATUSES}

@app.get("/api/health")
def health():
    return {"ok": True}

# ── auth ──
class LoginBody(BaseModel):
    passcode: str

@app.post("/api/admin/login")
def admin_login(body: LoginBody):
    if body.passcode != ADMIN_PASSCODE:
        raise HTTPException(401, "Wrong passcode")
    return {"token": make_token("admin@ars.co.zw", "ARS Admin"),
            "admin": {"name": "ARS Admin", "email": "admin@ars.co.zw"}}

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
        ph = Photo(project_id=pid, **body.model_dump())
        s.add(ph); s.commit(); s.refresh(ph)
        return ph.model_dump()

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

# ─────────────────────────── seed ───────────────────────────
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
