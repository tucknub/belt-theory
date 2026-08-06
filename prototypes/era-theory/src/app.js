const dimensions = [
  { key: 'team', label: 'Team results' },
  { key: 'post', label: 'Postseason achievement' },
  { key: 'qb', label: 'Quarterback management' },
  { key: 'dev', label: 'Draft and development' },
  { key: 'roster', label: 'Roster-resource strategy' },
  { key: 'coach', label: 'Coaching ecosystem' },
  { key: 'injury', label: 'Injury resilience and depth' }
];

const eras = [
  { id: 'polian', name: 'Bill Polian', score: 70.5, values: [68.3, 48.2, 95.7, 75.4, 66.2, 80.5, 70.1], color: '#62b5ff' },
  { id: 'grigson', name: 'Ryan Grigson', score: 61.1, values: [60.9, 35.0, 85.6, 59.6, 64.3, 65.8, 81.2], color: '#b7c2cf' },
  { id: 'ballard', name: 'Chris Ballard', score: 47.8, values: [46.5, 7.8, 45.7, 73.2, 74.5, 68.1, 49.8], color: '#1769e0' }
];

const scenarioWeights = {
  published: { label: 'Published balanced', weights: [25, 20, 15, 15, 10, 10, 5] },
  results: { label: 'Results and titles', weights: [25, 30, 15, 10, 5, 10, 5] },
  evaluator: { label: 'Talent evaluator', weights: [10, 10, 10, 30, 25, 10, 5] },
  qb: { label: 'QB and stability', weights: [15, 15, 30, 10, 10, 10, 10] },
  sustainable: { label: 'Sustainable organization', weights: [15, 15, 15, 15, 10, 20, 10] },
  equal: { label: 'Equal weight', weights: [14.2857, 14.2857, 14.2857, 14.2857, 14.2857, 14.2857, 14.2857] },
  draftOnly: { label: 'Drafting + transactions only', weights: [0, 0, 0, 50, 50, 0, 0] },
  resilienceOnly: { label: 'Roster + resilience only', weights: [0, 0, 0, 0, 50, 0, 50] }
};

const qbs = [
  ['1998–2011', 'Peyton Manning', '13-season solution; 2011 contingency collapse'],
  ['2012–2018', 'Andrew Luck', 'Immediate reset; injuries ended the plan'],
  ['2019', 'Jacoby Brissett', 'Emergency succession after retirement'],
  ['2020', 'Philip Rivers', 'Best one-year bridge and playoff berth'],
  ['2021', 'Carson Wentz', 'Premium-cost reset failed in one year'],
  ['2022', 'Matt Ryan', 'Veteran reset collapsed with the roster'],
  ['2023–2025', 'Richardson / Jones', 'Draft bet, bridge success, no durable answer yet']
];

function renderScorecards() {
  const container = document.querySelector('#scorecards-container');
  container.innerHTML = eras.map((era, index) => `
    <article class="era-card ${era.id}">
      <header><h3>${era.name}</h3><span class="${index === 0 ? 'winner-tag' : ''}">${era.score.toFixed(1)}</span></header>
      <div class="metric-list">
        ${dimensions.map((dim, i) => `<div class="metric"><label>${dim.label}</label><div class="metric-track" aria-hidden="true"><span style="width:${Math.max(2, era.values[i])}%"></span></div><output>${era.values[i].toFixed(1)}</output></div>`).join('')}
      </div>
    </article>
  `).join('');
}

function polarPoint(cx, cy, radius, angle) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function renderRadar() {
  const svg = document.querySelector('#radar');
  const cx = 280, cy = 245, maxR = 165, count = dimensions.length;
  const angleFor = i => -Math.PI / 2 + (i * Math.PI * 2 / count);
  const grid = [20, 40, 60, 80, 100].map(level => {
    const points = dimensions.map((_, i) => polarPoint(cx, cy, maxR * level / 100, angleFor(i)).join(',')).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#24425d" stroke-width="1" />`;
  }).join('');
  const axes = dimensions.map((dim, i) => {
    const [x, y] = polarPoint(cx, cy, maxR, angleFor(i));
    const [lx, ly] = polarPoint(cx, cy, maxR + 42, angleFor(i));
    const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
    const words = dim.label.split(' ');
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#24425d" /><text x="${lx}" y="${ly}" fill="#98abc0" font-size="12" text-anchor="${anchor}">${words.map((w,j)=>`<tspan x="${lx}" dy="${j===0?0:14}">${w}</tspan>`).join('')}</text>`;
  }).join('');
  const polygons = eras.map(era => {
    const points = era.values.map((value, i) => polarPoint(cx, cy, maxR * value / 100, angleFor(i)).join(',')).join(' ');
    const circles = era.values.map((value, i) => { const [x,y] = polarPoint(cx,cy,maxR*value/100,angleFor(i)); return `<circle cx="${x}" cy="${y}" r="3" fill="${era.color}" />`; }).join('');
    return `<polygon points="${points}" fill="${era.color}22" stroke="${era.color}" stroke-width="2" />${circles}`;
  }).join('');
  svg.innerHTML = `${grid}${axes}${polygons}`;
}

function renderQbs() {
  document.querySelector('#qb-timeline').innerHTML = qbs.map(([years,name,note]) => `<div class="qb-item"><span>${years}</span><strong>${name}</strong><small>${note}</small></div>`).join('');
}

function computeScores(weights) {
  return eras.map(era => ({ ...era, modelScore: era.values.reduce((sum, val, i) => sum + val * (weights[i] / 100), 0) }));
}

function renderModel(weights) {
  const scores = computeScores(weights).sort((a,b) => b.modelScore - a.modelScore);
  const winner = scores[0];
  document.querySelector('#model-winner').textContent = winner.name;
  document.querySelector('#model-bars').innerHTML = eras.map(era => {
    const result = scores.find(item => item.id === era.id);
    return `<div class="model-bar-row ${era.id}"><label>${era.name.replace('Chris ','').replace('Ryan ','').replace('Bill ','')}</label><div class="model-bar-track"><span style="width:${result.modelScore}%"></span></div><output>${result.modelScore.toFixed(1)}</output></div>`;
  }).join('');
  const margin = scores[0].modelScore - scores[1].modelScore;
  const complete = weights.filter(Boolean).length >= 5;
  document.querySelector('#model-reading').textContent = complete
    ? `${winner.name} wins this complete model by ${margin.toFixed(1)} points.`
    : `${winner.name} wins this deliberately narrow stress test by ${margin.toFixed(1)} points. It is not a complete leadership model.`;
}

function setupSensitivity() {
  const select = document.querySelector('#scenario');
  const list = document.querySelector('#weight-list');
  select.innerHTML = Object.entries(scenarioWeights).map(([key, scenario]) => `<option value="${key}">${scenario.label}</option>`).join('');

  function loadWeights(weights) {
    list.innerHTML = dimensions.map((dim, i) => `<div class="weight-row"><label for="weight-${dim.key}">${dim.label}</label><input id="weight-${dim.key}" type="range" min="0" max="50" step="1" value="${weights[i]}" data-weight-index="${i}" /><output>${Math.round(weights[i])}%</output></div>`).join('');
    list.querySelectorAll('input').forEach(input => input.addEventListener('input', () => { input.nextElementSibling.textContent = `${input.value}%`; }));
  }
  loadWeights(scenarioWeights.published.weights);
  renderModel(scenarioWeights.published.weights);

  select.addEventListener('change', () => loadWeights(scenarioWeights[select.value].weights));
  document.querySelector('#model-controls').addEventListener('submit', event => {
    event.preventDefault();
    const raw = [...list.querySelectorAll('input')].map(input => Number(input.value));
    const total = raw.reduce((a,b) => a+b,0) || 1;
    const normalized = raw.map(value => value / total * 100);
    renderModel(normalized);
  });
  document.querySelector('#reset-model').addEventListener('click', () => {
    select.value = 'published'; loadWeights(scenarioWeights.published.weights); renderModel(scenarioWeights.published.weights);
  });
}

function setupNavigation() {
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('#mobile-nav');
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.hidden = true; button.setAttribute('aria-expanded','false'); }));
}

function setupDialog() {
  const dialog = document.querySelector('#methodology-dialog');
  document.querySelectorAll('[data-open-methodology]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

renderScorecards();
renderRadar();
renderQbs();
setupSensitivity();
setupNavigation();
setupDialog();
