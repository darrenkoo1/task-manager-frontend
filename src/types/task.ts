export interface Task {
  id: number;
  name: string;
  status: string;
  complete: boolean;
  parent_id: number | null;
  dependency_stats: {
    total: number;
    done: number;
    complete: number;
  };
}