import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';
import InternationalScrolly from './visualizations/international_results';
import TeamStarPlot from './visualizations/team_star_plot';
import MetaList from './visualizations/meta_list';
import IndividualGameStats from './visualizations/individual_games_stats';

const BASE = process.env.PUBLIC_URL;
const ROLE_ORDER = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];
const ROLE_DISPLAY = { TOP: 'Top', JGL: 'Jungle', MID: 'Middle', BOT: 'Bottom', SUP: 'Support' };

function App() {
  const [players, setPlayers] = useState([]);
  const [opponentTeams, setOpponentTeams] = useState([]);

  useEffect(() => {
    d3.csv(`${BASE}/datasets/Pre_First_Stand.csv`).then(data => {
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
        <img src={`${BASE}/images/G2_Team_Pic.jpg`} alt="G2 Team" className="title-photo" />
        <p className="title">A Closer Look at G2's <span className="text-teal">Almost</span> Historic run at First Stand 2026</p>
      </div>
      <div className="section" id="setting-the-scene" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ flex: 1, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="title fade-up" style={{ animationDelay: '0s' }}>Setting the scene</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.15s' }}>Historically, competitive League of Legends has been dominated by East Asian teams, particularly from Korea. Teams have won up to five international titles individually, and that number climbs even higher when you account for rebrands. SKT and T1 are technically the same organization, and between them they have eight international wins. China has similarly stacked up titles over the years, with teams like BLG continuing that trend at First Stand 2026.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.3s' }}>Meanwhile, the West has managed just two international wins, both from Europe, and the most recent came in 2019. Nearly seven years ago. North America and Brazil have never won one. So when a western team like G2 gets within one series of an international title, pushes the world's best team to four games in a final, and eliminates the top Korean seed along the way, it carries more weight than a single tournament result normally would. It is not a win, but in the context of how lopsided this history has been, it is the closest thing to progress the West has shown in a long time. Whether First Stand 2026 signals a genuine shift in the regional skill gap or was simply G2 catching the right meta at the right time remains to be seen, but it at least gave western fans a reason to believe that gap might be closing.</p>
          </div>
          <div className="fade-up" style={{ flex: 1 }}>
            <InternationalScrolly />
          </div>
        </div>
      </div>
      <div className="section" id="who-is-g2">
        <p className="title">Who is G2?</p>
        <img src={`${BASE}/images/team_logos/G2.png`} alt="G2" className="team-logo" />
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
                      <img src={`${BASE}/images/player_photos/${player}.webp`} alt={player} />
                    </div>
                    <div className="player-card-name">{player}</div>
                    <div className="player-card-stats">
                      <div className="stat-row"><span>Kill Participation</span><span className={kp === maxKp ? 'text-teal' : ''}>{kp}%</span></div>
                      <div className="stat-row"><span>Damage Dealt</span><span className={dmg === maxDmg ? 'text-teal' : ''}>{dmg}%</span></div>
                      <div className="stat-row"><span>Damage Per Minute</span><span className={dpm === maxDpm ? 'text-teal' : ''}>{dpm}</span></div>
                    </div>
                  </div>
                  <img src={`${BASE}/images/role_logos/${role}_icon.png`} alt={role} className="role-icon" />
                </div>
              ))}
            </div>
          );
        })()}
        <p style={{ maxWidth: '800px', textAlign: 'center' }}>G2 is one of the most popular teams in the European region. Known for their star player, Caps, G2 is a resilient team that was able to fight through a slow start during the first split. Looking at the stats, we can see that the team plays around their mid laner, as their mid laner is known to be able to carry games whenever he can. However, the other players are no slouches either. Their carries oftentimes step up to the occasion, with the support of their jungler and their support, they make a well rounded team, with a bias towards their top side players (Top and Mid).</p>
      </div>
      <div className="section" id="who-are-the-opponents">
        <p className="title">Who are the opponents?</p>
        <TeamStarPlot team="TSW" description="A Vietnamese team formed in December 2024 from a partnership between Team Whales and Team Secret, TSW quickly established themselves as the top squad in the LCP, claiming 1st place at LCP 2026 Split 1 and earning an international berth at First Stand 2026. ADC Eddie ranked sixth among ADCs entering First Stand, posting a 6.3 KDA and 10.2 CS per minute internationally, making him the clear standout and primary carry threat on the roster." />
        <TeamStarPlot team="BFX" description="A rising LCK squad backed by the BNK financial group, BFX finished 5th at First Stand 2026 and claimed 2nd place at the LCK Cup 2026, marking their first real international footprint. ADC Diable (Nam Dae-geun), who earned Rookie of the Year honors after a remarkable 2025 season, stayed with the club despite reported LPL interest, and became one of only two players to score multiple pentakills in a single international event at First Stand 2026, beating a record held for 12 years." />
        <TeamStarPlot team="GEN" description="The dominant LCK organization of the modern era, Gen.G holds the record for the most consecutive series victories in League of Legends esports with 27 straight wins achieved from April to July 2025, and went on to win the 2025 Mid-Season Invitational and the 2025 Esports World Cup. ADC Ruler (Park Jae-hyuk) returned to Gen.G from the LPL and has re-established himself as one of the world's premier carries, with analysts at First Stand 2026 noting he has definitively answered questions about whether younger rivals have surpassed him." />
        <TeamStarPlot team="BLG" description="The current #1 ranked team in the world, BLG claimed 1st place at both First Stand 2026 and LPL 2026 Split 1, finally delivering the LPL its first international title since 2023. With Bin, Knight, and Viper forming one of the most experienced cores in professional League of Legends, BLG are considered frontrunners for MSI alongside Gen.G and T1. Mid laner Knight was a constant menace throughout First Stand, getting the better of Caps during the grand final series and earning two solo kills in game three, cementing his status as the LPL's premier mid laner. Top laner Bin was the undisputed star of the tournament, named tournament MVP, he declared on stage that winning proved he can be the strongest top laner in the world, and this marks his second international title, having previously won MSI 2022 with RNG." />
      </div>
      <div className="section" id="the-meta" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ flex: 1, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p className="title fade-up" style={{ animationDelay: '0s' }}>The Meta</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.15s' }}>The top 5 priority scores belong to Orianna (81%), Ryze (80%), Karma (64%), Rumble (62%), and Varus (61%). While Karma and Varus are bot lane adjacent, the real weight of the draft was clearly being placed on mid and top. Orianna and Ryze being so heavily prioritized that teams would rather ban them out than let the opponent have them says a lot about where the game-deciding pressure was coming from.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.3s' }}>Top lane bruisers like Rumble, Ambessa, Renekton, and Gnar all sat comfortably in that 27 to 62% range, giving top laners a wide, healthy pool of contested picks. Mid lane had a similarly deep pool with Akali, Annie, Ahri, Aurora, Twisted Fate, and LeBlanc all getting meaningful priority beyond the Orianna/Ryze core.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.45s' }}>The ADC side of the data tells a different story. Varus at 61% is the outlier, and likely propped up by his utility-focused builds rather than raw carry power. After him, the drop-off is steep: Ashe 31%, Ezreal 27%, Yunara 28%, Kaisa 15%, Caitlyn 12%. Most traditional marksmen sat below 15% or at 0%. That is a notably shallow and low-priority pool compared to top and mid.</p>
            <br />
            <p className="fade-up" style={{ animationDelay: '0.6s' }}>This context makes G2's run at First Stand especially interesting. Caps has long been one of the best mid laners in the West, and with BrokenBlade holding his own in the top lane, G2 were structurally built to thrive in exactly this kind of meta. Their topside-focused style meant they were drafting into the game's strongest role distribution. Let's see how G2 did against these teams.</p>
          </div>
          <div style={{ flex: 1 }}>
            <MetaList />
          </div>
        </div>
      </div>
      <div className="section" id="g2-matchups-south-korea" style={{ gap: '80px' }}>
        <p className="title">G2's Winning Matchups</p>
        <IndividualGameStats winTeam="G2" loseTeam="TSW" csvPath={`${BASE}/datasets/G2vsTSW.csv`} title="G2 vs TSW" totalGames={3} sidebarText="G2 beat TSW 3-0 in their Group A opener, though it was not as clean as the scoreline suggests. TSW matched G2 in the early game across all three maps, and in Game 3 even had the lead through the first few dragons. Game 2 was the most even of the series, with G2 running counter-picks that TSW largely neutralized before G2 eventually pulled ahead in the mid-game. The difference came down to macro and individual quality at the right moments. Caps had a strong Game 1, dictating the pace from mid lane, and BrokenBlade stepped up in Game 3 to close things out. Skewmond called it 'a bit of a rollercoaster' after the series, which felt accurate." />
        <IndividualGameStats winTeam="G2" loseTeam="BFX" csvPath={`${BASE}/datasets/G2vsBFX.csv`} title="G2 vs BFX" totalGames={3} sidebarText="G2 beat BFX 3-0 in the lower bracket to advance to the knockout stage, and it was a result that few expected given BFX's tournament run up to that point. The series went the way it did largely through Skewmond controlling the pace from the jungle across all three games, with G2 consistently winning the teamfights that BFX needed to win to stay in it. The interesting wrinkle was Hans Sama, who finished the series with a 22/7/31 scoreline and outperformed Diable throughout, which somewhat complicates the narrative around the meta not favoring ADCs. That said, it is worth noting that G2's structure still ran through their topside, with Hans Sama benefiting from the space that Skewmond and BrokenBlade created rather than generating leads himself. Game 2 was the closest of the three, with BFX building a 5k gold lead at one point before overextending and handing G2 the kills they needed to swing it back. Games 1 and 3 were more controlled G2 performances. The win sent G2 through to face Gen.G, and eliminated BFX from the tournament." />
        <IndividualGameStats winTeam="G2" loseTeam="GEN" csvPath={`${BASE}/datasets/G2vsGEN.csv`} title="G2 vs GEN" totalGames={3} sidebarText="G2 swept Gen.G 3-0 in the semifinals, which at the time was the biggest result of the tournament. Gen.G had gone into the match undefeated, having not dropped a game in the group stage, and were widely considered the favorites to win the whole thing. G2's path there had been shakier by comparison, but the series was not close. Skewmond completely outpaced Canyon in the jungle across all three maps, and Caps held his own against Chovy in the mid lane matchup that most expected to go the other way. Game 1 set the tone, with G2 building a commanding gold lead and stealing Baron away from Gen.G to close it out. Game 2 was slightly more contested, with Gen.G securing neutral objectives to slow things down, but a lost fight in the bot lane gave G2 the Baron they needed to take control. Game 3 was similarly one-sided. Gen.G, a team that had spent the year looking unshakeable, never looked comfortable. This is again where the meta argument holds up reasonably well. G2's topside-focused style matched up poorly for Gen.G, who had no clean answer for a team willing to play through the map the way G2 did. Caps outperforming Chovy, even narrowly, was arguably all G2 needed to take over games from there." />
      </div>
      <div className="section" id="g2-matchup-blg" style={{ gap: '80px' }}>
        <p className="title">G2's Matchup with BLG</p>
        <IndividualGameStats winTeam="G2" loseTeam="BLG" csvPath={`${BASE}/datasets/G2vsBLG.csv`} title="G2 vs BLG" totalGames={7} winGameNumbers={[4]} sidebarText={[
            "G2 faced BLG twice at First Stand, losing both times, first 3-0 in the group stage and then 3-1 in the grand final. The group stage meeting was fairly straightforward. BLG's topside of Knight and Bin simply outclassed their counterparts, with Knight picking up multiple solo kills on Caps across the series and Bin dominating BrokenBlade in lane. G2 had no real answer for how BLG structured their game around those two players, and the 3-0 scoreline reflected that gap clearly.",
            "The grand final was more competitive (starts with game 4), with G2 actually taking Game 1 behind a strong Caps performance on Aurora. But once BLG adjusted, the pattern from the group stage reasserted itself. Knight and Bin took over their respective lanes and BLG's superior topside damage became the deciding factor in fights. The one area where G2 pushed back was in the bot lane, where Hans Sama had moments, but it was never enough to offset what BLG were generating from the top half of the map. It is a fitting end to the tournament narrative in some ways. G2 proved their topside-focused approach could beat the best LCK team in the world, but BLG played a similar style with higher individual ceilings in those roles, and that difference showed both times they met."
          ]} />
      </div>
      <div className="section" id="conclusion">
        <p className="title fade-up" style={{ animationDelay: '0s' }}>Conclusion</p>
        <img src={`${BASE}/images/G2_Team_Pic_2.webp`} alt="G2 Team" className="title-photo fade-up" style={{ animationDelay: '0.2s' }} />
        <p className="fade-up" style={{ maxWidth: '800px', textAlign: 'center', animationDelay: '0.4s' }}>Unfortunately, G2's luck would run out in the grand final against BLG, losing 3-1 in a hard fought rematch. While disappointing for many, particularly European fans who had not seen their region reach this stage in years, the run itself felt significant. G2 beat two LCK teams back to back, pushed the best team in the world to four games, and did it playing into a meta that genuinely suited them. Whether that translates to a lasting shift is hard to say, but First Stand 2026 at least raised the question of whether the gap between regions is as wide as recent results suggested. If nothing else, it made a case that the right team, with the right meta, can compete with anyone. Future international tournaments may have more of that unpredictability, and that is probably good for the game.</p>
      </div>
    </div>
  );
}

export default App;
