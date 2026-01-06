-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- RLS policies for product-images bucket
CREATE POLICY "Product images are publicly viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their own product images" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete their own product images" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'product-images');

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'avatars');