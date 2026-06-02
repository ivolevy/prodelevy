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
  { id: 'user-ivanlevy', display_name: 'ivanlevy', username: 'ivanlevy', password: 'catalina1804', is_admin: true, avatar_url: 'IL', created_at: '', updated_at: '' },
  { id: 'user-test123', display_name: 'test123', username: 'test123', password: 'test123', is_admin: false, avatar_url: 'TE', created_at: '', updated_at: '' },
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
];

export const INITIAL_GROUPS: Group[] = [
  { id: 'group-familia', name: 'familia', invite_code: '3103', created_at: '2026-06-02T00:00:00Z', created_by: 'user-ivanlevy' }
];

export const INITIAL_GROUP_MEMBERS: GroupMember[] = [
  { group_id: 'group-familia', profile_id: 'user-ivanlevy', joined_at: '2026-06-02T00:00:00Z' }
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
  
  // Actions
  initStore: () => Promise<void>;
  setCurrentProfile: (id: string) => void;
  updateMatchScore: (matchId: number, homeScore: number | null, awayScore: number | null, status: Match['status']) => Promise<void>;
  updateTeamStage: (teamId: string, stage: Team['stage_reached']) => Promise<void>;
  savePrediction: (profileId: string, matchId: number, homeScore: number, awayScore: number) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  autoSeedPredictions: () => Promise<void>;
  addProfile: (displayName: string, username?: string, password?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  editProfile: (id: string, displayName: string, username: string, password?: string) => Promise<void>;
  saveChampionPrediction: (profileId: string, teamId: string) => Promise<void>;
  createGroup: (name: string, inviteCode: string) => Promise<void>;
  joinGroup: (inviteCode: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
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

  initStore: async () => {
    set({ isLoading: true });
    
    const storedActiveProfile = typeof window !== 'undefined' ? localStorage.getItem('prode_active_profile') : null;
    
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
        
        let groupsData: any[] = [];
        let groupMembersData: any[] = [];
        try {
          const { data: g } = await supabase.from('groups').select('*');
          if (g) groupsData = g;
          const { data: gm } = await supabase.from('group_members').select('*');
          if (gm) groupMembersData = gm;
        } catch (e) {
          console.warn('Failed to fetch groups from Supabase, possibly tables not created yet. Falling back to local storage.', e);
        }

        const storedLocalProfiles = typeof window !== 'undefined' ? localStorage.getItem('prode_profiles') : null;
        let localProfiles = storedLocalProfiles ? JSON.parse(storedLocalProfiles) : [];
        
        let dbProfiles = profilesData || [];
        
        // Ensure test123 user is in database
        const hasTestUser = dbProfiles.some(p => p.username === 'test123');
        if (!hasTestUser && supabase) {
          try {
            await supabase.from('profiles').insert({
              id: 'user-test123',
              display_name: 'test123',
              username: 'test123',
              password: 'test123',
              avatar_url: 'TE',
              is_admin: false
            });
            const { data: refreshedProfiles } = await supabase.from('profiles').select('*');
            if (refreshedProfiles) dbProfiles = refreshedProfiles;
          } catch (e) {
            console.error('Failed to auto-insert test123 user:', e);
          }
        }
        
        // Cleanup check: If ivanlevy is not in the profiles, we want to clear everything
        const hasNewAdmin = dbProfiles.some(p => p.username === 'ivanlevy') || localProfiles.some((p: any) => p.username === 'ivanlevy');
        if (!hasNewAdmin) {
          try {
            if (supabase) {
              await supabase.from('profiles').delete().neq('username', 'ivanlevy');
              await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              await supabase.from('profiles').insert({
                id: 'user-ivanlevy',
                display_name: 'ivanlevy',
                username: 'ivanlevy',
                password: 'catalina1804',
                avatar_url: 'IL',
                is_admin: true
              });
            }
          } catch (e) {
            console.error('Failed db cleanup', e);
          }
          dbProfiles = INITIAL_PROFILES;
          localProfiles = INITIAL_PROFILES;
          if (typeof window !== 'undefined') {
            localStorage.setItem('prode_profiles', JSON.stringify(INITIAL_PROFILES));
            localStorage.removeItem('prode_predictions');
            localStorage.setItem('prode_active_profile', '');
          }
        }

        const mergedProfiles = [...dbProfiles];
        localProfiles.forEach((lp: any) => {
          if (!mergedProfiles.some(dp => dp.id === lp.id)) {
            mergedProfiles.push(lp);
          }
        });

        // Ensure all INITIAL_PROFILES exist in the merged profiles list
        INITIAL_PROFILES.forEach(ip => {
          if (!mergedProfiles.some(p => p.username === ip.username)) {
            mergedProfiles.push(ip);
          }
        });

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
        INITIAL_GROUPS.forEach(ig => {
          if (!mergedGroups.some(g => g.invite_code.toUpperCase() === ig.invite_code.toUpperCase())) {
            mergedGroups.push(ig);
          }
        });

        const storedLocalGroupMembers = typeof window !== 'undefined' ? localStorage.getItem('prode_group_members') : null;
        const localGroupMembers: GroupMember[] = storedLocalGroupMembers ? JSON.parse(storedLocalGroupMembers) : [];
        const mergedGroupMembers = [...groupMembersData];
        localGroupMembers.forEach((lgm) => {
          if (!mergedGroupMembers.some(dgm => dgm.group_id === lgm.group_id && dgm.profile_id === lgm.profile_id)) {
            mergedGroupMembers.push(lgm);
          }
        });
        INITIAL_GROUP_MEMBERS.forEach(igm => {
          if (!mergedGroupMembers.some(gm => gm.group_id === igm.group_id && gm.profile_id === igm.profile_id)) {
            mergedGroupMembers.push(igm);
          }
        });

        const teams = (teamsData && teamsData.length > 0) ? teamsData : INITIAL_TEAMS;
        const matches = (matchesData && matchesData.length > 0) ? matchesData : INITIAL_MATCHES;
        const profiles = mergedProfiles.length > 0 ? mergedProfiles : INITIAL_PROFILES;
        const predictions = mergedPredictions;
        const groups = mergedGroups;
        const groupMembers = mergedGroupMembers;

        const currentUserId = storedActiveProfile !== null ? storedActiveProfile : '';
        const standings = updateStandings(matches, predictions, profiles, teams);

        set({
          teams,
          matches,
          profiles,
          predictions,
          standings,
          groups,
          groupMembers,
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
      const matches = storedMatches ? JSON.parse(storedMatches) : INITIAL_MATCHES;
      const currentProfileId = !profiles.some((p: any) => p.id === storedActiveProfile) ? '' : (storedActiveProfile || '');

      // Always save back to guarantee consistency
      localStorage.setItem('prode_teams', JSON.stringify(teams));
      localStorage.setItem('prode_matches', JSON.stringify(matches));
      localStorage.setItem('prode_profiles', JSON.stringify(profiles));
      localStorage.setItem('prode_predictions', JSON.stringify(predictions));
      localStorage.setItem('prode_groups', JSON.stringify(groups));
      localStorage.setItem('prode_group_members', JSON.stringify(groupMembers));
      localStorage.setItem('prode_active_profile', currentProfileId);

      const standings = updateStandings(matches, predictions, profiles, teams);

      set({
        teams,
        matches,
        profiles,
        predictions,
        standings,
        groups,
        groupMembers,
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

    // Prevent test user from saving predictions
    const activeProfile = profiles.find(p => p.id === profileId);
    if (activeProfile?.username === 'test123') {
      throw new Error('El usuario de prueba no puede guardar pronósticos.');
    }

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

  addProfile: async (displayName: string, username?: string, password?: string) => {
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

    set({ profiles: updatedProfiles, standings });

    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
    }

    if (!isDemoMode && supabase) {
      try {
        await supabase.from('profiles').insert({
          id: newId,
          display_name: newProfile.display_name,
          username: u,
          password: p,
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
 
  editProfile: async (id: string, displayName: string, username: string, password?: string) => {
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
    set({ profiles: updatedProfiles, standings });
 
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_profiles', JSON.stringify(updatedProfiles));
    }
 
    if (!isDemoMode && supabase) {
      try {
        const updateData: any = {
          display_name: displayName.trim(),
          username: u,
          avatar_url: displayName.substring(0, 2).toUpperCase()
        };
        if (p) {
          updateData.password = p;
        }
        await supabase.from('profiles').update(updateData).eq('id', id);
      } catch (e) {
        console.error('Failed to sync updated profile to Supabase:', e);
      }
    }
  },

  saveChampionPrediction: async (profileId: string, teamId: string) => {
    const { isDemoMode, profiles, teams, matches, predictions } = get();

    // Prevent test user from saving champion prediction
    const activeProfile = profiles.find(p => p.id === profileId);
    if (activeProfile?.username === 'test123') {
      throw new Error('El usuario de prueba no puede elegir un campeón.');
    }

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
  }
}));
