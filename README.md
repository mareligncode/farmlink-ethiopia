# 🌾 AgriConnect - Fully AI-Automated Agricultural Advisor & Trainer

AgriConnect is an advanced full-stack application serving as a comprehensive **AI agricultural advisor and trainer** for Ethiopian farmers. Rather than a traditional marketplace, this platform uses cutting-edge artificial intelligence to provide personalized farming advice, disease detection, market trends, and automated training to improve agricultural yield and practices. Features extensive **AI-powered capabilities** with bilingual support (English and Amharic).

## ✨ Core AI Features

### 🤖 Intelligent Farming Assistant
- 💬 **AI Chat Advisor** - Ask questions about crops, soil, and farming practices in English or Amharic
- � **AI Crop Disease Detector** - Identify crop diseases instantly via text, image, or voice input
- 🌦️ **AI Weather & Seasonal Advice** - Get highly accurate planting and harvesting recommendations tailored for Ethiopian seasons and regions
- � **AI Market Trends Analysis** - Receive data-driven insights on market conditions and optimal times to harvest

### 🎓 Automated Farmer Training
- � **Personalized Learning Paths** - AI-generated educational content customized to the farmer's specific crops and region
- �️ **Multimodal Inputs** - Connect with the AI via ElevenLabs voice-to-text, images, and text (in local languages)
- � **Progress Analytics Dashboard** - Track learning progress and farm improvement metrics

### General Features
- 🌐 **Bilingual Support** - Full English and Amharic (አማርኛ) language support for all AI interactions
- 🌙 **Dark/Light Theme** - Toggle between dark and light modes
- 📱 **Mobile Responsive** - Optimized for mobile devices, critical for in-field use
- 🔐 **Secure Authentication** - JWT-based auth with password reset workflows

---

## 🤖 AI Capability Breakdown

| Feature | Description | Languages |
|---------|-------------|-----------|
| **AI Farm Assistant** | General agricultural Q&A and advisory chatbot | EN / AM |
| **AI Disease Detector** | Identify diseases visually or via voice/text | EN / AM |
| **AI Weather Advisor** | Seasonal farming recommendations based on region | EN / AM |
| **AI Training Modules** | Auto-generated educational content for farmers | EN / AM |
| **AI Market Predictor** | Analyze market timing for maximum profit | EN / AM |

---

## 🔄 App Workflow

### Farmer Advisory Journey

```
FARMER JOURNEY
══════════════

1️⃣ REGISTRATION & ONBOARDING
   ┌────────────────────────────────────────────────────────┐
   │ • Enter farm details (location, climate, soil type)    │
   │ • Select primary crops and farming methods             │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
2️⃣ AI DASHBOARD (Home)
   ┌────────────────────────────────────────────────────────┐
   │ View quick insights: Upcoming weather alerts, pending  │
   │ training modules, crop health status                   │
   │                                                        │
   │ 🤖 AI ADVISOR AVAILABLE HERE:                          │
   │    • Voice-enabled Chat - Ask immediate field questions│
   │    • Daily AI Tips - Proactive farm management advice  │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
3️⃣ CROP HEALTH & DIAGNOSIS
   ┌────────────────────────────────────────────────────────┐
   │ Diagnose Issues → Upload Photo or Describe             │
   │ • AI analyzes the image for blights, pests, or disease │
   │ • Receive step-by-step treatment plans in Amharic/English│
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
4️⃣ MARKET & TIMING INSIGHTS
   ┌────────────────────────────────────────────────────────┐
   │ Market Trends → View AI predictions                    │
   │ • When to plant based on climate models                │
   │ • When to harvest for optimal pricing                  │
   └────────────────────────────────────────────────────────┘
                              │
                              ▼
5️⃣ FARMER TRAINING HUB
   ┌────────────────────────────────────────────────────────┐
   │ Education → Complete AI-generated modules              │
   │ • Sustainable farming practices                        │
   │ • Yield optimization techniques                        │
   │ • Track learning progress and implementation           │
   └────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **React Query** - Server state management
- **React Router v6** - Client-side routing
- **ElevenLabs React** - Voice-to-text for native language AI features
- **Recharts** - Data visualization for farm metrics

### Backend (AI & Data Pipeline)
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM (Farmer Profiles & History)
- **JWT** - Secure authentication

### Serverless AI Integrations (`/supabase`)
- **Edge Functions** - Serverless AI processing
- **Lovable AI Gateway** - Direct integration with Google Gemini for agricultural reasoning
- **ElevenLabs Scribe** - Voice-to-text transcription (Amharic/English)
- **Supabase Database** - PostgreSQL for realtime advisory data

