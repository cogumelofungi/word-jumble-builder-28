-- Create storage bucket for PDF products
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true);

-- Create RLS policies for products bucket
CREATE POLICY "Users can upload their own PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "PDFs are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Users can update their own PDFs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);