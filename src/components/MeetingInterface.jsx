// client/src/components/MeetingInterface.js
import React, { useState, useEffect } from 'react';
import { getMeetingToken } from '../services/api';

const MeetingInterface = ({ appointmentId }) => {
  const [token, setToken] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize 100ms SDK when component mounts
    if (window.HMS) {
      // SDK is already loaded
      return;
    }
    
    // Load 100ms SDK dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.100ms.live/web/v2/index.js';
    script.async = true;
    script.onload = () => {
      console.log('100MS SDK loaded');
    };
    document.body.appendChild(script);
    
    return () => {
      // Clean up
      if (window.HMS && window.hmsStore) {
        window.HMS.disconnect();
      }
    };
  }, []);

  const joinMeeting = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get meeting token from backend
      const response = await getMeetingToken(appointmentId);
      setToken(response.token);
      setRoomId(response.roomId);
      
      // Initialize and join the meeting
      if (window.HMS) {
        const hms = new window.HMS();
        
        // Configure HMS
        const config = {
          authToken: response.token,
          username: 'User', // You can customize this based on user data
          settings: {
            isVideoMuted: false,
            isAudioMuted: false,
          },
          rememberDeviceSelection: true,
        };
        
        // Join the room
        await hms.join(config);
        
        // You can now access hms.actions and hms.store for further control
      } else {
        setError('Meeting SDK failed to load');
      }
    } catch (err) {
      console.error('Failed to join meeting:', err);
      setError('Failed to join the meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveMeeting = async () => {
    if (window.HMS && window.hmsStore) {
      await window.HMS.disconnect();
      setToken(null);
      setRoomId(null);
    }
  };

  return (
    <div className="meeting-interface">
      <h3>Virtual Appointment</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {!token ? (
        <button 
          onClick={joinMeeting} 
          disabled={isLoading}
          className="join-button"
        >
          {isLoading ? 'Joining...' : 'Join Meeting'}
        </button>
      ) : (
        <div className="meeting-active">
          <div id="meeting-container"></div>
          <button onClick={leaveMeeting} className="leave-button">
            Leave Meeting
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingInterface;