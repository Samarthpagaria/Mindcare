const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'doctor', 'admin'], required: true },
  
  // Common profile fields
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phoneNumber: { type: String },        
  
    // Student-specific fields
    userId: { type: String, sparse: true },
    institution: { type: String },
    course: { type: String },
    yearOfStudy: { type: Number },
  
  // Doctor-specific fields
  doctorId: { type: String, sparse: true },
  specialization: { type: String },
  qualifications: [{ type: String }],
  licenseNumber: { type: String },
  yearsOfExperience: { type: Number },
  isVerified: { type: Boolean, default: false },
  bio: { type: String },
  languages: [{ type: String }],
  consultationFee: { type: Number },
  
  // Preferences and settings
  preferredLanguage: { type: String, default: 'en' },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});