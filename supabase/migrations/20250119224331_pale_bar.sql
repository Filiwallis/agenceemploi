/*
  # Système de blog

  1. Nouvelles Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `category` (text)
      - `image_url` (text)
      - `read_time` (text)
      - `author_id` (uuid, référence à profiles)
      - `views_count` (int)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `articles` table
    - Add policies for:
      - Public read access
      - Admin write access
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('Marché de l''emploi', 'Conseils', 'Formation')),
  image_url text NOT NULL,
  read_time text NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  views_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Active RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Les articles sont publics"
  ON articles
  FOR SELECT
  USING (true);

-- Politique de création/modification/suppression pour les administrateurs
CREATE POLICY "Les administrateurs ont accès complet"
  ON articles
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
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour incrémenter le compteur de vues
CREATE OR REPLACE FUNCTION increment_article_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles
  SET views_count = views_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour le compteur de vues
CREATE TRIGGER on_article_view
  AFTER SELECT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION increment_article_views();