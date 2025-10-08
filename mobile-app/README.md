# 📱 Music Streaming Mobile App (Expo / React Native)

This is the **mobile app** for the Indie-first Music Streaming Platform.  
It allows fans to **browse tracks, view cover art, and play audio** using Expo + React Native.

---

## 🚀 Features
- 🎵 Playlist view (tracks fetched from backend API)
- 🖼️ Cover art support
- ▶️ / ⏸️ Audio playback with `expo-av`
- 👤 Artist info shown with track
- 🔄 Live data fetched from backend (`/tracks` endpoint)

---

## 📂 Project Structure
mobile-app/
│── App.js # Main entry, playlist + navigation
│── components/
│ └── MusicPlayer.js # Player UI + playback logic
│── assets/
│ └── me-against-world.jpg # Example cover art
│── package.json
│── README.md

---

## 🛠️ Development Workflow

### 1. Start backend (make sure DB is running)
```bash
cd ../backend
npm run start:dev
cd mobile-app
npx expo start
API Example

The mobile app fetches from the backend:

curl http://<YOUR_IP>:3000/tracks


Example response:

{
  "id": "me-against-world",
  "title": "Me Against the World",
  "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "artwork": "assets/me-against-world.jpg",
  "creator": { "name": "Tupac Shakur" }
}

✅ Summary

This mobile app connects to the backend to fetch tracks, show cover art, and play audio.
It is built with Expo / React Native and tested on iOS Simulator + physical devices.


---

### Next step:
1. Run:
   ```bash
   nano README.md
