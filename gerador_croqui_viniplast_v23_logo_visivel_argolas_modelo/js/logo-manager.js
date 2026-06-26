function zoneLabel(z){
  return {latA:"Lateral A",latB:"Lateral B",topFull:"Topo",baseFull:"Base",topoA:"Topo A",topoB:"Topo B"}[z]||z;
}

function getMainRect(f){
  const area={x:45,y:95,w:735,h:515};
  const ratio=f.w/f.h;
  let dw=area.w,dh=dw/ratio;
  if(dh>area.h){ dh=area.h; dw=dh*ratio; }
  return {x:area.x+(area.w-dw)/2,y:area.y+(area.h-dh)/2,w:dw,h:dh};
}

function getZones(rect, f){
  const sideBand=rect.w*0.20;
  const edgeBand=rect.h*0.18;
  const latReal=Math.max(0.1,(f.h-f.topWidth)/2);
  const zones={
    latA:{x:rect.x,y:rect.y,w:sideBand,h:rect.h,label:"LATERAL A",realW:f.w,realH:latReal,fitW:f.w,fitH:latReal},
    latB:{x:rect.x+rect.w-sideBand,y:rect.y,w:sideBand,h:rect.h,label:"LATERAL B",realW:f.w,realH:latReal,fitW:f.w,fitH:latReal},
    topFull:{x:rect.x,y:rect.y,w:rect.w,h:edgeBand,label:"TOPO",realW:f.w,realH:f.topWidth,fitW:f.topWidth,fitH:f.topWidth},
    baseFull:{x:rect.x,y:rect.y+rect.h-edgeBand,w:rect.w,h:edgeBand,label:"BASE",realW:f.w,realH:f.topWidth,fitW:f.topWidth,fitH:f.topWidth}
  };
  zones.topoA={x:zones.topFull.x,y:zones.topFull.y,w:zones.topFull.w/2,h:zones.topFull.h,label:"LATERAL A",realW:f.w/2,realH:f.topWidth,fitW:f.topWidth,fitH:f.topWidth};
  zones.topoB={x:zones.topFull.x+zones.topFull.w/2,y:zones.topFull.y,w:zones.topFull.w/2,h:zones.topFull.h,label:"LATERAL B",realW:f.w/2,realH:f.topWidth,fitW:f.topWidth,fitH:f.topWidth};
  return zones;
}

function newLogo(zone, name, rotation=0, anchor="bottom", role=""){
  const f=form();
  return {id:Date.now()+Math.floor(Math.random()*100000),zone,name,x:50,y:50,scale:100,rotation,anchor,maxW:f.logoW,maxH:f.logoH,role};
}

function uniformizarTamanhos(){
  if(!logos.length) return;
  const base=selectedLogo()||logos[0];
  logos.forEach(l=>{ l.maxW=base.maxW; l.maxH=base.maxH; l.scale=base.scale; });
  renderAll(false);
}

function gerarPreset(){
  const mode=$("presetMode").value;
  // Posições padrão iguais ao modelo original v23 / CB Agrícola
  // latA=90° (em pé, base na borda esq), topFull=180° (invertido no topo), baseFull=270° (espelho do latA)
  const base=[
    newLogo("latA","Logo - Lateral A",90,"center","latA"),
    newLogo("topFull","Logo - Topo",180,"top","top"),
    newLogo("baseFull","Logo - Base",270,"center","base")
  ];
  if(mode==="4") base.push(newLogo("topFull","Logo - Topo espelhado",0,"bottom","topMirror"));
  logos=base;
  const w=parseFloat($("logoW").value||1200), h=parseFloat($("logoH").value||580);
  logos.forEach(l=>{ l.maxW=w; l.maxH=h; l.scale=100; l.x=50; l.y=50; });
  if(logos.find(l=>l.zone==="topFull")) logos.find(l=>l.zone==="topFull").y=0;
  // Base do logo a 150mm da borda exterior: latA→x=0 (borda esq), baseFull→x=100 (borda dir)
  const _la=logos.find(l=>l.zone==="latA"); if(_la) _la.x=0;
  const _bf=logos.find(l=>l.zone==="baseFull"); if(_bf) _bf.x=100;
  selectedLogoId=logos[0]?.id||null;
  renderAll();
}

function aplicarPosicaoModelo(){
  const mode=$("presetMode").value;
  if(!logos.length) return;
  const sameSize=$("sameSizeDefault").value==="sim";
  const baseW=parseFloat($("logoW").value||1200),baseH=parseFloat($("logoH").value||580);
  logos.forEach(l=>{
    if(sameSize){ l.maxW=baseW; l.maxH=baseH; l.scale=100; }
    l.x=50; l.y=50;
    if(l.zone==="latA"){ l.name="Logo - Lateral A"; l.rotation=90;  l.anchor="center"; l.y=50; l.x=0;   l.role="latA"; }
    else if(l.zone==="latB"){ l.name="Logo - Lateral B"; l.rotation=270; l.anchor="center"; l.y=50; l.x=100; }
    else if(l.zone==="topFull"&&l.role==="topMirror"){ l.name="Logo - Topo espelhado"; l.rotation=0; l.anchor="bottom"; l.y=50; }
    else if(l.zone==="topFull"){ l.name="Logo - Topo"; l.rotation=180; l.anchor="top"; l.y=0; l.role="top"; }
    else if(l.zone==="baseFull"){ l.name="Logo - Base"; l.rotation=270; l.anchor="center"; l.y=50; l.x=100; l.role="base"; }
  });
  if(mode==="3"){
    const order=["latA","top","base"];
    logos=order.map(r=>logos.find(l=>(l.role||l.zone)===r)).filter(Boolean);
    if(!logos.find(l=>l.zone==="baseFull")){
      const nb=newLogo("baseFull","Logo - Base",270,"center","base"); nb.x=100; logos.push(nb);
    }
  } else {
    const order=["latA","top","base","topMirror"];
    logos=order.map(r=>logos.find(l=>(l.role||l.zone)===r)).filter(Boolean);
    if(!logos.find(l=>l.role==="topMirror")){
      const nb=newLogo("topFull","Logo - Topo espelhado",0,"bottom","topMirror"); logos.push(nb);
    }
  }
  selectedLogoId=logos[0]?.id||null;
  renderAll();
}

function addLogo(){
  const l=newLogo("latA","Logo cliente",0,"bottom");
  logos.push(l); selectedLogoId=l.id; renderAll();
}

function clearLogos(){ logos=[]; selectedLogoId=null; renderAll(); }
function selectedLogo(){ return logos.find(l=>l.id===selectedLogoId); }

function refreshLogoList(){
  const box=$("logoList"); box.innerHTML="";
  logos.forEach((l,i)=>{
    const d=document.createElement("div");
    d.className="logo-card"+(l.id===selectedLogoId?" active":"");
    d.innerHTML=`<b>${i+1}. ${l.name}</b><br><span class="hint">${zoneLabel(l.zone)} / X ${l.x}% / Y ${l.y}% / ${Math.round(l.maxW||0)} x ${Math.round(l.maxH||0)} mm / rotação ${l.rotation}°</span>`;
    d.onclick=()=>{ selectedLogoId=l.id; renderAll(); };
    box.appendChild(d);
  });
  const s=selectedLogo();
  $("editLogoBox").style.display=s?"block":"none";
  if(s){
    $("selZone").value=s.zone; $("selNome").value=s.name;
    $("selX").value=s.x; $("selY").value=s.y; $("selScale").value=s.scale;
    $("selRotation").value=s.rotation; $("selAnchor").value=s.anchor;
    $("selMaxW").value=s.maxW; $("selMaxH").value=s.maxH;
  }
}

function syncToposIfNeeded(src){
  if($("linkTopos").value!=="sim") return;
  if(src.zone!=="topoA"&&src.zone!=="topoB") return;
  logos.forEach(l=>{
    if(l.id===src.id) return;
    if(l.zone==="topoA"||l.zone==="topoB"){
      l.scale=src.scale; l.maxW=src.maxW; l.maxH=src.maxH; l.anchor=src.anchor; l.y=src.y;
      if(src.zone==="topoA"&&l.zone==="topoB") l.rotation=180;
      if(src.zone==="topoB"&&l.zone==="topoA") l.rotation=0;
    }
  });
}

function updateSelectedFromInputs(){
  const s=selectedLogo(); if(!s) return;
  s.zone=$("selZone").value; s.name=$("selNome").value;
  s.x=parseFloat($("selX").value||50); s.y=parseFloat($("selY").value||50);
  s.scale=parseFloat($("selScale").value||100); s.rotation=parseInt($("selRotation").value,10);
  s.anchor=$("selAnchor").value;
  s.maxW=parseFloat($("selMaxW").value||1200); s.maxH=parseFloat($("selMaxH").value||580);
  applySizeToAllFromSelected(); syncToposIfNeeded(s); renderAll(false);
}

function centralizarLogo(){ const s=selectedLogo(); if(!s) return; s.x=50; s.y=50; renderAll(); }
function duplicarLogo(){ const s=selectedLogo(); if(!s) return; const c={...s,id:Date.now()+Math.floor(Math.random()*100000),name:s.name+" cópia",x:Math.min(90,s.x+5),y:Math.min(90,s.y+5)}; logos.push(c); selectedLogoId=c.id; renderAll(); }
function removerLogo(){ logos=logos.filter(l=>l.id!==selectedLogoId); selectedLogoId=logos[0]?.id||null; renderAll(); }
