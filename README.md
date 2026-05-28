# 🏸 Badminton Tracker - Court Champions

A premium Progressive Web App for tracking badminton matches with friends. Built with Next.js 15, Firebase, and modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-blue)

## ✨ Features

### 🎯 Core Features
- **Real-time Match Tracking**: Record singles and doubles matches instantly
- **Live Rankings**: Dynamic leaderboard based on wins, win rate, and streaks
- **Player Profiles**: Detailed stats for each player
- **Match History**: Timeline view with advanced filtering
- **Activity Feed**: Live updates on matches, streaks, and achievements

### 🔐 Authentication & Security
- **Google Sign-In**: Secure authentication via Firebase
- **Role-Based Access**: Admin and Member roles
- **Firestore Security Rules**: Production-ready data protection
- **Protected Routes**: Admin-only features

### 📱 Progressive Web App
- **Installable**: Add to home screen on any device
- **Offline Mode**: Browse cached data without internet
- **Service Worker**: Automatic caching and sync
- **App Icons**: Custom icons for all platforms
- **Splash Screens**: Native app experience

### 🎨 Premium UI/UX
- **Dark Theme**: Eye-friendly dark mode
- **Glassmorphism**: Modern card designs
- **Smooth Animations**: Subtle micro-interactions
- **Mobile-First**: Optimized for touch devices
- **Responsive**: Works on all screen sizes

### ⚡ Performance
- **Real-time Updates**: Firestore onSnapshot listeners
- **Optimized Queries**: Proper indexing
- **Code Splitting**: Lazy loading
- **Image Optimization**: Next.js Image component
- **Caching**: Service worker caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Google Cloud account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd badminton-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**

Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

## 📦 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Premium UI components

### Backend
- **Firebase Authentication**: Google Sign-In
- **Firestore**: Real-time database
- **Firebase Security Rules**: Data protection

### State Management
- **Zustand**: Lightweight state management
- **React Hooks**: Custom hooks for data fetching

### Forms & Validation
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### PWA
- **Service Worker**: Offline support
- **Web App Manifest**: Installation metadata
- **Workbox**: Caching strategies

## 🏗️ Project Structure

```
badminton-tracker/
├── app/                      # Next.js App Router
│   ├── add-match/           # Add match page
│   ├── history/             # Match history
│   ├── players/             # Players & profiles
│   ├── rankings/            # Rankings leaderboard
│   ├── offline/             # Offline fallback
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── auth/               # Authentication
│   ├── dashboard/          # Dashboard components
│   ├── players/            # Player components
│   ├── rankings/           # Ranking components
│   ├── history/            # History components
│   ├── activity/           # Activity feed
│   ├── theme/              # Theme provider
│   └── pwa/                # PWA components
├── lib/                     # Core utilities
│   ├── auth/               # Auth provider
│   ├── hooks/              # Custom hooks
│   ├── actions/            # Server actions
│   ├── store/              # Zustand stores
│   ├── utils/              # Utility functions
│   └── firebase.ts         # Firebase config
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # App icons
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Database indexes
└── vercel.json            # Deployment config
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Google Analytics (optional)

### 2. Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable Google provider
3. Add authorized domains

### 3. Create Firestore Database
1. Go to Firestore Database
2. Create database (start in test mode)
3. Choose location

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 6. Create First Admin
1. Sign in to the app
2. Go to Firestore Console
3. Find your user in `users` collection
4. Change `role` to `"admin"`

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import repository
- Add environment variables
- Deploy

3. **Configure Domain** (optional)
- Add custom domain in Vercel settings

### Manual Deployment
```bash
npm run build
vercel --prod
```

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'member';
  createdAt: Timestamp;
}
```

### Players Collection
```typescript
{
  id: string;
  name: string;
  wins: number;
  losses: number;
  streak: number;
  createdAt: Timestamp;
}
```

### Matches Collection
```typescript
{
  id: string;
  type: 'singles' | 'doubles';
  players: string[];
  score: {
    set1: { teamA: number; teamB: number };
    set2: { teamA: number; teamB: number };
    set3?: { teamA: number; teamB: number };
  };
  winner: string[];
  createdAt: Timestamp;
}
```

## 🎮 Usage

### For Admins
1. **Add Players**: Navigate to Players → Add Player
2. **Record Matches**: Add Match → Fill form → Save
3. **Manage Data**: Full read/write access

### For Members
1. **View Dashboard**: See live stats and recent matches
2. **Check Rankings**: View leaderboard
3. **Browse History**: Filter and search matches
4. **View Profiles**: See player statistics

## 🔒 Security

### Firestore Rules
- All users must be authenticated
- Only admins can write data
- Members have read-only access
- User roles stored in Firestore

### Best Practices
- Environment variables secured
- API keys in `.env.local`
- HTTPS enforced
- CORS configured
- Input validation

## 📈 Performance

### Optimization Techniques
- React.memo for components
- useMemo for calculations
- Firestore query optimization
- Image optimization
- Code splitting
- Service worker caching

### Target Metrics
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 🐛 Troubleshooting

### Common Issues

**Can't sign in**
- Check Firebase Authentication is enabled
- Verify authorized domains
- Check browser console

**Permission denied**
- Verify Firestore rules deployed
- Check user role in Firestore
- Ensure user is authenticated

**PWA not installing**
- Check manifest.json is accessible
- Verify service worker registered
- Test on HTTPS

## 📝 License

MIT License - feel free to use for your badminton group!

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📧 Support

For issues or questions:
- Check documentation
- Review Firebase Console logs
- Check browser console
- Review deployment logs

## 🎉 Acknowledgments

Built with:
- Next.js
- Firebase
- Tailwind CSS
- shadcn/ui
- Lucide Icons

---

**Made with ❤️ for badminton enthusiasts**

Start tracking your matches today! 🏸
