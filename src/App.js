import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';
import InternationalScrolly from './visualizations/international_results';
import TeamStarPlot from './visualizations/team_star_plot';
import MetaList from './visualizations/meta_list';

const ROLE_ORDER = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];
const ROLE_DISPLAY = { TOP: 'Top', JGL: 'Jungle', MID: 'Middle', BOT: 'Bottom', SUP: 'Support' };

function App() {
  const [players, setPlayers] = useState([]);
  const [opponentTeams, setOpponentTeams] = useState([]);

  useEffect(() => {
    d3.csv('/datasets/Pre_First_Stand.csv').then(data => {
      const g2 = data
        .filter(d => d.Team === 'G2')
        .sort((a, b) => ROLE_ORDER.indexOf(a.Role) - ROLE_ORDER.indexOf(b.Role))
        .map(row => ({
          role: ROLE_DISPLAY[row.Role],
          player: row.Player,
          kp: parseFloat(row['KP%']),
          dmg: parseFloat(row['DMG%']),
          dpm: parseInt(row['DPM']),
        }));
      setPlayers(g2);

      setOpponentTeams(['TSW', 'GEN', 'BFX', 'BLG']);
    });
  }, []);

  useEffect(() => {
    if (opponentTeams.length === 0) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.star-plot-wrap').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.15}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [opponentTeams]);

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
      <div className="section" id="setting-the-scene" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ flex: 1, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="title fade-up" style={{ animationDelay: '0s' }}>Setting the scene</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.15s' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.3s' }}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.45s' }}>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.</p>
          </div>
          <div className="fade-up" style={{ flex: 1 }}>
            <InternationalScrolly />
          </div>
        </div>
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
        <p style={{ maxWidth: '800px', textAlign: 'center' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      </div>
      <div className="section" id="who-are-the-opponents">
        <p className="title">Who are the opponents?</p>
        {opponentTeams.map(team => <TeamStarPlot key={team} team={team} />)}
      </div>
      <div className="section" id="the-meta" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ flex: 1, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="title fade-up" style={{ animationDelay: '0s' }}>The Meta</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.15s' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.3s' }}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.45s' }}>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.</p>
          </div>
          <div style={{ flex: 1 }}>
            <MetaList />
          </div>
        </div>
      </div>
      <div className="section" id="g2-matchups-south-korea"><p className="title">G2's Matchups with South Korea</p></div>
      <div className="section" id="g2-matchup-blg"><p className="title">G2's Matchup with BLG</p></div>
      <div className="section" id="conclusion"><p className="title">Conclusion</p></div>
    </div>
  );
}

export default App;
