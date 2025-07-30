export interface User {
    id: string
    name: string
    email: string
    image?: string
}

export interface Task {
  id: number;
  uuid: string;
  created_at: Date | null;
  updated_at: Date | null;
  name: string;
  description: string | null;
  userId: string;
}

export interface CreateTaskData {
  name: string;
  description?: string;
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
}