function svgPoint(svg, clientX, clientY){
  const pt=svg.createSVGPoint();
  pt.x=clientX; pt.y=clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function startDrag(e){
  if(e.button!==0) return;
  const grp=e.currentTarget;
  const id=parseInt(grp.getAttribute("data-id"),10);
  const logo=logos.find(l=>l.id===id); if(!logo) return;
  const svg=$("sheet");
  const pt=svgPoint(svg,e.clientX,e.clientY);
  dragState={id,logo,startPt:pt,startX:logo.x,startY:logo.y};
  e.preventDefault(); e.stopPropagation();
  window.addEventListener("mousemove",dragMove,{passive:false});
  window.addEventListener("mouseup",endDrag);
}

function startDragTouch(e){
  const t=e.touches[0]; if(!t) return;
  const grp=e.currentTarget;
  const id=parseInt(grp.getAttribute("data-id"),10);
  const logo=logos.find(l=>l.id===id); if(!logo) return;
  const svg=$("sheet");
  const pt=svgPoint(svg,t.clientX,t.clientY);
  dragState={id,logo,startPt:pt,startX:logo.x,startY:logo.y};
  e.preventDefault(); e.stopPropagation();
  window.addEventListener("touchmove",dragMoveTouch,{passive:false});
  window.addEventListener("touchend",endDragTouch);
}

function dragCore(svg, clientX, clientY){
  if(!dragState) return;
  const {logo,startPt,startX,startY}=dragState;
  const f=form();
  const rect=getMainRect(f);
  const zones=getZones(rect,f);
  const zone=zones[logo.zone]; if(!zone) return;
  const safe=getSafeRect(zone,f);
  const size=fitLogoSize(safe,zone,logo,f);
  const pt=svgPoint(svg,clientX,clientY);
  const dx=pt.x-startPt.x,dy=pt.y-startPt.y;
  const rangeX=Math.max(1,safe.w-size.boxW);
  const rangeY=Math.max(1,safe.h-size.boxH);
  logo.x=clamp(startX+dx/rangeX*100,0,100);
  const logoY0=clamp(startY+dy/rangeY*100,0,100);
  logo.y=logo.anchor==="bottom" ? clamp(startY-dy/rangeY*100,0,100) : logoY0;
  selectedLogoId=logo.id;
  renderAll(false);
}

function dragMove(e){ e.preventDefault(); dragCore($("sheet"),e.clientX,e.clientY); }
function dragMoveTouch(e){ e.preventDefault(); const t=e.touches[0]; if(t) dragCore($("sheet"),t.clientX,t.clientY); }

function endDrag(){
  dragState=null;
  window.removeEventListener("mousemove",dragMove);
  window.removeEventListener("mouseup",endDrag);
  renderAll(false);
}

function endDragTouch(){
  dragState=null;
  window.removeEventListener("touchmove",dragMoveTouch);
  window.removeEventListener("touchend",endDragTouch);
  renderAll(false);
}

function prepareLonaDragLogo(logo, f, sc, zone){
  return getLonaLogoMetrics(zone,logo,f,sc);
}

function startLonaDrag(e){
  if(e.button!==0) return;
  const grp=e.currentTarget;
  const id=parseInt(grp.getAttribute("data-id"),10);
  const logo=logos.find(l=>l.id===id); if(!logo) return;
  const svg=grp.ownerSVGElement||$("mockup");
  const f=form();
  const layout=getLonaLayout(f);
  const zone=layout.zones[logo.zone]||layout.zoneTopo;
  const metrics=prepareLonaDragLogo(logo,f,layout.sc,zone);
  const pt=svgPoint(svg,e.clientX,e.clientY);
  dragState={kind:"lona",id,logo,startPt:pt,startX:lonaPct(logo.x),startY:lonaPct(logo.y),zone,sc:layout.sc,metrics,converted:false};
  selectedLogoId=logo.id;
  e.preventDefault(); e.stopPropagation();
  window.addEventListener("mousemove",lonaDragMove,{passive:false});
  window.addEventListener("mouseup",endLonaDrag);
}

function startLonaDragTouch(e){
  const t=e.touches[0]; if(!t) return;
  const grp=e.currentTarget;
  const id=parseInt(grp.getAttribute("data-id"),10);
  const logo=logos.find(l=>l.id===id); if(!logo) return;
  const svg=grp.ownerSVGElement||$("mockup");
  const f=form();
  const layout=getLonaLayout(f);
  const zone=layout.zones[logo.zone]||layout.zoneTopo;
  const metrics=prepareLonaDragLogo(logo,f,layout.sc,zone);
  const pt=svgPoint(svg,t.clientX,t.clientY);
  dragState={kind:"lona",id,logo,startPt:pt,startX:lonaPct(logo.x),startY:lonaPct(logo.y),zone,sc:layout.sc,metrics,converted:false};
  selectedLogoId=logo.id;
  e.preventDefault(); e.stopPropagation();
  window.addEventListener("touchmove",lonaDragMoveTouch,{passive:false});
  window.addEventListener("touchend",endLonaDragTouch);
}

function lonaDragCore(svg, clientX, clientY){
  if(!dragState||dragState.kind!=="lona") return;
  const {logo,startPt,startX}=dragState;
  const pt=svgPoint(svg,clientX,clientY);
  const dx=pt.x-startPt.x;
  const dy=pt.y-startPt.y;
  if(!dragState.converted&&logo.anchor!=="center"&&(Math.abs(dx)+Math.abs(dy)>0.5)){
    const m=dragState.metrics;
    const rangeY=Math.max(1,m.maxCY-m.minCY);
    logo.y=clamp(((m.cy-m.minCY)/rangeY)*100,0,100);
    logo.anchor="center";
    dragState.startY=logo.y;
    dragState.metrics=getLonaLogoMetrics(dragState.zone,logo,form(),dragState.sc);
    dragState.converted=true;
  }
  const metrics=dragState.metrics;
  const startY=dragState.startY;
  const rangeX=Math.max(1,metrics.maxCX-metrics.minCX);
  const rangeY=Math.max(1,metrics.maxCY-metrics.minCY);
  logo.x=clamp(startX+(dx/rangeX)*100,0,100);
  logo.y=clamp(startY+(dy/rangeY)*100,0,100);
  selectedLogoId=logo.id;
  renderAll(false);
}

function lonaDragMove(e){ e.preventDefault(); lonaDragCore($("mockup"),e.clientX,e.clientY); }
function lonaDragMoveTouch(e){ e.preventDefault(); const t=e.touches[0]; if(t) lonaDragCore($("mockup"),t.clientX,t.clientY); }

function endLonaDrag(){
  dragState=null;
  window.removeEventListener("mousemove",lonaDragMove);
  window.removeEventListener("mouseup",endLonaDrag);
  renderAll();
}

function endLonaDragTouch(){
  dragState=null;
  window.removeEventListener("touchmove",lonaDragMoveTouch);
  window.removeEventListener("touchend",endLonaDragTouch);
  renderAll();
}
