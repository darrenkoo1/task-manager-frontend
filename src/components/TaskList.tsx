import React, { useEffect, useState, useCallback } from "react";
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Box,
  ButtonGroup,
  Button,
  Typography,
  Chip,
  Tooltip,
  Pagination
} from "@mui/material";
import { Done, Add, CheckCircle, RadioButtonUnchecked, PlayCircleOutline } from "@mui/icons-material";
import { fetchTasks, toggleTaskStatus, pusher } from "../api/taskApi";
import { Task } from "../types/task";
import TaskForm from "./TaskForm";
import { Task as TaskIcon } from '@mui/icons-material';
import EditTaskForm from "./EditTaskForm";

// Add this new interface for the hierarchical structure
interface TaskNode extends Task {
  children: TaskNode[];
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);

  const loadTasks = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const data = await fetchTasks(status, page, perPage);
      if (Array.isArray(data)) {
        const startIndex = (page - 1) * perPage;
        const paginatedData = data.slice(startIndex, startIndex + perPage);
        setTasks(paginatedData);
        setTotalPages(Math.ceil(data.length / perPage));
      } else if (data && 'items' in data) {
        setTasks(data.items);
        setTotalPages(Math.ceil(data.total / perPage));
      } else {
        setError("Invalid data format received from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  const handleToggle = async (id: number) => {
    try {
      await toggleTaskStatus(id);
      loadTasks();
    } catch (error) {
      setError("Failed to update task status. Please try again.");
      console.error("Error toggling task:", error);
    }
  };

  const handleFilterChange = (newFilter: string | undefined) => {
    setFilter(newFilter);
    loadTasks(newFilter);
  };

  const getStatusChip = (status: string, complete: boolean) => {
    let config: {
      icon: JSX.Element;
      color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
      label: string;
    } = {
      icon: <RadioButtonUnchecked />,
      color: 'default',
      label: 'Unknown'
    };

    if (status === 'COMPLETE') {
      config = {
        icon: <CheckCircle />,
        color: 'success',
        label: 'Complete'
      };
    } else if (status === 'DONE') {
      config = {
        icon: <Done />,
        color: 'primary',
        label: 'Done'
      };
    } else if (status === 'IN_PROGRESS') {
      config = {
        icon: <PlayCircleOutline />,
        color: 'warning',
        label: 'In Progress'
      };
    }

    return (
      <Chip
        icon={config.icon}
        color={config.color}
        label={config.label}
        size="small"
        variant="outlined"
      />
    );
  };

  // Add this new function to transform flat list to tree
  const buildTaskTree = (tasks: Task[]): TaskNode[] => {
    if (!tasks) return [];
    
    const taskMap = new Map<number, TaskNode>();
    const roots: TaskNode[] = [];

    // First pass: create TaskNode objects and store in map
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: build parent-child relationships
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parent_id && taskMap.has(task.parent_id)) {
        const parent = taskMap.get(task.parent_id)!;
        parent.children.push(taskNode);
      } else {
        roots.push(taskNode);
      }
    });

    return roots;
  };

  // Add this new component for recursive rendering
  const TaskRow = ({ task, level = 0 }: { task: TaskNode; level?: number }) => (
    <>
      <TableRow 
        sx={{ 
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
          backgroundColor: task.complete ? 'success.lighter' : 'inherit',
          transition: 'all 0.2s ease',
        }}
      >
        <TableCell sx={{ width: '40%' }}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            ml: level * 4,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TaskIcon color={level === 0 ? 'primary' : 'action'} />
              {task.id}.
            </Box>
            
            <Typography variant={level === 0 ? 'h6' : 'body1'}>
              {task.name}
            </Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ width: '20%' }} align="center">
          <Tooltip title="Click to toggle status">
            <IconButton onClick={() => handleToggle(task.id)} size="small">
              {getStatusChip(task.status, task.complete)}
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell sx={{ width: '30%' }} align="center">
          {task.dependency_stats.total > 0 ? (
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Chip
                label={`Total ${task.dependency_stats.total}`}
                size="small"
                variant="outlined"
                sx={{ '& .MuiChip-label': { px: 1 } }}
              />
              <Chip
                icon={<Done sx={{ fontSize: '0.9rem' }} />}
                label={task.dependency_stats.done}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ '& .MuiChip-label': { px: 1 } }}
              />
              <Chip
                icon={<CheckCircle sx={{ fontSize: '0.9rem' }} />}
                label={task.dependency_stats.complete}
                size="small"
                color="success"
                variant="outlined"
                sx={{ '& .MuiChip-label': { px: 1 } }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No dependencies
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ width: '10%' }} align="center">
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setEditingTask(task);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{
              minWidth: '80px',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              boxShadow: 1,
              textTransform: 'none',
              borderRadius: '4px',
            }}
          >
            Edit
          </Button>
        </TableCell>
      </TableRow>
      {task.children.map(child => (
        <TaskRow key={child.id} task={child} level={level + 1} />
      ))}
    </>
  );

  // Add this new handler
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  useEffect(() => {
    loadTasks(filter);
  }, [filter, page, loadTasks]);

  useEffect(() => {
    // Subscribe to Pusher channel
    const channel = pusher.subscribe('tasks');
    
    channel.bind('App\\Events\\TaskUpdated', (data: { task: Task }) => {
      // Update the task in the local state
      setTasks(prevTasks => {
        return prevTasks.map(task => 
          task.id === data.task.id ? data.task : task
        );
      });
    });

    // Cleanup subscription when component unmounts
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []); // Empty dependency array since we want this to run once

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ButtonGroup variant="contained" aria-label="task filter">
          <Button
            onClick={() => handleFilterChange(undefined)}
            variant={filter === undefined ? 'contained' : 'outlined'}
          >
            All
          </Button>
          <Button
            onClick={() => handleFilterChange('IN_PROGRESS')}
            variant={filter === 'IN_PROGRESS' ? 'contained' : 'outlined'}
          >
            In Progress
          </Button>
          <Button
            onClick={() => handleFilterChange('DONE')}
            variant={filter === 'DONE' ? 'contained' : 'outlined'}
          >
            Done
          </Button>
          <Button
            onClick={() => handleFilterChange('COMPLETE')}
            variant={filter === 'COMPLETE' ? 'contained' : 'outlined'}
          >
            Complete
          </Button>
        </ButtonGroup>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide Form' : 'Add Task'}
        </Button>
      </Box>

      {showForm && (
        <TaskForm 
          onTaskCreated={() => {
            loadTasks(filter);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <Box sx={{ scrollMargin: '20px' }}>
          <EditTaskForm
            key={editingTask.id}
            task={editingTask}
            onTaskUpdated={() => {
              loadTasks(filter);
              setEditingTask(null);
            }}
            onClose={() => setEditingTask(null)}
          />
        </Box>
      )}

      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0 4px',
          },
          '& .MuiTableCell-root': {
            position: 'relative', // For absolute positioning of vertical lines
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white", width: '40%' }}>Description</TableCell>
              <TableCell sx={{ color: "white", width: '20%', textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={{ color: "white", width: '30%', textAlign: 'center' }}>Dependencies</TableCell>
              <TableCell sx={{ color: "white", width: '10%', textAlign: 'center' }}>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks && buildTaskTree(tasks).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add pagination controls */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </>
  );
};

export default TaskList;