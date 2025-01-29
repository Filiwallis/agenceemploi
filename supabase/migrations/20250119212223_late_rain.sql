/*
  # Ajout de champs pour les offres d'emploi

  1. Nouveaux champs
    - `is_urgent` (boolean) : Indique si l'offre est urgente
    - `contract_duration` (text) : Durée du contrat pour les CDD/Intérim
    - `working_hours` (text) : Horaires de travail
    - `start_date` (date) : Date de début souhaitée
    - `views_count` (int) : Nombre de vues de l'offre

  2. Modifications
    - Ajout de "Intérim" comme type de contrat valide
*/

-- Ajout des nouveaux champs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_urgent boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contract_duration text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views_count int DEFAULT 0;

-- Mise à jour de la contrainte de type de contrat
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS valid_type;
ALTER TABLE jobs ADD CONSTRAINT valid_type 
  CHECK (type IN ('CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim'));

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_job_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs
  SET views_count = views_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour le compteur de vues
DROP TRIGGER IF EXISTS on_job_view ON jobs;
CREATE TRIGGER on_job_view
  AFTER SELECT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION increment_job_views();