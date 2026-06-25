function renderPdfToImage(file, callback){
  if(!window.pdfjsLib){
    alert("Para abrir PDF direto no navegador, é necessário internet para carregar a biblioteca PDF.js. Se não carregar, converta o PDF para PNG/JPG.");
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const reader=new FileReader();
  reader.onload=async()=>{
    try{
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(reader.result)}).promise;
      const page=await pdf.getPage(1);
      const viewport=page.getViewport({scale:4});
      const c=document.createElement("canvas");
      c.width=Math.round(viewport.width); c.height=Math.round(viewport.height);
      const ctx=c.getContext("2d");
      await page.render({canvasContext:ctx,viewport}).promise;
      callback(c.toDataURL("image/png"));
    }catch(e){
      console.error(e);
      alert("Não consegui ler esse PDF. Tente salvar a primeira página como PNG/JPG.");
    }
  };
  reader.readAsArrayBuffer(file);
}

function readLogoFile(file, callback){
  if(!file) return;
  const isPdf=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");
  if(isPdf){ renderPdfToImage(file,callback); return; }
  const reader=new FileReader();
  reader.onload=()=>callback(reader.result);
  reader.readAsDataURL(file);
}

function carregarLogo(ev){
  const file=ev.target.files[0]; if(!file) return;
  readLogoFile(file,(dataUrl)=>{
    uploadedImageData=dataUrl;
    const img=new Image();
    img.onload=()=>{ logoNaturalW=img.naturalWidth||img.width||1000; logoNaturalH=img.naturalHeight||img.height||500; processLogo(); };
    img.src=dataUrl;
    $("statusLogo").textContent=file.name.toLowerCase().endsWith(".pdf") ? "PDF carregado e rasterizado" : "Logo carregado";
    if(!logos.length) syncDefaultLogoSize("w");
    processFooterLogo();
    gerarPreset();
    renderAll();
  });
}

function carregarLogoRodape(ev){
  const file=ev.target.files[0]; if(!file) return;
  readLogoFile(file,(dataUrl)=>{
    footerLogoSourceData=dataUrl;
    const img=new Image();
    img.onload=()=>{
      footerLogoNaturalW=img.naturalWidth||img.width||2048;
      footerLogoNaturalH=img.naturalHeight||img.height||1448;
      syncFooterLogoSize("w");
      processFooterLogo();
    };
    img.src=dataUrl;
  });
}

function getPrimaryLogoRatio(){
  return (logoNaturalW&&logoNaturalH) ? (logoNaturalW/logoNaturalH) : 2;
}

function getFooterLogoRatio(){
  return (footerLogoNaturalW&&footerLogoNaturalH) ? (footerLogoNaturalW/footerLogoNaturalH) : 2;
}

function getFooterInk(){
  const mode=$("footerLogoColorMode")?.value||"auto";
  if(mode==="white") return "#ffffff";
  if(mode==="black") return "#1f2937";
  if(mode==="custom") return $("footerLogoCustomColor")?.value||"#1f2937";
  return autoInk($("corLona").value);
}

function syncDefaultLogoSize(source){
  const ratio=getPrimaryLogoRatio();
  if(!ratio||!isFinite(ratio)) return;
  if(source==="w"){ const w=parseFloat($("logoW").value||0); if(w>0) $("logoH").value=Math.max(1,Math.round(w/ratio)); }
  else if(source==="h"){ const h=parseFloat($("logoH").value||0); if(h>0) $("logoW").value=Math.max(1,Math.round(h*ratio)); }
  if(logos.length){
    const w=parseFloat($("logoW").value||1200), h=parseFloat($("logoH").value||580);
    logos.forEach(l=>{ l.maxW=w; l.maxH=h; });
    renderAll(false);
  }
}

function syncSelectedLogoSize(source){
  const s=selectedLogo(); if(!s) return;
  const ratio=getPrimaryLogoRatio();
  if(!ratio||!isFinite(ratio)) return;
  if(source==="w"){ const w=parseFloat($("selMaxW").value||0); if(w>0) $("selMaxH").value=Math.max(1,Math.round(w/ratio)); }
  else if(source==="h"){ const h=parseFloat($("selMaxH").value||0); if(h>0) $("selMaxW").value=Math.max(1,Math.round(h*ratio)); }
}

function syncFooterLogoSize(source){
  const ratio=getFooterLogoRatio();
  if(!ratio||!isFinite(ratio)) return;
  if(source==="w"){
    const w=parseFloat($("footerLogoW")?.value||0);
    if(w>0) $("footerLogoH").value=Math.max(1,Math.round(w/ratio));
  } else if(source==="h"){
    const h=parseFloat($("footerLogoH")?.value||0);
    if(h>0) $("footerLogoW").value=Math.max(1,Math.round(h*ratio));
  }
}

function applySizeToAllFromSelected(){
  const s=selectedLogo(); if(!s) return;
  if($("applyAllSizes")?.value!=="sim") return;
  logos.forEach(l=>{ if(l.id===s.id) return; l.maxW=s.maxW; l.maxH=s.maxH; l.scale=s.scale; });
}

function applySelectedScaleProportionally(){
  const s=selectedLogo(); if(!s) return;
  s.scale=parseFloat($("selScale").value||100);
  applySizeToAllFromSelected();
  syncToposIfNeeded(s);
  renderAll(false);
}

function rgbaDist(r,g,b,a,bg){
  const da=Math.abs((a??255)-(bg[3]??255))*0.5;
  return Math.sqrt((r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2+da*da);
}

function autoCutoutFromDataUrl(dataUrl, opts, callback){
  opts=opts||{};
  const img=new Image();
  img.onload=()=>{
    const max=opts.max||2200;
    const scale=Math.min(1,max/img.width,max/img.height);
    const c=document.createElement("canvas");
    c.width=Math.max(1,Math.round(img.width*scale));
    c.height=Math.max(1,Math.round(img.height*scale));
    const ctx=c.getContext("2d");
    ctx.drawImage(img,0,0,c.width,c.height);
    const data=ctx.getImageData(0,0,c.width,c.height);
    const arr=data.data;
    function getPix(x,y){
      const xx=Math.max(0,Math.min(c.width-1,x)),yy=Math.max(0,Math.min(c.height-1,y)),i=(yy*c.width+xx)*4;
      return [arr[i],arr[i+1],arr[i+2],arr[i+3]];
    }
    // Amostrar toda a borda para detectar cor de fundo de forma robusta
    const edgeSamples=[];
    const step=Math.max(1,Math.round(Math.min(c.width,c.height)/30));
    for(let x=0;x<c.width;x+=step){edgeSamples.push(getPix(x,0));edgeSamples.push(getPix(x,c.height-1));}
    for(let y=0;y<c.height;y+=step){edgeSamples.push(getPix(0,y));edgeSamples.push(getPix(c.width-1,y));}
    const bg=[0,1,2,3].map(ch=>Math.round(edgeSamples.reduce((s,p)=>s+(p[ch]??255),0)/edgeSamples.length));
    const bgBright=(bg[0]+bg[1]+bg[2])/3;
    const th=parseInt($("threshold").value||150,10);
    // Tolerância adaptativa: mais agressiva para fundos claros (caso mais comum: fundo branco)
    const bgTol=opts.bgTol||(bgBright>180 ? Math.max(60,th*0.55) : Math.max(35,th*0.42));
    const markBg=new Uint8Array(c.width*c.height);
    const stack=[];
    function tryPush(x,y){
      if(x<0||y<0||x>=c.width||y>=c.height) return;
      const p=y*c.width+x; if(markBg[p]) return;
      const i=p*4,r=arr[i],g=arr[i+1],b=arr[i+2],a=arr[i+3];
      const sat=Math.max(r,g,b)-Math.min(r,g,b);
      const lum=(r+g+b)/3;
      // Para fundo claro: também marca pixels quase-brancos sem saturação
      const isBg=a<18
        ||(rgbaDist(r,g,b,a,bg)<=bgTol&&sat<110)
        ||(bgBright>180&&lum>210&&sat<20)
        ||(opts.removeDarkBg&&lum<40&&sat<80);
      if(isBg){ markBg[p]=1; stack.push(p); }
    }
    for(let x=0;x<c.width;x++){ tryPush(x,0); tryPush(x,c.height-1); }
    for(let y=0;y<c.height;y++){ tryPush(0,y); tryPush(c.width-1,y); }
    while(stack.length){
      const p=stack.pop(),x=p%c.width,y=(p/c.width)|0;
      tryPush(x+1,y); tryPush(x-1,y); tryPush(x,y+1); tryPush(x,y-1);
    }
    // Segunda passagem: para fundo claro, também remove pixels quase-brancos isolados
    // (cobre artifatos JPEG e áreas não atingidas pelo flood-fill)
    if(bgBright>180){
      for(let p=0;p<c.width*c.height;p++){
        if(markBg[p]) continue;
        const i=p*4,r=arr[i],g=arr[i+1],b=arr[i+2],a=arr[i+3];
        const lum=(r+g+b)/3,sat=Math.max(r,g,b)-Math.min(r,g,b);
        if(a>18&&lum>215&&sat<18) markBg[p]=1;
      }
    }
    const mask=new Uint8Array(c.width*c.height);
    let minX=c.width,minY=c.height,maxX=-1,maxY=-1,count=0;
    for(let y=0;y<c.height;y++){
      for(let x=0;x<c.width;x++){
        const p=y*c.width+x,i=p*4,r=arr[i],g=arr[i+1],b=arr[i+2],a=arr[i+3];
        const lum=(r+g+b)/3,sat=Math.max(r,g,b)-Math.min(r,g,b);
        const content=!markBg[p]&&a>18&&(rgbaDist(r,g,b,a,bg)>Math.max(20,bgTol*0.55)||sat>22);
        if(content){ mask[p]=1; count++; if(x<minX) minX=x; if(y<minY) minY=y; if(x>maxX) maxX=x; if(y>maxY) maxY=y; }
      }
    }
    if(count<25){ minX=0; minY=0; maxX=c.width-1; maxY=c.height-1; }
    const pad=Math.round(Math.max(c.width,c.height)*0.02);
    minX=Math.max(0,minX-pad); minY=Math.max(0,minY-pad); maxX=Math.min(c.width-1,maxX+pad); maxY=Math.min(c.height-1,maxY+pad);
    const outW=maxX-minX+1,outH=maxY-minY+1;
    const out=document.createElement("canvas"); out.width=outW; out.height=outH;
    const octx=out.getContext("2d"),outData=octx.createImageData(outW,outH);
    const ink=opts.ink||hexToRgb(getInk());
    for(let y=0;y<outH;y++){
      for(let x=0;x<outW;x++){
        const sx=x+minX,sy=y+minY,sp=sy*c.width+sx,src=sp*4,dst=(y*outW+x)*4;
        if(mask[sp]){
          if(opts.mode==="mono"){ outData.data[dst]=ink[0]; outData.data[dst+1]=ink[1]; outData.data[dst+2]=ink[2]; outData.data[dst+3]=255; }
          else { outData.data[dst]=arr[src]; outData.data[dst+1]=arr[src+1]; outData.data[dst+2]=arr[src+2]; outData.data[dst+3]=255; }
        } else { outData.data[dst]=255; outData.data[dst+1]=255; outData.data[dst+2]=255; outData.data[dst+3]=0; }
      }
    }
    octx.putImageData(outData,0,0);
    callback({dataUrl:out.toDataURL("image/png"),width:outW,height:outH});
  };
  img.src=dataUrl;
}

function processFooterLogo(){
  const modo=$("footerLogoModo")?.value||"mono";
  if(modo==="placeholder"){
    footerLogoData=null;
    footerLogoDataPage1=null;
    renderAll(false);
    return;
  }
  if(!footerLogoSourceData){
    footerLogoData=null;
    footerLogoDataPage1=null;
    renderAll();
    return;
  }
  let pending=2;
  function done(){
    if(--pending<=0) renderAll(false);
  }
  autoCutoutFromDataUrl(footerLogoSourceData,{mode:"mono",ink:hexToRgb("#1f2937"),max:1400},(res)=>{
    footerLogoDataPage1=res.dataUrl;
    footerLogoNaturalW=res.width;
    footerLogoNaturalH=res.height;
    done();
  });
  if(modo==="original"){
    footerLogoData=footerLogoSourceData;
    done();
  } else if(modo==="cutout"){
    autoCutoutFromDataUrl(footerLogoSourceData,{mode:"preserve",removeDarkBg:false,max:2200},(res)=>{
      footerLogoData=res.dataUrl;
      footerLogoNaturalW=res.width;
      footerLogoNaturalH=res.height;
      done();
    });
  } else {
    autoCutoutFromDataUrl(footerLogoSourceData,{mode:"mono",ink:hexToRgb(getFooterInk()),max:1400},(res)=>{
      footerLogoData=res.dataUrl;
      footerLogoNaturalW=res.width;
      footerLogoNaturalH=res.height;
      done();
    });
  }
}

// Processa a imagem carregada em mono (1 cor), usando o elemento de imagem já carregado
function monoProcessCanvas(imgEl, inkHex){
  const max=1400;
  const scale=Math.min(1,max/(imgEl.naturalWidth||imgEl.width||1),max/(imgEl.naturalHeight||imgEl.height||1));
  const c=document.createElement("canvas");
  c.width=Math.max(1,Math.round((imgEl.naturalWidth||imgEl.width)*scale));
  c.height=Math.max(1,Math.round((imgEl.naturalHeight||imgEl.height)*scale));
  const ctx=c.getContext("2d");
  ctx.drawImage(imgEl,0,0,c.width,c.height);
  const data=ctx.getImageData(0,0,c.width,c.height);
  const th=parseInt($("threshold").value||150,10);
  const ink=hexToRgb(inkHex);
  for(let i=0;i<data.data.length;i+=4){
    const r=data.data[i],g=data.data[i+1],b=data.data[i+2],a=data.data[i+3],gray=(r+g+b)/3;
    if(a>15&&gray<th){ data.data[i]=ink[0]; data.data[i+1]=ink[1]; data.data[i+2]=ink[2]; data.data[i+3]=255; }
    else { data.data[i]=255; data.data[i+1]=255; data.data[i+2]=255; data.data[i+3]=0; }
  }
  ctx.putImageData(data,0,0);
  return c.toDataURL("image/png");
}

function processLogo(){
  if(!uploadedImageData){ processedImageData=null; processedImageDataPage1=null; processedImageDataWhite=null; renderAll(false); return; }
  if($("logoModo").value==="placeholder"){ processedImageData=null; processedImageDataPage1=null; processedImageDataWhite=null; renderAll(false); return; }

  const modo=$("logoModo").value;
  const img=new Image();
  img.onload=()=>{
    logoNaturalW=img.naturalWidth||img.width||1000;
    logoNaturalH=img.naturalHeight||img.height||500;

    // 3 variantes em paralelo (p1=grafite, white, p2=modo do usuário)
    let pending=3;
    function done(){
      if(--pending<=0){
        syncDefaultLogoSize("w");
        if(selectedLogo()) syncSelectedLogoSize("w");
        renderAll(false);
      }
    }

    // Pág 1: autoCutout + mono grafite escuro
    autoCutoutFromDataUrl(uploadedImageData,{mode:"mono",ink:hexToRgb("#1f2937"),max:1400},(res)=>{
      processedImageDataPage1=res.dataUrl;
      done();
    });

    // Variante branca (para variações de cor em lonas escuras)
    autoCutoutFromDataUrl(uploadedImageData,{mode:"mono",ink:hexToRgb("#ffffff"),max:1400},(res)=>{
      processedImageDataWhite=res.dataUrl;
      done();
    });

    // Pág 2: depende do modo escolhido pelo usuário
    if(modo==="original"){
      processedImageData=uploadedImageData;
      done();
    } else if(modo==="cutout"){
      autoCutoutFromDataUrl(uploadedImageData,{mode:"preserve",removeDarkBg:false,max:2200},(res)=>{
        processedImageData=res.dataUrl;
        logoNaturalW=res.width; logoNaturalH=res.height;
        done();
      });
    } else {
      autoCutoutFromDataUrl(uploadedImageData,{mode:"mono",ink:hexToRgb(getInk()),max:1400},(res)=>{
        processedImageData=res.dataUrl;
        logoNaturalW=res.width; logoNaturalH=res.height;
        done();
      });
    }
  };
  img.src=uploadedImageData;
}
