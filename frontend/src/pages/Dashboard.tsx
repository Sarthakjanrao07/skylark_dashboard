import { useEffect, useState } from "react";
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  Grid,
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  CardHeader,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Fab,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  List as MuiList,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CardActionArea,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Snackbar,
  CardActions,
  Collapse,
  Zoom,
  Backdrop,
  Modal
} from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import VideocamIcon from '@mui/icons-material/Videocam';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RefreshIcon from '@mui/icons-material/Refresh';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingButton from '@mui/lab/LoadingButton';

// Updated Camera interface to match backend
interface Camera {
  id: number;
  name: string;
  location?: string;
  enabled: boolean; // This represents online/offline status
  rtspUrl?: string;
}

// Updated Alert interface to match backend
interface Alert {
  id: number;
  message: string;
  cameraId: number;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [cameraForm, setCameraForm] = useState({
    name: '',
    location: '',
    rtspUrl: '',
    enabled: true
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expandedCameraId, setExpandedCameraId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);
  
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const token = localStorage.getItem("token");

  const fetchCameras = async () => {
    try {
      const res = await fetch("http://localhost:3000/cameras", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setCameras(data);
      } else {
        setError("Failed to fetch cameras");
      }
    } catch (err) {
      setError("Network error while fetching cameras");
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://localhost:3000/alerts", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      } else {
        setError("Failed to fetch alerts");
      }
    } catch (err) {
      setError("Network error while fetching alerts");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchCameras(), fetchAlerts()]).then(() => {
      setLoading(false);
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFullscreen = (cameraId: number) => {
    if (fullscreenCamera === cameraId) {
      setFullscreenCamera(null);
    } else {
      setFullscreenCamera(cameraId);
    }
  };

  const handleStatClick = (stat: string) => {
    if (stat === 'alerts') {
      setTabValue(1);
    }
  };

  const handleCreateCamera = () => {
    setEditingCamera(null);
    setCameraForm({
      name: '',
      location: '',
      rtspUrl: '',
      enabled: true
    });
    setCameraDialogOpen(true);
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setCameraForm({
      name: camera.name,
      location: camera.location || '',
      rtspUrl: camera.rtspUrl || '',
      enabled: camera.enabled
    });
    setCameraDialogOpen(true);
  };

  const handleDeleteCameraClick = (camera: Camera) => {
    setCameraToDelete(camera);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cameraToDelete) return;
    
    setDeleteLoading(cameraToDelete.id);
    try {
      const res = await fetch(`http://localhost:3000/cameras/${cameraToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Remove camera from state
        setCameras(prevCameras => prevCameras.filter(camera => camera.id !== cameraToDelete.id));
        // Remove alerts for this camera
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.cameraId !== cameraToDelete.id));
        
        setSnackbarMessage('Camera deleted successfully');
        setSnackbarOpen(true);
        setConfirmDeleteOpen(false);
        setCameraToDelete(null);
      } else {
        const errorData = await res.json();
        setSnackbarMessage(errorData.error || "Failed to delete camera");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Network error while deleting camera");
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaveCamera = async () => {
    setSaveLoading(true);
    try {
      if (!cameraForm.name.trim()) {
        setSnackbarMessage("Camera name is required");
        setSnackbarOpen(true);
        setSaveLoading(false);
        return;
      }

      if (!cameraForm.rtspUrl.trim()) {
        setSnackbarMessage("RTSP URL is required");
        setSnackbarOpen(true);
        setSaveLoading(false);
        return;
      }

      const url = editingCamera 
        ? `http://localhost:3000/cameras/${editingCamera.id}`
        : 'http://localhost:3000/cameras';
      
      const method = editingCamera ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cameraForm)
      });
      
      if (res.ok) {
        const savedCamera = await res.json();
        
        if (editingCamera) {
          // Update existing camera in state
          setCameras(prevCameras => 
            prevCameras.map(camera => 
              camera.id === editingCamera.id ? savedCamera : camera
            )
          );
          setSnackbarMessage('Camera updated successfully');
        } else {
          // Add new camera to state
          setCameras(prevCameras => [...prevCameras, savedCamera]);
          setSnackbarMessage('Camera created successfully');
        }
        
        setCameraDialogOpen(false);
        setSnackbarOpen(true);
      } else {
        const errorData = await res.json();
        setSnackbarMessage(errorData.error || "Failed to save camera");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Network error while saving camera");
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleCamera = async (cameraId: number, enabled: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/cameras/${cameraId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });
      
      if (res.ok) {
        const updatedCamera = await res.json();
        setCameras(prevCameras => 
          prevCameras.map(camera => 
            camera.id === cameraId ? updatedCamera : camera
          )
        );
        setSnackbarMessage(`Camera ${enabled ? 'enabled' : 'disabled'} successfully`);
        setSnackbarOpen(true);
      } else {
        const errorData = await res.json();
        setSnackbarMessage(errorData.error || "Failed to toggle camera");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage("Network error while toggling camera");
      setSnackbarOpen(true);
    }
  };

  const toggleExpandCamera = (cameraId: number) => {
    setExpandedCameraId(expandedCameraId === cameraId ? null : cameraId);
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchCameras(), fetchAlerts()]);
      setLoading(false);
    };

    initializeData();

    const ws = new WebSocket("ws://localhost:3001");
    
    ws.onopen = () => {
      setWsConnected(true);
    };
    
    ws.onclose = () => {
      setWsConnected(false);
    };
    
    ws.onmessage = (event) => {
      const alert: Alert = JSON.parse(event.data);
      setAlerts((prev) => [alert, ...prev]);
    };
    
    ws.onerror = () => {
      setWsConnected(false);
    };
    
    return () => {
      ws.close();
    };
  }, []);

  // Filter cameras based on search term and status
  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (camera.location && camera.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'online' && camera.enabled) || 
                          (statusFilter === 'offline' && !camera.enabled);
    return matchesSearch && matchesStatus;
  });

  // Get alerts for a specific camera
  const getCameraAlerts = (cameraId: number) => {
    return alerts.filter(a => a.cameraId === cameraId);
  };

  // Get total alerts count
  const totalAlerts = alerts.length;
  const onlineCameras = cameras.filter(c => c.enabled).length;
  const offlineCameras = cameras.filter(c => !c.enabled).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Pagination for alerts table
  const paginatedAlerts = alerts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Sidebar items
  const sidebarItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Cameras', icon: <CameraAltIcon /> },
    { text: 'Alert History', icon: <HistoryIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isDesktop ? (
        <Paper
          elevation={1}
          sx={{
            width: sidebarOpen ? 240 : 60,
            transition: 'width 0.3s',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Toolbar>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              {sidebarOpen && <Typography variant="h6">Security Hub</Typography>}
              <IconButton onClick={toggleSidebar}>
                {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Box>
          </Toolbar>
          <Divider />
          <MuiList>
            {sidebarItems.map((item) => (
              <ListItemButton key={item.text} selected={item.text === 'Dashboard'}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.text} />}
              </ListItemButton>
            ))}
          </MuiList>
          <Box flexGrow={1} />
          <Divider />
          <Box p={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              {sidebarOpen ? 'Logout' : ''}
            </Button>
          </Box>
        </Paper>
      ) : (
        <SwipeableDrawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpen={() => setSidebarOpen(true)}
        >
          <Box
            sx={{ width: 240 }}
            role="presentation"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => setSidebarOpen(false)}
          >
            <Toolbar>
              <Typography variant="h6">Security Hub</Typography>
            </Toolbar>
            <Divider />
            <MuiList>
              {sidebarItems.map((item) => (
                <ListItemButton key={item.text} selected={item.text === 'Dashboard'}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </MuiList>
            <Box flexGrow={1} />
            <Divider />
            <Box p={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </SwipeableDrawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            {!isDesktop && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleSidebar}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Security Camera Dashboard
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box display="flex" alignItems="center">
                {wsConnected ? (
                  <WifiIcon color="success" />
                ) : (
                  <WifiOffIcon color="error" />
                )}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {wsConnected ? "Live" : "Disconnected"}
                </Typography>
              </Box>
              <Badge badgeContent={totalAlerts} color="error">
                <NotificationsIcon />
              </Badge>
              <Tooltip title="Refresh Data">
                <IconButton color="inherit" onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Overview - Improved for equal distribution and interactivity */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>System Overview</Typography>
            <Grid container spacing={3} justifyContent="center">
              {/* Total Cameras */}
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={300}>
                  <Card 
                    elevation={hoveredStat === 'cameras' ? 8 : 3} 
                    sx={{ 
                      height: 200, 
                      borderRadius: 2, 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
                      cursor: 'pointer',
                      bgcolor: hoveredStat === 'cameras' ? 'primary.light' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        bgcolor: 'primary.light',
                        color: 'white'
                      }
                    }}
                    onMouseEnter={() => setHoveredStat('cameras')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <CardActionArea sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: hoveredStat === 'cameras' ? 'white' : 'primary.main', 
                          mb: 2,
                          color: hoveredStat === 'cameras' ? 'primary.main' : 'white'
                        }}
                      >
                        <VideocamIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color={hoveredStat === 'cameras' ? 'white' : 'primary.main'}>
                        {cameras.length}
                      </Typography>
                      <Typography variant="h6" color={hoveredStat === 'cameras' ? 'white' : 'text.secondary'}>
                        Total Cameras
                      </Typography>
                      <Box mt={1} display="flex" alignItems="center">
                        <TrendingUpIcon color={hoveredStat === 'cameras' ? 'inherit' : 'success'} fontSize="small" />
                        <Typography variant="body2" color={hoveredStat === 'cameras' ? 'white' : 'success.main'} ml={0.5}>
                          Active
                        </Typography>
                      </Box>
                      {hoveredStat === 'cameras' && (
                        <Box mt={1}>
                          <Typography variant="body2" color="white">
                            View all cameras
                          </Typography>
                          <ArrowForwardIcon fontSize="small" />
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Grow>
              </Grid>
              
              {/* Online Cameras */}
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={500}>
                  <Card 
                    elevation={hoveredStat === 'online' ? 8 : 3} 
                    sx={{ 
                      height: 200, 
                      borderRadius: 2, 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
                      cursor: 'pointer',
                      bgcolor: hoveredStat === 'online' ? 'success.light' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        bgcolor: 'success.light',
                        color: 'white'
                      }
                    }}
                    onMouseEnter={() => setHoveredStat('online')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <CardActionArea sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: hoveredStat === 'online' ? 'white' : 'success.main', 
                          mb: 2,
                          color: hoveredStat === 'online' ? 'success.main' : 'white'
                        }}
                      >
                        <CheckCircleIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color={hoveredStat === 'online' ? 'white' : 'success.main'}>
                        {onlineCameras}
                      </Typography>
                      <Typography variant="h6" color={hoveredStat === 'online' ? 'white' : 'text.secondary'}>
                        Online Cameras
                      </Typography>
                      <Box mt={1} display="flex" alignItems="center">
                        <TrendingUpIcon color={hoveredStat === 'online' ? 'inherit' : 'success'} fontSize="small" />
                        <Typography variant="body2" color={hoveredStat === 'online' ? 'white' : 'success.main'} ml={0.5}>
                          {cameras.length > 0 ? Math.round((onlineCameras / cameras.length) * 100) : 0}% of total
                        </Typography>
                      </Box>
                      {hoveredStat === 'online' && (
                        <Box mt={1}>
                          <Typography variant="body2" color="white">
                            View online cameras
                          </Typography>
                          <ArrowForwardIcon fontSize="small" />
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Grow>
              </Grid>
              
              {/* Total Alerts */}
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={700}>
                  <Card 
                    elevation={hoveredStat === 'alerts' ? 8 : 3} 
                    sx={{ 
                      height: 200, 
                      borderRadius: 2, 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
                      cursor: 'pointer',
                      bgcolor: hoveredStat === 'alerts' ? 'warning.light' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        bgcolor: 'warning.light',
                        color: 'white'
                      }
                    }}
                    onMouseEnter={() => setHoveredStat('alerts')}
                    onMouseLeave={() => setHoveredStat(null)}
                    onClick={() => handleStatClick('alerts')}
                  >
                    <CardActionArea sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: hoveredStat === 'alerts' ? 'white' : 'warning.main', 
                          mb: 2,
                          color: hoveredStat === 'alerts' ? 'warning.main' : 'white'
                        }}
                      >
                        <NotificationsIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color={hoveredStat === 'alerts' ? 'white' : 'warning.main'}>
                        {totalAlerts}
                      </Typography>
                      <Typography variant="h6" color={hoveredStat === 'alerts' ? 'white' : 'text.secondary'}>
                        Total Alerts
                      </Typography>
                      <Box mt={1} display="flex" alignItems="center">
                        {totalAlerts > 0 ? (
                          <>
                            <TrendingUpIcon color={hoveredStat === 'alerts' ? 'inherit' : 'warning'} fontSize="small" />
                            <Typography variant="body2" color={hoveredStat === 'alerts' ? 'white' : 'warning.main'} ml={0.5}>
                              Active
                            </Typography>
                          </>
                        ) : (
                          <>
                            <TrendingDownIcon color={hoveredStat === 'alerts' ? 'inherit' : 'success'} fontSize="small" />
                            <Typography variant="body2" color={hoveredStat === 'alerts' ? 'white' : 'success.main'} ml={0.5}>
                              All Clear
                            </Typography>
                          </>
                        )}
                      </Box>
                      {hoveredStat === 'alerts' && (
                        <Box mt={1}>
                          <Typography variant="body2" color="white">
                            View all alerts
                          </Typography>
                          <ArrowForwardIcon fontSize="small" />
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Grow>
              </Grid>
              
              {/* Offline Cameras */}
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={900}>
                  <Card 
                    elevation={hoveredStat === 'offline' ? 8 : 3} 
                    sx={{ 
                      height: 200, 
                      borderRadius: 2, 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s, background-color 0.3s',
                      cursor: 'pointer',
                      bgcolor: hoveredStat === 'offline' ? 'error.light' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        bgcolor: 'error.light',
                        color: 'white'
                      }
                    }}
                    onMouseEnter={() => setHoveredStat('offline')}
                    onMouseLeave={() => setHoveredStat(null)}
                  >
                    <CardActionArea sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Avatar 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: hoveredStat === 'offline' ? 'white' : 'error.main', 
                          mb: 2,
                          color: hoveredStat === 'offline' ? 'error.main' : 'white'
                        }}
                      >
                        <ErrorIcon fontSize="large" />
                      </Avatar>
                      <Typography variant="h3" fontWeight="bold" color={hoveredStat === 'offline' ? 'white' : 'error.main'}>
                        {offlineCameras}
                      </Typography>
                      <Typography variant="h6" color={hoveredStat === 'offline' ? 'white' : 'text.secondary'}>
                        Offline Cameras
                      </Typography>
                      <Box mt={1} display="flex" alignItems="center">
                        {offlineCameras > 0 ? (
                          <>
                            <TrendingUpIcon color={hoveredStat === 'offline' ? 'inherit' : 'error'} fontSize="small" />
                            <Typography variant="body2" color={hoveredStat === 'offline' ? 'white' : 'error.main'} ml={0.5}>
                              Needs Attention
                            </Typography>
                          </>
                        ) : (
                          <>
                            <TrendingDownIcon color={hoveredStat === 'offline' ? 'inherit' : 'success'} fontSize="small" />
                            <Typography variant="body2" color={hoveredStat === 'offline' ? 'white' : 'success.main'} ml={0.5}>
                              All Operational
                            </Typography>
                          </>
                        )}
                      </Box>
                      {hoveredStat === 'offline' && (
                        <Box mt={1}>
                          <Typography variant="body2" color="white">
                            View offline cameras
                          </Typography>
                          <ArrowForwardIcon fontSize="small" />
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Grow>
              </Grid>
            </Grid>
          </Box>

          {/* Tabs for different views */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
              <Tab label="Camera Grid" />
              <Tab label="Alert History" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Search and Filter Controls */}
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search cameras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <IconButton type="button" sx={{ p: '10px' }}>
                  <SearchIcon />
                </IconButton>
              </Paper>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Camera Grid */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Camera Feeds</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateCamera}
              >
                Add Camera
              </Button>
            </Box>
            <Grid container spacing={3}>
              {filteredCameras.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6">No cameras found</Typography>
                    <Typography variant="body2">Try adjusting your search or filter criteria</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={handleCreateCamera}
                    >
                      Add Your First Camera
                    </Button>
                  </Paper>
                </Grid>
              ) : (
                filteredCameras.map((camera) => (
                  <Grid item xs={12} sm={6} md={4} key={camera.id}>
                    <Card 
                      elevation={3} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: camera.enabled ? 'success.main' : 'error.main' }}>
                            <VideocamIcon />
                          </Avatar>
                        }
                        title={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">{camera.name}</Typography>
                            <Chip 
                              label={camera.enabled ? 'online' : 'offline'} 
                              color={camera.enabled ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        }
                        subheader={camera.location || 'No location specified'}
                        action={
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton 
                                onClick={() => handleEditCamera(camera)}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                onClick={() => handleDeleteCameraClick(camera)}
                                size="small"
                                disabled={deleteLoading === camera.id}
                              >
                                {deleteLoading === camera.id ? 
                                  <CircularProgress size={20} /> : 
                                  <DeleteIcon />
                                }
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={fullscreenCamera === camera.id ? "Exit Fullscreen" : "Fullscreen"}>
                              <IconButton 
                                onClick={() => toggleFullscreen(camera.id)}
                                size="small"
                              >
                                {fullscreenCamera === camera.id ? <FullscreenExitIcon /> : <FullscreenIcon />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Video Stream Placeholder */}
                        <Box 
                          sx={{ 
                            height: 180, 
                            background: '#000', 
                            color: '#fff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {camera.enabled ? (
                            <Box textAlign="center">
                              <VideocamIcon sx={{ fontSize: 48, opacity: 0.7 }} />
                              <Typography variant="body2">Live WebRTC Stream</Typography>
                              <Typography variant="caption" display="block" mt={1}>
                                RTSP: {camera.rtspUrl ? 'Connected' : 'Not configured'}
                              </Typography>
                            </Box>
                          ) : (
                            <Box textAlign="center">
                              <VideocamIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                              <Typography variant="body2">Camera Offline</Typography>
                              <Typography variant="caption" display="block" mt={1}>
                                Enable camera to start streaming
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Camera Controls */}
                        <CardActions sx={{ pb: 1 }}>
                          <Button 
                            variant={camera.enabled ? "outlined" : "contained"} 
                            size="small" 
                            fullWidth
                            startIcon={camera.enabled ? <StopIcon /> : <PlayArrowIcon />}
                            onClick={() => handleToggleCamera(camera.id, !camera.enabled)}
                          >
                            {camera.enabled ? "Disable" : "Enable"}
                          </Button>
                        </CardActions>

                        {/* Expandable Alerts Section */}
                        <Box sx={{ mt: 1 }}>
                          <Button 
                            variant="text" 
                            size="small" 
                            onClick={() => toggleExpandCamera(camera.id)}
                            endIcon={expandedCameraId === camera.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ justifyContent: 'space-between', width: '100%', p: 1 }}
                          >
                            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                              <NotificationsIcon sx={{ mr: 1, fontSize: 18 }} />
                              Recent Alerts ({getCameraAlerts(camera.id).length})
                            </Typography>
                          </Button>
                          
                          <Collapse in={expandedCameraId === camera.id} timeout="auto" unmountOnExit>
                            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                              {getCameraAlerts(camera.id).length === 0 ? (
                                <ListItem>
                                  <Typography variant="body2" color="text.secondary">No recent alerts</Typography>
                                </ListItem>
                              ) : (
                                getCameraAlerts(camera.id).slice(0, 5).map((alert) => (
                                  <ListItem 
                                    key={alert.id} 
                                    sx={{ 
                                      borderLeft: '3px solid warning.main',
                                      pl: 1,
                                      py: 0.5,
                                      mb: 0.5,
                                      bgcolor: 'warning.main',
                                      borderRadius: 1
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2">{alert.message}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(alert.createdAt)}
                                      </Typography>
                                    </Box>
                                  </ListItem>
                                ))
                              )}
                            </List>
                          </Collapse>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Alert History Table */}
            <Typography variant="h5" sx={{ mb: 2 }}>Alert History</Typography>
            <Paper elevation={3}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Camera</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Date & Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2">No alerts found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAlerts.map((alert) => {
                        const camera = cameras.find(c => c.id === alert.cameraId);
                        return (
                          <TableRow key={alert.id}>
                            <TableCell>{camera ? camera.name : `Camera ${alert.cameraId}`}</TableCell>
                            <TableCell>{alert.message}</TableCell>
                            <TableCell>{formatDate(alert.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <FormControl variant="outlined" size="small">
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    displayEmpty
                  >
                    <MenuItem value={5}>5 per page</MenuItem>
                    <MenuItem value={10}>10 per page</MenuItem>
                    <MenuItem value={25}>25 per page</MenuItem>
                    <MenuItem value={50}>50 per page</MenuItem>
                  </Select>
                </FormControl>
                <Pagination
                  count={Math.ceil(alerts.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            </Paper>
          </TabPanel>
        </Box>
      </Box>

      {/* Floating Action Button for Mobile */}
      {!isDesktop && (
        <Fab
          color="primary"
          aria-label="add camera"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateCamera}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Camera Form Dialog */}
      <Dialog open={cameraDialogOpen} onClose={() => setCameraDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCamera ? "Edit Camera" : "Add New Camera"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Camera Name"
            fullWidth
            variant="outlined"
            value={cameraForm.name}
            onChange={(e) => setCameraForm({...cameraForm, name: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={cameraForm.location}
            onChange={(e) => setCameraForm({...cameraForm, location: e.target.value})}
          />
          <TextField
            margin="dense"
            label="RTSP URL"
            fullWidth
            variant="outlined"
            value={cameraForm.rtspUrl}
            onChange={(e) => setCameraForm({...cameraForm, rtspUrl: e.target.value})}
            required
          />
          <FormControlLabel
            control={
              <Switch
                checked={cameraForm.enabled}
                onChange={(e) => setCameraForm({...cameraForm, enabled: e.target.checked})}
              />
            }
            label="Enable Camera"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSaveCamera}
            loading={saveLoading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the camera "{cameraToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <LoadingButton
            onClick={handleConfirmDelete}
            loading={deleteLoading === cameraToDelete?.id}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}