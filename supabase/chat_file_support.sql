-- Add file attachment support to web chat messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS file_url  text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size text;
