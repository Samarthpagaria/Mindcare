// server/services/100msService.js
const axios = require('axios');

const HMS_APP_ACCESS_KEY = process.env.HMS_APP_ACCESS_KEY;
const HMS_APP_SECRET = process.env.HMS_APP_SECRET;
const HMS_MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;

// Create axios instance for 100ms API calls
const hmsClient = axios.create({
  baseURL: 'https://api.100ms.live/v2',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add management token to requests if available
if (HMS_MANAGEMENT_TOKEN) {
  hmsClient.defaults.headers.common['Authorization'] = `Bearer ${HMS_MANAGEMENT_TOKEN}`;
}

// Generate management token (alternative to using pre-generated token)
const generateManagementToken = () => {
  // This is a simplified version - in production, use proper JWT generation
  // Refer to: https://www.100ms.live/docs/server-side/v2/how-to-guides/configure-room-templates
  const jwt = require('jsonwebtoken');
  
  const payload = {
    access_key: HMS_APP_ACCESS_KEY,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, HMS_APP_SECRET, {
    algorithm: 'HS256',
    expiresIn: '24h',
    jwtid: 'unique-id'
  });
};

// Create a new room for an appointment
const createHMSRoom = async (roomCode, description) => {
  try {
    // Ensure we have a valid token
    if (!HMS_MANAGEMENT_TOKEN) {
      const token = generateManagementToken();
      hmsClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const response = await hmsClient.post('/rooms', {
      name: roomCode,
      description: description,
      template_id: process.env.HMS_TEMPLATE_ID, // Pre-configured template
      region: process.env.HMS_REGION || 'us', // or appropriate region
    });
    
    return response.data;
  } catch (error) {
    console.error('HMS Room creation error:', error.response?.data || error.message);
    throw new Error('Failed to create meeting room: ' + (error.response?.data?.message || error.message));
  }
};

// Generate join token for a user using 100ms token API
const createHMSToken = async (roomId, userId, role) => {
  try {
    // Generate a token using the 100ms token generation API
    // Refer to: https://www.100ms.live/docs/server-side/v2/how-to-guides/generate-tokens
    const response = await axios.post('https://prod-in.100ms.live/hmsapi/your-app-domain.com/api/token', {
      room_id: roomId,
      user_id: userId,
      role: role
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`
      }
    });

    return response.data.token;
  } catch (error) {
    console.error('HMS Token generation error:', error.response?.data || error.message);
    
    // Fallback: Generate token manually if API call fails
    try {
      const jwt = require('jsonwebtoken');
      
      const payload = {
        access_key: HMS_APP_ACCESS_KEY,
        room_id: roomId,
        user_id: userId,
        role: role,
        type: 'app',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000)
      };

      const token = jwt.sign(payload, HMS_APP_SECRET, {
        algorithm: 'HS256',
        expiresIn: '24h',
        jwtid: 'unique-id'
      });

      return token;
    } catch (jwtError) {
      console.error('JWT Token generation error:', jwtError);
      throw new Error('Failed to generate meeting token');
    }
  }
};

// Get room information
const getRoomInfo = async (roomId) => {
  try {
    const response = await hmsClient.get(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('HMS Room info error:', error.response?.data || error.message);
    throw new Error('Failed to get room information');
  }
};

// Enable/disable recording for a room
const toggleRecording = async (roomId, enabled = true) => {
  try {
    const response = await hmsClient.post(`/rooms/${roomId}/recording`, {
      enabled
    });
    return response.data;
  } catch (error) {
    console.error('HMS Recording toggle error:', error.response?.data || error.message);
    throw new Error('Failed to toggle recording');
  }
};

// Get active peers in a room
const getActivePeers = async (roomId) => {
  try {
    const response = await hmsClient.get(`/rooms/${roomId}/active-peers`);
    return response.data;
  } catch (error) {
    console.error('HMS Active peers error:', error.response?.data || error.message);
    throw new Error('Failed to get active peers');
  }
};

// Send session report (for analytics)
const sendSessionReport = async (roomId, sessionData) => {
  try {
    const response = await hmsClient.post(`/rooms/${roomId}/session-report`, sessionData);
    return response.data;
  } catch (error) {
    console.error('HMS Session report error:', error.response?.data || error.message);
    // Don't throw error for analytics failures
    console.log('Session report failed, but continuing operation');
  }
};

module.exports = {
  createHMSRoom,
  createHMSToken,
  getRoomInfo,
  toggleRecording,
  getActivePeers,
  sendSessionReport
};