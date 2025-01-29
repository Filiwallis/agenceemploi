/*
  # Fonctionnalités de profil étendues

  1. Nouvelles Tables
    - `resumes`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, référence vers profiles)
      - `title` (text)
      - `experience` (text)
      - `education` (text)
      - `skills` (text[])
      - `languages` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `company_profiles`
      - `id` (uuid, primary key)
      - `employer_id` (uuid, référence vers profiles)
      - `logo_url` (text)
      - `industry` (text)
      - `size` (text)
      - `founded_year` (int)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for profile owners
    - Add policies for public viewing
*/

-- Table des CV
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  experience text,
  education text,
  skills text[],
  languages text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des profils entreprise
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  logo_url text,
  industry text,
  size text CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  founded_year int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employer_id)
);

-- Active RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour les CV
CREATE POLICY "Les candidats peuvent gérer leurs CV"
  ON resumes
  FOR ALL
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Les employeurs peuvent voir les CV"
  ON resumes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND type = 'employer'
    )
  );

-- Politiques pour les profils entreprise
CREATE POLICY "Les employeurs peuvent gérer leur profil entreprise"
  ON company_profiles
  FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Les profils entreprise sont publics"
  ON company_profiles
  FOR SELECT
  USING (true);

-- Ajout de champs au profil
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS social_links jsonb,
  ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"email_alerts": true, "application_updates": true, "marketing_emails": false}'::jsonb;

-- Trigger pour updated_at
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();