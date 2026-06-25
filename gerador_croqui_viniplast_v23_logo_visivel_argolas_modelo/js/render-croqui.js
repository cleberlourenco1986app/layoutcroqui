// Página 1 — Layout para Aprovação (logo escolhido com medidas)
function renderCroqui(updateList=true){
  const f=form(); calcInfo();
  const svg=$("sheet"); svg.innerHTML="";
  const W=595,H=842;

  el("rect",{x:0,y:0,width:W,height:H,fill:"#fff"},svg);

  // Faixa lateral vermelha (topo) + cinza (base)
  const SW=26,SB=490;
  el("rect",{x:0,y:0,width:SW,height:SB,fill:"#c8100a"},svg);
  el("rect",{x:0,y:SB,width:SW,height:H-SB,fill:"#5a5a5a"},svg);

  const cx=SW+(W-SW)/2;

  // Código
  const codeEl=el("text",{x:cx,y:36,"font-size":11,"font-weight":"700","text-anchor":"middle",fill:"#c8100a"},svg);
  codeEl.textContent=f.codigo;

  // Título
  const titleEl=el("text",{x:cx,y:84,"font-size":34,"font-weight":"900","text-anchor":"middle",fill:"#1a1a1a","font-style":"italic"},svg);
  titleEl.textContent="LAYOUT PARA APROVAÇÃO";

  // Logo principal
  const S=selectedLogo()||logos[0]||null;
  const realW=S?Math.round((S.maxW||f.logoW)*((S.scale||100)/100)):Math.round(f.logoW);
  const realH=S?Math.round((S.maxH||f.logoH)*((S.scale||100)/100)):Math.round(f.logoH);
  const logoRatio=(logoNaturalW&&logoNaturalH)?(logoNaturalW/logoNaturalH):(realW/Math.max(1,realH));

  const LMW=400,LMH=310;
  let ldW=LMW,ldH=ldW/logoRatio;
  if(ldH>LMH){ ldH=LMH; ldW=ldH*logoRatio; }
  const logoX=cx-ldW/2,logoY=130;

  // Cota largura
  const dwY=logoY-20;
  el("line",{x1:logoX,y1:dwY,x2:logoX+ldW,y2:dwY,stroke:"#111","stroke-width":0.9},svg);
  el("line",{x1:logoX,y1:dwY-6,x2:logoX,y2:dwY+6,stroke:"#111","stroke-width":0.9},svg);
  el("line",{x1:logoX+ldW,y1:dwY-6,x2:logoX+ldW,y2:dwY+6,stroke:"#111","stroke-width":0.9},svg);
  const dwEl=el("text",{x:cx,y:dwY-5,"font-size":10,"text-anchor":"middle",fill:"#111"},svg);
  dwEl.textContent=`${realW}mm`;

  // Cota altura
  const dhX=logoX-20;
  el("line",{x1:dhX,y1:logoY,x2:dhX,y2:logoY+ldH,stroke:"#111","stroke-width":0.9},svg);
  el("line",{x1:dhX-6,y1:logoY,x2:dhX+6,y2:logoY,stroke:"#111","stroke-width":0.9},svg);
  el("line",{x1:dhX-6,y1:logoY+ldH,x2:dhX+6,y2:logoY+ldH,stroke:"#111","stroke-width":0.9},svg);
  const dhEl=el("text",{x:dhX-9,y:logoY+ldH/2,"font-size":10,"text-anchor":"middle",fill:"#111",transform:`rotate(-90 ${dhX-9} ${logoY+ldH/2})`},svg);
  dhEl.textContent=`${realH}mm`;

  // Imagem do logo — página 1 sempre grafite escuro (processedImageDataPage1)
  const srcCroqui=processedImageDataPage1||processedImageData;
  if($("logoModo").value!=="placeholder"&&srcCroqui){
    el("image",{href:srcCroqui,x:logoX,y:logoY,width:ldW,height:ldH,preserveAspectRatio:"xMidYMid meet"},svg);
  } else {
    el("rect",{x:logoX,y:logoY,width:ldW,height:ldH,rx:4,fill:"none",stroke:"#ccc","stroke-width":1.4,"stroke-dasharray":"6 4"},svg);
    const plEl=el("text",{x:cx,y:logoY+ldH/2+7,"font-size":20,"font-weight":"700","text-anchor":"middle",fill:"#ccc"},svg);
    plEl.textContent="LOGO";
  }

  // Logo parceiro / secundário
  let sectionBottomY=logoY+ldH+30;
  const footerPage1=footerLogoDataPage1||footerLogoData;
  const footerPlaceholder=$("footerLogoModo")?.value==="placeholder";
  if(f.incluiFooterLogo&&(footerPage1||footerPlaceholder)){
    const pRatio=Math.max(0.1,f.footerLogoW)/Math.max(1,f.footerLogoH);
    const pRealW=Math.round(f.footerLogoW),pRealH=Math.round(f.footerLogoH);
    const PMW=170,PMH=120;
    let pW=PMW,pH=pW/pRatio;
    if(pH>PMH){ pH=PMH; pW=pH*pRatio; }
    const pX=cx-pW/2,pY=sectionBottomY+22;
    const pdwY=sectionBottomY+2;
    el("line",{x1:pX,y1:pdwY,x2:pX+pW,y2:pdwY,stroke:"#111","stroke-width":0.8},svg);
    el("line",{x1:pX,y1:pdwY-5,x2:pX,y2:pdwY+5,stroke:"#111","stroke-width":0.8},svg);
    el("line",{x1:pX+pW,y1:pdwY-5,x2:pX+pW,y2:pdwY+5,stroke:"#111","stroke-width":0.8},svg);
    const pdwEl=el("text",{x:cx,y:pdwY-4,"font-size":9,"text-anchor":"middle",fill:"#111"},svg);
    pdwEl.textContent=`${pRealW}mm`;
    const pdhX=pX-16;
    el("line",{x1:pdhX,y1:pY,x2:pdhX,y2:pY+pH,stroke:"#111","stroke-width":0.8},svg);
    el("line",{x1:pdhX-5,y1:pY,x2:pdhX+5,y2:pY,stroke:"#111","stroke-width":0.8},svg);
    el("line",{x1:pdhX-5,y1:pY+pH,x2:pdhX+5,y2:pY+pH,stroke:"#111","stroke-width":0.8},svg);
    const pdhEl=el("text",{x:pdhX-8,y:pY+pH/2,"font-size":9,"text-anchor":"middle",fill:"#111",transform:`rotate(-90 ${pdhX-8} ${pY+pH/2})`},svg);
    pdhEl.textContent=`${pRealH}mm`;
    if(footerPage1&&!footerPlaceholder){
      el("image",{href:footerPage1,x:pX,y:pY,width:pW,height:pH,preserveAspectRatio:"xMidYMid meet"},svg);
    } else {
      el("rect",{x:pX,y:pY,width:pW,height:pH,rx:4,fill:"none",stroke:"#bbb","stroke-width":1.2,"stroke-dasharray":"5 4"},svg);
      const pTxt=el("text",{x:pX+pW/2,y:pY+pH/2+4,"font-size":10,"font-weight":"700","text-anchor":"middle",fill:"#bbb"},svg);
      pTxt.textContent="PARCEIRO";
    }
    sectionBottomY=pY+pH+10;
  }

  // Observações
  if(f.obs&&f.obs.trim()){
    const obsEl=el("text",{x:cx,y:sectionBottomY+18,"font-size":9,"text-anchor":"middle",fill:"#555"},svg);
    obsEl.textContent=`Obs.: ${f.obs.substring(0,120)}`;
  }

  // Rodapé
  const footerY=H-118;
  el("line",{x1:SW+12,y1:footerY,x2:W-16,y2:footerY,stroke:"#e0e0e0","stroke-width":0.8},svg);

  // Aprovação
  const apX=SW+14,apY=footerY+8;
  const a1=el("text",{x:apX,y:apY,"font-size":9.5,"font-weight":"700","text-anchor":"start",fill:"#444"},svg);
  a1.textContent=`Logotipo: ${f.logotipoDesc}`;
  const a2=el("text",{x:apX,y:apY+14,"font-size":9.5,"text-anchor":"start",fill:"#444"},svg);
  a2.textContent=`Data: ${f.data} | Revisão: ${f.revisao}`;
  const a3=el("text",{x:apX,y:apY+34,"font-size":9.5,"font-weight":"700","text-anchor":"start",fill:"#222","font-style":"italic"},svg);
  a3.textContent="APROVAÇÃO DO CLIENTE:";
  [["Resp.:",apY+50],["Empresa:",apY+65],["Data:",apY+80],["Assi.:",apY+95]].forEach(([lbl,ly])=>{
    const ln=el("text",{x:apX,y:ly,"font-size":9,"text-anchor":"start",fill:"#444"},svg);
    ln.textContent=`${lbl} _______________________________`;
  });

  if(updateList) refreshLogoList();
}
