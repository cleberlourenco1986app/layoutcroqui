function exportCleanClone(svgEl){
  const clone=svgEl.cloneNode(true);
  clone.querySelectorAll(".guide,.selectedBox").forEach(n=>n.remove());
  return clone;
}

function downloadSVG(){
  const svg=$("sheet");
  const clone=exportCleanClone(svg);
  const xml=new XMLSerializer().serializeToString(clone);
  const blob=new Blob([xml],{type:"image/svg+xml"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="croqui_pagina1.svg";
  a.click();
}

function downloadPNG(){
  const svg=$("sheet");
  const clone=exportCleanClone(svg);
  const xml=new XMLSerializer().serializeToString(clone);
  const img=new Image();
  img.onload=()=>{
    const sc=3;
    const c=document.createElement("canvas");
    c.width=595*sc; c.height=842*sc;
    const ctx=c.getContext("2d");
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,c.width,c.height);
    ctx.scale(sc,sc);
    ctx.drawImage(img,0,0);
    const a=document.createElement("a");
    a.href=c.toDataURL("image/png");
    a.download="croqui_pagina1.png";
    a.click();
  };
  img.src="data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(xml)));
}

function downloadLonaPNG(){
  const svg=$("mockup");
  if(!svg){ alert("Croqui na lona não encontrado."); return; }
  const clone=exportCleanClone(svg);
  const xml=new XMLSerializer().serializeToString(clone);
  const img=new Image();
  img.onload=()=>{
    const sc=3;
    const c=document.createElement("canvas");
    c.width=595*sc; c.height=842*sc;
    const ctx=c.getContext("2d");
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,c.width,c.height);
    ctx.scale(sc,sc);
    ctx.drawImage(img,0,0);
    const a=document.createElement("a");
    a.href=c.toDataURL("image/png");
    a.download="croqui_lona.png";
    a.click();
  };
  img.src="data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(xml)));
}
