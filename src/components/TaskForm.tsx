import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { createTask } from "../api/taskApi";

interface TaskFormProps {
  onTaskCreated: () => void;
  onClose?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, onClose }) => {
  const [taskName, setTaskName] = useState<string>("");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!taskName.trim()) {
      setError("Task Name is required.");
      return;
    }

    try {
      await createTask(taskName, parentId);
      setTaskName("");
      setParentId(undefined);
      onTaskCreated();
      if (onClose) onClose();
    } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Failed to create task. Please try again.";
        setError(errorMessage);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative' }}>
      {onClose && (
        <IconButton 
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={onClose}
        >
          <Close />
        </IconButton>
      )}
      
      <Typography variant="h6" component="h2" gutterBottom>
        Create New Task
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
          fullWidth
          variant="outlined"
          size="small"
        />

        <TextField
          label="Parent Task ID (optional)"
          type="number"
          value={parentId || ""}
          onChange={(e) => setParentId(Number(e.target.value) || undefined)}
          fullWidth
          variant="outlined"
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<Add />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Create Task
        </Button>
      </Box>
    </Paper>
  );
};

export default TaskForm;