/*
  # Storage Buckets Setup

  1. Storage Buckets
    - `store-logos` - For store logo images (5MB limit, public access)
    - `product-images` - For product preview images (10MB limit, public access)
    - `product-files` - For downloadable product files (100MB limit, private access)

  2. Security Policies
    - Users can upload/manage their own files
    - Public can view store logos and product images
    - Only owners can access product files for download
*/

-- Create storage buckets with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('store-logos', 'store-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-files', 'product-files', false, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Store logos policies
  DROP POLICY IF EXISTS "Users can upload store logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update store logos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete store logos" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view store logos" ON storage.objects;
  
  -- Product images policies
  DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete product images" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
  
  -- Product files policies
  DROP POLICY IF EXISTS "Users can upload product files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update product files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete product files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can download product files they own" ON storage.objects;
END $$;

-- Create policies for store-logos bucket
CREATE POLICY "Users can upload store logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-logos' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can update store logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'store-logos' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete store logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'store-logos' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Public can view store logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'store-logos');

-- Create policies for product-images bucket
CREATE POLICY "Users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Create policies for product-files bucket (private downloads)
CREATE POLICY "Users can upload product files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-files' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can update product files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete product files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can download product files they own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );