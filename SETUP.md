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
