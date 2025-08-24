import { createClient } from "@/utils/supabase/client";

// 支持的图片格式
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  url: string;
  path: string;
}

// 上传图片到Supabase Storage
export async function uploadTodoImage(file: File, userId: string): Promise<UploadResult> {
  // 验证文件类型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('只支持上传 JPEG、PNG、GIF、WebP 格式的图片');
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('图片大小不能超过 5MB');
  }

  const supabase = createClient();
  
  // 生成唯一的文件名
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // 上传文件到 my-todo bucket
  const { data, error } = await supabase.storage
    .from('my-todo')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`上传失败: ${error.message}`);
  }

  // 获取公共URL
  const { data: { publicUrl } } = supabase.storage
    .from('my-todo')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath
  };
}

// 删除图片
export async function deleteTodoImage(imagePath: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from('my-todo')
    .remove([imagePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`删除图片失败: ${error.message}`);
  }
}

// 从URL中提取文件路径
export function extractImagePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'my-todo');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}
