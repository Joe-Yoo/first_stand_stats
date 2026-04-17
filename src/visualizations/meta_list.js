import { useEffect, useState } from 'react';
import * as d3 from 'd3';

const ADCS = new Set(['Varus', 'Ashe', 'Yunara', 'Ezreal']);

export default function MetaList() {
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    d3.csv('/datasets/Champion_Stats.csv').then(data => {
      const filtered = data
        .filter(d => parseFloat(d.PrioScore) >= 20)
        .sort((a, b) => parseFloat(b.PrioScore) - parseFloat(a.PrioScore));
      setChampions(filtered);
    });
  }, []);

  useEffect(() => {
    if (champions.length === 0) return;
    const items = document.querySelectorAll('.meta-item');
    if (items.length === 0) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        items.forEach((el, i) => {
          el.style.animationDelay = `${i * 0.06}s`;
          el.classList.add('visible');
        });
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(items[0]);
    return () => observer.disconnect();
  }, [champions]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '520px' }}>
      {champions.map(d => (
        <div key={d.Champion} className="meta-item fade-left" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          border: '1.5px solid var(--gold_color)',
          borderRadius: '8px',
        }}>
          <img src={`/images/champion_icons/${d.Champion}.png`} alt={d.Champion} onError={e => { e.target.src = '/images/champion_icons/Orianna.png'; }} style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 8 }} />
          <span style={{ fontWeight: 600, minWidth: '120px', color: ADCS.has(d.Champion) ? 'var(--red_color)' : 'var(--text_color)' }}>{d.Champion}</span>
          <span style={{ color: 'var(--gold_color)', fontWeight: 600, minWidth: '160px' }}>Priority Score {d.PrioScore}</span>
          <span style={{ color: 'var(--text_color)', minWidth: '70px' }}>KDA {d.KDA}</span>
          <span style={{ color: 'var(--text_color)' }}>WR {d.Winrate}</span>
        </div>
      ))}
    </div>
  );
}
