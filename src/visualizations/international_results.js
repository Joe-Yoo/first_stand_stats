import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import scrollama from 'scrollama';
import './visualizations.css';

const BASE = process.env.PUBLIC_URL;

const LOGO_SIZE = 28;
const totalWidth = 600;
const totalHeight = 400;
const margin = { top: 40, right: 20, bottom: LOGO_SIZE + 32, left: 50 };
const width = totalWidth - margin.left - margin.right;
const height = totalHeight - margin.top - margin.bottom;
const borderWidth = 8;

export default function InternationalScrolly() {
  const containerRef = useRef();
  const svgRef = useRef();

  useEffect(() => {
    d3.csv(`${BASE}/datasets/International_Results.csv`).then(data => {
      const teamRegion = {};
      data.forEach(d => {
        const team = d.Winner === 'SSW' ? 'SSG' : d.Winner;
        teamRegion[team] = d.Region;
      });

      const teamWins = d3.rollups(data, v => v.length, d => d.Winner === 'SSW' ? 'SSG' : d.Winner)
        .sort((a, b) => d3.descending(a[1], b[1]));

      const regionWins = d3.rollups(data, v => v.length, d => d.Region)
        .sort((a, b) => d3.descending(a[1], b[1]));

      const regionMap = new Map(regionWins);

      const xTeam = d3.scaleBand()
        .domain(teamWins.map(d => d[0]))
        .range([0, width])
        .padding(0.3);

      const xRegion = d3.scaleBand()
        .domain(regionWins.map(d => d[0]))
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(regionWins, d => d[1])])
        .nice()
        .range([height, 0]);

      const barData = teamWins.map(d => ({
        key: d[0],
        x0: xTeam(d[0]),
        y0: y(d[1]),
        w0: xTeam.bandwidth(),
        h0: height - y(d[1]),
        xSlide: xRegion(teamRegion[d[0]]) + (xRegion.bandwidth() - xTeam.bandwidth()) / 2,
        x1: xRegion(teamRegion[d[0]]),
        y1: y(regionMap.get(teamRegion[d[0]])),
        w1: xRegion.bandwidth(),
        h1: height - y(regionMap.get(teamRegion[d[0]])),
      }));

      const root = d3.select(svgRef.current);
      root.selectAll('*').remove();
      root.attr('width', totalWidth).attr('height', totalHeight);

      root.append('rect')
        .attr('x', borderWidth / 2)
        .attr('y', borderWidth / 2)
        .attr('width', totalWidth - borderWidth)
        .attr('height', totalHeight - borderWidth)
        .attr('rx', 12)
        .attr('fill', '#ffffff')
        .attr('stroke', '#C79E57')
        .attr('stroke-width', borderWidth);

      const svg = root.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      svg.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
        .selectAll('text')
        .attr('fill', '#000000')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '12px');

      svg.selectAll('.domain, .tick line').attr('stroke', '#1C1C1C');

      svg.selectAll('.bar')
        .data(barData, d => d.key)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => d.x0).attr('y', d => d.y0)
        .attr('width', d => d.w0).attr('height', d => d.h0)
        .attr('fill', '#10E4F9').attr('rx', 8);

      svg.selectAll('.logo-team')
        .data(teamWins, d => d[0])
        .join('image')
        .attr('class', 'logo-team')
        .attr('href', d => `${BASE}/images/team_logos/${d[0]}.png`)
        .attr('x', d => xTeam(d[0]) + xTeam.bandwidth() / 2 - LOGO_SIZE / 2)
        .attr('y', height + 8).attr('width', LOGO_SIZE).attr('height', LOGO_SIZE)
        .style('opacity', 1);

      svg.selectAll('.logo-region')
        .data(regionWins, d => d[0])
        .join('image')
        .attr('class', 'logo-region')
        .attr('href', d => `${BASE}/images/region_logos/${d[0]}.png`)
        .attr('x', d => xRegion(d[0]) + xRegion.bandwidth() / 2 - LOGO_SIZE / 2)
        .attr('y', height + 8).attr('width', LOGO_SIZE).attr('height', LOGO_SIZE)
        .style('opacity', 0);

      function handleStepEnter({ index }) {
        const t = d3.transition().duration(800).ease(d3.easeCubicInOut);

        switch (index) {
          case 0:
            svg.selectAll('.bar').transition(t)
              .attr('x', d => d.x0).attr('y', d => d.y0)
              .attr('width', d => d.w0).attr('height', d => d.h0);
            svg.selectAll('.logo-team').transition(t).style('opacity', 1);
            svg.selectAll('.logo-region').transition(t).style('opacity', 0);
            break;

          case 1:
            svg.selectAll('.bar').transition(t)
              .attr('x', d => d.xSlide)
              .transition().duration(800).ease(d3.easeCubicInOut)
              .attr('x', d => d.x1).attr('y', d => d.y1)
              .attr('width', d => d.w1).attr('height', d => d.h1);
            svg.selectAll('.logo-team').transition(t).style('opacity', 0);
            svg.selectAll('.logo-region')
              .transition(t).transition().duration(800).style('opacity', 1);
            break;

          default:
            break;
        }
      }

      handleStepEnter({ index: 0 });

      const scroller = scrollama();
      scroller
        .setup({ step: '.scrolly-step', offset: 0.5 })
        .onStepEnter(handleStepEnter);

      return () => scroller.destroy();
    });
  }, []);

  return (
    <div ref={containerRef} className="ir-container">
      <div className="ir-sticky">
        <svg ref={svgRef} />
      </div>
      <div className="scrolly-step ir-step" />
      <div className="scrolly-step ir-step" />
    </div>
  );
}
