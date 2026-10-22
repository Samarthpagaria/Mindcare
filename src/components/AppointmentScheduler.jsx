// client/src/components/AppointmentScheduler.js
import React, { useState, useEffect } from 'react';
import { createAppointment, getDoctors } from '../services/api';

const AppointmentScheduler = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsList = await getDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setMessage('Failed to load doctors list');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      await createAppointment({
        doctorId: selectedDoctor,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: 60, // Default 60 minutes
        isAnonymous,
        userNotes: notes
      });
      
      setMessage('Appointment scheduled successfully!');
      // Reset form
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setIsAnonymous(false);
      setNotes('');
    } catch (error) {
      console.error('Appointment creation error:', error);
      setMessage(error.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots (9 AM to 5 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="appointment-scheduler">
      <h2>Schedule a New Appointment</h2>
      
      {message && <div className="message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="doctor">Select Doctor:</label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Appointment Date:</label>
          <input
            type="date"
            id="date"
            value={appointmentDate}
            min={minDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Appointment Time:</label>
          <select
            id="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          >
            <option value="">Select time</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Book anonymously
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes (optional):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific concerns or topics you'd like to discuss"
            rows="3"
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentScheduler;