function form(){
  return {
    w:parseFloat($("largura").value||0),
    h:parseFloat($("altura").value||0),
    cor:$("corLona").value,
    material:$("material").value,
    acabamento:$("acabamento").value,
    distLateral:parseFloat($("distLateral").value||50),
    distTopo:parseFloat($("distTopo").value||33),
    topWidth:parseFloat($("topWidth").value||2.5),
    logoMargin:parseFloat($("logoMargin").value||0.15),
    logoW:parseFloat($("logoW").value||1200),
    logoH:parseFloat($("logoH").value||580),
    approvalLogoColorMode:$("approvalLogoColorMode")?.value||"black",
    approvalLogoCustomColor:$("approvalLogoCustomColor")?.value||"#1f2937",
    presetMode:$("presetMode").value,
    incluiFooterLogo:$("incluiFooterLogo").value==="sim",
    footerLogoW:parseFloat($("footerLogoW").value||320),
    footerLogoH:parseFloat($("footerLogoH").value||160),
    footerLogoDistBase:parseFloat($("footerLogoDistBase")?.value||1500),
    footerLogoOffsetX:parseFloat($("footerLogoOffsetX").value||0),
    codigo:$("codigoLayout").value||"CÓD.: 000000 - CLIENTE",
    revisao:$("revisao").value||"00",
    logotipoDesc:$("logotipoDesc").value||"Nome do cliente",
    cliente:$("cliente").value||"Nome do cliente",
    data:$("data").value||"__/__/____",
    aprovacao:$("aprovacao").value||"____________________",
    obs:$("obs").value||""
  };
}

function aplicarMaterial(){
  const map={"Cargolight":100,"SuperCargo":50,"Sollar Acqua":70,"Linha Sollar":50,"G320 e K370":50,"SuperForte":50};
  const m=$("material").value;
  if(map[m]){
    $("distLateral").value=map[m];
    $("distTopo").value=$("acabamento").value==="argolas" ? 33 : map[m];
  }
  renderAll();
}

function aplicarAcabamento(){
  if($("acabamento").value==="argolas"){ $("distLateral").value=50; $("distTopo").value=33; }
  if($("acabamento").value==="ilhoses"){ $("distLateral").value=50; $("distTopo").value=50; }
  renderAll();
}

function calcInfo(){
  const f=form();
  const lateralH=(f.h-f.topWidth)/2;
  const safeLatH=Math.max(0,lateralH-2*f.logoMargin);
  const modo=f.presetMode==="4" ? "4 logos (laterais + topo + base)" : "3 logos (lateral + topo + base)";
  $("areaInfo").textContent=lateralH>0
    ? `Laterais: usar COMPRIMENTO ${f.w.toFixed(2)} m x faixa útil ${safeLatH.toFixed(2)} m. Topo/base: usar LARGURA ${f.topWidth.toFixed(2)} m com recuo de 15 cm. Padrão atual: ${modo}.`
    : `Atenção: a largura total do material precisa ser maior que a largura da carroceria (${f.topWidth.toFixed(2)} m).`;
}
