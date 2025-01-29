/*
  # Système de messagerie

  1. Nouvelles Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence vers profiles)
      - `other_user_id` (uuid, référence vers profiles)
      - `last_message` (text)
      - `last_message_at` (timestamp)
      - `unread_count` (int)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, référence vers conversations)
      - `sender_id` (uuid, référence vers profiles)
      - `receiver_id` (uuid, référence vers profiles)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for conversation participants
    - Add policies for message senders/receivers
*/

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  other_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  unread_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Active RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour les conversations
CREATE POLICY "Les utilisateurs peuvent voir leurs conversations"
  ON conversations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent créer des conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs conversations"
  ON conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour les messages
CREATE POLICY "Les utilisateurs peuvent voir les messages de leurs conversations"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user_id = auth.uid() OR conversations.other_user_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent envoyer des messages"
  ON messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent marquer leurs messages comme lus"
  ON messages
  FOR UPDATE
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Fonction pour mettre à jour la dernière activité d'une conversation
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour la conversation du destinataire
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    unread_count = unread_count + 1
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour la dernière activité
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Fonction pour créer ou récupérer une conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id uuid)
RETURNS uuid AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Vérifier si une conversation existe déjà
  SELECT id INTO conversation_id
  FROM conversations
  WHERE 
    (user_id = auth.uid() AND other_user_id = $1)
    OR 
    (user_id = $1 AND other_user_id = auth.uid());

  -- Si aucune conversation n'existe, en créer une nouvelle
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user_id, other_user_id)
    VALUES (auth.uid(), $1)
    RETURNING id INTO conversation_id;

    -- Créer la conversation miroir pour l'autre utilisateur
    INSERT INTO conversations (user_id, other_user_id)
    VALUES ($1, auth.uid());
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;