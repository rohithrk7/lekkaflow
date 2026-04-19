# LekkaFlow | Pro Retail Cloud Terminal

LekkaFlow is a high-fidelity, production-ready retail billing SaaS designed for Indian shopkeepers. It combines the simplicity of a mobile app with the power of an enterprise POS system.

## 🚀 Key Features
- **Cloud-Synced Billing**: Real-time synchronization with Firebase Firestore.
- **Smart Barcode Scanning**: Integrated camera scanner with global product database lookup.
- **WhatsApp Integration**: Instant billing sharing with customers via WhatsApp.
- **Business Analytics**: High-quality charts for sales tracking and inventory insights.
- **Historical Invoicing**: Generate and print professional PDFs of past transactions.
- **Enterprise Security**: Secure login/signup with individual store data isolation.

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Auth & Firestore)
- **Icons**: Lucide React
- **PDFs**: jsPDF + html2canvas
- **Scanner**: html5-qrcode

## 📦 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with your Firebase credentials.
4. Run locally: `npm run dev`
5. Access on your local network to use your phone as a scanner!

## 🌐 Deployment
Optimized for zero-config deployment on **Vercel**. Ensure you set the `NPM_CONFIG_LEGACY_PEER_DEPS=true` environment variable in the Vercel dashboard.

---
Made with ❤️ for Indian Retailers.
