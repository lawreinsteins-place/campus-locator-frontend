# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Campus Locator - Frontend

Modern, real-time location sharing web application for university students. Built with React, Vite, and Leaflet.js.

## 🌐 Live Demo

**Live App:** https://campus-locator-frontend.vercel.app

## ✨ Features

- 🗺️ **Interactive Campus Map** - Explore campus with Leaflet.js maps
- 📍 **Real-Time Check-Ins** - See where friends are right now
- 👥 **Friend System** - Search, add, and manage friends
- 🔒 **Privacy Controls** - Public, Friends Only, or Invisible modes
- ⚡ **Live Updates** - Instant notifications via WebSocket
- 💬 **Status Messages** - Share what you're doing
- 📱 **Mobile Responsive** - Works on all devices
- 🎨 **Modern UI** - Clean gradients and smooth animations

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Maps:** Leaflet.js
- **Real-time:** Socket.io Client
- **HTTP Client:** Axios
- **Styling:** CSS with modern gradients
- **Deployment:** Vercel

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/campus-locator-frontend.git
cd campus-locator-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.production` file
```env
VITE_API_URL=https://campus-locator-backend.onrender.com/api
```

4. Start development server
```bash
npm run dev
```

App will run on http://localhost:5173

## 🚀 Build for Production
```bash
npm run build
```

Output will be in `dist/` directory.

## 📁 Project Structure
```
campus-locator-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── CampusMap.jsx       # Map component
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state
│   ├── pages/
│   │   ├── login.jsx           # Login page
│   │   ├── register.jsx        # Registration page
│   │   ├── Home.jsx            # Main map page
│   │   ├── friends.jsx         # Friends management
│   │   └── profile.jsx         # User profile
│   ├── services/
│   │   ├── api.js              # Axios instance
│   │   └── socket.js           # Socket.io client
│   ├── utils/
│   │   └── campusLocations.js  # Campus locations data
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── .env.production
├── package.json
└── vite.config.js
```

## 🎨 Features Overview

### 1. Authentication
- Secure JWT-based login and registration
- Protected routes for authenticated users
- Persistent sessions with localStorage

### 2. Interactive Map
- Real-time campus location markers
- Click location to check in
- Color-coded by category
- Zoom and pan controls

### 3. Check-In System
- Check in at any campus location
- Add status message (optional)
- Visible to friends based on privacy
- Check out when leaving

### 4. Friend Management
- Search users by name or email
- Send/receive friend requests
- Accept or decline requests
- Remove friends

### 5. Privacy Controls
- **Public:** Visible to everyone
- **Friends Only:** Only friends see you
- **Invisible:** Hidden from all users

### 6. Real-Time Updates
- Instant check-in notifications
- Live friend request alerts
- Status update broadcasts
- No page refresh needed

## 🌐 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## 🚀 Deployment

Deployed on **Vercel** with automatic deployments from GitHub.

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variable: `VITE_API_URL`
4. Deploy!

## 🎨 UI/UX Highlights

- Modern gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Inter font family
- Color-coded location categories
- Toast notifications
- Loading states
- Responsive design

## 📱 Campus Locations

Pre-configured locations include:
- Main Library
- Student Union Building
- Main Cafeteria
- Sports Complex
- Faculty of Science
- Faculty of Engineering
- Medical Center
- Computer Science Department
- Student Hostel
- Main Gate

*Coordinates based on University of Ibadan campus*

## 🐛 Known Issues

- Backend may take 30-60s to wake up (free tier)
- Socket connection may drop on poor network
- Location data resets on server restart

## 🔮 Future Enhancements

- [ ] Push notifications
- [ ] Chat messaging
- [ ] Group check-ins
- [ ] Location history
- [ ] Native mobile app
- [ ] Dark mode
- [ ] User avatars
- [ ] Location photos

## 🎯 Use Cases

- Find friends on campus
- Coordinate study groups
- Locate classmates before lectures
- Discover campus hotspots
- Plan meetups

## 👨‍💻 Author

**Olayinka Lawrence**

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built as part of SIWES (Students Industrial Work Experience Scheme)
- University of Ibadan, Computer Science Department
- Leaflet.js for maps
- React community for excellent tools