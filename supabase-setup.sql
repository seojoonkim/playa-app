CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  sns_account text,
  referral text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anyone" ON membership_applications
  FOR INSERT WITH CHECK (true);
