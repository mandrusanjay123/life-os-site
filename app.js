/* Life OS — Etherious (static PWA)
   - LocalStorage persistence
   - JSON import/export
   - Print-friendly
   - Dark/Light theme
*/

const state = {
  theme: localStorage.getItem('theme') || 'dark',
  lastSaved: null,
  tabs: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'daily', label: 'Daily Plan' },
    { id: 'weekly', label: 'Weekly Review' },
    { id: 'goals', label: '12-Month Goals' },
    { id: 'job', label: 'Job Search' },
    { id: 'health', label: 'Health' },
    { id: 'settings', label: 'Settings' },
  ],
  data: JSON.parse(localStorage.getItem('lifeOS')) || {
    dashboard: { northStar: 'I build reliable, human‑centered AI systems that reach millions.', values: 'Craft • Curiosity • Integrity • Health • Relationships', anti: 'Burnout • Busywork • Vague plans • Debt spirals' },
    daily: { date: new Date().toISOString().slice(0,10), top3: ['', '', ''], blocks: { a:'', b:'', admin:'', partner:'', train:'' }, wins: ['', '', ''] },
    weekly: { focus:0, health:0, relation:0, progress:0, notes:'', blocked:'', change:'', nextTop3:['','',''] },
    goals: { career:{o:'',kr1:'',kr2:'',kr3:''}, skills:{o:'',kr1:'',kr2:'',kr3:''}, health:{o:'',kr1:'',kr2:''}, money:{o:'',kr1:'',kr2:''}, life:{o:'',kr1:'',kr2:''} },
    job: { roles:[], stars:[] },
    health: { strengthDays:['Mon','Wed','Fri'], cardioDays:['Tue','Thu'], protein:'', sleep:'', steps:'', mobility:'' }
  }
};

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const view = $('#view');
const tabsEl = $('#tabs');
const statusEl = $('#status');
const themeToggle = $('#themeToggle');

function setTheme(t){
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  state.theme = t;
}
setTheme(state.theme);

themeToggle.addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));

function save(){
  localStorage.setItem('lifeOS', JSON.stringify(state.data));
  state.lastSaved = new Date();
  status(`Saved ${state.lastSaved.toLocaleTimeString()}`);
}

function status(msg){ statusEl.textContent = msg; }

// Tabs
function renderTabs(active='dashboard'){
  tabsEl.innerHTML = '';
  state.tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.textContent = t.label;
    btn.className = t.id === active ? 'active' : '';
    btn.addEventListener('click', () => { render(t.id); });
    tabsEl.appendChild(btn);
  });
}

// Components
const chunk = (html) => { const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

function inputField(label, value, oninput, type='text', attrs={}){
  const id = 'id_'+Math.random().toString(36).slice(2);
  const el = chunk(`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${escapeHtml(value)}"/></div>`);
  Object.entries(attrs).forEach(([k,v]) => el.querySelector('input').setAttribute(k,v));
  el.querySelector('input').addEventListener('input', e => oninput(e.target.value));
  return el;
}

function textArea(label, value, oninput, attrs={}){
  const id = 'id_'+Math.random().toString(36).slice(2);
  const el = chunk(`<div class="field"><label for="${id}">${label}</label><textarea id="${id}">${escapeHtml(value)}</textarea></div>`);
  Object.entries(attrs).forEach(([k,v]) => el.querySelector('textarea').setAttribute(k,v));
  el.querySelector('textarea').addEventListener('input', e => oninput(e.target.value));
  return el;
}

function kpi(label, value){
  const el = chunk(`<div class="card"><h3>${label}</h3><div class="kpi">${escapeHtml(value)}</div></div>`);
  return el;
}

function listEditor(title, items, onChange){
  const card = chunk(`<div class="card"><h3>${title}</h3><div class="grid-3"></div><div class="spacer"></div><div class="toolbar"><button class="btn" type="button">＋ Add</button></div></div>`);
  const grid = card.querySelector('.grid-3');
  function renderRows(){
    grid.innerHTML='';
    items.forEach((it, idx) => {
      const row = chunk(`<div class="card"><div class="grid-2"><input type="text" placeholder="Item" value="${escapeHtml(it.item || '')}"><input type="text" placeholder="Notes / JD keywords / link" value="${escapeHtml(it.notes || '')}"></div><div class="spacer"></div><div class="toolbar"><button class="btn" data-i="${idx}">🗑 Remove</button></div></div>`);
      const [i1,i2] = row.querySelectorAll('input');
      i1.addEventListener('input', e => { items[idx].item = e.target.value; onChange(items); save(); });
      i2.addEventListener('input', e => { items[idx].notes = e.target.value; onChange(items); save(); });
      row.querySelector('button').addEventListener('click', () => { items.splice(idx,1); onChange(items); renderRows(); save(); });
      grid.appendChild(row);
    });
  }
  card.querySelector('button').addEventListener('click', () => { items.push({item:'', notes:''}); onChange(items); renderRows(); save(); });
  renderRows();
  return card;
}

function starEditor(title, items, onChange){
  const card = chunk(`<div class="card"><h3>${title}</h3><div class="grid-3"></div><div class="spacer"></div><div class="toolbar"><button class="btn" type="button">＋ Add Story</button></div></div>`);
  const grid = card.querySelector('.grid-3');
  function renderRows(){
    grid.innerHTML='';
    items.forEach((it, idx) => {
      const row = chunk(`<div class="card"><input type="text" placeholder="Title (e.g., Kafka latency cut 80%)" value="${escapeHtml(it.title || '')}"><div class="spacer"></div><textarea placeholder="STAR: Situation, Task, Actions, Results">${escapeHtml(it.body || '')}</textarea><div class="spacer"></div><div class="toolbar"><button class="btn" data-i="${idx}">🗑 Remove</button></div></div>`);
      const [titleEl, bodyEl] = [row.querySelector('input'), row.querySelector('textarea')];
      titleEl.addEventListener('input', e => { items[idx].title=e.target.value; onChange(items); save(); });
      bodyEl.addEventListener('input', e => { items[idx].body=e.target.value; onChange(items); save(); });
      row.querySelector('button').addEventListener('click', () => { items.splice(idx,1); onChange(items); renderRows(); save(); });
      grid.appendChild(row);
    });
  }
  card.querySelector('button').addEventListener('click', () => { items.push({title:'', body:''}); onChange(items); renderRows(); save(); });
  renderRows();
  return card;
}

function escapeHtml(s){ return (s??'').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[m])); }

// Views
function dashboardView(){
  const root = document.createElement('div');
  root.className = 'row';
  const left = document.createElement('div');
  left.className = 'card';
  left.appendChild(textArea('North Star', state.data.dashboard.northStar, v => { state.data.dashboard.northStar = v; save(); }));
  left.appendChild(textArea('Core values', state.data.dashboard.values, v => { state.data.dashboard.values = v; save(); }));
  left.appendChild(textArea('Anti-goals', state.data.dashboard.anti, v => { state.data.dashboard.anti = v; save(); }));

  const right = document.createElement('div');
  right.className = 'row';
  right.appendChild(kpi('Today', new Date().toLocaleDateString()));
  const top3 = state.data.daily.top3.map((t,i)=> `${i+1}) ${t||'—'}`).join('\\n');
  right.appendChild(kpi('Today — Top‑3', top3));
  const stars = (state.data.job.stars||[]).length;
  right.appendChild(kpi('Stories in Bank', String(stars)));
  root.appendChild(left);
  root.appendChild(right);
  return root;
}

function dailyView(){
  const root = document.createElement('div');
  root.className = 'row';

  const left = document.createElement('div'); left.className = 'card';
  left.appendChild(inputField('Date', state.data.daily.date, v => { state.data.daily.date=v; save(); }, 'date'));
  const tgrid = chunk('<div class="grid-3"></div>');
  ['1','2','3'].forEach((n,i)=>{
    const ta = textArea(`Top‑${n}`, state.data.daily.top3[i]||'', v => { state.data.daily.top3[i]=v; save(); }, {placeholder:`Priority ${n}`});
    tgrid.appendChild(ta);
  });
  left.appendChild(tgrid);
  left.appendChild(textArea('Deep Work A (08:30–11:30):', state.data.daily.blocks.a, v => { state.data.daily.blocks.a=v; save(); }));
  left.appendChild(textArea('Deep Work B / Classes (12:30–15:00):', state.data.daily.blocks.b, v => { state.data.daily.blocks.b=v; save(); }));
  left.appendChild(textArea('Admin (15:00–15:30):', state.data.daily.blocks.admin, v => { state.data.daily.blocks.admin=v; save(); }));
  left.appendChild(textArea('Partner Power (16:00–17:00):', state.data.daily.blocks.partner, v => { state.data.daily.blocks.partner=v; save(); }));
  left.appendChild(textArea('Training (18:00–19:00):', state.data.daily.blocks.train, v => { state.data.daily.blocks.train=v; save(); }));

  const right = document.createElement('div'); right.className = 'card';
  right.appendChild(textArea('Three small wins I will create today', (state.data.daily.wins||['','','']).join('\\n'), v => {
    state.data.daily.wins = v.split('\\n').slice(0,3);
    save(); }));
  const tools = chunk('<div class="toolbar"></div>');
  const newDay = document.createElement('button'); newDay.className='btn'; newDay.textContent='⧉ New Day (copy Top‑3)';
  newDay.addEventListener('click', () => {
    const lastTop = (state.data.daily.top3||[]).slice();
    state.data.daily = { date: new Date().toISOString().slice(0,10), top3: lastTop, blocks:{a:'',b:'',admin:'',partner:'',train:''}, wins:['','',''] };
    save(); render('daily');
  });
  const clearBtn = document.createElement('button'); clearBtn.className='btn'; clearBtn.textContent='🧹 Clear today';
  clearBtn.addEventListener('click', () => {
    if(confirm('Clear today’s fields?')){
      state.data.daily.blocks = {a:'',b:'',admin:'',partner:'',train:''};
      state.data.daily.wins=['','',''];
      state.data.daily.top3=['','',''];
      save(); render('daily');
    }
  });
  tools.appendChild(newDay); tools.appendChild(clearBtn);
  right.appendChild(tools);

  root.appendChild(left); root.appendChild(right);
  return root;
}

function weeklyView(){
  const root = document.createElement('div');
  root.className = 'row';

  const left = document.createElement('div'); left.className='card';
  left.appendChild(inputField('Focus (0–10)', state.data.weekly.focus, v=>{ state.data.weekly.focus=Number(v)||0; save(); }, 'number', {min:0,max:10}));
  left.appendChild(inputField('Health (0–10)', state.data.weekly.health, v=>{ state.data.weekly.health=Number(v)||0; save(); }, 'number', {min:0,max:10}));
  left.appendChild(inputField('Relationships (0–10)', state.data.weekly.relation, v=>{ state.data.weekly.relation=Number(v)||0; save(); }, 'number', {min:0,max:10}));
  left.appendChild(inputField('Progress (0–10)', state.data.weekly.progress, v=>{ state.data.weekly.progress=Number(v)||0; save(); }, 'number', {min:0,max:10}));
  left.appendChild(textArea('What moved the needle?', state.data.weekly.notes, v=>{ state.data.weekly.notes=v; save(); }));
  left.appendChild(textArea('What blocked me?', state.data.weekly.blocked, v=>{ state.data.weekly.blocked=v; save(); }));
  left.appendChild(textArea('What will I change next week?', state.data.weekly.change, v=>{ state.data.weekly.change=v; save(); }));

  const right = document.createElement('div'); right.className='card';
  const tgrid = chunk('<div class="grid-3"></div>');
  (state.data.weekly.nextTop3||['','','']).forEach((v,i)=>{
    tgrid.appendChild(textArea(`Next week — Top‑${i+1}`, v, nv => { state.data.weekly.nextTop3[i]=nv; save(); }));
  });
  right.appendChild(tgrid);
  root.appendChild(left); root.appendChild(right);
  return root;
}

function goalsView(){
  const root = document.createElement('div'); root.className='row';
  const g = state.data.goals;

  function block(title, key, krs){
    const card = document.createElement('div'); card.className='card';
    card.appendChild(textArea(`${title} — Objective`, g[key].o, v=>{ g[key].o=v; save(); }));
    krs.forEach((k,i)=>{
      card.appendChild(textArea(`KR${i+1}`, g[key][k], v=>{ g[key][k]=v; save(); }));
    });
    return card;
  }
  root.appendChild(block('Career','career',['kr1','kr2','kr3']));
  root.appendChild(block('Skills (ML/DL/Systems)','skills',['kr1','kr2','kr3']));
  root.appendChild(block('Health','health',['kr1','kr2']));
  root.appendChild(block('Money','money',['kr1','kr2']));
  root.appendChild(block('Relationships & Life','life',['kr1','kr2']));
  return root;
}

function jobView(){
  const root = document.createElement('div'); root.className='row';
  const left = listEditor('Role Shortlist (weekly 10)', state.data.job.roles, v => { state.data.job.roles = v; });
  const right = starEditor('STAR Stories Bank (8–10)', state.data.job.stars, v => { state.data.job.stars = v; });
  root.appendChild(left); root.appendChild(right);
  return root;
}

function healthView(){
  const root = document.createElement('div'); root.className='row';
  const left = document.createElement('div'); left.className='card';
  left.appendChild(textArea('Strength days', state.data.health.strengthDays.join(', '), v=>{ state.data.health.strengthDays=v.split(',').map(s=>s.trim()); save(); }));
  left.appendChild(textArea('Cardio days', state.data.health.cardioDays.join(', '), v=>{ state.data.health.cardioDays=v.split(',').map(s=>s.trim()); save(); }));
  left.appendChild(inputField('Protein target (g/day)', state.data.health.protein, v=>{ state.data.health.protein=v; save(); }));
  left.appendChild(inputField('Sleep (h)', state.data.health.sleep, v=>{ state.data.health.sleep=v; save(); }));
  left.appendChild(inputField('Steps (per day target)', state.data.health.steps, v=>{ state.data.health.steps=v; save(); }));
  left.appendChild(inputField('Mobility (min/day)', state.data.health.mobility, v=>{ state.data.health.mobility=v; save(); }));

  const right = document.createElement('div'); right.className='card';
  right.appendChild(chunk(`<h3>Training Template</h3>
  <div class="muted">Strength 3×/wk: hinge • squat • push • pull • carry (3×5–8). Cardio 2×/wk: 1 interval, 1 steady 30–45 min.</div>
  <div class="spacer"></div>
  <div class="grid-3">
    <div>
      <label>Mon</label><textarea placeholder="Strength A (hinge/push)"></textarea>
    </div>
    <div>
      <label>Wed</label><textarea placeholder="Strength B (squat/pull)"></textarea>
    </div>
    <div>
      <label>Fri</label><textarea placeholder="Strength C (full‑body)"></textarea>
    </div>
  </div>`));
  root.appendChild(left); root.appendChild(right);
  return root;
}

function settingsView(){
  const root = document.createElement('div'); root.className='row';
  const left = document.createElement('div'); left.className='card';
  left.appendChild(textArea('Backup notes (optional)', '', v=>{}));
  const buttons = chunk(`<div class="toolbar">
    <button class="btn" id="exportBtn2">⤓ Export JSON</button>
    <label class="btn">⤒ Import JSON<input type="file" id="importInput2" accept="application/json" style="display:none" /></label>
  </div>`);
  left.appendChild(buttons);
  root.appendChild(left);
  return root;
}

function render(which='dashboard'){
  renderTabs(which);
  view.innerHTML = '';
  let v;
  switch(which){
    case 'dashboard': v = dashboardView(); break;
    case 'daily': v = dailyView(); break;
    case 'weekly': v = weeklyView(); break;
    case 'goals': v = goalsView(); break;
    case 'job': v = jobView(); break;
    case 'health': v = healthView(); break;
    case 'settings': v = settingsView(); break;
    default: v = dashboardView();
  }
  view.appendChild(v);
  // Mark active tab
  $$('.tabs button').forEach(btn => btn.classList.remove('active'));
  $$('.tabs button').find(b => b.textContent === state.tabs.find(t=>t.id===which).label)?.classList.add('active');
}

// Export/Import
function exportData(){
  const data = { theme: state.theme, data: state.data, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `life-os-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function importData(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if(imported.data){
        state.data = imported.data;
        if(imported.theme) setTheme(imported.theme);
        save(); render('dashboard');
        alert('Import successful.');
      } else {
        alert('Invalid file format.');
      }
    } catch(e){
      alert('Could not parse JSON: '+e.message);
    }
  };
  reader.readAsText(file);
}

// Global buttons
$('#exportBtn').addEventListener('click', exportData);
$('#printBtn').addEventListener('click', () => window.print());
$('#resetBtn').addEventListener('click', () => {
  if(confirm('This will clear all local data. Continue?')){
    localStorage.removeItem('lifeOS');
    location.reload();
  }
});
$('#importInput').addEventListener('change', e => { if(e.target.files[0]) importData(e.target.files[0]); });

// Settings duplicates
document.addEventListener('change', e => {
  if(e.target && e.target.id === 'importInput2' && e.target.files[0]) importData(e.target.files[0]);
});
document.addEventListener('click', e => {
  if(e.target && e.target.id === 'exportBtn2') exportData();
});

// Init
render('dashboard');
status('Ready.');
