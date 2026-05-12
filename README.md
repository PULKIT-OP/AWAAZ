# AWAAZ — Public Voice Platform

> *"Silence is not golden when injustice screams."*

A public complaint platform where anyone can file anonymous complaints against wrongdoers — harassment, fraud, corruption, police negligence, and more. Every complaint is permanent, public, and searchable.

---

## Project Structure

```
awaaz/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── complaints.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── assets/
    │   ├── css/
    │   │   └── main.css
    │   └── js/
    │       └── utils.js
    └── pages/
        ├── index.html          ← Home (all complaints, public)
        ├── complaint.html      ← Single complaint view
        ├── file-complaint.html ← File new complaint
        ├── my-complaints.html  ← User's own complaints
        └── admin.html          ← Admin panel
```

---

## Setup Instructions

### Step 1 — MongoDB Atlas (Free)

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a **free M0 cluster**
3. Go to **Database Access** → Add a new database user (username + password)
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all) for now
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<password>` in the string with your DB user's password

### Step 2 — Cloudinary (Free)

1. Go to [https://cloudinary.com](https://cloudinary.com) and sign up (free)
2. Go to your **Dashboard**
3. Copy: **Cloud Name**, **API Key**, **API Secret**

### Step 3 — Backend Setup

```bash
cd awaaz/backend

# Copy environment file
cp .env.example .env

# Edit .env with your values:
# - MONGODB_URI from Atlas
# - CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET from Cloudinary
# - JWT_SECRET = any long random string (e.g. run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - ADMIN_PASSWORD = a secret password only you know (for admin login)
# - FRONTEND_URL = your frontend URL

# Install dependencies
npm install

# Start the server
npm start

# For development (auto-restart on changes):
npm run dev
```

Server runs at: `http://localhost:3000`

### Step 4 — Frontend Setup

The frontend is pure HTML/CSS/JS — no build step needed.

**Option A — Simple local file server (for development):**
```bash
# Install live-server globally
npm install -g live-server

# From the frontend folder:
cd awaaz/frontend
live-server --port=5500
```

**Option B — VS Code:** Use the "Live Server" extension, right-click `index.html` → Open with Live Server.

**Option C — Python:**
```bash
cd awaaz/frontend
python3 -m http.server 5500
```

### Step 5 — Connect Frontend to Backend

Open `frontend/assets/js/utils.js` and update the `API_BASE` constant:

```js
// Development:
const API_BASE = 'http://localhost:3000/api';

// Production (after deploying backend):
const API_BASE = 'https://your-backend-url.com/api';
```

---

## Admin Setup

1. First, **create a normal account** via the frontend (pick any User ID + password)
2. Go to `/pages/admin.html`
3. Enter your User ID, password, and the `ADMIN_PASSWORD` from your `.env`
4. You'll be granted admin access — your account becomes an admin permanently

---

## Deployment

### Backend — Deploy to Render (Free)

1. Push your `backend/` folder to a GitHub repo
2. Go to [https://render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - Build command: `npm install`
   - Start command: `node server.js`
5. Add all environment variables from `.env` in the Render dashboard
6. Deploy — Render gives you a URL like `https://awaaz-api.onrender.com`

### Backend — Deploy to Railway

1. Go to [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add environment variables in the Railway dashboard
4. Railway auto-detects Node.js and deploys

### Frontend — Deploy to Netlify (Free, recommended)

1. Go to [https://netlify.com](https://netlify.com)
2. Drag and drop the entire `frontend/` folder
3. Netlify gives you a URL like `https://awaaz.netlify.app`
4. Update `API_BASE` in `utils.js` to your backend URL before deploying

### Frontend — Deploy to Vercel

```bash
cd awaaz/frontend
npx vercel
```

---

## Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/awaaz` |
| `JWT_SECRET` | Secret for signing JWT tokens | Any long random string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz...` |
| `ADMIN_PASSWORD` | Secret for admin login | `SuperSecret#2024` |
| `PORT` | Server port | `3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://awaaz.netlify.app` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/admin-login` | Admin login | No (needs admin secret) |

### Complaints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/complaints` | Get all complaints (filterable) | No |
| GET | `/api/complaints/:id` | Get single complaint | No |
| POST | `/api/complaints` | File new complaint | Yes |
| GET | `/api/complaints/user/my-complaints` | My complaints | Yes |
| POST | `/api/complaints/:id/request-resolution` | Request resolution | Yes (owner) |
| PATCH | `/api/complaints/:id/resolve` | Mark resolved | Admin only |
| PATCH | `/api/complaints/:id/reject-resolution` | Reject resolution req | Admin only |
| GET | `/api/complaints/admin/pending-resolutions` | Pending resolutions | Admin only |
| GET | `/api/complaints/public/stats` | Public statistics | No |

---

## Complaint Categories

- 🔴 Harassment
- 💸 Fraud
- ⚠️ Sexual Harassment
- 🏠 Domestic Violence
- 💻 Cybercrime
- 💰 Bribery / Corruption
- 👮 Police Negligence
- 🏗️ Land Dispute
- 🏦 Financial Fraud
- 💼 Workplace Abuse
- 🛡️ Child Abuse
- ⛓️ Human Trafficking
- 🏥 Medical Negligence
- 📋 Other

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 30 days
- File uploads are rate-limited (10 per hour per IP)
- Auth routes are rate-limited (20 per 15 min per IP)
- `filedBy` field is never returned in public API responses — full anonymity
- CORS is configured to only allow your frontend URL in production
- File size limit: 15MB per file, max 8 proof files per complaint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| File Storage | Cloudinary |
| Auth | JWT + bcrypt |
| File Upload | Multer (memory storage) |

---

*Built to give a voice to those who were silenced. Every complaint filed here is a record that cannot be erased.*
