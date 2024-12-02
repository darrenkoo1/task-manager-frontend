import axios from "axios";
import { Task } from "../types/task";
import Pusher from 'pusher-js';

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface PaginatedResponse {
  items: Task[];
  total: number;
  page: number;
  per_page: number;
}

export const fetchTasks = async (
  status?: string, 
  page: number = 1, 
  per_page: number = 20
): Promise<Task[] | PaginatedResponse> => {
  const response = await axios.get(`${API_BASE_URL}/tasks`, {
    params: { status, page, per_page },
  });
  return response.data;
};

export const createTask = async (name: string, parentId?: number): Promise<Task> => {
  const response = await axios.post(`${API_BASE_URL}/tasks`, {
      name,
      parent_id: parentId,
  });
  return response.data;
};

export const toggleTaskStatus = async (taskId: number): Promise<Task> => {
  const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/toggle`);
  return response.data;
};

export const updateTaskName = async (taskId: number, name: string, parentId?: number): Promise<Task> => {
  const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, { 
    name,
    parent_id: parentId 
  });
  return response.data;
};

export const pusher = new Pusher('1c564b67cbeae37b9a4f', {
  cluster: 'ap1',
  forceTLS: true
});