import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getTodos } from './todos';
import type { Todo } from './types';

export function useRealtimeTodos(user: { id: string } | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // 初始加载todos
  useEffect(() => {
    if (user) {
      loadInitialTodos();
    } else {
      setTodos([]);
    }
  }, [user]);

  // 设置实时订阅
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for user:', user.id);

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime payload received:', payload);
          handleRealtimeChange(payload);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadInitialTodos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userTodos = await getTodos();
      setTodos(userTodos);
    } catch (error) {
      console.error('Error loading initial todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeChange = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        console.log('Todo inserted:', newRecord);
        setTodos((currentTodos) => {
          // 检查是否已存在，避免重复
          const exists = currentTodos.some(todo => todo.id === newRecord.id);
          if (exists) return currentTodos;
          return [newRecord, ...currentTodos];
        });
        break;

      case 'UPDATE':
        console.log('Todo updated:', newRecord);
        setTodos((currentTodos) =>
          currentTodos.map((todo) =>
            todo.id === newRecord.id ? newRecord : todo
          )
        );
        break;

      case 'DELETE':
        console.log('Todo deleted:', oldRecord);
        setTodos((currentTodos) =>
          currentTodos.filter((todo) => todo.id !== oldRecord.id)
        );
        break;

      default:
        console.log('Unknown event type:', eventType);
    }
  };

  // 本地更新函数，用于乐观更新
  const updateLocalTodos = (updater: (todos: Todo[]) => Todo[]) => {
    setTodos(updater);
  };

  return {
    todos,
    isLoading,
    updateLocalTodos,
    refreshTodos: loadInitialTodos,
  };
}

