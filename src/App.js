import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';
import InternationalScrolly from './visualizations/international_results';

const G2_ORDER = [
  { player: 'Brokenblade', role: 'Top' },
  { player: 'SkewMond', role: 'Jungle' },
  { player: 'Caps', role: 'Middle' },
  { player: 'Hans Sama', role: 'Bottom' },
  { player: 'Labrov', role: 'Support' },
];

function App() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    d3.csv('/datasets/Pre_First_Stand.csv').then(data => {
      const g2 = G2_ORDER.map(({ player, role }) => {
        const row = data.find(d => d.Player === player && d.Team === 'G2');
        return { role, player, kp: parseFloat(row['KP%']), dmg: parseFloat(row['DMG%']), dpm: parseInt(row['DPM']) };
      });
      setPlayers(g2);
    });
  }, []);

  useEffect(() => {
    if (players.length === 0) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const columns = document.querySelectorAll('.player-column');
    columns.forEach((col, i) => {
      col.style.animationDelay = `${i * 0.1}s`;
      observer.observe(col);
    });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [players]);

  return (
    <div className="App">
      <div className="section" id="title">
        <img src="/images/G2_Team_Pic.jpg" alt="G2 Team" className="title-photo" />
        <p className="title">A Closer Look at G2's <span className="text-teal">Almost</span> Historic run at First Stand 2026</p>
      </div>
      <div className="section" id="setting-the-scene">
        <p className="title fade-up">Setting the scene</p>
        <div className="fade-up"><InternationalScrolly /></div>
      </div>
      <div className="section" id="who-is-g2">
        <p className="title">Who is G2?</p>
        <img src="/images/team_logos/G2.png" alt="G2" className="team-logo" />
        {(() => {
          const maxKp = Math.max(...players.map(p => p.kp));
          const maxDmg = Math.max(...players.map(p => p.dmg));
          const maxDpm = Math.max(...players.map(p => p.dpm));
          return (
            <div className="player-columns">
              {players.map(({ role, player, kp, dmg, dpm }) => (
                <div className="player-column" key={role}>
                  <div className="player-card">
                    <div className="player-card-photo">
                      <img src={`/images/player_photos/${player}.webp`} alt={player} />
                    </div>
                    <div className="player-card-name">{player}</div>
                    <div className="player-card-stats">
                      <div className="stat-row"><span>Kill Participation</span><span className={kp === maxKp ? 'text-teal' : ''}>{kp}%</span></div>
                      <div className="stat-row"><span>Damage Dealt</span><span className={dmg === maxDmg ? 'text-teal' : ''}>{dmg}%</span></div>
                      <div className="stat-row"><span>Damage Per Minute</span><span className={dpm === maxDpm ? 'text-teal' : ''}>{dpm}</span></div>
                    </div>
                  </div>
                  <img src={`/images/role_logos/${role}_icon.png`} alt={role} className="role-icon" />
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      <div className="section" id="who-are-the-opponents"><p className="title">Who are the opponents?</p></div>
      <div className="section" id="the-meta"><p className="title">The Meta</p></div>
      <div className="section" id="g2-matchups-south-korea"><p className="title">G2's Matchups with South Korea</p></div>
      <div className="section" id="g2-matchup-blg"><p className="title">G2's Matchup with BLG</p></div>
      <div className="section" id="conclusion"><p className="title">Conclusion</p></div>
    </div>
  );
}

export default App;
