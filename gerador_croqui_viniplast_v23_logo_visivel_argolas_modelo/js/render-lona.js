// Página 2+ — Croqui na Lona (somente a lona, sem decorações)
// Layout rotacionado 90°: faixas VERTICAIS (LatA | Topo | Base)
// Eixo horizontal = altura do material (f.h); eixo vertical = comprimento (f.w)

// kForce — fator pré-calculado (opcional; se omitido, cada logo calcula seu próprio k)
function lonaPct(value,fallback=50){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
}

function getLonaLayout(f){
  const W=595,H=842;
  const latH=(f.h-f.topWidth)/2;
  const availX=52, availY=55, availW=W-availX-18, availH=H-availY-22;
  const sc=Math.min(availW/Math.max(0.01,f.h), availH/Math.max(0.01,f.w));
  const tW=f.h*sc;
  const tH=f.w*sc;
  const tX=availX+(availW-tW)/2;
  const tY=availY+(availH-tH)/2;
  const latHpx=latH*sc;
  const topHpx=f.topWidth*sc;
  const zoneLatA={ x:tX,               y:tY, w:latHpx, h:tH };
  const zoneTopo= { x:tX+latHpx,       y:tY, w:topHpx, h:tH };
  const zoneLatB={ x:tX+latHpx+topHpx, y:tY, w:latHpx, h:tH };
  const zones={latA:zoneLatA,topFull:zoneTopo,topoA:zoneTopo,topoB:zoneTopo,baseFull:zoneLatB,latB:zoneLatB};
  return {W,H,latH,sc,tX,tY,tW,tH,latHpx,topHpx,zoneLatA,zoneTopo,zoneLatB,zones};
}

function getLonaZoneForLogo(logo, f){
  const layout=getLonaLayout(f);
  return layout.zones[logo.zone]||layout.zoneTopo;
}

function getLonaLogoMetrics(rect, logo, f, sc, kForce){
  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const safeW=Math.max(10,rect.w-2*padPx);
  const safeH=Math.max(10,rect.h-2*padPx);
  const scaleFactor=(logo.scale||100)/100;
  const rot=((logo.rotation||0)%360+360)%360;
  const swap=rot===90||rot===270;
  let dW=(logo.maxW||1200)/1000*sc*scaleFactor;
  let dH=(logo.maxH||580)/1000*sc*scaleFactor;
  const effW=swap?dH:dW, effH=swap?dW:dH;
  const k=kForce!==undefined ? kForce : 1;
  dW*=k; dH*=k;
  const visW=swap?dH:dW;
  const visH=swap?dW:dH;
  const safeLeft=rect.x+padPx;
  const safeRight=rect.x+rect.w-padPx;
  const safeTop=rect.y+padPx;
  const safeBottom=rect.y+rect.h-padPx;
  const minCX=safeLeft+visW/2;
  const maxCX=safeRight-visW/2;
  const xPct=lonaPct(logo.x);
  const cx=maxCX>minCX
    ? Math.max(minCX,Math.min(maxCX,minCX+(xPct/100)*(maxCX-minCX)))
    : (safeLeft+safeRight)/2;
  const anchor=logo.anchor||"bottom";
  const minCY=safeTop+visH/2;
  const maxCY=safeBottom-visH/2;
  let cy;
  if(anchor==="bottom") cy=rect.y+rect.h-padPx-visH/2;
  else if(anchor==="top") cy=rect.y+padPx+visH/2;
  else {
    const yPct=lonaPct(logo.y);
    cy=maxCY>minCY
      ? Math.max(minCY,Math.min(maxCY,minCY+(yPct/100)*(maxCY-minCY)))
      : (safeTop+safeBottom)/2;
  }
  cy=Math.max(minCY,Math.min(maxCY,cy));
  return {padPx,safeW,safeH,scaleFactor,rot,swap,dW,dH,effW,effH,k,visW,visH,safeLeft,safeRight,safeTop,safeBottom,minCX,maxCX,minCY,maxCY,cx,cy};
}

function drawLonaLogoZone(g, rect, logoList, f, ink, sc, ldUrl, kForce, enableDrag=false){
  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const safeW=Math.max(10,rect.w-2*padPx);
  const safeH=Math.max(10,rect.h-2*padPx);
  const pct=(value,fallback=50)=>{
    const n=Number(value);
    return Number.isFinite(n)?n:fallback;
  };
  logoList.forEach(logo=>{
    const scaleFactor=(logo.scale||100)/100;
    const rot=((logo.rotation||0)%360+360)%360;
    const swap=rot===90||rot===270;
    let dW=(logo.maxW||1200)/1000*sc*scaleFactor;
    let dH=(logo.maxH||580)/1000*sc*scaleFactor;
    const effW=swap?dH:dW, effH=swap?dW:dH;
    const k=kForce!==undefined ? kForce : 1;
    dW*=k; dH*=k;
    const visW=swap?dH:dW;
    const visH=swap?dW:dH;
    const safeLeft=rect.x+padPx;
    const safeRight=rect.x+rect.w-padPx;
    const safeTop=rect.y+padPx;
    const safeBottom=rect.y+rect.h-padPx;
    const minCX=safeLeft+visW/2;
    const maxCX=safeRight-visW/2;
    const xPct=pct(logo.x);
    const cx=maxCX>minCX
      ? Math.max(minCX,Math.min(maxCX,minCX+(xPct/100)*(maxCX-minCX)))
      : (safeLeft+safeRight)/2;
    const anchor=logo.anchor||"bottom";
    const minCY=safeTop+visH/2;
    const maxCY=safeBottom-visH/2;
    let cy;
    if(anchor==="bottom") cy=rect.y+rect.h-padPx-visH/2;
    else if(anchor==="top") cy=rect.y+padPx+visH/2;
    else {
      const yPct=pct(logo.y);
      cy=maxCY>minCY
      ? Math.max(minCY,Math.min(maxCY,minCY+(yPct/100)*(maxCY-minCY)))
      : (safeTop+safeBottom)/2;
    }
    cy=Math.max(minCY, Math.min(maxCY, cy));
    const grp=el("g",{class:enableDrag?"drag lona-drag":"lona-logo","data-id":logo.id},g);
    if(enableDrag&&typeof startLonaDrag==="function"){
      grp.addEventListener("mousedown",startLonaDrag);
      grp.addEventListener("touchstart",startLonaDragTouch,{passive:false});
      grp.onclick=(e)=>{ selectedLogoId=logo.id; e.stopPropagation(); renderAll(); };
    }
    const inner=el("g",{transform:`translate(${cx} ${cy}) rotate(${rot}) translate(${-dW/2} ${-dH/2})`},grp);
    if($("logoModo").value!=="placeholder"&&ldUrl){
      el("image",{href:ldUrl,x:0,y:0,width:dW,height:dH,preserveAspectRatio:"none"},inner);
    } else {
      el("rect",{x:0,y:0,width:dW,height:dH,rx:5,fill:"none",stroke:ink,"stroke-width":2.5,"stroke-dasharray":"7 5"},inner);
      text(inner,"LOGO",dW/2,dH/2+5,Math.min(dW,dH)*0.18,"700","middle",ink);
    }
    if(enableDrag&&selectedLogoId===logo.id&&showGuides()){
      el("rect",{x:cx-visW/2-5,y:cy-visH/2-5,width:visW+10,height:visH+10,fill:"none",stroke:"#d10000","stroke-width":1.6,"stroke-dasharray":"5 4",class:"selectedBox"},grp);
    }
  });
}

// Logo parceiro posicionado à DIREITA do logo principal ao longo do comprimento
// (= abaixo no SVG rotacionado), no mesmo eixo X (mesma distância da borda).
// Aparece apenas em latA e latB/baseFull — NÃO no topo.
// logoList — logos do mesmo zone (para calcular a posição do logo principal)
function drawPartnerLogoBase(g, rect, logoList, f, sc, partnerUrl, ink){
  const isPlaceholder=$("footerLogoModo")?.value==="placeholder";
  if(!partnerUrl&&!isPlaceholder) return;
  if(!logoList.length) return;

  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const safeLeft=rect.x+padPx, safeRight=rect.x+rect.w-padPx;
  const safeTop=rect.y+padPx,  safeBottom=rect.y+rect.h-padPx;
  const pct=(value,fallback=50)=>{
    const n=Number(value);
    return Number.isFinite(n)?n:fallback;
  };

  // ── Calcular posição do logo principal (k=1 — tamanho definido, sem redução) ─
  const ml=logoList[0];
  const sf=(ml.scale||100)/100;
  const rot=((ml.rotation||0)%360+360)%360;
  const swap=rot===90||rot===270;
  const mdW=(ml.maxW||1200)/1000*sc*sf;
  const mdH=(ml.maxH||580)/1000*sc*sf;
  const mVisW=swap?mdH:mdW, mVisH=swap?mdW:mdH;
  const minCX=safeLeft+mVisW/2, maxCX=safeRight-mVisW/2;
  const mlXPct=pct(ml.x);
  const mcx=maxCX>minCX
    ? Math.max(minCX,Math.min(maxCX,minCX+(mlXPct/100)*(maxCX-minCX)))
    : (safeLeft+safeRight)/2;
  const minCY=safeTop+mVisH/2, maxCY=safeBottom-mVisH/2;
  const anchor=ml.anchor||"bottom";
  let mcy;
  if(anchor==="bottom") mcy=safeBottom-mVisH/2;
  else if(anchor==="top") mcy=safeTop+mVisH/2;
  else {
    const mlYPct=pct(ml.y);
    mcy=maxCY>minCY?Math.max(minCY,Math.min(maxCY,minCY+(mlYPct/100)*(maxCY-minCY))):(safeTop+safeBottom)/2;
  }
  mcy=Math.max(minCY,Math.min(maxCY,mcy));

  // ── Posicionar logo parceiro ─────────────────────────────────────────────────
  // gap mm à direita (abaixo no SVG) a partir do final do logo principal,
  // mantendo a base do parceiro alinhada com a base do logo do cliente.
  const pW=(f.footerLogoW||320)/1000*sc;
  const pH=(f.footerLogoH||160)/1000*sc;
  const gap=((f.footerLogoDistBase||1500)/1000)*sc;
  const offsetX=((f.footerLogoOffsetX||0)/1000)*sc;

  const rotRad=rot*Math.PI/180;
  const ux=Math.cos(rotRad), uy=Math.sin(rotRad);
  const vx=-Math.sin(rotRad), vy=Math.cos(rotRad);
  const localX=mdW/2+gap+pW/2;
  const localY=(mdH-pH)/2+offsetX;
  let cx=mcx+ux*localX+vx*localY;
  let cy=mcy+uy*localX+vy*localY;
  const pVisW=swap?pH:pW;
  const pVisH=swap?pW:pH;
  cx=Math.max(safeLeft+pVisW/2,Math.min(safeRight-pVisW/2,cx));
  cy=Math.max(safeTop+pVisH/2,Math.min(safeBottom-pVisH/2,cy));

  const partnerDx=cx-mcx;
  const partnerDy=cy-mcy;
  const partnerLocalX=partnerDx*ux+partnerDy*uy;
  const gapStart=mdW/2;
  const gapEnd=partnerLocalX-pW/2;
  if(gapEnd>gapStart+2){
    const actualGapMm=Math.round(((gapEnd-gapStart)/sc)*1000);
    const dimY=mdH/2;
    const dim=el("g",{class:"partner-distance",transform:`translate(${mcx} ${mcy}) rotate(${rot})`},g);
    el("line",{x1:gapStart,y1:dimY,x2:gapEnd,y2:dimY,stroke:ink,"stroke-width":0.8},dim);
    el("line",{x1:gapStart,y1:dimY-4,x2:gapStart,y2:dimY+4,stroke:ink,"stroke-width":0.8},dim);
    el("line",{x1:gapEnd,y1:dimY-4,x2:gapEnd,y2:dimY+4,stroke:ink,"stroke-width":0.8},dim);
    text(dim,`${actualGapMm}mm`,(gapStart+gapEnd)/2,dimY-3,6.8,"700","middle",ink);
  }

  const inner=el("g",{transform:`translate(${cx} ${cy}) rotate(${rot}) translate(${-pW/2} ${-pH/2})`},g);
  if(partnerUrl&&!isPlaceholder){
    el("image",{href:partnerUrl,x:0,y:0,width:pW,height:pH,preserveAspectRatio:"xMidYMid meet"},inner);
  } else {
    el("rect",{x:0,y:0,width:pW,height:pH,rx:4,fill:"none",stroke:ink,"stroke-width":1.6,"stroke-dasharray":"5 4"},inner);
    text(inner,"PARCEIRO",pW/2,pH/2+4,Math.min(pW,pH)*0.18,"700","middle",ink);
  }
}

// svgEl          — elemento SVG alvo (null = usa #mockup)
// corOverride    — cor da lona para variações (null = usa corLona do form)
// logoDataUrl    — imagem do logo já processada para esta variação (null = usa processedImageData)
// logosOverride  — array de logos com posições sobrescritas para variações
// partnerLogoDataUrl — imagem do logo parceiro para esta variação (undefined = usa footerLogoData)
function drawLonaFinish(g, rect, f, ink, sc, seamPx){
  if(f.acabamento==="especial") return;
  const stepX=Math.max(6,(f.distTopo/100)*sc);
  const stepY=Math.max(6,(f.distLateral/100)*sc);
  const right=rect.x+rect.w;
  const bottom=rect.y+rect.h;
  function finishPositions(start,end,step,minGap){
    const vals=[start];
    for(let p=start+step;p<end;p+=step){
      if(end-p<minGap) continue;
      if(p-vals[vals.length-1]>=minGap) vals.push(p);
    }
    if(end-vals[vals.length-1]<minGap&&vals.length>1) vals.pop();
    if(end!==start) vals.push(end);
    return vals;
  }

  if(f.acabamento==="ilhoses"){
    const r=Math.max(1.7,Math.min(3.2,seamPx*0.72));
    const inset=Math.max(1.8,seamPx*0.55);
    const minGap=r*2.8;
    const xs=finishPositions(rect.x,right,stepX,minGap);
    const ys=finishPositions(rect.y,bottom,stepY,minGap).filter(y=>y-rect.y>=minGap&&bottom-y>=minGap);
    function hole(cx,cy){
      el("circle",{cx,cy,r,fill:"#f9f9f9",stroke:"#1a1a1a","stroke-width":0.75,opacity:0.92},g);
      el("circle",{cx,cy,r:r*0.45,fill:"#d9d9d9",stroke:"none",opacity:0.7},g);
    }
    xs.forEach(px=>{
      hole(px,rect.y+inset);
      hole(px,bottom-inset);
    });
    ys.forEach(py=>{
      hole(rect.x+inset,py);
      hole(right-inset,py);
    });
    return;
  }

  const r=Math.max(1.4,(50/2/1000)*sc);
  const out=Math.max(1.1,(8/1000)*sc);
  const strapLen=Math.max(1.2,(16/1000)*sc);
  const minGap=Math.max(r*2.4,strapLen*2);
  const xs=finishPositions(rect.x,right,stepX,minGap);
  const ys=finishPositions(rect.y,bottom,stepY,minGap).filter(y=>y-rect.y>=minGap&&bottom-y>=minGap);
  function halfRing(path){
    el("path",{d:path,fill:"none",stroke:"#171717","stroke-width":0.9,"stroke-linecap":"round","stroke-linejoin":"round"},g);
  }
  function strap(x1,y1,x2,y2){
    el("line",{x1,y1,x2,y2,stroke:"#171717","stroke-width":0.85,"stroke-linecap":"round"},g);
  }
  xs.forEach(px=>{
    strap(px,rect.y,px,rect.y-strapLen);
    strap(px,bottom,px,bottom+strapLen);
    halfRing(`M ${px-r} ${rect.y-out} Q ${px} ${rect.y-out-r} ${px+r} ${rect.y-out}`);
    halfRing(`M ${px-r} ${bottom+out} Q ${px} ${bottom+out+r} ${px+r} ${bottom+out}`);
  });
  ys.forEach(py=>{
    strap(rect.x,py,rect.x-strapLen,py);
    strap(right,py,right+strapLen,py);
    halfRing(`M ${rect.x-out} ${py-r} Q ${rect.x-out-r} ${py} ${rect.x-out} ${py+r}`);
    halfRing(`M ${right+out} ${py-r} Q ${right+out+r} ${py} ${right+out} ${py+r}`);
  });
}

function renderLona(svgEl, corOverride, logoDataUrl, logosOverride, partnerLogoDataUrl, options){
  const f=Object.assign({}, form(), (options&&options.form)||{});
  const svg=svgEl||$("mockup"); if(!svg) return;
  svg.innerHTML="";
  const W=595,H=842;
  const corEff=corOverride||f.cor;
  const ldUrl=logoDataUrl||processedImageData;
  const logosEff=logosOverride||logos;
  const partnerData=(partnerLogoDataUrl!==undefined)?partnerLogoDataUrl:footerLogoData;
  const enableLogoDrag=(!svgEl||svg.id==="mockup")&&!logosOverride;

  // Fundo branco
  el("rect",{x:0,y:0,width:W,height:H,fill:"#ffffff"},svg);

  // === Área da lona ===
  // Margens: esq=52 (cotas), dir=18, topo=55 (cotas duplas), rodapé=22 (info)
  const latH=(f.h-f.topWidth)/2;
  const availX=52, availY=55, availW=W-availX-18, availH=H-availY-22;
  const sc=Math.min(availW/Math.max(0.01,f.h), availH/Math.max(0.01,f.w));
  const tW=f.h*sc;
  const tH=f.w*sc;
  const tX=availX+(availW-tW)/2;
  const tY=availY+(availH-tH)/2;

  const latHpx=latH*sc;
  const topHpx=f.topWidth*sc;

  const zoneLatA={ x:tX,               y:tY, w:latHpx, h:tH };
  const zoneTopo= { x:tX+latHpx,       y:tY, w:topHpx, h:tH };
  const zoneLatB={ x:tX+latHpx+topHpx, y:tY, w:latHpx, h:tH };

  const lonaCor=codeColor(corEff);
  const ink=autoInk(corEff);

  // Lona
  el("rect",{x:tX,y:tY,width:tW,height:tH,fill:lonaCor,stroke:"#111","stroke-width":1.8},svg);

  // Bainha costurada
  const bainh=Math.max(2,Math.min(6,tH*0.007));
  el("rect",{x:tX,y:tY,width:tW,height:tH,fill:"none",stroke:ink,"stroke-width":bainh*2,opacity:0.12},svg);
  el("rect",{x:tX+bainh,y:tY+bainh,width:tW-2*bainh,height:tH-2*bainh,fill:"none",stroke:ink,"stroke-width":0.8,"stroke-dasharray":"3 3",opacity:0.35},svg);

  // Linhas divisórias verticais entre faixas
  drawLonaFinish(svg,{x:tX,y:tY,w:tW,h:tH},f,ink,sc,bainh);
  el("line",{x1:tX+latHpx,y1:tY,x2:tX+latHpx,y2:tY+tH,stroke:ink,"stroke-width":1.4,"stroke-dasharray":"8 5",opacity:0.7,class:"zone-mark"},svg);
  el("line",{x1:tX+latHpx+topHpx,y1:tY,x2:tX+latHpx+topHpx,y2:tY+tH,stroke:ink,"stroke-width":1.4,"stroke-dasharray":"8 5",opacity:0.7,class:"zone-mark"},svg);
  // Linha central (f.w/2)
  el("line",{x1:tX,y1:tY+tH/2,x2:tX+tW,y2:tY+tH/2,stroke:ink,"stroke-width":0.9,"stroke-dasharray":"5 4",opacity:0.45,class:"zone-mark"},svg);

  // === Logos ===
  const logosLatA=logosEff.filter(l=>l.zone==="latA");
  const logosTopo=logosEff.filter(l=>l.zone==="topFull"||l.zone==="topoA"||l.zone==="topoB");
  const logosLatB=logosEff.filter(l=>l.zone==="latB"||l.zone==="baseFull");

  // k=1 sempre — logo aparece no tamanho exato especificado (maxW × maxH), sem redução por zona
  if(logosLatA.length) drawLonaLogoZone(svg,zoneLatA,logosLatA,f,ink,sc,ldUrl,undefined,enableLogoDrag);
  if(logosTopo.length) drawLonaLogoZone(svg,zoneTopo,logosTopo,f,ink,sc,ldUrl,undefined,enableLogoDrag);
  if(logosLatB.length) drawLonaLogoZone(svg,zoneLatB,logosLatB,f,ink,sc,ldUrl,undefined,enableLogoDrag);

  // Logo parceiro: apenas em latA e latB/base (NÃO no topo)
  if(f.incluiFooterLogo){
    if(logosLatA.length) drawPartnerLogoBase(svg,zoneLatA,logosLatA,f,sc,partnerData,ink);
    if(logosLatB.length) drawPartnerLogoBase(svg,zoneLatB,logosLatB,f,sc,partnerData,ink);
  }

  if(!logosEff.length){
    [{r:zoneLatA,lbl:"LAT. A"},{r:zoneTopo,lbl:"TOPO"},{r:zoneLatB,lbl:"BASE"}].forEach(({r,lbl})=>{
      const pw=Math.min(r.w*0.75,r.h*0.35), ph=pw/2.2;
      el("rect",{x:r.x+r.w/2-pw/2,y:r.y+r.h/2-ph/2,width:pw,height:ph,rx:4,fill:"none",stroke:ink,"stroke-width":1.5,"stroke-dasharray":"6 4",opacity:0.7},svg);
      const lb=el("text",{x:r.x+r.w/2,y:r.y+r.h/2+4,"font-size":8,"font-weight":"700","text-anchor":"middle",fill:ink,"font-family":"Arial, Helvetica, sans-serif",opacity:0.9},svg);
      lb.textContent=lbl;
    });
  }

  // === Cotas ===
  const cotaStroke="#555";
  const fam="Arial, Helvetica, sans-serif";

  // Cota horizontal: f.h metros (largura total)
  const cotaTopY=tY-18;
  el("line",{x1:tX,y1:cotaTopY,x2:tX+tW,y2:cotaTopY,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:tX,y1:cotaTopY-5,x2:tX,y2:cotaTopY+5,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:tX+tW,y1:cotaTopY-5,x2:tX+tW,y2:cotaTopY+5,stroke:cotaStroke,"stroke-width":0.8},svg);
  const cwEl=el("text",{x:tX+tW/2,y:cotaTopY-6,"font-size":9,"font-weight":"700","text-anchor":"middle",fill:cotaStroke,"font-family":fam},svg);
  cwEl.textContent=`${f.h.toFixed(2)} m`;

  // Cota topWidth (acima, entre linhas divisórias)
  const cotaTopWY=cotaTopY-16;
  el("line",{x1:tX+latHpx,y1:cotaTopWY,x2:tX+latHpx+topHpx,y2:cotaTopWY,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:tX+latHpx,y1:cotaTopWY-4,x2:tX+latHpx,y2:cotaTopWY+4,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:tX+latHpx+topHpx,y1:cotaTopWY-4,x2:tX+latHpx+topHpx,y2:cotaTopWY+4,stroke:cotaStroke,"stroke-width":0.8},svg);
  const ctEl=el("text",{x:tX+latHpx+topHpx/2,y:cotaTopWY-6,"font-size":7.5,"text-anchor":"middle",fill:cotaStroke,"font-family":fam},svg);
  ctEl.textContent=`${f.topWidth.toFixed(2)} m`;

  // Cota vertical: f.w metros (comprimento)
  const cotaLeftX=tX-18;
  el("line",{x1:cotaLeftX,y1:tY,x2:cotaLeftX,y2:tY+tH,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:cotaLeftX-5,y1:tY,x2:cotaLeftX+5,y2:tY,stroke:cotaStroke,"stroke-width":0.8},svg);
  el("line",{x1:cotaLeftX-5,y1:tY+tH,x2:cotaLeftX+5,y2:tY+tH,stroke:cotaStroke,"stroke-width":0.8},svg);
  const chEl=el("text",{x:cotaLeftX-9,y:tY+tH/2,"font-size":9,"font-weight":"700","text-anchor":"middle",fill:cotaStroke,"font-family":fam,transform:`rotate(-90 ${cotaLeftX-9} ${tY+tH/2})`},svg);
  chEl.textContent=`${f.w.toFixed(2)} m`;

  // Labels de zona (texto rotacionado vertical — ocultos na impressão)
  const temLatB=logosLatB.some(l=>l.zone==="latB");
  const labelRight=temLatB?"LAT. B":"BASE";
  function zLabel(x,y,txt){
    const lb=el("text",{x,y,"font-size":7.5,"font-weight":"700","text-anchor":"middle",fill:ink,"font-family":fam,opacity:0.55,class:"zone-label"},svg);
    lb.setAttribute("transform",`rotate(-90 ${x} ${y})`);
    lb.textContent=txt;
  }
  zLabel(tX+latHpx/2,              tY+tH/2, `LAT. A — ${latH.toFixed(2)} m`);
  zLabel(tX+latHpx+topHpx/2,       tY+tH/2, `TOPO — ${f.topWidth.toFixed(2)} m`);
  zLabel(tX+latHpx+topHpx+latHpx/2,tY+tH/2, `${labelRight} — ${latH.toFixed(2)} m`);

  // Info mínima no rodapé
  const infoEl=el("text",{x:W/2,y:H-8,"font-size":6.5,"text-anchor":"middle",fill:"#aaa","font-family":fam},svg);
  infoEl.textContent=`${f.codigo} | Cor: ${corEff} | ${f.material} | ${f.acabamento} | Dist. lat: ${f.distLateral} cm | Dist. topo: ${f.distTopo} cm`;
}
