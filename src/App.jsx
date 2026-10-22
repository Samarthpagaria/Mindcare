// src/App.jsx
import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Import initialized Firebase instances
import { auth, db } from "./firebase";

// Components
import Forum from "./Forum";
import AppointmentScheduler from "./components/AppointmentScheduler";
import MeetingInterface from "./components/MeetingInterface";

import HeaderAuth from "./components/common/HeaderAuth"; // Corrected import path
import { Header } from "./components/Header";
import { ChatBot } from "./components/ChatBot";
import { RelaxationHub } from "./components/RelaxationHub";
import { PeerConnect } from "./components/PeerConnect";
import { CounselorSearch } from "./components/CounselorSearch";
import { Appointments } from "./components/Appointments";
import LoginPage from "./components/auth/Login";
import UserSignupPage from "./components/auth/UserSignup";
import DoctorRegisterPage from "./components/auth/DoctorRegister";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import UserDashboard from "./components/dashboard/UserDashboard";
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import PendingVerification from "./components/dashboard/PendingVerification";
import Spinner from "./components/common/Spinner";
import { HomePage } from "./components/HomePage";
import PHQ9Assessment from "./components/phq_assessments/Phq_assesments.jsx";
import GAD7Assessment from "./components/Gad_Assessment/Gad_assessment.jsx";
import GHQ12Assessment from "./components/Ghq_assessment/Ghq_assessment.jsx";

import "./index.css";
import CollegeAdmin from "./components/collegeAdmin/CollegeAdmin.jsx";

// Context for Firebase and Auth
export const FirebaseContext = createContext(null);

const API_URL = "/api/auth";

// Auth Provider to manage user state
const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setAuthUser(user);
        try {
          const token = await user.getIdToken();
          const response = await axios.get(`${API_URL}/user-data`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(response.data);
        } catch (error) {
          console.error("Failed to fetch user data", error);
          await signOut(auth);
          setUserData(null);
        }
      } else {
        setAuthUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const contextValue = { auth, db, authUser, userData, loading, logout };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Main App Component
function AppContent() {
  const { authUser, userData, loading, logout } =
    React.useContext(FirebaseContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-300">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={window.location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full pt-16"
        >
          <Routes>
            {/* Public and logged-in routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatBot />} />
            <Route path="/relaxation" element={<RelaxationHub />} />
            <Route path="/peer" element={<PeerConnect />} />
            <Route path="/counselors" element={<CounselorSearch />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/schedule" element={<AppointmentScheduler />} />
            <Route
              path="/meeting/:appointmentId"
              element={<MeetingInterface />}
            />
            <Route path="/phq-9-assessment" element={<PHQ9Assessment />} />
            <Route path="/gad-7-assessment" element={<GAD7Assessment />} />
            <Route path="/ghq-12-assessment" element={<GHQ12Assessment />} />
            <Route path="/college-admin" element={<CollegeAdmin />} />
            {/* Authentication Routes */}
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <UserSignupPage /> : <Navigate to="/" />}
            />
            <Route
              path="/doctor-register"
              element={!authUser ? <DoctorRegisterPage /> : <Navigate to="/" />}
            />

            {/* Dashboard Routes based on role */}
            <Route
              path="/dashboard"
              element={
                authUser && userData ? (
                  <>
                    {userData.role === "admin" && <AdminDashboard />}
                    {userData.role === "user" && (
                      <UserDashboard userData={userData} />
                    )}
                    {userData.role === "doctor" && userData.isVerified && (
                      <DoctorDashboard userData={userData} />
                    )}
                    {userData.role === "doctor" && !userData.isVerified && (
                      <PendingVerification />
                    )}
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Redirect any unmatched routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
