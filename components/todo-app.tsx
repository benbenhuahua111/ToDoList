"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, Plus, Trash2, Pencil, X, Camera, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodos, createTodo, updateTodo, deleteTodo, toggleTodo } from "@/lib/todos";
import { uploadImage, deleteImage, validateImageFile } from "@/lib/storage";
import type { Todo } from "@/lib/types";

type User = {
  id: string;
  email?: string;
} | null;

interface TodoAppProps {
  user: User;
}

export default function TodoApp({ user }: TodoAppProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载用户的todos
  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userTodos = await getTodos();
      setTodos(userTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      // 可以在这里添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedImage(file);
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // 清除选中的图片
  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果用户未登录，重定向到登录页面
    if (!user) {
      router.push('/sign-in');
      return;
    }
    
    if (!newTodo.trim()) return;
    
    try {
      setIsLoading(true);
      let imageUrl: string | undefined;
      
      // 如果有选中的图片，先上传图片
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await uploadImage(selectedImage, user.id);
      }
      
      const newTodoItem = await createTodo({
        text: newTodo,
        user_id: user.id,
        ...(imageUrl && { image_url: imageUrl })
      });
      
      setTodos([newTodoItem, ...todos]);
      setNewTodo("");
      clearSelectedImage();
    } catch (error) {
      console.error('Error adding todo:', error);
      const errorMessage = error instanceof Error ? error.message : '添加Todo失败，请重试';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
      const updatedTodo = await toggleTodo(id, !todo.completed);
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
      // 如果有图片，先删除图片
      if (todo.image_url) {
        await deleteImage(todo.image_url, user.id);
      }
      
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId || !user) return;
    
    try {
      const updatedTodo = await updateTodo({
        id: editingId,
        text: editText
      });
      setTodos(todos.map(todo =>
        todo.id === editingId ? updatedTodo : todo
      ));
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <>
      <form onSubmit={addTodo} className="mb-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
              title="添加图片"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-white"
            >
              {uploadingImage ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          {/* 图片预览 */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="预览"
                className="w-full max-w-xs rounded-lg border border-white/30"
              />
              <button
                type="button"
                onClick={clearSelectedImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </form>

      {isLoading && (
        <div className="text-center text-white/70 mb-4">
          <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="ml-2">加载中...</span>
        </div>
      )}

      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              "group flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
              "bg-white/10 hover:bg-white/20",
              todo.completed && "opacity-75"
            )}
          >
            <button
              onClick={() => handleToggleTodo(todo.id)}
              className="text-white hover:scale-110 transition-transform duration-200"
            >
              {todo.completed ? (
                <Check className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            
            {editingId === todo.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-3 py-1 rounded bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                <button
                  onClick={saveEdit}
                  className="p-1 text-white hover:text-green-300 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-white hover:text-red-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <span
                  className={cn(
                    "text-white transition-all duration-300 block",
                    todo.completed && "line-through opacity-75"
                  )}
                >
                  {todo.text}
                </span>
                {todo.image_url && (
                  <div className="mt-2">
                    <img
                      src={todo.image_url}
                      alt="Todo attachment"
                      className="max-w-xs max-h-48 rounded-lg border border-white/30 object-cover"
                    />
                  </div>
                )}
              </div>
            )}
            
            {editingId !== todo.id && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => startEditing(todo)}
                  className="p-1 text-white hover:text-blue-300 transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="p-1 text-white hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="text-center text-white/70 mt-8">
          {user ? "开始计划点什么吧！" : "登录后制定Todo"}
        </div>
      )}
    </>
  );
}
