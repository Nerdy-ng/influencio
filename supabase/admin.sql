-- Run this in Supabase SQL Editor

-- Add admin-managed columns to profiles
alter table profiles add column if not exists status text default 'active';
alter table profiles add column if not exists verified boolean default false;
alter table profiles add column if not exists tier text default 'fast-rising';
alter table profiles add column if not exists role text default 'talent';
