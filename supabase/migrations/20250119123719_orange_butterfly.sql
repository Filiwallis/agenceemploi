/*
  # Système de candidature et notifications

  1. Nouvelles Tables
    - `applications`
      - `id` (uuid, clé primaire)
      - `job_id` (uuid, référence vers jobs)
      - `candidate_id` (uuid, référence vers profiles)
      - `status` (text, statut de la candidature)
      - `cover_letter` (text, lettre de motivation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers profiles)
      - `type` (text, type de notification)
      - `title` (text, titre)
      - `message` (text)
      - `link` (text, lien optionnel)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Sécurité
    - Active RLS sur les deux tables
    - Politiques pour:
      - Candidats: CRUD sur leurs candidatures
      - Employeurs: Lecture des candidatures pour leurs offres
      - Utilisateurs: CRUD sur leurs notifications
*/

-- Table des candidatures
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  cover_letter text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  UNIQUE(job_id, candidate_id)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT valid_type CHECK (type IN ('application_status', 'new_application', 'message', 'system'))
);

-- Active RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les candidatures
CREATE POLICY "Les candidats peuvent voir leurs candidatures"
  ON applications
  FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Les candidats peuvent créer des candidatures"
  ON applications
  FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Les candidats peuvent mettre à jour leurs candidatures"
  ON applications
  FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Les employeurs peuvent voir les candidatures pour leurs offres"
  ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Les employeurs peuvent mettre à jour le statut des candidatures"
  ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- Politiques pour les notifications
CREATE POLICY "Les utilisateurs peuvent voir leurs notifications"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour les notifications de candidature
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  job_title text;
  employer_id uuid;
BEGIN
  -- Récupérer le titre de l'offre et l'ID de l'employeur
  SELECT title, employer_id INTO job_title, employer_id
  FROM jobs WHERE id = NEW.job_id;

  -- Si le statut a changé
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notifier le candidat
    PERFORM create_notification(
      NEW.candidate_id,
      'application_status',
      'Mise à jour de votre candidature',
      'Votre candidature pour le poste "' || job_title || '" a été ' ||
      CASE NEW.status
        WHEN 'accepted' THEN 'acceptée'
        WHEN 'rejected' THEN 'refusée'
        ELSE NEW.status
      END,
      '/dashboard/applications'
    );
  END IF;

  -- Si nouvelle candidature
  IF TG_OP = 'INSERT' THEN
    -- Notifier l'employeur
    PERFORM create_notification(
      employer_id,
      'new_application',
      'Nouvelle candidature',
      'Nouvelle candidature pour le poste "' || job_title || '"',
      '/dashboard/jobs/' || NEW.job_id || '/applications'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour les notifications
CREATE TRIGGER on_application_change
  AFTER INSERT OR UPDATE OF status
  ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

-- Trigger pour updated_at sur applications
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();