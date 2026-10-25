# B2B Sales CRM (React + Flask + Firebase)

## 1. Firebase
1. Create a project; enable Authentication (Email/Password) and Firestore (production mode).
2. Deploy `firestore.rules` (denies all client access) and `firestore.indexes.json`
   (or click the index link Firestore prints on the first query).
3. Project settings > Service accounts > generate a key > save as `backend/serviceAccount.json`.
4. Project settings > General > Web app > copy the config values into `frontend/.env`.

## 2. Backend
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    python app.py                      # http://localhost:5000

Create your first admin: add a user in the Firebase console, then
    python scripts/make_admin.py you@company.com

## 3. Frontend
    cd frontend
    cp .env.example .env               # fill in Firebase values
    npm install
    npm run dev                        # http://localhost:5173

Sign in as the admin, open "Manage team" to create agent accounts.

## Production
Run the API with `gunicorn app:app`, set FRONTEND_ORIGIN to your real domain,
build the frontend with `npm run build`, and never commit .env or serviceAccount.json.
Role changes appear after the user's token refreshes (up to 1h); deactivation is immediate.
