<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="banner-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="banner-light.png">
    <img alt="Mainframe AI Core — Context-Aware Music Intelligence Engine" src="banner-light.png" width="100%">
  </picture>
</p>

# 🎧 Mainframe AI — Context-Aware Music Intelligence Engine

**Mainframe AI Core** is a prototype music intelligence backend that powers
location-based, context-driven music recommendations and trend prediction.

This public version demonstrates the API structure and design philosophy
behind the private Mainframe AI system.

---

## 🚀 Features
- **Hybrid Recommendation Engine** (content + context)
- **Geo-Aware Discovery** — find nearby tracks by city
- **TrendFlow™** — local trend scoring & decay scheduler
- **FastAPI + FAISS + NumPy** architecture
- **Artist Upload Endpoint** with context tagging

---

## 🧭 Example API Endpoints

| Endpoint | Description |
|-----------|--------------|
| `/embed/` | Upload and embed a new track |
| `/recommend/?mood=focus` | Get recommendations by context |
| `/discover/` | Discover local tracks near you |
| `/discover/ranked` | AI-ranked local tracks |
| `/discover/trending` | TrendFlow predictions |
| `/artist/upload` | Upload artist metadata |

---

## 🧠 Architecture Overview


---

## ⚙️ Tech Stack
- **FastAPI**
- **FAISS (Meta AI)**
- **NumPy / Pandas**
- **APScheduler**
- **GeoCoder**
- **Python 3.13**

---

## 🔒 Note
This repository is a **public showcase** of the AI Core API layer.
The proprietary engine, embeddings, and models are private.

📫 Contact: [mainframe@yourdomain.com](mailto:mainframe@yourdomain.com)
