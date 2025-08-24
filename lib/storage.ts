import { createClient } from "@/utils/supabase/client";

const BUCKET_NAME = "my-todo";

// 上传图片到Supabase Storage
export async function uploadImage(file: File, userId: string): Promise<string> {
  try {
    const supabase = createClient();
    
    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('Uploading image to path:', filePath);

    // 检查bucket是否存在（添加更多调试信息）
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw new Error(`Storage service error: ${bucketsError.message}`);
    }

    console.log('Available buckets:', buckets?.map(b => b.name));
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      console.error(`Bucket '${BUCKET_NAME}' not found. Available buckets:`, buckets?.map(b => b.name));
      // 尝试直接上传而不检查bucket存在性
      console.log('Attempting upload without bucket check...');
    }

    // 上传文件到storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

// 删除图片
export async function deleteImage(imageUrl: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  // 从URL中提取文件路径
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

// 验证文件类型和大小
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '只支持 JPG、PNG、GIF、WebP 格式的图片'
    };
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片大小不能超过 5MB'
    };
  }

  return { valid: true };
}