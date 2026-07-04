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

-- Update team stages for qualified teams to Octavos
UPDATE public.teams SET stage_reached = 'octavos' WHERE id IN ('CAN', 'MAR', 'PAR', 'FRA', 'BRA', 'NOR', 'MEX', 'ENG', 'USA', 'BEL', 'POR', 'ESP', 'ARG', 'EGY', 'SUI', 'COL');

-- Seed Initial Fixture (Matches 1 to 24)
INSERT INTO public.matches (id, group_letter, home_team_id, away_team_id, fecha, hora_arg, estadio, ciudad, pais, status, phase) VALUES
(1, 'A', 'MEX', 'RSA', '2026-06-11', '16:00:00-03:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'upcoming', 'Fase de Grupos'),
(2, 'A', 'KOR', 'CZE', '2026-06-11', '23:00:00-03:00', 'Estadio Guadalajara', 'Guadalajara', 'México', 'upcoming', 'Fase de Grupos'),
(3, 'B', 'CAN', 'BIH', '2026-06-12', '16:00:00-03:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'upcoming', 'Fase de Grupos'),
(4, 'B', 'QAT', 'SUI', '2026-06-13', '16:00:00-03:00', 'San Francisco Bay Area Stadium', 'San Francisco', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(5, 'C', 'BRA', 'MAR', '2026-06-13', '19:00:00-03:00', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(6, 'C', 'HAI', 'SCO', '2026-06-13', '22:00:00-03:00', 'Boston Stadium', 'Boston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(7, 'D', 'USA', 'PAR', '2026-06-12', '22:00:00-03:00', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(8, 'D', 'AUS', 'TUR', '2026-06-14', '01:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos'),
(9, 'E', 'GER', 'CUW', '2026-06-14', '14:00:00-03:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(10, 'E', 'CIV', 'ECU', '2026-06-14', '20:00:00-03:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(11, 'F', 'NED', 'JPN', '2026-06-14', '17:00:00-03:00', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(12, 'F', 'SWE', 'TUN', '2026-06-14', '23:00:00-03:00', 'Estadio Monterrey', 'Monterrey', 'México', 'upcoming', 'Fase de Grupos'),
(13, 'G', 'BEL', 'EGY', '2026-06-15', '14:00:00-03:00', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(14, 'G', 'IRN', 'NZL', '2026-06-15', '17:00:00-03:00', 'Estadio Guadalajara', 'Guadalajara', 'México', 'upcoming', 'Fase de Grupos'),
(15, 'H', 'ESP', 'CPV', '2026-06-15', '20:00:00-03:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'upcoming', 'Fase de Grupos'),
(16, 'H', 'KSA', 'URU', '2026-06-15', '23:00:00-03:00', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(17, 'I', 'FRA', 'SEN', '2026-06-16', '14:00:00-03:00', 'Boston Stadium', 'Boston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(18, 'I', 'IRQ', 'NOR', '2026-06-16', '17:00:00-03:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'upcoming', 'Fase de Grupos'),
(19, 'J', 'ARG', 'ALG', '2026-06-16', '20:00:00-03:00', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(20, 'J', 'AUT', 'JOR', '2026-06-16', '23:00:00-03:00', 'Estadio Monterrey', 'Monterrey', 'México', 'upcoming', 'Fase de Grupos'),
(21, 'K', 'POR', 'COD', '2026-06-17', '14:00:00-03:00', 'San Francisco Bay Area Stadium', 'San Francisco', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(22, 'K', 'UZB', 'COL', '2026-06-17', '17:00:00-03:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(23, 'L', 'ENG', 'CRO', '2026-06-17', '20:00:00-03:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(24, 'L', 'GHA', 'PAN', '2026-06-17', '23:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos'),
-- Seed Fecha 2 (Matches 25 to 48)
(25, 'A', 'MEX', 'KOR', '2026-06-18', '16:00:00-03:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'upcoming', 'Fase de Grupos'),
(26, 'A', 'RSA', 'CZE', '2026-06-18', '19:00:00-03:00', 'Estadio Guadalajara', 'Guadalajara', 'México', 'upcoming', 'Fase de Grupos'),
(27, 'B', 'CAN', 'QAT', '2026-06-18', '20:00:00-03:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'upcoming', 'Fase de Grupos'),
(28, 'B', 'BIH', 'SUI', '2026-06-18', '23:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos'),
(29, 'C', 'BRA', 'HAI', '2026-06-19', '14:00:00-03:00', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(30, 'C', 'MAR', 'SCO', '2026-06-19', '17:00:00-03:00', 'Boston Stadium', 'Boston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(31, 'D', 'USA', 'AUS', '2026-06-19', '20:00:00-03:00', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(32, 'D', 'PAR', 'TUR', '2026-06-19', '23:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos'),
(33, 'E', 'GER', 'CIV', '2026-06-20', '14:00:00-03:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(34, 'E', 'CUW', 'ECU', '2026-06-20', '17:00:00-03:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(35, 'F', 'NED', 'SWE', '2026-06-20', '20:00:00-03:00', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(36, 'F', 'JPN', 'TUN', '2026-06-20', '23:00:00-03:00', 'Estadio Monterrey', 'Monterrey', 'México', 'upcoming', 'Fase de Grupos'),
(37, 'G', 'BEL', 'IRN', '2026-06-21', '14:00:00-03:00', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(38, 'G', 'EGY', 'NZL', '2026-06-21', '17:00:00-03:00', 'Estadio Guadalajara', 'Guadalajara', 'México', 'upcoming', 'Fase de Grupos'),
(39, 'H', 'ESP', 'KSA', '2026-06-21', '20:00:00-03:00', 'Mexico City Stadium', 'Ciudad de México', 'México', 'upcoming', 'Fase de Grupos'),
(40, 'H', 'CPV', 'URU', '2026-06-21', '23:00:00-03:00', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(41, 'I', 'FRA', 'IRQ', '2026-06-22', '14:00:00-03:00', 'Boston Stadium', 'Boston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(42, 'I', 'SEN', 'NOR', '2026-06-22', '17:00:00-03:00', 'Toronto Stadium', 'Toronto', 'Canadá', 'upcoming', 'Fase de Grupos'),
(43, 'J', 'ARG', 'AUT', '2026-06-22', '20:00:00-03:00', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(44, 'J', 'ALG', 'JOR', '2026-06-22', '23:00:00-03:00', 'Estadio Monterrey', 'Monterrey', 'México', 'upcoming', 'Fase de Grupos'),
(45, 'K', 'POR', 'UZB', '2026-06-23', '14:00:00-03:00', 'San Francisco Bay Area Stadium', 'San Francisco', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(46, 'K', 'COD', 'COL', '2026-06-23', '17:00:00-03:00', 'Houston Stadium', 'Houston', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(47, 'L', 'ENG', 'GHA', '2026-06-23', '20:00:00-03:00', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 'upcoming', 'Fase de Grupos'),
(48, 'L', 'CRO', 'PAN', '2026-06-23', '23:00:00-03:00', 'BC Place', 'Vancouver', 'Canadá', 'upcoming', 'Fase de Grupos')
ON CONFLICT (id) DO UPDATE SET
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    fecha = EXCLUDED.fecha,
    hora_arg = EXCLUDED.hora_arg,
    estadio = EXCLUDED.estadio,
    ciudad = EXCLUDED.ciudad,
    pais = EXCLUDED.pais;

-- Seed Matches 49 to 96 (Group stage round 3, 16avos, and 8avos)
INSERT INTO public.matches (id, group_letter, home_team_id, away_team_id, fecha, hora_arg, estadio, ciudad, pais, home_score, away_score, home_extra_score, away_extra_score, home_penalty_score, away_penalty_score, status, phase) VALUES
(49, 'A', 'MEX', 'CZE', '2026-06-24', '22:00:00-03', 'Mexico City Stadium', 'Ciudad de México', 'México', 3, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(50, 'A', 'RSA', 'KOR', '2026-06-24', '22:00:00-03', 'Estadio Monterrey', 'Monterrey', 'México', 1, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(51, 'B', 'CAN', 'SUI', '2026-06-24', '17:00:00-03', 'BC Place', 'Vancouver', 'Canadá', 1, 2, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(52, 'B', 'BIH', 'QAT', '2026-06-24', '17:00:00-03', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 3, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(53, 'C', 'BRA', 'SCO', '2026-06-24', '20:00:00-03', 'Miami Stadium', 'Miami', 'Estados Unidos', 3, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(54, 'C', 'MAR', 'HAI', '2026-06-24', '20:00:00-03', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 4, 2, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(55, 'D', 'USA', 'TUR', '2026-06-25', '23:00:00-03', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 2, 3, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(56, 'D', 'PAR', 'AUS', '2026-06-25', '23:00:00-03', 'Levi''s Stadium', 'San Francisco', 'Estados Unidos', 0, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(57, 'E', 'GER', 'ECU', '2026-06-25', '17:00:00-03', 'Houston Stadium', 'Houston', 'Estados Unidos', 1, 2, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(58, 'E', 'CUW', 'CIV', '2026-06-25', '17:00:00-03', 'Lincoln Financial Field', 'Philadelphia', 'Estados Unidos', 0, 2, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(59, 'F', 'NED', 'TUN', '2026-06-25', '20:00:00-03', 'Arrowhead Stadium', 'Kansas City', 'Estados Unidos', 3, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(60, 'F', 'JPN', 'SWE', '2026-06-25', '20:00:00-03', 'AT&T Stadium', 'Dallas', 'Estados Unidos', 1, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(61, 'G', 'BEL', 'NZL', '2026-06-26', '17:00:00-03', 'BC Place', 'Vancouver', 'Canadá', 5, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(62, 'G', 'EGY', 'IRN', '2026-06-26', '17:00:00-03', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 1, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(63, 'H', 'ESP', 'URU', '2026-06-26', '23:00:00-03', 'Estadio Akron', 'Guadalajara', 'México', 1, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(64, 'H', 'CPV', 'KSA', '2026-06-26', '23:00:00-03', 'NRG Stadium', 'Houston', 'Estados Unidos', 0, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(65, 'I', 'FRA', 'NOR', '2026-06-26', '20:00:00-03', 'Gillette Stadium', 'Boston', 'Estados Unidos', 4, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(66, 'I', 'SEN', 'IRQ', '2026-06-26', '20:00:00-03', 'BMO Field', 'Toronto', 'Canadá', 5, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(67, 'J', 'ARG', 'JOR', '2026-06-27', '23:00:00-03', 'AT&T Stadium', 'Dallas', 'Estados Unidos', 3, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(68, 'J', 'ALG', 'AUT', '2026-06-27', '23:00:00-03', 'Arrowhead Stadium', 'Kansas City', 'Estados Unidos', 3, 3, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(69, 'K', 'POR', 'COL', '2026-06-27', '17:00:00-03', 'Hard Rock Stadium', 'Miami', 'Estados Unidos', 0, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(70, 'K', 'COD', 'UZB', '2026-06-27', '17:00:00-03', 'Mercedes-Benz Stadium', 'Atlanta', 'Estados Unidos', 3, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(71, 'L', 'ENG', 'PAN', '2026-06-27', '20:00:00-03', 'MetLife Stadium', 'New York / New Jersey', 'Estados Unidos', 2, 0, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(72, 'L', 'CRO', 'GHA', '2026-06-27', '20:00:00-03', 'Lincoln Financial Field', 'Philadelphia', 'Estados Unidos', 2, 1, NULL, NULL, NULL, NULL, 'finished', 'Fase de Grupos'),
(73, NULL, 'RSA', 'CAN', '2026-06-28', '16:00:00-03', 'Los Angeles Stadium', 'Los Ángeles', 'Estados Unidos', 0, 1, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(74, NULL, 'BRA', 'JPN', '2026-06-29', '14:00:00-03', 'Houston Stadium', 'Houston', 'Estados Unidos', 2, 1, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(75, NULL, 'GER', 'PAR', '2026-06-29', '17:30:00-03', 'Boston Stadium', 'Boston', 'Estados Unidos', 1, 1, 1, 1, 3, 4, 'finished', '16avos de Final'),
(76, NULL, 'NED', 'MAR', '2026-06-30', '22:00:00-03', 'Estadio Monterrey', 'Monterrey', 'México', 1, 1, 1, 1, 2, 3, 'finished', '16avos de Final'),
(77, NULL, 'CIV', 'NOR', '2026-06-30', '14:00:00-03', 'Atlanta Stadium', 'Atlanta', 'Estados Unidos', 1, 2, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(78, NULL, 'FRA', 'SWE', '2026-06-30', '18:00:00-03', 'Philadelphia Stadium', 'Philadelphia', 'Estados Unidos', 3, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(79, NULL, 'MEX', 'ECU', '2026-07-01', '22:00:00-03', 'Mexico City Stadium', 'Ciudad de México', 'México', 2, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(80, NULL, 'ENG', 'COD', '2026-07-01', '13:00:00-03', 'Toronto Stadium', 'Toronto', 'Canadá', 2, 1, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(81, NULL, 'BEL', 'SEN', '2026-07-01', '17:00:00-03', 'San Francisco Bay Area Stadium', 'San Francisco', 'Estados Unidos', 2, 2, 3, 2, NULL, NULL, 'finished', '16avos de Final'),
(82, NULL, 'USA', 'BIH', '2026-07-02', '21:00:00-03', 'Seattle Stadium', 'Seattle', 'Estados Unidos', 2, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(83, NULL, 'ESP', 'AUT', '2026-07-02', '16:00:00-03', 'Dallas Stadium', 'Dallas', 'Estados Unidos', 3, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(84, NULL, 'POR', 'CRO', '2026-07-02', '20:00:00-03', 'Kansas City Stadium', 'Kansas City', 'Estados Unidos', 2, 1, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(85, NULL, 'SUI', 'ALG', '2026-07-03', '23:00:00-03', 'Vancouver Stadium', 'Vancouver', 'Canadá', 2, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(86, NULL, 'AUS', 'EGY', '2026-07-03', '15:00:00-03', 'Estadio Guadalajara', 'Guadalajara', 'México', 1, 1, 1, 1, 2, 4, 'finished', '16avos de Final'),
(87, NULL, 'ARG', 'CPV', '2026-07-03', '19:00:00-03', 'Miami Stadium', 'Miami', 'Estados Unidos', 1, 1, 3, 2, NULL, NULL, 'finished', '16avos de Final'),
(88, NULL, 'COL', 'GHA', '2026-07-04', '22:30:00-03', 'New York New Jersey Stadium', 'New York / New Jersey', 'Estados Unidos', 1, 0, NULL, NULL, NULL, NULL, 'finished', '16avos de Final'),
(89, NULL, 'CAN', 'MAR', '2026-07-04', '14:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(90, NULL, 'PAR', 'FRA', '2026-07-04', '18:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(91, NULL, 'BRA', 'NOR', '2026-07-05', '17:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(92, NULL, 'MEX', 'ENG', '2026-07-05', '21:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(93, NULL, 'USA', 'BEL', '2026-07-06', '21:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(94, NULL, 'POR', 'ESP', '2026-07-06', '16:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(95, NULL, 'ARG', 'EGY', '2026-07-07', '13:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final'),
(96, NULL, 'SUI', 'COL', '2026-07-07', '17:00:00-03', 'Estadio A definir', 'A definir', 'USA/CAN/MEX', NULL, NULL, NULL, NULL, NULL, NULL, 'upcoming', 'Octavos de Final')
ON CONFLICT (id) DO UPDATE SET
    home_team_id = EXCLUDED.home_team_id,
    away_team_id = EXCLUDED.away_team_id,
    fecha = EXCLUDED.fecha,
    hora_arg = EXCLUDED.hora_arg,
    estadio = EXCLUDED.estadio,
    ciudad = EXCLUDED.ciudad,
    pais = EXCLUDED.pais,
    home_score = EXCLUDED.home_score,
    away_score = EXCLUDED.away_score,
    home_extra_score = EXCLUDED.home_extra_score,
    away_extra_score = EXCLUDED.away_extra_score,
    home_penalty_score = EXCLUDED.home_penalty_score,
    away_penalty_score = EXCLUDED.away_penalty_score,
    status = EXCLUDED.status,
    phase = EXCLUDED.phase;

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

-- 12. PUSH_SUBSCRIPTIONS Table (Stores PWA web push subscription tokens)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_profile_subscription UNIQUE (profile_id, subscription)
);

-- Disable Row Level Security (RLS) to allow client-side inserts/deletes from PWA
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
