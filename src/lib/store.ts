import { create } from 'zustand';
import { Team, Match, ParticipantSelection, Standing, Profile, Prediction } from './types';
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
  { id: 1, group_letter: 'A', home_team_id: 'MEX', away_team_id: 'RSA', fecha: '2026-06-11', hora_arg: '16:00:00-03:00', estadio: 'Mexico City Stadium', ciudad: 'Ciudad de México', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 2, group_letter: 'A', home_team_id: 'KOR', away_team_id: 'CZE', fecha: '2026-06-11', hora_arg: '23:00:00-03:00', estadio: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 3, group_letter: 'B', home_team_id: 'CAN', away_team_id: 'BIH', fecha: '2026-06-12', hora_arg: '16:00:00-03:00', estadio: 'Toronto Stadium', ciudad: 'Toronto', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 4, group_letter: 'D', home_team_id: 'USA', away_team_id: 'PAR', fecha: '2026-06-12', hora_arg: '22:00:00-03:00', estadio: 'Los Angeles Stadium', ciudad: 'Los Ángeles', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 5, group_letter: 'B', home_team_id: 'QAT', away_team_id: 'SUI', fecha: '2026-06-13', hora_arg: '16:00:00-03:00', estadio: 'San Francisco Bay Area Stadium', ciudad: 'San Francisco', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 6, group_letter: 'C', home_team_id: 'BRA', away_team_id: 'MAR', fecha: '2026-06-13', hora_arg: '19:00:00-03:00', estadio: 'New York New Jersey Stadium', ciudad: 'New York / New Jersey', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 7, group_letter: 'C', home_team_id: 'HAI', away_team_id: 'SCO', fecha: '2026-06-13', hora_arg: '22:00:00-03:00', estadio: 'Boston Stadium', ciudad: 'Boston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 8, group_letter: 'D', home_team_id: 'AUS', away_team_id: 'TUR', fecha: '2026-06-14', hora_arg: '01:00:00-03:00', estadio: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 9, group_letter: 'E', home_team_id: 'GER', away_team_id: 'CUW', fecha: '2026-06-14', hora_arg: '14:00:00-03:00', estadio: 'Houston Stadium', ciudad: 'Houston', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 10, group_letter: 'F', home_team_id: 'NED', away_team_id: 'JPN', fecha: '2026-06-14', hora_arg: '17:00:00-03:00', estadio: 'Dallas Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 11, group_letter: 'E', home_team_id: 'CIV', away_team_id: 'ECU', fecha: '2026-06-14', hora_arg: '20:00:00-03:00', estadio: 'Philadelphia Stadium', ciudad: 'Philadelphia', pais: 'Estados Unidos', status: 'upcoming', phase: 'Fase de Grupos' },
  { id: 12, group_letter: 'F', home_team_id: 'SWE', away_team_id: 'TUN', fecha: '2026-06-14', hora_arg: '23:00:00-03:00', estadio: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', status: 'upcoming', phase: 'Fase de Grupos' }
];

export const INITIAL_PROFILES: Profile[] = [
  { id: 'user-leila', display_name: 'Leila', is_admin: false, avatar_url: 'LE', created_at: '', updated_at: '' },
  { id: 'user-ivan', display_name: 'Iván', is_admin: true, avatar_url: 'IV', created_at: '', updated_at: '' },
  { id: 'user-laura', display_name: 'Laura', is_admin: false, avatar_url: 'LA', created_at: '', updated_at: '' },
  { id: 'user-carlos', display_name: 'Carlos', is_admin: false, avatar_url: 'CA', created_at: '', updated_at: '' },
  { id: 'user-santiago', display_name: 'Santiago', is_admin: false, avatar_url: 'SA', created_at: '', updated_at: '' }
];

export const INITIAL_SELECTIONS: ParticipantSelection[] = [
  { profile_id: 'user-leila', team1_id: null, team2_id: null, manual_name: 'Leila', manual_avatar: 'LE' },
  { profile_id: 'user-ivan', team1_id: null, team2_id: null, manual_name: 'Iván', manual_avatar: 'IV' },
  { profile_id: 'user-laura', team1_id: null, team2_id: null, manual_name: 'Laura', manual_avatar: 'LA' },
  { profile_id: 'user-carlos', team1_id: null, team2_id: null, manual_name: 'Carlos', manual_avatar: 'CA' },
  { profile_id: 'user-santiago', team1_id: null, team2_id: null, manual_name: 'Santiago', manual_avatar: 'SA' }
];

// --- ZUSTAND STORE TYPE DECLARATION ---

interface TournamentState {
  teams: Team[];
  matches: Match[];
  profiles: Profile[];
  selections: ParticipantSelection[];
  predictions: Prediction[];
  standings: Standing[];
  currentProfileId: string;
  isDemoMode: boolean;
  isLoading: boolean;
  
  // Actions
  initStore: () => Promise<void>;
  setCurrentProfile: (id: string) => void;
  selectTeams: (profileId: string, team1Id: string | null, team2Id: string | null) => Promise<void>;
  updateMatchScore: (matchId: number, homeScore: number | null, awayScore: number | null, status: Match['status']) => Promise<void>;
  updateTeamStage: (teamId: string, stage: Team['stage_reached']) => Promise<void>;
  savePrediction: (profileId: string, matchId: number, homeScore: number, awayScore: number) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  autoSeedDraft: () => Promise<void>;
}

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useStore = create<TournamentState>((set, get) => ({
  teams: [],
  matches: [],
  profiles: [],
  selections: [],
  predictions: [],
  standings: [],
  currentProfileId: 'user-ivan', // Iván is default active profile (admin)
  isDemoMode: true,
  isLoading: true,

  initStore: async () => {
    set({ isLoading: true });
    
    // 1. Check if Supabase is configured
    const configured = isSupabaseConfigured();
    set({ isDemoMode: !configured });

    if (configured && supabase) {
      try {
        // Fetch from Supabase
        const { data: teamsData } = await supabase.from('teams').select('*');
        const { data: matchesData } = await supabase.from('matches').select('*').order('id', { ascending: true });
        const { data: profilesData } = await supabase.from('profiles').select('*');
        const { data: selectionsData } = await supabase.from('participants').select('*');
        const { data: predictionsData } = await supabase.from('predictions').select('*');

        // Transform selections from Supabase column names to selection object structure
        const mappedSelections: ParticipantSelection[] = (selectionsData || []).map((sel: any) => ({
          profile_id: sel.profile_id,
          team1_id: sel.team1_id,
          team2_id: sel.team2_id,
          manual_name: sel.manual_name || profilesData?.find(p => p.id === sel.profile_id)?.display_name || 'Participante',
          manual_avatar: sel.manual_avatar || profilesData?.find(p => p.id === sel.profile_id)?.avatar_url || '👤'
        }));

        const teams = (teamsData && teamsData.length > 0) ? teamsData : INITIAL_TEAMS;
        const matches = (matchesData && matchesData.length > 0) ? matchesData : INITIAL_MATCHES;
        const profiles = (profilesData && profilesData.length > 0) ? profilesData : INITIAL_PROFILES;
        const selections = mappedSelections.length > 0 ? mappedSelections : INITIAL_SELECTIONS;

        // If no profiles loaded (empty DB), we use mock logins
        const currentUserId = profiles[0]?.id || 'user-ivan';

        const standings = updateStandings(teams, selections);

        set({
          teams,
          matches,
          profiles,
          selections,
          predictions: predictionsData || [],
          standings,
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
      const storedSelections = localStorage.getItem('prode_selections');
      const storedPredictions = localStorage.getItem('prode_predictions');
      const storedActiveProfile = localStorage.getItem('prode_active_profile');

      const teams = storedTeams ? JSON.parse(storedTeams) : INITIAL_TEAMS;
      const matches = storedMatches ? JSON.parse(storedMatches) : INITIAL_MATCHES;
      const profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;
      const selections = storedSelections ? JSON.parse(storedSelections) : INITIAL_SELECTIONS;
      const predictions = storedPredictions ? JSON.parse(storedPredictions) : [];
      const currentProfileId = storedActiveProfile || 'user-ivan';

      // Always save back to guarantee consistency
      localStorage.setItem('prode_teams', JSON.stringify(teams));
      localStorage.setItem('prode_matches', JSON.stringify(matches));
      localStorage.setItem('prode_profiles', JSON.stringify(profiles));
      localStorage.setItem('prode_selections', JSON.stringify(selections));
      localStorage.setItem('prode_predictions', JSON.stringify(predictions));
      localStorage.setItem('prode_active_profile', currentProfileId);

      const standings = updateStandings(teams, selections);

      set({
        teams,
        matches,
        profiles,
        selections,
        predictions,
        standings,
        currentProfileId,
        isLoading: false
      });
    } else {
      set({
        teams: INITIAL_TEAMS,
        matches: INITIAL_MATCHES,
        profiles: INITIAL_PROFILES,
        selections: INITIAL_SELECTIONS,
        standings: updateStandings(INITIAL_TEAMS, INITIAL_SELECTIONS),
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

  selectTeams: async (profileId: string, team1Id: string | null, team2Id: string | null) => {
    const { isDemoMode, selections, teams } = get();

    // Optimistic / Local update
    const updatedSelections = selections.map(sel => 
      sel.profile_id === profileId 
        ? { ...sel, team1_id: team1Id, team2_id: team2Id, selected_at: new Date().toISOString() }
        : sel
    );

    const standings = updateStandings(teams, updatedSelections);

    set({ selections: updatedSelections, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_selections', JSON.stringify(updatedSelections));
    }

    if (!isDemoMode && supabase) {
      // Upsert into Supabase
      await supabase.from('participants').upsert({
        profile_id: profileId,
        team1_id: team1Id,
        team2_id: team2Id,
        selected_at: new Date().toISOString()
      });
    }
  },

  updateMatchScore: async (matchId: number, homeScore: number | null, awayScore: number | null, status: Match['status']) => {
    const { isDemoMode, matches } = get();

    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { ...m, home_score: homeScore, away_score: awayScore, status } 
        : m
    );

    set({ matches: updatedMatches });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_matches', JSON.stringify(updatedMatches));
    }

    if (!isDemoMode && supabase) {
      await supabase.from('matches').update({
        home_score: homeScore,
        away_score: awayScore,
        status
      }).eq('id', matchId);
    }
  },

  updateTeamStage: async (teamId: string, stage: Team['stage_reached']) => {
    const { isDemoMode, teams, selections } = get();

    const updatedTeams = teams.map(t => 
      t.id === teamId ? { ...t, stage_reached: stage } : t
    );

    const standings = updateStandings(updatedTeams, selections);

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

  savePrediction: async (profileId: string, matchId: number, homeScore: number, awayScore: number) => {
    const { isDemoMode, predictions } = get();

    const existingIdx = predictions.findIndex(p => p.participant_id === profileId && p.match_id === matchId);
    let updatedPredictions = [...predictions];

    if (existingIdx > -1) {
      updatedPredictions[existingIdx] = { ...updatedPredictions[existingIdx], home_score: homeScore, away_score: awayScore };
    } else {
      updatedPredictions.push({
        id: Math.random().toString(36).substring(7),
        participant_id: profileId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore
      });
    }

    set({ predictions: updatedPredictions });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_predictions', JSON.stringify(updatedPredictions));
    }

    if (!isDemoMode && supabase) {
      await supabase.from('predictions').upsert({
        participant_id: profileId,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore
      });
    }
  },

  resetToDefaults: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prode_teams');
      localStorage.removeItem('prode_matches');
      localStorage.removeItem('prode_profiles');
      localStorage.removeItem('prode_selections');
      localStorage.removeItem('prode_predictions');
      localStorage.removeItem('prode_active_profile');
    }

    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      // Reset Supabase by setting everything back to initial states
      // Resets stages to 'group'
      await supabase.from('teams').update({ stage_reached: 'group' }).neq('id', 'NONE');
      // Resets matches status and scores
      await supabase.from('matches').update({ home_score: null, away_score: null, status: 'upcoming' }).gt('id', 0);
      // Clear selections
      await supabase.from('participants').update({ team1_id: null, team2_id: null, selected_at: null }).neq('profile_id', '00000000-0000-0000-0000-000000000000');
    }

    // Reload the store
    await get().initStore();
  },

  autoSeedDraft: async () => {
    // Automatically drafts 2 random, unrepeated teams for each of the 5 mock participants.
    // Extremely useful for testing and verifying the leaderboard.
    const { selections, teams } = get();
    
    // Choose 10 distinct top teams to draft:
    // ARG (Argentina), BRA (Brasil), GER (Alemania), FRA (Francia), ESP (España), 
    // POR (Portugal), ENG (Inglaterra), NED (Países Bajos), BEL (Bélgica), USA (Estados Unidos)
    const seedPicks = ['ARG', 'BRA', 'GER', 'FRA', 'ESP', 'POR', 'ENG', 'NED', 'BEL', 'USA'];
    
    const updatedSelections = selections.map((sel, index) => {
      const pick1 = seedPicks[index * 2];
      const pick2 = seedPicks[index * 2 + 1];
      return {
        ...sel,
        team1_id: pick1,
        team2_id: pick2,
        selected_at: new Date().toISOString()
      };
    });

    const standings = updateStandings(teams, updatedSelections);
    set({ selections: updatedSelections, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_selections', JSON.stringify(updatedSelections));
    }

    // Sync to Supabase if live
    const { isDemoMode } = get();
    if (!isDemoMode && supabase) {
      for (const sel of updatedSelections) {
        await supabase.from('participants').upsert({
          profile_id: sel.profile_id,
          team1_id: sel.team1_id,
          team2_id: sel.team2_id,
          selected_at: new Date().toISOString()
        });
      }
    }
  }
}));
