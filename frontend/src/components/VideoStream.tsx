// import { useEffect, useRef, useState } from 'react';
// import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
// import FullscreenIcon from '@mui/icons-material/Fullscreen';
// import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// interface VideoStreamProps {
//   camera: {
//     id: number;
//     name: string;
//     enabled: boolean;
//     streamUrl?: string;
//   };
// }

// const VideoStream = ({ camera }: VideoStreamProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

//   useEffect(() => {
//     if (!camera.enabled || !camera.streamUrl) {
//       setIsLoading(false);
//       return;
//     }

//     const setupWebRTC = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         // Create peer connection
//         const peerConnection = new RTCPeerConnection({
//           iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//         });
//         peerConnectionRef.current = peerConnection;

//         // Handle incoming tracks
//         peerConnection.ontrack = (event) => {
//           if (videoRef.current) {
//             videoRef.current.srcObject = event.streams[0];
//             setIsLoading(false);
//           }
//         };

//         // Create offer
//         const offer = await peerConnection.createOffer();
//         await peerConnection.setLocalDescription(offer);

//         // Send offer to MediaMTX
//         const response = await fetch(camera.streamUrl, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/sdp' },
//           body: offer.sdp
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to get stream: ${response.status}`);
//         }

//         // Set remote description
//         const answer = await response.text();
//         await peerConnection.setRemoteDescription({
//           type: 'answer',
//           sdp: answer
//         });

//       } catch (err) {
//         console.error('WebRTC error:', err);
//         setError(`Stream error: ${err instanceof Error ? err.message : 'Unknown error'}`);
//         setIsLoading(false);
//       }
//     };

//     setupWebRTC();

//     // Cleanup
//     return () => {
//       if (peerConnectionRef.current) {
//         peerConnectionRef.current.close();
//         peerConnectionRef.current = null;
//       }
//     };
//   }, [camera.enabled, camera.streamUrl]);

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement && videoRef.current) {
//       videoRef.current.requestFullscreen();
//       setIsFullscreen(true);
//     } else {
//       document.exitFullscreen();
//       setIsFullscreen(false);
//     }
//   };

//   return (
//     <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#000' }}>
//       {isLoading && (
//         <Box sx={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: 'rgba(0, 0, 0, 0.7)',
//           zIndex: 10
//         }}>
//           <CircularProgress />
//           <Typography sx={{ ml: 2, color: 'white' }}>
//             Connecting to stream...
//           </Typography>
//         </Box>
//       )}

//       {error && (
//         <Box sx={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: 'rgba(0, 0, 0, 0.8)',
//           zIndex: 10,
//           p: 2
//         }}>
//           <Typography color="error" textAlign="center">
//             {error}
//           </Typography>
//         </Box>
//       )}

//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         style={{
//           width: '100%',
//           height: '100%',
//           objectFit: 'cover'
//         }}
//       />

//       {camera.enabled && !isLoading && !error && (
//         <IconButton
//           sx={{
//             position: 'absolute',
//             bottom: 8,
//             right: 8,
//             bgcolor: 'rgba(0, 0, 0, 0.5)',
//             color: 'white',
//             '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
//           }}
//           onClick={toggleFullscreen}
//         >
//           {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
//         </IconButton>
//       )}
//     </Box>
//   );
// };

// export default VideoStream;