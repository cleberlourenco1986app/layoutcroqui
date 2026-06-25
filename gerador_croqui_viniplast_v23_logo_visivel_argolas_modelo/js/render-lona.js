// Página 2+ — Croqui na Lona (somente a lona, sem decorações)
// Layout rotacionado 90°: faixas VERTICAIS (LatA | Topo | Base)
// Eixo horizontal = altura do material (f.h); eixo vertical = comprimento (f.w)

// Calcula o k de fit para um logo em uma zona (sem aplicar)
function _lonaLogoK(rect, logo, f, sc){
  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const safeW=Math.max(10,rect.w-2*padPx);
  const safeH=Math.max(10,rect.h-2*padPx);
  const ratio=(logoNaturalW&&logoNaturalH)?(logoNaturalW/logoNaturalH):2;
  const sf=(logo.scale||100)/100;
  const rot=((logo.rotation||0)%360+360)%360;
  const swap=rot===90||rot===270;
  const dW=(logo.maxW||1200)/1000*sc*sf;
  const dH=dW/ratio;
  const effW=swap?dH:dW, effH=swap?dW:dH;
  return Math.min(1,safeW/Math.max(0.1,effW),safeH/Math.max(0.1,effH));
}

// kForce — fator pré-calculado (mínimo global entre zonas → logos ficam no mesmo tamanho)
function drawLonaLogoZone(g, rect, logoList, f, ink, sc, ldUrl, kForce){
  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const safeW=Math.max(10,rect.w-2*padPx);
  const safeH=Math.max(10,rect.h-2*padPx);
  logoList.forEach(logo=>{
    const ratio=(logoNaturalW&&logoNaturalH)?(logoNaturalW/logoNaturalH):2;
    const scaleFactor=(logo.scale||100)/100;
    const rot=((logo.rotation||0)%360+360)%360;
    const swap=rot===90||rot===270;
    let dW=(logo.maxW||1200)/1000*sc*scaleFactor;
    let dH=dW/ratio;
    const effW=swap?dH:dW, effH=swap?dW:dH;
    const k=kForce!==undefined ? kForce
      : Math.min(1,safeW/Math.max(0.1,effW),safeH/Math.max(0.1,effH));
    dW*=k; dH*=k;
    const visW=swap?dH:dW;
    const visH=swap?dW:dH;
    const safeLeft=rect.x+padPx;
    const safeRight=rect.x+rect.w-padPx;
    const safeTop=rect.y+padPx;
    const safeBottom=rect.y+rect.h-padPx;
    const minCX=safeLeft+visW/2;
    const maxCX=safeRight-visW/2;
    const cx=maxCX>minCX
      ? Math.max(minCX,Math.min(maxCX,minCX+((logo.x||50)/100)*(maxCX-minCX)))
      : (safeLeft+safeRight)/2;
    const anchor=logo.anchor||"bottom";
    const minCY=safeTop+visH/2;
    const maxCY=safeBottom-visH/2;
    let cy;
    if(anchor==="bottom") cy=rect.y+rect.h-padPx-visH/2;
    else if(anchor==="top") cy=rect.y+padPx+visH/2;
    else cy=maxCY>minCY
      ? Math.max(minCY,Math.min(maxCY,minCY+((logo.y||50)/100)*(maxCY-minCY)))
      : (safeTop+safeBottom)/2;
    cy=Math.max(minCY, Math.min(maxCY, cy));
    const inner=el("g",{transform:`translate(${cx} ${cy}) rotate(${rot}) translate(${-dW/2} ${-dH/2})`},g);
    if($("logoModo").value!=="placeholder"&&ldUrl){
      el("image",{href:ldUrl,x:0,y:0,width:dW,height:dH,preserveAspectRatio:"none"},inner);
    } else {
      el("rect",{x:0,y:0,width:dW,height:dH,rx:5,fill:"none",stroke:ink,"stroke-width":2.5,"stroke-dasharray":"7 5"},inner);
      text(inner,"LOGO",dW/2,dH/2+5,Math.min(dW,dH)*0.18,"700","middle",ink);
    }
  });
}

function getLonaLogoPlacement(rect, logo, f, sc, kForce){
  const padPx=Math.max(2,(f.logoMargin||0.15)*sc);
  const ratio=(logoNaturalW&&logoNaturalH)?(logoNaturalW/logoNaturalH):2;
  const scaleFactor=(logo.scale||100)/100;
  const rot=((logo.rotation||0)%360+360)%360;
  const swap=rot===90||rot===270;
  let dW=(logo.maxW||1200)/1000*sc*scaleFactor;
  let dH=dW/ratio;
  const safeW=Math.max(10,rect.w-2*padPx);
  const safeH=Math.max(10,rect.h-2*padPx);
  const effW=swap?dH:dW, effH=swap?dW:dH;
  const k=kForce!==undefined ? kForce
    : Math.min(1,safeW/Math.max(0.1,effW),safeH/Math.max(0.1,effH));
  dW*=k; dH*=k;
  const visW=swap?dH:dW;
  const visH=swap?dW:dH;
  const safeLeft=rect.x+padPx;
  const safeRight=rect.x+rect.w-padPx;
  const safeTop=rect.y+padPx;
  const safeBottom=rect.y+rect.h-padPx;
  const minCX=safeLeft+visW/2;
  const maxCX=safeRight-visW/2;
  const cx=maxCX>minCX
    ? Math.max(minCX,Math.min(maxCX,minCX+((logo.x||50)/100)*(maxCX-minCX)))
    : (safeLeft+safeRight)/2;
  const minCY=safeTop+visH/2;
  const maxCY=safeBottom-visH/2;
  const anchor=logo.anchor||"bottom";
  let cy;
  if(anchor==="bottom") cy=safeBottom-visH/2;
  else if(anchor==="top") cy=safeTop+visH/2;
  else cy=maxCY>minCY
    ? Math.max(minCY,Math.min(maxCY,minCY+((logo.y||50)/100)*(maxCY-minCY)))
    : (safeTop+safeBottom)/2;
  cy=Math.max(minCY,Math.min(maxCY,cy));
  return {cx,cy,dW,dH,rot,visW,visH,padPx,safeLeft,safeRight,safeTop,safeBottom};
}

function drawPartnerLogoBeside(g, rect, logo, f, sc, partnerUrl, kForce, ink){
  const partnerPlaceholder=$("footerLogoModo")?.value==="placeholder";
  if(!f.incluiFooterLogo||(!partnerUrl&&!partnerPlaceholder)||!logo) return;
  const main=getLonaLogoPlacement(rect,logo,f,sc,kForce);
  let pW=(f.footerLogoW||320)/1000*sc;
  let pH=(f.footerLogoH||160)/1000*sc;
  const swap=main.rot===90||main.rot===270;
  const pVisW=swap?pH:pW;
  const pVisH=swap?pW:pH;
  const maxW=Math.max(8,main.safeRight-main.safeLeft);
  const maxH=Math.max(8,main.safeBottom-main.safeTop);
  const k=Math.min(1,maxW/Math.max(0.1,pVisW),maxH/Math.max(0.1,pVisH));
  pW*=k; pH*=k;
  const rotRad=main.rot*Math.PI/180;
  const ux=Math.cos(rotRad),uy=Math.sin(rotRad);
  const vx=-Math.sin(rotRad),vy=Math.cos(rotRad);
  const gap=((f.footerLogoGap||1500)/1000)*sc;
  const extraX=((f.footerLogoOffsetX||0)/1000)*sc;
  const extraY=((f.footerLogoOffsetY||0)/1000)*sc;
  let cx=main.cx+ux*(main.dW/2+gap+pW/2+extraX)+vx*extraY;
  let cy=main.cy+uy*(main.dW/2+gap+pW/2+extraX)+vy*extraY;
  const pVisW2=swap?pH:pW;
  const pVisH2=swap?pW:pH;
  cx=Math.max(main.safeLeft+pVisW2/2,Math.min(main.safeRight-pVisW2/2,cx));
  cy=Math.max(main.safeTop+pVisH2/2,Math.min(main.safeBottom-pVisH2/2,cy));
  const inner=el("g",{transform:`translate(${cx} ${cy}) rotate(${main.rot}) translate(${-pW/2} ${-pH/2})`},g);
  if(partnerUrl&&!partnerPlaceholder){
    el("image",{href:partnerUrl,x:0,y:0,width:pW,height:pH,preserveAspectRatio:"xMidYMid meet"},inner);
  } else {
    el("rect",{x:0,y:0,width:pW,height:pH,rx:4,fill:"none",stroke:ink,"stroke-width":1.6,"stroke-dasharray":"5 4"},inner);
    text(inner,"PARCEIRO",pW/2,pH/2+4,Math.min(pW,pH)*0.18,"700","middle",ink);
  }
}

// svgEl  — elemento SVG alvo (null = usa #mockup)
// corOverride — cor da lona para variações (null = usa corLona do form)
// logoDataUrl — imagem do logo já processada para esta variação (null = usa processedImageData)
function renderLona(svgEl, corOverride, logoDataUrl){
  const f=form();
  const svg=svgEl||$("mockup"); if(!svg) return;
  svg.innerHTML="";
  const W=595,H=842;
  const corEff=corOverride||f.cor;
  const ldUrl=logoDataUrl||processedImageData;

  // Fundo branco — sem faixas decorativas, sem cabeçalho, sem rodapé
  el("rect",{x:0,y:0,width:W,height:H,fill:"#ffffff"},svg);

  // === Área da lona — ocupa quase toda a A4 ===
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
  el("line",{x1:tX+latHpx,y1:tY,x2:tX+latHpx,y2:tY+tH,stroke:ink,"stroke-width":1.4,"stroke-dasharray":"8 5",opacity:0.7},svg);
  el("line",{x1:tX+latHpx+topHpx,y1:tY,x2:tX+latHpx+topHpx,y2:tY+tH,stroke:ink,"stroke-width":1.4,"stroke-dasharray":"8 5",opacity:0.7},svg);
  // Linha central (f.w/2)
  el("line",{x1:tX,y1:tY+tH/2,x2:tX+tW,y2:tY+tH/2,stroke:ink,"stroke-width":0.9,"stroke-dasharray":"5 4",opacity:0.45},svg);

  // === Logos ===
  // Usa as medidas salvas em cada logo. A sincronizacao entre logos acontece
  // nos controles, nao durante o desenho, para evitar mutacao ao renderizar.

  const logosLatA=logos.filter(l=>l.zone==="latA");
  const logosTopo=logos.filter(l=>l.zone==="topFull"||l.zone==="topoA"||l.zone==="topoB");
  const logosLatB=logos.filter(l=>l.zone==="latB"||l.zone==="baseFull");

  // Calcular o menor k entre todas as zonas → garante que todos renderizam no mesmo tamanho
  let globalK=1;
  [[zoneLatA,logosLatA],[zoneTopo,logosTopo],[zoneLatB,logosLatB]].forEach(([zone,list])=>{
    list.forEach(logo=>{ globalK=Math.min(globalK,_lonaLogoK(zone,logo,f,sc)); });
  });

  if(logosLatA.length) drawLonaLogoZone(svg,zoneLatA,logosLatA,f,ink,sc,ldUrl,globalK);
  if(logosTopo.length) drawLonaLogoZone(svg,zoneTopo,logosTopo,f,ink,sc,ldUrl,globalK);
  if(logosLatB.length) drawLonaLogoZone(svg,zoneLatB,logosLatB,f,ink,sc,ldUrl,globalK);
  if(f.incluiFooterLogo&&(footerLogoData||$("footerLogoModo")?.value==="placeholder")){
    logosLatA.forEach(logo=>drawPartnerLogoBeside(svg,zoneLatA,logo,f,sc,footerLogoData,globalK,ink));
    logos.filter(l=>l.zone==="baseFull").forEach(logo=>drawPartnerLogoBeside(svg,zoneLatB,logo,f,sc,footerLogoData,globalK,ink));
  }

  if(!logos.length){
    [{r:zoneLatA,lbl:"LAT. A"},{r:zoneTopo,lbl:"TOPO"},{r:zoneLatB,lbl:"BASE"}].forEach(({r,lbl})=>{
      const pw=Math.min(r.w*0.75,r.h*0.35), ph=pw/2.2;
      el("rect",{x:r.x+r.w/2-pw/2,y:r.y+r.h/2-ph/2,width:pw,height:ph,rx:4,fill:"none",stroke:ink,"stroke-width":1.5,"stroke-dasharray":"6 4",opacity:0.7},svg);
      const lb=el("text",{x:r.x+r.w/2,y:r.y+r.h/2+4,"font-size":8,"font-weight":"700","text-anchor":"middle",fill:ink,"font-family":"Arial, Helvetica, sans-serif",opacity:0.9},svg);
      lb.textContent=lbl;
    });
  }

  // Argolas / Ilhoses
  drawFasteners(svg,{x:tX,y:tY,w:tW,h:tH},f,sc);

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

  // Labels de zona (texto rotacionado vertical)
  const temLatB=logosLatB.some(l=>l.zone==="latB");
  const labelRight=temLatB?"LAT. B":"BASE";
  function zLabel(x,y,txt){
    const lb=el("text",{x,y,"font-size":7.5,"font-weight":"700","text-anchor":"middle",fill:ink,"font-family":fam,opacity:0.55},svg);
    lb.setAttribute("transform",`rotate(-90 ${x} ${y})`);
    lb.textContent=txt;
  }
  zLabel(tX+latHpx/2,              tY+tH/2, `LAT. A — ${latH.toFixed(2)} m`);
  zLabel(tX+latHpx+topHpx/2,       tY+tH/2, `TOPO — ${f.topWidth.toFixed(2)} m`);
  zLabel(tX+latHpx+topHpx+latHpx/2,tY+tH/2, `${labelRight} — ${latH.toFixed(2)} m`);

  // Info mínima no rodapé (única linha, muito pequena)
  const infoEl=el("text",{x:W/2,y:H-8,"font-size":6.5,"text-anchor":"middle",fill:"#aaa","font-family":fam},svg);
  infoEl.textContent=`${f.codigo} | Cor: ${corEff} | ${f.material} | ${f.acabamento} | Dist. lat: ${f.distLateral} cm | Dist. topo: ${f.distTopo} cm`;
}
