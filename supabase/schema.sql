-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pokedexes table
CREATE TABLE IF NOT EXISTS pokedexes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  generations INT[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Caught Pokemon table
CREATE TABLE IF NOT EXISTS caught_pokemon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pokedex_id UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL,
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pokedex_id, pokemon_id)
);

-- TCG Collections table
CREATE TABLE IF NOT EXISTS tcg_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pokedex_id UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  pokemon_id INT NOT NULL,
  tcg_set TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pokedex_id, pokemon_id, tcg_set)
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pokedex_id_1 UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  pokedex_id_2 UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  winner_id UUID REFERENCES pokedexes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Preview Links table
CREATE TABLE IF NOT EXISTS preview_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pokedex_id UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security (RLS) Policies

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Pokedexes RLS
ALTER TABLE pokedexes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pokedexes"
  ON pokedexes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pokedexes"
  ON pokedexes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pokedexes"
  ON pokedexes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pokedexes"
  ON pokedexes FOR DELETE
  USING (auth.uid() = user_id);

-- Caught Pokemon RLS
ALTER TABLE caught_pokemon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view caught pokemon in their pokedexes"
  ON caught_pokemon FOR SELECT
  USING (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add caught pokemon to their pokedexes"
  ON caught_pokemon FOR INSERT
  WITH CHECK (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete caught pokemon from their pokedexes"
  ON caught_pokemon FOR DELETE
  USING (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

-- TCG Collections RLS
ALTER TABLE tcg_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tcg collections in their pokedexes"
  ON tcg_collections FOR SELECT
  USING (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tcg collections to their pokedexes"
  ON tcg_collections FOR INSERT
  WITH CHECK (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tcg collections from their pokedexes"
  ON tcg_collections FOR DELETE
  USING (
    pokedex_id IN (
      SELECT id FROM pokedexes WHERE user_id = auth.uid()
    )
  );

-- Competitions RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitions they are involved in"
  ON competitions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM pokedexes WHERE id = pokedex_id_1 OR id = pokedex_id_2
    )
    OR auth.uid() = referee_id
  );

CREATE POLICY "Users can create competitions"
  ON competitions FOR INSERT
  WITH CHECK (auth.uid() = referee_id);

-- Preview Links RLS
ALTER TABLE preview_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public preview links"
  ON preview_links FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX idx_pokedexes_user_id ON pokedexes(user_id);
CREATE INDEX idx_caught_pokemon_pokedex_id ON caught_pokemon(pokedex_id);
CREATE INDEX idx_tcg_collections_pokedex_id ON tcg_collections(pokedex_id);
CREATE INDEX idx_competitions_pokedex_id_1 ON competitions(pokedex_id_1);
CREATE INDEX idx_competitions_pokedex_id_2 ON competitions(pokedex_id_2);
CREATE INDEX idx_preview_links_pokedex_id ON preview_links(pokedex_id);
CREATE INDEX idx_preview_links_token ON preview_links(token);
