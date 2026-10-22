const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/counselors_data.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { counselors: [], appointments: [], inquiries: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading counselors data:', err);
    return { counselors: [], appointments: [], inquiries: [] };
  }
}

function writeData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing counselors data:', err);
    return false;
  }
}

// GET /api/counselors - Search and filter counselors
router.get('/', (req, res) => {
  try {
    const { search, specialty, location, sessionType, maxPrice } = req.query;
    const data = readData();
    let counselors = data.counselors || [];

    // Search query match
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      counselors = counselors.filter((c) => {
        const nameMatch = (c.name || '').toLowerCase().includes(q);
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const locMatch = (c.location || '').toLowerCase().includes(q);
        const specMatch = (c.specialties || []).some((s) => s.toLowerCase().includes(q));
        const langMatch = (c.languages || []).some((l) => l.toLowerCase().includes(q));
        return nameMatch || titleMatch || descMatch || locMatch || specMatch || langMatch;
      });
    }

    // Specialty filter
    if (specialty && specialty !== 'all') {
      const specQuery = specialty.toLowerCase().replace(/[-_]/g, ' ');
      counselors = counselors.filter((c) =>
        (c.specialties || []).some((s) => s.toLowerCase().includes(specQuery))
      );
    }

    // Location filter
    if (location && location !== 'all') {
      if (location === 'online') {
        counselors = counselors.filter((c) =>
          (c.sessionTypes || []).some((st) => st.toLowerCase().includes('video') || st.toLowerCase().includes('online'))
        );
      } else {
        const locQ = location.toLowerCase();
        counselors = counselors.filter(
          (c) =>
            (c.state && c.state.toLowerCase() === locQ) ||
            (c.location && c.location.toLowerCase().includes(locQ))
        );
      }
    }

    // Session Type filter
    if (sessionType && sessionType !== 'all') {
      counselors = counselors.filter((c) =>
        (c.sessionTypes || []).some((st) => st.toLowerCase().includes(sessionType.toLowerCase()))
      );
    }

    // Max Price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      const limit = Number(maxPrice);
      counselors = counselors.filter((c) => (c.priceNum || 0) <= limit);
    }

    res.json({
      success: true,
      count: counselors.length,
      counselors,
    });
  } catch (err) {
    console.error('Error fetching counselors:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving counselors' });
  }
});

// GET /api/counselors/:id - Get single counselor profile
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const counselor = (data.counselors || []).find((c) => c.id === req.params.id);

    if (!counselor) {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }

    res.json({ success: true, counselor });
  } catch (err) {
    console.error('Error retrieving counselor:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/counselors/book - Book a session
router.post('/book', (req, res) => {
  try {
    const {
      counselorId,
      date,
      time,
      sessionType,
      userNotes,
      isAnonymous,
      userId,
      clientName,
      clientEmail
    } = req.body;

    if (!counselorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Counselor, appointment date, and time slot are required'
      });
    }

    const data = readData();
    const counselor = (data.counselors || []).find((c) => c.id === counselorId);

    if (!counselor) {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }

    const roomId = `room-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
    const meetingLink = `https://meet.mindcare.org/${roomId}`;

    const newAppointment = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      counselorId: counselor.id,
      counselorName: counselor.name,
      counselorTitle: counselor.title,
      counselorImage: counselor.profileImage,
      counselorLocation: counselor.location,
      userId: userId || 'user-guest',
      clientName: isAnonymous ? 'Anonymous Client' : (clientName || 'Kind Client'),
      clientEmail: clientEmail || '',
      date,
      time,
      duration: '50 minutes',
      sessionType: sessionType || 'Video Session',
      status: 'confirmed',
      price: counselor.price || '$110',
      meetingLink,
      userNotes: userNotes || '',
      isAnonymous: Boolean(isAnonymous),
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(data.appointments)) {
      data.appointments = [];
    }

    data.appointments.unshift(newAppointment);
    writeData(data);

    res.status(201).json({
      success: true,
      message: `Session booked successfully with ${counselor.name}!`,
      appointment: newAppointment
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ success: false, message: 'Server error during booking' });
  }
});

// GET /api/counselors/appointments/user/:userId - Retrieve user appointments
router.get('/appointments/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const data = readData();
    const appointments = (data.appointments || []).filter(
      (a) => a.userId === userId || a.userId === 'user-current' || userId === 'all'
    );

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/counselors/inquire - Send an inquiry/message to a counselor
router.post('/inquire', (req, res) => {
  try {
    const { counselorId, name, email, phone, message, preferredContact } = req.body;

    if (!counselorId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Counselor and message are required' });
    }

    const data = readData();
    const counselor = (data.counselors || []).find((c) => c.id === counselorId);

    if (!counselor) {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }

    const inquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      counselorId,
      counselorName: counselor.name,
      senderName: name || 'Interested Client',
      senderEmail: email || '',
      senderPhone: phone || '',
      message: message.trim(),
      preferredContact: preferredContact || 'email',
      createdAt: new Date().toISOString(),
      status: 'pending_response'
    };

    if (!Array.isArray(data.inquiries)) {
      data.inquiries = [];
    }

    data.inquiries.unshift(inquiry);
    writeData(data);

    res.status(201).json({
      success: true,
      message: `Your message has been sent to ${counselor.name}. Expect a response within 24 hours.`,
      inquiry
    });
  } catch (err) {
    console.error('Error recording inquiry:', err);
    res.status(500).json({ success: false, message: 'Server error sending inquiry' });
  }
});

// POST /api/counselors/:id/reviews - Add a client rating & review
router.post('/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const { author, rating, comment } = req.body;

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const data = readData();
    const counselor = (data.counselors || []).find((c) => c.id === id);

    if (!counselor) {
      return res.status(404).json({ success: false, message: 'Counselor not found' });
    }

    if (!Array.isArray(counselor.clientReviews)) {
      counselor.clientReviews = [];
    }

    const newReview = {
      author: author || 'Verified Client',
      rating: Number(rating) || 5,
      date: 'Just now',
      comment: comment.trim()
    };

    counselor.clientReviews.unshift(newReview);
    counselor.reviews = (counselor.reviews || 0) + 1;

    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview,
      totalReviews: counselor.reviews
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ success: false, message: 'Server error saving review' });
  }
});

// PUT /api/counselors/appointments/:id/reschedule - Reschedule an appointment
router.put('/appointments/:id/reschedule', (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, notes } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'New date and time are required' });
    }

    const data = readData();
    const apt = (data.appointments || []).find((a) => a.id === id);

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    apt.date = date;
    apt.time = time;
    if (notes) apt.userNotes = notes;
    apt.status = 'confirmed';
    apt.updatedAt = new Date().toISOString();

    writeData(data);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: apt
    });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ success: false, message: 'Server error rescheduling appointment' });
  }
});

// PUT /api/counselors/appointments/:id/cancel - Cancel an appointment
router.put('/appointments/:id/cancel', (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const data = readData();
    const apt = (data.appointments || []).find((a) => a.id === id);

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    apt.status = 'cancelled';
    apt.cancelReason = reason || 'Client requested cancellation';
    apt.cancelledAt = new Date().toISOString();

    writeData(data);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: apt
    });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ success: false, message: 'Server error cancelling appointment' });
  }
});

// DELETE /api/counselors/appointments/:id - Delete an appointment
router.delete('/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();

    const initialLen = (data.appointments || []).length;
    data.appointments = (data.appointments || []).filter((a) => a.id !== id);

    if (data.appointments.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    writeData(data);

    res.json({
      success: true,
      message: 'Appointment removed'
    });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ success: false, message: 'Server error deleting appointment' });
  }
});

module.exports = router;

