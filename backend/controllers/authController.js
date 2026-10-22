const admin = require('firebase-admin');

// This function assumes Firebase has been initialized in server.js
const db = () => admin.firestore();
const auth = () => admin.auth();

// Controller for regular user signup
const registerUser = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const userRecord = await auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        // After creating the user in Auth, create their profile in Firestore
        await db().collection('users').doc(userRecord.uid).set({
            firstName,
            lastName,
            email,
            role: 'user', // Set role to 'user' for regular signups
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'User registered successfully! You can now log in.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: `Error registering user: ${error.message}` });
    }
};

// Controller for doctor registration
const registerDoctor = async (req, res) => {
    const { email, password, firstName, lastName, specialization, licenseNumber } = req.body;

    if (!email || !password || !firstName || !lastName || !specialization || !licenseNumber) {
        return res.status(400).json({ message: 'All fields are required for doctor registration.' });
    }

    try {
        const userRecord = await auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });

        // Create doctor profile in Firestore with verification pending
        await db().collection('users').doc(userRecord.uid).set({
            firstName,
            lastName,
            email,
            specialization,
            licenseNumber,
            role: 'doctor', // Set role to 'doctor'
            isVerified: false, // Set verification status to false
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ message: 'Doctor registration successful! Your application is under review.' });
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).json({ message: `Error registering doctor: ${error.message}` });
    }
};

// Controller for fetching user data after frontend login
const getUserData = async (req, res) => {
    try {
        // The user's UID is attached from the checkAuth middleware
        const userDoc = await db().collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found in database.' });
        }
        res.status(200).json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Could not fetch user data.' });
    }
};


// --- Admin Controllers ---

// Fetch all doctors whose isVerified status is false
const getUnverifiedDoctors = async (req, res) => {
    try {
        const snapshot = await db().collection('users')
            .where('role', '==', 'doctor')
            .where('isVerified', '==', false)
            .get();
            
        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching unverified doctors:', error);
        res.status(500).json({ message: 'Failed to fetch doctors.' });
    }
};

// Verify a doctor by setting their isVerified status to true
const verifyDoctor = async (req, res) => {
    const { doctorId } = req.body;
    if (!doctorId) {
        return res.status(400).json({ message: 'Doctor ID is required.' });
    }
    try {
        const doctorRef = db().collection('users').doc(doctorId);
        await doctorRef.update({ isVerified: true });
        res.status(200).json({ message: 'Doctor verified successfully.' });
    } catch (error) {
        console.error('Error verifying doctor:', error);
        res.status(500).json({ message: 'Failed to verify doctor.' });
    }
};


module.exports = {
    registerUser,
    registerDoctor,
    getUserData,
    getUnverifiedDoctors,
    verifyDoctor,
};
