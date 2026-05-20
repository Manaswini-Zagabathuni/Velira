# Velira — Watch Over Your Loved Ones

Velira is a full-stack web app that connects elderly parents with their children for remote care.

## Features
-  Smart reminders (medicine, water, meals, walks)
-  One-tap love button (parent ↔ child)
-  Virtual garden that grows with daily task completion
-  Health tracking (steps, BP, blood sugar, heart rate)
-  AI health insights powered by Claude
-  SOS emergency button with GPS
-  Doctor appointment tracker
-  Medicine cabinet

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Firebase Firestore + Firebase Auth
- **AI**: Anthropic Claude API
- **Charts**: Recharts

## Setup

1. Clone and install:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in `.env.local` with your:
   - Firebase project credentials (from Firebase Console)
   - Anthropic API key (from console.anthropic.com)

4. Run development server:
```bash
npm run dev
```

## Project Structure
```
velira/
├── app/
│   ├── page.js              # Landing page
│   ├── auth/                # Login & signup
│   ├── parent/              # Parent dashboard & features
│   └── child/               # Child dashboard & features
├── components/
│   ├── parent/              # Parent-specific components
│   └── shared/              # Shared components (SOS, etc.)
└── lib/
    ├── firebase.js          # Firebase client
    ├── firebase-admin.js    # Firebase admin (server)
    ├── db.js                # Firestore helpers
    └── auth-context.js      # Auth provider
```

## How family pairing works
1. Parent signs up → gets a 6-character pair code
2. Child signs up → enters parent's pair code
3. Both are now connected in real-time!
