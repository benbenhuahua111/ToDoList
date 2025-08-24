export interface DatabaseTodo {
  id: number;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoInsert {
  text: string;
  completed?: boolean;
  user_id: string;
}

export interface TodoUpdate {
  text?: string;
  completed?: boolean;
}

export interface ClientTodo {
  id: number;
  text: string;
  completed: boolean;
}
