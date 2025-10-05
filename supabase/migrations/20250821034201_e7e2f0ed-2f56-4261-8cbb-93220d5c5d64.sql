-- Create storage bucket for app assets (icons, covers, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-assets', 'app-assets', true);

-- Create RLS policies for app-assets bucket
CREATE POLICY "Users can upload their own assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "App assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'app-assets');

CREATE POLICY "Users can update their own assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);