import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './visualizations.css';

const BASE = process.env.PUBLIC_URL;
const ROLE_ORDER = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

function sanitize(name) {
  return name.replace(/[\s,\-']/g, '');
}

function TeamSlot({ team, result }) {
  return (
    <div className="igs-team-slot">
      <img src={`${BASE}/images/team_logos/${team}.png`} alt={team} className="igs-team-logo" />
      <span className="igs-team-result">{result}</span>
    </div>
  );
}

export default function IndividualGameStats({ winTeam = 'G2', loseTeam = 'TSW', csvPath = '/datasets/G2vsTSW.csv', title = 'G2 vs TSW', totalGames = 3, winGameNumbers = null, sidebarText = '' }) {
  const [gameNumber, setGameNumber] = useState(1);
  const [blueChamps, setBlueChamps] = useState([]);
  const [redChamps, setRedChamps] = useState([]);
  const [maxDmg, setMaxDmg] = useState(1);
  const barsRef = useRef(null);

  const firstWins = winGameNumbers === null || winGameNumbers.includes(gameNumber);
  const topTeam = firstWins ? winTeam : loseTeam;
  const bottomTeam = firstWins ? loseTeam : winTeam;

  useEffect(() => {
    d3.csv(csvPath).then(data => {
      const gameRows = data.filter(d => parseInt(d.Game) === gameNumber);
      const blue = gameRows.slice(0, 5).sort((a, b) => ROLE_ORDER.indexOf(a.Role) - ROLE_ORDER.indexOf(b.Role));
      const red = gameRows.slice(5, 10).sort((a, b) => ROLE_ORDER.indexOf(a.Role) - ROLE_ORDER.indexOf(b.Role));
      const max = d3.max(gameRows, d => parseInt(d['Total damage to Champion']));
      setBlueChamps(blue);
      setRedChamps(red);
      setMaxDmg(max);
    });
  }, [gameNumber]);

  useEffect(() => {
    if (!barsRef.current || blueChamps.length === 0) return;
    const container = d3.select(barsRef.current);

    ROLE_ORDER.forEach((_, i) => {
      const blue = blueChamps[i];
      const red = redChamps[i];
      const bluePct = blue ? (parseInt(blue['Total damage to Champion']) / maxDmg) * 100 : 0;
      const redPct = red ? (parseInt(red['Total damage to Champion']) / maxDmg) * 100 : 0;

      container.select(`.blue-bar-${i}`)
        .transition().delay(i * 80).duration(500).ease(d3.easeCubicOut)
        .style('width', `${bluePct}%`);

      container.select(`.red-bar-${i}`)
        .transition().delay(i * 80).duration(500).ease(d3.easeCubicOut)
        .style('width', `${redPct}%`);
    });
  }, [blueChamps, redChamps, maxDmg]);

  return (
    <div className="igs-wrapper">
      <div className="igs-sidebar">
        <div className="igs-sidebar-title">{title}</div>
        {(Array.isArray(sidebarText) ? sidebarText : [sidebarText]).map((p, i) => (
          <p key={i} className="igs-sidebar-text">{p}</p>
        ))}
      </div>
      <div className="igs-table">
        <div className="igs-nav">
          <button className="igs-nav-btn" onClick={() => setGameNumber(g => Math.max(1, g - 1))} disabled={gameNumber === 1}>&#8592;</button>
          <span className="igs-nav-label">Game {gameNumber}</span>
          <button className="igs-nav-btn" onClick={() => setGameNumber(g => Math.min(totalGames, g + 1))} disabled={gameNumber === totalGames}>&#8594;</button>
        </div>
        <div className="igs-body">
          <div className="igs-teams">
            <TeamSlot team={topTeam} result="WIN" />
            <div className="igs-divider-h" />
            <TeamSlot team={bottomTeam} result="LOSE" />
          </div>
          <div className="igs-divider-v" />
          <div ref={barsRef} className="igs-bars">
            {ROLE_ORDER.map((role, i) => {
              const blue = blueChamps[i];
              const red = redChamps[i];
              return (
                <div key={role} className="igs-role-row">
                  <div className="igs-blue-side">
                    {blue && <img src={`${BASE}/images/champion_icons/${sanitize(blue.Champion)}.png`} alt={blue.Champion} className="igs-champ-icon" />}
                    <div className="igs-player-info">
                      <div className="igs-player-name">{blue ? `${blue.Team} ${blue.Player}` : ''}</div>
                      <div className={`blue-bar-${i} igs-bar-wrap`}>
                        <div className="igs-bar-blue" />
                        <div className="igs-dmg-right">{parseInt(blue?.['Total damage to Champion'] ?? 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="igs-red-side">
                    <div className="igs-player-info">
                      <div className="igs-player-name-right">{red ? `${red.Team} ${red.Player}` : ''}</div>
                      <div className={`red-bar-${i} igs-bar-wrap-red`}>
                        <div className="igs-bar-red" />
                        <div className="igs-dmg-left">{parseInt(red?.['Total damage to Champion'] ?? 0).toLocaleString()}</div>
                      </div>
                    </div>
                    {red && <img src={`${BASE}/images/champion_icons/${sanitize(red.Champion)}.png`} alt={red.Champion} className="igs-champ-icon" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
