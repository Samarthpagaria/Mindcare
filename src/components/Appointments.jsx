import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { FirebaseContext } from '../App';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle,
  Phone,
  MapPin,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Bell,
  FileText,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  X,
  ChevronRight,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

const API_BASE = "/api/counselors";

const INITIAL_APPOINTMENTS = [
  {
    id: 'app-seed-1',
    counselorName: 'Dr. Sarah Johnson',
    counselorTitle: 'Licensed Clinical Psychologist',
    counselorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    date: 'Today',
    time: '02:00 PM - 02:50 PM',
    duration: '50 minutes',
    type: 'video',
    status: 'confirmed',
    price: '$120',
    meetingLink: 'https://meet.mindcare.org/room-sarah-today',
    notes: 'Focus on workplace anxiety management and practical grounding exercises'
  },
  {
    id: 'app-seed-2',
    counselorName: 'Michael Chen, LMFT',
    counselorTitle: 'Licensed Marriage & Family Therapist',
    counselorImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    date: 'Tomorrow',
    time: '10:00 AM - 10:50 AM',
    duration: '50 minutes',
    type: 'video',
    status: 'confirmed',
    price: '$110',
    meetingLink: 'https://meet.mindcare.org/room-chen-tomorrow',
    notes: 'Couples communication review'
  },
  {
    id: 'app-seed-3',
    counselorName: 'Dr. Emily Rodriguez',
    counselorTitle: 'Licensed Clinical Social Worker',
    counselorImage: 'https://images.unsplash.com/photo-1594824813583-7c87c0b05b76?auto=format&fit=crop&q=80&w=400',
    date: 'Oct 28, 2026',
    time: '03:00 PM - 03:50 PM',
    duration: '50 minutes',
    type: 'in-person',
    status: 'pending',
    price: '$100',
    notes: 'Initial trauma assessment and consultation'
  },
  {
    id: 'app-seed-4',
    counselorName: 'Dr. Sarah Johnson',
    counselorTitle: 'Licensed Clinical Psychologist',
    counselorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    date: 'Oct 14, 2026',
    time: '02:00 PM - 02:50 PM',
    duration: '50 minutes',
    type: 'video',
    status: 'completed',
    price: '$120',
    meetingLink: 'https://meet.mindcare.org/room-past-1',
    sessionNotes: 'Discussed coping strategies for presentation anxiety. Homework: Daily 4-7-8 breathing and thought tracking.',
    nextAppointment: 'Oct 22, 2026 at 2:00 PM'
  },
  {
    id: 'app-seed-5',
    counselorName: 'James Wilson, LPC',
    counselorTitle: 'Licensed Professional Counselor',
    counselorImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    date: 'Sep 29, 2026',
    time: '04:00 PM - 04:50 PM',
    duration: '50 minutes',
    type: 'video',
    status: 'completed',
    price: '$95',
    meetingLink: 'https://meet.mindcare.org/room-past-2',
    sessionNotes: 'Progress review on stress reduction and boundary setting with work colleagues.',
    nextAppointment: 'Completed'
  }
];

export function Appointments() {
  const navigate = useNavigate();
  const { authUser } = useContext(FirebaseContext) || {};

  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const [cancelAppointment, setCancelAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('Scheduling conflict');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch appointments from API & LocalStorage
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    let combined = [...INITIAL_APPOINTMENTS];
    try {
      const res = await axios.get(`${API_BASE}/appointments/user/all`);
      if (res.data?.success && Array.isArray(res.data.appointments)) {
        const apiItems = res.data.appointments.map((a) => ({
          id: a.id,
          counselorName: a.counselorName,
          counselorTitle: a.counselorTitle,
          counselorImage: a.counselorImage,
          date: a.date,
          time: a.time,
          duration: a.duration || '50 minutes',
          type: a.sessionType?.toLowerCase().includes('in-person')
            ? 'in-person'
            : a.sessionType?.toLowerCase().includes('chat')
            ? 'chat'
            : 'video',
          status: a.status || 'confirmed',
          price: a.price || '$120',
          meetingLink: a.meetingLink,
          notes: a.userNotes,
          createdAt: a.createdAt
        }));
        combined = [...apiItems, ...combined];
      }
    } catch (err) {
      console.warn('API appointments fallback:', err.message);
    }

    // Merge with localStorage cached bookings
    try {
      const local = JSON.parse(localStorage.getItem('user_booked_appointments') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const localMapped = local.map((a) => ({
          id: a.id,
          counselorName: a.counselorName,
          counselorTitle: a.counselorTitle,
          counselorImage: a.counselorImage,
          date: a.date,
          time: a.time,
          duration: a.duration || '50 minutes',
          type: a.sessionType?.toLowerCase().includes('in-person')
            ? 'in-person'
            : a.sessionType?.toLowerCase().includes('chat')
            ? 'chat'
            : 'video',
          status: a.status || 'confirmed',
          price: a.price || '$120',
          meetingLink: a.meetingLink,
          notes: a.userNotes,
          createdAt: a.createdAt
        }));
        const existingIds = new Set(combined.map((x) => x.id));
        const uniqueLocal = localMapped.filter((x) => !existingIds.has(x.id));
        combined = [...uniqueLocal, ...combined];
      }
    } catch (e) {
      console.error(e);
    }

    // Sort: confirmed/pending first
    setAppointments(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Derived appointment subsets
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending'
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled'
  );

  // Dynamic statistics
  const upcomingCount = upcomingAppointments.length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const thisMonthCount = appointments.filter((a) => a.status !== 'cancelled').length;
  const totalSpent = appointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .reduce((acc, a) => {
      const num = parseInt((a.price || '').replace(/[^0-9]/g, '')) || 100;
      return acc + num;
    }, 0);

  // Handle Join Session
  const handleJoinSession = (appointment) => {
    const link = appointment.meetingLink || `https://meet.mindcare.org/room-${appointment.id}`;
    window.open(link, '_blank');
    showToast(`Launching telehealth room for ${appointment.counselorName}...`);
  };

  // Handle Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleAppointment) return;
    setIsSubmittingReschedule(true);

    try {
      await axios.put(`${API_BASE}/appointments/${rescheduleAppointment.id}/reschedule`, {
        date: rescheduleDate,
        time: rescheduleTime,
        notes: rescheduleNotes
      });

      // Update state
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppointment.id
            ? { ...a, date: rescheduleDate, time: rescheduleTime, notes: rescheduleNotes || a.notes, status: 'confirmed' }
            : a
        )
      );

      // Update localStorage
      try {
        const local = JSON.parse(localStorage.getItem('user_booked_appointments') || '[]');
        const updated = local.map((a) =>
          a.id === rescheduleAppointment.id
            ? { ...a, date: rescheduleDate, time: rescheduleTime, userNotes: rescheduleNotes || a.userNotes }
            : a
        );
        localStorage.setItem('user_booked_appointments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      showToast(`Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime}!`);
      setRescheduleAppointment(null);
    } catch (err) {
      console.error('Reschedule failed:', err);
      // Fallback local update
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppointment.id
            ? { ...a, date: rescheduleDate, time: rescheduleTime, status: 'confirmed' }
            : a
        )
      );
      showToast(`Appointment rescheduled to ${rescheduleDate}!`);
      setRescheduleAppointment(null);
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Handle Cancel
  const handleConfirmCancel = async () => {
    if (!cancelAppointment) return;
    setIsSubmittingCancel(true);

    try {
      await axios.put(`${API_BASE}/appointments/${cancelAppointment.id}/cancel`, {
        reason: cancelReason
      });

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelAppointment.id ? { ...a, status: 'cancelled' } : a
        )
      );

      // Update localStorage
      try {
        const local = JSON.parse(localStorage.getItem('user_booked_appointments') || '[]');
        const updated = local.map((a) =>
          a.id === cancelAppointment.id ? { ...a, status: 'cancelled' } : a
        );
        localStorage.setItem('user_booked_appointments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      showToast(`Appointment with ${cancelAppointment.counselorName} has been cancelled.`);
      setCancelAppointment(null);
    } catch (err) {
      console.error('Cancellation failed:', err);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelAppointment.id ? { ...a, status: 'cancelled' } : a
        )
      );
      showToast('Appointment cancelled.');
      setCancelAppointment(null);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Download Session Notes Summary
  const handleDownloadSummary = (appointment) => {
    const summaryText = `MINDCARE CLINICAL SESSION SUMMARY
---------------------------------------------
Counselor: ${appointment.counselorName} (${appointment.counselorTitle})
Date: ${appointment.date}
Time: ${appointment.time}
Session Type: ${appointment.type?.toUpperCase()}
Status: ${appointment.status?.toUpperCase()}
Fee: ${appointment.price}

CLIENT FOCUS NOTES:
${appointment.notes || 'General mental health check-in'}

CLINICAL SESSION NOTES:
${appointment.sessionNotes || 'Session completed successfully. Coping tools practiced and homework assigned.'}

NEXT MILESTONE:
${appointment.nextAppointment || 'Check-in scheduled'}
---------------------------------------------
Document verified by MindCare Telehealth platform.
`;

    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MindCare-Session-${appointment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Session summary report downloaded!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'pending':
        return <AlertCircle className="h-3.5 w-3.5" />;
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'cancelled':
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      case 'chat':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  // Appointment Card Item
  const AppointmentCard = ({ appointment, showActions = true }) => {
    const isConfirmed = appointment.status === 'confirmed';
    const isPending = appointment.status === 'pending';
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    return (
      <Card className="hover:shadow-md transition-all duration-200 border-gray-200">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            {/* Counselor details */}
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-12 w-12 border bg-gradient-to-br from-teal-500 to-indigo-600 text-white font-bold">
                {appointment.counselorImage ? (
                  <img
                    src={appointment.counselorImage}
                    alt={appointment.counselorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-transparent text-white font-bold text-sm">
                    {appointment.counselorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-snug">
                    {appointment.counselorName}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {appointment.counselorTitle}
                  </p>
                </div>
                
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 capitalize font-medium">
                    {getTypeIcon(appointment.type)}
                    <span>{appointment.type} Session ({appointment.duration})</span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="bg-teal-50/60 border border-teal-100 p-2.5 rounded-xl text-xs text-teal-900">
                    <strong className="font-semibold text-teal-800">Your Focus Notes:</strong> {appointment.notes}
                  </div>
                )}

                {appointment.sessionNotes && (
                  <div className="bg-emerald-50/80 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-950 space-y-1">
                    <div>
                      <strong className="font-semibold text-emerald-800">Therapist Session Summary:</strong> {appointment.sessionNotes}
                    </div>
                    {appointment.nextAppointment && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Next recommended check-in: {appointment.nextAppointment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Status, Price, and Actions */}
            <div className="flex flex-col items-start md:items-end justify-between self-stretch space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className={`border text-xs px-2.5 py-0.5 capitalize flex items-center space-x-1.5 font-semibold ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span>{appointment.status}</span>
                </Badge>
                <span className="font-bold text-gray-800 text-sm">{appointment.price}</span>
              </div>

              {showActions && (
                <div className="flex items-center flex-wrap gap-1.5 pt-2">
                  {/* Join Session Button (for confirmed sessions) */}
                  {isConfirmed && (
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-8 px-3 shadow-sm"
                      onClick={() => handleJoinSession(appointment)}
                    >
                      <Video className="h-3.5 w-3.5 mr-1.5" />
                      Join Session
                    </Button>
                  )}

                  {/* Reschedule Button */}
                  {(isConfirmed || isPending) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setRescheduleAppointment(appointment);
                        setRescheduleDate(appointment.date);
                        setRescheduleTime(appointment.time.split(' - ')[0] || '10:00 AM');
                        setRescheduleNotes(appointment.notes || '');
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Reschedule
                    </Button>
                  )}

                  {/* Cancel Button */}
                  {(isConfirmed || isPending) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                      onClick={() => setCancelAppointment(appointment)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                  )}

                  {/* Download Summary (for completed) */}
                  {isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 text-teal-700 border-teal-200 hover:bg-teal-50"
                      onClick={() => handleDownloadSummary(appointment)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Report
                    </Button>
                  )}

                  {/* Details view */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => setDetailsAppointment(appointment)}
                    title="View details"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            <div className="p-4 bg-gradient-to-br from-blue-100 via-teal-50 to-indigo-100 rounded-2xl shadow-inner border border-blue-100/50">
              <Calendar className="h-10 w-10 text-teal-600" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              My Therapy Appointments
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-2">
              Track upcoming consultations, launch secure video sessions, reschedule, and view clinical session summaries.
            </p>
          </div>
        </div>

        {/* Dynamic Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-teal-100 shadow-sm bg-gradient-to-b from-teal-50/40 to-white text-center p-4">
            <div className="text-2xl md:text-3xl font-extrabold text-teal-700">
              {upcomingCount}
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Upcoming Sessions
            </div>
          </Card>
          <Card className="border border-blue-100 shadow-sm bg-gradient-to-b from-blue-50/40 to-white text-center p-4">
            <div className="text-2xl md:text-3xl font-extrabold text-blue-700">
              {completedCount}
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Completed Sessions
            </div>
          </Card>
          <Card className="border border-purple-100 shadow-sm bg-gradient-to-b from-purple-50/40 to-white text-center p-4">
            <div className="text-2xl md:text-3xl font-extrabold text-purple-700">
              {thisMonthCount}
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Sessions Scheduled
            </div>
          </Card>
          <Card className="border border-amber-100 shadow-sm bg-gradient-to-b from-amber-50/40 to-white text-center p-4">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-700">
              ${totalSpent}
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mt-1">
              Care Investment
            </div>
          </Card>
        </div>

        {/* Next Appointment Highlight Banner */}
        {upcomingAppointments.length > 0 && (
          <Card className="bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 border-teal-200/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 border-b border-teal-100/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-teal-900 flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-teal-600" />
                  <span>Next Scheduled Session</span>
                </CardTitle>
                <Badge className="bg-teal-600 text-white text-xs font-semibold">
                  Confirmed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border shadow-sm">
                    {upcomingAppointments[0].counselorImage ? (
                      <img
                        src={upcomingAppointments[0].counselorImage}
                        alt={upcomingAppointments[0].counselorName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-teal-600 text-white font-bold">
                        {upcomingAppointments[0].counselorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {upcomingAppointments[0].counselorName}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {upcomingAppointments[0].counselorTitle}
                    </p>
                    <div className="flex items-center space-x-3 mt-1.5 text-xs font-medium text-teal-900">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-teal-600" />
                        {upcomingAppointments[0].date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-teal-600" />
                        {upcomingAppointments[0].time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                  <Button
                    className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow"
                    onClick={() => handleJoinSession(upcomingAppointments[0])}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Launch Telehealth Room
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-teal-200 text-teal-800 hover:bg-teal-100/50"
                    onClick={() => setDetailsAppointment(upcomingAppointments[0])}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-3">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100/80 p-1 rounded-xl">
              <TabsTrigger value="upcoming" className="rounded-lg text-xs md:text-sm font-medium">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg text-xs md:text-sm font-medium">
                Past Sessions ({completedCount})
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg text-xs md:text-sm font-medium">
                Schedule View
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAppointments}
                className="text-xs text-gray-600 border-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                onClick={() => navigate('/counselors')}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Book New Session
              </Button>
            </div>
          </div>

          {/* ══ UPCOMING TAB ══ */}
          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
                <p className="text-sm font-medium text-gray-500">Loading your appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <AppointmentCard appointment={appointment} />
                </motion.div>
              ))
            ) : (
              <Card className="border-dashed border-2 p-12 text-center space-y-4 bg-gray-50/50">
                <Calendar className="h-14 w-14 text-gray-300 mx-auto" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">No Upcoming Appointments</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                    Ready to speak with a licensed therapist? Schedule your next video or chat consultation in minutes.
                  </p>
                </div>
                <Button onClick={() => navigate('/counselors')} className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Book Your Next Session
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* ══ PAST SESSIONS TAB ══ */}
          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <AppointmentCard appointment={appointment} showActions={appointment.status === 'completed'} />
                </motion.div>
              ))
            ) : (
              <Card className="border-dashed border-2 p-12 text-center text-gray-500">
                <p>No past appointments recorded yet.</p>
              </Card>
            )}
          </TabsContent>

          {/* ══ SCHEDULE / CALENDAR VIEW TAB ══ */}
          <TabsContent value="calendar" className="space-y-5">
            <Card className="border-gray-200">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <span>Therapy Calendar & Agenda</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Overview of your consultations by day
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Today */}
                  <div className="border border-teal-200 rounded-2xl p-4 bg-teal-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-teal-900">Today</span>
                      <Badge className="bg-teal-600 text-white text-[10px]">Today</Badge>
                    </div>
                    {appointments.filter((a) => a.date === 'Today').length > 0 ? (
                      appointments.filter((a) => a.date === 'Today').map((apt) => (
                        <div key={apt.id} className="p-3 bg-white rounded-xl shadow-sm border border-teal-100 text-xs space-y-1.5">
                          <div className="font-bold text-gray-800">{apt.counselorName}</div>
                          <div className="text-gray-500 font-medium">🕒 {apt.time}</div>
                          <Button
                            size="sm"
                            className="w-full mt-1 bg-teal-600 hover:bg-teal-700 text-white text-xs h-7"
                            onClick={() => handleJoinSession(apt)}
                          >
                            <Video className="h-3 w-3 mr-1" /> Join Room
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No appointments scheduled today.</p>
                    )}
                  </div>

                  {/* Tomorrow */}
                  <div className="border border-blue-200 rounded-2xl p-4 bg-blue-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-blue-900">Tomorrow</span>
                      <Badge variant="outline" className="text-blue-700 border-blue-300 text-[10px]">Upcoming</Badge>
                    </div>
                    {appointments.filter((a) => a.date === 'Tomorrow').length > 0 ? (
                      appointments.filter((a) => a.date === 'Tomorrow').map((apt) => (
                        <div key={apt.id} className="p-3 bg-white rounded-xl shadow-sm border border-blue-100 text-xs space-y-1.5">
                          <div className="font-bold text-gray-800">{apt.counselorName}</div>
                          <div className="text-gray-500 font-medium">🕒 {apt.time}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-1 text-teal-700 border-teal-200 text-xs h-7"
                            onClick={() => setDetailsAppointment(apt)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No appointments tomorrow.</p>
                    )}
                  </div>

                  {/* Later this month */}
                  <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-purple-900">Upcoming This Month</span>
                      <Badge variant="outline" className="text-purple-700 border-purple-300 text-[10px]">Future</Badge>
                    </div>
                    {appointments.filter((a) => a.date !== 'Today' && a.date !== 'Tomorrow' && (a.status === 'confirmed' || a.status === 'pending')).length > 0 ? (
                      appointments.filter((a) => a.date !== 'Today' && a.date !== 'Tomorrow' && (a.status === 'confirmed' || a.status === 'pending')).map((apt) => (
                        <div key={apt.id} className="p-3 bg-white rounded-xl shadow-sm border border-purple-100 text-xs space-y-1.5">
                          <div className="font-bold text-gray-800">{apt.counselorName}</div>
                          <div className="text-gray-500 font-medium">📅 {apt.date} at {apt.time}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-1 text-purple-700 border-purple-200 text-xs h-7"
                            onClick={() => setDetailsAppointment(apt)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No further sessions booked this month.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Feature Cards */}
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border-purple-200 shadow-sm">
            <CardContent className="p-5 flex items-start space-x-3.5">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl flex-shrink-0 mt-0.5">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-purple-950 text-sm">
                  Clinical Progress & Homework Notes
                </h3>
                <p className="text-xs text-purple-900/80 leading-relaxed">
                  Review personalized coping strategies, grounding homework, and therapeutic milestones documented by your therapists.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgressModal(true)}
                  className="mt-2 text-xs border-purple-300 text-purple-800 hover:bg-purple-100"
                >
                  View Clinical Milestones Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-amber-200 shadow-sm">
            <CardContent className="p-5 flex items-start space-x-3.5">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0 mt-0.5">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-amber-950 text-sm">
                  Flexible Rescheduling Policy
                </h3>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Need to change your appointment time? You can reschedule or cancel any session up to 24 hours prior with zero penalty fee.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (upcomingAppointments.length > 0) {
                      setRescheduleAppointment(upcomingAppointments[0]);
                      setRescheduleDate(upcomingAppointments[0].date);
                      setRescheduleTime(upcomingAppointments[0].time.split(' - ')[0] || '10:00 AM');
                    } else {
                      navigate('/counselors');
                    }
                  }}
                  className="mt-2 text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  {upcomingAppointments.length > 0 ? "Reschedule Next Session" : "Schedule New Session"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          RESCHEDULE MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {rescheduleAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-teal-600" />
                  <h3 className="font-bold text-base text-gray-900">
                    Reschedule Appointment
                  </h3>
                </div>
                <button
                  onClick={() => setRescheduleAppointment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-500">
                  Rescheduling consultation with <strong>{rescheduleAppointment.counselorName}</strong>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select New Date
                  </label>
                  <select
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white"
                  >
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Oct 24, 2026">Thu, Oct 24</option>
                    <option value="Oct 25, 2026">Fri, Oct 25</option>
                    <option value="Oct 28, 2026">Mon, Oct 28</option>
                    <option value="Oct 29, 2026">Tue, Oct 29</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select New Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRescheduleTime(t)}
                        className={`py-2 rounded-lg border text-xs font-semibold ${
                          rescheduleTime === t
                            ? 'bg-teal-50 text-teal-800 border-teal-500 ring-1 ring-teal-500'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Update Consultation Notes (Optional)
                  </label>
                  <Textarea
                    value={rescheduleNotes}
                    onChange={(e) => setRescheduleNotes(e.target.value)}
                    placeholder="Add any updated context for the therapist..."
                    className="text-xs min-h-[60px] border-gray-200"
                  />
                </div>
              </div>

              <div className="px-5 py-3.5 border-t bg-gray-50 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setRescheduleAppointment(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReschedule}
                  disabled={isSubmittingReschedule}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {isSubmittingReschedule ? 'Saving...' : 'Confirm Reschedule'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          CANCEL MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cancelAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">
                  Cancel Appointment?
                </h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to cancel your session with <strong>{cancelAppointment.counselorName}</strong> on {cancelAppointment.date}?
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cancellation Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs font-medium bg-white"
                >
                  <option value="Scheduling conflict">Scheduling conflict</option>
                  <option value="Feeling better / no longer needed">Feeling better / no longer needed</option>
                  <option value="Need different counselor specialty">Need different specialty</option>
                  <option value="Personal emergency">Personal emergency</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelAppointment(null)}
                  className="flex-1 text-xs"
                >
                  Keep Session
                </Button>
                <Button
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          APPOINTMENT DETAILS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailsAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <h3 className="font-bold text-base text-gray-900">
                    Appointment Details
                  </h3>
                </div>
                <button
                  onClick={() => setDetailsAppointment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Therapist:</span>
                  <span className="font-bold text-gray-900">{detailsAppointment.counselorName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Scheduled Time:</span>
                  <span className="font-semibold">{detailsAppointment.date} at {detailsAppointment.time}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Session Mode:</span>
                  <span className="font-semibold capitalize">{detailsAppointment.type} Session</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-teal-700 capitalize">{detailsAppointment.status}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Session Fee:</span>
                  <span className="font-bold">{detailsAppointment.price}</span>
                </div>

                {detailsAppointment.notes && (
                  <div className="bg-gray-50 p-2.5 rounded-lg border">
                    <span className="text-gray-500 block font-medium mb-0.5">Focus Area:</span>
                    <p className="text-gray-800">{detailsAppointment.notes}</p>
                  </div>
                )}

                {/* Meeting Link */}
                <div>
                  <span className="text-gray-500 block mb-1">Encrypted Telehealth Room:</span>
                  <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border">
                    <input
                      type="text"
                      readOnly
                      value={detailsAppointment.meetingLink || `https://meet.mindcare.org/room-${detailsAppointment.id}`}
                      className="bg-transparent font-mono text-xs text-gray-600 flex-1 outline-none"
                    />
                    <button
                      onClick={() => {
                        const link = detailsAppointment.meetingLink || `https://meet.mindcare.org/room-${detailsAppointment.id}`;
                        navigator.clipboard.writeText(link);
                        setCopiedId(detailsAppointment.id);
                        setTimeout(() => setCopiedId(null), 2000);
                        showToast('Room link copied!');
                      }}
                      className="text-teal-600 p-1"
                    >
                      {copiedId === detailsAppointment.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t bg-gray-50 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailsAppointment(null)}
                  className="flex-1 text-xs"
                >
                  Close
                </Button>
                {detailsAppointment.status === 'confirmed' && (
                  <Button
                    onClick={() => {
                      const link = detailsAppointment.meetingLink || `https://meet.mindcare.org/room-${detailsAppointment.id}`;
                      window.open(link, '_blank');
                    }}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                  >
                    Launch Telehealth Room
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          CLINICAL PROGRESS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-base text-gray-900">
                    Clinical Progress & Milestones Report
                  </h3>
                </div>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-gray-700 max-h-[70vh] overflow-y-auto">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-950 text-sm">Therapy Journey Overview</span>
                    <p className="text-[11px] text-purple-800">Cumulative progress across {completedCount} completed sessions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-purple-800">88%</span>
                    <p className="text-[10px] text-purple-600">Goal Achievement</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                    Clinical Notes & Coping Skills Logged
                  </h4>
                  {appointments.filter((a) => a.sessionNotes).map((a) => (
                    <div key={a.id} className="p-3 bg-gray-50 rounded-xl border space-y-1">
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>{a.counselorName}</span>
                        <span className="text-gray-400 font-normal">{a.date}</span>
                      </div>
                      <p className="text-gray-700 italic">"{a.sessionNotes}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
                <Button
                  onClick={() => setShowProgressModal(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  Close Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Appointments;