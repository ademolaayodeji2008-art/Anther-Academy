# Anther Academy - Getting Started Guide

Welcome! Your full-stack accounting training platform is ready to go. Follow these simple steps to get up and running in minutes.

## 🎯 Your 5-Minute Quick Start

### Step 1: Install Dependencies (2 minutes)

Open two PowerShell/Command Prompt windows:

**Window 1 - Backend:**
```powershell
cd server
npm install
```

**Window 2 - Frontend:**
```powershell
cd client
npm install
```

Both windows will show progress bars. Let them complete—it takes a couple minutes.

### Step 2: Configure Environment (1 minute)

**In Window 1 (server folder):**
```powershell
copy .env.example .env
```

**In Window 2 (client folder):**
```powershell
copy .env.example .env
```

For now, the defaults work locally. Actual credentials (Supabase, Paystack, etc.) can be added later.

### Step 3: Start Both Servers (1 minute)

**Window 1 - Start Backend:**
```powershell
npm run dev
```
You'll see:
```
╔════════════════════════════════════════╗
║   Anther Academy API Server Started    ║
╠════════════════════════════════════════╣
║ Environment: development               ║
║ Port: 5000                             ║
║ Health Check: /api/health              ║
╚════════════════════════════════════════╝
```

**Window 2 - Start Frontend:**
```powershell
npm run dev
```
You'll see:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open Your App (1 minute)

Open your browser and visit: **http://localhost:5173**

You should see a professional landing page with:
- Navy blue header with "Anther Academy" logo
- Four feature cards with icons
- Gold accent buttons
- Professional footer

🎉 **That's it! You're running locally!**

---

## 📁 What You Have

### Frontend (`/client`)
- **React 18** with Vite for instant hot reload
- **Tailwind CSS** with professional navy/gold design
- **Landing page** showing design system in action
- **Reusable components** ready to use in App.jsx

### Backend (`/server`)
- **Express.js** API running on port 5000
- **Health check** at `/api/health` (test with `curl http://localhost:5000/api/health`)
- **CORS enabled** for your frontend
- **Error handling** and middleware ready

### Configuration
- **17 backend environment variables** for integrations
- **5 frontend environment variables** for API & services
- **ESLint** for code quality
- **Git ready** with .gitignore for secrets

---

## 🎨 Design System Preview

### Colors You Can Use

In any `.jsx` file, use Tailwind classes:

```jsx
{/* Navy - Professional Primary */}
<button className="bg-navy-500 hover:bg-navy-600 text-white">
  Primary Button
</button>

{/* Gold - Prestige Accent */}
<div className="bg-gold-300 text-navy-900">
  Premium Feature
</div>

{/* Forest Green - Growth & Success */}
<span className="text-forest-400">✓ Success</span>

{/* Slate - Clean Text */}
<p className="text-slate-600">Secondary text</p>
```

### Pre-Built Components

```jsx
{/* Button Components */}
<button className="btn-primary">Primary CTA</button>
<button className="btn-secondary">Secondary CTA</button>
<button className="btn-outline">Cancel</button>

{/* Card Component */}
<div className="card p-6">
  <h3 className="section-title">Card Title</h3>
  <p className="section-subtitle">Subtitle text</p>
</div>

{/* Form Components */}
<input className="input-field" type="email" />
<textarea className="input-field"></textarea>
```

See `client/src/App.jsx` for a complete working example!

---

## 🔧 Common Tasks

### Add a New Page

1. Create file: `client/src/pages/Courses.jsx`
```jsx
export default function Courses() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="section-title">Our Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Course cards */}
      </div>
    </div>
  );
}
```

2. Add to routing in `App.jsx` (React Router is already installed)

### Add a Backend Route

1. Edit `server/src/index.js`:
```javascript
app.get('/api/courses', (req, res) => {
  res.json({ courses: [] });
});
```

2. Test: `curl http://localhost:5000/api/courses`

### Create an Environment Variable

1. Add to `server/.env`:
```
MY_VARIABLE=my-value
```

2. Use in code:
```javascript
const myVar = process.env.MY_VARIABLE;
```

---

## 🐛 Troubleshooting

### "Port 5000 already in use"
Change port in `server/.env`:
```
PORT=5001
```
Then restart: `npm run dev`

### "Port 5173 already in use"
Change port in `client/vite.config.js` line 7:
```javascript
port: 5174,
```
Then restart: `npm run dev`

### "npm not found"
Download Node.js: https://nodejs.org/
(Includes npm automatically)

### "Module not found" errors
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

### Frontend shows "Cannot find module" errors
1. Make sure backend is running on port 5000
2. Check `VITE_API_BASE_URL=http://localhost:5000` in `client/.env`
3. Clear browser cache: Ctrl+Shift+Delete

### Backend won't start
1. Check port 5000 isn't blocked by firewall
2. Verify `server/.env` has `NODE_ENV=development`
3. Check for syntax errors in `server/src/index.js`

---

## 📚 Next Steps

### Phase 1: Setup (You are here ✓)
- [x] Project created
- [x] Servers running locally
- [x] Design system in place

### Phase 2: Database (Next)
Create Supabase account and add your credentials to `.env` files

### Phase 3: Authentication
Build signup, login, and OTP verification system

### Phase 4: Courses
Create course listing, enrollment, and progress tracking

### Phase 5: Payments
Integrate Paystack for course purchases

### Phase 6: Notifications
Set up email reminders and receipts with Gmail

### Phase 7: Polish
Admin dashboard, certificates, analytics

---

## 📖 Documentation

Read these for detailed information:

1. **README.md** - Complete project documentation
   - Tech stack details
   - Deployment instructions
   - Full setup guide

2. **SETUP.md** - Step-by-step setup with credential guides
   - How to get Supabase keys
   - How to get Paystack keys
   - How to get Cloudinary credentials
   - Complete troubleshooting

3. **DESIGN_SYSTEM.md** - Design reference
   - Color palette with hex codes
   - Component documentation
   - Typography guidelines
   - Usage examples

4. **PROJECT_SUMMARY.md** - What's included overview
   - File structure
   - Technology stack
   - Statistics

---

## 💬 Quick Reference

```bash
# Frontend Commands
cd client
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build locally
npm run lint      # Check code quality
npm run format    # Auto-format code

# Backend Commands
cd server
npm run dev       # Start dev server with auto-restart
npm start         # Start production server
npm run lint      # Check code quality

# Testing Routes
curl http://localhost:5000/              # API root info
curl http://localhost:5000/api/health    # Health check
```

---

## 🎨 Design System Cheat Sheet

### Quick Colors
```
Navy Blue: text-navy-500, bg-navy-500
Gold: text-gold-300, bg-gold-300
Green: text-forest-400, bg-forest-400
Gray: text-slate-600, bg-slate-100
```

### Quick Components
```
Primary Button: className="btn-primary"
Secondary Button: className="btn-secondary"
Card: className="card p-6"
Input: className="input-field"
```

### Quick Layouts
```
Max Width: className="max-w-7xl mx-auto px-6"
Grid: className="grid grid-cols-1 md:grid-cols-2 gap-8"
Section: className="py-12"
```

---

## ✨ Pro Tips

1. **Use VS Code** for best development experience
   - Install "Tailwind CSS IntelliSense" extension
   - Install "ES7+ React/Redux" extension
   - Install "REST Client" for testing API routes

2. **Keep hot reload active** while developing
   - Changes save instantly in browser
   - No need to refresh manually

3. **Use Tailwind classes** instead of CSS
   - No CSS file management needed
   - Changes are instant
   - Design system built-in

4. **Check terminal errors** if things break
   - Frontend errors in Terminal 2 (client)
   - Backend errors in Terminal 1 (server)

5. **Test API with curl or Postman**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 🚀 Ready? Let's Go!

```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2
cd client && npm install && npm run dev
```

Then open: **http://localhost:5173**

Happy coding! 🎓

---

**Questions?** Check README.md or SETUP.md
**Color questions?** Check DESIGN_SYSTEM.md
**What's included?** Check PROJECT_SUMMARY.md
