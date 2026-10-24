'use strict';
const book=window.DOTH_BOOK, $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors=['#c5b982','#74b4c3','#88b5ad','#bc9f7a','#b3b78b'];
let activeStage=1,activeKind='tümü',activeIndex=0,mechanicStage=1,mapZoom=1,drawingIndex=0;
const detail=book.detail,plan=book.plan;
function fitViewer(){$('#full-image').style.cssText='width:100%;max-width:100%;max-height:76vh;object-fit:contain';}
let returnFocus=null;$('#viewer').addEventListener('close',()=>returnFocus?.focus());
function imageDialog(s){returnFocus=document.activeElement;$('#full-image').src=s.file;$('#full-image').alt=s.title;$('#full-title').textContent=s.id+' · '+s.title;fitViewer();$('#viewer').showModal();}
$('#fit-viewer').onclick=fitViewer;$('#actual-viewer').onclick=()=>{$('#full-image').style.cssText='width:'+$('#full-image').naturalWidth+'px;max-width:none;max-height:none';};
$('#close-viewer').onclick=()=>$('#viewer').close();
$('#viewer').onclick=e=>{if(e.target===$('#viewer'))$('#viewer').close();};
$('#route-copy').textContent=detail.route;$('#materials-copy').textContent=detail.materials;$('#story-boundary').textContent=detail.storyBoundary;
$('#cover-open').onclick=()=>imageDialog(book.shots.find(s=>s.id==='T01'));
$('#drawing-tabs').innerHTML=book.sheets.map((s,i)=>'<button data-drawing="'+i+'" aria-pressed="'+(i===0)+'"><span class="choice-number">0'+(i+1)+'</span><span>'+esc(s.title)+'</span><span class="choice-action" aria-hidden="true"></span></button>').join('');
document.querySelectorAll('[data-drawing]').forEach(b=>b.onclick=()=>{drawingIndex=Number(b.dataset.drawing);renderDrawing();});
function renderDrawing(){const s=book.sheets[drawingIndex];$('#drawing-image').src=s.png;$('#drawing-image').alt=s.title;$('#drawing-title').textContent=s.title;$('#drawing-summary').textContent=s.summary;$('#drawing-svg').href=s.file;$('#open-drawing').onclick=()=>imageDialog({file:s.png,title:s.title,id:s.id});document.querySelectorAll('[data-drawing]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.drawing)===drawingIndex)));}
$('#stages').innerHTML=plan.mainRoute.map(s=>{const shot=book.shots.find(p=>p.stage===s.id&&p.category==='mimari');const count=book.shots.filter(p=>p.stage===s.id).length;return '<button data-stage="'+s.id+'" aria-pressed="'+(s.id===1)+'"><span class="stage-photo"><img src="'+shot.file+'" alt="" loading="lazy"><span class="stage-no">0'+s.id+'</span></span><span class="stage-card-copy"><strong>'+esc(s.name)+'</strong><span class="stage-card-meta">'+count+' görsel · '+s.lengthMeters.toLocaleString('tr-TR')+' m taslak</span><span class="stage-card-action" aria-hidden="true"></span></span></button>';}).join('');
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>selectStage(Number(b.dataset.stage)));
$('#filters').innerHTML=['tümü','mimari','oynanış','mekanik'].map(k=>'<button data-kind="'+k+'" aria-pressed="'+(k==='tümü')+'">'+k[0].toUpperCase()+k.slice(1)+'</button>').join('');
document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{activeKind=b.dataset.kind;activeIndex=0;renderAtlas();});
function selectStage(n){activeStage=n;activeIndex=0;renderAtlas();}
function filtered(){return book.shots.filter(s=>s.stage===activeStage&&s.file&&(activeKind==='tümü'||s.category===activeKind));}
function renderAtlas(){
 if(!filtered().length){activeKind='tümü';activeIndex=0;}
 const p=detail.profiles.find(x=>x.id===activeStage);
 $('#active-stage-label').textContent='0'+activeStage+' / '+plan.mainRoute[activeStage-1].name;
 $('#stage-copy').innerHTML='<div class="stage-intro"><span class="eyebrow">0'+activeStage+' / '+esc(p.hook)+'</span><h3>'+esc(plan.mainRoute[activeStage-1].name)+'</h3><p>'+esc(p.shape)+'</p></div><div><span class="label">OYUNCU NE YAPAR?</span><p>'+esc(p.action)+'</p></div><div><span class="label">MEKÂNIN İŞLEVİ</span><p>'+esc(p.meaning)+'</p></div><div><span class="label">GÖRSEL / KORKU FARKI</span><p>'+esc(p.variation)+'</p></div><div><span class="label">DÖNÜŞ VE HATA</span><p>'+esc(p.failure)+'</p></div>';
 document.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===activeStage)));
 document.querySelectorAll('[data-kind]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.kind===activeKind));const amount=book.shots.filter(s=>s.stage===activeStage&&(b.dataset.kind==='tümü'||s.category===b.dataset.kind)).length;b.innerHTML=esc(b.dataset.kind[0].toUpperCase()+b.dataset.kind.slice(1))+'<span class="filter-count">'+amount+'</span>';b.disabled=b.dataset.kind!=='tümü'&&!book.shots.some(s=>s.stage===activeStage&&s.file&&s.category===b.dataset.kind);});
 const list=filtered();activeIndex=(activeIndex+list.length)%list.length;
 $('#thumbs').innerHTML=list.map((s,i)=>'<button data-thumb="'+i+'" aria-current="'+(i===activeIndex)+'" aria-label="'+esc(s.title)+'"><img loading="lazy" src="'+esc(s.file)+'" alt=""><span>'+s.id+' / '+esc(s.title)+'</span></button>').join('');
 document.querySelectorAll('[data-thumb]').forEach(b=>b.onclick=()=>{activeIndex=Number(b.dataset.thumb);renderShot();});
 renderShot();
}
function renderShot(){
 const list=filtered(),s=list[activeIndex];if(!s)return;
 $('#hero-image').src=s.file;$('#hero-image').alt=s.title;$('#shot-kind').textContent=s.id+' / '+s.category;$('#shot-title').textContent=s.title;$('#shot-copy').textContent=s.review?.observed||'Tasarım önerisi.';$('#shot-limit').textContent=s.review?.limits||'Gerçek motor ve materyal testi değil.';$('#counter').textContent=(activeIndex+1)+' / '+list.length;$('#image-link').href=s.file;
 document.querySelectorAll('[data-thumb]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.thumb)===activeIndex)));
 $('#open-image').onclick=()=>imageDialog(s);
}
function step(n){const list=filtered();activeIndex=(activeIndex+n+list.length)%list.length;renderShot();}
$('#prev').onclick=()=>step(-1);$('#next').onclick=()=>step(1);
document.addEventListener('keydown',e=>{if($('#viewer').open)return;if(e.target.closest('#stages,#filters,#drawing-tabs,#mechanic-tabs'))return;if(['INPUT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){step(1);}if(e.key==='ArrowLeft'){step(-1);}});
$('#plan-stages').innerHTML=plan.mainRoute.map(s=>'<div class="plan-row"><span>0'+s.id+'</span><p>'+esc(s.name)+'</p><small>'+s.lengthMeters.toLocaleString('tr-TR')+'m</small></div>').join('');
const svgStart=(vb,lab)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'" role="img" aria-label="'+esc(lab)+'">';
function drawMap(){
 let svg=svgStart('-2 -6 104 112','Beş aşamalı ölçülü yeraltı rota önerisi');
 svg+='<defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#363e33" stroke-width=".18"/></pattern></defs><rect x="0" y="0" width="100" height="100" fill="url(#grid)"/>';
 svg+='<rect x="55" y="28.5" width="8" height="5" fill="#294a51" stroke="#74b4c3" stroke-width=".35"/><ellipse cx="57" cy="82" rx="9" ry="6" fill="#3f3c30" stroke="#bc9f7a" stroke-width=".3"/><rect x="14" y="72" width="8" height="10" fill="#3b4130" stroke="#b3b78b" stroke-width=".3"/><rect x="6" y="82" width="6" height="6" fill="#3b4130" stroke="#b3b78b" stroke-width=".3"/>';
 svg+='<g id="shortcut-lines" opacity="'+($('#shortcuts').checked?1:0)+'">';
 for(const b of plan.branches){const short=b.kind==='later-shortcut';svg+='<polyline points="'+b.points.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="'+(short?'#d3cb9c':'#7c8870')+'" stroke-width="'+(short?1.1:.8)+'" stroke-dasharray="'+(short?'2 1.5':'1 1')+'"/>';if(short){const p=b.points[Math.floor(b.points.length/2)];svg+='<text x="'+(p[0]+2)+'" y="'+(p[1]-2)+'" fill="#d3cb9c" font-size="2.4">'+b.id+'</text>';}}
 svg+='</g>';
 for(const r of plan.mainRoute){svg+='<polyline points="'+r.points.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#080b08" stroke-width="3.4" stroke-linejoin="round"/><polyline points="'+r.points.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="'+colors[r.id-1]+'" stroke-width="1.6" stroke-linejoin="round"/>';}
 svg+='<path d="M83 57L79 63M85 77.5L80 83.5" fill="none" stroke="#c4e8e9" stroke-width="2.8" stroke-dasharray=".8 .7"/>';
 const markers=[[1,12,4,4,1],[2,59,31,52,22],[3,84,55,88,49],[4,57,77,55,70],[5,9,85,5,94]];
 for(const [n,x,y,tx,ty]of markers){svg+='<g class="map-stage" data-map-stage="'+n+'" role="button" tabindex="0" aria-label="'+esc(plan.mainRoute[n-1].name)+'"><circle cx="'+x+'" cy="'+y+'" r="2.6" fill="'+colors[n-1]+'" stroke="#121612" stroke-width=".4"/><text x="'+x+'" y="'+(y+1)+'" text-anchor="middle" font-size="2.7" fill="#121612" font-weight="600">'+n+'</text><text x="'+tx+'" y="'+ty+'" font-size="2.5" fill="'+colors[n-1]+'">'+esc(plan.mainRoute[n-1].name)+'</text></g>';}
 svg+='<text x="1" y="-2" font-size="2.4" fill="#a9aca0">BODRUM → GİRİŞ</text><path d="M76 101H96M76 100V102M86 100V102M96 100V102" stroke="#a9aca0" stroke-width=".3"/><text x="76" y="105" font-size="2.1" fill="#a9aca0">0</text><text x="84" y="105" font-size="2.1" fill="#a9aca0">10</text><text x="93" y="105" font-size="2.1" fill="#a9aca0">20m</text></svg>';
 $('#map-wrap').innerHTML=svg;
 document.querySelectorAll('[data-map-stage]').forEach(b=>{const go=()=>{selectStage(Number(b.dataset.mapStage));$('#atlas').scrollIntoView();};b.onclick=go;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});applyMapZoom();
}
function applyMapZoom(){const w=104/mapZoom,h=112/mapZoom;$('#map-wrap svg').setAttribute('viewBox',(50-w/2)+' '+(50-h/2)+' '+w+' '+h);}
$('#zoom-in').onclick=()=>{mapZoom=Math.min(2,mapZoom+.25);applyMapZoom();};$('#zoom-out').onclick=()=>{mapZoom=Math.max(1,mapZoom-.25);applyMapZoom();};$('#zoom-reset').onclick=()=>{mapZoom=1;applyMapZoom();};$('#shortcuts').onchange=drawMap;
function drawLongSection(){
 let s=svgStart('0 0 1100 290','Ana rota boyunca göreli kotlar, doğal su ve kuru sırt');
 const xs=[40,175,390,610,835,1040],ys=[46,99,99,156,156,232];
 for(let k=0;k<5;k++){s+='<rect x="'+xs[k]+'" y="20" width="'+(xs[k+1]-xs[k])+'" height="238" fill="'+colors[k]+'" opacity=".05"/><text x="'+(xs[k]+12)+'" y="35" font-size="13" fill="'+colors[k]+'">0'+(k+1)+' · '+esc(plan.mainRoute[k].name)+'</text>';}
 s+='<path d="M40 60L175 113L217 113L240 140L325 140L348 114L390 114L430 210L555 210L610 170L835 170L940 240L1040 240" fill="none" stroke="#cecab8" stroke-width="4" stroke-linejoin="round"/><path d="M240 116H325M430 180H575M962 245H1004" stroke="#78b6c5" stroke-width="5"/>';
 const t=[[44,83,'0m'],[160,140,'−5,3m giriş'],[260,168,'−8m hazne tabanı'],[331,91,'−5,4m çıkış'],[442,166,'−12m su'],[446,235,'−15m taban'],[644,193,'−11m kuru sırt'],[912,268,'−18m adyton']];
 for(const[x,y,l]of t)s+='<text x="'+x+'" y="'+y+'" font-size="12" fill="#c6c9bc">'+l+'</text>';
 s+='<path d="M222 105Q475 40 675 158M1020 235Q954 97 740 155" fill="none" stroke="#c7c28d" stroke-width="1.5" stroke-dasharray="6 5"/><text x="455" y="74" font-size="12" fill="#c7c28d">K1 · kuru yükselen dönüş</text><text x="850" y="110" font-size="12" fill="#c7c28d">K2 · kuru dönüş</text><text x="40" y="279" font-size="11" fill="#9ba28f">Yatay açıklıklar gösterim içindir; gerçek metraj kuşbakışı plandadır. Su hacimleri kuru sırt üzerinden birbirine akmaz.</text></svg>';
 $('#long-section').innerHTML=s;
}
const mechNotes=[
"Önce temas ve küçük işaret, sonra dönüş açısından aynı sabit köşeyi tanıma. Serbest el yazısı veya uzun çizim animasyonu varsayılmadı.",
"Düşük su: çıkış yüksek. Besleme/tahliye değişimi: seviye yükselir. Yüksek su: giriş kuru kalırken karşı eşik erişilir.",
"Soldaki hava cebinde hazırlan; sualtındaki bağlantıda nefes tut; sağdaki gerçek hava cebinde yeniden nefes al. Gösterilen beden pozu çalışan Elias animasyonu değil.",
"Aynı köşe ve aynı kaya omzu. Değişen tebeşirin yönü. Dönüş bağı uzun yolu kısa bağa çevirir; mimari ışınlanmaz.",
"Aday etkileşim. Işığı sabit bırak, kapağı bitişik düz desteğe iki elle kaydır, sonra feneri al. Kuyunun hikâyesel sonucu seçilmedi."
];
$('#mechanic-tabs').innerHTML=plan.mainRoute.filter(r=>book.shots.some(s=>s.stage===r.id&&s.file&&s.category==='mekanik')).map(s=>'<button data-mechanic="'+s.id+'" aria-pressed="'+(s.id===1)+'"><span class="choice-number">0'+s.id+'</span><span>'+esc(s.name)+'</span><span class="choice-action" aria-hidden="true"></span></button>').join('');
document.querySelectorAll('[data-mechanic]').forEach(b=>b.onclick=()=>{mechanicStage=Number(b.dataset.mechanic);renderMechanics();});
function renderMechanics(){
 const list=book.shots.filter(s=>s.stage===mechanicStage&&s.category==='mekanik'&&s.file);
 $('#mechanic-cards').innerHTML=list.map((s,i)=>'<figure><button data-mechanic-image="'+s.id+'"><img src="'+s.file+'" alt="'+esc(s.title)+'" loading="lazy"></button><figcaption><strong>0'+(i+1)+' / '+esc(s.title)+'</strong>'+esc(s.review?.observed||'')+'</figcaption></figure>').join('');
 $('#mechanic-note').textContent=mechNotes[mechanicStage-1];
 document.querySelectorAll('[data-mechanic]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mechanic)===mechanicStage)));
 document.querySelectorAll('[data-mechanic-image]').forEach(b=>b.onclick=()=>imageDialog(book.shots.find(s=>s.id===b.dataset.mechanicImage)));
}
function drawWater(){
 const v=Number($('#water-level').value)/100,level=-6.6+v,y=260-(level+8)*42,entry=260-2.7*42,exit=260-2.6*42;
 $('#water-value').textContent=level.toLocaleString('tr-TR',{minimumFractionDigits:1,maximumFractionDigits:1})+'m';
 const gap=-5.4-level;
 $('#water-state').textContent=v>.9?'Su karşı eşikten yaklaşık20–30cm aşağıda. Giriş sahanlığı kuru. Çıkış adımı ve animasyonu gerçek karakterle doğrulanacak.':'Su ile karşı eşik arasında '+gap.toLocaleString('tr-TR',{maximumFractionDigits:1})+'m var. Çıkışa erişim için seviye yükselmeli; yanlardan yürüyüş yolu yok.';
 let s=svgStart('0 0 660 300','Haznenin düşük/yüksek su ve güvenli eşik kesiti');
 s+='<path d="M24 280V'+entry+'H100V260H560V'+exit+'H634V280Z" fill="#59604f" stroke="#b3bda6" stroke-width="2"/><path d="M24 '+entry+'V50H634V'+exit+'" fill="none" stroke="#77826b" stroke-width="16"/><rect x="100" y="'+y+'" width="460" height="'+(260-y)+'" fill="#5e9da6" opacity=".5"/><path d="M100 '+y+'H560" stroke="#9dd7de" stroke-width="2"/><path d="M30 92H120V'+y+'" fill="none" stroke="#6cb5bf" stroke-width="7"/>';
 const labels=[[28,entry-12,'GİRİŞ −5,3m'],[480,exit-12,'ÇIKIŞ −5,4m'],[220,295,'TABAN −8m'],[235,y-10,'SU '+level.toLocaleString('tr-TR',{maximumFractionDigits:1})+'m']];
 for(const[x,yy,l]of labels)s+='<text x="'+x+'" y="'+yy+'" fill="#d8e2d3" font-size="12">'+l+'</text>';
 s+='<text x="188" y="31" fill="#a9aca0" font-size="11">Kapalı kaya tavanı, açık kapı başları</text></svg>';$('#water-section').innerHTML=s;
}
$('#water-level').oninput=drawWater;$('#water-notes').innerHTML=detail.waterNotes.map(t=>'<li>'+esc(t)+'</li>').join('');
$('#asset-refs').innerHTML=book.refs.map(r=>'<article><h3>'+esc(r.name)+'</h3><p>'+esc(r.role)+'</p>'+(r.url?'<a href="'+r.url+'" target="_blank" rel="noopener noreferrer">Ürün sayfası ↗</a>':'')+'</article>').join('');
$('#production').innerHTML=detail.production.map(p=>'<article><h3>'+esc(p.mechanic)+'</h3><span class="label">DAYANAK</span><p>'+esc(p.available)+'</p><span class="label">YAPILACAK İŞ</span><p>'+esc(p.work)+'</p><p>'+esc(p.limit)+'</p></article>').join('');
$('#gates').innerHTML=detail.gates.map(t=>'<li>'+esc(t)+'</li>').join('');
$('#history').innerHTML=detail.history.map(h=>'<article><h3>'+esc(h.name)+'</h3><p>'+esc(h.supports)+'</p><p>'+esc(h.caution)+'</p><a href="'+h.url+'" target="_blank" rel="noreferrer">Birincil kaynak ↗</a></article>').join('');
renderDrawing();renderAtlas();drawMap();$('#long-section').innerHTML='<a href="D01.svg"><img src="D01.svg" alt="Bütün hattın kot ve su kesiti" style="width:100%;height:auto;display:block"></a>';renderMechanics();drawWater();

for(const group of ['#stages','#filters','#drawing-tabs','#mechanic-tabs']){
 $(group).addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)||!e.target.matches('button'))return;
  const buttons=[...$(group).querySelectorAll('button:not(:disabled)')];let index=buttons.indexOf(e.target);
  if(e.key==='Home')index=0;else if(e.key==='End')index=buttons.length-1;else index=(index+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length;
  e.preventDefault();e.stopPropagation();buttons[index].focus();buttons[index].click();
 });
}
