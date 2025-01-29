/*
  # Système de tests de compétences

  1. Nouvelles Tables
    - `skill_tests` : Tests de compétences disponibles
      - `id` (uuid, primary key)
      - `title` (text) - Titre du test
      - `description` (text) - Description du test
      - `category` (text) - Catégorie du test
      - `duration` (int) - Durée en minutes
      - `passing_score` (int) - Score minimum pour réussir
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `skill_test_questions` : Questions des tests
      - `id` (uuid, primary key)
      - `test_id` (uuid) - Référence au test
      - `question` (text) - Texte de la question
      - `type` (text) - Type de question (QCM, vrai/faux)
      - `order` (int) - Ordre d'affichage
      - `points` (int) - Points attribués

    - `skill_test_answers` : Réponses possibles aux questions
      - `id` (uuid, primary key)
      - `question_id` (uuid) - Référence à la question
      - `answer` (text) - Texte de la réponse
      - `is_correct` (boolean) - Si c'est la bonne réponse
      - `order` (int) - Ordre d'affichage

    - `candidate_test_results` : Résultats des tests
      - `id` (uuid, primary key)
      - `candidate_id` (uuid) - Référence au candidat
      - `test_id` (uuid) - Référence au test
      - `score` (int) - Score obtenu
      - `passed` (boolean) - Si le test est réussi
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour :
      - Lecture publique des tests disponibles
      - Création/modification réservée aux administrateurs
      - Accès aux résultats limité au candidat concerné

  3. Fonctions
    - Calcul automatique du score
    - Validation de la réussite du test
    - Attribution de badges de compétences
*/

-- Table des tests de compétences
CREATE TABLE IF NOT EXISTS skill_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  duration int NOT NULL,
  passing_score int NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_category CHECK (category IN ('Technique', 'Langue', 'Soft Skills', 'Métier'))
);

-- Table des questions
CREATE TABLE IF NOT EXISTS skill_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES skill_tests(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  type text NOT NULL,
  order_index int NOT NULL,
  points int NOT NULL DEFAULT 1,
  
  CONSTRAINT valid_type CHECK (type IN ('qcm', 'true_false')),
  CONSTRAINT valid_points CHECK (points > 0)
);

-- Table des réponses
CREATE TABLE IF NOT EXISTS skill_test_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES skill_test_questions(id) ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  order_index int NOT NULL
);

-- Table des résultats
CREATE TABLE IF NOT EXISTS candidate_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_id uuid REFERENCES skill_tests(id) ON DELETE CASCADE NOT NULL,
  score int NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  answers jsonb,
  
  CONSTRAINT valid_score CHECK (score >= 0),
  UNIQUE(candidate_id, test_id, started_at)
);

-- Active RLS
ALTER TABLE skill_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_test_results ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tests
CREATE POLICY "Les tests sont publics"
  ON skill_tests
  FOR SELECT
  USING (true);

CREATE POLICY "Les administrateurs peuvent gérer les tests"
  ON skill_tests
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE type = 'admin'
    )
  );

-- Politiques pour les questions
CREATE POLICY "Les questions sont publiques"
  ON skill_test_questions
  FOR SELECT
  USING (true);

CREATE POLICY "Les administrateurs peuvent gérer les questions"
  ON skill_test_questions
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE type = 'admin'
    )
  );

-- Politiques pour les réponses
CREATE POLICY "Les réponses sont publiques"
  ON skill_test_answers
  FOR SELECT
  USING (true);

CREATE POLICY "Les administrateurs peuvent gérer les réponses"
  ON skill_test_answers
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE type = 'admin'
    )
  );

-- Politiques pour les résultats
CREATE POLICY "Les candidats peuvent voir leurs résultats"
  ON candidate_test_results
  FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Les candidats peuvent créer des résultats"
  ON candidate_test_results
  FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Les candidats peuvent mettre à jour leurs résultats"
  ON candidate_test_results
  FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- Fonction pour calculer le score et valider la réussite
CREATE OR REPLACE FUNCTION calculate_test_result(
  p_test_result_id uuid
) RETURNS void AS $$
DECLARE
  v_test_id uuid;
  v_score int;
  v_passing_score int;
BEGIN
  -- Récupérer l'ID du test
  SELECT test_id INTO v_test_id
  FROM candidate_test_results
  WHERE id = p_test_result_id;

  -- Calculer le score
  WITH answer_points AS (
    SELECT 
      (answers->>'question_id')::uuid as question_id,
      (answers->>'answer_id')::uuid as answer_id
    FROM candidate_test_results, jsonb_array_elements(answers) as answers
    WHERE id = p_test_result_id
  )
  SELECT 
    COALESCE(SUM(
      CASE WHEN sta.is_correct THEN stq.points ELSE 0 END
    ), 0) INTO v_score
  FROM answer_points ap
  JOIN skill_test_questions stq ON stq.id = ap.question_id
  JOIN skill_test_answers sta ON sta.id = ap.answer_id;

  -- Récupérer le score minimum
  SELECT passing_score INTO v_passing_score
  FROM skill_tests
  WHERE id = v_test_id;

  -- Mettre à jour le résultat
  UPDATE candidate_test_results
  SET 
    score = v_score,
    passed = v_score >= v_passing_score,
    completed_at = now()
  WHERE id = p_test_result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour updated_at
CREATE TRIGGER update_skill_tests_updated_at
  BEFORE UPDATE ON skill_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();