/*
  # Create Storage Policies

  1. Store Logos Bucket Policies
    - Users can upload/manage their own logos
    - Public can view all logos

  2. Product Images Bucket Policies  
    - Users can upload/manage their own product images
    - Public can view all product images

  3. Product Files Bucket Policies
    - Users can upload/manage their own files
    - Only file owners can download files
*/

-- Store logos bucket policies
CREATE POLICY "store_logos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-logos');

CREATE POLICY "store_logos_view" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'store-logos');

CREATE POLICY "store_logos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "store_logos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Product images bucket policies
CREATE POLICY "product_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_view" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "product_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Product files bucket policies
CREATE POLICY "product_files_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-files');

CREATE POLICY "product_files_view" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "product_files_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "product_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-files' AND auth.uid()::text = (storage.foldername(name))[1]);