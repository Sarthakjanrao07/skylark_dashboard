import { useState } from "react";
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  FormHelperText
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email) {
      setError("All fields are required");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    setError("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        p: 2
      }}
    >
      <Paper 
        elevation={10} 
        sx={{ 
          padding: 4, 
          width: { xs: '90%', sm: 450 },
          borderRadius: 3,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            width={70} 
            height={70} 
            borderRadius="50%" 
            bgcolor="primary.main"
            mb={2}
          >
            <HowToRegIcon fontSize="large" sx={{ color: 'white' }} />
          </Box>
          <Typography 
            variant="h4" 
            align="center" 
            fontWeight="bold"
            color="primary.main"
            gutterBottom
          >
            Create Account
          </Typography>
          <Typography 
            variant="body2" 
            align="center" 
            color="text.secondary"
          >
            Sign up to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth margin="normal">
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="dense"
            type="email"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="dense"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormHelperText>Must be at least 6 characters</FormHelperText>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="dense"
            type={showConfirmPassword ? "text" : "password"}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ 
            mt: 3, 
            mb: 2, 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
          onClick={handleRegister}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "Creating Account..." : "Register"}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/login")}
              fontWeight="bold"
              color="primary"
              underline="hover"
            >
              Login
            </Link>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="caption" color="text.secondary">
            © 2025 Your Company. All rights reserved.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}