import os
from functools import wraps
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
firebase_admin.initialize_app(credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"]))
db = firestore.client()

STATUSES = ["Called", "Voicemail", "Not interested", "Follow up", "Sold", "Demo sent"]
EDITABLE = {"customerName", "phone", "email", "appointmentDate", "appointmentTime", "status", "notes"}

app = Flask(__name__)
CORS(app, origins=[os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")])


# ---------- auth helpers ----------
def require_auth(admin=False):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **kw):
            header = request.headers.get("Authorization", "")
            if not header.startswith("Bearer "):
                return jsonify(error="Missing token"), 401
            try:
                g.user = auth.verify_id_token(header[7:], check_revoked=True)
            except Exception:
                return jsonify(error="Invalid or revoked token"), 401
            g.is_admin = g.user.get("role") == "admin"
            if admin and not g.is_admin:
                return jsonify(error="Admin only"), 403
            return fn(*a, **kw)
        return wrapper
    return deco


def now():
    return datetime.now(timezone.utc)


def serialize(doc):
    d = doc.to_dict()
    d["id"] = doc.id
    for k in ("createdAt", "updatedAt"):
        if d.get(k):
            d[k] = d[k].isoformat()
    return d


def get_lead_or_404(lead_id):
    ref = db.collection("leads").document(lead_id)
    snap = ref.get()
    if not snap.exists:
        return None, None
    # agents may only touch their own leads
    if not g.is_admin and snap.get("ownerId") != g.user["uid"]:
        return None, None
    return ref, snap


# ---------- leads ----------
@app.get("/api/leads")
@require_auth()
def list_leads():
    q = db.collection("leads")
    if not g.is_admin:
        q = q.where("ownerId", "==", g.user["uid"])
    q = q.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(500)
    return jsonify([serialize(d) for d in q.stream()])


@app.post("/api/leads")
@require_auth()
def create_lead():
    b = request.get_json(silent=True) or {}
    required = ["customerName", "phone", "email", "appointmentDate", "appointmentTime"]
    missing = [f for f in required if not str(b.get(f, "")).strip()]
    if missing:
        return jsonify(error=f"Missing: {', '.join(missing)}"), 400
    lead = {f: str(b[f]).strip() for f in required}
    lead.update(
        status="Called" if b.get("status") not in STATUSES else b["status"],
        notes=str(b.get("notes", "")),
        ownerId=g.user["uid"],
        ownerName=g.user.get("name") or g.user.get("email"),
        createdAt=now(),
        updatedAt=now(),
    )
    ref = db.collection("leads").document()
    ref.set(lead)
    return jsonify(serialize(ref.get())), 201


@app.patch("/api/leads/<lead_id>")
@require_auth()
def update_lead(lead_id):
    ref, snap = get_lead_or_404(lead_id)
    if not ref:
        return jsonify(error="Not found"), 404
    b = request.get_json(silent=True) or {}
    changes = {k: v for k, v in b.items() if k in EDITABLE}
    if "status" in changes and changes["status"] not in STATUSES:
        return jsonify(error="Invalid status"), 400
    if not changes:
        return jsonify(error="Nothing to update"), 400
    changes["updatedAt"] = now()
    batch = db.batch()
    batch.update(ref, changes)
    if "status" in changes and changes["status"] != snap.get("status"):  # audit trail
        batch.set(ref.collection("activity").document(), {
            "type": "status", "from": snap.get("status"), "to": changes["status"],
            "by": g.user["uid"], "at": now()})
    batch.commit()
    return jsonify(serialize(ref.get()))


@app.delete("/api/leads/<lead_id>")
@require_auth(admin=True)
def delete_lead(lead_id):
    db.collection("leads").document(lead_id).delete()
    return "", 204


# ---------- admin: user management ----------
@app.get("/api/admin/users")
@require_auth(admin=True)
def list_users():
    return jsonify([{**d.to_dict(), "uid": d.id} for d in db.collection("users").stream()])


@app.post("/api/admin/users")
@require_auth(admin=True)
def create_user():
    b = request.get_json(silent=True) or {}
    email, name, pw = b.get("email", "").strip(), b.get("name", "").strip(), b.get("password", "")
    role = b.get("role", "agent")
    if not email or not name or len(pw) < 8 or role not in ("agent", "admin"):
        return jsonify(error="Need email, name, role and a password of 8+ chars"), 400
    try:
        user = auth.create_user(email=email, password=pw, display_name=name)
    except auth.EmailAlreadyExistsError:
        return jsonify(error="Email already in use"), 409
    auth.set_custom_user_claims(user.uid, {"role": role})
    db.collection("users").document(user.uid).set(
        {"name": name, "email": email, "role": role, "active": True, "createdAt": now()})
    return jsonify(uid=user.uid), 201


@app.patch("/api/admin/users/<uid>")
@require_auth(admin=True)
def update_user(uid):
    b = request.get_json(silent=True) or {}
    if uid == g.user["uid"]:
        return jsonify(error="You can't change your own account here"), 400
    updates = {}
    if "active" in b:
        auth.update_user(uid, disabled=not b["active"])
        if not b["active"]:
            auth.revoke_refresh_tokens(uid)  # kicks them out immediately
        updates["active"] = bool(b["active"])
    if b.get("role") in ("agent", "admin"):
        auth.set_custom_user_claims(uid, {"role": b["role"]})
        updates["role"] = b["role"]
    if b.get("password") and len(b["password"]) >= 8:
        auth.update_user(uid, password=b["password"])
    if updates:
        db.collection("users").document(uid).update(updates)
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(port=5000, debug=True)

from firebase_admin import auth, firestore

# ... (your existing routes) ...

@app.route('/api/agents', methods=['POST'])
def create_agent():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Cold Caller')

    try:
        # 1. Create the user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password
        )
        
        # 2. Add custom claims for role-based access
        auth.set_custom_user_claims(user.uid, {'role': role})

        # 3. Save the user profile to Firestore
        db = firestore.client()
        db.collection('users').document(user.uid).set({
            'email': email,
            'role': role,
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({"message": "Agent created successfully", "uid": user.uid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400