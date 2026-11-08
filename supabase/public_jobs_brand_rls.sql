-- ── public_jobs brand RLS policies ──────────────────────────────────────────
-- Apply with: supabase db push  (or paste in Supabase SQL editor)
-- These are additive — they do not alter existing SELECT/admin policies.

-- Enable RLS if not already enabled
ALTER TABLE public_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated brand to INSERT their own campaign
-- RLS enforces brand_id = auth.uid(), so the client cannot spoof another brand.
CREATE POLICY "brands can create campaigns"
  ON public_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

-- Allow brands to UPDATE only their own campaigns (e.g. close/reopen)
CREATE POLICY "brands can update own campaigns"
  ON public_jobs
  FOR UPDATE
  USING (auth.uid() = brand_id)
  WITH CHECK (auth.uid() = brand_id);

-- Ensure the existing open-read policy exists (creators browse open jobs).
-- If a "anyone can read open jobs" policy already exists, skip this block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'public_jobs'
      AND policyname = 'anyone can read open jobs'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "anyone can read open jobs"
        ON public_jobs
        FOR SELECT
        USING (status = 'open' OR auth.uid() = brand_id)
    $policy$;
  END IF;
END $$;

-- Allow creators to INSERT their own job_applications
CREATE POLICY "creators can apply to jobs"
  ON job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Allow creators to read their own applications, brands to read applications for their jobs
CREATE POLICY "participants can read applications"
  ON job_applications
  FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM public_jobs
      WHERE public_jobs.id = job_id
        AND public_jobs.brand_id = auth.uid()
    )
  );
