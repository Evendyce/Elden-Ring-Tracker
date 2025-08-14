// app.v5.js
const MANIFEST_URL = "data/manifest.json";
const ROUTE_PARAM = new URLSearchParams(location.search).get("route");

let ROUTE_ID = null;
let PHASES = [];
let STATE = {};
const TYPES = ['boss','dungeon','npc','gear','talisman','ash','map','quest','warning'];
const activeTypes = new Set(TYPES);

const el = (t,a={},...c)=>{ const e=document.createElement(t);
  for(const[k,v] of Object.entries(a||{})){
    if(k==='dataset') Object.entries(v).forEach(([dk,dv])=>e.dataset[dk]=dv);
    else if(k.startsWith('on')&&typeof v==='function') e.addEventListener(k.slice(2),v);
    else if(k==='html') e.innerHTML=v; else if(v!==null&&v!==undefined) e.setAttribute(k,v);
  }
  c.forEach(x=> e.appendChild(typeof x==='string'?document.createTextNode(x):x));
  return e;
};

const $ = (id)=>document.getElementById(id);
const board = $('board'); const routeSelect = $('routeSelect');
const searchInput = $('search'); const incompleteOnly = $('incompleteOnly');
const expandAll = $('expandAll'); const collapseAll = $('collapseAll');
const exportBtn = $('exportBtn'); const importBtn = $('importBtn');
const customLabel = $('customLabel'); const customType = $('customType'); const addCustom = $('addCustom');
const filtersBar = $('filters');

function keyFor(route){ return `er-ranni-checklist-v1::${route}`; }
function save(){ localStorage.setItem(keyFor(ROUTE_ID), JSON.stringify(STATE)); }
function isChecked(id){ return !!STATE[id]; }
function setChecked(id,val){ STATE[id] = !!val; save(); }

function renderFilters(){
  filtersBar.innerHTML = '';
  TYPES.forEach(t=>{
    const tag=el('div',{class:'tag'+(activeTypes.has(t)?' active':''), role:'button', tabindex:'0'}, t);
    const toggle=()=>{ activeTypes.has(t)?activeTypes.delete(t):activeTypes.add(t); render(); renderFilters(); };
    tag.addEventListener('click', toggle);
    tag.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }});
    filtersBar.append(tag);
  });
}

function render(){
  if(!PHASES.length){ $('globalProgress').innerHTML = 'No phases for this route.'; return; }
  board.innerHTML = '';
  let total=0, done=0;

  PHASES.forEach(phase=>{
    const card = el('details',{class:'card', open:true});
    const head = el('summary', {});
    const title = el('div',{class:'title'},
      el('span',{class:'phase-tag'}, phase.tag||'Phase'),
      el('span',{}, phase.title)
    );
    let pT=0, pD=0; phase.sections.forEach(s=>s.items.forEach(it=>{ pT++; if(isChecked(it.id)) pD++; }));
    total+=pT; done+=pD; const pct=pT?Math.round((pD/pT)*100):0;
    const prog = el('div',{style:'min-width:220px;text-align:right'},
      el('div',{class:'progress'}, `${pD}/${pT} completed`),
      (()=>{const b=el('div',{class:'bar'}); b.append(el('span',{style:`width:${pct}%`})); return b;})()
    );
    head.append(title, prog); card.append(head);

    phase.sections.forEach(sec=>{
      const det=el('details',{open:true});
      const sum=el('summary',{}, el('span',{}, sec.name, ' ', el('span',{class:'sublabel'}, `(${sec.items.length})`)), el('span',{class:'small muted'},'Toggle'));
      const cont=el('div',{class:'section'});
      sec.items.forEach(item=>{
        if(!activeTypes.has(item.type)) return;
        if(incompleteOnly?.checked && isChecked(item.id)) return;
        const q=(searchInput?.value||'').trim().toLowerCase(); if(q && !item.label.toLowerCase().includes(q)) return;
        const row=el('div',{class:'item', dataset:{id:item.id, phase:phase.id}});
        const box=el('input',{type:'checkbox', checked: isChecked(item.id)?'checked':null, onchange:(e)=>{ setChecked(item.id, e.target.checked); render(); }});
        const label=el('div',{class:'label'}, item.label);
        const tag=el('span',{class:'type', dataset:{type:item.type}}, item.type);
        row.append(box,label,tag); cont.append(row);
      });
      det.append(sum,cont); card.append(det);
    });

    const foot=el('div',{class:'footer'},
      el('div',{class:'small muted'}, 'Tip: Shift-click a checkbox to toggle all items in this section.'),
      (()=>{ const r=el('div',{}); const b=el('button',{class:'btn'},'Mark Phase Incomplete');
        b.addEventListener('click',()=>{ phase.sections.forEach(s=>s.items.forEach(it=>setChecked(it.id,false))); render(); });
        r.append(b); return r;})()
    );
    card.append(foot); board.append(card);
  });

  $('globalProgress').innerHTML = `<strong>Global Progress:</strong> ${done}/${total} (${total?Math.round(done/total*100):0}%)`;
}

document.addEventListener('click', (e)=>{
  if(e.target.matches('input[type="checkbox"]') && e.shiftKey){
    const item=e.target.closest('.item'); const section=item?.parentElement; if(!section) return;
    const to=e.target.checked; section.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      cb.checked=to; const id=cb.closest('.item').dataset.id; setChecked(id,to);
    });
    render();
  }
}, true);

expandAll?.addEventListener('click', ()=>document.querySelectorAll('details').forEach(d=>d.open=true));
collapseAll?.addEventListener('click', ()=>document.querySelectorAll('details').forEach(d=>d.open=false));
searchInput?.addEventListener('input', render);
incompleteOnly?.addEventListener('change', render);

exportBtn?.addEventListener('click', ()=>{
  const blob=new Blob([JSON.stringify(STATE,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`elden-ring-progress-${ROUTE_ID}.json`; a.click(); URL.revokeObjectURL(url);
});
importBtn?.addEventListener('click', ()=>{
  const inp=document.createElement('input'); inp.type='file'; inp.accept='application/json';
  inp.addEventListener('change', ()=>{
    const f=inp.files?.[0]; if(!f) return; const r=new FileReader();
    r.onload=()=>{ try{ const obj=JSON.parse(r.result); STATE=obj; save(); render(); } catch{ alert('Invalid JSON'); } };
    r.readAsText(f);
  });
  inp.click();
});

addCustom?.addEventListener('click', ()=>{
  const label=(customLabel.value||'').trim(); if(!label) return alert('Enter a label.');
  const type=customType.value; const id='cust-'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Math.random().toString(36).slice(2,6);
  const item={id,type,label};
  const p1=PHASES.find(p=>p.id==='p1'); let customSec=p1.sections.find(s=>s.name==='Custom');
  if(!customSec){ customSec={name:'Custom', items:[]}; p1.sections.push(customSec); }
  customSec.items.push(item); customLabel.value=''; render();
});

async function loadRoute(routeId, manifest){
  const route = manifest.routes.find(r=>r.id===routeId) || manifest.routes.find(r=>r.id===manifest.default);
  ROUTE_ID = route.id;
  // Load data file
  const res = await fetch(`data/${route.file}`, { cache: 'no-store' });
  const data = await res.json();
  PHASES = data.phases || [];
  // restore per-route state
  STATE = JSON.parse(localStorage.getItem(keyFor(ROUTE_ID)) || '{}');
  // set selector
  routeSelect.value = ROUTE_ID;
  // update URL for shareability
  const u = new URL(location.href); u.searchParams.set('route', ROUTE_ID); history.replaceState(null, '', u);
  render();
}

async function boot(){
  renderFilters();
  const res = await fetch(MANIFEST_URL, { cache: 'no-store' });
  const manifest = await res.json();

  // populate dropdown
  routeSelect.innerHTML = '';
  manifest.routes.forEach(r=>{
    routeSelect.append( el('option', { value: r.id }, r.name ) );
  });

  routeSelect.addEventListener('change', ()=> loadRoute(routeSelect.value, manifest));
  const startId = ROUTE_PARAM || localStorage.getItem('er-route-last') || manifest.default;
  await loadRoute(startId, manifest);
  localStorage.setItem('er-route-last', ROUTE_ID);
}

boot().catch(err=>{
  $('globalProgress').innerHTML = `⚠️ Failed to load routes. ${String(err).replace(/</g,'&lt;')}`;
});