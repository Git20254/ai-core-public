# 📜 Changelog
   
All notable changes to this project will be documented here.  
This project follows [Keep a Changelog](https://keepachangelog.com/) and uses [Semantic Versioning](https://semver.org/).

---

## [1.2.0] - 2025-10-03
### Added
- 👤 **Profile Module**:
  - New `Profile` model with relation to `User`
  - Added `ProfilesController` + `ProfilesService`
  - Endpoints to **create, fetch, and update** user profiles (fans + artists)
- 🔐 **Role-based registration**:
  - Registration now requires role: `FAN` or `ARTIST`
  - Enforced stronger password validation (min 8 chars, must include letters + numbers)
- 📝 Expanded **README.md**:
  - Updated with registration + login curl examples
  - Documented profiles, role-based auth, and password rules

### Changed
- 🔧 Refined authentication flow:
  - JWT payload now includes `role`
  - Improved validation error messages for register/login
- 🔄 Updated Prisma schema:
  - Fixed `Profile` relation with `User`
  - Synced DB with migrations

### Notes
- Future: extend profiles for **artist bios, fan preferences, and uploads**
- Role-based system is now in place → will expand for IndieStream artist tools

---

## [1.1.0] - 2025-10-03
### Added
- 🌩️ Integrated **Cloudinary upload support**:
  - New `/upload` endpoint with `UploadController`
  - Configured **Cloudinary provider** with `.env` keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
  - Supports image uploads (e.g. album art) with automatic URL return
- 📖 Updated **README.md**:
  - Added example `curl` command for uploading files
  - Documented Cloudinary integration and usage

### Changed
- 🔧 Updated Prisma schema for `Profile` model:
  - Added proper relation with `User`
  - Fixed migration issue with `id` primary key
- 📝 Synced backend with database migrations

### Notes
- Uploads are stored in Cloudinary under `solares/uploads` folder  
- Future: will extend `/upload` to handle audio files (MP3, WAV) for artist track submissions

---

## [1.0.0] - 2025-10-01
### Added
- 💳 Integrated **Stripe Checkout** for subscriptions (PaymentsModule + PaymentsService)
- 🔔 Implemented **Stripe Webhooks** (`/webhooks/stripe`) for handling subscription events
- 🗄️ Added **Prisma migrations**:
  - `add_password_and_role_to_user`
  - `fix_user_stream_relation`
  - `add_stripe_events`
  - `add_subscription_flag`
- 👤 Extended `User` model with `subscriptionActive` flag
- 🔐 JWT authentication fully working (login + register endpoints)
- 📘 Updated **README.md** to document Stripe integration, Prisma, and dev setup  

### Changed
- 🔧 Improved backend project structure with new modules (`auth/`, `payments/`, `webhooks/`)
- 📝 Synced backend + DB changes to GitHub with tag `v1.0.0`

### Notes
- Current backend subscription flow:  
  1. User registers or logs in (`/auth/register` or `/auth/login`)  
  2. User calls `/payments/checkout` → Stripe subscription session created  
  3. Webhook updates DB → activates subscription (`subscriptionActive = true`)  

---

## [0.2.0] - 2025-10-01
### Added
- 💳 Stripe **Checkout + Subscriptions** integrated in backend  
- 🔄 Webhooks for subscription activation + cancellation  
- 🗄️ Prisma migrations: add password, role, Stripe events, subscription flag  
- 🔐 Full **JWT Authentication** with login + register endpoints  
- 📖 Root `README.md` with full-stack setup instructions  

---

## [0.1.0] - 2025-09-30
### Added
- 🎵 Working **MusicPlayer** with cover art + audio playback
- 🖼️ Local asset artwork (`me-against-world.jpg`) displayed in player
- 📱 Playlist view in mobile app (`App.js`) with artist + title 
- 📂 Backend endpoint `/tracks` with artist and artwork data

### Changed
- 📝 Cleaned up `README.md` for **backend** and **mobile-app**
- 🔧 Database updated with sample track (`me-against-world`)

---

## [0.0.1] - 2025-09-28
### Added
- 🎶 Initial backend setup with **NestJS + Prisma + PostgreSQL**
- 📱 Initial mobile app scaffold with Expo / React Native
- 🖥️ Project structure: backend, mobile-app, frontend-web

