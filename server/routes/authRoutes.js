const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    registerDoctor, 
    getUserData,
    getUnverifiedDoctors, 
    verifyDoctor 
} = require('../controllers/authController');

const { checkAuth, isAdmin } = require('../middleware/authMiddleware');

// --- Public Routes ---
// POST /api/auth/register-user
router.post('/register-user', registerUser);

// POST /api/auth/register-doctor
router.post('/register-doctor', registerDoctor);

// --- Protected Routes ---
// GET /api/auth/user-data (gets data for the currently logged-in user)
router.get('/user-data', checkAuth, getUserData);


// --- Admin-Only Routes ---
// GET /api/auth/admin/unverified-doctors
router.get('/admin/unverified-doctors', checkAuth, isAdmin, getUnverifiedDoctors);

// POST /api/auth/admin/verify-doctor
router.post('/admin/verify-doctor', checkAuth, isAdmin, verifyDoctor);


module.exports = router;
