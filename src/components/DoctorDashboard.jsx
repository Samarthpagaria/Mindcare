import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  MessageCircle,
  Star,
  DollarSign,
  FileText,
  Bell,
  Settings,
  Video,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Send,
  BookOpen,
  Award
} from 'lucide-react';

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messageReply, setMessageReply] = useState('');

  const todayStats = {
    totalPatients: 147,
    todayAppointments: 8,
    completedSessions: 5,
    pendingMessages: 12,
    monthlyRevenue: 18450,
    averageRating: 4.9
  };

  const todayAppointments = [
    {
      id: '1',
      patientName: 'Sarah M.',
      patientInitials: 'SM',
      time: '9:00 AM',
      duration: '50 min',
      type: 'video',
      status: 'completed',
      isNewPatient: false
    },
    {
      id: '2',
      patientName: 'John D.',
      patientInitials: 'JD',
      time: '10:30 AM',
      duration: '50 min',
      type: 'in-person',
      status: 'completed',
      isNewPatient: true
    },
    {
      id: '3',
      patientName: 'Emily R.',
      patientInitials: 'ER',
      time: '2:00 PM',
      duration: '50 min',
      type: 'video',
      status: 'confirmed',
      isNewPatient: false
    },
    {
      id: '4',
      patientName: 'Michael K.',
      patientInitials: 'MK',
      time: '3:30 PM',
      duration: '50 min',
      type: 'video',
      status: 'confirmed',
      isNewPatient: false
    },
    {
      id: '5',
      patientName: 'Lisa T.',
      patientInitials: 'LT',
      time: '4:30 PM',
      duration: '50 min',
      type: 'phone',
      status: 'pending',
      isNewPatient: false
    }
  ];

  const patients = [
    {
      id: '1',
      name: 'Sarah Martinez',
      initials: 'SM',
      lastSession: 'Today, 9:00 AM',
      nextSession: 'Dec 16, 9:00 AM',
      sessionCount: 12,
      status: 'active',
      notes: 'Making good progress with anxiety management. Continue with CBT techniques.',
      primaryConcerns: ['Anxiety', 'Work Stress']
    },
    {
      id: '2',
      name: 'John Davis',
      initials: 'JD',
      lastSession: 'Today, 10:30 AM',
      nextSession: 'Dec 23, 10:30 AM',
      sessionCount: 1,
      status: 'new',
      notes: 'Initial consultation completed. Discussed depression symptoms and treatment options.',
      primaryConcerns: ['Depression', 'Sleep Issues']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      initials: 'ER',
      lastSession: 'Dec 2, 2:00 PM',
      nextSession: 'Today, 2:00 PM',
      sessionCount: 8,
      status: 'active',
      notes: 'Working on relationship communication patterns. Homework: practice active listening.',
      primaryConcerns: ['Relationship Issues', 'Communication']
    },
    {
      id: '4',
      name: 'Michael Kim',
      initials: 'MK',
      lastSession: 'Nov 25, 3:30 PM',
      nextSession: 'Today, 3:30 PM',
      sessionCount: 15,
      status: 'active',
      notes: 'Significant improvement in managing panic attacks. Exploring underlying trauma.',
      primaryConcerns: ['Panic Disorder', 'Trauma']
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      initials: 'LT',
      lastSession: 'Nov 18, 4:30 PM',
      nextSession: 'Today, 4:30 PM',
      sessionCount: 6,
      status: 'active',
      notes: 'Processing grief and loss. Continue supportive therapy approach.',
      primaryConcerns: ['Grief', 'Loss']
    }
  ];

  const messages = [
    {
      id: '1',
      from: 'Sarah Martinez',
      subject: 'Question about breathing exercises',
      preview: 'Hi Dr. Johnson, I wanted to ask about the breathing technique we discussed...',
      time: '2 hours ago',
      isRead: false,
      isUrgent: false
    },
    {
      id: '2',
      from: 'Platform Admin',
      subject: 'New patient referral',
      preview: 'You have received a new patient referral for anxiety treatment...',
      time: '4 hours ago',
      isRead: false,
      isUrgent: true
    },
    {
      id: '3',
      from: 'Michael Kim',
      subject: 'Appointment reschedule request',
      preview: 'Hello, I need to reschedule our session next week due to a work conflict...',
      time: '6 hours ago',
      isRead: true,
      isUrgent: false
    },
    {
      id: '4',
      from: 'Platform Support',
      subject: 'Monthly performance report',
      preview: 'Your November performance metrics are now available...',
      time: '1 day ago',
      isRead: true,
      isUrgent: false
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, Dr. Sarah Johnson</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              <Badge className="ml-1">3</Badge>
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{todayStats.totalPatients}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{todayStats.todayAppointments}</div>
              <div className="text-sm text-gray-600">Today's Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{todayStats.completedSessions}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{todayStats.pendingMessages}</div>
              <div className="text-sm text-gray-600">Messages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">${todayStats.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{todayStats.averageRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Schedule</span>
                    <Badge>{todayAppointments.length} sessions</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{appointment.patientInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.patientName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{appointment.time}</span>
                            <span>•</span>
                            <span>{appointment.duration}</span>
                            {appointment.isNewPatient && (
                              <Badge variant="outline" className="text-xs">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(appointment.type)}
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Messages</span>
                    <Badge variant="secondary">{messages.filter(m => !m.isRead).length} unread</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {messages.slice(0, 4).map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg border ${!message.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">{message.from}</p>
                            {message.isUrgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-800 mt-1">{message.subject}</p>
                          <p className="text-xs text-gray-600 mt-1">{message.preview}</p>
                        </div>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full">
                    View All Messages
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Add Patient</p>
                  <p className="text-sm text-gray-600">Register new patient</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Schedule Session</p>
                  <p className="text-sm text-gray-600">Book appointment</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Session Notes</p>
                  <p className="text-sm text-gray-600">View/Edit notes</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-medium">View Reports</p>
                  <p className="text-sm text-gray-600">Analytics & insights</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search patients..." className="pl-10 w-64" />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <div className="grid gap-4">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{patient.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg">{patient.name}</h3>
                              <Badge className={getStatusColor(patient.status)}>
                                {patient.status}
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <strong>Last Session:</strong> {patient.lastSession}
                              </div>
                              <div>
                                <strong>Next Session:</strong> {patient.nextSession}
                              </div>
                              <div>
                                <strong>Total Sessions:</strong> {patient.sessionCount}
                              </div>
                              <div>
                                <strong>Primary Concerns:</strong> {patient.primaryConcerns.join(', ')}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <strong>Notes:</strong> {patient.notes}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Previous Week</Button>
                <Button variant="outline">Next Week</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <h3 className="font-medium mb-4">{day}</h3>
                      <div className="space-y-2">
                        {index < 5 ? (
                          <>
                            <div className="bg-blue-100 p-2 rounded text-xs">
                              <div className="font-medium">9:00 AM</div>
                              <div>Sarah M.</div>
                            </div>
                            <div className="bg-green-100 p-2 rounded text-xs">
                              <div className="font-medium">11:00 AM</div>
                              <div>John D.</div>
                            </div>
                            <div className="bg-purple-100 p-2 rounded text-xs">
                              <div className="font-medium">2:00 PM</div>
                              <div>Emily R.</div>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-xs">No sessions</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <div className="flex space-x-2">
                      <Input placeholder="Search messages..." />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {messages.map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${!message.isRead ? 'border-l-4 border-blue-500' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-sm">{message.from}</p>
                              {message.isUrgent && (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-800 mt-1">{message.subject}</p>
                            <p className="text-xs text-gray-600 mt-1">{message.preview}</p>
                            <p className="text-xs text-gray-500 mt-2">{message.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Message Thread</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Sarah Martinez</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <p className="text-sm">
                        Hi Dr. Johnson, I wanted to ask about the breathing technique we discussed in our last session. 
                        I've been practicing it, but I'm not sure if I'm doing it correctly. Could you provide some 
                        additional guidance?
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={messageReply}
                        onChange={(e) => setMessageReply(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Attach
                          </Button>
                        </div>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+12%</div>
                  <div className="text-sm text-gray-600">Patient Growth</div>
                  <div className="text-xs text-gray-500 mt-1">vs last month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">4.9</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                  <div className="text-xs text-gray-500 mt-1">89 reviews</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-600">On-Time Rate</div>
                  <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-xs text-gray-500 mt-1">Treatment completion</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Detailed Analytics Coming Soon
                </h3>
                <p className="text-gray-500">
                  We're working on comprehensive analytics including patient progress tracking, 
                  session outcomes, and performance insights.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}