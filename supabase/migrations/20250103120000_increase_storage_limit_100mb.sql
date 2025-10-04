-- Aumentar limite de upload do bucket 'products' para 100MB
UPDATE storage.buckets 
SET file_size_limit = 104857600 
WHERE id = 'products';
