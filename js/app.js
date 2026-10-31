(function(){
const WA='56956592453';
const waLink=t=>`https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const clp=n=>'$'+Number(n).toLocaleString('es-CL');
const rango=r=>r?`${clp(r[0])} – ${clp(r[1])}`:'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const $=id=>document.getElementById(id);
const cur=p=>p.tasado?p.precios[p.estado_pieza.toLowerCase()]:null;
let piezas=[],SUBS={};
const general='Hola, me interesa una pieza del Museo Virtual RetroXplay';
$('waFloat').href=waLink(general); $('waFoot').href=waLink(general);

fetch('data/piezas.json?'+Date.now()).then(r=>r.json()).then(d=>{
  piezas=d.piezas.slice(); SUBS=d.subcategorias||{};
  const conPiezas=new Set(piezas.map(p=>p.grupo));
  const grupos=[...new Set([...conPiezas,...Object.keys(SUBS)])].sort((a,b)=>a.localeCompare(b,'es'));
  $('sTotal').textContent=piezas.length; $('sCat').textContent=conPiezas.size; $('sTas').textContent=piezas.filter(p=>p.tasado).length;
  $('fGrupo').innerHTML=['Todas',...grupos].map(g=>`<option value="${esc(g)}">${g==='Todas'?'Todas':esc(g)+' ('+piezas.filter(p=>p.grupo===g).length+')'}</option>`).join('');
  $('fGrupo').onchange=()=>{renderSub();render();};
  ['fSub','fEst','ord','soloTas'].forEach(i=>$(i).onchange=render);
  ['q','pmin','pmax'].forEach(i=>$(i).oninput=render);
  renderSub(); render(); route();
}).catch(()=>{$('grid').innerHTML='<p class="empty">No se pudo cargar la colección.</p>';});

function renderSub(){
  const g=$('fGrupo').value, subs=SUBS[g]||[];
  $('fSub').innerHTML=['Todas',...subs].map(s=>{const k=piezas.filter(p=>p.grupo===g&&(s==='Todas'||p.subcategoria===s)).length;return `<option value="${esc(s)}">${esc(s)}${s==='Todas'?'':' ('+k+')'}</option>`}).join('');
  $('fSub').disabled=!subs.length;
}
function proximamente(g,sub){
  const subs=SUBS[g]||[], cual=sub!=='Todas'?sub:(subs.length?subs.slice(0,-1).join(', ')+(subs.length>1?' y ':'')+subs[subs.length-1]:'');
  const msg=`Hola, busco una pieza de ${sub!=='Todas'?sub:g} en el Museo Virtual RetroXplay`;
  return `<div class="soon"><span class="eyebrow">Próximamente</span><h3>${esc(sub!=='Todas'?sub:g)}</h3>
    <p>Estamos preparando esta colección${cual&&sub==='Todas'?`: ${esc(cual)}`:''}. Muy pronto verás aquí nuevas piezas.</p>
    <p>¿Buscas un modelo en particular? <a href="${waLink(msg)}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a>.</p></div>`;
}
function render(){
  const q=norm($('q').value.trim()), solo=$('soloTas').checked, g=$('fGrupo').value, sub=$('fSub').value||'Todas', est=$('fEst').value;
  const a=+$('pmin').value||0, b=+$('pmax').value||1e15, o=$('ord').value;
  const list=piezas.filter(p=>{const c=cur(p);
    return (g==='Todas'||p.grupo===g)&&(sub==='Todas'||p.subcategoria===sub)&&(!solo||p.tasado)&&(!est||(p.tasado&&p.estado_pieza===est))&&
    ((!$('pmin').value&&!$('pmax').value)||(c&&c[1]>=a&&c[0]<=b))&&
    (!q||norm([p.id,p.nombre,p.categoria,p.subcategoria||'',p.origen,p.materiales,p.marcas,p.descripcion].join(' ')).includes(q));});
  list.sort((x,y)=>{const cx=cur(x),cy=cur(y);
    if(o==='t')return x.nombre.localeCompare(y.nombre,'es'); if(o==='n')return y.id.localeCompare(x.id);
    if(!cx||!cy)return (cy?1:0)-(cx?1:0)||x.id.localeCompare(y.id);
    return o==='a'?cx[0]-cy[0]:cy[1]-cx[1]||cy[0]-cx[0];});
  $('count').textContent=`${list.length} de ${piezas.length} piezas`;
  $('grid').innerHTML=list.length?list.map((p,i)=>{const c=cur(p);
    return `<article class="card" data-id="${p.id}" tabindex="0" style="animation-delay:${Math.min(i,24)*25}ms">
      <img src="images/thumb/${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy">
      <div class="cb"><div class="t">${esc(p.nombre)}</div><div class="a">${esc(p.categoria)}${p.subcategoria?' · '+esc(p.subcategoria):''}</div>
      <div><span class="tag id">${p.id}</span><span class="tag">${esc(p.grupo)}</span>${p.tasado?`<span class="tag st">${esc(p.estado_pieza)}</span>`:''}${p.video?'<span class="tag sc">▶ video</span>':''}</div>
      ${c?`<div class="price">${rango(c)} CLP</div>`:`<div class="price pend">Valorización en proceso</div>`}</div></article>`;
  }).join(''):(SUBS[g]&&!q&&!solo&&!est?proximamente(g,sub):'<p class="empty">Sin resultados para estos filtros</p>');
}
$('grid').addEventListener('click',e=>{const c=e.target.closest('.card'); if(c) location.hash=c.dataset.id;});
$('grid').addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('.card'); if(c) location.hash=c.dataset.id;}});

function abrir(p){
  const est=p.tasado?p.estado_pieza.toLowerCase():null;
  const precios=p.tasado?`<div class="prices">${['excelente','bueno','regular'].map(k=>
      `<div class="pr${k===est?' cur':''}"><small>${k}</small><b>${rango(p.precios[k])}</b>${k===est?'<em>● Estado de esta pieza</em>':''}</div>`).join('')}</div>`
    :`<div class="pending">Valorización en proceso${p.nota_valor?`<br><small>${esc(p.nota_valor.replace(/^Sin precio: ?/,''))}</small>`:''}</div>`;
  const msg=`Hola, me interesa la pieza ${p.id}: ${p.nombre} del Museo Virtual RetroXplay`;
  const vids=(Array.isArray(p.video)?p.video:(p.video&&p.video.src?[p.video]:[]));
  const rows=[['Código',p.id],['Colección',p.grupo],['Categoría',p.categoria],['Subcategoría',p.subcategoria],['Origen / época',p.origen],['Materiales',p.materiales],['Marcas',p.marcas],['Estado',p.estado]].filter(r=>r[1]);
  $('sheet').innerHTML=`<button class="x" aria-label="Cerrar">×</button>
   <span class="eyebrow">${p.id} · ${esc(p.grupo)}${p.subcategoria?` · ${esc(p.subcategoria)}`:''}</span>
   <h2 id="mTitle">${esc(p.nombre)}</h2><div class="sub">${esc(p.origen||'')}</div>
   <div class="ph">${p.fotos.map((f,i)=>`<a href="images/full/${f}" target="_blank" rel="noopener"><img src="images/full/${f}" alt="Foto ${i+1} de ${esc(p.nombre)}" loading="lazy"></a>`).join('')}</div>
   ${vids.map(v=>`<figure class="vid"><video src="${esc(v.src)}"${v.poster?` poster="${esc(v.poster)}"`:''} controls${v.audio?'':' muted'} playsinline preload="metadata"></video>${v.caption?`<figcaption>${esc(v.caption)}</figcaption>`:''}</figure>`).join('')}
   <p class="desc">${esc(p.descripcion)}</p>
   <table>${rows.map(r=>`<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
   ${p.factores?`<div class="fact"><strong>Factores de valor:</strong> ${esc(p.factores)}</div>`:''}
   <h3 style="margin:0 0 4px;font-size:1.2rem">Precio estimado según estado</h3>
   ${precios}
   <p class="note">Precios referenciales en CLP, estimados a partir de ventas comparables de mercado; no constituyen tasación certificada. <a href="valoracion.html">¿Cómo valoramos?</a></p>
   <a class="btn wa" href="${waLink(msg)}" target="_blank" rel="noopener">Consultar / comprar por WhatsApp</a>`;
  $('sheet').querySelector('.x').onclick=cerrar;
  $('modal').classList.add('open'); document.body.style.overflow='hidden'; $('modal').scrollTop=0;
  document.title=`${p.id} · ${p.nombre} · RetroXplay`;
}
function cerrar(){ if(location.hash) history.pushState('',document.title,location.pathname+location.search); $('modal').classList.remove('open'); document.body.style.overflow=''; document.title='RetroXplay · Museo Virtual de Antigüedades'; }
function route(){ const id=decodeURIComponent(location.hash.slice(1)).toUpperCase(); const p=piezas.find(x=>x.id===id); if(p) abrir(p); else if($('modal').classList.contains('open')){ $('modal').classList.remove('open'); document.body.style.overflow='';} }
window.addEventListener('hashchange',route);
$('modal').addEventListener('click',e=>{if(e.target.id==='modal')cerrar();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('modal').classList.contains('open'))cerrar();});
})();
