export interface Profile {
  id: string;
  display_name: string;
  username?: string;
  password?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  champion_prediction?: string;
}

export interface Team {
  id: string;
  name: string;
  group_letter: 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';
  stage_reached: 'group' | 'octavos' | 'cuartos' | 'semifinal' | 'finalist' | 'champion';
  flag_emoji: string;
  created_at?: string;
}

export interface ParticipantSelection {
  profile_id: string;
  team1_id: string | null;
  team2_id: string | null;
  selected_at?: string;
  manual_name?: string;
  manual_avatar?: string;
}

export interface Match {
  id: number;
  group_letter?: string;
  home_team_id: string;
  away_team_id: string;
  fecha: string;
  hora_arg: string;
  estadio: string;
  ciudad: string;
  pais: string;
  home_score?: number | null;
  away_score?: number | null;
  status: 'upcoming' | 'live' | 'finished';
  phase: string;
  home_extra_score?: number | null;
  away_extra_score?: number | null;
  home_penalty_score?: number | null;
  away_penalty_score?: number | null;
}

export interface Prediction {
  id: string;
  participant_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  created_at?: string;
  home_extra_score?: number | null;
  away_extra_score?: number | null;
  home_penalty_score?: number | null;
  away_penalty_score?: number | null;
}

export interface Standing {
  profile_id: string;
  display_name: string;
  avatar_url?: string;
  exact_guesses: number;
  outcome_guesses: number;
  total_points: number;
  rank?: number;
}

export interface TournamentPhase {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  created_by?: string;
}

export interface GroupMember {
  group_id: string;
  profile_id: string;
  joined_at: string;
}

