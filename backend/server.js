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
const PORT = 5000;

// --- Firebase Admin SDK Initialization ---
// This MUST happen before any routes are required or used.
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  // The rest of the service account details are often auto-filled by the SDK
  // but can be added here if needed from your service account JSON file.
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK Initialized Successfully.');
} catch (error) {
  console.error('Firebase Admin SDK Initialization Error:', error);
  process.exit(1); // Exit if Firebase can't be initialized
}
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/peer', peerRoutes);
app.use('/api/counselors', counselorRoutes);


// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend 🚀" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
