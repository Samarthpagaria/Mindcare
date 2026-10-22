import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { FirebaseContext } from '../App';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  Video,
  MessageCircle,
  Phone,
  Calendar,
  User,
  GraduationCap,
  Award,
  Languages,
  Heart,
  CheckCircle,
  ArrowRight,
  Users,
  Briefcase,
  X,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';

const API_BASE = "/api/counselors";

export function CounselorSearch() {
  const navigate = useNavigate();
  const { authUser, userData } = useContext(FirebaseContext) || {};

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSessionType, setSelectedSessionType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('all');

  // Counselors Data State
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState('form'); // 'form' | 'confirmed'
  const [bookingDate, setBookingDate] = useState('Today');
  const [bookingTime, setBookingTime] = useState('02:00 PM');
  const [bookingSessionType, setBookingSessionType] = useState('Video Session');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingAnonymous, setBookingAnonymous] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Full Profile Modal State
  const [profileModalCounselor, setProfileModalCounselor] = useState(null);

  // Inquiry / Message Modal State
  const [inquiryCounselor, setInquiryCounselor] = useState(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryContactMethod, setInquiryContactMethod] = useState('email');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  // Phone modal
  const [phoneCounselor, setPhoneCounselor] = useState(null);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Specialties catalogue
  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'anxiety', label: 'Anxiety Disorders' },
    { id: 'depression', label: 'Depression' },
    { id: 'trauma', label: 'Trauma & PTSD' },
    { id: 'relationships', label: 'Relationships & Couples' },
    { id: 'addiction', label: 'Addiction & Recovery' },
    { id: 'family', label: 'Family Therapy' },
    { id: 'cognitive', label: 'Cognitive Behavioral (CBT)' },
    { id: 'mindfulness', label: 'Mindfulness-Based' }
  ];

  // Locations catalogue
  const locations = [
    { id: 'all', label: 'All Locations' },
    { id: 'online', label: '🌐 Online / Remote Only' },
    { id: 'ny', label: 'New York (NY)' },
    { id: 'ca', label: 'California (CA)' },
    { id: 'tx', label: 'Texas (TX)' },
    { id: 'co', label: 'Colorado (CO)' },
    { id: 'il', label: 'Illinois (IL)' },
    { id: 'wa', label: 'Washington (WA)' }
  ];

  // Resolve current active user info
  const getUserId = useCallback(() => {
    if (authUser?.uid) return authUser.uid;
    let localId = localStorage.getItem("peer_user_id");
    if (!localId) {
      localId = "guest_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("peer_user_id", localId);
    }
    return localId;
  }, [authUser]);

  const getUserName = useCallback(() => {
    if (userData?.firstName) {
      return `${userData.firstName} ${userData.lastName || ''}`.trim();
    }
    if (authUser?.displayName) return authUser.displayName;
    if (authUser?.email) return authUser.email.split('@')[0];
    return "Kind Client";
  }, [authUser, userData]);

  // Fetch counselors from backend API
  const fetchCounselors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        params: {
          search: searchQuery,
          specialty: selectedSpecialty,
          location: selectedLocation,
          sessionType: selectedSessionType,
          maxPrice: maxPrice !== 'all' ? maxPrice : undefined
        }
      });
      if (res.data?.success) {
        setCounselors(res.data.counselors);
      }
    } catch (err) {
      console.warn("Could not fetch counselors from API:", err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSpecialty, selectedLocation, selectedSessionType, maxPrice]);

  useEffect(() => {
    fetchCounselors();
  }, [fetchCounselors]);

  // Handle open booking modal
  const handleOpenBooking = (counselor) => {
    setSelectedCounselor(counselor);
    setBookingStep('form');
    setBookingDate('Today');
    setBookingTime(counselor.availableSlots?.[0] || '02:00 PM');
    setBookingSessionType('Video Session');
    setBookingNotes('');
    setBookingAnonymous(false);
    setConfirmedAppointment(null);
    setShowBookingModal(true);
  };

  // Submit appointment booking
  const handleConfirmBooking = async () => {
    if (!selectedCounselor) return;
    setIsSubmittingBooking(true);

    const userId = getUserId();
    const clientName = getUserName();
    const clientEmail = authUser?.email || '';

    try {
      const res = await axios.post(`${API_BASE}/book`, {
        counselorId: selectedCounselor.id,
        date: bookingDate,
        time: bookingTime,
        sessionType: bookingSessionType,
        userNotes: bookingNotes,
        isAnonymous: bookingAnonymous,
        userId,
        clientName,
        clientEmail
      });

      if (res.data?.success && res.data.appointment) {
        setConfirmedAppointment(res.data.appointment);
        setBookingStep('confirmed');
        showToast(`Appointment confirmed with ${selectedCounselor.name}!`);

        // Save in local storage cache for instant sync with Appointments tab
        try {
          const cached = JSON.parse(localStorage.getItem('user_booked_appointments') || '[]');
          cached.unshift(res.data.appointment);
          localStorage.setItem('user_booked_appointments', JSON.stringify(cached));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Booking failed:', err);
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Submit counselor message inquiry
  const handleSendInquiry = async () => {
    if (!inquiryCounselor || !inquiryMessage.trim()) return;
    setIsSendingInquiry(true);

    try {
      const res = await axios.post(`${API_BASE}/inquire`, {
        counselorId: inquiryCounselor.id,
        name: getUserName(),
        email: authUser?.email || 'client@mindcare.org',
        message: inquiryMessage.trim(),
        preferredContact: inquiryContactMethod
      });

      if (res.data?.success) {
        showToast(res.data.message || `Inquiry sent to ${inquiryCounselor.name}!`);
        setInquiryCounselor(null);
        setInquiryMessage('');
      }
    } catch (err) {
      console.error('Inquiry error:', err);
      showToast('Could not send message. Please try again.', 'error');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  // Reset all search filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedLocation('all');
    setSelectedSessionType('all');
    setMaxPrice('all');
    showToast('Filters cleared');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedSpecialty !== 'all' ||
    selectedLocation !== 'all' ||
    selectedSessionType !== 'all' ||
    maxPrice !== 'all';

  // Dynamic booking calendar dates
  const calendarDates = [
    { label: 'Today', dateString: 'Today, Oct 22' },
    { label: 'Tomorrow', dateString: 'Tomorrow, Oct 23' },
    { label: 'Oct 24', dateString: 'Thu, Oct 24' },
    { label: 'Oct 25', dateString: 'Fri, Oct 25' },
    { label: 'Oct 28', dateString: 'Mon, Oct 28' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
              toastMessage.type === 'error' ? 'bg-red-600' : 'bg-teal-600'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>{toastMessage.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-gradient-to-br from-teal-100 via-blue-50 to-indigo-100 rounded-2xl shadow-inner border border-teal-100/50">
              <ShieldCheck className="h-10 w-10 text-teal-600" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Find Your Licensed Counselor
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-2">
              Connect with vetted, licensed psychologists, therapists, and psychiatrists matched to your specific emotional and mental health needs.
            </p>
          </div>
        </div>

        {/* Search & Comprehensive Filters Panel */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center space-x-2">
                <Search className="h-4 w-4 text-teal-600" />
                <span>Search & Filter Counselors</span>
              </CardTitle>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search Query */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Search by Name or Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="e.g., Sarah, CBT, anxiety..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 text-sm border-gray-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Specialty Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Location / State
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type & Price Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Session Mode
                  </label>
                  <select
                    value={selectedSessionType}
                    onChange={(e) => setSelectedSessionType(e.target.value)}
                    className="w-full h-10 px-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="all">All Modes</option>
                    <option value="video">🎥 Video</option>
                    <option value="chat">💬 Chat</option>
                    <option value="in-person">🏢 In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Max Price
                  </label>
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-10 px-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="all">Any Price</option>
                    <option value="100">Under $100</option>
                    <option value="120">Under $120</option>
                    <option value="150">Under $150</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Count Bar */}
            <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
              <span className="font-medium">
                Found <strong className="text-teal-700">{counselors.length}</strong> licensed counselors matching your preferences
              </span>
              <span className="hidden sm:inline">
                🔒 All providers are vetted, verified, and HIPAA compliant
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Counselors List */}
        <div className="space-y-5">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
              <p className="text-sm font-medium text-gray-500">Searching licensed counselors...</p>
            </div>
          ) : counselors.length === 0 ? (
            <Card className="p-12 text-center space-y-4 bg-gray-50/50 border-dashed border-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">No counselors matched your filters</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                  Try broadening your location, price, or specialty filters to see all available therapists.
                </p>
              </div>
              <Button size="sm" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </Card>
          ) : (
            counselors.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <Card className="hover:shadow-md transition-all duration-200 border-gray-200">
                  <CardContent className="p-5 md:p-6">
                    <div className="grid md:grid-cols-4 gap-6 items-start">
                      {/* Column 1: Profile & Photo */}
                      <div className="md:col-span-1 text-center sm:text-left md:text-center space-y-3">
                        <div className="relative inline-block mx-auto">
                          <img
                            src={counselor.profileImage}
                            alt={counselor.name}
                            className="h-28 w-28 rounded-2xl object-cover mx-auto shadow-sm border-2 border-white ring-2 ring-gray-100"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div
                            style={{ display: 'none' }}
                            className="h-28 w-28 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white font-extrabold text-xl items-center justify-center mx-auto shadow-sm"
                          >
                            {counselor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>

                          {counselor.verified && (
                            <div
                              title="Verified Licensed Provider"
                              className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow"
                            >
                              <CheckCircle className="h-5 w-5 text-teal-600 fill-teal-50" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-gray-900 leading-tight">
                            {counselor.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            {counselor.degree} • {counselor.title}
                          </p>
                          <div className="flex items-center justify-center space-x-1.5 mt-2">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-gray-800">
                              {counselor.rating}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({counselor.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Specialties & Bio */}
                      <div className="md:col-span-2 space-y-3.5">
                        {/* Specialties Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {counselor.specialties.map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="text-xs bg-teal-50 text-teal-800 border-teal-100 font-medium"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {counselor.description}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-1">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{counselor.experience} Experience</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span>{counselor.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span><strong>{counselor.price}</strong> / 50-min session</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="font-semibold text-emerald-700">
                              {counselor.availability}
                            </span>
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="flex items-center space-x-2 pt-1 text-xs">
                          <Languages className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-500">Languages:</span>
                          <div className="flex space-x-1.5">
                            {counselor.languages.map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px]"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Actions */}
                      <div className="md:col-span-1 space-y-2.5 flex flex-col justify-between h-full pt-1">
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm"
                          onClick={() => handleOpenBooking(counselor)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>

                        {/* Quick Contact Icons */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Online Video Consultation"
                            onClick={() => handleOpenBooking(counselor)}
                            className="h-9 hover:bg-teal-50 hover:text-teal-700 border-gray-200"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Send Message / Inquiry"
                            onClick={() => setInquiryCounselor(counselor)}
                            className="h-9 hover:bg-blue-50 hover:text-blue-700 border-gray-200"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Phone Consultation Info"
                            onClick={() => setPhoneCounselor(counselor)}
                            className="h-9 hover:bg-amber-50 hover:text-amber-700 border-gray-200"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProfileModalCounselor(counselor)}
                          className="w-full text-xs text-gray-600 hover:text-teal-700 font-semibold"
                        >
                          View Full Profile
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Informational Assurance Banners */}
        <div className="grid md:grid-cols-2 gap-4 pt-4">
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100 shadow-sm">
            <CardContent className="p-4 flex items-start space-x-3.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Strictly Vetted & Licensed
                </h4>
                <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                  Every therapist holds verified state credentials, clinical malpractice coverage, and adheres to the highest medical ethics standards.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
            <CardContent className="p-4 flex items-start space-x-3.5">
              <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-blue-950">
                  100% Confidential & Private
                </h4>
                <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                  All teletherapy communications use end-to-end encrypted rooms that are fully HIPAA compliant.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          BOOKING MODAL / DIALOG
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBookingModal && selectedCounselor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden my-8"
            >
              {bookingStep === 'form' ? (
                <>
                  <div className="px-6 py-4 border-b bg-gray-50/70 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="h-5 w-5 text-teal-600" />
                      <h3 className="font-bold text-lg text-gray-900">
                        Book Session with {selectedCounselor.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Counselor Header Summary */}
                    <div className="flex items-center space-x-3.5 p-3.5 bg-teal-50/50 rounded-xl border border-teal-100">
                      <img
                        src={selectedCounselor.profileImage}
                        alt={selectedCounselor.name}
                        className="h-12 w-12 rounded-xl object-cover shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900">
                          {selectedCounselor.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {selectedCounselor.title} • {selectedCounselor.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-teal-700 text-sm">
                          {selectedCounselor.price}
                        </span>
                        <p className="text-[11px] text-gray-500">50 mins</p>
                      </div>
                    </div>

                    {/* Step 1: Select Session Mode */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        1. Select Session Mode
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'Video Session', icon: Video, label: 'Video Call', desc: 'Online Telehealth' },
                          { id: 'Chat Session', icon: MessageCircle, label: 'Live Chat', desc: 'Secure Messaging' },
                          { id: 'In-Person', icon: Users, label: 'In-Person', desc: 'Clinic Visit' }
                        ].map((m) => {
                          const Icon = m.icon;
                          const isSelected = bookingSessionType === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setBookingSessionType(m.id)}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-bold shadow-sm ring-1 ring-teal-500'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? 'text-teal-600' : 'text-gray-400'}`} />
                              <div className="text-xs">{m.label}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{m.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Select Date */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        2. Select Date
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {calendarDates.map((d) => {
                          const isSelected = bookingDate === d.label;
                          return (
                            <button
                              key={d.label}
                              type="button"
                              onClick={() => setBookingDate(d.label)}
                              className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-600 text-white font-bold shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                              }`}
                            >
                              <div>{d.label}</div>
                              <div className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                                {d.dateString.split(', ')[1]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3: Select Time Slot */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                        3. Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {(selectedCounselor.availableSlots || ["10:00 AM", "01:00 PM", "03:30 PM", "05:00 PM"]).map((slot) => {
                          const isSelected = bookingTime === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setBookingTime(slot)}
                              className={`py-2 px-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500'
                                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 4: Notes / Reason */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                        4. Consultation Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Share what you'd like to focus on in this session (e.g., anxiety at work, sleep, relationship communication)..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="text-xs resize-none min-h-[70px] border-gray-200"
                      />
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <span className="text-gray-700 font-medium">
                        Keep session identity private / anonymous
                      </span>
                      <input
                        type="checkbox"
                        checked={bookingAnonymous}
                        onChange={(e) => setBookingAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80 space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between font-medium">
                        <span>Session Rate (50 mins)</span>
                        <span>{selectedCounselor.price}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Platform Intake Fee</span>
                        <span className="font-semibold">FREE ($0.00)</span>
                      </div>
                      <div className="border-t pt-1.5 flex justify-between font-bold text-gray-900 text-sm">
                        <span>Total Due</span>
                        <span className="text-teal-700">{selectedCounselor.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t bg-gray-50/50 flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isSubmittingBooking}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    >
                      {isSubmittingBooking ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Confirming...
                        </>
                      ) : (
                        `Confirm Booking (${selectedCounselor.price})`
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                /* Celebration Confirmation Screen */
                <div className="p-8 text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      Appointment Confirmed!
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                      Your session with <strong>{selectedCounselor.name}</strong> has been secured and added to your schedule.
                    </p>
                  </div>

                  {confirmedAppointment && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left space-y-3 text-xs md:text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Booking Reference:</span>
                        <span className="font-mono font-bold text-teal-800">
                          {confirmedAppointment.id}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Date & Time:</span>
                        <span className="font-semibold text-gray-800">
                          {confirmedAppointment.date} at {confirmedAppointment.time}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Session Mode:</span>
                        <span className="font-semibold text-gray-800">
                          {confirmedAppointment.sessionType} (50 mins)
                        </span>
                      </div>

                      {/* Video Room Link */}
                      <div className="pt-1">
                        <span className="text-gray-500 block mb-1">Encrypted Telehealth Room:</span>
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
                          <input
                            type="text"
                            readOnly
                            value={confirmedAppointment.meetingLink}
                            className="bg-transparent font-mono text-xs text-gray-600 flex-1 outline-none"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(confirmedAppointment.meetingLink);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-teal-600 font-semibold text-xs flex items-center"
                          >
                            {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1"
                    >
                      Book Another Counselor
                    </Button>
                    <Button
                      onClick={() => {
                        setShowBookingModal(false);
                        navigate('/appointments');
                      }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    >
                      Go to My Appointments
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          FULL COUNSELOR PROFILE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {profileModalCounselor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden my-8"
            >
              <div className="px-6 py-4 border-b bg-gray-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-lg text-gray-900">
                    Therapist Profile & Credentials
                  </h3>
                </div>
                <button
                  onClick={() => setProfileModalCounselor(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Header card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <img
                    src={profileModalCounselor.profileImage}
                    alt={profileModalCounselor.name}
                    className="h-24 w-24 rounded-2xl object-cover shadow border"
                  />
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <h3 className="font-bold text-xl text-gray-900">
                        {profileModalCounselor.name}
                      </h3>
                      {profileModalCounselor.verified && (
                        <CheckCircle className="h-5 w-5 text-teal-600 fill-teal-50" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {profileModalCounselor.degree} • {profileModalCounselor.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      📍 {profileModalCounselor.location} • {profileModalCounselor.experience} Clinical Experience
                    </p>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1 text-xs">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-gray-800">
                        {profileModalCounselor.rating} out of 5
                      </span>
                      <span className="text-gray-400">
                        ({profileModalCounselor.reviews} client reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    About & Philosophy
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {profileModalCounselor.description}
                  </p>
                </div>

                {/* Specialties & Approaches */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {profileModalCounselor.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                      Therapeutic Approaches
                    </h4>
                    <div className="space-y-1 text-xs text-gray-700 font-medium">
                      {(profileModalCounselor.approachTypes || []).map((appr) => (
                        <div key={appr} className="flex items-center space-x-1.5">
                          <Sparkles className="h-3 w-3 text-teal-600 flex-shrink-0" />
                          <span>{appr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Education & Credentials */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Education & Credentials
                  </h4>
                  <div className="space-y-2">
                    {(profileModalCounselor.education || []).map((edu, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs text-gray-700">
                        <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Client Reviews */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                    Verified Client Reviews
                  </h4>
                  <div className="space-y-2.5">
                    {(profileModalCounselor.clientReviews || []).map((rev, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">{rev.author}</span>
                          <span className="text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50/50 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setProfileModalCounselor(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const c = profileModalCounselor;
                    setProfileModalCounselor(null);
                    handleOpenBooking(c);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Book Session with {profileModalCounselor.name.split(' ')[0]} ({profileModalCounselor.price})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          INQUIRY / MESSAGE DIALOG
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {inquiryCounselor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden my-8"
            >
              <div className="px-6 py-4 border-b bg-gray-50/70 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-base text-gray-900">
                    Send Inquiry to {inquiryCounselor.name}
                  </h3>
                </div>
                <button
                  onClick={() => setInquiryCounselor(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500">
                  Ask questions about therapeutic approach, insurance coverage, or specific concerns prior to booking.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Your Question / Message *
                  </label>
                  <Textarea
                    placeholder="e.g., Hi Dr. Johnson, I am looking for support with social anxiety in corporate settings. Do you offer evening telehealth slots?..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="text-xs min-h-[100px] border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preferred Response Method
                  </label>
                  <select
                    value={inquiryContactMethod}
                    onChange={(e) => setInquiryContactMethod(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white"
                  >
                    <option value="email">Email Response (Within 24h)</option>
                    <option value="chat">MindCare Secure Chat</option>
                    <option value="phone">Phone Callback</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-gray-50/50 flex space-x-2.5">
                <Button
                  variant="outline"
                  onClick={() => setInquiryCounselor(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInquiry}
                  disabled={isSendingInquiry || !inquiryMessage.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  {isSendingInquiry ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          PHONE HELPLINE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phoneCounselor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Phone Consultation Line
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Direct intake line for {phoneCounselor.name}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border font-mono font-bold text-teal-800 text-base">
                {phoneCounselor.phone || "+1 (800) 555-CARE"}
              </div>

              <p className="text-[11px] text-gray-400">
                Hours: Mon - Fri, 9:00 AM - 6:00 PM EST. If you are experiencing an immediate crisis, please dial 988.
              </p>

              <Button
                variant="outline"
                onClick={() => setPhoneCounselor(null)}
                className="w-full"
              >
                Close
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CounselorSearch;