# Supabase Storage 配置指南

## 🚀 快速设置

### 1. 创建Storage Bucket

1. 登录到你的 Supabase 项目
2. 进入 **Storage** 页面
3. 点击 **Create Bucket**
4. 输入 bucket 名称：`my-todo`
5. 设置为 **Public bucket**（如果需要公共访问）
6. 点击 **Create bucket**

### 2. 设置Storage策略 (RLS)

在 Supabase SQL Editor 中执行以下SQL：

```sql
-- 允许认证用户上传到自己的目录
CREATE POLICY "Users can upload images to their own folder" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'my-todo' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户查看自己的图片
CREATE POLICY "Users can view their own images" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'my-todo' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户删除自己的图片
CREATE POLICY "Users can delete their own images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'my-todo' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. 验证设置

运行应用并尝试：
1. 登录用户账户
2. 添加新的Todo
3. 点击相机图标选择图片
4. 提交Todo并查看图片是否正确显示

## 🔧 故障排除

### 常见错误及解决方案

1. **"Bucket 'my-todo' does not exist"**
   - 确保在Supabase中创建了名为 `my-todo` 的bucket

2. **"Storage service unavailable"**
   - 检查Supabase项目是否正常运行
   - 验证环境变量是否正确配置

3. **"Upload failed: Policy violation"**
   - 确保已设置正确的Storage RLS策略
   - 检查用户是否已登录

4. **图片无法显示**
   - 确保bucket设置为public
   - 检查图片URL是否正确生成

### 调试步骤

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 检查Network标签页的请求状态
4. 验证Supabase项目设置

## 📁 文件结构

图片将按以下结构存储：
```
my-todo/
├── {user_id_1}/
│   ├── {timestamp}-{random}.jpg
│   └── {timestamp}-{random}.png
├── {user_id_2}/
│   └── {timestamp}-{random}.gif
└── ...
```

## 🎯 功能特性

- ✅ 支持 JPG、PNG、GIF、WebP 格式
- ✅ 文件大小限制：5MB
- ✅ 自动生成唯一文件名
- ✅ 用户目录隔离
- ✅ 图片预览功能
- ✅ 删除Todo时自动清理图片

## 🔒 安全特性

- 用户只能上传到自己的目录
- 用户只能访问自己的图片
- 文件类型和大小验证
- RLS策略保护数据安全

现在你的Todo应用支持图片上传功能！📸
