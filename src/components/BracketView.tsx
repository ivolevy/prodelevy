'use client';

import { Match, Team } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Trophy, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef } from 'react';

interface BracketTeam {
  id: string;
  name: string;
  flag_emoji: string;
  placeholder?: string;
  score?: number | null;
}

interface BracketMatch {
  id: string;
  phase: string;
  team1: BracketTeam;
  team2: BracketTeam;
  winnerId?: string;
}

export default function BracketView() {
  const { matches, teams } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRound = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 222; // card width (190) + gap (32)
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Helper to dynamically calculate 1st and 2nd in group stage
  const getGroupTopTwo = (groupLetter: string): { first: BracketTeam; second: BracketTeam } => {
    const groupTeams = teams.filter(t => t.group_letter === groupLetter);
    const stats: Record<string, {
      id: string;
      name: string;
      flag_emoji: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }> = {};

    groupTeams.forEach(t => {
      stats[t.id] = {
        id: t.id,
        name: t.name,
        flag_emoji: t.flag_emoji,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    const groupMatches = matches.filter(
      m => m.group_letter === groupLetter && (m.status === 'finished' || m.status === 'live')
    );

    groupMatches.forEach(m => {
      const homeScore = m.home_score ?? 0;
      const awayScore = m.away_score ?? 0;
      const homeStats = stats[m.home_team_id];
      const awayStats = stats[m.away_team_id];

      if (homeStats && awayStats) {
        homeStats.played += 1;
        awayStats.played += 1;
        homeStats.goalsFor += homeScore;
        homeStats.goalsAgainst += awayScore;
        awayStats.goalsFor += awayScore;
        awayStats.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeStats.won += 1;
          homeStats.points += 3;
          awayStats.lost += 1;
        } else if (homeScore < awayScore) {
          awayStats.won += 1;
          awayStats.points += 3;
          homeStats.lost += 1;
        } else {
          homeStats.drawn += 1;
          homeStats.points += 1;
          awayStats.drawn += 1;
          awayStats.points += 1;
        }
      }
    });

    const sorted = Object.values(stats)
      .map(s => ({
        ...s,
        goalDifference: s.goalsFor - s.goalsAgainst
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    const firstTeam = sorted[0];
    const secondTeam = sorted[1];

    const first: BracketTeam = firstTeam && firstTeam.played > 0
      ? { id: firstTeam.id, name: firstTeam.name, flag_emoji: firstTeam.flag_emoji }
      : { id: `1${groupLetter}`, name: `Ganador Grupo ${groupLetter}`, flag_emoji: '🏳️', placeholder: `1${groupLetter}` };

    const second: BracketTeam = secondTeam && secondTeam.played > 0
      ? { id: secondTeam.id, name: secondTeam.name, flag_emoji: secondTeam.flag_emoji }
      : { id: `2${groupLetter}`, name: `Segundo Grupo ${groupLetter}`, flag_emoji: '🏳️', placeholder: `2${groupLetter}` };

    return { first, second };
  };

  // Resolve teams for each slot
  const groupA = getGroupTopTwo('A');
  const groupB = getGroupTopTwo('B');
  const groupC = getGroupTopTwo('C');
  const groupD = getGroupTopTwo('D');
  const groupE = getGroupTopTwo('E');
  const groupF = getGroupTopTwo('F');
  const groupG = getGroupTopTwo('G');
  const groupH = getGroupTopTwo('H');
  const groupI = getGroupTopTwo('I');
  const groupJ = getGroupTopTwo('J');
  const groupK = getGroupTopTwo('K');
  const groupL = getGroupTopTwo('L');

  // Find actual knockout matches in store if they have been added (e.g. from DB)
  const getKnockoutMatch = (id: number, phase: string, defaultT1: BracketTeam, defaultT2: BracketTeam): BracketMatch => {
    const match = matches.find(m => m.id === id);
    if (match) {
      const t1 = teams.find(t => t.id === match.home_team_id);
      const t2 = teams.find(t => t.id === match.away_team_id);
      
      const team1: BracketTeam = t1 
        ? { id: t1.id, name: t1.name, flag_emoji: t1.flag_emoji, score: match.home_score }
        : defaultT1;
        
      const team2: BracketTeam = t2 
        ? { id: t2.id, name: t2.name, flag_emoji: t2.flag_emoji, score: match.away_score }
        : defaultT2;

      let winnerId = undefined;
      if (
        match.status === 'finished' && 
        match.home_score !== undefined && 
        match.home_score !== null && 
        match.away_score !== undefined && 
        match.away_score !== null
      ) {
        winnerId = match.home_score > match.away_score ? team1.id : team2.id;
      }

      return { id: String(id), phase, team1, team2, winnerId };
    }

    return {
      id: String(id),
      phase,
      team1: defaultT1,
      team2: defaultT2
    };
  };

  // Define Octavos
  const octavos: BracketMatch[] = [
    getKnockoutMatch(25, 'Octavos', groupA.first, groupB.second),
    getKnockoutMatch(26, 'Octavos', groupC.first, groupD.second),
    getKnockoutMatch(27, 'Octavos', groupE.first, groupF.second),
    getKnockoutMatch(28, 'Octavos', groupG.first, groupH.second),
    getKnockoutMatch(29, 'Octavos', groupI.first, groupJ.second),
    getKnockoutMatch(30, 'Octavos', groupK.first, groupL.second),
    getKnockoutMatch(31, 'Octavos', groupB.first, groupA.second),
    getKnockoutMatch(32, 'Octavos', groupD.first, groupC.second)
  ];

  // Resolve winner helper
  const getWinner = (match: BracketMatch): BracketTeam => {
    if (match.winnerId) {
      return match.winnerId === match.team1.id ? match.team1 : match.team2;
    }
    return {
      id: `W_${match.id}`,
      name: `Ganador Llave ${match.id}`,
      flag_emoji: '🏳️',
      placeholder: `W_${match.id}`
    };
  };

  // Define Cuartos
  const cuartos: BracketMatch[] = [
    getKnockoutMatch(33, 'Cuartos', getWinner(octavos[0]), getWinner(octavos[1])),
    getKnockoutMatch(34, 'Cuartos', getWinner(octavos[2]), getWinner(octavos[3])),
    getKnockoutMatch(35, 'Cuartos', getWinner(octavos[4]), getWinner(octavos[5])),
    getKnockoutMatch(36, 'Cuartos', getWinner(octavos[6]), getWinner(octavos[7]))
  ];

  // Define Semis
  const semis: BracketMatch[] = [
    getKnockoutMatch(37, 'Semis', getWinner(cuartos[0]), getWinner(cuartos[1])),
    getKnockoutMatch(38, 'Semis', getWinner(cuartos[2]), getWinner(cuartos[3]))
  ];

  // Define Final
  const finalMatch = getKnockoutMatch(39, 'Final', getWinner(semis[0]), getWinner(semis[1]));

  const champion = finalMatch.winnerId 
    ? (finalMatch.winnerId === finalMatch.team1.id ? finalMatch.team1 : finalMatch.team2)
    : null;

  const renderTeamRow = (team: BracketTeam, isWinner: boolean) => {
    const isPlaceholder = !!team.placeholder;
    return (
      <div className={`flex items-center justify-between px-3 py-2.5 text-[10.5px] ${
        isWinner ? 'bg-gold-500/10 font-bold text-stone-900' : 'text-stone-700'
      }`}>
        <div className="flex items-center gap-1.5 truncate pr-2">
          <span className="text-xs shrink-0">{team.flag_emoji}</span>
          <span className={`truncate ${isPlaceholder ? 'text-stone-400 italic font-normal' : 'font-semibold'}`}>
            {team.name}
          </span>
        </div>
        {team.score !== undefined && team.score !== null && (
          <span className="font-mono font-bold text-stone-900 bg-cream-100/50 px-1.5 py-0.5 rounded text-[9.5px]">
            {team.score}
          </span>
        )}
      </div>
    );
  };

  const renderMatchCard = (match: BracketMatch) => {
    const t1Winner = match.winnerId === match.team1.id;
    const t2Winner = match.winnerId === match.team2.id;
    return (
      <div className="w-[190px] bg-white border border-cream-300 rounded-xl shadow-xs divide-y divide-cream-150 overflow-hidden hover:border-gold-500/40 transition-colors">
        <div className="bg-cream-50/50 px-2 py-1.5 flex justify-between items-center border-b border-cream-150">
          <span className="text-[7.5px] font-black uppercase tracking-widest text-stone-400 leading-none">
            Llave {match.id}
          </span>
          <span className="text-[7.5px] text-stone-400 font-bold">
            {match.phase}
          </span>
        </div>
        {renderTeamRow(match.team1, t1Winner)}
        {renderTeamRow(match.team2, t2Winner)}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 text-left">
      {/* Header Info */}
      <div className="border-b border-cream-200 pb-2 flex justify-between items-center">
        <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-gold-500" /> Cruces Eliminatorios
        </h3>
        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">
          Fase Eliminatoria Directa
        </span>
      </div>

      {/* Swipe Assist Indicator for Mobile */}
      <div className="flex md:hidden items-center justify-between py-1.5 px-3 bg-gold-500/5 border border-gold-500/10 rounded-xl text-[9px] font-bold text-gold-650 uppercase tracking-wider">
        <button 
          onClick={() => scrollRound('left')} 
          className="p-1 bg-white border border-cream-300 rounded-lg hover:bg-cream-100 transition-all cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-stone-750" />
        </button>
        <span className="truncate mx-2">Deslizar o usar flechas para navegar</span>
        <button 
          onClick={() => scrollRound('right')} 
          className="p-1 bg-white border border-cream-300 rounded-lg hover:bg-cream-100 transition-all cursor-pointer shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5 text-stone-750" />
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-12 select-none"
      >
        {/* Round Headers Row */}
        <div className="flex gap-0 min-w-[920px] border-b border-cream-150 pb-2 mb-2">
          <div className="w-[190px] text-center text-[7.5px] font-black text-stone-400 uppercase tracking-widest">Octavos de Final</div>
          <div className="w-[32px] shrink-0"></div>
          <div className="w-[190px] text-center text-[7.5px] font-black text-stone-400 uppercase tracking-widest">Cuartos de Final</div>
          <div className="w-[32px] shrink-0"></div>
          <div className="w-[190px] text-center text-[7.5px] font-black text-stone-400 uppercase tracking-widest">Semifinales</div>
          <div className="w-[32px] shrink-0"></div>
          <div className="w-[190px] text-center text-[7.5px] font-black text-stone-400 uppercase tracking-widest">Gran Final</div>
        </div>

        <div className="flex gap-0 min-w-[920px] h-[976px] items-stretch">
          
          {/* Column 1: Octavos */}
          <div className="w-[190px] flex flex-col justify-between h-full py-0 shrink-0">
            {/* Upper Half (Semis 1 group) */}
            <div className="h-[464px] flex flex-col justify-between">
              {/* Cuartos 1 group */}
              <div className="h-[220px] flex flex-col justify-between">
                {renderMatchCard(octavos[0])}
                {renderMatchCard(octavos[1])}
              </div>
              {/* Cuartos 2 group */}
              <div className="h-[220px] flex flex-col justify-between">
                {renderMatchCard(octavos[2])}
                {renderMatchCard(octavos[3])}
              </div>
            </div>
            {/* Lower Half (Semis 2 group) */}
            <div className="h-[464px] flex flex-col justify-between">
              {/* Cuartos 3 group */}
              <div className="h-[220px] flex flex-col justify-between">
                {renderMatchCard(octavos[4])}
                {renderMatchCard(octavos[5])}
              </div>
              {/* Cuartos 4 group */}
              <div className="h-[220px] flex flex-col justify-between">
                {renderMatchCard(octavos[6])}
                {renderMatchCard(octavos[7])}
              </div>
            </div>
          </div>

          {/* Column 2: Connector 1 */}
          <div className="w-[32px] flex flex-col justify-between h-full py-0 shrink-0">
            <div className="h-[464px] flex flex-col justify-between">
              <div className="h-[220px] w-full">
                <svg viewBox="0 0 32 220" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path vectorEffect="non-scaling-stroke" d="M 0 48 L 16 48 L 16 172 L 0 172 M 16 110 L 32 110" />
                </svg>
              </div>
              <div className="h-[220px] w-full">
                <svg viewBox="0 0 32 220" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path vectorEffect="non-scaling-stroke" d="M 0 48 L 16 48 L 16 172 L 0 172 M 16 110 L 32 110" />
                </svg>
              </div>
            </div>
            <div className="h-[464px] flex flex-col justify-between">
              <div className="h-[220px] w-full">
                <svg viewBox="0 0 32 220" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path vectorEffect="non-scaling-stroke" d="M 0 48 L 16 48 L 16 172 L 0 172 M 16 110 L 32 110" />
                </svg>
              </div>
              <div className="h-[220px] w-full">
                <svg viewBox="0 0 32 220" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path vectorEffect="non-scaling-stroke" d="M 0 48 L 16 48 L 16 172 L 0 172 M 16 110 L 32 110" />
                </svg>
              </div>
            </div>
          </div>

          {/* Column 3: Cuartos */}
          <div className="w-[190px] flex flex-col justify-between h-full py-0 shrink-0">
            <div className="h-[464px] flex flex-col justify-between">
              <div className="h-[220px] flex items-center justify-center">
                {renderMatchCard(cuartos[0])}
              </div>
              <div className="h-[220px] flex items-center justify-center">
                {renderMatchCard(cuartos[1])}
              </div>
            </div>
            <div className="h-[464px] flex flex-col justify-between">
              <div className="h-[220px] flex items-center justify-center">
                {renderMatchCard(cuartos[2])}
              </div>
              <div className="h-[220px] flex items-center justify-center">
                {renderMatchCard(cuartos[3])}
              </div>
            </div>
          </div>

          {/* Column 4: Connector 2 */}
          <div className="w-[32px] flex flex-col justify-between h-full py-0 shrink-0">
            <div className="h-[464px] w-full">
              <svg viewBox="0 0 32 464" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                <path vectorEffect="non-scaling-stroke" d="M 0 110 L 16 110 L 16 354 L 0 354 M 16 232 L 32 232" />
              </svg>
            </div>
            <div className="h-[464px] w-full">
              <svg viewBox="0 0 32 464" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
                <path vectorEffect="non-scaling-stroke" d="M 0 110 L 16 110 L 16 354 L 0 354 M 16 232 L 32 232" />
              </svg>
            </div>
          </div>

          {/* Column 5: Semis */}
          <div className="w-[190px] flex flex-col justify-between h-full py-0 shrink-0">
            <div className="h-[464px] flex items-center justify-center">
              {renderMatchCard(semis[0])}
            </div>
            <div className="h-[464px] flex items-center justify-center">
              {renderMatchCard(semis[1])}
            </div>
          </div>

          {/* Column 6: Connector 3 */}
          <div className="w-[32px] h-full shrink-0">
            <svg viewBox="0 0 32 976" className="w-full h-full text-gold-500/40" stroke="currentColor" strokeWidth="1.5" fill="none">
              <path vectorEffect="non-scaling-stroke" d="M 0 232 L 16 232 L 16 744 L 0 744 M 16 488 L 32 488" />
            </svg>
          </div>

          {/* Column 7: Final & Champion */}
          <div className="w-[190px] h-full relative py-0 shrink-0">
            {/* Final Match Card centered at Y = 488 */}
            <div className="absolute top-[488px] -translate-y-1/2 left-0 right-0">
              {renderMatchCard(finalMatch)}
            </div>

            {/* Champion Visual Banner at the bottom */}
            <div className="absolute bottom-[36px] left-0 right-0">
              <div className={`w-full p-4 rounded-2xl border text-center transition-all shrink-0 ${
                champion 
                  ? 'bg-gold-500/10 border-gold-500 shadow-sm animate-bounce' 
                  : 'bg-cream-50/20 border-dashed border-cream-300'
              }`}>
                <div className="flex justify-center mb-1.5">
                  <Trophy className={`w-7 h-7 ${champion ? 'text-gold-500' : 'text-stone-300'}`} />
                </div>
                <span className="block text-[7.5px] font-black uppercase tracking-widest text-stone-400">
                  Campeón del Mundo
                </span>
                <span className="block text-xs font-black text-stone-900 mt-1 uppercase">
                  {champion ? `${champion.flag_emoji} ${champion.name}` : 'Por definir'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
