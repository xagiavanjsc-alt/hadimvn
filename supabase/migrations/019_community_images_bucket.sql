-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  name = 'community-images';

-- Enable public access for reading
CREATE POLICY "Public read access for community-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'community-images');

-- Enable authenticated users to upload
CREATE POLICY "Authenticated users can upload to community-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.role() = 'authenticated'
  );

-- Enable authenticated users to delete their own images
CREATE POLICY "Users can delete their own community-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
