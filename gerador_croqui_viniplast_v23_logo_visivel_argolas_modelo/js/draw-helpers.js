function drawFasteners(g, rect, f, scOverride){
  const isArgola=f.acabamento==="argolas";
  const scEff=scOverride||(rect.w/f.w);
  const stepX=(f.distTopo/100)*scEff;
  const stepY=(f.distLateral/100)*scEff;
  const stroke="#1a1a1a";
  const sw=1.5;
  const bL=2.5; // metade da largura do capitel (argola)
  const tL=7;   // comprimento do pino saindo da borda
  const bot=rect.y+rect.h;
  const rig=rect.x+rect.w;

  function argTop(x){
    el("line",{x1:x,y1:rect.y-tL,x2:x,y2:rect.y+2,stroke,"stroke-width":sw},g);
    if(isArgola) el("line",{x1:x-bL,y1:rect.y-tL,x2:x+bL,y2:rect.y-tL,stroke,"stroke-width":sw},g);
  }
  function argBottom(x){
    el("line",{x1:x,y1:bot-2,x2:x,y2:bot+tL,stroke,"stroke-width":sw},g);
    if(isArgola) el("line",{x1:x-bL,y1:bot+tL,x2:x+bL,y2:bot+tL,stroke,"stroke-width":sw},g);
  }
  function argLeft(y){
    el("line",{x1:rect.x-tL,y1:y,x2:rect.x+2,y2:y,stroke,"stroke-width":sw},g);
    if(isArgola) el("line",{x1:rect.x-tL,y1:y-bL,x2:rect.x-tL,y2:y+bL,stroke,"stroke-width":sw},g);
  }
  function argRight(y){
    el("line",{x1:rig-2,y1:y,x2:rig+tL,y2:y,stroke,"stroke-width":sw},g);
    if(isArgola) el("line",{x1:rig+tL,y1:y-bL,x2:rig+tL,y2:y+bL,stroke,"stroke-width":sw},g);
  }

  for(let xx=rect.x;xx<=rect.x+rect.w+0.1;xx+=stepX){
    const px=Math.min(rect.x+rect.w,xx); argTop(px); argBottom(px);
  }
  for(let yy=rect.y;yy<=rect.y+rect.h+0.1;yy+=stepY){
    const py=Math.min(rect.y+rect.h,yy); argLeft(py); argRight(py);
  }
}

function drawZoneGuide(g, zone){
  if(!showGuides()) return;
  el("rect",{x:zone.x,y:zone.y,width:zone.w,height:zone.h,fill:"none",stroke:"#888","stroke-dasharray":"6 5","stroke-width":1,class:"guide"},g);
  text(g,zone.label,zone.x+zone.w-10,zone.y+15,11,"700","end","#555",null,"guide");
}

function getSafeRect(zone, f){
  const mx=zone.realW>0 ? (f.logoMargin/zone.realW)*zone.w : 0;
  const my=zone.realH>0 ? (f.logoMargin/zone.realH)*zone.h : 0;
  return {x:zone.x+mx,y:zone.y+my,w:Math.max(10,zone.w-2*mx),h:Math.max(10,zone.h-2*my)};
}

function fitLogoSize(safe, zone, logo, f){
  const rect=getMainRect(f);
  const uniformPxPerMm=Math.min(rect.w,rect.h)/Math.max(1,(f.w*1000));
  const scaleFactor=(logo.scale||100)/100;
  let drawW=Math.max(18,(logo.maxW||1200)*uniformPxPerMm*scaleFactor);
  let drawH=Math.max(12,(logo.maxH||580)*uniformPxPerMm*scaleFactor);
  const rot=((logo.rotation||0)%360+360)%360;
  const swap=rot===90||rot===270;
  let boxW=swap?drawH:drawW, boxH=swap?drawW:drawH;
  const k=Math.min(1,safe.w/boxW,safe.h/boxH);
  drawW*=k; drawH*=k; boxW*=k; boxH*=k;
  return {w:drawW,h:drawH,boxW,boxH,k};
}

function logoPositionInSafe(safe, size, logo){
  const minX=safe.x,maxX=safe.x+safe.w-size.boxW;
  const x=minX+(logo.x/100)*(maxX-minX);
  const minY=safe.y,maxY=safe.y+safe.h-size.boxH;
  let y;
  if(logo.anchor==="bottom") y=maxY-(logo.y/100)*(maxY-minY);
  else y=minY+(logo.y/100)*(maxY-minY);
  return {x:Math.max(minX,Math.min(maxX,x)),y:Math.max(minY,Math.min(maxY,y))};
}

function drawOneLogo(g, logo, zone, f, selected=false){
  const safe=getSafeRect(zone,f);
  const size=fitLogoSize(safe,zone,logo,f);
  const pos=logoPositionInSafe(safe,size,logo);
  const cx=pos.x+size.boxW/2,cy=pos.y+size.boxH/2;
  const grp=el("g",{class:"drag","data-id":logo.id},g);
  grp.addEventListener("mousedown",startDrag);
  grp.addEventListener("touchstart",startDragTouch,{passive:false});
  grp.onclick=(e)=>{ selectedLogoId=logo.id; e.stopPropagation(); renderAll(); };
  const inner=el("g",{transform:`translate(${cx} ${cy}) rotate(${logo.rotation}) translate(${-size.w/2} ${-size.h/2})`},grp);
  const srcP1=processedImageDataPage1||processedImageData;
  const approvalInk=getApprovalLogoInk();
  if($("logoModo").value==="placeholder"||!srcP1){
    el("rect",{x:0,y:0,width:size.w,height:size.h,rx:7,fill:"none",stroke:approvalInk,"stroke-width":3,"stroke-dasharray":"8 6"},inner);
    text(inner,"LOGO",size.w/2,size.h/2,17,"700","middle",approvalInk);
  } else {
    el("image",{href:srcP1,x:0,y:0,width:size.w,height:size.h,preserveAspectRatio:"xMidYMid meet"},inner);
  }
  if(selected&&showGuides()){
    el("rect",{x:pos.x-6,y:pos.y-6,width:size.boxW+12,height:size.boxH+12,fill:"none",stroke:"#d10000","stroke-width":2,"stroke-dasharray":"5 4",class:"selectedBox"},grp);
  }
}

function drawApprovalSide(svg, code){
  el("rect",{x:0,y:0,width:36,height:610,fill:"#7b0000"},svg);
  el("rect",{x:0,y:610,width:36,height:184,fill:"#5d5d5d"},svg);
  text(svg,code,58,360,20,"700","middle","#1e9ad6",-90);
}

function drawViniLogo(svg, x, y, scale=1){
  el("path",{d:`M ${x} ${y} c ${18*scale} ${-28*scale} ${45*scale} ${-28*scale} ${63*scale} 0 c ${18*scale} ${-28*scale} ${45*scale} ${-28*scale} ${63*scale} 0 c ${-14*scale} ${42*scale} ${-42*scale} ${70*scale} ${-63*scale} ${86*scale} c ${-21*scale} ${-16*scale} ${-49*scale} ${-44*scale} ${-63*scale} ${-86*scale}`,fill:"#d40000"},svg);
  el("ellipse",{cx:x+95*scale,cy:y+8*scale,rx:25*scale,ry:37*scale,fill:"#650000",opacity:.8,transform:`rotate(35 ${x+95*scale} ${y+8*scale})`},svg);
  text(svg,"ViniPlast",x+63*scale,y+132*scale,48*scale,"700","middle","#555");
  text(svg,"TEM LONA PRA TUDO",x+63*scale,y+160*scale,13*scale,"400","middle","#111");
}

function getLogoRenderedMetrics(logo, f){
  if(!logo) return null;
  const rect=getMainRect(f),zones=getZones(rect,f);
  const zone=zones[logo.zone]||zones.topFull||zones.baseFull||zones.latA;
  if(!zone) return null;
  const safe=getSafeRect(zone,f);
  const size=fitLogoSize(safe,zone,logo,f);
  const pos=logoPositionInSafe(safe,size,logo);
  const realWmm=Math.round((logo.maxW||0)*((logo.scale||100)/100));
  const realHmm=Math.round((logo.maxH||0)*((logo.scale||100)/100));
  return {zone,safe,size,pos,realWmm,realHmm};
}

function drawLogoChosenPanel(svg, x, y, w, h){
  const s=selectedLogo()||logos[0]||null;
  el("rect",{x,y,width:w,height:h,rx:10,fill:"#fafafa",stroke:"#d4d4d4","stroke-width":1.2},svg);
  text(svg,"LOGO ESCOLHIDO",x+14,y+24,14,"900","start","#444");
  const inkRgb=hexToRgb(getInk());
  const lum=(0.299*inkRgb[0]+0.587*inkRgb[1]+0.114*inkRgb[2]);
  const previewBg=lum>180?"#101010":"#ffffff";
  const previewStroke=lum>180?"#333333":"#dddddd";
  const preview={x:x+18,y:y+44,w:w-36,h:176};
  el("rect",{x:preview.x,y:preview.y,width:preview.w,height:preview.h,rx:9,fill:previewBg,stroke:previewStroke,"stroke-width":1},svg);
  if($("logoModo").value==="placeholder"||!processedImageData){
    el("rect",{x:preview.x+24,y:preview.y+34,width:preview.w-48,height:preview.h-68,rx:6,fill:"none",stroke:getInk(),"stroke-width":2.5,"stroke-dasharray":"8 6"},svg);
    text(svg,"LOGO",preview.x+preview.w/2,preview.y+preview.h/2+5,24,"800","middle",getInk());
  } else {
    el("image",{href:processedImageData,x:preview.x+22,y:preview.y+22,width:preview.w-44,height:preview.h-44,preserveAspectRatio:"xMidYMid meet"},svg);
  }
  if(s){
    const m=getLogoRenderedMetrics(s,form());
    const rw=m?m.realWmm:Math.round(s.maxW||0);
    const rh=m?m.realHmm:Math.round(s.maxH||0);
    text(svg,`${rw} x ${rh} mm`,x+w/2,y+250,22,"900","middle","#444");
    text(svg,"medida real aplicada",x+w/2,y+272,11,"600","middle","#777");
  } else {
    text(svg,"Carregue ou gere um logo",x+w/2,y+250,12,"600","middle","#888");
  }
}

function drawPartnerLogoOnCroqui(g, mzones, f){
  if(!f.incluiFooterLogo||!footerLogoData) return;
  const central=logos.find(l=>l.zone==="topFull")||logos.find(l=>l.zone==="baseFull");
  if(!central) return;
  const zone=mzones[central.zone]; if(!zone) return;
  const safe=getSafeRect(zone,f);
  const mainSize=fitLogoSize(safe,zone,central,f);
  const mainPos=logoPositionInSafe(safe,mainSize,central);
  const ratio=footerLogoNaturalW/footerLogoNaturalH;
  const refRealW=zone.fitW||zone.realW||1;
  const maxWpx=safe.w*Math.min(1,(f.footerLogoW/1000)/refRealW);
  let w=Math.min(maxWpx,safe.w*0.45),h=w/ratio;
  if(h>safe.h*0.75){ const k=(safe.h*0.75)/h; w*=k; h*=k; }
  const pxPerMeterX=zone.w/zone.realW,pxPerMeterY=zone.h/zone.realH;
  const gap=Math.max(12,0.03*zone.w);
  let x=mainPos.x+mainSize.w+gap+((f.footerLogoOffsetX||0)/1000)*pxPerMeterX;
  let y=mainPos.y+(mainSize.h-h)/2+((f.footerLogoOffsetY||0)/1000)*pxPerMeterY;
  x=Math.max(safe.x,Math.min(safe.x+safe.w-w,x));
  y=Math.max(safe.y,Math.min(safe.y+safe.h-h,y));
  el("image",{href:footerLogoData,x,y,width:w,height:h,preserveAspectRatio:"xMidYMid meet"},g);
  if(showGuides()) el("rect",{x:x-5,y:y-5,width:w+10,height:h+10,fill:"none",stroke:"#1e9ad6","stroke-width":1.4,"stroke-dasharray":"4 4",class:"guide"},g);
}
