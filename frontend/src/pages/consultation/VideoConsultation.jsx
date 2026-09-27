import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Info,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function VideoConsultation() {
  const { roomId } = useParams();
  const { user, isDoctor } = useAuth();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Initializing Media...');
  const [callDuration, setCallDuration] = useState(0);
  const [mediaError, setMediaError] = useState('');

  // ICE Servers (Google STUN for peer discovery)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    let timerInterval;

    const startCall = async () => {
      try {
        setConnectionStatus('Requesting Camera & Microphone Access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setConnectionStatus('Media Stream Ready. Ready for P2P Consultation.');

        // Initialize WebRTC Peer Connection
        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Add local media tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle remote stream reception
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionStatus('P2P Video Connection Active');
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setConnectionStatus('Connected (Peer-to-Peer Encrypted)');
          } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
            setConnectionStatus('Peer Disconnected');
          }
        };

        // Start call duration timer
        timerInterval = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

      } catch (err) {
        console.warn('Camera/Mic access error:', err);
        setMediaError('Could not access camera/microphone. Please ensure browser permissions are granted.');
        setConnectionStatus('Media Access Required');
      }
    };

    startCall();

    return () => {
      // Clean up media tracks and connection when exiting room
      if (timerInterval) clearInterval(timerInterval);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (isDoctor) {
      navigate('/doctor/records/new', { state: { consultationId: roomId.replace(/\D/g, '') } });
    } else {
      navigate('/patient/consultations');
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Consultation Room Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={22} color="var(--primary)" />
            Telemedicine Consultation Room
          </h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Room ID: <code>{roomId}</code> • Participant: {user?.fullName} ({isDoctor ? 'Doctor' : 'Patient'})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: '#f1f5f9'
          }}>
            ⏱ {formatTime(callDuration)}
          </div>
          <span className="badge badge-info">{connectionStatus}</span>
        </div>
      </div>

      {mediaError && (
        <div className="alert-box alert-danger">
          <Info size={18} />
          <span>{mediaError}</span>
        </div>
      )}

      {/* Video feeds viewport */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Main Video Screen */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Remote Video Container */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Placeholder if remote peer has not connected yet */}
          <div style={{
            position: 'absolute',
            textAlign: 'center',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}>
            <Users size={48} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              {isDoctor ? 'Waiting for patient to connect...' : 'Waiting for doctor to connect...'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
              WebRTC peer discovery via Google STUN servers
            </div>
          </div>

          {/* Local PiP Preview */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '180px',
            height: '120px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Mirror local view
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '6px',
              color: 'white',
              fontSize: '0.65rem',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}>
              You ({isVideoOn ? 'Video On' : 'Muted'})
            </div>
          </div>

          {/* Bottom Floating Call Controls */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.75rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(8px)'
          }}>
            <button
              onClick={toggleAudio}
              className={`btn btn-sm ${isAudioOn ? 'btn-secondary' : 'btn-danger'}`}
              style={{ borderRadius: '9999px', width: '40px', height: '40px', padding: 0 }}
              title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isAudioOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`btn btn-sm ${isVideoOn ? 'btn-secondary' : 'btn-danger'}`}
              style={{ borderRadius: '9999px', width: '40px', height: '40px', padding: 0 }}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              onClick={endCall}
              className="btn btn-danger btn-sm"
              style={{ borderRadius: '9999px', padding: '0 1.25rem', fontWeight: 600 }}
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Side Panel: Consultation notes & technical viva architecture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">
                <ShieldCheck size={16} color="var(--success)" />
                Security & Peer Encryption
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              WebRTC establishes direct browser-to-browser peer media transport via DTLS-SRTP.
              Audio and video streams are end-to-end encrypted and do not pass through application database servers.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={16} color="var(--primary)" />
                Doctor Action
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              When the consultation concludes, clicking <strong>End Call</strong> will transition the consultation to complete and open the digital prescription pad.
            </p>
            {isDoctor && (
              <button
                onClick={endCall}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                Complete & Write Prescription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
