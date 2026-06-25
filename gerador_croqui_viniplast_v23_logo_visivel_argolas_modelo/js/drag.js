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
