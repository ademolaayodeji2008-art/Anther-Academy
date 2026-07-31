# Anther Academy - Setup Instructions

## 📋 Initial Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd client
npm install
cd ..
```

**Backend:**
```bash
cd server
npm install
cd ..
```

This may take a few minutes. The installations will pull all required packages.

### 2. Configure Environment Variables

**Server Setup:**

1. Copy the example file:
```bash
copy server\.env.example server\.env
```

2. Edit `server/.env` and replace the placeholders with your actual credentials:
   - Get `SUPABASE_URL` and `SUPABASE_KEY` from [Supabase Dashboard](https://supabase.com)
   - Get `PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` from [Paystack Dashboard](https://paystack.com)
   - Get `CLOUDINARY_*` credentials from [Cloudinary Dashboard](https://cloudinary.com)
   - Generate a Gmail app password from [Google Account Security](https://myaccount.google.com/apppasswords)
   - Generate a strong random string for `JWT_SECRET` (use `openssl rand -base64 32` or similar)

**Client Setup:**

1. Copy the example file:
```bash
copy client\.env.example client\.env
```

2. Edit `client/.env` and update:
   - `VITE_SUPABASE_URL` to match your server
   - `VITE_SUPABASE_ANON_KEY` to match your server
   - `VITE_CLOUDINARY_CLOUD_NAME` to your Cloudinary name
   - `VITE_PAYSTACK_PUBLIC_KEY` to your Paystack public key

### 3. Start Development Servers

**Option A: Two Terminal Windows (Recommended)**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

**Option B: Single Command (PowerShell)**
```powershell
cd server; Start-Process npm -ArgumentList "run dev"; cd ../client; npm run dev
```

### 4. Verify Setup

**Check Backend:**
```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{
  "status": "ok",
  "message": "Anther Academy API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

**Open Frontend:**
Visit `http://localhost:5173` in your browser. You should see the Anther Academy landing page with:
- Navy and gold design system
- Four feature cards (Courses, Certifications, Payments, Excellence)
- Call-to-action section
- Professional footer

## 🔑 Getting Your Credentials

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy `Project URL` and `anon public key`

### Paystack Setup
1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your Public and Secret keys

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### Gmail SMTP Setup
1. Enable 2-Step Verification on your Google Account
2. Generate App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use your email and the generated app password

## 🎨 Design System Showcase

The application includes:

**Colors:**
- Navy (#2c5aa0) - Professional, trustworthy
- Gold (#ffd700) - Prestige, excellence
- Forest Green (#2d6a5c) - Growth, stability
- Slate grays - Clean typography

**Components Already Styled:**
- `.btn-primary` - Navy buttons
- `.btn-secondary` - Gold buttons
- `.btn-outline` - Outline buttons
- `.card` - Card containers
- `.input-field` - Form inputs
- `.section-title` - Headings
- `.section-subtitle` - Subheadings

View the example in `client/src/App.jsx` for usage.

## 📁 File Structure Reference

```
anther-academy/
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main component with design examples
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind + custom components
│   ├── index.html            # HTML entry
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Design system (colors, fonts)
│   └── package.json          # Dependencies
│
├── server/
│   ├── src/
│   │   └── index.js          # Express server with health check
│   ├── .env.example          # Environment template
│   └── package.json          # Dependencies
│
├── README.md                 # Full documentation
└── SETUP.md                  # This file
```

## 🚢 Deploying to Production (Free Tier)

Repo already has the config files for this — `client/vercel.json` and `server/render.yaml`. You still need to do the account/connection steps yourself in each dashboard (they require your login, not something that can be scripted from here).

### 1. Backend — Render

1. Sign up at [render.com](https://render.com) and connect your GitHub account.
2. New → Web Service → select the `Anther-Academy` repo. Render will detect `server/render.yaml` automatically (Blueprint).
3. When prompted, fill in the env vars marked "secret" (these are **not** in the repo — copy the real values from your local `server/.env`): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `CLOUDINARY_*`, `GMAIL_SMTP_*`, `ADMIN_EMAIL`.
4. Leave `CLIENT_URL` blank for now — you'll set it after step 2 gives you the Vercel URL.
5. Deploy. Note the resulting URL, e.g. `https://anther-academy-api.onrender.com`.
6. **Free tier note:** this service spins down after ~15 min idle and takes 30-50s to wake on the next request — same kind of pause you saw with Supabase. No fix on the free tier besides upgrading or pinging it periodically.

### 2. Frontend — Vercel

1. Sign up at [vercel.com](https://vercel.com) and connect GitHub.
2. Add New → Project → select the `Anther-Academy` repo.
3. Set **Root Directory** to `client` (important — this is a two-app repo).
4. Framework preset should auto-detect "Vite". Build command `npm run build`, output dir `dist`.
5. Add env vars from `client/.env.example`, pointing at your real values — critically `VITE_API_BASE_URL` = the Render URL from step 1 (e.g. `https://anther-academy-api.onrender.com`).
6. Deploy. Note the resulting URL, e.g. `https://anther-academy.vercel.app`.

### 3. Wire them together

Go back to the Render dashboard → your service → Environment → set `CLIENT_URL` to the Vercel URL from step 2 (no trailing slash). Render will redeploy automatically. This is what makes CORS accept requests from your live frontend.

### 4. Database

Supabase stays as-is — no redeploy needed there. Just keep an eye on it pausing from inactivity on the free tier (log in and hit "Restore" if an API call ever fails with a DB connection error).

## 🐛 Troubleshooting

**"npm command not found"**
- Install Node.js from [nodejs.org](https://nodejs.org) (includes npm)

**Port 5000 or 5173 already in use**
- Change `PORT=5000` in `server/.env`
- Change port in `client/vite.config.js`

**Backend health check returns error**
- Check that `server/.env` exists and has `NODE_ENV=development`
- Ensure port 5000 is not blocked by firewall

**Frontend won't load**
- Clear browser cache (Ctrl+Shift+Delete)
- Check that `VITE_API_BASE_URL=http://localhost:5000` in `client/.env`

**"Cannot find module" errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## ✅ What's Included

✅ Professional folder structure
✅ React + Vite frontend setup
✅ Express backend with health check
✅ Tailwind CSS with navy/gold design system
✅ Environment configuration templates
✅ Git ignore for secrets
✅ ESLint configuration for code quality
✅ Ready-to-use UI components
✅ CORS configured for local development
✅ Detailed documentation

## ❌ Not Included (Next Steps)

These features are ready to be built:
- Database schema and migrations
- User authentication (sign up, login, OTP)
- Course management and enrollment
- Payment processing flow
- Certificate generation
- Email notifications
- Admin dashboard
- Video/PDF streaming
- Analytics and reporting

## 🚀 Ready to Code!

Your skeleton is set up and ready. Next steps:
1. Follow setup instructions above
2. Verify both servers start correctly
3. Begin building features from the list above
4. Check the main README.md for tech stack details

Happy coding! 🎓
