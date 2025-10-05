-- Add bonus8 and bonus9 columns to apps table
ALTER TABLE public.apps 
ADD COLUMN bonus8_url text,
ADD COLUMN bonus8_label text DEFAULT 'Bônus 8',
ADD COLUMN bonus9_url text,
ADD COLUMN bonus9_label text DEFAULT 'Bônus 9';