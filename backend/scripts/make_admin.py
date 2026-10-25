"""Usage: python scripts/make_admin.py you@company.com  (run from backend/)
Create the user in the Firebase console first."""
import sys, os, firebase_admin
from firebase_admin import credentials, auth, firestore
from dotenv import load_dotenv

load_dotenv()
firebase_admin.initialize_app(credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"]))
u = auth.get_user_by_email(sys.argv[1])
auth.set_custom_user_claims(u.uid, {"role": "admin"})
firestore.client().collection("users").document(u.uid).set(
    {"name": u.display_name or "Admin", "email": u.email, "role": "admin", "active": True})
print("Admin set for", u.email)
