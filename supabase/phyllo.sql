-- Run this in Supabase SQL Editor

-- Add phyllo_user_id to profiles so we don't create duplicate Phyllo users
alter table profiles add column if not exists phyllo_user_id text;
