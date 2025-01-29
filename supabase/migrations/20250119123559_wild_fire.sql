/*
  # Création de la table des offres d'emploi

  1. Nouvelle Table
    - `jobs`
      - `id` (uuid, clé primaire)
      - `employer_id` (uuid, clé étrangère vers profiles)
      - `title` (text, titre du poste)
      - `company` (text, nom de l'entreprise)
      - `location` (text, lieu)
      - `type` (text, type de contrat)
      - `salary_range` (text, optionnel)
      - `description` (text)
      - `requirements` (text)
      - `benefits` (text, optionnel)
      - `contact_email` (text, optionnel)
      - `deadline` (date, optionnel)
      - `status` (text, statut de l'offre)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `views_count` (int, nombre de vues)
      - `applications_count` (int, nombre de candidatures)

  2. Sécurité
    - Active RLS
    - Politiques pour:
      - Lecture publique des offres actives
      - CRUD pour les employeurs sur leurs propres offres
      - Lecture complète pour les administrateurs
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  salary_range text,
  description text NOT NULL,
  requirements text NOT NULL,
  benefits text,
  contact_email text,
  deadline date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  views_count int DEFAULT 0,
  applications_count int DEFAULT 0,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'closed', 'draft')),
  CONSTRAINT valid_type CHECK (type IN ('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance')),
  CONSTRAINT valid_location CHECK (location IN ('Wallis', 'Futuna', 'Wallis et Futuna'))
);

-- Active RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique pour les offres actives
CREATE POLICY "Les offres actives sont publiques"
  ON jobs
  FOR SELECT
  USING (status = 'active');

-- Politique de création pour les employeurs
CREATE POLICY "Les employeurs peuvent créer des offres"
  ON jobs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE type = 'employer'
    )
  );

-- Politique de mise à jour pour les employeurs
CREATE POLICY "Les employeurs peuvent modifier leurs offres"
  ON jobs
  FOR UPDATE
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

-- Politique de suppression pour les employeurs
CREATE POLICY "Les employeurs peuvent supprimer leurs offres"
  ON jobs
  FOR DELETE
  USING (employer_id = auth.uid());

-- Politique pour les administrateurs
CREATE POLICY "Les administrateurs ont accès complet"
  ON jobs
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE type = 'admin'
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();