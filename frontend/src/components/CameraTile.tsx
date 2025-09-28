import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, List, ListItem } from '@mui/material';
import axiosInstance from '../api/axiosInstance';

interface Camera {
  id: number;
  name: string;
  rtspUrl: string;
  location?: string;
}

interface Alert {
  id: number;
  cameraId: number;   // ✅ add this
  message: string;
  createdAt: string;
}

const CameraTile = ({ camera }: { camera: Camera }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    try {
      const res = await axiosInstance.get('/alerts');
      // Filter alerts for this camera
      const cameraAlerts = res.data.filter((a: Alert) => a.cameraId === camera.id);
      setAlerts(cameraAlerts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Optionally: setup WebSocket here later
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{camera.name}</Typography>
        <Typography variant="body2">{camera.rtspUrl}</Typography>
        <Typography variant="body2">{camera.location}</Typography>
        <Button variant="outlined" style={{ marginTop: '10px' }}>Start/Stop Stream</Button>
        <Typography variant="subtitle1" style={{ marginTop: '10px' }}>Alerts</Typography>
        <List>
          {alerts.map((alert) => (
            <ListItem key={alert.id}>
              {alert.message} - {new Date(alert.createdAt).toLocaleTimeString()}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CameraTile;
