import { create } from 'zustand';
import { Team, Match, Standing, Profile, Prediction } from './types';
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
  { id: 'user-ivan', display_name: 'Iván', is_admin: true, avatar_url: 'IV', created_at: '', updated_at: '' },
  { id: 'user-catalina', display_name: 'Catalina', is_admin: false, avatar_url: 'CA', created_at: '', updated_at: '' }
];

// Helper to determine if a match is predictable (open to predictions)
export function isMatchPredictable(match: Match): boolean {
  if (match.status !== 'upcoming') return false;

  const matchDateTimeStr = `${match.fecha}T${match.hora_arg.includes('-') || match.hora_arg.includes('+') ? match.hora_arg : match.hora_arg + '-03:00'}`;
  const matchTime = new Date(matchDateTimeStr).getTime();

  if (isNaN(matchTime)) {
    return true; // Fallback
  }

  const now = new Date().getTime();
  const diffHours = (matchTime - now) / (1000 * 60 * 60);
  return diffHours >= 24;
}

// --- ZUSTAND STORE TYPE DECLARATION ---

interface TournamentState {
  teams: Team[];
  matches: Match[];
  profiles: Profile[];
  predictions: Prediction[];
  standings: Standing[];
  currentProfileId: string;
  isDemoMode: boolean;
  isLoading: boolean;
  
  // Actions
  initStore: () => Promise<void>;
  setCurrentProfile: (id: string) => void;
  updateMatchScore: (matchId: number, homeScore: number | null, awayScore: number | null, status: Match['status']) => Promise<void>;
  updateTeamStage: (teamId: string, stage: Team['stage_reached']) => Promise<void>;
  savePrediction: (profileId: string, matchId: number, homeScore: number, awayScore: number) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  autoSeedPredictions: () => Promise<void>;
  addProfile: (displayName: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  saveChampionPrediction: (profileId: string, teamId: string) => Promise<void>;
}

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useStore = create<TournamentState>((set, get) => ({
  teams: [],
  matches: [],
  profiles: [],
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
        const { data: predictionsData } = await supabase.from('predictions').select('*');

        const teams = (teamsData && teamsData.length > 0) ? teamsData : INITIAL_TEAMS;
        const matches = (matchesData && matchesData.length > 0) ? matchesData : INITIAL_MATCHES;
        const profiles = (profilesData && profilesData.length > 0) ? profilesData : INITIAL_PROFILES;
        const predictions = predictionsData || [];

        const currentUserId = profiles[0]?.id || 'user-ivan';
        const standings = updateStandings(matches, predictions, profiles, teams);

        set({
          teams,
          matches,
          profiles,
          predictions,
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
      const storedPredictions = localStorage.getItem('prode_predictions');
      const storedActiveProfile = localStorage.getItem('prode_active_profile');

      const teams = storedTeams ? JSON.parse(storedTeams) : INITIAL_TEAMS;
      const matches = storedMatches ? JSON.parse(storedMatches) : INITIAL_MATCHES;
      const profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;
      const predictions = storedPredictions ? JSON.parse(storedPredictions) : [];
      const currentProfileId = storedActiveProfile || 'user-ivan';

      // Always save back to guarantee consistency
      localStorage.setItem('prode_teams', JSON.stringify(teams));
      localStorage.setItem('prode_matches', JSON.stringify(matches));
      localStorage.setItem('prode_profiles', JSON.stringify(profiles));
      localStorage.setItem('prode_predictions', JSON.stringify(predictions));
      localStorage.setItem('prode_active_profile', currentProfileId);

      const standings = updateStandings(matches, predictions, profiles, teams);

      set({
        teams,
        matches,
        profiles,
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
        predictions: [],
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

  updateMatchScore: async (matchId: number, homeScore: number | null, awayScore: number | null, status: Match['status']) => {
    const { isDemoMode, matches, predictions, profiles } = get();

    const updatedMatches = matches.map(m => 
      m.id === matchId 
        ? { ...m, home_score: homeScore, away_score: awayScore, status } 
        : m
    );

    const standings = updateStandings(updatedMatches, predictions, profiles, get().teams);

    set({ matches: updatedMatches, standings });

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

  savePrediction: async (profileId: string, matchId: number, homeScore: number, awayScore: number) => {
    const { isDemoMode, predictions, matches, profiles } = get();

    // Enforce the 24 hours lock
    const match = matches.find(m => m.id === matchId);
    if (match && !isMatchPredictable(match)) {
      throw new Error('La predicción está cerrada para este partido (cierre de 24hs).');
    }

    // Validate prediction scores are between 0 and 20
    if (homeScore < 0 || homeScore > 20 || awayScore < 0 || awayScore > 20) {
      throw new Error('Los resultados deben estar entre 0 y 20.');
    }

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
        away_score: awayScore
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
      for (const pred of seededPredictions) {
        await supabase.from('predictions').upsert({
          participant_id: pred.participant_id,
          match_id: pred.match_id,
          home_score: pred.home_score,
          away_score: pred.away_score
        });
      }
    }
  },

  addProfile: async (displayName: string) => {
    const { isDemoMode, profiles, matches, predictions } = get();

    const newId = `user-${Math.random().toString(36).substring(7)}`;
    const newProfile: Profile = {
      id: newId,
      display_name: displayName,
      is_admin: false,
      avatar_url: displayName.substring(0, 2).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedProfiles = [...profiles, newProfile];
    const standings = updateStandings(matches, predictions, updatedProfiles, get().teams);

    set({ profiles: updatedProfiles, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('profiles').insert({
          id: newId,
          display_name: displayName,
          avatar_url: newProfile.avatar_url,
          is_admin: false
        });
      } catch (e) {
        console.error('Failed to sync new profile to Supabase:', e);
      }
    }
  },

  deleteProfile: async (id: string) => {
    const { isDemoMode, profiles, matches, predictions, currentProfileId } = get();

    // Prevent deleting primary users
    if (id === 'user-ivan' || id === 'user-catalina') return;

    const updatedProfiles = profiles.filter(p => p.id !== id);
    const updatedPredictions = predictions.filter(p => p.participant_id !== id);
    const standings = updateStandings(matches, updatedPredictions, updatedProfiles, get().teams);

    let nextProfileId = currentProfileId;
    if (currentProfileId === id) {
      nextProfileId = 'user-ivan';
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
      } catch (e) {
        console.error('Failed to sync champion prediction to Supabase:', e);
      }
    }
  }
}));
