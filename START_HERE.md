# 🚀 Anther Academy - START HERE

Welcome to your full-stack accounting training platform! This file gets you running in minutes.

## ⚡ Quick Start (5 minutes)

### 1. Open TWO terminals in this folder

### Terminal 1 - Backend Setup
```powershell
cd server
npm install
npm run dev
```

Wait for output:
```
╔════════════════════════════════════════╗
║   Anther Academy API Server Started    ║
║ Environment: development               ║
║ Port: 5000                             ║
║ Health Check: /api/health              ║
╚════════════════════════════════════════╝
```

### Terminal 2 - Frontend Setup
```powershell
cd client
npm install
npm run dev
```

Wait for output:
```
VITE v5.0.0  ready in 123 ms
➜  Local:   http://localhost:5173/
```

### 3. Open Your Browser
Go to: **http://localhost:5173**

You should see a professional landing page with navy/gold design. ✅

---

## 📖 Full Documentation

- **GETTING_STARTED.md** - Beginner-friendly getting started guide
- **README.md** - Complete project documentation
- **SETUP.md** - Detailed setup with credential guides
- **DESIGN_SYSTEM.md** - Color palette and component reference
- **PROJECT_SUMMARY.md** - What's included overview

## 📁 Project Structure

```
anther-academy/
├── client/                 ← React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        (Landing page example)
│   │   ├── main.jsx       (Entry point)
│   │   └── index.css      (Tailwind styles)
│   └── package.json
├── server/                 ← Express.js backend
│   ├── src/
│   │   └── index.js       (API server)
│   └── package.json
└── Documentation files (*.md)
```

## 🎯 What Works Now

✅ Backend running on `http://localhost:5000`
✅ Frontend running on `http://localhost:5173`
✅ Health check: `curl http://localhost:5000/api/health`
✅ Professional navy/gold design system
✅ 7 pre-built Tailwind components
✅ CORS enabled for local development
✅ Hot reload enabled for both frontend and backend

## 🎨 Design System At a Glance

### Colors Ready to Use
```javascript
// Navy (Professional Blue)
className="text-navy-500"      // Headings, primary actions
className="bg-navy-500"        // Primary buttons

// Gold (Prestige Accent)
className="text-gold-300"      // Highlights
className="bg-gold-300"        // Accent buttons

// Forest Green (Growth)
className="text-forest-400"    // Success states
className="bg-forest-400"      // Alternative accent

// Slate (Professional Grays)
className="text-slate-600"     // Secondary text
className="bg-slate-50"        // Light backgrounds
```

### Components Ready to Use
```jsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<button className="btn-outline">Cancel</button>

<div className="card p-6">Card Component</div>

<input className="input-field" type="email" />

<h1 className="section-title">Section Title</h1>
<p className="section-subtitle">Section Subtitle</p>
```

See `client/src/App.jsx` for live examples!

## 🔧 Environment Variables

Both `.env` files are already created with placeholders. Update later with real credentials:

**Backend** (`server/.env`): 17 variables for Supabase, Paystack, Cloudinary, Gmail
**Frontend** (`client/.env`): 5 variables for APIs

## 🚀 Common Next Steps

1. **Add a new page**
   - Create file: `client/src/pages/Courses.jsx`
   - Use design system classes from tailwind.config.js

2. **Add a new API route**
   - Edit: `server/src/index.js`
   - Test with: `curl http://localhost:5000/api/route`

3. **Update colors**
   - Edit: `client/tailwind.config.js` colors section
   - See DESIGN_SYSTEM.md for hex codes

4. **Add third-party services**
   - Get credentials from Supabase, Paystack, Cloudinary, Gmail
   - Add to `server/.env` and `client/.env`
   - See SETUP.md for detailed instructions

## 💡 Pro Tips

1. **Vite Hot Reload**: Changes appear instantly—no refresh needed
2. **Tailwind IntelliSense**: Install VS Code extension for autocomplete
3. **API Testing**: Use `curl` or Postman to test backend routes
4. **Design Consistency**: Always use the color/component classes, never hardcode colors

## ❓ Troubleshooting

**"Port already in use"**: Change PORT in `.env` files
**"npm not found"**: Install Node.js from nodejs.org
**"Module errors"**: Delete `node_modules` and run `npm install` again
**"Frontend won't load"**: Check `VITE_API_BASE_URL=http://localhost:5000`

See SETUP.md for detailed troubleshooting.

## 📊 Tech Stack

- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3
- **Backend**: Express 4 + Node.js
- **Database**: Supabase (PostgreSQL)
- **Payments**: Paystack
- **Files**: Cloudinary
- **Email**: Nodemailer (Gmail SMTP)

## 🎓 What's Built

- ✅ Professional folder structure
- ✅ Design system (navy/gold/green)
- ✅ Landing page example
- ✅ 7 reusable components
- ✅ Development servers
- ✅ CORS configuration
- ✅ Error handling
- ✅ ESLint setup

## 📋 Next Steps to Build

- [ ] Set up Supabase database
- [ ] Create authentication system
- [ ] Build course management
- [ ] Add payment processing
- [ ] Create email notifications
- [ ] Build admin dashboard
- [ ] Set up analytics

---

## 🎯 Your Development Workflow

Every session:
1. Terminal 1: `cd server && npm run dev`
2. Terminal 2: `cd client && npm run dev`
3. Browser: http://localhost:5173
4. Code changes appear instantly (hot reload)

---

## 📚 Documentation Map

| File | Purpose |
|------|---------|
| START_HERE.md | You are here! |
| GETTING_STARTED.md | Beginner guide with examples |
| README.md | Complete project overview |
| SETUP.md | Credential setup guide |
| DESIGN_SYSTEM.md | Color & component reference |
| PROJECT_SUMMARY.md | What's included summary |

---

## ✨ Your App Features

**Display**: Professional navy/gold interface
**Responsive**: Mobile, tablet, desktop
**Components**: Buttons, cards, forms, grids
**Dev Experience**: Instant reload on changes
**Quality**: ESLint + code organization
**Ready for**: Authentication, courses, payments, email

---

## 🚀 You're Ready!

```bash
# Terminal 1
cd server && npm install && npm run dev

# Terminal 2  
cd client && npm install && npm run dev

# Then visit: http://localhost:5173
```

**That's it!** You now have a professional development environment ready for building your accounting training platform. 🎓

For questions, see the documentation files. Happy coding! 💻

---

*Next read: GETTING_STARTED.md for more detailed instructions*
