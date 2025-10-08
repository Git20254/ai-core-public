# 🎶 Music Streaming Platform – Backend (NestJS + Prisma + Stripe)

This is the **backend service** for the Indie-first Music Streaming Platform.  
It powers **track storage, streaming, subscriptions, payouts, profiles, and recommendations**.

---

## 🚀 Features
- 🎵 **Track Management** – Upload, stream, log playback (Prisma + PostgreSQL)  
- 👤 **User Accounts** – Register/login with role-based access (**Artist**, **Fan**)  
- 🔐 **Authentication** – Secure JWT auth with guards + **strong password validation**  
- 🖼️ **Profiles** – Upload avatar (Cloudinary) + bio  
- 💳 **Stripe Integration** – Checkout Sessions, Subscriptions, Webhooks  
- 💵 **Payout Calculation** – Artist earnings (2× Spotify rate)  
- 🤖 **AI Recommendations** – Powered by Python engine  

---

## 📂 Project Structure
backend/
│── src/
│ ├── auth/ # JWT-based authentication
│ ├── payments/ # Stripe checkout + subscriptions
│ ├── users/ # User accounts + subscription + profile stats
│ ├── profile/ # User profiles (avatar, bio)
│ ├── webhooks/ # Stripe webhook listener
│ ├── tracks/ # Track CRUD + streaming
│ ├── streams/ # Stream logs
│ ├── prisma.service.ts # Prisma DB service
│ └── app.module.ts # Root NestJS module
│── prisma/
│ ├── schema.prisma # Prisma schema (User, Track, Stream, StripeEvent)
│ └── migrations/ # Database migrations
│── .env # Environment variables
│── package.json
│── README.md

yaml
Copy code

---

## ⚙️ Environment Variables (`.env`)
```env
# PostgreSQL
DATABASE_URL="postgresql://mainframe@localhost:5432/musicdb?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_here

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxx_your_key_here

# Stripe Webhook Secret (from `stripe listen`)
STRIPE_WEBHOOK_SECRET=whsec_xxx_from_stripe_listen
🛠️ Development Workflow
Setup database

bash
Copy code
psql -h localhost -U mainframe -d musicdb
npx prisma migrate dev
Start backend

bash
Copy code
cd backend
npm install
npm run start:dev
Stripe CLI (listen for webhooks)

bash
Copy code
stripe listen --forward-to localhost:3000/webhooks/stripe
Authentication

👉 Register (FAN or ARTIST)

bash
Copy code
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"fan1@example.com","password":"FanPass123","role":"FAN"}'

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"artist1@example.com","password":"ArtistPro456","role":"ARTIST"}'
👉 Login

bash
Copy code
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fan1@example.com","password":"FanPass123"}'
User Profile

👉 Upload Avatar

bash
Copy code
curl -X POST http://localhost:3000/profile/avatar \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "file=@/path/to/avatar.png"
👉 Get Profile

bash
Copy code
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
👉 Extended users/me

bash
Copy code
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
Returns:

json
Copy code
{
  "userId": 3,
  "email": "artist1@example.com",
  "role": "ARTIST",
  "subscriptionActive": false,
  "profile": {
    "bio": null,
    "avatarUrl": "https://res.cloudinary.com/.../avatar.png"
  },
  "listeningStats": {
    "totalStreams": 50,
    "recentStreams": [...]
  },
  "artistStats": {
    "trackCount": 10,
    "totalPayout": 200.50
  }
}
Stripe Checkout (Subscription)

bash
Copy code
curl -X POST http://localhost:3000/payments/checkout \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json"
📜 Project Log
v1.1.0 (Oct 3, 2025)
✅ Strong password validation (letters + numbers, min 8 chars)
✅ Role-based user registration (FAN / ARTIST)
✅ Profile service (GET /profile, POST /profile/avatar)
✅ Extended users/me → includes profile + listening stats + artist stats
✅ Bugfix: JWT payload correctly maps sub to userId

v1.0.0 (Oct 1, 2025)
✅ Integrated Stripe Checkout (subscription mode)
✅ Added Stripe Webhooks (checkout.session.completed, subscription.deleted)
✅ Prisma migrations: add_password_and_role_to_user, add_subscription_flag, add_stripe_events
✅ User model updated with subscriptionActive flag
✅ End-to-end working login → checkout → webhook → DB subscription update
✅ Tagged release: v1.0.0

yaml
Copy code

---

### Next Steps
1. Open & paste with:
```bash
nano README.md
