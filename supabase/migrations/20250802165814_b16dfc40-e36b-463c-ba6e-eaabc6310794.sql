-- Add allow_pdf_download column to apps table
ALTER TABLE public.apps 
ADD COLUMN allow_pdf_download boolean NOT NULL DEFAULT true;

-- Add allow_pdf_download column to draft_apps table  
ALTER TABLE public.draft_apps 
ADD COLUMN allow_pdf_download boolean NOT NULL DEFAULT true;