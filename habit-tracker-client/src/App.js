import React, { useState, useEffect, useCallback } from "react";

import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog, // For modals
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl, // For select input
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery, // For responsive dialogs
  useTheme, // For responsive dialogs
  createTheme, // Import createTheme
  ThemeProvider, // Import ThemeProvider
  CssBaseline // Import CssBaseline for consistent baseline styles
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE = "http://localhost:3001";

const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7', // Deep Purple
      light: '#9575cd',
      dark: '#512da8',
    },
    secondary: {
      main: '#00bcd4', // Cyan
      light: '#4dd0e1',
      dark: '#00838f',
    },
    success: {
      main: '#4caf50', // Green
    },
    error: {
      main: '#f44336', // Red
    },
    info: {
      main: '#2196f3', // Blue
    },
    warning: {
      main: '#ff9800', // Orange
    },
    background: {
      default: '#f0f2f5', // Light gray background
      paper: '#ffffff', // White paper background
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h2: {
      fontWeight: 800,
      fontSize: '3.5rem',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.8rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.2rem',
    },
    subtitle1: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #7b1fa2 30%, #5e35b1 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #6a1b9a 30%, #4527a0 90%)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(45deg, #66bb6a 30%, #43a047 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5cb85c 30%, #388e3c 90%)',
          },
        },
        containedError: {
          background: 'linear-gradient(45deg, #ef5350 30%, #d32f2f 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #e53935 30%, #c62828 90%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#f9f9f9',
            '&.Mui-focused fieldset': {
              borderColor: '#673ab7',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#757575',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          backgroundColor: '#ffffff',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
  },
});


function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [habitName, setHabitName] = useState("");
  const [habitCategory, setHabitCategory] = useState(""); // New state for habit category
  const [habitDescription, setHabitDescription] = useState(""); // New state for habit description
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // State for editing habit
  const [openEditHabitDialog, setOpenEditHabitDialog] = useState(false);
  const [currentEditingHabit, setCurrentEditingHabit] = useState(null);
  const [editHabitName, setEditHabitName] = useState("");
  const [editHabitCategory, setEditHabitCategory] = useState("");
  const [editHabitDescription, setEditHabitDescription] = useState("");

  // State for editing progress
  const [openEditProgressDialog, setOpenEditProgressDialog] = useState(false);
  const [currentEditingProgress, setCurrentEditingProgress] = useState(null);
  const [editProgressDate, setEditProgressDate] = useState("");
  const [editProgressStatus, setEditProgressStatus] = useState(1); // 1 for Done, 0 for Missed

  const muiTheme = useTheme();
  const fullScreenDialog = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Function to get a color based on category
  const getCategoryColor = (category) => {
    const colors = {
      'Health': '#ffe0b2', // Light Orange
      'Learning': '#c8e6c9', // Light Green
      'Work': '#bbdefb', // Light Blue
      'Fitness': '#ffccbc', // Light Reddish-Orange
      'Personal': '#e1bee7', // Light Purple
      'Creative': '#fff9c4', // Light Yellow
      'Social': '#b2ebf2', // Light Cyan
      'Finance': '#d7ccc8', // Light Brown
      'Mindfulness': '#f8bbd0', // Light Pink
      // Add more categories and colors as needed
    };
    const defaultColor = '#f0f4c3'; // Very Light Yellow/Green as a fallback
    return colors[category] || defaultColor;
  };


  // Memoized fetchHabits
  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/habits?user_id=${userId}`);
      if (!res.ok) {
        console.error("Failed to fetch habits:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      setHabits(data);
    } catch (error) {
      console.error("Network error fetching habits:", error);
    }
  }, [userId]);

  // Memoized fetchProgress
  const fetchProgress = useCallback(async (habit_id) => {
    try {
      const res = await fetch(`${API_BASE}/progress?habit_id=${habit_id}`);
      if (!res.ok) {
        console.error("Failed to fetch progress:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      setProgress(data);
      setSelectedHabit(habit_id);
    } catch (error) {
      console.error("Network error fetching progress:", error);
    }
  }, []);

  // Memoized logProgress
  const logProgress = useCallback(async (habit_id, date, status) => {
    try {
      const res = await fetch(`${API_BASE}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id, date, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error logging progress:", errorData);
        if (res.status === 409) {
          alert(errorData.message);
        } else {
          alert("Error logging progress: " + (errorData.message || "Failed to log progress."));
        }
        return;
      }
      fetchProgress(habit_id);
    } catch (error) {
      console.error("Network or client-side error logging progress:", error);
      alert("An unexpected error occurred while logging progress. Please try again.");
    }
  }, [fetchProgress]);

  // Handle both Registration and Login
  const handleAuth = async (type) => {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      alert("Please enter a username.");
      return;
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
        alert("Please enter a password.");
        return;
    }
    if (type === 'register' && password.length < 6) {
        alert("Password must be at least 6 characters long for registration.");
        return;
    }

    const endpoint = type === 'register' ? `${API_BASE}/users` : `${API_BASE}/login`;
    const method = 'POST';
    const body = JSON.stringify({ username, password });

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Server error during ${type}:`, errorData);
        alert(`Error during ${type}: ` + (errorData.message || `Failed to ${type} user.`));
        return;
      }

      const data = await res.json();
      localStorage.setItem("userId", data.id);
      localStorage.setItem("username", data.username);
      setUserId(data.id);
      setUsername(data.username);
      setPassword("");
      alert(`${type === 'register' ? 'Registration' : 'Logged in'} successful!`);

    } catch (error) {
      console.error(`Network or client-side error during ${type}:`, error);
      alert(`An unexpected error occurred during ${type}. Please try again.`);
    }
  };

  // Add a new habit - now includes category and description
  const addHabit = async () => {
    if (!habitName || typeof habitName !== 'string' || habitName.trim() === '') {
      alert("Please enter a habit name.");
      return;
    }
    if (!userId) {
        alert("Please log in to add a habit.");
        return;
    }
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          habit_name: habitName,
          category: habitCategory, // Include category
          description: habitDescription, // Include description
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error adding habit:", errorData);
        alert("Error adding habit: " + (errorData.message || "Failed to add habit."));
        return;
      }
      setHabitName("");
      setHabitCategory(""); // Clear category
      setHabitDescription(""); // Clear description
      fetchHabits();
    } catch (error) {
      console.error("Network or client-side error adding habit:", error);
      alert("An unexpected error occurred while adding habit. Please try again.");
    }
  };

  // Handle opening habit edit dialog
  const handleEditHabitClick = (habit) => {
    setCurrentEditingHabit(habit);
    setEditHabitName(habit.habit_name);
    setEditHabitCategory(habit.category || "");
    setEditHabitDescription(habit.description || "");
    setOpenEditHabitDialog(true);
  };

  // Handle updating a habit
  const updateHabit = async () => {
    if (!currentEditingHabit) return;
    if (!editHabitName || typeof editHabitName !== 'string' || editHabitName.trim() === '') {
      alert("Habit name cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/habits/${currentEditingHabit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_name: editHabitName,
          category: editHabitCategory,
          description: editHabitDescription,
          user_id: userId, // Pass user_id for authorization on backend
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error updating habit:", errorData);
        alert("Error updating habit: " + (errorData.message || "Failed to update habit."));
        return;
      }
      alert("Habit updated successfully!");
      setOpenEditHabitDialog(false);
      fetchHabits(); // Re-fetch habits to show updated list
    } catch (error) {
      console.error("Network error updating habit:", error);
      alert("An unexpected error occurred while updating habit. Please try again.");
    }
  };

  // Handle deleting a habit
  const deleteHabit = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit and all its progress?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/habits/${habitId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }), // Pass user_id for authorization
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error deleting habit:", errorData);
        alert("Error deleting habit: " + (errorData.message || "Failed to delete habit."));
        return;
      }
      alert("Habit deleted successfully!");
      fetchHabits(); // Re-fetch habits to update the list
      setSelectedHabit(null); // Clear selected progress view if this habit was selected
      setProgress([]);
    } catch (error) {
      console.error("Network error deleting habit:", error);
      alert("An unexpected error occurred while deleting habit. Please try again.");
    }
  };

  // Handle opening progress edit dialog
  const handleEditProgressClick = (progressEntry) => {
    setCurrentEditingProgress(progressEntry);
    setEditProgressDate(progressEntry.date);
    setEditProgressStatus(progressEntry.status);
    setOpenEditProgressDialog(true);
  };

  // Handle updating a progress entry
  const updateProgress = async () => {
    if (!currentEditingProgress) return;
    if (!editProgressDate || typeof editProgressStatus === 'undefined') {
      alert("Date and status are required for progress.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/progress/${currentEditingProgress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editProgressDate,
          status: editProgressStatus,
          habit_id: currentEditingProgress.habit_id, // Pass habit_id for authorization on backend
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error updating progress:", errorData);
        alert("Error updating progress: " + (errorData.message || "Failed to update progress."));
        return;
      }
      alert("Progress updated successfully!");
      setOpenEditProgressDialog(false);
      fetchProgress(currentEditingProgress.habit_id); // Re-fetch progress for the current habit
    } catch (error) {
      console.error("Network error updating progress:", error);
      alert("An unexpected error occurred while updating progress. Please try again.");
    }
  };

  // Handle deleting a progress entry
  const deleteProgress = async (progressId, habitId) => {
    if (!window.confirm("Are you sure you want to delete this progress entry?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/progress/${progressId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId }), // Pass habit_id for authorization
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error deleting progress:", errorData);
        alert("Error deleting progress: " + (errorData.message || "Failed to delete progress."));
        return;
      }
      alert("Progress deleted successfully!");
      fetchProgress(habitId); // Re-fetch progress for the current habit
    } catch (error) {
      console.error("Network error deleting progress:", error);
      alert("An unexpected error occurred while deleting progress. Please try again.");
    }
  };

  useEffect(() => {
    // Only run this on first mount
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
      setUsername(storedUsername || "");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchHabits();
      setProgress([]);
      setSelectedHabit(null);
    } else {
      setHabits([]);
      setProgress([]);
      setSelectedHabit(null);
    }
  }, [userId, fetchHabits]);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUserId(null);
    setUsername("");
    setPassword("");
    setHabits([]);
    setProgress([]);
    setSelectedHabit(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(135deg, #ede9fe 0%, #bae6fd 45%, #bbf7d0 100%)',
          p: 4,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Typography variant="h2" color="primary" mb={8} sx={{ textShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          Smart Habit Tracker
        </Typography>

        {!userId ? (
          <Paper elevation={4} sx={{ p: 5, width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" mb={3}>
              Register or Log In
            </Typography>
            <TextField
              fullWidth
              value={username}
              onChange={e => setUsername(e.target.value)}
              label="Username"
              variant="outlined"
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              label="Password"
              variant="outlined"
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.4, fontSize: 18, borderRadius: 3 }}
              onClick={() => handleAuth('register')}
            >
              Register
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ mt: 2, py: 1.4, fontSize: 18, borderRadius: 3 }}
              onClick={() => handleAuth('login')}
            >
              Log In
            </Button>
          </Paper>
        ) : (
          <Paper elevation={4} sx={{ p: 5, width: '100%', maxWidth: 700 }}>
            <Typography variant="h4" color="primary" mb={4} textAlign="center">
              Welcome, {username || "User"}!
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mb={4}> {/* Changed to column for better input stacking */}
              <TextField
                fullWidth
                value={habitName}
                onChange={e => setHabitName(e.target.value)}
                label="Add a new habit name, e.g., 'Read 15 mins'"
                variant="outlined"
              />
              <TextField
                fullWidth
                value={habitCategory}
                onChange={e => setHabitCategory(e.target.value)}
                label="Category (Optional, e.g., 'Health', 'Learning')"
                variant="outlined"
              />
              <TextField
                fullWidth
                value={habitDescription}
                onChange={e => setHabitDescription(e.target.value)}
                label="Description (Optional, e.g., 'Read a book before bed')"
                variant="outlined"
                multiline
                rows={2}
              />
              <Button
                variant="contained"
                color="success"
                onClick={addHabit}
                sx={{ minWidth: { xs: '100%', sm: 120 }, fontWeight: 'bold', py: 1.4 }}
              >
                Add Habit
              </Button>
            </Box>

            <Button
              variant="contained"
              color="error"
              onClick={logout}
              startIcon={<LogoutIcon />}
              fullWidth
              sx={{ mb: 4 }}
            >
              Log out
            </Button>

            <Typography variant="h5" color="primary" mb={2} sx={{ borderBottom: '2px solid #e5e7eb', pb: 1 }}>
              Your Habits:
            </Typography>
            {habits.length === 0 ? (
              <Paper elevation={0} sx={{ bgcolor: "#f3f4f6", color: "text.secondary", p: 4, textAlign: "center", borderRadius: 2, mb: 2 }}>
                No habits added yet. Let's create your first one!
              </Paper>
            ) : (
              <List sx={{ '& .MuiListItem-root:last-child': { mb: 0 } }}>
                {habits.map(habit => (
                  <ListItem
                    key={habit.id}
                    sx={{
                      bgcolor: getCategoryColor(habit.category), // Dynamically set background color
                      color: 'text.primary', // Adjust text color for readability on different backgrounds
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="subtitle1" sx={{ color: 'inherit' }}>{habit.habit_name}</Typography>}
                      secondary={
                        <Box sx={{ color: 'text.secondary', mt: 0.5 }}> {/* Use text.secondary for secondary text */}
                            {habit.category && <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Category: {habit.category}</Typography>}
                            {habit.description && <Typography variant="body2">{habit.description}</Typography>}
                        </Box>
                      }
                      sx={{ mb: { xs: 1, sm: 0 }, mr: { xs: 0, sm: 2 } }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<VisibilityIcon />}
                        sx={{ minWidth: 120 }}
                        onClick={() => fetchProgress(habit.id)}
                      >
                        View Progress
                      </Button>
                      <Button
                        variant="contained"
                        color="info"
                        startIcon={<CheckCircleIcon />}
                        sx={{ minWidth: 120 }}
                        onClick={() => logProgress(habit.id, new Date().toISOString().split("T")[0], 1)}
                      >
                        Log Today
                      </Button>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditHabitClick(habit)}
                        sx={{ color: 'text.primary', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteHabit(habit.id)}
                        sx={{ color: 'error.main', bgcolor: 'rgba(255,0,0,0.1)', '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            {selectedHabit && (
              <Paper elevation={2} sx={{ mt: 4, p: 3, bgcolor: theme.palette.secondary.light }}>
                <Typography variant="h6" color="secondary.contrastText" mb={2} sx={{ borderBottom: '2px solid rgba(255,255,255,0.3)', pb: 1 }}>
                  Progress for {habits.find(h => h.id === selectedHabit)?.habit_name || `Habit #${selectedHabit}`}
                </Typography>
                {progress.length === 0 ? (
                  <Typography variant="body1" color="secondary.contrastText" textAlign="center" p={2} sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                    No progress logged for this habit yet.
                  </Typography>
                ) : (
                  <List>
                    {progress.map(p => (
                      <ListItem
                        key={p.id}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.3)',
                          borderRadius: 2,
                          mb: 1,
                          justifyContent: 'space-between',
                          color: theme.palette.secondary.contrastText,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ color: 'inherit', fontWeight: 'bold' }}>
                              {p.date}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'inherit', mt: 0.5 }}>
                                Status: <Typography component="span" fontWeight="bold" color={p.status ? "success.main" : "error.main"}>
                                    {p.status ? "Done" : "Missed"}
                                </Typography>
                            </Typography>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
                          <IconButton
                            edge="end"
                            aria-label="edit-progress"
                            onClick={() => handleEditProgressClick(p)}
                            sx={{ color: 'text.primary', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete-progress"
                            onClick={() => deleteProgress(p.id, p.habit_id)}
                            sx={{ color: 'error.main', bgcolor: 'rgba(255,0,0,0.1)', '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Paper>
        )}

        {/* Edit Habit Dialog */}
        <Dialog
          open={openEditHabitDialog}
          onClose={() => setOpenEditHabitDialog(false)}
          fullScreen={fullScreenDialog}
          aria-labelledby="edit-habit-dialog-title"
        >
          <DialogTitle id="edit-habit-dialog-title">
            Edit Habit
            <IconButton
              aria-label="close"
              onClick={() => setOpenEditHabitDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Habit Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editHabitName}
              onChange={(e) => setEditHabitName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Category"
              type="text"
              fullWidth
              variant="outlined"
              value={editHabitCategory}
              onChange={(e) => setEditHabitCategory(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={editHabitDescription}
              onChange={(e) => setEditHabitDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditHabitDialog(false)} color="error">
              Cancel
            </Button>
            <Button onClick={updateHabit} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Progress Dialog */}
        <Dialog
          open={openEditProgressDialog}
          onClose={() => setOpenEditProgressDialog(false)}
          fullScreen={fullScreenDialog}
          aria-labelledby="edit-progress-dialog-title"
        >
          <DialogTitle id="edit-progress-dialog-title">
            Edit Progress
            <IconButton
              aria-label="close"
              onClick={() => setOpenEditProgressDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <TextField
              autoFocus
              margin="dense"
              label="Date"
              type="date" // Use date type for date picker
              fullWidth
              variant="outlined"
              value={editProgressDate}
              onChange={(e) => setEditProgressDate(e.target.value)}
              InputLabelProps={{ shrink: true }} // Ensures label is always visible for date input
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={editProgressStatus}
                onChange={(e) => setEditProgressStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value={1}>Done</MenuItem>
                <MenuItem value={0}>Missed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditProgressDialog(false)} color="error">
              Cancel
            </Button>
            <Button onClick={updateProgress} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
