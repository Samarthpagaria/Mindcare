const admin = require('firebase-admin');

// Middleware to check if the user is authenticated via Firebase token
const checkAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Unauthorized: No token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Add user info (like UID) to the request object
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ message: 'Unauthorized: Invalid token.' });
    }
};

// Middleware to check if the authenticated user is an admin
const isAdmin = async (req, res, next) => {
    const uid = req.user.uid;
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            next(); // User is an admin, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: Requires admin privileges.' });
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ message: 'Error checking admin status.' });
    }
};

module.exports = { checkAuth, isAdmin };

