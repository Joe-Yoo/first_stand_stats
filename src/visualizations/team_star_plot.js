import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './visualizations.css';

const BASE = process.env.PUBLIC_URL;
const TEAM_NAMES = { TSW: 'Team Secret Whales', BFX: 'FearX', GEN: 'Gen.G', BLG: 'Bilibili Gaming' };

const ROLES = ['MID', 'BOT', 'SUP', 'TOP', 'JGL'];
const ROLE_DISPLAY = { MID: 'Middle', BOT: 'Bottom', SUP: 'Support', TOP: 'Top', JGL: 'Jungle' };
const GOLD = '#D4A843';
const TEAL = 'var(--teal_color)';
const TICKS = [200, 400, 600, 800, 1000];

const SIZE = 360;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 110;
const R_ICON = R + 36;
const ICON_SIZE = 36;

function getPoints(r) {
  return ROLES.map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle), angle };
  });
}

export default function TeamStarPlot({ team, description }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!team) return;

    d3.csv(`${BASE}/datasets/Pre_First_Stand.csv`).then(data => {
      const dpmByRole = {};
      ROLES.forEach(role => {
        const candidates = data.filter(d => d.Team === team && d.Role === role);
        if (candidates.length === 0) return;
        const totalGames = candidates.reduce((sum, d) => sum + parseInt(d.Games), 0);
        const weightedDPM = candidates.reduce((sum, d) => sum + parseInt(d.DPM) * parseInt(d.Games), 0) / totalGames;
        dpmByRole[role] = Math.round(weightedDPM);
      });

      const vertices = getPoints(R);
      const icons = getPoints(R_ICON);
      const pentagonStr = vertices.map(({ x, y }) => `${x},${y}`).join(' ');

      const tickLines = vertices.flatMap(({ angle }, i) =>
        TICKS.map(tick => {
          const d = R * (tick / 1000);
          const tx = CX + d * Math.cos(angle);
          const ty = CY + d * Math.sin(angle);
          const px = -Math.sin(angle);
          const py = Math.cos(angle);
          const len = 4;
          return { key: `tick-${i}-${tick}`, x1: tx - len * px, y1: ty - len * py, x2: tx + len * px, y2: ty + len * py };
        })
      );

      const maxDpmRole = ROLES.reduce((best, role) =>
        (dpmByRole[role] ?? 0) > (dpmByRole[best] ?? 0) ? role : best
      );

      const dpmPoints = ROLES.every(r => dpmByRole[r] !== undefined)
        ? ROLES.map((role, i) => {
            const { angle } = vertices[i];
            const d = R * Math.min(dpmByRole[role] / 1000, 1);
            return { x: CX + d * Math.cos(angle), y: CY + d * Math.sin(angle), isMax: role === maxDpmRole };
          })
        : [];

      const dpmPolygonStr = dpmPoints.map(({ x, y }) => `${x},${y}`).join(' ');

      const root = d3.select(svgRef.current);
      root.selectAll('*').remove();
      root.attr('width', SIZE).attr('height', SIZE);

      vertices.forEach(({ x, y }) => {
        root.append('line')
          .attr('x1', CX).attr('y1', CY).attr('x2', x).attr('y2', y)
          .attr('stroke', GOLD).attr('stroke-width', 1).attr('stroke-opacity', 0.4);
      });

      tickLines.forEach(({ x1, y1, x2, y2 }) => {
        root.append('line')
          .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
          .attr('stroke', GOLD).attr('stroke-width', 1).attr('stroke-opacity', 0.6);
      });

      root.append('polygon')
        .attr('points', pentagonStr)
        .attr('fill', 'rgba(212, 168, 67, 0.12)')
        .attr('stroke', GOLD)
        .attr('stroke-width', 2);

      if (dpmPoints.length > 0) {
        root.append('polygon')
          .attr('points', dpmPolygonStr)
          .attr('fill', 'rgba(212, 168, 67, 0.25)')
          .attr('stroke', GOLD)
          .attr('stroke-width', 2);

        const ttPad = 6;
        const tooltip = root.append('g').style('opacity', 0).attr('pointer-events', 'none');
        const ttRect = tooltip.append('rect')
          .attr('fill', '#000000').attr('stroke', GOLD).attr('stroke-width', 1.5).attr('rx', 4);
        const ttText = tooltip.append('text')
          .attr('fill', '#ffffff').attr('font-size', '12px')
          .attr('font-family', 'Inter, sans-serif').attr('font-weight', '600')
          .attr('dominant-baseline', 'central');

        dpmPoints.forEach(({ x, y, isMax }, i) => {
          root.append('circle')
            .attr('cx', x).attr('cy', y).attr('r', isMax ? 8 : 5)
            .attr('fill', isMax ? TEAL : GOLD)
            .style('cursor', 'pointer')
            .on('mouseover', () => {
              ttText.text(`${dpmByRole[ROLES[i]]} DPM`);
              const bbox = ttText.node().getBBox();
              const tw = bbox.width + ttPad * 2;
              const th = bbox.height + ttPad * 2;
              ttRect.attr('width', tw).attr('height', th);
              ttText.attr('x', ttPad).attr('y', th / 2);
              const onRight = x > CX;
              const tx = onRight ? x - tw - 10 : x + 10;
              tooltip.attr('transform', `translate(${tx},${y - th - 4})`).style('opacity', 1);
            })
            .on('mouseout', () => tooltip.style('opacity', 0));
        });
      }

      icons.forEach(({ x, y }, i) => {
        root.append('image')
          .attr('href', `${BASE}/images/role_logos/${ROLE_DISPLAY[ROLES[i]]}_icon.png`)
          .attr('x', x - ICON_SIZE / 2).attr('y', y - ICON_SIZE / 2)
          .attr('width', ICON_SIZE).attr('height', ICON_SIZE);
      });
    });
  }, [team]);

  return (
    <div className="star-plot-wrap fade-up sp-wrap">
      <div className="sp-info">
        <div className="sp-header">
          <img src={`${BASE}/images/team_logos/${team}.png`} alt={team} className="sp-team-logo" />
          <span className="sp-team-name">{TEAM_NAMES[team] ?? team}</span>
        </div>
        <div className="team-description">
          <p>{description}</p>
        </div>
      </div>
      <svg ref={svgRef} />
    </div>
  );
}
