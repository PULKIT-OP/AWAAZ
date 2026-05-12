# AWAAZ — Public Voice Platform

> _"Silence is not golden when injustice screams."_

A public complaint platform where anyone can file anonymous complaints against wrongdoers — harassment, fraud, corruption, police negligence, and more. Every complaint is permanent, public, and searchable.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Anonymous Complaints**: File complaints without revealing identity
- **Public Database**: All complaints are searchable and permanent
- **User Authentication**: Secure registration and login with JWT
- **Image Uploads**: Support for evidence/proof images via Cloudinary
- **Admin Panel**: Manage disputes and complaints
- **Dispute Resolution**: Users can file disputes for false complaints
- **Rate Limiting**: Prevent abuse with request rate limiting
- **Responsive Design**: Works on desktop and mobile

---

## 🛠 Tech Stack

**Backend:**

- Node.js + Express.js
- MongoDB (Atlas)
- JWT Authentication
- Cloudinary (Image Storage)
- Multer (File Uploads)
- BCrypt (Password Hashing)

**Frontend:**

- HTML5, CSS3, Vanilla JavaScript
- Responsive Design
- No build tools required

---

## 📁 Project Structure

```
awaaz/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary configuration
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   └── upload.js              # File upload middleware
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Complaint.js           # Complaint schema
│   │   ├── Dispute.js             # Dispute schema
│   │   └── ViewLog.js             # View tracking schema
│   ├── routes/
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── complaints.js          # Complaint endpoints
│   │   └── disputes.js            # Dispute endpoints
│   ├── server.js                  # Express server entry point
│   ├── package.json
│   └── .env.example               # Environment variables template
│
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css           # Main stylesheet
│   │   ├── js/
│   │   │   └── utils.js           # Utility functions
│   │   └── fonts/                 # Font files
│   └── pages/
│       ├── index.html             # Home (all complaints, public)
│       ├── complaint.html         # Single complaint view
│       ├── file-complaint.html    # File new complaint
│       ├── my-complaints.html     # User's own complaints
│       ├── about.html             # About page
│       └── admin.html             # Admin panel
│
├── README.md                      # This file
├── .gitignore                     # Git ignore rules
└── start.sh                       # Quick start script
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v14+ and npm
- MongoDB Atlas account (free)
- Cloudinary account (free)

### Step 1 — MongoDB Atlas Setup (Free)

1. Visit [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and sign in
3. Create a **free M0 cluster**
4. Go to **Database Access**
   - Click **Add New Database User**
   - Set username and password
   - Click **Add User**
5. Go to **Network Access**
   - Click **Add IP Address**
   - Add `0.0.0.0/0` (allow all IPs for development)
6. Click **Databases** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2 — Cloudinary Setup (Free)

1. Visit [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Go to your **Dashboard**
4. Copy these credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3 — Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Add these values:
MONGODB_URI=<your-mongodb-atlas-connection-string>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
JWT_SECRET=<generate-random-string>
ADMIN_PASSWORD=<your-secret-admin-password>
FRONTEND_URL=http://localhost:5500

# Generate a secure JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Install dependencies
npm install

# Start development server
npm run dev

# OR start production server
npm start
```

Server runs at: `http://localhost:3000`

### Step 4 — Frontend Setup

The frontend is pure HTML/CSS/JS with no build step required.

```bash
# Option A: Using live-server (recommended for development)
npm install -g live-server

cd frontend
live-server --port=5500

# Option B: Using Python's built-in server
cd frontend
python -m http.server 5500

# Option C: Using Node.js http-server
npm install -g http-server

cd frontend
http-server -p 5500
```

Access the frontend at: `http://localhost:5500`

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login
- `POST /api/auth/admin-login` — Admin login

### Complaints

- `GET /api/complaints` — Get all complaints (public)
- `GET /api/complaints/:id` — Get single complaint
- `POST /api/complaints` — File new complaint (auth required)
- `GET /api/complaints/user/:userId` — Get user's complaints
- `DELETE /api/complaints/:id` — Delete complaint (owner only)
- `POST /api/complaints/:id/views` — Track view

### Disputes

- `POST /api/disputes` — File dispute on complaint
- `GET /api/disputes` — Get all disputes (admin only)
- `PATCH /api/disputes/:id/resolve` — Resolve dispute (admin only)

---

## 💾 Database Schema

### User

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'user', 'admin'),
  createdAt: Date
}
```

### Complaint

```javascript
{
  title: String,
  description: String,
  category: String,
  targetName: String,
  images: [String] (Cloudinary URLs),
  anonymous: Boolean,
  views: Number,
  status: String (enum: 'active', 'disputed', 'resolved'),
  filed_by: ObjectId (User reference),
  createdAt: Date,
  updatedAt: Date
}
```

### Dispute

```javascript
{
  complaintId: ObjectId (Complaint reference),
  reason: String,
  evidence: [String] (Cloudinary URLs),
  status: String (enum: 'pending', 'approved', 'rejected'),
  filed_by: ObjectId (User reference),
  createdAt: Date,
  resolvedAt: Date
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the maintainers.

---

**Last Updated:** May 12, 2026

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
const API_BASE = "http://localhost:3000/api";

// Production (after deploying backend):
const API_BASE = "https://your-backend-url.com/api";
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

| Variable                | Description                     | Example                                             |
| ----------------------- | ------------------------------- | --------------------------------------------------- |
| `MONGODB_URI`           | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/awaaz` |
| `JWT_SECRET`            | Secret for signing JWT tokens   | Any long random string                              |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name      | `my-cloud`                                          |
| `CLOUDINARY_API_KEY`    | Cloudinary API key              | `123456789012345`                                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret           | `abc123xyz...`                                      |
| `ADMIN_PASSWORD`        | Secret for admin login          | `SuperSecret#2024`                                  |
| `PORT`                  | Server port                     | `3000`                                              |
| `FRONTEND_URL`          | Frontend URL for CORS           | `https://awaaz.netlify.app`                         |

---

## API Endpoints

### Auth

| Method | Endpoint                | Description      | Auth Required           |
| ------ | ----------------------- | ---------------- | ----------------------- |
| POST   | `/api/auth/register`    | Create account   | No                      |
| POST   | `/api/auth/login`       | Login            | No                      |
| GET    | `/api/auth/me`          | Get current user | Yes                     |
| POST   | `/api/auth/admin-login` | Admin login      | No (needs admin secret) |

### Complaints

| Method | Endpoint                                    | Description                     | Auth Required |
| ------ | ------------------------------------------- | ------------------------------- | ------------- |
| GET    | `/api/complaints`                           | Get all complaints (filterable) | No            |
| GET    | `/api/complaints/:id`                       | Get single complaint            | No            |
| POST   | `/api/complaints`                           | File new complaint              | Yes           |
| GET    | `/api/complaints/user/my-complaints`        | My complaints                   | Yes           |
| POST   | `/api/complaints/:id/request-resolution`    | Request resolution              | Yes (owner)   |
| PATCH  | `/api/complaints/:id/resolve`               | Mark resolved                   | Admin only    |
| PATCH  | `/api/complaints/:id/reject-resolution`     | Reject resolution req           | Admin only    |
| GET    | `/api/complaints/admin/pending-resolutions` | Pending resolutions             | Admin only    |
| GET    | `/api/complaints/public/stats`              | Public statistics               | No            |

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

| Layer        | Technology              |
| ------------ | ----------------------- |
| Frontend     | HTML5, CSS3, Vanilla JS |
| Backend      | Node.js + Express.js    |
| Database     | MongoDB + Mongoose      |
| File Storage | Cloudinary              |
| Auth         | JWT + bcrypt            |
| File Upload  | Multer (memory storage) |

---

_Built to give a voice to those who were silenced. Every complaint filed here is a record that cannot be erased._
