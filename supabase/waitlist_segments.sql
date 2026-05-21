-- Run this in Supabase SQL Editor

-- View: creator/talent waitlist only
create or replace view waitlist_creators as
  select * from waitlist
  where role = 'creator'
  order by created_at desc;

-- View: brand waitlist only
create or replace view waitlist_brands as
  select * from waitlist
  where role = 'brand'
  order by created_at desc;

-- View: registered talent users (from profiles table)
create or replace view registered_talents as
  select id, email, full_name, created_at
  from profiles
  where role = 'talent'
  order by created_at desc;

-- View: registered brand users
create or replace view registered_brands as
  select id, email, full_name, created_at
  from profiles
  where role = 'brand'
  order by created_at desc;
