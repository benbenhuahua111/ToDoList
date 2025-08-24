"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadTodoImage, UploadResult } from "@/lib/upload";

interface ImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onImageUploaded: (result: UploadResult | null) => void;
  disabled?: boolean;
}

export default function ImageUpload({ 
  userId, 
  currentImageUrl, 
  onImageUploaded, 
  disabled = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    // 创建本地预览
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      setIsUploading(true);
      const result = await uploadTodoImage(file, userId);
      
      // 清理本地预览URL
      URL.revokeObjectURL(localPreviewUrl);
      
      // 更新为实际的上传URL
      setPreviewUrl(result.url);
      onImageUploaded(result);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : '上传失败');
      
      // 恢复原始状态
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // 清空input值，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Todo attachment"
            className="w-8 h-8 rounded object-cover"
          />
          {!disabled && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除图片"
            >
              <X className="w-2 h-2 text-white" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleUploadClick}
          disabled={disabled || isUploading}
          className="p-1 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          title="上传图片"
        >
          {isUploading ? (
            <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
