function renderAll(updateList=true){
  calcInfo();
  renderCroqui(updateList);
  renderLona();
  renderVariations();
  if(updateList) refreshLogoList();
}

// Quando muda a cor da lona: re-renderiza E re-processa o logo se cor automática
function onCorLonaChange(){
  renderAll();
  if(uploadedImageData && $("logoColorMode").value==="auto") processLogo();
  if(footerLogoSourceData) processFooterLogo();
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded",()=>{
  gerarPreset();
  renderAll();

  // Auto-atualizar ao alterar campos de dimensão, texto e configuração
  ["largura","altura","topWidth","distLateral","distTopo","logoMargin",
   "logoW","logoH","codigoLayout","revisao","logotipoDesc","cliente",
   "data","aprovacao","obs","incluiFooterLogo","footerLogoW","footerLogoH",
   "footerLogoDistBase","footerLogoOffsetX","approvalLogoColorMode","approvalLogoCustomColor"
  ].forEach(id=>{
    const e=document.getElementById(id);
    if(!e) return;
    e.addEventListener("input",()=>renderAll());
    e.addEventListener("change",()=>renderAll());
  });

  // Clicar fora deseleciona
  document.getElementById("sheet")?.addEventListener("click",()=>{
    if(!dragState){ selectedLogoId=null; renderAll(false); }
  });
  document.getElementById("mockup")?.addEventListener("click",()=>{});
});
