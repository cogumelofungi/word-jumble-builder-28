-- Add new bonus columns to apps table
ALTER TABLE public.apps 
ADD COLUMN bonus5_url text,
ADD COLUMN bonus6_url text,
ADD COLUMN bonus7_url text,
ADD COLUMN bonus5_label text DEFAULT 'Bônus 5',
ADD COLUMN bonus6_label text DEFAULT 'Bônus 6',
ADD COLUMN bonus7_label text DEFAULT 'Bônus 7';

-- Add new bonus columns to draft_apps table
ALTER TABLE public.draft_apps 
ADD COLUMN bonus5_url text,
ADD COLUMN bonus6_url text,
ADD COLUMN bonus7_url text,
ADD COLUMN bonus5_label text DEFAULT 'Bônus 5',
ADD COLUMN bonus6_label text DEFAULT 'Bônus 6',
ADD COLUMN bonus7_label text DEFAULT 'Bônus 7';