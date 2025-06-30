/*
  # Create Storage Buckets for File Uploads

  1. Storage Buckets
    - `store-logos` (public) - For store logo images
    - `product-images` (public) - For product preview images  
    - `product-files` (private) - For downloadable product files

  2. Security
    - Buckets are created with appropriate public/private settings
    - RLS policies are automatically managed by Supabase for storage buckets
*/

-- Create storage buckets using INSERT with ON CONFLICT
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('store-logos', 'store-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-files', 'product-files', false, 104857600, NULL)
ON CONFLICT (id) DO NOTHING;