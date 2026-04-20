-- Allow recordings up to 5 GB per file.
-- Daily.co recordings for 1-hour sessions at 1080p can reach ~2 GB.
UPDATE storage.buckets
SET file_size_limit = 5368709120  -- 5 GB in bytes
WHERE id = 'recordings';
