// Gerenciamento de variações de cor da lona (páginas extras no PDF)
// Cada variação = mesma configuração de logo + cor de lona + cor de logo diferentes = nova página

const COR_OPTIONS = [
  ["PT","PT - preta"],["AZ","AZ - azul"],["VD","VD - verde"],["VM","VM - vermelha"],
  ["BR","BR - branca"],["AM","AM - amarela"],["CZ","CZ - cinza"],["LJ","LJ - laranja"]
];

const LOGO_COLOR_OPTIONS = [
  ["auto", "Igual à pág. 2"],
  ["white","Branco"],
  ["black","Grafite/preto"]
];

// Retorna a dataUrl de logo correta para a variação
function getVariationLogoData(v){
  if(!uploadedImageData || $("logoModo")?.value==="placeholder") return null;
  if(v.logoColor==="white") return processedImageDataWhite || processedImageData;
  if(v.logoColor==="black") return processedImageDataPage1 || processedImageData;
  return processedImageData; // "auto" = mesma que a pág. 2
}

function addLonaVariation(){
  const id = Date.now() + Math.floor(Math.random()*10000);
  const cor = $("corLona")?.value || "PT";
  lonaVariations.push({id, cor, logoColor:"auto"});
  insertVariationPageDOM(id);
  renderOneVariation(id);
  refreshVariationList();
}

function removeLonaVariation(id){
  lonaVariations = lonaVariations.filter(v=>v.id!==id);
  const wrap = document.getElementById("varwrap_"+id);
  if(wrap) wrap.parentNode.removeChild(wrap);
  refreshVariationList();
}

function insertVariationPageDOM(id){
  const extrasWrap = document.getElementById("lonaExtrasWrap");
  if(!extrasWrap) return;
  const div = document.createElement("div");
  div.id = "varwrap_"+id;
  div.className = "variation-wrap";
  div.innerHTML =
    `<div class="variation-label" id="varlabel_${id}">` +
      `<b>Pág. ${getVariationPageNum(id)} — Variação de cor</b>` +
    `</div>` +
    `<svg id="lonaVar_${id}" viewBox="0 0 595 842" xmlns="http://www.w3.org/2000/svg" ` +
      `class="lona-var-svg"></svg>`;
  extrasWrap.appendChild(div);
}

function getVariationPageNum(id){
  return 3 + lonaVariations.findIndex(v=>v.id===id);
}

function renderOneVariation(id){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  const svgEl = document.getElementById("lonaVar_"+id);
  if(svgEl) renderLona(svgEl, v.cor, getVariationLogoData(v));
}

function renderVariations(){
  lonaVariations.forEach(v=>renderOneVariation(v.id));
}

function onVariationCorChange(id, cor){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.cor = cor;
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationLogoColorChange(id, logoColor){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.logoColor = logoColor;
  renderOneVariation(id);
}

function refreshVariationList(){
  const box = document.getElementById("variationList");
  if(!box) return;
  box.innerHTML = "";
  lonaVariations.forEach((v, i)=>{
    const corOpts = COR_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${v.cor===val?" selected":""}>${lbl}</option>`
    ).join("");
    const logoOpts = LOGO_COLOR_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${(v.logoColor||"auto")===val?" selected":""}>${lbl}</option>`
    ).join("");
    const div = document.createElement("div");
    div.className = "variation-item";
    div.innerHTML =
      `<span class="var-num">Pág.${3+i}</span>` +
      `<select class="var-cor-sel" title="Cor da lona" onchange="onVariationCorChange(${v.id},this.value)">${corOpts}</select>` +
      `<select class="var-logo-sel" title="Cor do logo" onchange="onVariationLogoColorChange(${v.id},this.value)">${logoOpts}</select>` +
      `<button type="button" class="warn var-rm" onclick="removeLonaVariation(${v.id})">✕</button>`;
    box.appendChild(div);
    // Atualiza o label no SVG
    const lbl = document.getElementById("varlabel_"+v.id);
    if(lbl) lbl.querySelector("b").textContent = `Pág. ${3+i} — Lona: ${v.cor} | Logo: ${v.logoColor||"auto"}`;
  });
}
