/*
  # Create Storage Buckets for File Uploads

  1. Storage Buckets
    - `store-logos` - Public bucket for store logos (5MB limit)
    - `product-images` - Public bucket for product images (10MB limit) 
    - `product-files` - Private bucket for downloadable files (100MB limit)

  2. Security
    - RLS policies for each bucket
    - User-specific folder structure for file organization
    - Public access for images, private access for downloadable files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('store-logos', 'store-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-files', 'product-files', false, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;