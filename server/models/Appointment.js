// models/Appointment.js
const AppointmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentDate: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  meetingLink: {
      type: String,
      required: [true, "The Meeting Link is required"],
    },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  isAnonymous: { type: Boolean, default: false },
  userNotes: { type: String },
  doctorNotes: { type: String },
  rating: { 
    score: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
  },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});