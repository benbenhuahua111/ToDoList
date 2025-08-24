import { createClient } from "@/utils/supabase/client";
import type { Todo, CreateTodo, UpdateTodo } from "./types";

// 获取当前用户的所有todos
export async function getTodos(): Promise<Todo[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }

  return data || [];
}

// 创建新的todo
export async function createTodo(todoData: CreateTodo): Promise<Todo> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('todos')
    .insert([{
      text: todoData.text,
      user_id: todoData.user_id,
      ...(todoData.image_url && { image_url: todoData.image_url })
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating todo:', error);
    throw new Error('Failed to create todo');
  }

  return data;
}

// 更新todo
export async function updateTodo(todoData: UpdateTodo): Promise<Todo> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('todos')
    .update({
      ...(todoData.text !== undefined && { text: todoData.text }),
      ...(todoData.completed !== undefined && { completed: todoData.completed }),
      ...(todoData.image_url !== undefined && { image_url: todoData.image_url }),
    })
    .eq('id', todoData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating todo:', error);
    throw new Error('Failed to update todo');
  }

  return data;
}

// 删除todo
export async function deleteTodo(id: number): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    throw new Error('Failed to delete todo');
  }
}

// 切换todo完成状态
export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  return updateTodo({ id, completed });
}