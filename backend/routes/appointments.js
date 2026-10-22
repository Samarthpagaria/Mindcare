// server/routes/appointments.js (updated)
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { 
  createHMSRoom, 
  createHMSToken, 
  toggleRecording,
  sendSessionReport
} = require('../services/100msService');

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, duration, isAnonymous, userNotes } = req.body;
    
    // Validate appointment date (must be in the future)
    if (new Date(appointmentDate) <= new Date()) {
      return res.status(400).json({ error: 'Appointment date must be in the future' });
    }
    
    // Check if doctor exists and is verified
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isVerified: true });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found or not verified' });
    }
    
    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate),
        $lt: new Date(new Date(appointmentDate).getTime() + duration * 60000)
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }
    
    // Create HMS room for the appointment
    const roomCode = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const roomDescription = `Mental Health Appointment with Dr. ${doctor.lastName}`;
    
    const roomData = await createHMSRoom(roomCode, roomDescription);
    
    // Enable recording if configured
    if (process.env.HMS_ENABLE_RECORDING === 'true') {
      await toggleRecording(roomData.id, true);
    }
    
    // Create the appointment
    const appointment = new Appointment({
      user: req.user.id,
      doctor: doctorId,
      appointmentDate,
      duration,
      isAnonymous: isAnonymous || false,
      userNotes,
      meetingLink: roomData.id // Store the HMS room ID
    });
    
    await appointment.save();
    
    // Populate the doctor details for response
    await appointment.populate('doctor', 'firstName lastName specialization');
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ error: 'Server error creating appointment: ' + error.message });
  }
});

// Generate meeting token for a specific appointment
router.get('/:id/token', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check if user is authorized to join this appointment
    const isAuthorized = req.user.role === 'admin' || 
                         req.user.id === appointment.user.toString() || 
                         req.user.id === appointment.doctor.toString();
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to join this meeting' });
    }
    
    // Check if appointment is scheduled for now or in the future (with 15 min buffer)
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const startBuffer = new Date(appointmentTime.getTime() - 15 * 60000); // 15 min before
    const endTime = new Date(appointmentTime.getTime() + appointment.duration * 60000);
    
    if (now < startBuffer) {
      return res.status(400).json({ 
        error: 'Meeting is only accessible 15 minutes before scheduled time' 
      });
    }
    
    if (now > endTime) {
      // Mark appointment as completed if it's past end time
      if (appointment.status === 'scheduled' || appointment.status === 'confirmed') {
        appointment.status = 'completed';
        await appointment.save();
      }
      return res.status(400).json({ 
        error: 'This appointment has already ended' 
      });
    }
    
    // Update status to confirmed if it's the first time joining
    if (appointment.status === 'scheduled') {
      appointment.status = 'confirmed';
      await appointment.save();
    }
    
    // Determine user role in the meeting
    let role = 'guest';
    if (req.user.id === appointment.doctor.toString()) {
      role = process.env.HMS_DOCTOR_ROLE || 'doctor';
    } else if (req.user.id === appointment.user.toString()) {
      role = process.env.HMS_PATIENT_ROLE || 'patient';
    } else if (req.user.role === 'admin') {
      role = process.env.HMS_ADMIN_ROLE || 'admin';
    }
    
    // Generate token for 100ms
    const token = await createHMSToken(appointment.meetingLink, req.user.id, role);
    
    res.json({ 
      token, 
      roomId: appointment.meetingLink,
      role 
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Server error generating meeting token: ' + error.message });
  }
});

// End appointment and generate session report
router.post('/:id/end', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check if user is authorized to end this appointment
    const isAuthorized = req.user.role === 'admin' || 
                         req.user.id === appointment.doctor.toString();
    
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to end this meeting' });
    }
    
    // Update appointment status
    appointment.status = 'completed';
    appointment.updatedAt = new Date();
    await appointment.save();
    
    // Send session report for analytics
    await sendSessionReport(appointment.meetingLink, {
      appointmentId: appointment._id,
      duration: appointment.duration,
      endedAt: new Date()
    });
    
    res.json({ message: 'Appointment ended successfully', appointment });
  } catch (error) {
    console.error('Appointment end error:', error);
    res.status(500).json({ error: 'Server error ending appointment' });
  }
});

// Get user's appointments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    // Admin can see all appointments
    
    const appointments = await Appointment.find(query)
      .populate('user', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Appointment fetch error:', error);
    res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

module.exports = router;