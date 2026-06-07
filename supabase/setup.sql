-- Todo Dashboard Schema
-- Run this in your Supabase SQL Editor

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA: Import from Google Doc "Daily Priorities"
-- ============================================================

-- Insert subjects
INSERT INTO subjects (name) VALUES
  ('General'),
  ('Qualcomm'),
  ('Dell'),
  ('Lenovo'),
  ('Intel'),
  ('Nvidia'),
  ('Google'),
  ('Temasek'),
  ('Microsoft'),
  ('Meta'),
  ('Amazon'),
  ('Comcast'),
  ('Teradata'),
  ('Mobi Plus'),
  ('Google Cloud'),
  ('Google Cloud (wonder)'),
  ('AWS'),
  ('HSX'),
  ('Vivek Farias'),
  ('Quinn Li'),
  ('UW'),
  ('NY Workers Comp'),
  ('Payroll'),
  ('Ben Coombs Severance'),
  ('Salience Capital'),
  ('Oliver Offer Letter'),
  ('Patent'),
  ('Workers Compensation'),
  ('Corporate Insurance'),
  ('Virtue AI'),
  ('Capmont PE'),
  ('Wind Shanghai Visit'),
  ('Anker Shenzhen Visit'),
  ('Dymon Asia'),
  ('Washington State Dept'),
  ('Yayoi')
ON CONFLICT DO NOTHING;

-- Helper to get subject IDs
DO $$
DECLARE
  general_id UUID;
  qualcomm_id UUID;
  dell_id UUID;
  lenovo_id UUID;
  intel_id UUID;
  nvidia_id UUID;
  google_id UUID;
  temasek_id UUID;
  microsoft_id UUID;
  meta_id UUID;
  amazon_id UUID;
  comcast_id UUID;
  teradata_id UUID;
  mobius_id UUID;
  gcp_id UUID;
  gcp_wonder_id UUID;
  aws_id UUID;
  hsx_id UUID;
  vivek_id UUID;
  quinn_id UUID;
  uw_id UUID;
  ny_wc_id UUID;
  payroll_id UUID;
  ben_id UUID;
  salience_id UUID;
  oliver_id UUID;
  patent_id UUID;
  wc_id UUID;
  insurance_id UUID;
  virtue_id UUID;
  capmont_id UUID;
  wind_id UUID;
  anker_id UUID;
  dymon_id UUID;
  wa_id UUID;
  yayoi_id UUID;
BEGIN
  SELECT id INTO general_id FROM subjects WHERE name = 'General';
  SELECT id INTO qualcomm_id FROM subjects WHERE name = 'Qualcomm';
  SELECT id INTO dell_id FROM subjects WHERE name = 'Dell';
  SELECT id INTO lenovo_id FROM subjects WHERE name = 'Lenovo';
  SELECT id INTO intel_id FROM subjects WHERE name = 'Intel';
  SELECT id INTO nvidia_id FROM subjects WHERE name = 'Nvidia';
  SELECT id INTO google_id FROM subjects WHERE name = 'Google';
  SELECT id INTO temasek_id FROM subjects WHERE name = 'Temasek';
  SELECT id INTO microsoft_id FROM subjects WHERE name = 'Microsoft';
  SELECT id INTO meta_id FROM subjects WHERE name = 'Meta';
  SELECT id INTO amazon_id FROM subjects WHERE name = 'Amazon';
  SELECT id INTO comcast_id FROM subjects WHERE name = 'Comcast';
  SELECT id INTO teradata_id FROM subjects WHERE name = 'Teradata';
  SELECT id INTO mobius_id FROM subjects WHERE name = 'Mobi Plus';
  SELECT id INTO gcp_id FROM subjects WHERE name = 'Google Cloud';
  SELECT id INTO gcp_wonder_id FROM subjects WHERE name = 'Google Cloud (wonder)';
  SELECT id INTO aws_id FROM subjects WHERE name = 'AWS';
  SELECT id INTO hsx_id FROM subjects WHERE name = 'HSX';
  SELECT id INTO vivek_id FROM subjects WHERE name = 'Vivek Farias';
  SELECT id INTO quinn_id FROM subjects WHERE name = 'Quinn Li';
  SELECT id INTO uw_id FROM subjects WHERE name = 'UW';
  SELECT id INTO ny_wc_id FROM subjects WHERE name = 'NY Workers Comp';
  SELECT id INTO payroll_id FROM subjects WHERE name = 'Payroll';
  SELECT id INTO ben_id FROM subjects WHERE name = 'Ben Coombs Severance';
  SELECT id INTO salience_id FROM subjects WHERE name = 'Salience Capital';
  SELECT id INTO oliver_id FROM subjects WHERE name = 'Oliver Offer Letter';
  SELECT id INTO patent_id FROM subjects WHERE name = 'Patent';
  SELECT id INTO wc_id FROM subjects WHERE name = 'Workers Compensation';
  SELECT id INTO insurance_id FROM subjects WHERE name = 'Corporate Insurance';
  SELECT id INTO virtue_id FROM subjects WHERE name = 'Virtue AI';
  SELECT id INTO capmont_id FROM subjects WHERE name = 'Capmont PE';
  SELECT id INTO wind_id FROM subjects WHERE name = 'Wind Shanghai Visit';
  SELECT id INTO anker_id FROM subjects WHERE name = 'Anker Shenzhen Visit';
  SELECT id INTO dymon_id FROM subjects WHERE name = 'Dymon Asia';
  SELECT id INTO wa_id FROM subjects WHERE name = 'Washington State Dept';
  SELECT id INTO yayoi_id FROM subjects WHERE name = 'Yayoi';

  -- General / Long-term todo list
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (general_id, 'Overall 2025 Pokee Corporate Tax', NULL, 'not_started'),
    (general_id, 'Jetro form signature', NULL, 'not_started'),
    (general_id, 'MIT workshop slides submission', '2025-03-25', 'not_started'),
    (general_id, 'Update eric''s contract', NULL, 'not_started'),
    (general_id, 'Update forrest''s contract', NULL, 'not_started'),
    (general_id, 'Kiri salary update 3/15 - 5/15', '2025-05-15', 'not_started'),
    (general_id, 'Property Tax', '2025-04-30', 'not_started');

  -- Qualcomm
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (qualcomm_id, 'Prefill and Decode Speed Optimization', NULL, 'in_progress'),
    (qualcomm_id, 'Demo artifact', '2025-05-25', 'not_started'),
    (qualcomm_id, 'Demo talking points', '2025-05-25', 'not_started'),
    (qualcomm_id, '1-minute video demo', '2025-05-25', 'not_started'),
    (qualcomm_id, 'SOW submission', '2025-05-25', 'not_started'),
    (qualcomm_id, 'LinkedIn and X posts', '2025-05-25', 'not_started'),
    (qualcomm_id, 'Reach-outs to Media and Press', '2025-05-25', 'not_started'),
    (qualcomm_id, 'Reach out to Qualcomm on GPU / NPU memory corruption', '2025-05-25', 'not_started'),
    (qualcomm_id, 'Identify dates to meet with Qualcomm leadership', '2025-05-29', 'not_started');

  -- Dell
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (dell_id, '1-pager and detailed explanation on strategy synergy', '2025-05-17', 'not_started'),
    (dell_id, 'Text Bala with update', '2025-05-18', 'not_started');

  -- Lenovo
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (lenovo_id, 'General intro deck', '2025-05-17', 'not_started'),
    (lenovo_id, 'Text Chhavi with update', '2025-05-18', 'not_started'),
    (lenovo_id, 'Presentation for 5/27', '2025-05-24', 'not_started'),
    (lenovo_id, 'On-device voice + translation model brief', '2025-05-28', 'not_started');

  -- Intel
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (intel_id, 'Confirm testing start for local and server', '2025-05-17', 'not_started');

  -- Nvidia
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (nvidia_id, 'Reach out for co-sell opportunities', '2025-05-20', 'not_started');

  -- Google
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (google_id, 'Follow up on SOW and payment', '2025-05-21', 'not_started'),
    (google_id, 'Sign SOW', '2025-05-25', 'not_started');

  -- Temasek
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (temasek_id, 'Follow up with vibe coding pricing and integration', '2025-05-18', 'not_started');

  -- Microsoft (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (microsoft_id, 'Follow up', 'not_started');

  -- Meta (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (meta_id, 'Follow up', 'not_started');

  -- Amazon (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (amazon_id, 'Follow up', 'not_started');

  -- Comcast
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (comcast_id, 'Follow up with a deck', '2025-05-20', 'not_started');

  -- Teradata
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (teradata_id, 'Follow up again for next steps', NULL, 'not_started'),
    (teradata_id, 'Review NDA', '2025-05-20', 'not_started');

  -- Mobi Plus
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (mobius_id, 'Payment', '2025-05-17', 'not_started');

  -- Google Cloud
  INSERT INTO tasks (subject_id, title, status) VALUES
    (gcp_id, 'Payment', 'not_started');

  -- Google Cloud (wonder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (gcp_wonder_id, 'Payment', 'not_started');

  -- AWS
  INSERT INTO tasks (subject_id, title, description, status) VALUES
    (aws_id, 'Follow up on discount', 'Seems to be not received', 'not_started');

  -- HSX
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (hsx_id, 'Payment', '2025-05-17', 'not_started');

  -- Vivek Farias (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (vivek_id, 'Follow up', 'not_started');

  -- Quinn Li
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (quinn_id, 'Reach out for law firm intros', '2025-05-20', 'not_started');

  -- UW
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (uw_id, 'Lecture slides', '2025-05-20', 'not_started');

  -- NY Workers Comp
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (ny_wc_id, 'Mail out the letter as well as the first check', '2025-05-18', 'not_started'),
    (ny_wc_id, 'Set up account', '2025-05-27', 'not_started');

  -- Payroll
  INSERT INTO tasks (subject_id, title, description, deadline, status) VALUES
    (payroll_id, 'May payroll adjustment', 'Adjust for Ann, Zixuan and Kiri', '2025-05-18', 'not_started');

  -- Ben Coombs Severance
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (ben_id, 'Reimbursement', '2025-05-20', 'not_started'),
    (ben_id, 'Severance agreement', '2025-05-20', 'not_started');

  -- Salience Capital
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (salience_id, 'Financial statement', '2025-05-20', 'not_started');

  -- Oliver Offer Letter
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (oliver_id, 'Send offer letter', '2025-05-20', 'not_started');

  -- Patent
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (patent_id, 'Prepare patent filing', '2025-05-20', 'not_started'),
    (patent_id, 'File patent', '2025-05-25', 'not_started');

  -- Workers Compensation
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (wc_id, 'Workers compensation renewal', '2025-05-20', 'not_started');

  -- Corporate Insurance
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (insurance_id, 'Corporate insurance renewal', '2025-05-20', 'not_started');

  -- Virtue AI
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (virtue_id, 'Follow up', '2025-05-29', 'not_started');

  -- Capmont PE
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (capmont_id, 'Pricing', '2025-05-18', 'not_started');

  -- Wind Shanghai Visit (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (wind_id, 'Plan visit', 'not_started');

  -- Anker Shenzhen Visit (placeholder)
  INSERT INTO tasks (subject_id, title, status) VALUES
    (anker_id, 'Plan visit', 'not_started');

  -- Dymon Asia
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (dymon_id, 'Pitch deck', '2025-05-27', 'not_started');

  -- Washington State Dept
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (wa_id, 'Complete tax payments', '2025-05-24', 'not_started');

  -- Yayoi
  INSERT INTO tasks (subject_id, title, deadline, status) VALUES
    (yayoi_id, 'Follow up on SOW and other partnerships', '2026-06-08', 'not_started');

END $$;
