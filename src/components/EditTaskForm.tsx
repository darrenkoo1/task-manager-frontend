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
import { Save, Close } from "@mui/icons-material";
import { updateTaskName } from "../api/taskApi";
import { Task } from "../types/task";

interface EditTaskFormProps {
  task: Task;
  onTaskUpdated: () => void;
  onClose?: () => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onTaskUpdated, onClose }) => {
  const [taskName, setTaskName] = useState<string>(task.name);
  const [parentId, setParentId] = useState<number | undefined>(task.parent_id || undefined);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!taskName.trim()) {
      setError("Task Name is required.");
      return;
    }

    try {
      await updateTaskName(task.id, taskName, parentId);
      onTaskUpdated();
      if (onClose) onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to update task. Please try again.";
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
        Edit Task
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
          label="Parent Task ID"
          type="number"
          value={parentId || ""}
          onChange={(e) => setParentId(Number(e.target.value) || undefined)}
          fullWidth
          variant="outlined"
          size="small"
          helperText="Changing parent task will update status propagation"
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Save Changes
        </Button>
      </Box>
    </Paper>
  );
};

export default EditTaskForm; 