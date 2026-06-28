import { create } from 'zustand';
import { Team, Match, Standing, Profile, Prediction, Group, GroupMember } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { updateStandings } from './scoring';

// --- SEED DATA FOR DEMO MODE ---

export const INITIAL_TEAMS: Team[] = [
  // Group A
  { id: 'MEX', name: 'México', group_letter: 'A', stage_reached: 'group', flag_emoji: '🇲🇽' },
  { id: 'RSA', name: 'Sudáfrica', group_letter: 'A', stage_reached: 'group', flag_emoji: '🇿🇦' },
  { id: 'KOR', name: 'Corea del Sur', group_letter: 'A', stage_reached: 'group', flag_emoji: '🇰🇷' },
  { id: 'CZE', name: 'República Checa', group_letter: 'A', stage_reached: 'group', flag_emoji: '🇨🇿' },
  // Group B
  { id: 'CAN', name: 'Canadá', group_letter: 'B', stage_reached: 'group', flag_emoji: '🇨🇦' },
  { id: 'BIH', name: 'Bosnia y Herzegovina', group_letter: 'B', stage_reached: 'group', flag_emoji: '🇧🇦' },
  { id: 'QAT', name: 'Catar', group_letter: 'B', stage_reached: 'group', flag_emoji: '🇶🇦' },
  { id: 'SUI', name: 'Suiza', group_letter: 'B', stage_reached: 'group', flag_emoji: '🇨🇭' },
  // Group C
  { id: 'BRA', name: 'Brasil', group_letter: 'C', stage_reached: 'group', flag_emoji: '🇧🇷' },
  { id: 'MAR', name: 'Marruecos', group_letter: 'C', stage_reached: 'group', flag_emoji: '🇲🇦' },
  { id: 'HAI', name: 'Haití', group_letter: 'C', stage_reached: 'group', flag_emoji: '🇭🇹' },
  { id: 'SCO', name: 'Escocia', group_letter: 'C', stage_reached: 'group', flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group D
  { id: 'USA', name: 'Estados Unidos', group_letter: 'D', stage_reached: 'group', flag_emoji: '🇺🇸' },
  { id: 'PAR', name: 'Paraguay', group_letter: 'D', stage_reached: 'group', flag_emoji: '🇵🇾' },
  { id: 'AUS', name: 'Australia', group_letter: 'D', stage_reached: 'group', flag_emoji: '🇦🇺' },
  { id: 'TUR', name: 'Turquía', group_letter: 'D', stage_reached: 'group', flag_emoji: '🇹🇷' },
  // Group E
  { id: 'GER', name: 'Alemania', group_letter: 'E', stage_reached: 'group', flag_emoji: '🇩🇪' },
  { id: 'CUW', name: 'Curazao', group_letter: 'E', stage_reached: 'group', flag_emoji: '🇨🇼' },
  { id: 'CIV', name: 'Costa de Marfil', group_letter: 'E', stage_reached: 'group', flag_emoji: '🇨🇮' },
  { id: 'ECU', name: 'Ecuador', group_letter: 'E', stage_reached: 'group', flag_emoji: '🇪🇨' },
  // Group F
  { id: 'NED', name: 'Países Bajos', group_letter: 'F', stage_reached: 'group', flag_emoji: '🇳🇱' },
  { id: 'JPN', name: 'Japón', group_letter: 'F', stage_reached: 'group', flag_emoji: '🇯🇵' },
  { id: 'SWE', name: 'Suecia', group_letter: 'F', stage_reached: 'group', flag_emoji: '🇸🇪' },
  { id: 'TUN', name: 'Túnez', group_letter: 'F', stage_reached: 'group', flag_emoji: '🇹🇳' },
  // Group G
  { id: 'BEL', name: 'Bélgica', group_letter: 'G', stage_reached: 'group', flag_emoji: '🇧🇪' },
  { id: 'EGY', name: 'Egipto', group_letter: 'G', stage_reached: 'group', flag_emoji: '🇪🇬' },
  { id: 'IRN', name: 'Irán', group_letter: 'G', stage_reached: 'group', flag_emoji: '🇮🇷' },
  { id: 'NZL', name: 'Nueva Zelanda', group_letter: 'G', stage_reached: 'group', flag_emoji: '🇳🇿' },
  // Group H
  { id: 'ESP', name: 'España', group_letter: 'H', stage_reached: 'group', flag_emoji: '🇪🇸' },
  { id: 'CPV', name: 'Cabo Verde', group_letter: 'H', stage_reached: 'group', flag_emoji: '🇨🇻' },
  { id: 'KSA', name: 'Arabia Saudita', group_letter: 'H', stage_reached: 'group', flag_emoji: '🇸🇦' },
  { id: 'URU', name: 'Uruguay', group_letter: 'H', stage_reached: 'group', flag_emoji: '🇺🇾' },
  // Group I
  { id: 'FRA', name: 'Francia', group_letter: 'I', stage_reached: 'group', flag_emoji: '🇫🇷' },
  { id: 'SEN', name: 'Senegal', group_letter: 'I', stage_reached: 'group', flag_emoji: '🇸🇳' },
  { id: 'IRQ', name: 'Irak', group_letter: 'I', stage_reached: 'group', flag_emoji: '🇮🇶' },
  { id: 'NOR', name: 'Noruega', group_letter: 'I', stage_reached: 'group', flag_emoji: '🇳🇴' },
  // Group J
  { id: 'ARG', name: 'Argentina', group_letter: 'J', stage_reached: 'group', flag_emoji: '🇦🇷' },
  { id: 'ALG', name: 'Argelia', group_letter: 'J', stage_reached: 'group', flag_emoji: '🇩🇿' },
  { id: 'AUT', name: 'Austria', group_letter: 'J', stage_reached: 'group', flag_emoji: '🇦🇹' },
  { id: 'JOR', name: 'Jordania', group_letter: 'J', stage_reached: 'group', flag_emoji: '🇯🇴' },
  // Group K
  { id: 'POR', name: 'Portugal', group_letter: 'K', stage_reached: 'group', flag_emoji: '🇵🇹' },
  { id: 'COD', name: 'RD Congo', group_letter: 'K', stage_reached: 'group', flag_emoji: '🇨🇩' },
  { id: 'UZB', name: 'Uzbekistán', group_letter: 'K', stage_reached: 'group', flag_emoji: '🇺🇿' },
  { id: 'COL', name: 'Colombia', group_letter: 'K', stage_reached: 'group', flag_emoji: '🇨🇴' },
  // Group L
  { id: 'ENG', name: 'Inglaterra', group_letter: 'L', stage_reached: 'group', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'CRO', name: 'Croacia', group_letter: 'L', stage_reached: 'group', flag_emoji: '🇭🇷' },
  { id: 'GHA', name: 'Ghana', group_letter: 'L', stage_reached: 'group', flag_emoji: '🇬🇭' },
  { id: 'PAN', name: 'Panamá', group_letter: 'L', stage_reached: 'group', flag_emoji: '🇵🇦' }
];

export const INITIAL_MATCHES: Match[] = [
  // --- FECHA 1 ---
  // Group A
  { id: 1, group_letter: 'A', home_team_id: 'MEX', away_team_id: 'RSA', fecha: '2026-06-11', hora_arg: '16:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 2, group_letter: 'A', home_team_id: 'KOR', away_team_id: 'CZE', fecha: '2026-06-11', hora_arg: '23:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group B
  { id: 3, group_letter: 'B', home_team_id: 'CAN', away_team_id: 'BIH', fecha: '2026-06-12', hora_arg: '16:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 4, group_letter: 'B', home_team_id: 'QAT', away_team_id: 'SUI', fecha: '2026-06-13', hora_arg: '16:00:00-03:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group C
  { id: 5, group_letter: 'C', home_team_id: 'BRA', away_team_id: 'MAR', fecha: '2026-06-13', hora_arg: '19:00:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 6, group_letter: 'C', home_team_id: 'HAI', away_team_id: 'SCO', fecha: '2026-06-13', hora_arg: '22:00:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group D
  { id: 7, group_letter: 'D', home_team_id: 'USA', away_team_id: 'PAR', fecha: '2026-06-12', hora_arg: '22:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 8, group_letter: 'D', home_team_id: 'AUS', away_team_id: 'TUR', fecha: '2026-06-14', hora_arg: '01:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group E
  { id: 9, group_letter: 'E', home_team_id: 'GER', away_team_id: 'CUW', fecha: '2026-06-14', hora_arg: '14:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 10, group_letter: 'E', home_team_id: 'CIV', away_team_id: 'ECU', fecha: '2026-06-14', hora_arg: '20:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group F
  { id: 11, group_letter: 'F', home_team_id: 'NED', away_team_id: 'JPN', fecha: '2026-06-14', hora_arg: '17:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 12, group_letter: 'F', home_team_id: 'SWE', away_team_id: 'TUN', fecha: '2026-06-14', hora_arg: '23:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group G
  { id: 13, group_letter: 'G', home_team_id: 'BEL', away_team_id: 'EGY', fecha: '2026-06-15', hora_arg: '14:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 14, group_letter: 'G', home_team_id: 'IRN', away_team_id: 'NZL', fecha: '2026-06-15', hora_arg: '17:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group H
  { id: 15, group_letter: 'H', home_team_id: 'ESP', away_team_id: 'CPV', fecha: '2026-06-15', hora_arg: '20:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 16, group_letter: 'H', home_team_id: 'KSA', away_team_id: 'URU', fecha: '2026-06-15', hora_arg: '23:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group I
  { id: 17, group_letter: 'I', home_team_id: 'FRA', away_team_id: 'SEN', fecha: '2026-06-16', hora_arg: '14:00:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 18, group_letter: 'I', home_team_id: 'IRQ', away_team_id: 'NOR', fecha: '2026-06-16', hora_arg: '17:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group J
  { id: 19, group_letter: 'J', home_team_id: 'ARG', away_team_id: 'ALG', fecha: '2026-06-16', hora_arg: '20:00:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 20, group_letter: 'J', home_team_id: 'AUT', away_team_id: 'JOR', fecha: '2026-06-16', hora_arg: '23:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group K
  { id: 21, group_letter: 'K', home_team_id: 'POR', away_team_id: 'COD', fecha: '2026-06-17', hora_arg: '14:00:00-03:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 22, group_letter: 'K', home_team_id: 'UZB', away_team_id: 'COL', fecha: '2026-06-17', hora_arg: '17:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group L
  { id: 23, group_letter: 'L', home_team_id: 'ENG', away_team_id: 'CRO', fecha: '2026-06-17', hora_arg: '20:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 24, group_letter: 'L', home_team_id: 'GHA', away_team_id: 'PAN', fecha: '2026-06-17', hora_arg: '23:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },

  // --- FECHA 2 ---
  // Group A
  { id: 25, group_letter: 'A', home_team_id: 'MEX', away_team_id: 'KOR', fecha: '2026-06-18', hora_arg: '16:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 26, group_letter: 'A', home_team_id: 'RSA', away_team_id: 'CZE', fecha: '2026-06-18', hora_arg: '19:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group B
  { id: 27, group_letter: 'B', home_team_id: 'CAN', away_team_id: 'QAT', fecha: '2026-06-18', hora_arg: '20:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 28, group_letter: 'B', home_team_id: 'BIH', away_team_id: 'SUI', fecha: '2026-06-18', hora_arg: '23:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group C
  { id: 29, group_letter: 'C', home_team_id: 'BRA', away_team_id: 'HAI', fecha: '2026-06-19', hora_arg: '14:00:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 30, group_letter: 'C', home_team_id: 'MAR', away_team_id: 'SCO', fecha: '2026-06-19', hora_arg: '17:00:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group D
  { id: 31, group_letter: 'D', home_team_id: 'USA', away_team_id: 'AUS', fecha: '2026-06-19', hora_arg: '20:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 32, group_letter: 'D', home_team_id: 'PAR', away_team_id: 'TUR', fecha: '2026-06-19', hora_arg: '23:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group E
  { id: 33, group_letter: 'E', home_team_id: 'GER', away_team_id: 'CIV', fecha: '2026-06-20', hora_arg: '14:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 34, group_letter: 'E', home_team_id: 'CUW', away_team_id: 'ECU', fecha: '2026-06-20', hora_arg: '17:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group F
  { id: 35, group_letter: 'F', home_team_id: 'NED', away_team_id: 'SWE', fecha: '2026-06-20', hora_arg: '20:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 36, group_letter: 'F', home_team_id: 'JPN', away_team_id: 'TUN', fecha: '2026-06-20', hora_arg: '23:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group G
  { id: 37, group_letter: 'G', home_team_id: 'BEL', away_team_id: 'IRN', fecha: '2026-06-21', hora_arg: '14:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 38, group_letter: 'G', home_team_id: 'EGY', away_team_id: 'NZL', fecha: '2026-06-21', hora_arg: '17:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group H
  { id: 39, group_letter: 'H', home_team_id: 'ESP', away_team_id: 'KSA', fecha: '2026-06-21', hora_arg: '20:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 40, group_letter: 'H', home_team_id: 'CPV', away_team_id: 'URU', fecha: '2026-06-21', hora_arg: '23:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group I
  { id: 41, group_letter: 'I', home_team_id: 'FRA', away_team_id: 'IRQ', fecha: '2026-06-22', hora_arg: '14:00:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 42, group_letter: 'I', home_team_id: 'SEN', away_team_id: 'NOR', fecha: '2026-06-22', hora_arg: '17:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group J
  { id: 43, group_letter: 'J', home_team_id: 'ARG', away_team_id: 'AUT', fecha: '2026-06-22', hora_arg: '20:00:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 44, group_letter: 'J', home_team_id: 'ALG', away_team_id: 'JOR', fecha: '2026-06-22', hora_arg: '23:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group K
  { id: 45, group_letter: 'K', home_team_id: 'POR', away_team_id: 'UZB', fecha: '2026-06-23', hora_arg: '14:00:00-03:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 46, group_letter: 'K', home_team_id: 'COD', away_team_id: 'COL', fecha: '2026-06-23', hora_arg: '17:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group L
  { id: 47, group_letter: 'L', home_team_id: 'ENG', away_team_id: 'GHA', fecha: '2026-06-23', hora_arg: '20:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 48, group_letter: 'L', home_team_id: 'CRO', away_team_id: 'PAN', fecha: '2026-06-23', hora_arg: '23:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },

  // --- FECHA 3 ---
  // Group A
  { id: 49, group_letter: 'A', home_team_id: 'MEX', away_team_id: 'CZE', fecha: '2026-06-24', hora_arg: '22:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 50, group_letter: 'A', home_team_id: 'RSA', away_team_id: 'KOR', fecha: '2026-06-24', hora_arg: '22:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group B
  { id: 51, group_letter: 'B', home_team_id: 'CAN', away_team_id: 'SUI', fecha: '2026-06-24', hora_arg: '17:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 52, group_letter: 'B', home_team_id: 'BIH', away_team_id: 'QAT', fecha: '2026-06-24', hora_arg: '17:00:00-03:00', estadio: 'Seattle Stadium', ciudad: 'Seattle', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group C
  { id: 53, group_letter: 'C', home_team_id: 'BRA', away_team_id: 'SCO', fecha: '2026-06-24', hora_arg: '20:00:00-03:00', estadio: 'Miami Stadium', ciudad: 'Miami', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 54, group_letter: 'C', home_team_id: 'MAR', away_team_id: 'HAI', fecha: '2026-06-24', hora_arg: '20:00:00-03:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group D
  { id: 55, group_letter: 'D', home_team_id: 'USA', away_team_id: 'TUR', fecha: '2026-06-25', hora_arg: '23:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 56, group_letter: 'D', home_team_id: 'PAR', away_team_id: 'AUS', fecha: '2026-06-25', hora_arg: '23:00:00-03:00', estadio: "Levi's Stadium", ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group E
  { id: 57, group_letter: 'E', home_team_id: 'GER', away_team_id: 'ECU', fecha: '2026-06-25', hora_arg: '17:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 58, group_letter: 'E', home_team_id: 'CUW', away_team_id: 'CIV', fecha: '2026-06-25', hora_arg: '17:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group F
  { id: 59, group_letter: 'F', home_team_id: 'NED', away_team_id: 'TUN', fecha: '2026-06-25', hora_arg: '20:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 60, group_letter: 'F', home_team_id: 'JPN', away_team_id: 'SWE', fecha: '2026-06-25', hora_arg: '20:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group G
  { id: 61, group_letter: 'G', home_team_id: 'BEL', away_team_id: 'NZL', fecha: '2026-06-26', hora_arg: '17:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 62, group_letter: 'G', home_team_id: 'EGY', away_team_id: 'IRN', fecha: '2026-06-26', hora_arg: '17:00:00-03:00', estadio: 'Seattle Stadium', ciudad: 'Seattle', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group H
  { id: 63, group_letter: 'H', home_team_id: 'ESP', away_team_id: 'URU', fecha: '2026-06-26', hora_arg: '23:00:00-03:00', estadio: 'Estadio Akron', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 64, group_letter: 'H', home_team_id: 'CPV', away_team_id: 'KSA', fecha: '2026-06-26', hora_arg: '23:00:00-03:00', estadio: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group I
  { id: 65, group_letter: 'I', home_team_id: 'FRA', away_team_id: 'NOR', fecha: '2026-06-26', hora_arg: '20:00:00-03:00', estadio: 'Gillette Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 66, group_letter: 'I', home_team_id: 'SEN', away_team_id: 'IRQ', fecha: '2026-06-26', hora_arg: '20:00:00-03:00', estadio: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group J
  { id: 67, group_letter: 'J', home_team_id: 'ARG', away_team_id: 'JOR', fecha: '2026-06-27', hora_arg: '23:00:00-03:00', estadio: 'AT&T Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 68, group_letter: 'J', home_team_id: 'ALG', away_team_id: 'AUT', fecha: '2026-06-27', hora_arg: '23:00:00-03:00', estadio: 'Arrowhead Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group K
  { id: 69, group_letter: 'K', home_team_id: 'POR', away_team_id: 'COL', fecha: '2026-06-27', hora_arg: '17:00:00-03:00', estadio: 'Hard Rock Stadium', ciudad: 'Miami', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 70, group_letter: 'K', home_team_id: 'COD', away_team_id: 'UZB', fecha: '2026-06-27', hora_arg: '17:00:00-03:00', estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  // Group L
  { id: 71, group_letter: 'L', home_team_id: 'ENG', away_team_id: 'PAN', fecha: '2026-06-27', hora_arg: '20:00:00-03:00', estadio: 'MetLife Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 72, group_letter: 'L', home_team_id: 'CRO', away_team_id: 'GHA', fecha: '2026-06-27', hora_arg: '20:00:00-03:00', estadio: 'Lincoln Financial Field', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  
  // --- 16avos de Final ---
  { id: 73, home_team_id: 'RSA', away_team_id: 'CAN', fecha: '2026-06-28', hora_arg: '16:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 74, home_team_id: 'BRA', away_team_id: 'JPN', fecha: '2026-06-29', hora_arg: '14:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 75, home_team_id: 'GER', away_team_id: 'PAR', fecha: '2026-06-29', hora_arg: '17:30:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 76, home_team_id: 'NED', away_team_id: 'MAR', fecha: '2026-06-30', hora_arg: '22:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: '16avos de Final' },
  { id: 77, home_team_id: 'CIV', away_team_id: 'NOR', fecha: '2026-06-30', hora_arg: '14:00:00-03:00', estadio: 'Atlanta Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 78, home_team_id: 'FRA', away_team_id: 'SWE', fecha: '2026-06-30', hora_arg: '18:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 79, home_team_id: 'MEX', away_team_id: 'ECU', fecha: '2026-07-01', hora_arg: '22:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: '16avos de Final' },
  { id: 80, home_team_id: 'ENG', away_team_id: 'COD', fecha: '2026-07-01', hora_arg: '13:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: '16avos de Final' },
  { id: 81, home_team_id: 'BEL', away_team_id: 'SEN', fecha: '2026-07-01', hora_arg: '17:00:00-03:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 82, home_team_id: 'USA', away_team_id: 'BIH', fecha: '2026-07-02', hora_arg: '21:00:00-03:00', estadio: 'Seattle Stadium', ciudad: 'Seattle', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 83, home_team_id: 'ESP', away_team_id: 'AUT', fecha: '2026-07-02', hora_arg: '16:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 84, home_team_id: 'POR', away_team_id: 'CRO', fecha: '2026-07-02', hora_arg: '20:00:00-03:00', estadio: 'Kansas City Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 85, home_team_id: 'SUI', away_team_id: 'ALG', fecha: '2026-07-03', hora_arg: '23:00:00-03:00', estadio: 'Vancouver Stadium', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: '16avos de Final' },
  { id: 86, home_team_id: 'AUS', away_team_id: 'EGY', fecha: '2026-07-03', hora_arg: '15:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: '16avos de Final' },
  { id: 87, home_team_id: 'ARG', away_team_id: 'CPV', fecha: '2026-07-03', hora_arg: '19:00:00-03:00', estadio: 'Miami Stadium', ciudad: 'Miami', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' },
  { id: 88, home_team_id: 'COL', away_team_id: 'GHA', fecha: '2026-07-04', hora_arg: '22:30:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: '16avos de Final' }
];

export const INITIAL_PROFILES: Profile[] = [
  { id: 'user-ivanlevy', display_name: 'ivanlevy', username: 'ivanlevy', password: 'cata1804', is_admin: true, avatar_url: 'IL', created_at: '', updated_at: '' },
  { id: 'user-alan', display_name: 'alan', username: 'alan', password: 'alan123', is_admin: false, avatar_url: 'AL', created_at: '', updated_at: '' },
  { id: 'user-betu', display_name: 'betu', username: 'betu', password: 'betu123', is_admin: false, avatar_url: 'BE', created_at: '', updated_at: '' },
  { id: 'user-simon', display_name: 'simon', username: 'simon', password: 'simon123', is_admin: false, avatar_url: 'SI', created_at: '', updated_at: '' },
  { id: 'user-valen', display_name: 'valen', username: 'valen', password: 'valen123', is_admin: false, avatar_url: 'VA', created_at: '', updated_at: '' },
  { id: 'user-sofi', display_name: 'sofi', username: 'sofi', password: 'sofi123', is_admin: false, avatar_url: 'SO', created_at: '', updated_at: '' },
  { id: 'user-lionel', display_name: 'lionel', username: 'lionel', password: 'lionel123', is_admin: false, avatar_url: 'LI', created_at: '', updated_at: '' },
  { id: 'user-pochi', display_name: 'pochi', username: 'pochi', password: 'pochi123', is_admin: false, avatar_url: 'PO', created_at: '', updated_at: '' },
  { id: 'user-santi', display_name: 'santi', username: 'santi', password: 'santi123', is_admin: false, avatar_url: 'SA', created_at: '', updated_at: '' },
  { id: 'user-feli', display_name: 'feli', username: 'feli', password: 'feli123', is_admin: false, avatar_url: 'FE', created_at: '', updated_at: '' },
  { id: 'user-fabio', display_name: 'fabio', username: 'fabio', password: 'fabio123', is_admin: false, avatar_url: 'FA', created_at: '', updated_at: '' },
  { id: 'user-denise', display_name: 'denise', username: 'denise', password: 'denise123', is_admin: false, avatar_url: 'DE', created_at: '', updated_at: '' },
  { id: 'user-lucas', display_name: 'lucas', username: 'lucas', password: 'lucas123', is_admin: false, avatar_url: 'LU', created_at: '', updated_at: '' },
  { id: 'user-mati', display_name: 'mati', username: 'mati', password: 'mati123', is_admin: false, avatar_url: 'MA', created_at: '', updated_at: '' },
  { id: 'user-latota', display_name: 'la tota', username: 'la tota', password: 'la tota123', is_admin: false, avatar_url: 'LT', created_at: '', updated_at: '' },
  { id: 'user-ivan', display_name: 'ivan', username: 'ivan', password: 'ivan123', is_admin: false, avatar_url: 'IV', created_at: '', updated_at: '' },
  { id: 'user-barbie', display_name: 'barbie', username: 'barbie', password: 'barbie123', is_admin: false, avatar_url: 'BA', created_at: '', updated_at: '' },
  { id: 'user-tomas', display_name: 'tomas', username: 'tomas', password: 'tomas123', is_admin: false, avatar_url: 'TO', created_at: '', updated_at: '' },
  { id: 'user-monica', display_name: 'monica', username: 'monica', password: 'monica123', is_admin: false, avatar_url: 'MO', created_at: '', updated_at: '' },
  { id: 'user-gafas', display_name: 'gafas', username: 'gafas', password: 'gafas123', is_admin: false, avatar_url: 'GF', created_at: '', updated_at: '' },
  { id: 'user-walo', display_name: 'walo', username: 'walo', password: 'walo123', is_admin: false, avatar_url: 'WL', created_at: '', updated_at: '' },
  { id: 'user-alfie', display_name: 'alfie', username: 'alfie', password: 'alfie123', is_admin: false, avatar_url: 'AF', created_at: '', updated_at: '' },
  { id: 'user-dami', display_name: 'dami', username: 'dami', password: 'dami123', is_admin: false, avatar_url: 'DM', created_at: '', updated_at: '' },
  { id: 'user-ilo', display_name: 'ilo', username: 'ilo', password: 'ilo123', is_admin: false, avatar_url: 'IL', created_at: '', updated_at: '' },
  { id: 'user-ivo', display_name: 'ivo', username: 'ivo', password: 'ivo123', is_admin: false, avatar_url: 'IO', created_at: '', updated_at: '' },
  { id: 'user-alberto', display_name: 'alberto', username: 'alberto', password: 'alberto123', is_admin: false, avatar_url: 'AB', created_at: '', updated_at: '' },
  { id: 'user-golce', display_name: 'golce', username: 'golce', password: 'golce123', is_admin: false, avatar_url: 'GO', created_at: '', updated_at: '' },
];

export const INITIAL_GROUPS: Group[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', name: 'familia', invite_code: '3103', created_at: '2026-06-02T00:00:00Z', created_by: 'user-ivanlevy' },
  { id: 'd0000000-0000-0000-0000-000000000002', name: 'mr martes', invite_code: 'MARTES', created_at: '2026-06-02T00:00:00Z', created_by: 'user-ivanlevy' }
];

export const INITIAL_GROUP_MEMBERS: GroupMember[] = [
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-ivanlevy', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-alan', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-betu', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-simon', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-valen', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-sofi', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-lionel', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-pochi', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-santi', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-feli', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-fabio', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-denise', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-lucas', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-mati', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-latota', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-ivan', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-barbie', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-tomas', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-monica', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000001', profile_id: 'user-alberto', joined_at: '2026-06-02T00:00:00Z' },
  
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-gafas', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-walo', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-alfie', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-dami', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-ilo', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-ivo', joined_at: '2026-06-02T00:00:00Z' },
  { group_id: 'd0000000-0000-0000-0000-000000000002', profile_id: 'user-golce', joined_at: '2026-06-02T00:00:00Z' },
];

// Helper to determine if a match is predictable (open to predictions)
export function isMatchPredictable(match: Match): boolean {
  if (match.status !== 'upcoming') return false;

  let hora = match.hora_arg || '';
  if (/[-+][0-9]{2}$/.test(hora)) {
    hora = hora + ':00';
  }
  const matchDateTimeStr = `${match.fecha}T${hora.includes('-') || hora.includes('+') ? hora : hora + '-03:00'}`;
  const matchTime = new Date(matchDateTimeStr).getTime();

  if (isNaN(matchTime)) {
    return true; // Fallback
  }

  const now = new Date().getTime();
  const diffHours = (matchTime - now) / (1000 * 60 * 60);
  return diffHours >= 1;
}

function encodeProfileAvatar(username: string, password?: string, avatarUrl?: string, championPrediction?: string): string {
  const u = username || '';
  const p = password || '';
  const av = avatarUrl || '';
  const cp = championPrediction || '';
  return `__CREDENTIALS__:${u}:${p}:${av}:${cp}`;
}

function decodeProfileAvatar(avatarUrl: string | null | undefined): { username?: string; password?: string; avatar_url?: string; champion_prediction?: string } {
  if (avatarUrl && avatarUrl.startsWith('__CREDENTIALS__:')) {
    const parts = avatarUrl.split(':');
    const username = parts[1];
    const password = parts[2];
    const originalAvatar = parts[3];
    const championPrediction = parts[4] || undefined;
    return { username, password, avatar_url: originalAvatar, champion_prediction: championPrediction };
  }
  return { avatar_url: avatarUrl || undefined };
}

interface TournamentState {
  teams: Team[];
  matches: Match[];
  profiles: Profile[];
  predictions: Prediction[];
  standings: Standing[];
  groups: Group[];
  groupMembers: GroupMember[];
  currentProfileId: string;
  isDemoMode: boolean;
  isLoading: boolean;
  showTour: boolean;
  tourStep: number;
  setShowTour: (show: boolean) => void;
  setTourStep: (step: number) => void;
  
  // Actions
  initStore: (forceLoading?: boolean, skipSync?: boolean) => Promise<void>;
  setCurrentProfile: (id: string) => void;
  updateMatchScore: (
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
    status: Match['status'],
    homeExtraScore?: number | null,
    awayExtraScore?: number | null,
    homePenaltyScore?: number | null,
    awayPenaltyScore?: number | null,
    homeTeamId?: string | null,
    awayTeamId?: string | null
  ) => Promise<void>;
  updateTeamStage: (teamId: string, stage: Team['stage_reached']) => Promise<void>;
  savePrediction: (
    profileId: string,
    matchId: number,
    homeScore: number,
    awayScore: number,
    homeExtraScore?: number | null,
    awayExtraScore?: number | null,
    homePenaltyScore?: number | null,
    awayPenaltyScore?: number | null
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  autoSeedPredictions: () => Promise<void>;
  addProfile: (displayName: string, username?: string, password?: string, groupId?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  editProfile: (id: string, displayName: string, username: string, password?: string, groupId?: string) => Promise<void>;
  saveChampionPrediction: (profileId: string, teamId: string) => Promise<void>;
  createGroup: (name: string, inviteCode: string) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  savePushSubscription: (profileId: string, subscription: any) => Promise<void>;
  deletePushSubscription: (profileId: string, subscription: any) => Promise<void>;
}

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useStore = create<TournamentState>((set, get) => ({
  teams: [],
  matches: [],
  profiles: [],
  predictions: [],
  standings: [],
  groups: [],
  groupMembers: [],
  currentProfileId: '', // Default to empty string (logged out)
  isDemoMode: true,
  isLoading: true,
  showTour: false,
  tourStep: 0,
  setShowTour: (show) => set({ showTour: show }),
  setTourStep: (step) => set({ tourStep: step }),

  initStore: async (forceLoading = false, skipSync = false) => {
    const isFirstLoad = get().profiles.length === 0;
    if (isFirstLoad || forceLoading) {
      set({ isLoading: true });
    }
    
    const storedActiveProfile = typeof window !== 'undefined' ? localStorage.getItem('prode_active_profile') : null;
    
    // 1. Check if Supabase is configured
    const configured = isSupabaseConfigured();
    set({ isDemoMode: !configured });

    if (configured && supabase) {
      try {
        // Fetch from Supabase
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
        const { data: matchesData, error: matchesError } = await supabase.from('matches').select('*').order('id', { ascending: true });
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
        const { data: predictionsData, error: predictionsError } = await supabase.from('predictions').select('*');
        
        if (teamsError || matchesError || profilesError || predictionsError) {
          throw new Error('Failed to fetch from database: ' + (teamsError?.message || matchesError?.message || profilesError?.message || predictionsError?.message));
        }

        let groupsData: any[] = [];
        let groupMembersData: any[] = [];
        try {
          const { data: g, error: gError } = await supabase.from('groups').select('*');
          if (gError) throw gError;
          if (g) groupsData = g;
          
          const { data: gm, error: gmError } = await supabase.from('group_members').select('*');
          if (gmError) throw gmError;
          if (gm) groupMembersData = gm;
        } catch (e) {
          console.warn('Failed to fetch groups from Supabase, possibly tables not created yet. Falling back to local storage.', e);
        }

        const storedLocalProfiles = typeof window !== 'undefined' ? localStorage.getItem('prode_profiles') : null;
        let localProfiles = storedLocalProfiles ? JSON.parse(storedLocalProfiles) : [];
        
        let dbProfilesRaw = profilesData || [];
        let dbProfiles = dbProfilesRaw.map((p: any) => {
          const decoded = decodeProfileAvatar(p.avatar_url);
          return {
            ...p,
            username: decoded.username || p.username || p.display_name,
            password: decoded.password || p.password,
            avatar_url: decoded.avatar_url,
            champion_prediction: decoded.champion_prediction || p.champion_prediction
          };
        });

        // Force admin password to cata1804 if it exists in database but has different password
        const dbAdmin = dbProfiles.find(p => p.id === 'user-ivanlevy');
        if (dbAdmin && dbAdmin.password !== 'cata1804') {
          if (supabase && !skipSync) {
            try {
              await supabase.from('profiles').update({ avatar_url: encodeProfileAvatar('ivanlevy', 'cata1804', 'IL', dbAdmin.champion_prediction) }).eq('id', 'user-ivanlevy');
              dbAdmin.password = 'cata1804';
              dbAdmin.avatar_url = 'IL';
            } catch (e) {
              console.error('Failed to update admin password to cata1804:', e);
            }
          }
        }

        // Cleanup check: If ivanlevy is not in the profiles, make sure it gets created. Do not wipe other profiles!
        const hasNewAdmin = dbProfiles.some(p => p.id === 'user-ivanlevy') || localProfiles.some((p: any) => p.id === 'user-ivanlevy');
        if (!hasNewAdmin) {
          try {
            if (supabase && !skipSync) {
              await supabase.from('profiles').insert({
                id: 'user-ivanlevy',
                display_name: 'ivanlevy',
                avatar_url: encodeProfileAvatar('ivanlevy', 'cata1804', 'IL'),
                is_admin: true
              });
            }
          } catch (e) {
            console.error('Failed to auto-insert admin:', e);
          }
          dbProfiles.push({
            id: 'user-ivanlevy',
            display_name: 'ivanlevy',
            username: 'ivanlevy',
            password: 'cata1804',
            is_admin: true,
            avatar_url: 'IL',
            created_at: '',
            updated_at: ''
          });
        }

        const mergedProfiles = [...dbProfiles].filter(p => p.username !== 'test123' && p.id !== 'user-test123');
        localProfiles.forEach((lp: any) => {
          if (lp.username !== 'test123' && lp.id !== 'user-test123') {
            const existing = mergedProfiles.find(dp => dp.id === lp.id);
            if (!existing) {
              mergedProfiles.push(lp);
            } else {
              // Merge credentials from local storage into DB-fetched profile if they exist in local but not DB
              if (!existing.username && lp.username) existing.username = lp.username;
              if (!existing.password && lp.password) existing.password = lp.password;
              
              // If local profile has a champion prediction but DB profile doesn't, flag it to sync back to Supabase
              const decodedDbProfile = dbProfiles.find(dp => dp.id === lp.id);
              if (lp.champion_prediction && (!decodedDbProfile || !decodedDbProfile.champion_prediction)) {
                existing.champion_prediction = lp.champion_prediction;
                (existing as any)._needs_sync = true;
              } else if (!existing.champion_prediction && lp.champion_prediction) {
                existing.champion_prediction = lp.champion_prediction;
              }
            }
          }
        });

        // Ensure all INITIAL_PROFILES exist in the merged profiles list and database
        for (const ip of INITIAL_PROFILES) {
          const existing = mergedProfiles.find(p => p.id === ip.id);
          if (!existing) {
            mergedProfiles.push(ip);
          } else {
            if (!existing.username) existing.username = ip.username;
            if (!existing.password) existing.password = ip.password;
          }
          if (supabase && !skipSync && !dbProfiles.some(p => p.id === ip.id)) {
            try {
              await supabase.from('profiles').insert({
                id: ip.id,
                display_name: ip.display_name,
                avatar_url: encodeProfileAvatar(ip.username || ip.display_name, ip.password, ip.avatar_url, ip.champion_prediction),
                is_admin: ip.is_admin
              });
            } catch (e) {
              console.error(`Failed to auto-insert profile ${ip.username}:`, e);
            }
          }
        }

        const storedLocalPredictions = typeof window !== 'undefined' ? localStorage.getItem('prode_predictions') : null;
        const localPredictions = !hasNewAdmin ? [] : (storedLocalPredictions ? JSON.parse(storedLocalPredictions) : []);
        
        const dbPredictions = !hasNewAdmin ? [] : (predictionsData || []);
        const mergedPredictions = [...dbPredictions];
        localPredictions.forEach((lp: any) => {
          if (!mergedPredictions.some(dp => dp.participant_id === lp.participant_id && dp.match_id === lp.match_id)) {
            mergedPredictions.push(lp);
          }
        });

        const storedLocalGroups = typeof window !== 'undefined' ? localStorage.getItem('prode_groups') : null;
        const localGroups: Group[] = storedLocalGroups ? JSON.parse(storedLocalGroups) : [];
        const mergedGroups = [...groupsData];
        localGroups.forEach((lg) => {
          if (!mergedGroups.some(dg => dg.id === lg.id)) {
            mergedGroups.push(lg);
          }
        });
        // Ensure all INITIAL_GROUPS exist in database
        for (const ig of INITIAL_GROUPS) {
          if (!mergedGroups.some(g => g.invite_code.toUpperCase() === ig.invite_code.toUpperCase())) {
            mergedGroups.push(ig);
          }
          if (supabase && !skipSync && !groupsData.some(g => g.invite_code.toUpperCase() === ig.invite_code.toUpperCase())) {
            try {
              await supabase.from('groups').insert({
                id: ig.id,
                name: ig.name,
                invite_code: ig.invite_code,
                created_by: ig.created_by
              });
            } catch (e) {
              console.warn('Failed to insert initial group into Supabase:', e);
            }
          }
        }

        const storedLocalGroupMembers = typeof window !== 'undefined' ? localStorage.getItem('prode_group_members') : null;
        const localGroupMembers: GroupMember[] = storedLocalGroupMembers ? JSON.parse(storedLocalGroupMembers) : [];
        const mergedGroupMembers = [...groupMembersData];
        localGroupMembers.forEach((lgm) => {
          if (!mergedGroupMembers.some(dgm => dgm.group_id === lgm.group_id && dgm.profile_id === lgm.profile_id)) {
            mergedGroupMembers.push(lgm);
          }
        });
        
        // Ensure all INITIAL_GROUP_MEMBERS exist in database
        for (const igm of INITIAL_GROUP_MEMBERS) {
          if (!mergedGroupMembers.some(gm => gm.group_id === igm.group_id && gm.profile_id === igm.profile_id)) {
            mergedGroupMembers.push(igm);
          }
          if (supabase && !skipSync && !groupMembersData.some(gm => gm.group_id === igm.group_id && gm.profile_id === igm.profile_id)) {
            try {
              await supabase.from('group_members').insert({
                group_id: igm.group_id,
                profile_id: igm.profile_id
              });
            } catch (e) {
              console.warn('Failed to insert initial group member into Supabase:', e);
            }
          }
        }

        const teams = (teamsData && teamsData.length > 0) ? teamsData : INITIAL_TEAMS;
        const matches = (matchesData && matchesData.length > 0) ? matchesData : INITIAL_MATCHES;

        // Deduplicate profiles by username and build ID mapping to unify duplicate profiles
        const uniqueProfiles: Profile[] = [];
        const profileIdMapping = new Map<string, string>();

        const rawProfiles = mergedProfiles.length > 0 ? mergedProfiles : INITIAL_PROFILES;
        for (const p of rawProfiles) {
          const uKey = (p.username || p.display_name || '').trim().toLowerCase();
          if (!uKey) continue;
          
          const existing = uniqueProfiles.find(ep => (ep.username || ep.display_name || '').trim().toLowerCase() === uKey);
          if (!existing) {
            uniqueProfiles.push(p);
            profileIdMapping.set(p.id, p.id);
          } else {
            // Keep the one that doesn't start with 'user-' (database UUID) if possible, or just the existing one
            if (existing.id.startsWith('user-') && !p.id.startsWith('user-')) {
              const oldKeptId = existing.id;
              const savedUsername = existing.username;
              const savedPassword = existing.password;
              
              existing.id = p.id;
              existing.display_name = p.display_name;
              existing.avatar_url = p.avatar_url;
              existing.username = savedUsername || p.username;
              existing.password = savedPassword || p.password;
              
              profileIdMapping.set(oldKeptId, p.id);
              profileIdMapping.set(p.id, p.id);
            } else {
              if (p.username) existing.username = p.username;
              if (p.password) existing.password = p.password;
              profileIdMapping.set(p.id, existing.id);
            }
          }
        }

        // Map duplicate/redundant IDs in predictions
        const mappedPredictions = mergedPredictions.map(pred => ({
          ...pred,
          participant_id: profileIdMapping.get(pred.participant_id) || pred.participant_id
        }));

        // Deduplicate predictions
        const uniquePredictions: Prediction[] = [];
        const seenPreds = new Set<string>();
        for (const pred of mappedPredictions) {
          const key = `${pred.participant_id}-${pred.match_id}`;
          if (!seenPreds.has(key)) {
            seenPreds.add(key);
            uniquePredictions.push(pred);
          }
        }

        // Map duplicate/redundant IDs in group members
        const mappedGroupMembers = mergedGroupMembers.map(gm => ({
          ...gm,
          profile_id: profileIdMapping.get(gm.profile_id) || gm.profile_id
        }));

        // Deduplicate group members
        const uniqueGroupMembers: GroupMember[] = [];
        const seenGms = new Set<string>();
        for (const gm of mappedGroupMembers) {
          const key = `${gm.group_id}-${gm.profile_id}`;
          if (!seenGms.has(key)) {
            seenGms.add(key);
            uniqueGroupMembers.push(gm);
          }
        }

        const groups = mergedGroups;
        const currentUserId = storedActiveProfile !== null ? (profileIdMapping.get(storedActiveProfile) || storedActiveProfile) : '';
        const standings = updateStandings(matches, uniquePredictions, uniqueProfiles, teams);

        // Sync any unsynced unique data to database
        if (supabase && !skipSync) {
          try {
            // 1. Sync uniqueProfiles
            for (const p of uniqueProfiles) {
              const inDb = dbProfiles.some(dp => dp.id === p.id);
              if (!inDb) {
                try {
                  await supabase.from('profiles').insert({
                    id: p.id,
                    display_name: p.display_name,
                    avatar_url: encodeProfileAvatar(p.username || p.display_name, p.password, p.avatar_url, p.champion_prediction),
                    is_admin: p.is_admin || false
                  });
                } catch (e) {
                  console.error(`Failed to sync profile ${p.display_name} to database:`, e);
                }
              } else if ((p as any)._needs_sync) {
                try {
                  await supabase.from('profiles').update({
                    avatar_url: encodeProfileAvatar(p.username || p.display_name, p.password, p.avatar_url, p.champion_prediction)
                  }).eq('id', p.id);
                  delete (p as any)._needs_sync;
                } catch (e) {
                  console.error(`Failed to sync/update profile ${p.display_name} champion prediction to database:`, e);
                }
              }
            }
            
            // 2. Sync uniquePredictions
            const missingPredictions = uniquePredictions.filter(
              pred => !dbPredictions.some(dp => dp.participant_id === pred.participant_id && dp.match_id === pred.match_id)
            );
            if (missingPredictions.length > 0) {
              try {
                const records = missingPredictions.map(pred => ({
                  participant_id: pred.participant_id,
                  match_id: pred.match_id,
                  home_score: pred.home_score,
                  away_score: pred.away_score
                }));
                await supabase.from('predictions').upsert(records);
              } catch (e) {
                console.error(`Failed to bulk sync predictions to database:`, e);
              }
            }

            // 3. Sync groups
            for (const g of groups) {
              if (!groupsData.some(dg => dg.id === g.id)) {
                try {
                  await supabase.from('groups').insert({
                    id: g.id,
                    name: g.name,
                    invite_code: g.invite_code,
                    created_by: g.created_by
                  });
                } catch (e) {
                  console.warn(`Failed to sync local group ${g.name} to database:`, e);
                }
              }
            }

            // 4. Sync uniqueGroupMembers
            for (const gm of uniqueGroupMembers) {
              if (!groupMembersData.some(dgm => dgm.group_id === gm.group_id && dgm.profile_id === gm.profile_id)) {
                try {
                  await supabase.from('group_members').insert({
                    group_id: gm.group_id,
                    profile_id: gm.profile_id
                  });
                } catch (e) {
                  console.warn(`Failed to sync local group member to database:`, e);
                }
              }
            }
          } catch (syncErr) {
            console.error('Failed to run database sync:', syncErr);
          }
        }

        set({
          teams,
          matches,
          profiles: uniqueProfiles,
          predictions: uniquePredictions,
          standings,
          groups,
          groupMembers: uniqueGroupMembers,
          currentProfileId: currentUserId,
          isLoading: false
        });
        return;
      } catch (error) {
        console.error('Failed to load from Supabase, falling back to local storage', error);
        set({ isDemoMode: true });
      }
    }

    // 2. Local Storage Fallback (Demo Mode)
    if (typeof window !== 'undefined') {
      const storedTeams = localStorage.getItem('prode_teams');
      const storedMatches = localStorage.getItem('prode_matches');
      const storedProfiles = localStorage.getItem('prode_profiles');
      const storedPredictions = localStorage.getItem('prode_predictions');
      const storedGroups = localStorage.getItem('prode_groups');
      const storedGroupMembers = localStorage.getItem('prode_group_members');

      let profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;
      profiles = profiles.filter((p: any) => p.username !== 'test123' && p.id !== 'user-test123');
      let predictions = storedPredictions ? JSON.parse(storedPredictions) : [];
      let groups = storedGroups ? JSON.parse(storedGroups) : [];
      let groupMembers = storedGroupMembers ? JSON.parse(storedGroupMembers) : [];

      // Cleanup check: If ivanlevy is not in the profiles, clear everything
      if (!profiles.some((p: any) => p.username === 'ivanlevy')) {
        profiles = INITIAL_PROFILES;
        predictions = [];
        groups = [];
        groupMembers = [];
        localStorage.setItem('prode_profiles', JSON.stringify(INITIAL_PROFILES));
        localStorage.removeItem('prode_predictions');
        localStorage.setItem('prode_groups', JSON.stringify([]));
        localStorage.setItem('prode_group_members', JSON.stringify([]));
        localStorage.setItem('prode_active_profile', '');
      }

      // Ensure all INITIAL_PROFILES exist in the profiles list
      INITIAL_PROFILES.forEach(ip => {
        if (!profiles.some((p: any) => p.username === ip.username)) {
          profiles.push(ip);
        }
      });

      // Ensure all INITIAL_GROUPS exist in the groups list
      INITIAL_GROUPS.forEach(ig => {
        if (!groups.some((g: any) => g.invite_code.toUpperCase() === ig.invite_code.toUpperCase())) {
          groups.push(ig);
        }
      });

      // Ensure all INITIAL_GROUP_MEMBERS exist in groupMembers list
      INITIAL_GROUP_MEMBERS.forEach(igm => {
        if (!groupMembers.some((gm: any) => gm.group_id === igm.group_id && gm.profile_id === igm.profile_id)) {
          groupMembers.push(igm);
        }
      });

      const teams = storedTeams ? JSON.parse(storedTeams) : INITIAL_TEAMS;
      let matches = storedMatches ? JSON.parse(storedMatches) : INITIAL_MATCHES;
      if (matches.length < INITIAL_MATCHES.length) {
        const missingMatches = INITIAL_MATCHES.filter(im => !matches.some((m: any) => m.id === im.id));
        matches = [...matches, ...missingMatches];
        localStorage.setItem('prode_matches', JSON.stringify(matches));
      }

      // Deduplicate profiles by username and build ID mapping to unify duplicate profiles
      const uniqueProfiles: Profile[] = [];
      const profileIdMapping = new Map<string, string>();

      for (const p of profiles) {
        const uKey = (p.username || p.display_name || '').trim().toLowerCase();
        if (!uKey) continue;
        
        const existing = uniqueProfiles.find(ep => (ep.username || ep.display_name || '').trim().toLowerCase() === uKey);
        if (!existing) {
          uniqueProfiles.push(p);
          profileIdMapping.set(p.id, p.id);
        } else {
          if (p.username) existing.username = p.username;
          if (p.password) existing.password = p.password;
          profileIdMapping.set(p.id, existing.id);
        }
      }

      // Map duplicate/redundant IDs in predictions
      const mappedPredictions = predictions.map((pred: any) => ({
        ...pred,
        participant_id: profileIdMapping.get(pred.participant_id) || pred.participant_id
      }));

      // Deduplicate predictions
      const uniquePredictions: Prediction[] = [];
      const seenPreds = new Set<string>();
      for (const pred of mappedPredictions) {
        const key = `${pred.participant_id}-${pred.match_id}`;
        if (!seenPreds.has(key)) {
          seenPreds.add(key);
          uniquePredictions.push(pred);
        }
      }

      // Map duplicate/redundant IDs in group members
      const mappedGroupMembers = groupMembers.map((gm: any) => ({
        ...gm,
        profile_id: profileIdMapping.get(gm.profile_id) || gm.profile_id
      }));

      // Deduplicate group members
      const uniqueGroupMembers: GroupMember[] = [];
      const seenGms = new Set<string>();
      for (const gm of mappedGroupMembers) {
        const key = `${gm.group_id}-${gm.profile_id}`;
        if (!seenGms.has(key)) {
          seenGms.add(key);
          uniqueGroupMembers.push(gm);
        }
      }

      const currentProfileId = !uniqueProfiles.some((p: any) => p.id === storedActiveProfile) ? '' : (profileIdMapping.get(storedActiveProfile || '') || storedActiveProfile || '');

      // Always save back to guarantee consistency
      localStorage.setItem('prode_teams', JSON.stringify(teams));
      localStorage.setItem('prode_matches', JSON.stringify(matches));
      localStorage.setItem('prode_profiles', JSON.stringify(uniqueProfiles));
      localStorage.setItem('prode_predictions', JSON.stringify(uniquePredictions));
      localStorage.setItem('prode_groups', JSON.stringify(groups));
      localStorage.setItem('prode_group_members', JSON.stringify(uniqueGroupMembers));
      localStorage.setItem('prode_active_profile', currentProfileId);

      const standings = updateStandings(matches, uniquePredictions, uniqueProfiles, teams);

      set({
        teams,
        matches,
        profiles: uniqueProfiles,
        predictions: uniquePredictions,
        standings,
        groups,
        groupMembers: uniqueGroupMembers,
        currentProfileId,
        isLoading: false
      });
    } else {
      set({
        teams: INITIAL_TEAMS,
        matches: INITIAL_MATCHES,
        profiles: INITIAL_PROFILES,
        predictions: [],
        groups: [],
        groupMembers: [],
        standings: updateStandings(INITIAL_MATCHES, [], INITIAL_PROFILES, INITIAL_TEAMS),
        isLoading: false
      });
    }
  },

  setCurrentProfile: (id: string) => {
    set({ currentProfileId: id });
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_active_profile', id);
    }
  },

  updateMatchScore: async (
    matchId: number,
    homeScore: number | null,
    awayScore: number | null,
    status: Match['status'],
    homeExtraScore?: number | null,
    awayExtraScore?: number | null,
    homePenaltyScore?: number | null,
    awayPenaltyScore?: number | null,
    homeTeamId?: string | null,
    awayTeamId?: string | null
  ) => {
    const { matches, predictions, profiles } = get();

    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { 
            ...m, 
            home_score: homeScore, 
            away_score: awayScore, 
            status,
            home_extra_score: homeExtraScore !== undefined ? homeExtraScore : m.home_extra_score,
            away_extra_score: awayExtraScore !== undefined ? awayExtraScore : m.away_extra_score,
            home_penalty_score: homePenaltyScore !== undefined ? homePenaltyScore : m.home_penalty_score,
            away_penalty_score: awayPenaltyScore !== undefined ? awayPenaltyScore : m.away_penalty_score,
            home_team_id: homeTeamId !== undefined && homeTeamId !== null ? homeTeamId : m.home_team_id,
            away_team_id: awayTeamId !== undefined && awayTeamId !== null ? awayTeamId : m.away_team_id
          } 
        : m
    );

    const standings = updateStandings(updatedMatches, predictions, profiles, get().teams);

    set({ matches: updatedMatches, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_matches', JSON.stringify(updatedMatches));
    }
  },

  updateTeamStage: async (teamId: string, stage: Team['stage_reached']) => {
    const { isDemoMode, teams, matches, predictions, profiles } = get();

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, stage_reached: stage } : t
    );

    const standings = updateStandings(matches, predictions, profiles, updatedTeams);

    set({ teams: updatedTeams, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_teams', JSON.stringify(updatedTeams));
    }

    if (!isDemoMode && supabase) {
      await supabase.from('teams').update({
        stage_reached: stage
      }).eq('id', teamId);
    }
  },

  savePrediction: async (
    profileId: string,
    matchId: number,
    homeScore: number,
    awayScore: number,
    homeExtraScore?: number | null,
    awayExtraScore?: number | null,
    homePenaltyScore?: number | null,
    awayPenaltyScore?: number | null
  ) => {
    const { isDemoMode, predictions, matches, profiles } = get();

    // Enforce the 1 hour lock
    const match = matches.find(m => m.id === matchId);
    if (match && !isMatchPredictable(match)) {
      throw new Error('La predicción está cerrada para este partido (cierre de 1h).');
    }

    // Validate prediction scores are between 0 and 20
    if (homeScore < 0 || homeScore > 20 || awayScore < 0 || awayScore > 20) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }

    // If extra time or penalty scores are passed, validate them
    if (homeExtraScore !== undefined && homeExtraScore !== null && (homeExtraScore < 0 || homeExtraScore > 20)) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }
    if (awayExtraScore !== undefined && awayExtraScore !== null && (awayExtraScore < 0 || awayExtraScore > 20)) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }
    if (homePenaltyScore !== undefined && homePenaltyScore !== null && (homePenaltyScore < 0 || homePenaltyScore > 20)) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }
    if (awayPenaltyScore !== undefined && awayPenaltyScore !== null && (awayPenaltyScore < 0 || awayPenaltyScore > 20)) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }

    const existingIdx = predictions.findIndex(p => p.participant_id === profileId && p.match_id === matchId);
    let updatedPredictions = [...predictions];

    const newPredData = {
      home_score: homeScore,
      away_score: awayScore,
      home_extra_score: homeExtraScore !== undefined ? homeExtraScore : null,
      away_extra_score: awayExtraScore !== undefined ? awayExtraScore : null,
      home_penalty_score: homePenaltyScore !== undefined ? homePenaltyScore : null,
      away_penalty_score: awayPenaltyScore !== undefined ? awayPenaltyScore : null
    };

    if (existingIdx > -1) {
      updatedPredictions[existingIdx] = { 
        ...updatedPredictions[existingIdx], 
        ...newPredData
      };
    } else {
      updatedPredictions.push({
        id: Math.random().toString(36).substring(7),
        participant_id: profileId,
        match_id: matchId,
        ...newPredData
      });
    }

    const standings = updateStandings(matches, updatedPredictions, profiles, get().teams);

    set({ predictions: updatedPredictions, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_predictions', JSON.stringify(updatedPredictions));
    }

    if (!isDemoMode && supabase) {
      await supabase.from('predictions').upsert({
        participant_id: profileId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
        home_extra_score: homeExtraScore !== undefined ? homeExtraScore : null,
        away_extra_score: awayExtraScore !== undefined ? awayExtraScore : null,
        home_penalty_score: homePenaltyScore !== undefined ? homePenaltyScore : null,
        away_penalty_score: awayPenaltyScore !== undefined ? awayPenaltyScore : null
      });
    }
  },

  resetToDefaults: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prode_teams');
      localStorage.removeItem('prode_matches');
      localStorage.removeItem('prode_profiles');
      localStorage.removeItem('prode_predictions');
      localStorage.removeItem('prode_active_profile');
    }

    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      await supabase.from('teams').update({ stage_reached: 'group' }).neq('id', 'NONE');
      await supabase.from('matches').update({ home_score: null, away_score: null, status: 'upcoming' }).gt('id', 0);
      await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Reload the store
    await get().initStore();
  },

  autoSeedPredictions: async () => {
    const { matches, profiles } = get();
    
    // Generate random predictions for each user and each match
    const seededPredictions: Prediction[] = [];
    profiles.forEach(profile => {
      matches.forEach(match => {
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        
        seededPredictions.push({
          id: Math.random().toString(36).substring(7),
          participant_id: profile.id,
          match_id: match.id,
          home_score: homeScore,
          away_score: awayScore,
          created_at: new Date().toISOString()
        });
      });
    });

    const standings = updateStandings(matches, seededPredictions, profiles, get().teams);
    set({ predictions: seededPredictions, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_predictions', JSON.stringify(seededPredictions));
    }

    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      const records = seededPredictions.map(pred => ({
        participant_id: pred.participant_id,
        match_id: pred.match_id,
        home_score: pred.home_score,
        away_score: pred.away_score
      }));
      try {
        await supabase.from('predictions').upsert(records);
      } catch (e) {
        console.error('Failed to bulk upsert seeded predictions:', e);
      }
    }
  },

  addProfile: async (displayName: string, username?: string, password?: string, groupId?: string) => {
    const { isDemoMode, profiles, matches, predictions } = get();

    const u = (username || displayName).trim().toLowerCase();
    const p = (password || '1234').trim();

    if (u.length < 4 || u.length > 14) {
      throw new Error('El nombre de usuario debe tener entre 4 y 14 caracteres.');
    }
    if (p.length < 4 || p.length > 14) {
      throw new Error('La contraseña debe tener entre 4 y 14 caracteres.');
    }

    const isDuplicate = profiles.some(prof => prof.username?.toLowerCase() === u);
    if (isDuplicate) {
      throw new Error('El nombre de usuario ya está registrado.');
    }

    // Generate a valid UUID
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'f0000000-0000-0000-0000-000000000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));

    const newProfile: Profile = {
      id: newId,
      display_name: displayName.trim(),
      username: u,
      password: p,
      is_admin: false,
      avatar_url: displayName.substring(0, 2).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedProfiles = [...profiles, newProfile];
    const standings = updateStandings(matches, predictions, updatedProfiles, get().teams);

    let updatedGroupMembers = get().groupMembers;
    if (groupId) {
      updatedGroupMembers = [
        ...updatedGroupMembers,
        {
          group_id: groupId,
          profile_id: newId,
          joined_at: new Date().toISOString()
        }
      ];
    }

    set({ profiles: updatedProfiles, standings, groupMembers: updatedGroupMembers });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
      if (groupId) {
        localStorage.setItem('prode_group_members', JSON.stringify(updatedGroupMembers));
      }
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('profiles').insert({
          id: newId,
          display_name: newProfile.display_name,
          avatar_url: encodeProfileAvatar(u, p, newProfile.avatar_url, newProfile.champion_prediction),
          is_admin: false
        });
        if (groupId) {
          await supabase.from('group_members').insert({
            group_id: groupId,
            profile_id: newId
          });
        }
      } catch (e) {
        console.error('Failed to sync new profile or group membership to Supabase:', e);
      }
    }
  },

  deleteProfile: async (id: string) => {
    const { isDemoMode, profiles, matches, predictions, currentProfileId } = get();
 
    // Prevent deleting active user
    if (id === currentProfileId) return;
 
    const updatedProfiles = profiles.filter(p => p.id !== id);
    const updatedPredictions = predictions.filter(p => p.participant_id !== id);
    const standings = updateStandings(matches, updatedPredictions, updatedProfiles, get().teams);
 
    let nextProfileId = currentProfileId;
    if (currentProfileId === id) {
      nextProfileId = 'user-ivanlevy';
    }
 
    set({ 
      profiles: updatedProfiles, 
      predictions: updatedPredictions, 
      standings,
      currentProfileId: nextProfileId
    });
 
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
      localStorage.setItem('prode_predictions', JSON.stringify(updatedPredictions));
      localStorage.setItem('prode_active_profile', nextProfileId);
    }
 
    if (!isDemoMode && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete profile from Supabase:', e);
      }
    }
  },
 
  editProfile: async (id: string, displayName: string, username: string, password?: string, groupId?: string) => {
    const { isDemoMode, profiles, matches, predictions } = get();
 
    const u = username.trim().toLowerCase();
    const p = password?.trim();
 
    if (u.length < 4 || u.length > 14) {
      throw new Error('El nombre de usuario debe tener entre 4 y 14 caracteres.');
    }
    if (p && (p.length < 4 || p.length > 14)) {
      throw new Error('La contraseña debe tener entre 4 y 14 caracteres.');
    }
 
    const isDuplicate = profiles.some(prof => prof.id !== id && prof.username?.toLowerCase() === u);
    if (isDuplicate) {
      throw new Error('El nombre de usuario ya está registrado.');
    }
 
    const updatedProfiles = profiles.map(prof => {
      if (prof.id === id) {
        return {
          ...prof,
          display_name: displayName.trim(),
          username: u,
          ...(p ? { password: p } : {}),
          avatar_url: displayName.substring(0, 2).toUpperCase(),
          updated_at: new Date().toISOString()
        };
      }
      return prof;
    });
 
    const standings = updateStandings(matches, predictions, updatedProfiles, get().teams);
    
    let updatedGroupMembers = get().groupMembers.filter(gm => gm.profile_id !== id);
    if (groupId) {
      updatedGroupMembers.push({
        group_id: groupId,
        profile_id: id,
        joined_at: new Date().toISOString()
      });
    }

    set({ profiles: updatedProfiles, standings, groupMembers: updatedGroupMembers });
 
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
      localStorage.setItem('prode_group_members', JSON.stringify(updatedGroupMembers));
    }
 
    if (!isDemoMode && supabase) {
      try {
        const targetProfile = updatedProfiles.find(prof => prof.id === id);
        const encodedAvatar = encodeProfileAvatar(
          targetProfile?.username || u,
          targetProfile?.password || p || '1234',
          targetProfile?.avatar_url || displayName.substring(0, 2).toUpperCase(),
          targetProfile?.champion_prediction
        );

        const updateData: any = {
          display_name: displayName.trim(),
          avatar_url: encodedAvatar
        };
        await supabase.from('profiles').update(updateData).eq('id', id);

        await supabase.from('group_members').delete().eq('profile_id', id);
        if (groupId) {
          await supabase.from('group_members').insert({
            group_id: groupId,
            profile_id: id
          });
        }
      } catch (e) {
        console.error('Failed to sync updated profile or group membership to Supabase:', e);
      }
    }
  },

  saveChampionPrediction: async (profileId: string, teamId: string) => {
    const { isDemoMode, profiles, teams, matches, predictions } = get();

    // Check 24 hours lock before tournament starts (June 11, 2026 16:00:00 UTC-3)
    const deadline = new Date('2026-06-10T16:00:00-03:00').getTime();
    if (new Date().getTime() >= deadline) {
      throw new Error('El pronóstico de campeón está cerrado (cierre de 24hs antes del mundial).');
    }

    const updatedProfiles = profiles.map(p => 
      p.id === profileId ? { ...p, champion_prediction: teamId } : p
    );

    const standings = updateStandings(matches, predictions, updatedProfiles, teams);

    set({ profiles: updatedProfiles, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
    }

    if (!isDemoMode && supabase) {
      try {
        const { error } = await supabase.from('profiles').update({
          champion_prediction: teamId
        }).eq('id', profileId);
        
        if (error) {
          console.warn('Supabase update returned an error (likely due to missing champion_prediction column in profiles table). Falling back to localStorage.', error);
        }

        // Also update the encoded credentials inside avatar_url to persist champion_prediction in Supabase!
        const profileToUpdate = updatedProfiles.find(p => p.id === profileId);
        if (profileToUpdate) {
          const encodedAvatar = encodeProfileAvatar(
            profileToUpdate.username || profileToUpdate.display_name.toLowerCase(),
            profileToUpdate.password,
            profileToUpdate.avatar_url,
            teamId
          );
          await supabase.from('profiles').update({
            avatar_url: encodedAvatar
          }).eq('id', profileId);
        }
      } catch (e) {
        console.error('Failed to sync champion prediction to Supabase:', e);
      }
    }
  },

  createGroup: async (name: string, inviteCode: string) => {
    const { isDemoMode, groups, groupMembers, currentProfileId } = get();
    const cleanName = name.trim();
    const cleanCode = inviteCode.trim().toUpperCase();

    if (!cleanName || !cleanCode) {
      throw new Error('El nombre y el código de invitación son obligatorios.');
    }
    if (cleanCode.length < 3 || cleanCode.length > 10) {
      throw new Error('El código debe tener entre 3 y 10 caracteres.');
    }

    const isCodeDuplicate = groups.some(g => g.invite_code.toUpperCase() === cleanCode);
    if (isCodeDuplicate) {
      throw new Error('Ya existe un grupo con ese código de invitación.');
    }

    const newGroupId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'g0000000-0000-0000-0000-000000000000'.replace(/0/g, () => Math.floor(Math.random() * 16).toString(16));
    const nowStr = new Date().toISOString();

    const newGroup: Group = {
      id: newGroupId,
      name: cleanName,
      invite_code: cleanCode,
      created_at: nowStr,
      created_by: currentProfileId
    };

    const newMember: GroupMember = {
      group_id: newGroupId,
      profile_id: currentProfileId,
      joined_at: nowStr
    };

    const updatedGroups = [...groups, newGroup];
    const updatedMembers = [...groupMembers, newMember];

    set({ groups: updatedGroups, groupMembers: updatedMembers });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_groups', JSON.stringify(updatedGroups));
      localStorage.setItem('prode_group_members', JSON.stringify(updatedMembers));
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('groups').insert({
          id: newGroupId,
          name: cleanName,
          invite_code: cleanCode,
          created_by: currentProfileId
        });
        await supabase.from('group_members').insert({
          group_id: newGroupId,
          profile_id: currentProfileId
        });
      } catch (e) {
        console.error('Failed to save group to Supabase:', e);
      }
    }
  },

  joinGroup: async (inviteCode: string) => {
    const { isDemoMode, groups, groupMembers, currentProfileId } = get();
    const cleanCode = inviteCode.trim().toUpperCase();

    if (!cleanCode) {
      throw new Error('El código de invitación es obligatorio.');
    }

    const group = groups.find(g => g.invite_code.toUpperCase() === cleanCode);
    if (!group) {
      throw new Error('Código de invitación inválido o el grupo no existe.');
    }

    const isAlreadyMember = groupMembers.some(gm => gm.group_id === group.id && gm.profile_id === currentProfileId);
    if (isAlreadyMember) {
      throw new Error('Ya perteneces a este grupo.');
    }

    const newMember: GroupMember = {
      group_id: group.id,
      profile_id: currentProfileId,
      joined_at: new Date().toISOString()
    };

    const updatedMembers = [...groupMembers, newMember];
    set({ groupMembers: updatedMembers });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_group_members', JSON.stringify(updatedMembers));
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('group_members').insert({
          group_id: group.id,
          profile_id: currentProfileId
        });
      } catch (e) {
        console.error('Failed to join group in Supabase:', e);
      }
    }
  },

  leaveGroup: async (groupId: string) => {
    const { isDemoMode, groupMembers, currentProfileId } = get();
    const updatedMembers = groupMembers.filter(gm => !(gm.group_id === groupId && gm.profile_id === currentProfileId));

    set({ groupMembers: updatedMembers });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_group_members', JSON.stringify(updatedMembers));
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('group_members').delete().eq('group_id', groupId).eq('profile_id', currentProfileId);
      } catch (e) {
        console.error('Failed to leave group in Supabase:', e);
      }
    }
  },

  savePushSubscription: async (profileId: string, subscription: any) => {
    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      try {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('profile_id', profileId)
          .eq('subscription->>endpoint', subscription.endpoint);
        
        if (!data || data.length === 0) {
          await supabase.from('push_subscriptions').insert({
            profile_id: profileId,
            subscription: subscription
          });
        }
      } catch (e) {
        console.error('Failed to save push subscription in Supabase:', e);
      }
    }
  },

  deletePushSubscription: async (profileId: string, subscription: any) => {
    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      try {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('profile_id', profileId)
          .eq('subscription->>endpoint', subscription.endpoint);
      } catch (e) {
        console.error('Failed to delete push subscription in Supabase:', e);
      }
    }
  }
}));
