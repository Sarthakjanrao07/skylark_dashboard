// import { useState, useEffect } from "react";
// import { 
//   TextField, 
//   Button, 
//   Typography, 
//   Box, 
//   Paper, 
//   Link,
//   InputAdornment,
//   IconButton,
//   CircularProgress,
//   Alert,
//   FormControl,
//   FormHelperText
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import EmailIcon from '@mui/icons-material/Email';
// import LockResetIcon from '@mui/icons-material/LockReset';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isMounted, setIsMounted] = useState(true);
//   const navigate = useNavigate();

//   // Ensure component is mounted before setting state
//   useEffect(() => {
//     setIsMounted(true);
//     return () => {
//       setIsMounted(false);
//     };
//   }, []);

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Reset states
//     if (isMounted) {
//       setError("");
//       setLoading(true);
//     }
    
//     // Validate email
//     if (!email) {
//       if (isMounted) {
//         setError("Email is required");
//         setLoading(false);
//       }
//       return;
//     }
    
//     if (!validateEmail(email)) {
//       if (isMounted) {
//         setError("Please enter a valid email address");
//         setLoading(false);
//       }
//       return;
//     }
    
//     try {
//       // Simulate API call - replace with your actual API endpoint
//       const res = await fetch("http://localhost:3000/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });
      
//       const data = await res.json();
      
//       if (res.ok) {
//         if (isMounted) {
//           setSuccess(true);
//         }
//       } else {
//         if (isMounted) {
//           setError(data.error || "Failed to send reset link");
//         }
//       }
//     } catch (err) {
//       console.error("Forgot password error:", err);
//       if (isMounted) {
//         setError("Server error. Please try again later.");
//       }
//     } finally {
//       if (isMounted) {
//         setLoading(false);
//       }
//     }
//   };

//   const handleBackToLogin = () => {
//     navigate("/login");
//   };

//   // Show loading spinner while component is initializing
//   if (!isMounted) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         minHeight="100vh"
//         sx={{
//           background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       display="flex"
//       justifyContent="center"
//       alignItems="center"
//       minHeight="100vh"
//       sx={{
//         background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
//         p: 2
//       }}
//     >
//       <Paper 
//         elevation={10} 
//         sx={{ 
//           padding: 4, 
//           width: { xs: '90%', sm: 450 },
//           borderRadius: 3,
//           boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
//         }}
//       >
//         <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
//           <Box 
//             display="flex" 
//             justifyContent="center" 
//             alignItems="center" 
//             width={70} 
//             height={70} 
//             borderRadius="50%" 
//             bgcolor="primary.main"
//             mb={2}
//           >
//             <LockResetIcon fontSize="large" sx={{ color: 'white' }} />
//           </Box>
//           <Typography 
//             variant="h4" 
//             align="center" 
//             fontWeight="bold"
//             color="primary.main"
//             gutterBottom
//           >
//             Forgot Password
//           </Typography>
//           <Typography 
//             variant="body2" 
//             align="center" 
//             color="text.secondary"
//           >
//             Enter your email to receive a password reset link
//           </Typography>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {error}
//           </Alert>
//         )}

//         {success ? (
//           <Box sx={{ textAlign: 'center', py: 2 }}>
//             <Alert severity="success" sx={{ mb: 3 }}>
//               Password reset link sent! Check your email.
//             </Alert>
//             <Typography variant="body2" color="text.secondary" mb={3}>
//               We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
//             </Typography>
//             <Button
//               variant="contained"
//               fullWidth
//               size="large"
//               sx={{ 
//                 py: 1.5,
//                 borderRadius: 2,
//                 fontWeight: 'bold',
//                 boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
//               }}
//               onClick={handleBackToLogin}
//             >
//               Back to Login
//             </Button>
//           </Box>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <FormControl fullWidth margin="normal" error={!!error}>
//               <TextField
//                 label="Email Address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 fullWidth
//                 margin="dense"
//                 type="email"
//                 variant="outlined"
//                 required
//                 disabled={loading}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <EmailIcon color="primary" />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               {error && <FormHelperText>{error}</FormHelperText>}
//             </FormControl>

//             <Button
//               type="submit"
//               variant="contained"
//               fullWidth
//               size="large"
//               sx={{ 
//                 mt: 3, 
//                 mb: 2, 
//                 py: 1.5,
//                 borderRadius: 2,
//                 fontWeight: 'bold',
//                 boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
//               }}
//               disabled={loading}
//               startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
//             >
//               {loading ? "Sending..." : "Send Reset Link"}
//             </Button>
//           </form>
//         )}

//         <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
//           <Link
//             component="button"
//             variant="body2"
//             onClick={handleBackToLogin}
//             color="primary"
//             underline="hover"
//             sx={{ display: 'flex', alignItems: 'center' }}
//           >
//             <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
//             Back to Login
//           </Link>
//         </Box>

//         <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
//           <Typography variant="caption" color="text.secondary">
//             © 2025 Your Company. All rights reserved.
//           </Typography>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }