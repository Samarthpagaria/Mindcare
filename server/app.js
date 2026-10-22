const dotenv = require('dotenv');
// Load environment variables FIRST, before any other requires
dotenv.config();

const express = require("express");
const cors = require("cors");
const admin = require('firebase-admin');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const peerRoutes = require('./routes/peerRoutes');
const counselorRoutes = require('./routes/counselorRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Firebase Admin SDK Initialization ---
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK Initialized Successfully.');
    }
  } catch (error) {
    console.error('Firebase Admin SDK Initialization Error:', error);
  }
} else {
  console.warn('Firebase Admin credentials not found in environment variables.');
}

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/peer', peerRoutes);
app.use('/api/counselors', counselorRoutes);

// Health check routes
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Mindcare API 🚀" });
});

app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "Mindcare API is running" });
});

// Run directly when in development or standalone server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
