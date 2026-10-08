(function(){
const WA='56956592453';
const waLink=t=>`https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const clp=n=>'$'+n.toLocaleString('es-CL');
const rango=r=>r?`${clp(r[0])} – ${clp(r[1])}`:'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const $=id=>document.getElementById(id);
let piezas=[],grupo='Todas';
const general='Hola, me interesa una pieza del Museo Virtual RetroXplay';
$('waFloat').href=waLink(general); $('waFoot').href=waLink(general);

fetch('data/piezas.json').then(r=>r.json()).then(d=>{
  piezas=d.piezas.slice().sort((a,b)=>(b.tasado-a.tasado)||(b.tasado?(b.precios[b.estado_pieza.toLowerCase()][1]-a.precios[a.estado_pieza.toLowerCase()][1]):0)||a.id.localeCompare(b.id));
  const grupos=[...new Set(piezas.map(p=>p.grupo))].sort((a,b)=>a.localeCompare(b,'es'));
  $('sTotal').textContent=piezas.length; $('sCat').textContent=grupos.length; $('sTas').textContent=piezas.filter(p=>p.tasado).length;
  $('chips').innerHTML=['Todas',...grupos].map(g=>`<button class="chip${g==='Todas'?' on':''}" data-g="${esc(g)}">${esc(g)}</button>`).join('');
  $('chips').onclick=e=>{const b=e.target.closest('.chip'); if(!b)return; grupo=b.dataset.g; document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b)); render();};
  $('q').oninput=render; $('soloTas').onchange=render;
  const m=piezas.filter(p=>p.tasado).concat(piezas).slice(0,16);
  $('mosaic').innerHTML=m.map(p=>`<img src="images/thumb/${p.fotos[0]}" alt="" loading="lazy">`).join('');
  render(); route();
}).catch(()=>{$('grid').innerHTML='<p class="empty">No se pudo cargar la colección.</p>';});

function render(){
  const q=norm($('q').value.trim()), solo=$('soloTas').checked;
  const list=piezas.filter(p=>(grupo==='Todas'||p.grupo===grupo)&&(!solo||p.tasado)&&
    (!q||norm([p.id,p.nombre,p.categoria,p.origen,p.materiales,p.marcas,p.descripcion].join(' ')).includes(q)));
  $('count').textContent=`${list.length} pieza${list.length===1?'':'s'}`;
  $('grid').innerHTML=list.length?list.map(p=>{
    const cur=p.tasado?p.precios[p.estado_pieza.toLowerCase()]:null;
    return `<article class="card" data-id="${p.id}" tabindex="0">
      <div class="ph"><img src="images/thumb/${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy"></div>
      <div class="bd"><span class="id">${p.id}</span><h3>${esc(p.nombre)}</h3><span class="cat">${esc(p.categoria)}</span>
      ${cur?`<span class="pr">${rango(cur)}</span>`:`<span class="pr pend">Valorización en proceso</span>`}</div></article>`;
  }).join(''):'<p class="empty">No hay piezas que coincidan con tu búsqueda.</p>';
}
$('grid').addEventListener('click',e=>{const c=e.target.closest('.card'); if(c) location.hash=c.dataset.id;});
$('grid').addEventListener('keydown',e=>{if(e.key==='Enter'){const c=e.target.closest('.card'); if(c) location.hash=c.dataset.id;}});

function abrir(p){
  const est=p.tasado?p.estado_pieza.toLowerCase():null;
  const precios=p.tasado?`<div class="prices">${['excelente','bueno','regular'].map(k=>
      `<div class="price${k===est?' cur':''}"><small>${k}</small><b>${rango(p.precios[k])}</b>${k===est?'<em>● Estado de esta pieza</em>':''}</div>`).join('')}</div>`
    :`<div class="pending">Valorización en proceso${p.nota_valor?`<br><small>${esc(p.nota_valor.replace(/^Sin precio: ?/,''))}</small>`:''}</div>`;
  const msg=`Hola, me interesa la pieza ${p.id}: ${p.nombre} del Museo Virtual RetroXplay`;
  $('sheet').innerHTML=`<button class="close" aria-label="Cerrar">×</button>
   <div class="gal"><div class="main"><img id="mImg" src="images/full/${p.fotos[0]}" alt="${esc(p.nombre)}"></div>
     ${p.fotos.length>1?`<div class="thumbs">${p.fotos.map((f,i)=>`<img src="images/thumb/${f}" data-f="${f}" class="${i?'':'on'}" alt="Foto ${i+1}">`).join('')}</div>`:''}</div>
   <div class="info"><span class="eyebrow">${p.id} · ${esc(p.grupo)}</span>
     <h2 id="mTitle">${esc(p.nombre)}</h2>
     <p class="desc">${esc(p.descripcion)}</p>
     <dl class="ficha"><dt>Categoría</dt><dd>${esc(p.categoria)}</dd><dt>Origen / época</dt><dd>${esc(p.origen)}</dd>
       <dt>Materiales</dt><dd>${esc(p.materiales)}</dd><dt>Marcas</dt><dd>${esc(p.marcas)}</dd><dt>Estado</dt><dd>${esc(p.estado)}</dd></dl>
     ${p.factores?`<div class="fact"><strong>Factores de valor:</strong> ${esc(p.factores)}</div>`:''}
     <h3 class="serif" style="margin:0 0 4px;font-size:1.25rem">Precio estimado según estado</h3>
     ${precios}
     <p class="note">Precios referenciales en CLP, estimados a partir de ventas comparables de mercado; no constituyen tasación certificada. <a href="valoracion.html">¿Cómo valoramos?</a></p>
     <a class="btn wa" href="${waLink(msg)}" target="_blank" rel="noopener">Consultar / comprar por WhatsApp</a>
   </div>`;
  $('sheet').querySelector('.close').onclick=cerrar;
  const th=$('sheet').querySelector('.thumbs');
  if(th) th.onclick=e=>{const i=e.target.closest('img'); if(!i)return; $('mImg').src='images/full/'+i.dataset.f; th.querySelectorAll('img').forEach(x=>x.classList.toggle('on',x===i));};
  $('modal').classList.add('open'); document.body.style.overflow='hidden'; $('modal').scrollTop=0;
  document.title=`${p.id} · ${p.nombre} · RetroXplay`;
}
function cerrar(){ if(location.hash) history.pushState('',document.title,location.pathname+location.search); $('modal').classList.remove('open'); document.body.style.overflow=''; document.title='RetroXplay · Museo Virtual de Antigüedades'; }
function route(){ const id=decodeURIComponent(location.hash.slice(1)).toUpperCase(); const p=piezas.find(x=>x.id===id); if(p) abrir(p); else if($('modal').classList.contains('open')){ $('modal').classList.remove('open'); document.body.style.overflow='';} }
window.addEventListener('hashchange',route);
$('modal').addEventListener('click',e=>{if(e.target.id==='modal')cerrar();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('modal').classList.contains('open'))cerrar();});
})();
