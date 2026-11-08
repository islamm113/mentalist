(function(){
'use strict';
/* ================= constants & utils ================= */
const COLORS=['#ff3b30','#ff9500','#ffcc00','#34c759','#00c7be','#32ade6','#007aff','#5856d6','#af52de','#ff2d55'];
const EMOJI=['💧','🏃','📖','🧘','🌙','🥗','💪','🚭','🍎','✍️','🎯','🧠','🚶','🦷','☀️','🎧','💊','🧹','📵','🙏','💰','🇹🇷','🎨','❤️'];
const CLAN_EMBLEMS=['🛡️','⚔️','🐺','🦅','🔥','⚡','🌙','🏔️','🧠','👑','🐉','💎'];
const STARTERS=[['Пить 2 л воды','💧','#32ade6'],['Зарядка','🏃','#ff9500'],['Чтение 20 минут','📖','#5856d6'],['Медитация','🧘','#00c7be'],['Сон до 23:00','🌙','#af52de'],['Без сладкого','🍎','#ff3b30']];
const PRESETS=[
  {id:'graphite',name:'Графит',c:['#8b93a7','#c3c8d4','#5d6475','#a7adbb']},
  {id:'night',name:'Ночь',c:['#2b3a67','#4a3b7a','#1d5560','#3b3f4d']},
  {id:'ocean',name:'Океан',c:['#3aa0ff','#2ad1c9','#5b6cff','#a6e6ff']},
  {id:'forest',name:'Лес',c:['#2fbf71','#9ad36a','#1f8a70','#e0d26a']},
  {id:'sunset',name:'Закат',c:['#ff7a59','#ff3d7f','#ffb347','#c86bff']},
  {id:'lavender',name:'Лаванда',c:['#b69cff','#ff9ed8','#8fb2ff','#e6c2ff']},
  {id:'sand',name:'Песок',c:['#e8c39e','#f2a679','#d9b38c','#f6dcb5']},
  {id:'rainbow',name:'Радуга',c:null},
  {id:'plain',name:'Чистый',c:[]}
];
const RINGS=[{id:'chime',name:'Колокольчики'},{id:'bell',name:'Гонг'},{id:'marimba',name:'Маримба'},{id:'digital',name:'Будильник'},{id:'soft',name:'Мягкий'},{id:'birds',name:'Птицы'}];
const RANKS=[[0,'Новичок'],[500,'Ученик'],[2000,'Практик'],[6000,'Мастер'],[15000,'Ментор'],[40000,'Менталист']];
const LEAGUES=[[0,'Бронза','🥉'],[700,'Серебро','🥈'],[1800,'Золото','🥇'],[3200,'Алмаз','💎']];
const FOCUS_CHIPS=[15,25,30,45,60,90,120], BREAK_CHIPS=[5,10,15,20];
const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const WDF=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const MG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const NICK_RE=/^[A-Za-z0-9_.А-Яа-яЁё]{3,20}$/;

const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const TK=()=>key(today());
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural=(n,f)=>{n=Math.abs(n);const a=n%10,b=n%100;return f[(a===1&&b!==11)?0:(a>=2&&a<=4&&(b<10||b>=20))?1:2]};
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const rand=n=>{const a='abcdefghijklmnopqrstuvwxyz0123456789';let s='';const u=crypto.getRandomValues(new Uint8Array(n));for(const x of u)s+=a[x%a.length];return s};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const fmtN=n=>Number(n||0).toLocaleString('ru-RU');
const durLabel=m=>m<60?m+' мин':Math.floor(m/60)+' ч'+(m%60?' '+(m%60)+' мин':'');
const hm=m=>m<60?m+' мин':(Math.round(m/6)/10).toString().replace('.',',')+' ч';
function lsGet(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function lsPut(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function colorFor(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return COLORS[h%COLORS.length]}
const avHtml=(p,cls)=>p&&p.avatar?`<span class="av ${cls||''}"><img src="${esc(p.avatar)}" alt=""></span>`:`<span class="av ${cls||''}" style="background:${colorFor(p&&p.id||'x')}">${esc(((p&&p.nick)||'?').slice(0,1).toUpperCase())}</span>`;
function rankOf(a){let i=0;for(let j=0;j<RANKS.length;j++)if(a>=RANKS[j][0])i=j;const next=RANKS[i+1];return{name:RANKS[i][1],min:RANKS[i][0],next:next?next[0]:null,nextName:next?next[1]:null}}
function leagueOf(w){let i=0;for(let j=0;j<LEAGUES.length;j++)if(w>=LEAGUES[j][0])i=j;return{name:LEAGUES[i][1],icon:LEAGUES[i][2]}}

/* ================= server ================= */
const CFG=window.MENTALIST_CONFIG||{};
const sb=(CFG.url&&CFG.key&&window.supabase)?window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'mt.auth'}}):null;
const pinPass=pin=>'mentalist-pin-'+pin;
function netMsg(e){const m=(e&&(e.message||e.error_description))||'';if(/fetch|network|Failed/i.test(m))return'Нет связи с сервером. Проверьте интернет.';if(/rate|too many/i.test(m))return'Слишком много попыток. Подождите минуту.';return m||'Что-то пошло не так. Попробуйте ещё раз.'}

/* ================= state ================= */
const DEF_SET=()=>({bg:{type:'preset',preset:'graphite',colors:['#5b6cff','#2ad1c9','#8b93a7'],dim:25,blur:0},focusMin:30,breakMin:5,focus:{},
  autoBreak:true,autoFocus:false,island:true,ring:'chime',vol:80,eco:null});
function normSet(s){const d=DEF_SET();s=s||{};const b=v=>typeof v==='boolean';
  return{bg:Object.assign(d.bg,s.bg||{}),focusMin:clamp(+s.focusMin||30,1,240),breakMin:clamp(+s.breakMin||5,1,60),focus:Object.assign({},s.focus||{}),
    autoBreak:b(s.autoBreak)?s.autoBreak:d.autoBreak,autoFocus:b(s.autoFocus)?s.autoFocus:d.autoFocus,island:b(s.island)?s.island:d.island,
    ring:typeof s.ring==='string'?s.ring:d.ring,vol:s.vol==null?d.vol:clamp(+s.vol,0,100),eco:b(s.eco)?s.eco:null}}
const S={screen:'boot',uid:null,prof:null,habits:[],set:DEF_SET(),wall:'',ring:null,remoteTs:null,
  view:'today',sel:TK(),month:(()=>{const d=today();d.setDate(1);return d})(),filter:'all',open:{},
  top:{tab:'friends',period:'week',data:null,busy:false,t:0,find:''}};
const A={mode:'reg',nick:'',pin:'',pin2:'',avatar:'',err:'',busy:false};

/* ---------- local cache (per account) ---------- */
const scope=()=>S.uid||'guest';
function cacheLocal(){lsPut('mt.c.'+scope(),{habits:S.habits,set:S.set})}
function cacheBlob(){lsPut('mt.w.'+scope(),S.wall||'');lsPut('mt.r.'+scope(),S.ring||null)}
function loadCache(){const c=lsGet('mt.c.'+scope(),null);S.habits=(c&&Array.isArray(c.habits)?c.habits:[]).filter(h=>h&&h.id&&h.name);S.set=normSet(c&&c.set);
  S.wall=lsGet('mt.w.'+scope(),'')||'';S.ring=lsGet('mt.r.'+scope(),null);sortH();applyBg();applyEco();decodeRing()}
function sortH(){S.habits.sort((a,b)=>(a.order||0)-(b.order||0)||String(a.created).localeCompare(String(b.created)))}

/* ---------- sync ---------- */
let saveTm=null,saving=false,dirty=false,netWarned=false;
function markDirty(delay){dirty=true;cacheLocal();if(!S.uid||!sb)return;clearTimeout(saveTm);saveTm=setTimeout(pushData,delay==null?1200:delay)}
async function pushData(){
  if(!S.uid||!sb)return;
  if(saving){clearTimeout(saveTm);saveTm=setTimeout(pushData,800);return}
  saving=true;dirty=false;const ts=new Date().toISOString();
  const {error}=await sb.from('user_data').upsert({id:S.uid,habits:S.habits,settings:S.set,updated_at:ts});
  saving=false;
  if(error){dirty=true;netFail();return}
  S.remoteTs=ts;netWarned=false;syncAura();
}
async function pushBlob(col){
  cacheBlob();if(!S.uid||!sb)return;
  const row={id:S.uid};row[col]=col==='wall'?(S.wall||null):(S.ring||null);
  const {error}=await sb.from('user_data').upsert(row);
  if(error)toast(col==='ring'?'Мелодия не сохранилась на сервере: '+netMsg(error):'Обои не сохранились на сервере: '+netMsg(error));
}
function netFail(){if(!netWarned){netWarned=true;toast('Нет связи. Сохраню, когда появится интернет.')}}
window.addEventListener('online',()=>{if(dirty)pushData()});
async function loadData(){
  const {data,error}=await sb.from('user_data').select('habits,settings,wall,ring,updated_at').eq('id',S.uid).maybeSingle();
  if(error)throw error;
  if(!data){const ts=new Date().toISOString();const r=await sb.from('user_data').insert({id:S.uid,habits:S.habits,settings:S.set,updated_at:ts});if(r.error)throw r.error;S.remoteTs=ts;return}
  S.habits=(Array.isArray(data.habits)?data.habits:[]).filter(h=>h&&h.id&&h.name);S.habits.forEach(h=>{h.log=h.log||{}});sortH();
  S.set=normSet(data.settings);S.wall=data.wall||'';S.ring=data.ring||null;S.remoteTs=data.updated_at;
  cacheLocal();cacheBlob();applyBg();applyEco();decodeRing();
}
let lastCheck=0;
async function refreshIfStale(){
  if(!sb||!S.uid||S.screen!=='app'||dirty||saving||Date.now()-lastCheck<30000)return;lastCheck=Date.now();
  const {data}=await sb.from('user_data').select('updated_at').eq('id',S.uid).maybeSingle();
  if(data&&S.remoteTs&&new Date(data.updated_at)>new Date(S.remoteTs)){try{await loadData();render()}catch(e){}}
  if(S.view==='top')loadTop(true);
}

/* ---------- aura ---------- */
const sent={};
function streakAt(h,k){let d=parse(k),n=0;while(h.log[key(d)]){n++;d=add(d,-1)}return n}
function dayPoints(k){
  const act=activeOn(k),done=act.filter(h=>h.log[k]).length;
  const base=Math.min(done,10)*10+Math.min(240,(S.set.focus[k]||{}).m||0)+(act.length&&done===act.length?25:0);
  const st=Math.max(0,...act.map(h=>streakAt(h,k)));
  return Math.min(600,Math.round(base*(st>=30?1.5:st>=7?1.2:1)));
}
async function syncAura(){
  if(!sb||!S.uid||!S.prof)return;
  const rows=[TK(),key(add(today(),-1))].map(k=>({user_id:S.uid,day:k,points:dayPoints(k)})).filter(r=>sent[r.day]!==r.points);
  if(rows.length){const {error}=await sb.from('aura_days').upsert(rows);if(!error)rows.forEach(r=>sent[r.day]=r.points)}
  const st=Math.max(0,...S.habits.map(streak));
  if(st!==S.prof.streak){const {error}=await sb.from('profiles').update({streak:st}).eq('id',S.uid);if(!error)S.prof.streak=st}
  if(S.top.data)S.top.t=0;
}

/* ================= backdrop & performance ================= */
const field=$('field'),wallEl=$('wall'),dimEl=$('dim'),root=document.documentElement;
function applyBg(){
  const b=S.set.bg;['--blob1','--blob2','--blob3','--blob4'].forEach(v=>field.style.removeProperty(v));
  field.classList.remove('noblobs','img');wallEl.style.backgroundImage='';wallEl.style.filter='';wallEl.style.inset='';dimEl.style.opacity=0;
  if(b.type==='image'&&S.wall){field.classList.add('noblobs','img');wallEl.style.backgroundImage='url("'+S.wall+'")';
    const bl=clamp(+b.blur||0,0,30);if(bl){wallEl.style.filter='blur('+bl+'px)';wallEl.style.inset=(-bl*2)+'px'}
    dimEl.style.opacity=clamp(+b.dim||0,0,85)/100;return}
  let c;if(b.type==='custom')c=[b.colors[0],b.colors[1],b.colors[2],b.colors[0]];else c=(PRESETS.find(x=>x.id===b.preset)||PRESETS[0]).c;
  if(c&&!c.length){field.classList.add('noblobs');return}
  if(c)c.forEach((v,i)=>field.style.setProperty('--blob'+(i+1),v));
}
const pvOf=c=>c?(c.length?`radial-gradient(circle at 20% 15%,${c[0]},transparent 60%),radial-gradient(circle at 85% 40%,${c[1]},transparent 60%),radial-gradient(circle at 30% 90%,${c[2]},transparent 60%),var(--bg)`:'var(--bg)'):'radial-gradient(circle at 20% 15%,#7aa6ff,transparent 60%),radial-gradient(circle at 85% 40%,#ff92bd,transparent 60%),radial-gradient(circle at 30% 90%,#79e2c4,transparent 60%),var(--bg)';
const mqLite=matchMedia('(prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)');
const ecoOn=()=>S.set.eco===true||(S.set.eco==null&&mqLite.matches);
function applyEco(){root.classList.toggle('eco',ecoOn())}
document.addEventListener('visibilitychange',()=>{root.classList.toggle('paused',document.hidden);if(!document.hidden){refreshIfStale();tickDom()}});
let pmRaf=0;
if(matchMedia('(hover:hover)').matches)document.addEventListener('pointermove',e=>{
  if(pmRaf||root.classList.contains('eco'))return;
  pmRaf=requestAnimationFrame(()=>{pmRaf=0;const g=e.target.closest&&e.target.closest('.lit');if(!g)return;const r=g.getBoundingClientRect();
    g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')})},{passive:true});

/* ================= metrics ================= */
const activeOn=k=>S.habits.filter(h=>h.created<=k);
function dayFrac(k){const a=activeOn(k);if(!a.length)return null;return a.filter(h=>h.log[k]).length/a.length}
function streak(h){let d=today();if(!h.log[key(d)])d=add(d,-1);let n=0;while(h.log[key(d)]){n++;d=add(d,-1)}return n}
function best(h){const ks=Object.keys(h.log).filter(k=>h.log[k]).sort();let b=0,c=0,prev=null;for(const k of ks){c=(prev&&key(add(parse(prev),1))===k)?c+1:1;b=Math.max(b,c);prev=k}return b}
function rate(h,days){let d=today(),n=0,ok=0;for(let i=0;i<days;i++){const k=key(d);if(k<h.created)break;n++;if(h.log[k])ok++;d=add(d,-1)}return n?ok/n:0}
function perfect(days){let d=today(),p=0;for(let i=0;i<days;i++){if(dayFrac(key(d))===1)p++;d=add(d,-1)}return p}
function focusSum(days){let d=today(),m=0;for(let i=0;i<days;i++){const f=S.set.focus[key(d)];if(f)m+=f.m||0;d=add(d,-1)}return m}

/* ================= icons ================= */
const I={
  l:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  r:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5 5 6 5 11a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.8.2 1.6.9 2.6 1.9 3C10.6 8.6 11.2 5 12 2z"/></svg>',
  tick:'<svg viewBox="0 0 24 24"><path d="M5.5 12.5l4.2 4.2L18.5 8"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/></svg>',
  person:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.3"/><rect x="13.5" y="5" width="4" height="14" rx="1.3"/></svg>',
  reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4.5h4.5"/></svg>',
  skip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l7 6-7 6zM17 6v12"/></svg>',
  photo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8"/></svg>',
  brush:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="1.4"/><circle cx="12.5" cy="6.8" r="1.4"/><circle cx="16.5" cy="10" r="1.4"/><path d="M12 21a9 9 0 1 1 9-9c0 2-1.6 3-3.4 3H15a2 2 0 0 0-1.4 3.4A1.6 1.6 0 0 1 12 21z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4.5h-4.5"/></svg>'
};
function ring(f,r,sw,color){const c=2*Math.PI*r,o=c*(1-(f||0)),s=r*2+sw*2;
  return `<svg viewBox="0 0 ${s} ${s}" aria-hidden="true"><circle class="ring-track" cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke-width="${sw}"/>${f?`<circle class="ring-val" cx="${s/2}" cy="${s/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${o}"/>`:''}</svg>`}
const meBtn=()=>`<button class="me glass lit press" data-a="settings" aria-label="Профиль и настройки">${S.prof&&S.prof.avatar?`<img src="${esc(S.prof.avatar)}" alt="">`:S.prof?avHtml(S.prof,'').replace('class="av "','class="av" style="width:36px;height:36px;font-size:15px;'+'background:'+colorFor(S.prof.id)+'"'):`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:22px;height:22px;position:relative;color:var(--fg2)"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg>`}</button>`;

/* ================= audio ================= */
let AC=null,ringBuf=null;
function ensureAC(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)()}catch(e){}return AC}
function unlockAudio(){ensureAC();try{if(AC&&AC.state!=='running')AC.resume()}catch(e){}}
function b64ToBuf(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer}
function bufToB64(buf){const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function decodeAudio(ab){return new Promise((res,rej)=>{try{const p=AC.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)}catch(e){rej(e)}})}
async function decodeRing(){ringBuf=null;if(!S.ring||!S.ring.data||!ensureAC())return;try{ringBuf=await decodeAudio(b64ToBuf(S.ring.data))}catch(e){ringBuf=null}}
function tone(out,t,f,dur,type,vol){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.015);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05);return o}
/* plays (or schedules, delay in seconds) a ringtone on the audio clock, which keeps time even when the tab is throttled */
function playRing(id,delay){
  if(!ensureAC())return null;
  const out=AC.createGain();out.gain.value=(S.set.vol/100);out.connect(AC.destination);
  const t=AC.currentTime+Math.max(0,delay||0)+.03;
  switch(id){
    case 'bell':[0,1.3].forEach(d=>[196,392,588,1047,1568].forEach((f,i)=>tone(out,t+d,f,2.6-i*.35,'sine',.32/(i+1))));break;
    case 'marimba':[523.3,659.3,784,1046.5,784,1046.5].forEach((f,i)=>tone(out,t+i*.14,f,.45,'triangle',.45));break;
    case 'digital':for(let r=0;r<3;r++)for(let i=0;i<4;i++)tone(out,t+r*.8+i*.11,2093,.07,'square',.13);break;
    case 'soft':tone(out,t,392,1.8,'sine',.4);tone(out,t+.5,523.3,2.2,'sine',.34);tone(out,t+1,659.3,2.6,'sine',.28);break;
    case 'birds':for(let i=0;i<6;i++){const s=t+i*.22+(i%2)*.05;const o=tone(out,s,2600,.16,'sine',.28);o.frequency.exponentialRampToValueAtTime(3800+i*120,s+.12)}break;
    case 'custom':if(ringBuf){const s=AC.createBufferSource();s.buffer=ringBuf;s.connect(out);s.start(t);s.stop(t+Math.min(30,ringBuf.duration));break}
    /* falls through to the default chime when no custom tone is loaded */
    default:[880,1174.7,1568].forEach((f,i)=>tone(out,t+i*.2,f,1,'sine',.32));
  }
  return{stop(){try{out.disconnect()}catch(e){}}};
}

/* ================= focus timer ================= */
let T=Object.assign({mode:'focus',state:'idle',endAt:0,left:0,mins:30,habit:null},lsGet('mt.timer',{}));
const saveT=()=>lsPut('mt.timer',T);
const modeMin=()=>T.mode==='focus'?S.set.focusMin:S.set.breakMin;
function remaining(){if(T.state==='run')return Math.max(0,T.endAt-Date.now());if(T.state==='pause')return T.left;return modeMin()*60000}
const total=()=>(T.state==='idle'?modeMin():T.mins)*60000;
function fmt(ms){const s=Math.ceil(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?h+':'+pad(m)+':'+pad(x):pad(m)+':'+pad(x)}
let tickH=null,sched=null;
function ensureTick(){const need=T.state==='run'||!!mini;if(need&&!tickH)tickH=setInterval(tick,1000);else if(!need&&tickH){clearInterval(tickH);tickH=null}}
function tick(){if(T.state==='run'&&T.endAt<=Date.now())tDone();tickDom()}
function schedRing(){cancelRing();if(AC&&AC.state==='running')sched=playRing(S.set.ring,(T.endAt-Date.now())/1000)}
function cancelRing(){if(sched){sched.stop();sched=null}}
function tStart(){unlockAudio();if(T.state==='pause')T.endAt=Date.now()+T.left;else{T.mins=modeMin();T.endAt=Date.now()+T.mins*60000}T.state='run';saveT();
  setTimeout(schedRing,60);ensureTick();render()}
function tPause(){T.left=remaining();T.state='pause';cancelRing();saveT();ensureTick();render()}
function tReset(){T.state='idle';cancelRing();saveT();ensureTick();render()}
function tSkip(){T.mode=T.mode==='focus'?'break':'focus';T.state='idle';cancelRing();saveT();ensureTick();render()}
function tDone(){
  const wasFocus=T.mode==='focus',played=!!sched;sched=null;
  if(wasFocus){const k=TK(),f=S.set.focus[k]||{m:0,n:0};S.set.focus[k]={m:(f.m||0)+T.mins,n:(f.n||0)+1};
    let extra='';const h=T.habit&&S.habits.find(x=>x.id===T.habit);
    if(h&&!h.log[k]&&h.created<=k){h.log[k]=1;extra=' · «'+h.name+'» отмечена'}
    markDirty(200);toast('Фокус '+durLabel(T.mins)+' завершён'+extra)}
  else toast('Перерыв окончен');
  if(!played)playRing(S.set.ring,0);
  try{navigator.vibrate&&navigator.vibrate([60,80,60])}catch(e){}
  T.mode=wasFocus?'break':'focus';T.state='idle';saveT();
  if(wasFocus?S.set.autoBreak:S.set.autoFocus)tStart();else{ensureTick();render()}
}
/* top island / bottom pill / mini window */
const pill=$('tpill'),island=$('island');
function tickDom(){
  const ms=remaining(),run=T.state!=='idle',isF=T.mode==='focus';
  const tt=$('t-time');if(tt){tt.textContent=fmt(ms);const pr=$('t-prog');if(pr)pr.style.strokeDashoffset=(+pr.dataset.c)*(ms/total())}
  const away=run&&S.view!=='focus'&&S.screen==='app';
  const isl=away&&S.set.island;
  island.classList.toggle('show',isl);document.body.classList.toggle('isl',isl);
  if(isl){const c=2*Math.PI*11,col=isF?'#0a84ff':'#30d158';
    island.innerHTML=`<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="4"/><circle cx="15" cy="15" r="11" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(ms/total())}"/></svg><span class="il">${isF?'Фокус':'Перерыв'}${T.state==='pause'?' · пауза':''}</span><span class="it">${fmt(ms)}</span>`}
  pill.hidden=!(away&&!S.set.island);
  if(!pill.hidden){pill.className='tpill glass strong press'+(isF?'':' brk');pill.innerHTML=`<i></i><span class="num">${isF?'Фокус':'Перерыв'} ${fmt(ms)}${T.state==='pause'?' · пауза':''}</span>`}
  document.title=T.state==='run'?fmt(ms)+' · '+(isF?'Фокус':'Перерыв'):'Mentalist';
  updateMini(ms);
}
island.addEventListener('click',()=>{S.view='focus';render();scrollTo({top:0})});
pill.addEventListener('click',()=>{S.view='focus';render();scrollTo({top:0})});
let mini=null,pipCanvas=null;
async function openMini(){
  unlockAudio();
  if(mini){toast('Мини-окно уже открыто');return}
  if('documentPictureInPicture' in window){
    try{const w=await window.documentPictureInPicture.requestWindow({width:320,height:120});
      w.document.head.innerHTML='<meta charset="utf-8"><title>Mentalist</title><style>html,body{margin:0;height:100%;background:#0b0c10;color:#fff;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;user-select:none}body{display:flex;align-items:center;gap:14px;padding:0 18px;box-sizing:border-box}#t{font-size:44px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1}#l{font-size:12px;color:rgba(255,255,255,.6);font-weight:600;text-transform:uppercase;letter-spacing:.08em}#b{margin-left:auto;width:48px;height:48px;border-radius:50%;border:0;background:#0a84ff;color:#fff;font-size:18px;cursor:pointer}#bar{position:fixed;left:0;bottom:0;height:3px;background:#0a84ff}</style>';
      w.document.body.innerHTML='<div><div id="l"></div><div id="t"></div></div><button id="b" aria-label="Старт или пауза"></button><div id="bar"></div>';
      w.document.getElementById('b').addEventListener('click',()=>{T.state==='run'?tPause():tStart()});
      mini={type:'doc',win:w};w.addEventListener('pagehide',()=>{mini=null;ensureTick()});ensureTick();tickDom();return}catch(e){}
  }
  try{const v=$('pipv');pipCanvas=pipCanvas||document.createElement('canvas');pipCanvas.width=640;pipCanvas.height=240;drawPip(remaining());
    if(!v.srcObject){if(!pipCanvas.captureStream)throw 0;v.srcObject=pipCanvas.captureStream(1)}
    await v.play();
    if(v.requestPictureInPicture&&document.pictureInPictureEnabled!==false)await v.requestPictureInPicture();
    else if(v.webkitSetPresentationMode)v.webkitSetPresentationMode('picture-in-picture');else throw 0;
    mini={type:'video'};v.addEventListener('leavepictureinpicture',()=>{mini=null;ensureTick()},{once:true});v.addEventListener('webkitpresentationmodechanged',()=>{if(v.webkitPresentationMode!=='picture-in-picture'){mini=null;ensureTick()}});ensureTick();
  }catch(e){toast('Этот браузер не поддерживает мини-окно поверх других окон.')}
}
function drawPip(ms){if(!pipCanvas)return;const c=pipCanvas.getContext('2d'),W=640,H=240,isF=T.mode==='focus';
  c.fillStyle='#0b0c10';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.6)';c.font='600 26px -apple-system,Segoe UI,sans-serif';c.fillText((isF?'ФОКУС':'ПЕРЕРЫВ')+(T.state==='pause'?' · ПАУЗА':''),40,70);
  c.fillStyle='#fff';c.font='600 104px -apple-system,Segoe UI,sans-serif';c.fillText(fmt(ms),36,180);
  c.fillStyle=isF?'#0a84ff':'#30d158';c.fillRect(0,H-8,W*(1-ms/total()),8)}
function updateMini(ms){if(!mini)return;const isF=T.mode==='focus';
  if(mini.type==='doc'){const d=mini.win.document,t=d.getElementById('t');if(!t)return;t.textContent=fmt(ms);d.getElementById('l').textContent=(isF?'Фокус':'Перерыв')+(T.state==='pause'?' · пауза':'');
    const b=d.getElementById('b');b.textContent=T.state==='run'?'❚❚':'▶';b.style.background=isF?'#0a84ff':'#30d158';const bar=d.getElementById('bar');bar.style.width=((1-ms/total())*100)+'%';bar.style.background=isF?'#0a84ff':'#30d158'}
  else drawPip(ms)}

/* ================= views ================= */
const app=$('app');
function titleFor(k){const t=TK();if(k===t)return'Сегодня';if(k===key(add(today(),-1)))return'Вчера';const d=parse(k);return d.getDate()+' '+MG[d.getMonth()]}
function eyebrowFor(k){const d=parse(k);return WDF[d.getDay()]+', '+d.getDate()+' '+MG[d.getMonth()]+(d.getFullYear()!==today().getFullYear()?' '+d.getFullYear():'')}

function vAuth(){
  const reg=A.mode==='reg';
  return `<div class="auth"><div class="brand"><img src="icons/icon-180.png" alt="Mentalist"><div class="wm">MENTALIST</div><p>Привычки, фокус и аура. Соревнуйся с друзьями и кланами.</p></div>
  <div class="mode glass"><button class="${reg?'on':''}" data-a="amode" data-m="reg">Регистрация</button><button class="${!reg?'on':''}" data-a="amode" data-m="login">Вход</button></div>
  <form class="authcard glass" id="authform" autocomplete="on">
    ${reg?`<label class="avpick glass" aria-label="Выбрать аватарку">${A.avatar?`<img src="${esc(A.avatar)}" alt="">`:I.photo}<input type="file" id="a-av" accept="image/*"></label>`:''}
    <label class="field-in glass"><input id="a-nick" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="20" placeholder="Ник" value="${esc(A.nick)}"></label>
    <label class="field-in glass"><input id="a-pin" name="password" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="${reg?'new-password':'current-password'}" placeholder="PIN-код (4–6 цифр)" value="${esc(A.pin)}"></label>
    ${reg?`<label class="field-in glass"><input id="a-pin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password" placeholder="Повторите PIN" value="${esc(A.pin2)}"></label>`:''}
    <p class="err" id="a-err">${esc(A.err)}</p>
    <button class="go wide press" type="submit" ${A.busy?'disabled':''}>${A.busy?'Подождите…':reg?'Создать аккаунт':'Войти'}</button>
    <p class="smallprint">${reg?'Ник видят друзья и рейтинг. Его и аватарку можно сменить в профиле. PIN нужен для входа на другом устройстве, запомните его.':'Введите ник и PIN, которые указали при регистрации.'}</p>
  </form>
  ${!sb?`<p class="note">Сервер ещё не подключён: заполните config.js. Пока можно <button class="txtbtn" data-a="guest">попробовать без аккаунта</button>.</p>`:''}</div>`;
}
function vFinish(){
  return `<div class="auth"><div class="brand"><img src="icons/icon-180.png" alt="Mentalist"><div class="wm">MENTALIST</div><p>Осталось выбрать ник, и аккаунт готов.</p></div>
  <form class="authcard glass" id="finishform">
    <label class="avpick glass" aria-label="Выбрать аватарку">${A.avatar?`<img src="${esc(A.avatar)}" alt="">`:I.photo}<input type="file" id="a-av" accept="image/*"></label>
    <label class="field-in glass"><input id="a-nick" maxlength="20" autocapitalize="off" spellcheck="false" placeholder="Ник" value="${esc(A.nick)}"></label>
    <p class="err" id="a-err">${esc(A.err)}</p>
    <button class="go wide press" type="submit" ${A.busy?'disabled':''}>${A.busy?'Подождите…':'Готово'}</button>
    <button class="txtbtn" type="button" data-a="logout">Выйти</button>
  </form></div>`;
}

function habitCard(h,k,wk){
  const on=!!h.log[k],s=streak(h),open=!!S.open[h.id],n=(h.notes||'').trim();
  return `<div class="card glass lit${on?' done':''}" style="--c:${h.color}">
    <div class="row">
      <button class="ico press" data-a="edit" data-id="${h.id}" aria-label="Изменить «${esc(h.name)}»">${esc(h.emoji)}</button>
      <button class="body" data-a="edit" data-id="${h.id}"><span class="name">${esc(h.name)}</span>
        <span class="meta"><span class="streak${s?' hot':''}">${I.flame}<span class="num">${s}</span>&nbsp;${plural(s,['день','дня','дней'])}</span>
        <span class="dots">${wk.map(x=>`<i class="${h.log[x]?'on':''}${x===k?' cur':''}"></i>`).join('')}</span></span></button>
      <button class="check${on?' on':''}" data-a="toggle" data-id="${h.id}" aria-pressed="${on}" aria-label="Отметить «${esc(h.name)}»">${I.tick}</button>
    </div>
    ${open?`<div class="notebox"><textarea id="note-${h.id}" data-note="${h.id}" maxlength="4000" placeholder="Заметки к привычке: как прошло, мысли, план на завтра">${esc(h.notes||'')}</textarea>
      <div class="notefoot"><span id="ns-${h.id}">Сохраняется автоматически</span><button data-a="note" data-id="${h.id}">Свернуть</button></div></div>`
    :`<button class="notebtn${n?' has':''}" data-a="note" data-id="${h.id}">${I.note}<span>${n?esc(n.split('\n')[0]):'Добавить заметку'}</span></button>`}
  </div>`;
}
function vToday(){
  const k=S.sel,act=activeOn(k),done=act.filter(h=>h.log[k]).length,f=act.length?done/act.length:0;
  const sd=parse(k),mon=add(sd,-((sd.getDay()+6)%7)),t=TK();
  let week='';for(let i=0;i<7;i++){const d=add(mon,i),dk=key(d),fut=dk>t,fr=dayFrac(dk);
    week+=`<button class="day press${dk===k?' sel':''}${dk===t?' today':''}" data-a="pick" data-k="${dk}" ${fut?'disabled':''} aria-label="${d.getDate()} ${MG[d.getMonth()]}"><span class="wd">${WD[i]}</span><span class="dn num">${fut?'':ring(fr,15,2.6,fr===1?'var(--ok)':'var(--accent)')}<span style="position:relative">${d.getDate()}</span></span></button>`}
  let list='';
  if(!S.habits.length)list=`<div class="empty glass"><h2>Начните с одной привычки</h2><p>Отмечайте её каждый день: календарь заполнится цветом, а вы начнёте фармить ауру. Выберите готовую или нажмите «+».</p>
    <div class="chips">${STARTERS.map((s,i)=>`<button class="chip glass lit press" data-a="starter" data-i="${i}">${s[1]} ${esc(s[0])}</button>`).join('')}</div></div>`;
  else if(!act.length)list=`<div class="empty glass"><p>В этот день привычек ещё не было. Выберите день позже.</p></div>`;
  else{const wk=[];for(let i=6;i>=0;i--)wk.push(key(add(sd,-i)));
    list=act.map(h=>habitCard(h,k,wk)).join('');
    if(done===act.length)list+=`<div class="allset glass"><svg viewBox="0 0 24 24" fill="none" stroke="var(--ok)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/></svg><div>Все привычки выполнены<span>${k===t?'+25 ауры за идеальный день.':'Этот день закрыт полностью.'}</span></div></div>`}
  return `<header><div><div class="eyebrow">${eyebrowFor(k)}</div><h1>${titleFor(k)}</h1></div>
    <div class="hright">${act.length?`<div class="ring-btn glass" aria-label="Выполнено ${done} из ${act.length}">${ring(f,21,5,f===1?'var(--ok)':'var(--accent)')}<span class="rt num">${done}/${act.length}</span></div>`:''}<button class="hbtn glass lit press" data-a="new" aria-label="Добавить привычку">${I.plus}</button>${meBtn()}</div></header>
    <div class="week glass"><button class="chev" data-a="wk" data-d="-7" aria-label="Прошлая неделя">${I.l}</button>${week}<button class="chev" data-a="wk" data-d="7" ${key(add(mon,7))>t?'disabled':''} aria-label="Следующая неделя">${I.r}</button></div>
    <div class="list">${list}</div>`;
}
function vCal(){
  const m=S.month,y=m.getFullYear(),mo=m.getMonth(),t=TK(),days=new Date(y,mo+1,0).getDate(),lead=(m.getDay()+6)%7;
  const fh=S.filter==='all'?null:S.habits.find(h=>h.id===S.filter);if(S.filter!=='all'&&!fh)S.filter='all';
  const cc=fh?fh.color:'var(--accent)';
  let cells=WD.map(w=>`<div class="wdh">${w}</div>`).join('');for(let i=0;i<lead;i++)cells+='<div class="cell blank"></div>';
  let doneSum=0,slots=0,perf=0;
  for(let d=1;d<=days;d++){const k=key(new Date(y,mo,d)),fut=k>t;let o=0,full=false;
    if(!fut){if(fh){if(fh.created<=k){slots++;if(fh.log[k]){o=1;full=true;doneSum++}}}
      else{const a=activeOn(k);if(a.length){const dn=a.filter(h=>h.log[k]).length;doneSum+=dn;slots+=a.length;const fr=dn/a.length;full=fr===1;if(full)perf++;o=fr?(.22+fr*.78):0}}}
    cells+=`<button class="cell${k===t?' today':''}${k===S.sel&&k!==t?' sel':''}${fut?' future':''}${full?' full':''}" style="--cc:${cc};--o:${o}" data-a="calpick" data-k="${k}" ${fut?'disabled':''} aria-label="${d} ${MG[mo]}"><i class="f"></i><span class="num">${d}</span></button>`}
  const pct=slots?Math.round(doneSum/slots*100):0;
  const summary=slots?(fh?`${esc(fh.emoji)} ${esc(fh.name)}: <b class="num">${doneSum}</b> из ${slots}`:`Выполнено <b class="num">${pct}%</b> · идеальных дней: <b class="num">${perf}</b>`):'В этом месяце ещё нет отметок';
  return `<header><div><div class="eyebrow">Календарь</div><h1>${MN[mo]} <span style="color:var(--fg3)">${y}</span></h1></div>${meBtn()}</header>
   ${S.habits.length?`<div class="filters"><button class="chip glass press${S.filter==='all'?' on':''}" data-a="filter" data-id="all">Все</button>${S.habits.map(h=>`<button class="chip glass press${S.filter===h.id?' on':''}" data-a="filter" data-id="${h.id}">${esc(h.emoji)} ${esc(h.name)}</button>`).join('')}</div>`:''}
   <div class="cal glass"><div class="calhead"><button class="chev glass press" data-a="mo" data-d="-1" aria-label="Прошлый месяц">${I.l}</button><small style="color:var(--fg2)">${summary}</small><button class="chev glass press" data-a="mo" data-d="1" ${new Date(y,mo+1,1)>today()?'disabled':''} aria-label="Следующий месяц">${I.r}</button></div>
   <div class="grid7">${cells}</div><div class="legend" style="--cc:${cc}">Меньше <i style="opacity:.25"></i><i style="opacity:.5"></i><i style="opacity:.75"></i><i></i> Больше</div></div>
   <p class="note">Нажмите на день, чтобы открыть и отметить его.</p>`;
}
function vFocus(){
  const run=T.state!=='idle',isF=T.mode==='focus',ms=remaining(),r=120,c=2*Math.PI*r;
  const cur=isF?S.set.focusMin:S.set.breakMin,chips=isF?FOCUS_CHIPS:BREAK_CHIPS,max=isF?240:60,tf=S.set.focus[TK()]||{m:0,n:0};
  const vals=[];for(let i=6;i>=0;i--){const d=add(today(),-i);vals.push([d,(S.set.focus[key(d)]||{}).m||0])}
  const mx=Math.max(30,...vals.map(v=>v[1]));
  const bars=vals.map(([d,v])=>`<div title="${d.getDate()} ${MG[d.getMonth()]}: ${hm(v)}"><i class="${v?'':'z'}" style="height:${v?Math.max(6,v/mx*100):4}%"></i><small>${WD[(d.getDay()+6)%7]}</small></div>`).join('');
  const linked=T.habit&&S.habits.find(h=>h.id===T.habit);
  return `<header><div><div class="eyebrow">${isF?'Фокус':'Перерыв'} · ${durLabel(run?T.mins:cur)}</div><h1>${isF?'Время фокуса':'Отдых'}</h1></div>${meBtn()}</header>
   <div class="mode glass"><button class="${isF?'on':''}" data-a="tmode" data-m="focus" ${run?'disabled':''}>Фокус</button><button class="${!isF?'on':''}" data-a="tmode" data-m="break" ${run?'disabled':''}>Перерыв</button></div>
   <div class="dial glass lit"><svg viewBox="0 0 260 260" aria-hidden="true"><circle class="ring-track" cx="130" cy="130" r="${r}" fill="none" stroke-width="10"/>
     <circle class="tprog" id="t-prog" data-c="${c}" cx="130" cy="130" r="${r}" fill="none" stroke="${isF?'var(--accent)':'var(--ok)'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" style="stroke-dashoffset:${c*(ms/total())}"/></svg>
     <div class="tin"><span class="ttime num" id="t-time">${fmt(ms)}</span><span class="tlbl">${T.state==='pause'?'На паузе':run?(isF?(linked?esc(linked.emoji)+' '+esc(linked.name):'Не отвлекайтесь'):'Подышите, разомнитесь'):'Готов начать'}</span></div></div>
   <div class="tctl"><button class="rbtn glass press" data-a="treset" ${run?'':'disabled'} aria-label="Сбросить">${I.reset}</button>
     <button class="go press${isF?'':' brk'}" data-a="tgo">${T.state==='run'?I.pause+'Пауза':I.play+(T.state==='pause'?'Продолжить':'Старт')}</button>
     <button class="rbtn glass press" data-a="tskip" aria-label="${isF?'К перерыву':'К фокусу'}">${I.skip}</button></div>
   <div class="panel glass"><div class="ph"><b>${isF?'Длительность фокуса':'Длительность перерыва'}</b><span class="num" id="dur-lbl">${durLabel(cur)}</span></div>
     <div class="chips">${chips.map(m=>`<button class="chip glass press${m===cur?' on':''}" data-a="tdur" data-v="${m}" ${run?'disabled':''}>${durLabel(m)}</button>`).join('')}</div>
     <input type="range" id="dur-range" min="1" max="${max}" step="1" value="${cur}" ${run?'disabled':''} aria-label="Своя длительность, минут">
     <p class="smallprint">${run?'Длительность меняется, когда таймер остановлен.':'Ползунок: от 1 минуты до '+(isF?'4 часов':'1 часа')+'. '+(isF?(S.set.autoBreak?'После звонка перерыв начнётся сам.':'Перерыв запускается вручную.'):(S.set.autoFocus?'После перерыва фокус начнётся сам.':''))}</p></div>
   ${isF&&S.habits.length?`<div class="panel glass"><div class="ph"><b>Засчитать привычку</b><span>отметится по окончании</span></div>
     <div class="chips"><button class="chip glass press${!linked?' on':''}" data-a="tlink" data-id="">Без привычки</button>${S.habits.map(h=>`<button class="chip glass press${linked&&linked.id===h.id?' on':''}" data-a="tlink" data-id="${h.id}">${esc(h.emoji)} ${esc(h.name)}</button>`).join('')}</div></div>`:''}
   <button class="setrow group glass press" data-a="mini"><div><b>Мини-окно поверх всех окон</b><span>Таймер в маленьком окне, пока работаете в других программах</span></div><span class="go-ic">Открыть</span></button>
   <div class="panel glass"><div class="ph"><b>Сегодня</b><span class="num">${tf.n} ${plural(tf.n,['сессия','сессии','сессий'])} · ${hm(tf.m)}</span></div><div class="bars">${bars}</div></div>`;
}
function vStats(){
  const head=`<header><div><div class="eyebrow">Итоги · 30 дней</div><h1>Прогресс</h1></div>${meBtn()}</header>`;
  if(!S.habits.length)return head+`<div class="empty glass"><p>Добавьте привычку и отметьте пару дней. Здесь появятся серии, процент выполнения и тепловая карта.</p></div>`;
  const bestAll=Math.max(0,...S.habits.map(best)),cur=Math.max(0,...S.habits.map(streak)),perf=perfect(30),fm=focusSum(30);
  const avg=Math.round(S.habits.reduce((s,h)=>s+rate(h,30),0)/S.habits.length*100);
  const rows=S.habits.map(h=>{const r=Math.round(rate(h,30)*100);return `<div class="hstat glass" style="--c:${h.color}"><div class="hrow"><span class="ico">${esc(h.emoji)}</span><div class="body"><span class="name">${esc(h.name)}</span><span class="meta">Серия <b class="num">${streak(h)}</b> · рекорд <b class="num">${best(h)}</b></span></div><span class="pct num">${r}%</span></div><div class="bar"><i style="width:${r}%"></i></div></div>`}).join('');
  const t=today(),start=add(add(t,-((t.getDay()+6)%7)),-133),tk=key(t);let cells='';
  for(let i=0;i<140;i++){const d=add(start,i),k=key(d);if(k>tk){cells+='<i class="fut"></i>';continue}const f=dayFrac(k);cells+=`<i style="--o:${f?(.2+f*.8):0}" title="${d.getDate()} ${MG[d.getMonth()]}: ${f==null?'нет привычек':Math.round(f*100)+'%'}"></i>`}
  return head+`<div class="tiles"><div class="tile glass"><b class="num">${cur}</b><span>текущая серия, ${plural(cur,['день','дня','дней'])}</span></div>
   <div class="tile glass"><b class="num">${avg}%</b><span>выполнение в среднем</span></div>
   <div class="tile glass"><b class="num">${perf}</b><span>${plural(perf,['идеальный день','идеальных дня','идеальных дней'])}</span></div>
   <div class="tile glass"><b class="num">${hm(fm)}</b><span>в фокусе за 30 дней</span></div></div>
   <div class="sec"><h2>Привычки</h2><small>рекорд серии: ${bestAll} ${plural(bestAll,['день','дня','дней'])}</small></div><div class="list">${rows}</div>
   <div class="sec"><h2>20 недель</h2><small>все привычки</small></div><div class="heat-wrap glass"><div class="heat">${cells}</div></div>`;
}

/* ---------- top / friends / clans ---------- */
async function loadTop(force){
  const tp=S.top;if(!sb||!S.uid||!S.prof)return;
  if(tp.busy||(!force&&tp.data&&Date.now()-tp.t<60000))return;
  tp.busy=true;
  try{
    const col=tp.period==='week'?'week_aura':'aura';
    const [meR,frR,worldR,clansR]=await Promise.all([
      sb.from('leaderboard').select('*').eq('id',S.uid).maybeSingle(),
      sb.from('friends').select('requester,addressee,status'),
      sb.from('leaderboard').select('id,nick,avatar,code,clan_id,streak,aura,week_aura').order(col,{ascending:false}).limit(50),
      sb.from('clan_board').select('*').order(col,{ascending:false}).limit(50)]);
    const err=meR.error||frR.error||worldR.error||clansR.error;if(err)throw err;
    const me=meR.data||{id:S.uid,nick:S.prof.nick,avatar:S.prof.avatar,code:S.prof.code,clan_id:S.prof.clan_id,aura:0,week_aura:0,streak:0};
    const fr=frR.data||[],acc=[],inc=[],out=[];
    fr.forEach(f=>{const other=f.requester===S.uid?f.addressee:f.requester;if(f.status==='accepted')acc.push(other);else if(f.addressee===S.uid)inc.push(other);else out.push(other)});
    const pend=[...inc,...out];
    const [frBoard,pendP,placeR,myClanR]=await Promise.all([
      sb.from('leaderboard').select('id,nick,avatar,code,clan_id,streak,aura,week_aura').in('id',[S.uid,...acc]).order(col,{ascending:false}),
      pend.length?sb.from('profiles').select('id,nick,avatar,code').in('id',pend):Promise.resolve({data:[]}),
      sb.from('leaderboard').select('id',{count:'exact',head:true}).gt(col,me[col]||0),
      me.clan_id?sb.from('clan_board').select('*').eq('id',me.clan_id).maybeSingle():Promise.resolve({data:null})]);
    const pmap=Object.fromEntries((pendP.data||[]).map(p=>[p.id,p]));
    tp.data={me,col,friends:frBoard.data||[],world:worldR.data||[],clans:clansR.data||[],inc:inc.map(i=>pmap[i]).filter(Boolean),out:out.map(i=>pmap[i]).filter(Boolean),
      acc:new Set(acc),pendAll:new Set(pend),place:(placeR.count||0)+1,myClan:myClanR.data||null};
    tp.t=Date.now();S.prof.clan_id=me.clan_id;
  }catch(e){toast(netMsg(e))}
  tp.busy=false;if(S.view==='top')render();
}
function lrow(p,i,col,opts){
  const v=p[col]||0,mine=p.id===S.uid,rk=rankOf(p.aura||0);
  return `<button class="lrow${mine?' mine':''}" data-a="player" data-id="${p.id}"><span class="pl num${i<3?' p'+(i+1):''}">${i+1}</span>${avHtml(p)}
    <span class="who"><b>${esc(p.nick)}${mine?' · вы':''}</b><small>${rk.name} · серия ${p.streak||0}</small></span>
    <span class="pts num">✨ ${fmtN(v)}<small>${col==='week_aura'?'за неделю':'всего'}</small></span></button>`;
}
function vTop(){
  const head=`<header><div><div class="eyebrow">Рейтинг</div><h1>Топ</h1></div><div class="hright"><button class="hbtn glass lit press" data-a="toprefresh" aria-label="Обновить">${I.refresh}</button>${meBtn()}</div></header>`;
  if(!sb||!S.uid)return head+`<div class="empty glass"><h2>Нужен аккаунт</h2><p>Рейтинг, друзья и кланы работают, когда вы вошли под своим ником.</p>${sb?'<button class="go press" data-a="logout">Войти или зарегистрироваться</button>':'<p class="smallprint">Сервер ещё не подключён (config.js).</p>'}</div>`;
  const tp=S.top,d=tp.data;
  if(!d){loadTop();return head+`<div class="loading glass">Загружаем рейтинг…</div>`}
  if(Date.now()-tp.t>60000)loadTop();
  const me=d.me,rk=rankOf(me.aura||0),lg=leagueOf(me.week_aura||0),col=tp.period==='week'?'week_aura':'aura';
  const prog=rk.next?Math.round(((me.aura||0)-rk.min)/(rk.next-rk.min)*100):100;
  const todayPts=dayPoints(TK());
  const card=`<div class="mecard glass"><div class="merow">${avHtml(me)}<div style="min-width:0"><b>${esc(me.nick)}</b><small>ID #${me.code} · ${lg.icon} ${lg.name} лига</small></div></div>
    <div class="aura"><b class="num">✨ ${fmtN(me.aura)}</b><span>нафармлено ауры · +${fmtN(todayPts)} сегодня</span></div>
    <div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;color:var(--fg2);font-weight:600"><span class="badge">${rk.name}</span><span>${rk.next?'до ранга «'+rk.nextName+'»: '+fmtN(rk.next-(me.aura||0)):'высший ранг'}</span></div>
    <div class="prog"><i style="width:${prog}%"></i></div></div>`;
  const tabs=`<div class="mode glass"><button class="${tp.tab==='friends'?'on':''}" data-a="ttab" data-t="friends">Друзья</button><button class="${tp.tab==='world'?'on':''}" data-a="ttab" data-t="world">Мир</button><button class="${tp.tab==='clans'?'on':''}" data-a="ttab" data-t="clans">Кланы</button></div>
    <div class="mode glass"><button class="${tp.period==='week'?'on':''}" data-a="tper" data-p="week">Эта неделя</button><button class="${tp.period==='all'?'on':''}" data-a="tper" data-p="all">Всё время</button></div>`;
  let body='';
  if(d.col!==col)body=`<div class="loading glass">Обновляем…</div>`;
  else if(tp.tab==='friends'){
    body=`<form class="addf" id="addfriend"><label class="field-in glass"><input id="f-find" autocapitalize="off" spellcheck="false" placeholder="Ник или #ID друга" value="${esc(tp.find)}"></label><button class="go press" type="submit">Добавить</button></form>`;
    if(d.inc.length)body+=`<div class="sec"><h2>Заявки</h2><small>${d.inc.length}</small></div><div class="lb glass">${d.inc.map(p=>`<div class="lrow">${avHtml(p)}<span class="who"><b>${esc(p.nick)}</b><small>#${p.code} хочет в друзья</small></span><span class="acts"><button class="mini pri" data-a="facc" data-id="${p.id}">Принять</button><button class="mini" data-a="fdel" data-id="${p.id}">Нет</button></span></div>`).join('')}</div>`;
    body+=`<div class="lb glass">${d.friends.map((p,i)=>lrow(p,i,col)).join('')}</div>`;
    if(d.friends.length<2)body+=`<p class="note">Добавьте друзей по нику или ID. Ваш ID: <b>#${me.code}</b></p>`;
    if(d.out.length)body+=`<div class="sec"><h2>Отправлено</h2><small>ждут ответа</small></div><div class="lb glass">${d.out.map(p=>`<div class="lrow">${avHtml(p)}<span class="who"><b>${esc(p.nick)}</b><small>#${p.code}</small></span><span class="acts"><button class="mini" data-a="fdel" data-id="${p.id}">Отменить</button></span></div>`).join('')}</div>`;
  }else if(tp.tab==='world'){
    body=`<div class="lb glass">${d.world.map((p,i)=>lrow(p,i,col)).join('')||'<p class="note">Пока пусто</p>'}</div>`;
    if(!d.world.find(p=>p.id===S.uid))body+=`<p class="note">Ваше место в мире: <b class="num">${fmtN(d.place)}</b></p>`;
  }else{
    const mc=d.myClan;
    body=mc?`<div class="mecard glass"><div class="merow"><span class="av" style="width:58px;height:58px;font-size:30px;background:var(--empty)">${esc(mc.emblem)}</span><div style="min-width:0"><b>${esc(mc.name)}</b><small>${mc.members} ${plural(mc.members,['участник','участника','участников'])} · ваш клан</small></div></div>
      <div class="aura"><b class="num">✨ ${fmtN(mc[col])}</b><span>аура клана ${col==='week_aura'?'за неделю':'всего'}</span></div>
      <div class="chips"><button class="chip glass press" data-a="clan" data-id="${mc.id}">Участники</button><button class="chip glass press" data-a="clanleave">Выйти из клана</button></div></div>`
      :`<div class="empty glass"><h2>Вы пока без клана</h2><p>Создайте свой или вступите в клан из списка. Аура участников складывается, кланы соревнуются между собой.</p><button class="go press" data-a="clannew">Создать клан</button></div>`;
    body+=`<div class="lb glass">${d.clans.map((c,i)=>`<button class="lrow${mc&&mc.id===c.id?' mine':''}" data-a="clan" data-id="${c.id}"><span class="pl num${i<3?' p'+(i+1):''}">${i+1}</span><span class="av" style="width:40px;height:40px;font-size:21px;background:var(--empty)">${esc(c.emblem)}</span><span class="who"><b>${esc(c.name)}</b><small>${c.members} ${plural(c.members,['участник','участника','участников'])}</small></span><span class="pts num">✨ ${fmtN(c[col])}<small>${col==='week_aura'?'за неделю':'всего'}</small></span></button>`).join('')||'<p class="note">Кланов ещё нет. Станьте первым.</p>'}</div>`;
  }
  return head+card+tabs+body+`<p class="note">Аура: +10 за привычку, +1 за минуту фокуса, +25 за идеальный день, ×1.2 за серию от 7 дней и ×1.5 от 30. Начисляется за сегодня и вчера.</p>`;
}

/* ---------- render ---------- */
let lastView=null;
function render(){
  const ae=document.activeElement,aid=ae&&ae.id&&app.contains(ae)?ae.id:null,ss=aid&&'selectionStart' in ae?[ae.selectionStart,ae.selectionEnd]:null;
  let html;
  if(S.screen==='boot')html=`<div class="auth"><div class="brand"><img src="icons/icon-180.png" alt="Mentalist"><div class="wm">MENTALIST</div></div></div>`;
  else if(S.screen==='auth')html=vAuth();
  else if(S.screen==='finish')html=vFinish();
  else html=S.view==='today'?vToday():S.view==='calendar'?vCal():S.view==='focus'?vFocus():S.view==='stats'?vStats():vTop();
  const vkey=S.screen+S.view;
  app.innerHTML=`<div class="inner">${html}</div>`;
  if(lastView!==vkey){app.firstElementChild.classList.add('view');lastView=vkey}
  if(aid){const el=$(aid);if(el){el.focus({preventScroll:true});if(ss)try{el.setSelectionRange(ss[0],ss[1])}catch(e){}}}
  app.querySelectorAll('textarea[data-note]').forEach(grow);
  $('dock').hidden=S.screen!=='app';
  $('ind').style.setProperty('--i',{today:0,calendar:1,focus:2,stats:3,top:4}[S.view]);
  document.querySelectorAll('.tab').forEach(b=>{const on=b.dataset.tab===S.view;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  tickDom();
}
function grow(t){t.style.height='auto';t.style.height=Math.max(84,t.scrollHeight)+'px'}

/* ================= actions ================= */
function toggle(id){
  const h=S.habits.find(x=>x.id===id);if(!h)return;const k=S.sel;
  if(h.log[k])delete h.log[k];else h.log[k]=1;
  markDirty();render();
  const nb=app.querySelector(`.check[data-id="${id}"]`);
  if(nb&&h.log[k]){nb.classList.add('pop');try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}
}
function addHabit(name,emoji,color){const h={id:newId(),name:name.trim().slice(0,60),emoji,color,created:S.sel<TK()?S.sel:TK(),order:Date.now(),log:{},notes:''};S.habits.push(h);sortH();markDirty();return h}
function setDur(v){if(T.mode==='focus')S.set.focusMin=v;else S.set.breakMin=v;markDirty(1500)}

async function resizeImage(file,side,maxLen,square){
  const url=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  let q=.84,out='';
  for(let n=0;n<10;n++){let sx=0,sy=0,sw=img.width,sh=img.height;
    if(square){const m=Math.min(sw,sh);sx=(sw-m)/2;sy=(sh-m)/2;sw=sh=m}
    const sc=Math.min(1,side/Math.max(sw,sh)),w=Math.round(sw*sc),h=Math.round(sh*sc);
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,w,h);
    out=cv.toDataURL('image/jpeg',q);if(out.length<maxLen)return out;if(q>.55)q-=.1;else side=Math.round(side*.8)}
  return out.length<maxLen?out:null;
}

/* ---------- auth flow ---------- */
function aerr(m){A.err=m;A.busy=false;render();return false}
async function register(){
  const nick=A.nick.trim(),pin=A.pin;
  if(!NICK_RE.test(nick))return aerr('Ник: от 3 до 20 символов, буквы, цифры, _ и точка.');
  if(!/^\d{4,6}$/.test(pin))return aerr('PIN: от 4 до 6 цифр.');
  if(pin!==A.pin2)return aerr('PIN-коды не совпадают.');
  A.busy=true;A.err='';render();
  const f=await sb.rpc('nick_free',{p_nick:nick});if(f.error)return aerr(netMsg(f.error));if(!f.data)return aerr('Этот ник уже занят. Попробуйте другой.');
  const {data,error}=await sb.auth.signUp({email:'m'+rand(14)+'@mentalist.app',password:pinPass(pin)});
  if(error)return aerr(netMsg(error));
  if(!data.session)return aerr('Сервер просит подтвердить почту. Выключите «Confirm email» в настройках Supabase (см. инструкцию).');
  if(!await createProfile(data.user.id,nick,A.avatar)){S.uid=data.user.id;S.screen='finish';render();return}
  await enter(data.user);
}
async function createProfile(id,nick,avatar){
  for(let i=0;i<4;i++){const {data,error}=await sb.from('profiles').insert({id,nick,avatar:avatar||null}).select().single();
    if(!error){S.prof=data;return true}
    if(error.code==='23505'&&/nick/i.test(error.message+error.details))return aerr('Этот ник уже занят. Попробуйте другой.');
    if(error.code!=='23505')return aerr(netMsg(error))}
  return aerr('Не получилось создать профиль. Попробуйте ещё раз.');
}
async function login(){
  const nick=A.nick.trim(),pin=A.pin;
  if(!nick||!/^\d{4,6}$/.test(pin))return aerr('Введите ник и PIN из 4–6 цифр.');
  A.busy=true;A.err='';render();
  const e=await sb.rpc('login_email',{p_nick:nick});if(e.error)return aerr(netMsg(e.error));if(!e.data)return aerr('Такого ника нет. Проверьте написание или зарегистрируйтесь.');
  const {data,error}=await sb.auth.signInWithPassword({email:e.data,password:pinPass(pin)});
  if(error)return aerr(/invalid/i.test(error.message)?'Неверный PIN.':netMsg(error));
  await enter(data.user);
}
async function enter(user){
  const wasGuest=!S.uid;const guestHabits=S.habits,guestSet=S.set;
  S.uid=user.id;loadCache();
  if(wasGuest&&!S.habits.length&&guestHabits.length){S.habits=guestHabits;S.set=guestSet}
  A.busy=false;A.pin=A.pin2='';S.screen='app';S.top.data=null;render();
  if(!S.prof||S.prof.id!==S.uid){const {data,error}=await sb.from('profiles').select('*').eq('id',S.uid).maybeSingle();
    if(error){toast(netMsg(error));return}
    if(!data){S.screen='finish';render();return}
    S.prof=data}
  try{await loadData()}catch(e){toast('Работаем офлайн: '+netMsg(e))}
  A.nick='';A.avatar='';render();syncAura();
}
async function logout(){
  if(sb&&S.uid){if(dirty)await pushData();await sb.auth.signOut()}
  S.uid=null;S.prof=null;S.top.data=null;S.screen=sb?'auth':'auth';loadCache();closeSheet();render();
}

/* ---------- friends & clans ---------- */
async function addFriend(q){
  q=(q||'').trim().replace(/^@/,'');if(!q)return;
  let r;if(/^#?\d{6}$/.test(q))r=await sb.from('profiles').select('id,nick').eq('code',+q.replace('#','')).maybeSingle();
  else r=await sb.from('profiles').select('id,nick').eq('nick',q).maybeSingle();
  if(r.error)return toast(netMsg(r.error));if(!r.data)return toast('Никого не нашли: проверьте ник или ID.');
  const id=r.data.id;if(id===S.uid)return toast('Это вы 🙂');
  const d=S.top.data;
  if(d&&d.acc.has(id))return toast(r.data.nick+' уже в друзьях');
  if(d&&d.inc.find(p=>p.id===id))return acceptFriend(id);
  const {error}=await sb.from('friends').insert({requester:S.uid,addressee:id});
  if(error)return toast(error.code==='23505'?'Заявка уже отправлена':netMsg(error));
  S.top.find='';toast('Заявка отправлена: '+r.data.nick);loadTop(true);
}
async function acceptFriend(id){const {error}=await sb.from('friends').update({status:'accepted'}).eq('requester',id).eq('addressee',S.uid);if(error)return toast(netMsg(error));toast('Теперь вы друзья');loadTop(true)}
async function removeFriend(id){const {error}=await sb.from('friends').delete().or(`and(requester.eq.${S.uid},addressee.eq.${id}),and(requester.eq.${id},addressee.eq.${S.uid})`);if(error)return toast(netMsg(error));loadTop(true)}
async function setClan(id){const {error}=await sb.from('profiles').update({clan_id:id}).eq('id',S.uid);if(error)return toast(netMsg(error));S.prof.clan_id=id;toast(id?'Вы вступили в клан':'Вы вышли из клана');closeSheet();loadTop(true)}

app.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a;
  switch(a){
    case 'toggle':toggle(b.dataset.id);break;
    case 'pick':S.sel=b.dataset.k;render();break;
    case 'wk':{let d=add(parse(S.sel),+b.dataset.d);if(key(d)>TK())d=today();S.sel=key(d);render();break}
    case 'edit':openHabit(b.dataset.id);break;
    case 'new':openHabit(null);break;
    case 'settings':openSettings();break;
    case 'note':{const id=b.dataset.id;S.open[id]=!S.open[id];render();if(S.open[id]){const t=$('note-'+id);if(t){t.focus({preventScroll:true});t.setSelectionRange(t.value.length,t.value.length)}}break}
    case 'starter':{const s=STARTERS[+b.dataset.i];addHabit(s[0],s[1],s[2]);render();toast('Добавлено: '+s[0]);break}
    case 'filter':S.filter=b.dataset.id;render();break;
    case 'mo':S.month=new Date(S.month.getFullYear(),S.month.getMonth()+(+b.dataset.d),1);render();break;
    case 'calpick':S.sel=b.dataset.k;S.view='today';render();scrollTo({top:0,behavior:'smooth'});break;
    case 'tgo':T.state==='run'?tPause():tStart();break;
    case 'treset':tReset();break;
    case 'tskip':tSkip();break;
    case 'tmode':T.mode=b.dataset.m;T.state='idle';saveT();render();break;
    case 'tdur':setDur(+b.dataset.v);render();break;
    case 'tlink':T.habit=b.dataset.id||null;saveT();render();break;
    case 'mini':openMini();break;
    case 'amode':A.mode=b.dataset.m;A.err='';render();break;
    case 'guest':S.screen='app';S.uid=null;loadCache();render();break;
    case 'logout':logout();break;
    case 'ttab':S.top.tab=b.dataset.t;render();break;
    case 'tper':S.top.period=b.dataset.p;render();loadTop(true);break;
    case 'toprefresh':loadTop(true);toast('Обновляем…');break;
    case 'facc':acceptFriend(b.dataset.id);break;
    case 'fdel':removeFriend(b.dataset.id);break;
    case 'player':openPlayer(b.dataset.id);break;
    case 'clan':openClan(b.dataset.id);break;
    case 'clannew':openClanNew();break;
    case 'clanleave':setClan(null);break;
  }
});
app.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.note){const h=S.habits.find(x=>x.id===t.dataset.note);if(!h)return;h.notes=t.value;grow(t);markDirty(1500);const s=$('ns-'+h.id);if(s)s.textContent='Сохраняется…';clearTimeout(t._n);t._n=setTimeout(()=>{if(s)s.textContent='Сохранено'},1700)}
  else if(t.id==='dur-range'){const v=+t.value;setDur(v);$('dur-lbl').textContent=durLabel(v);const tt=$('t-time');if(tt)tt.textContent=fmt(v*60000);app.querySelectorAll('[data-a="tdur"]').forEach(c=>c.classList.toggle('on',+c.dataset.v===v))}
  else if(t.id==='a-nick')A.nick=t.value;else if(t.id==='a-pin')A.pin=t.value.replace(/\D/g,'');else if(t.id==='a-pin2')A.pin2=t.value.replace(/\D/g,'');
  else if(t.id==='f-find')S.top.find=t.value;
});
app.addEventListener('change',async e=>{
  const t=e.target;
  if(t.id==='dur-range')render();
  if(t.id==='a-av'&&t.files&&t.files[0]){const v=await resizeImage(t.files[0],160,50000,true).catch(()=>null);if(v){A.avatar=v;render()}else toast('Не удалось открыть фото.')}
});
app.addEventListener('submit',e=>{
  e.preventDefault();const f=e.target;
  if(f.id==='authform'){if(!sb)return aerr('Сервер не подключён: заполните config.js.');A.mode==='reg'?register():login()}
  else if(f.id==='finishform'){const nick=A.nick.trim();if(!NICK_RE.test(nick))return aerr('Ник: от 3 до 20 символов, буквы, цифры, _ и точка.');
    A.busy=true;render();createProfile(S.uid,nick,A.avatar).then(ok=>{if(ok)enter({id:S.uid})})}
  else if(f.id==='addfriend')addFriend(S.top.find);
});
$('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;
  S.view=b.dataset.tab;if(S.view==='calendar'){const d=parse(S.sel);S.month=new Date(d.getFullYear(),d.getMonth(),1)}render();scrollTo({top:0})});

/* ================= sheets ================= */
const sheet=$('sheet'),scrim=$('scrim');
let F=null;
function showSheet(){sheet.classList.add('open');scrim.classList.add('open');sheet.scrollTop=0}
function closeSheet(){sheet.classList.remove('open');scrim.classList.remove('open');F=null}
scrim.addEventListener('click',closeSheet);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&F)closeSheet()});

/* habit */
function openHabit(id){
  const h=id?S.habits.find(x=>x.id===id):null;
  F={kind:'habit',id:h?h.id:null,name:h?h.name:'',emoji:h?h.emoji:EMOJI[0],color:h?h.color:COLORS[6],armed:false};
  drawHabit();showSheet();setTimeout(()=>{const i=$('habit-name');if(i&&!h)i.focus({preventScroll:true})},380);
}
function drawHabit(){
  sheet.innerHTML=`<div class="grab"></div>
   <div class="shead"><button class="txtbtn" data-s="cancel">Отмена</button><h2 id="sheet-title">${F.id?'Привычка':'Новая привычка'}</h2><button class="txtbtn strongt" data-s="save" ${F.name.trim()?'':'disabled'}>${F.id?'Готово':'Добавить'}</button></div>
   <div class="preview"><span class="ico" style="--c:${F.color}">${esc(F.emoji)}</span><label class="field-in glass"><input id="habit-name" maxlength="60" autocomplete="off" placeholder="Например, читать 20 минут" value="${esc(F.name)}" aria-label="Название привычки"></label></div>
   <div class="lbl">Иконка</div><div class="emojis" style="--c:${F.color}">${EMOJI.map(x=>`<button class="press${x===F.emoji?' on':''}" data-s="emoji" data-v="${x}" aria-label="Иконка ${x}">${x}</button>`).join('')}</div>
   <div class="lbl">Цвет</div><div class="swatches">${COLORS.map(c=>`<button class="press${c===F.color?' on':''}" style="--sw:${c}" data-s="color" data-v="${c}" aria-label="Цвет ${c}"></button>`).join('')}</div>
   ${F.id?`<button class="danger glass press${F.armed?' armed':''}" data-s="del">${F.armed?'Нажмите ещё раз, чтобы удалить вместе с отметками и заметками':'Удалить привычку'}</button>`:''}`;
  const inp=$('habit-name');
  inp.addEventListener('input',()=>{F.name=inp.value;sheet.querySelector('[data-s="save"]').disabled=!F.name.trim()});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();saveHabit()}});
}
function saveHabit(){if(!F||!F.name.trim())return;
  if(F.id){const h=S.habits.find(x=>x.id===F.id);if(h){h.name=F.name.trim().slice(0,60);h.emoji=F.emoji;h.color=F.color;markDirty()}toast('Сохранено')}
  else{addHabit(F.name,F.emoji,F.color);toast('Привычка добавлена')}
  closeSheet();render()}

/* settings + profile */
function openSettings(){F={kind:'settings',pin:'',pin2:'',nick:S.prof?S.prof.nick:'',armed:false};drawSettings();showSheet()}
const sw=(id,on,label,sub)=>`<div class="setrow"><div><b>${label}</b>${sub?`<span>${sub}</span>`:''}</div><button class="sw" role="switch" aria-checked="${on}" data-s="sw" data-k="${id}" aria-label="${label}"></button></div>`;
function drawSettings(){
  const b=S.set.bg,p=S.prof;
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const tiles=PRESETS.map(x=>`<button class="bgt${b.type==='preset'&&b.preset===x.id?' on':''}" data-s="preset" data-v="${x.id}"><span class="pv" style="--pv:${pvOf(x.c)}"></span>${x.name}</button>`).join('')
   +`<button class="bgt${b.type==='custom'?' on':''}" data-s="custom"><span class="pv" style="--pv:${pvOf(b.colors)}">${I.brush}</span>Свой</button>`
   +`<button class="bgt${b.type==='image'?' on':''}" data-s="image"><span class="pv" style="--pv:${S.wall?'url(&quot;'+S.wall+'&quot;)':'var(--empty)'}">${S.wall?'':I.photo}</span>Обои</button>`;
  let extra='';
  if(b.type==='custom')extra=`<div class="custom glass"><div class="cpick">${[0,1,2].map(i=>`<label>Цвет ${i+1}<input type="color" id="bg-c${i}" data-ci="${i}" value="${esc(b.colors[i])}"></label>`).join('')}</div><p class="smallprint">Три цвета смешиваются в мягкий живой фон.</p></div>`;
  if(b.type==='image')extra=`<div class="custom glass"><label class="filebtn glass press">${S.wall?'Выбрать другое фото':'Выбрать фото'}<input type="file" id="bg-file" accept="image/*"></label>
    ${S.wall?`<div class="slider"><div><span>Затемнение</span><span class="num" id="dim-v">${b.dim}%</span></div><input type="range" id="bg-dim" min="0" max="85" value="${b.dim}"></div>
    <div class="slider"><div><span>Размытие</span><span class="num" id="blur-v">${b.blur} px</span></div><input type="range" id="bg-blur" min="0" max="30" value="${b.blur}"></div>
    <button class="danger glass press" data-s="nowall">Удалить обои</button>`:'<p class="smallprint">Подойдёт любое фото, мы уменьшим его для быстрой загрузки.</p>'}</div>`;
  const account=p?`<div class="acct glass" style="border-radius:22px;padding:14px;display:flex;gap:14px;align-items:center">
      <label class="avpick glass" style="width:64px;height:64px;align-self:auto" aria-label="Сменить аватарку">${p.avatar?`<img src="${esc(p.avatar)}" alt="">`:avHtml(p,'').replace('class="av "','class="av" style="width:100%;height:100%;font-size:24px;background:'+colorFor(p.id)+'"')}<input type="file" id="s-av" accept="image/*"></label>
      <div style="min-width:0;flex:1"><b style="font-size:17px;display:block">${esc(p.nick)}</b><span style="font-size:13px;color:var(--fg2)">ID #${p.code} · нажмите на фото, чтобы сменить</span></div></div>
    <div class="group glass"><div class="setrow" style="gap:10px"><label class="field-in" style="height:44px;background:var(--empty)"><input id="s-nick" maxlength="20" autocapitalize="off" spellcheck="false" value="${esc(F.nick)}" aria-label="Ник"></label><button class="mini pri" data-s="nick">Сменить ник</button></div>
      <div class="setrow" style="gap:10px"><label class="field-in" style="height:44px;background:var(--empty)"><input id="s-pin" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password" placeholder="Новый PIN" value="${esc(F.pin)}"></label><button class="mini pri" data-s="pin">Сменить PIN</button></div></div>
    <button class="danger glass press" data-s="logout">Выйти из аккаунта</button>`
    :`<div class="empty glass"><p>Вы без аккаунта: данные хранятся только в этом браузере, рейтинг недоступен.</p>${sb?'<button class="go press" data-s="logout">Войти или зарегистрироваться</button>':''}</div>`;
  sheet.innerHTML=`<div class="grab"></div>
   <div class="shead"><span style="min-width:64px"></span><h2 id="sheet-title">Профиль</h2><button class="txtbtn strongt" data-s="close">Готово</button></div>
   ${account}
   <div class="lbl">Таймер</div>
   <div class="group glass">${sw('autoBreak',S.set.autoBreak,'Перерыв сразу после звонка','Фокус закончился, и отдых пошёл сам')}${sw('autoFocus',S.set.autoFocus,'Фокус сразу после перерыва','Цикл идёт без нажатий')}${sw('island',S.set.island,'Таймер сверху экрана','Чёрный островок в стиле Dynamic Island, пока идёт таймер')}
     <button class="setrow press" data-s="mini"><div><b>Мини-окно поверх всех окон</b><span>Windows: Chrome и Edge. На iPhone зависит от версии iOS.</span></div><span class="go-ic">Открыть</span></button></div>
   <div class="lbl">Звук сигнала</div>
   <div class="rings">${RINGS.map(r=>`<button class="ropt glass press${S.set.ring===r.id?' on':''}" data-s="ring" data-v="${r.id}">${I.speaker}<span>${r.name}</span></button>`).join('')}
     <button class="ropt glass press${S.set.ring==='custom'?' on':''}" data-s="ring" data-v="custom" ${S.ring?'':'disabled'}>${I.speaker}<span>${S.ring?esc(S.ring.name):'Своя мелодия'}</span></button>
     <label class="ropt glass press" style="color:var(--accent);cursor:pointer">${I.plus}<span>${S.ring?'Заменить':'Загрузить свою'}</span><input type="file" id="ring-file" accept="audio/*" style="position:absolute;width:1px;height:1px;opacity:0"></label></div>
   <div class="slider"><div><span>Громкость</span><span class="num" id="vol-v">${S.set.vol}%</span></div><input type="range" id="vol" min="0" max="100" value="${S.set.vol}"></div>
   ${S.ring?`<button class="txtbtn" style="align-self:flex-start" data-s="noring">Удалить свою мелодию</button>`:''}
   <p class="smallprint">Своя мелодия: MP3, M4A или WAV до 1 МБ, играет первые 30 секунд.</p>
   <div class="lbl">Фон</div><div class="bgs">${tiles}</div>${extra}
   <div class="lbl">Производительность</div>
   <div class="group glass">${sw('eco',ecoOn(),'Экономия','Меньше размытия и без анимации фона: бережёт батарею и процессор')}</div>
   <div class="lbl">Установка</div>
   <div class="custom glass">${standalone?'<p class="smallprint" style="color:var(--fg2)">Приложение уже установлено ✓</p>':`
     ${installEvt?'<button class="go wide press" data-s="install">Установить Mentalist</button>':''}
     <ol class="steps"><li><b>iPhone:</b> откройте сайт в Safari → «Поделиться» → «На экран „Домой“».</li><li><b>Windows:</b> в Edge или Chrome нажмите значок установки в адресной строке (или меню → «Приложения» → «Установить»).</li></ol>`}</div>`;
}
let installEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e});
sheet.addEventListener('click',async e=>{const b=e.target.closest('[data-s]');if(!b||!F||b.disabled)return;const s=b.dataset.s;
  if(F.kind==='settings'){const bg=S.set.bg;
    switch(s){
      case 'close':closeSheet();break;
      case 'sw':{const k=b.dataset.k;S.set[k]=k==='eco'?!ecoOn():!S.set[k];if(k==='eco')applyEco();b.setAttribute('aria-checked',k==='eco'?ecoOn():S.set[k]);markDirty();tickDom();break}
      case 'mini':openMini();break;
      case 'ring':unlockAudio();S.set.ring=b.dataset.v;markDirty();drawSettings();playRing(S.set.ring,0);if(T.state==='run')schedRing();break;
      case 'noring':S.ring=null;ringBuf=null;if(S.set.ring==='custom')S.set.ring='chime';markDirty();pushBlob('ring');drawSettings();break;
      case 'preset':bg.type='preset';bg.preset=b.dataset.v;applyBg();markDirty();drawSettings();break;
      case 'custom':bg.type='custom';applyBg();markDirty();drawSettings();break;
      case 'image':bg.type='image';applyBg();drawSettings();if(S.wall)markDirty();else{const f=$('bg-file');if(f)f.click()}break;
      case 'nowall':S.wall='';bg.type='preset';applyBg();markDirty();pushBlob('wall');drawSettings();toast('Обои удалены');break;
      case 'install':if(installEvt){installEvt.prompt();installEvt=null;drawSettings()}break;
      case 'logout':closeSheet();logout();break;
      case 'nick':{const n=($('s-nick').value||'').trim();if(!NICK_RE.test(n))return toast('Ник: от 3 до 20 символов, буквы, цифры, _ и точка.');
        const {error}=await sb.from('profiles').update({nick:n}).eq('id',S.uid);if(error)return toast(error.code==='23505'?'Этот ник уже занят':netMsg(error));S.prof.nick=n;F.nick=n;S.top.data=null;toast('Ник изменён');drawSettings();render();break}
      case 'pin':{const p=($('s-pin').value||'');if(!/^\d{4,6}$/.test(p))return toast('PIN: от 4 до 6 цифр.');
        const {error}=await sb.auth.updateUser({password:pinPass(p)});if(error)return toast(netMsg(error));F.pin='';toast('PIN изменён');drawSettings();break}
    }
    return}
  if(F.kind==='habit'){
    const keep=()=>{const i=$('habit-name');if(i)F.name=i.value};
    if(s==='cancel')closeSheet();
    else if(s==='save'){keep();saveHabit()}
    else if(s==='emoji'){keep();F.emoji=b.dataset.v;F.armed=false;drawHabit()}
    else if(s==='color'){keep();F.color=b.dataset.v;F.armed=false;drawHabit()}
    else if(s==='del'){if(!F.armed){keep();F.armed=true;drawHabit();return}
      const id=F.id;S.habits=S.habits.filter(h=>h.id!==id);delete S.open[id];if(S.filter===id)S.filter='all';if(T.habit===id){T.habit=null;saveT()}markDirty();closeSheet();render();toast('Привычка удалена')}
    return}
  if(F.kind==='player'){
    if(s==='close')closeSheet();
    else if(s==='fadd'){closeSheet();S.top.find=F.p.nick;addFriend(F.p.nick)}
    else if(s==='fremove'){if(!F.armed){F.armed=true;drawPlayer();return}closeSheet();removeFriend(F.p.id)}
    return}
  if(F.kind==='clan'){
    if(s==='close')closeSheet();
    else if(s==='join')setClan(F.c.id);
    else if(s==='leave')setClan(null);
    else if(s==='player')openPlayer(b.dataset.id);
    else if(s==='cdel'){if(!F.armed){F.armed=true;drawClan();return}const {error}=await sb.from('clans').delete().eq('id',F.c.id);if(error)return toast(netMsg(error));S.prof.clan_id=null;closeSheet();toast('Клан удалён');loadTop(true)}
    return}
  if(F.kind==='clannew'){
    if(s==='close')closeSheet();
    else if(s==='emb'){F.name=$('c-name').value;F.emblem=b.dataset.v;drawClanNew()}
    else if(s==='create')createClan();
  }
});
sheet.addEventListener('input',e=>{const t=e.target;if(!F||F.kind!=='settings')return;const bg=S.set.bg;
  if(t.dataset.ci!=null){bg.colors[+t.dataset.ci]=t.value;applyBg();markDirty(1500);const pv=sheet.querySelector('[data-s="custom"] .pv');if(pv)pv.style.setProperty('--pv',pvOf(bg.colors))}
  else if(t.id==='bg-dim'){bg.dim=+t.value;$('dim-v').textContent=t.value+'%';applyBg();markDirty(1500)}
  else if(t.id==='bg-blur'){bg.blur=+t.value;$('blur-v').textContent=t.value+' px';applyBg();markDirty(1500)}
  else if(t.id==='vol'){S.set.vol=+t.value;$('vol-v').textContent=t.value+'%';markDirty(1500)}
  else if(t.id==='s-nick')F.nick=t.value;else if(t.id==='s-pin')F.pin=t.value.replace(/\D/g,'');
});
sheet.addEventListener('change',async e=>{const t=e.target,file=t.files&&t.files[0];if(!file)return;
  if(t.id==='bg-file'){toast('Обрабатываем фото…');const v=await resizeImage(file,1600,600000,false).catch(()=>null);if(!v)return toast('Не удалось открыть фото. Попробуйте другое.');
    S.wall=v;S.set.bg.type='image';applyBg();markDirty();pushBlob('wall');drawSettings();toast('Обои установлены')}
  else if(t.id==='s-av'){const v=await resizeImage(file,160,50000,true).catch(()=>null);if(!v)return toast('Не удалось открыть фото.');
    const {error}=await sb.from('profiles').update({avatar:v}).eq('id',S.uid);if(error)return toast(netMsg(error));S.prof.avatar=v;S.top.data=null;drawSettings();render();toast('Аватарка обновлена')}
  else if(t.id==='ring-file'){
    if(file.size>1024*1024)return toast('Файл больше 1 МБ. Обрежьте мелодию или выберите другую.');
    unlockAudio();const ab=await file.arrayBuffer();
    try{ringBuf=await decodeAudio(ab.slice(0))}catch(err){return toast('Этот формат не поддерживается. Попробуйте MP3 или M4A.')}
    S.ring={name:file.name.replace(/\.[^.]+$/,'').slice(0,40),data:bufToB64(ab)};S.set.ring='custom';markDirty();pushBlob('ring');drawSettings();playRing('custom',0);toast('Мелодия установлена')}
  t.value='';
});

/* player profile */
async function openPlayer(id){
  const {data,error}=await sb.from('leaderboard').select('*').eq('id',id).maybeSingle();if(error||!data)return toast(netMsg(error));
  let clan=null;if(data.clan_id){const c=await sb.from('clans').select('name,emblem').eq('id',data.clan_id).maybeSingle();clan=c.data}
  F={kind:'player',p:data,clan,armed:false};drawPlayer();showSheet();
}
function drawPlayer(){
  const p=F.p,d=S.top.data,rk=rankOf(p.aura),lg=leagueOf(p.week_aura),isFriend=d&&d.acc.has(p.id),pend=d&&d.pendAll.has(p.id),me=p.id===S.uid;
  sheet.innerHTML=`<div class="grab"></div><div class="shead"><span style="min-width:64px"></span><h2 id="sheet-title">Игрок</h2><button class="txtbtn strongt" data-s="close">Готово</button></div>
   <div class="mecard glass"><div class="merow">${avHtml(p)}<div style="min-width:0"><b>${esc(p.nick)}</b><small>ID #${p.code}${F.clan?' · '+esc(F.clan.emblem)+' '+esc(F.clan.name):''}</small></div></div>
   <div class="aura"><b class="num">✨ ${fmtN(p.aura)}</b><span>нафармлено ауры</span></div>
   <div class="chips"><span class="badge">${rk.name}</span><span class="badge">${lg.icon} ${lg.name}</span><span class="badge">🔥 серия ${p.streak}</span><span class="badge">+${fmtN(p.week_aura)} за неделю</span></div></div>
   ${me?'':isFriend?`<button class="danger glass press${F.armed?' armed':''}" data-s="fremove">${F.armed?'Нажмите ещё раз, чтобы удалить':'Удалить из друзей'}</button>`:pend?'<p class="note">Заявка в друзья уже есть</p>':'<button class="go wide press" data-s="fadd">Добавить в друзья</button>'}`;
}
/* clan */
async function openClan(id){
  const [c,m]=await Promise.all([sb.from('clan_board').select('*').eq('id',id).maybeSingle(),sb.from('leaderboard').select('id,nick,avatar,code,streak,aura,week_aura').eq('clan_id',id).order('aura',{ascending:false}).limit(100)]);
  if(c.error||!c.data)return toast(netMsg(c.error));F={kind:'clan',c:c.data,members:m.data||[],armed:false};drawClan();showSheet();
}
function drawClan(){
  const c=F.c,mine=S.prof&&S.prof.clan_id===c.id,owner=c.owner===S.uid;
  sheet.innerHTML=`<div class="grab"></div><div class="shead"><span style="min-width:64px"></span><h2 id="sheet-title">${esc(c.emblem)} ${esc(c.name)}</h2><button class="txtbtn strongt" data-s="close">Готово</button></div>
   <div class="tiles"><div class="tile glass"><b class="num">✨ ${fmtN(c.aura)}</b><span>аура клана всего</span></div><div class="tile glass"><b class="num">${fmtN(c.week_aura)}</b><span>за эту неделю</span></div></div>
   <div class="lbl">Участники · ${c.members}</div>
   <div class="lb glass">${F.members.map((p,i)=>`<button class="lrow${p.id===S.uid?' mine':''}" data-s="player" data-id="${p.id}"><span class="pl num">${i+1}</span>${avHtml(p)}<span class="who"><b>${esc(p.nick)}${p.id===c.owner?' · глава':''}</b><small>${rankOf(p.aura).name}</small></span><span class="pts num">✨ ${fmtN(p.aura)}</span></button>`).join('')||'<p class="note">Пока никого</p>'}</div>
   ${mine?'<button class="danger glass press" data-s="leave">Выйти из клана</button>':'<button class="go wide press" data-s="join">'+(S.prof&&S.prof.clan_id?'Перейти в этот клан':'Вступить в клан')+'</button>'}
   ${owner?`<button class="danger glass press${F.armed?' armed':''}" data-s="cdel">${F.armed?'Нажмите ещё раз: клан будет удалён для всех':'Удалить клан'}</button>`:''}`;
}
function openClanNew(){F={kind:'clannew',name:'',emblem:CLAN_EMBLEMS[0]};drawClanNew();showSheet()}
function drawClanNew(){
  sheet.innerHTML=`<div class="grab"></div><div class="shead"><button class="txtbtn" data-s="close">Отмена</button><h2 id="sheet-title">Новый клан</h2><button class="txtbtn strongt" data-s="create">Создать</button></div>
   <div class="preview"><span class="ico" style="--c:var(--accent)">${esc(F.emblem)}</span><label class="field-in glass"><input id="c-name" maxlength="24" placeholder="Название клана" value="${esc(F.name)}"></label></div>
   <div class="lbl">Эмблема</div><div class="emojis" style="--c:var(--accent)">${CLAN_EMBLEMS.map(x=>`<button class="press${x===F.emblem?' on':''}" data-s="emb" data-v="${x}">${x}</button>`).join('')}</div>
   <p class="smallprint">Вы станете главой. Вступить в клан может любой игрок.</p>`;
}
async function createClan(){
  const name=($('c-name').value||'').trim();if(name.length<3)return toast('Название: от 3 до 24 символов.');
  const {data,error}=await sb.from('clans').insert({name,emblem:F.emblem,owner:S.uid}).select().single();
  if(error)return toast(error.code==='23505'?'Клан с таким названием уже есть':netMsg(error));
  await setClan(data.id);
}

/* ================= misc ================= */
let tt;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2800)}
let lastT=TK();setInterval(()=>{const t=TK();if(t!==lastT){if(S.sel===lastT)S.sel=t;lastT=t;if(S.screen==='app')render()}},60000);
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});

/* ================= boot ================= */
(async function boot(){
  loadCache();render();
  /* the timer starts ticking only once we know whose data a finished session belongs to */
  if(!sb){S.screen='auth';render();ensureTick();return}
  sb.auth.onAuthStateChange((ev)=>{if(ev==='SIGNED_OUT'&&S.uid){S.uid=null;S.prof=null;S.screen='auth';render()}});
  let session=null;try{session=(await sb.auth.getSession()).data.session}catch(e){}
  if(!session){S.screen='auth';render();ensureTick();return}
  await enter(session.user);ensureTick();
})();
})();
