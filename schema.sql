-- PRODE MUNDIAL 2026 - DATABASE SCHEMA & SEED SCRIPT
-- Execute this SQL inside your Supabase project's SQL Editor.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    champion_prediction TEXT REFERENCES public.teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. TEAMS Table
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY, -- Standard 3-letter code (e.g., 'ARG', 'BRA')
    name TEXT UNIQUE NOT NULL,
    group_letter CHAR(1) NOT NULL CHECK (group_letter IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
    stage_reached TEXT DEFAULT 'group' NOT NULL CHECK (stage_reached IN ('group', 'octavos', 'cuartos', 'semifinal', 'finalist', 'champion')),
    flag_emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT USING (true);

CREATE POLICY "Only admins can modify teams" 
ON public.teams FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);


-- 3. PARTICIPANTS Table (Each participant drafts exactly 2 teams)
CREATE TABLE IF NOT EXISTS public.participants (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    team1_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    team2_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    selected_at TIMESTAMP WITH TIME ZONE,
    manual_name TEXT, -- Fallback for seeding or mock accounts
    manual_avatar TEXT,
    CONSTRAINT unique_team_selection UNIQUE (team1_id, team2_id)
);

-- Enable RLS for participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants are viewable by everyone" 
ON public.participants FOR SELECT USING (true);

CREATE POLICY "Users can update their own participant selections" 
ON public.participants FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own participant row" 
ON public.participants FOR INSERT WITH CHECK (auth.uid() = profile_id);


-- 4. TOURNAMENT PHASES Table
CREATE TABLE IF NOT EXISTS public.tournament_phases (
    id TEXT PRIMARY KEY, -- 'groups', 'octavos', 'cuartos', 'semis', 'final'
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL
);

ALTER TABLE public.tournament_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Phases are viewable by everyone" ON public.tournament_phases FOR SELECT USING (true);


-- 5. MATCHES Table
CREATE TABLE IF NOT EXISTS public.matches (
    id INTEGER PRIMARY KEY,
    group_letter CHAR(1),
    home_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    away_team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_arg TIME WITH TIME ZONE NOT NULL,
    estadio TEXT,
    ciudad TEXT,
    pais TEXT,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'upcoming' NOT NULL CHECK (status IN ('upcoming', 'live', 'finished')),
    phase TEXT NOT NULL DEFAULT 'Fase de Grupos',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone" 
ON public.matches FOR SELECT USING (true);

CREATE POLICY "Only admins can modify matches" 
ON public.matches FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);


-- 6. PREDICTIONS Table (Optional match-by-match predictions)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id INTEGER REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    UNIQUE (participant_id, match_id)
);

-- Enable RLS for predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Predictions are viewable by everyone" 
ON public.predictions FOR SELECT USING (true);

CREATE POLICY "Users can create their own predictions" 
ON public.predictions FOR INSERT WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Users can update their own predictions" 
ON public.predictions FOR UPDATE USING (auth.uid() = participant_id);


-- 7. STANDINGS Table (Points cache for the leaderboard)
CREATE TABLE IF NOT EXISTS public.standings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    champion_team_id TEXT REFERENCES public.teams(id),
    finalists_count INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for standings
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Standings are viewable by everyone" 
ON public.standings FOR SELECT USING (true);


-- 8. RESULTS Table (Caches team point rules for quick query)
CREATE TABLE IF NOT EXISTS public.results (
    id SERIAL PRIMARY KEY,
    stage_name TEXT NOT NULL UNIQUE, -- 'octavos', 'cuartos', 'semifinal', 'finalist', 'champion'
    points INTEGER NOT NULL
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Results are viewable by everyone" ON public.results FOR SELECT USING (true);


-- 9. ADMIN LOGS Table (Audit trail)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- Enable RLS for admin logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can see admin logs" 
ON public.admin_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);


-- 10. GROUPS Table (Admin-created groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view groups" 
ON public.groups FOR SELECT USING (true);

CREATE POLICY "Admins can create groups" 
ON public.groups FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);

CREATE POLICY "Admins can update groups" 
ON public.groups FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);


-- 11. GROUP_MEMBERS Table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, profile_id)
);

-- Enable RLS for group members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view group members" 
ON public.group_members FOR SELECT USING (true);

CREATE POLICY "Users can join groups" 
ON public.group_members FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins can manage group members" 
ON public.group_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
);


-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed Results / Points structure
INSERT INTO public.results (stage_name, points) VALUES
('octavos', 1),
('cuartos', 2),
('semifinal', 3),
('finalist', 5),
('champion', 8)
ON CONFLICT (stage_name) DO UPDATE SET points = EXCLUDED.points;

-- Seed Tournament Phases
INSERT INTO public.tournament_phases (id, name, is_active) VALUES
('groups', 'Fase de Grupos', true),
('octavos', 'Octavos de Final', false),
('cuartos', 'Cuartos de Final', false),
('semis', 'Semifinal', false),
('final', 'Final', false)
ON CONFLICT (id) DO NOTHING;

-- Seed Teams for the 48 Countries in their respective groups A-L
INSERT INTO public.teams (id, name, group_letter, stage_reached, flag_emoji) VALUES
-- Group A
('MEX', 'México', 'A', 'group', '🇲🇽'),
('RSA', 'Sudáfrica', 'A', 'group', '🇿🇦'),
('KOR', 'Corea del Sur', 'A', 'group', '🇰🇷'),
('CZE', 'República Checa', 'A', 'group', '🇨🇿'),
-- Group B
('CAN', 'Canadá', 'B', 'group', '🇨🇦'),
('BIH', 'Bosnia y Herzegovina', 'B', 'group', '🇧🇦'),
('QAT', 'Catar', 'B', 'group', '🇶🇦'),
('SUI', 'Suiza', 'B', 'group', '🇨🇭'),
-- Group C
('BRA', 'Brasil', 'C', 'group', '🇧🇷'),
('MAR', 'Marruecos', 'C', 'group', '🇲🇦'),
('HAI', 'Haití', 'C', 'group', '🇭🇹'),
('SCO', 'Escocia', 'C', 'group', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
-- Group D
('USA', 'Estados Unidos', 'D', 'group', '🇺🇸'),
('PAR', 'Paraguay', 'D', 'group', '🇵🇾'),
('AUS', 'Australia', 'D', 'group', '🇦🇺'),
('TUR', 'Turquía', 'D', 'group', '🇹🇷'),
-- Group E
('GER', 'Alemania', 'E', 'group', '🇩🇪'),
('CUW', 'Curazao', 'E', 'group', '🇨🇼'),
('CIV', 'Costa de Marfil', 'E', 'group', '🇨🇮'),
('ECU', 'Ecuador', 'E', 'group', '🇪🇨'),
-- Group F
('NED', 'Países Bajos', 'F', 'group', '🇳🇱'),
('JPN', 'Japón', 'F', 'group', '🇯🇵'),
('SWE', 'Suecia', 'F', 'group', '🇸🇪'),
('TUN', 'Túnez', 'F', 'group', '🇹🇳'),
-- Group G
('BEL', 'Bélgica', 'G', 'group', '🇧🇪'),
('EGY', 'Egipto', 'G', 'group', '🇪🇬'),
('IRN', 'Irán', 'G', 'group', '🇮🇷'),
('NZL', 'Nueva Zelanda', 'G', 'group', '🇳🇿'),
-- Group H
('ESP', 'España', 'H', 'group', '🇪🇸'),
('CPV', 'Cabo Verde', 'H', 'group', '🇨🇻'),
('KSA', 'Arabia Saudita', 'H', 'group', '🇸🇦'),
('URU', 'Uruguay', 'H', 'group', '🇺🇾'),
-- Group I
('FRA', 'Francia', 'I', 'group', '🇫🇷'),
('SEN', 'Senegal', 'I', 'group', '🇸🇳'),
('IRQ', 'Irak', 'I', 'group', '🇮🇶'),
('NOR', 'Noruega', 'I', 'group', '🇳🇴'),
-- Group J
('ARG', 'Argentina', 'J', 'group', '🇦🇷'),
('ALG', 'Argelia', 'J', 'group', '🇩🇿'),
('AUT', 'Austria', 'J', 'group', '🇦🇹'),
('JOR', 'Jordania', 'J', 'group', '🇯🇴'),
-- Group K
('POR', 'Portugal', 'K', 'group', '🇵🇹'),
('COD', 'RD Congo', 'K', 'group', '🇨🇩'),
('UZB', 'Uzbekistán', 'K', 'group', '🇺🇿'),
('COL', 'Colombia', 'K', 'group', '🇨🇴'),
-- Group L
('ENG', 'Inglaterra', 'L', 'group', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
('CRO', 'Croacia', 'L', 'group', '🇭🇷'),
('GHA', 'Ghana', 'L', 'group', '🇬🇭'),
('PAN', 'Panamá', 'L', 'group', '🇵🇦')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    group_letter = EXCLUDED.group_letter, 
    flag_emoji = EXCLUDED.flag_emoji;

-- Seed Initial Fixture (Matches 1 to 12)
INSERT INTO public.matches (id, group_letter, home_team_id, away_team_id, fecha, hora_arg, estadio, ciudad, pais, status, phase) VALUES
(1, 'A', 'MEX', 'RSA', '2026-06-11', '16:00:00-03:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'upcoming', 'Fase de Grupos'),
(2, 'A', 'KOR', 'CZE', '2026-06-11', '23:00:00-03:00', 'Estadio Guadalajara', 'Guadalajara', 'México', 'upcoming', 'Fase de Grupos'),
(3, 'B', 'CAN', 'BIH', '2026-06-12', '16:00:00-03:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'upcoming', 'Fase de Grupos'),
(4, 'D', 'USA', 'PAR', '2026-06-12', '22:00:00-03:00', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(5, 'B', 'QAT', 'SUI', '2026-06-13', '16:00:00-03:00', 'San Francisco Bay Area Stadium', 'San Francisco', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(6, 'C', 'BRA', 'MAR', '2026-06-13', '19:00:00-03:00', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(7, 'C', 'HAI', 'SCO', '2026-06-13', '22:00:00-03:00', 'Boston Stadium', 'Boston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(8, 'D', 'AUS', 'TUR', '2026-06-14', '01:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos'),
(9, 'E', 'GER', 'CUW', '2026-06-14', '14:00:00-03:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(10, 'F', 'NED', 'JPN', '2026-06-14', '17:00:00-03:00', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(11, 'E', 'CIV', 'ECU', '2026-06-14', '20:00:00-03:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(12, 'F', 'SWE', 'TUN', '2026-06-14', '23:00:00-03:00', 'Estadio Monterrey', 'Monterrey', 'México', 'upcoming', 'Fase de Grupos')
ON CONFLICT (id) DO UPDATE SET
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    fecha = EXCLUDED.fecha,
    hora_arg = EXCLUDED.hora_arg,
    estadio = EXCLUDED.estadio,
    ciudad = EXCLUDED.ciudad,
    pais = EXCLUDED.pais;

-- Trigger to create profile after auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, is_admin)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', new.email),
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN TRUE ELSE FALSE END -- First user is Admin
    );
    
    INSERT INTO public.participants (profile_id, team1_id, team2_id, manual_name)
    VALUES (new.id, NULL, NULL, COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', new.email));
    
    INSERT INTO public.standings (participant_id, points, finalists_count)
    VALUES (new.id, 0, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
