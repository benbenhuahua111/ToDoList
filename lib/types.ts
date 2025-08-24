export interface Todo {
  id: number;
  user_id: string;
  text: string;
  completed: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodo {
  text: string;
  user_id: string;
  image_url?: string;
}

export interface UpdateTodo {
  id: number;
  text?: string;
  completed?: boolean;
  image_url?: string;
}
