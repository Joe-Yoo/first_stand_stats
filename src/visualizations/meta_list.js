import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './visualizations.css';

const BASE = process.env.PUBLIC_URL;
const ADCS = new Set(['Varus', 'Ashe', 'Yunara', 'Ezreal']);

export default function MetaList() {
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    d3.csv(`${BASE}/datasets/Champion_Stats.csv`).then(data => {
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
    <div className="ml-container">
      {champions.map(d => (
        <div key={d.Champion} className="ml-row">
          <div className="meta-item fade-left ml-item">
            <img src={`${BASE}/images/champion_icons/${d.Champion.replace(/[\s,\-']/g, '')}.png`} alt={d.Champion} onError={e => { e.target.src = `${BASE}/images/champion_icons/Orianna.png`; }} className="ml-champ-icon" />
            <span className={`ml-champ-name${ADCS.has(d.Champion) ? ' adc' : ''}`}>{d.Champion}</span>
            <span className="ml-prio">Priority Score {d.PrioScore}</span>
            <span className="ml-kda">KDA {d.KDA}</span>
            <span className="ml-wr">WR {d.Winrate}</span>
          </div>
          {d.Champion === 'Varus' && (
            <div className="ml-annotation">
              <span className="ml-annotation-arrow">◄</span>
              <span className="ml-annotation-text">Red text indicates ADC</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
