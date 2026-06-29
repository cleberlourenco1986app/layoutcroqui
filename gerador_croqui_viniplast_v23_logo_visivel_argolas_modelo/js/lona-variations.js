// Gerenciamento de variações de cor da lona (páginas extras no PDF)
// Cada variação = cor de lona + cor de logo + cor do logo parceiro + posição do logo

const COR_OPTIONS = [
  ["PT","PT - preta"],["AZ","AZ - azul"],["VD","VD - verde"],["VM","VM - vermelha"],
  ["BR","BR - branca"],["AM","AM - amarela"],["CZ","CZ - cinza"],["LJ","LJ - laranja"]
];

const LOGO_COLOR_OPTIONS = [
  ["auto","Igual à pág. 2"],["white","Branco"],["black","Grafite/preto"],["custom","Personalizada"]
];

const PARTNER_COLOR_OPTIONS = [
  ["auto","Parceiro: pág. 2"],["black","Grafite/preto"],["white","Branco"],["custom","Personalizada"]
];

// ── logo principal ──────────────────────────────────────────────────────────

const ACABAMENTO_OPTIONS = [
  ["argolas","Argolas"],["ilhoses","Ilhoses"],["especial","Especial"]
];

function getVariationLogoData(v){
  if(!uploadedImageData || $("logoModo")?.value==="placeholder") return null;
  if(v.logoColor==="white") return processedImageDataWhite || processedImageData;
  if(v.logoColor==="black") return processedImageDataBlack || processedImageDataPage1 || processedImageData;
  if(v.logoColor==="custom") return v.logoDataUrl || processedImageData;
  return processedImageData; // "auto"
}

// ── logo parceiro ───────────────────────────────────────────────────────────

function getVariationPartnerLogoData(v){
  // undefined → renderLona usa footerLogoData global
  if(!footerLogoSourceData) return undefined;
  if($("footerLogoModo")?.value==="placeholder") return undefined;
  if(v.partnerLogoColor==="black") return footerLogoDataPage1 || footerLogoData;
  if(v.partnerLogoColor==="white" || v.partnerLogoColor==="custom") {
    return v.partnerLogoDataUrl || footerLogoData;
  }
  return undefined; // "auto" → usa global
}

// ── adicionar / remover variação ────────────────────────────────────────────

function addLonaVariation(){
  const id = Date.now() + Math.floor(Math.random()*10000);
  const cor = $("corLona")?.value || "PT";
  lonaVariations.push({
    id, cor,
    acabamento:$("acabamento")?.value||"argolas",
    lonaW:null, lonaH:null,
    logoColor:"auto", logoCustomColor:"#ffffff", logoDataUrl:null,
    logoX:null, logoY:null,
    partnerLogoColor:"auto", partnerCustomColor:"#ffffff", partnerLogoDataUrl:null
  });
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

// ── renderização ────────────────────────────────────────────────────────────

function renderOneVariation(id){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  const svgEl = document.getElementById("lonaVar_"+id);
  if(!svgEl) return;

  const hasPos = v.logoX != null || v.logoY != null;
  const logosOverride = hasPos
    ? logos.map(l => Object.assign({}, l,
        v.logoX != null ? {x: v.logoX} : {},
        v.logoY != null ? {y: v.logoY} : {}))
    : null;

  const formOverride = {
    acabamento:v.acabamento||$("acabamento")?.value||"argolas"
  };
  if(v.lonaW != null) formOverride.w = v.lonaW;
  if(v.lonaH != null) formOverride.h = v.lonaH;

  renderLona(svgEl, v.cor, getVariationLogoData(v), logosOverride, getVariationPartnerLogoData(v), {
    form:formOverride
  });
}

function renderVariations(){
  lonaVariations.forEach(v=>renderOneVariation(v.id));
}

// ── handlers de mudança ─────────────────────────────────────────────────────

function onVariationCorChange(id, cor){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.cor = cor;
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationAcabamentoChange(id, acabamento){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.acabamento = acabamento;
  renderOneVariation(id);
  refreshVariationList();
}

function parseVariationSizeValue(val){
  if(val===''||val==null) return null;
  const n = parseFloat(String(val).replace(",","."));
  return Number.isFinite(n) && n>0 ? n : null;
}

function onVariationLonaWChange(id, val){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.lonaW = parseVariationSizeValue(val);
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationLonaHChange(id, val){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.lonaH = parseVariationSizeValue(val);
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationLogoColorChange(id, logoColor){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.logoColor = logoColor;
  refreshVariationList();
  renderOneVariation(id);
}

function onVariationCustomColorChange(id, color){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.logoCustomColor = color;
  if(!uploadedImageData || $("logoModo")?.value==="placeholder") return;
  autoCutoutFromDataUrl(uploadedImageData, {mode:"mono", ink:hexToRgb(color), max:1400}, (res)=>{
    v.logoDataUrl = res.dataUrl;
    renderOneVariation(id);
  });
}

function onVariationLogoXChange(id, val){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.logoX = (val===''||val==null) ? null : parseFloat(val);
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationLogoYChange(id, val){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.logoY = (val===''||val==null) ? null : parseFloat(val);
  renderOneVariation(id);
  refreshVariationList();
}

function onVariationPartnerLogoColorChange(id, color){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.partnerLogoColor = color;
  if(color==="white" && footerLogoSourceData){
    autoCutoutFromDataUrl(footerLogoSourceData, {mode:"mono", ink:hexToRgb("#ffffff"), max:1400}, (res)=>{
      v.partnerLogoDataUrl = res.dataUrl;
      refreshVariationList();
      renderOneVariation(id);
    });
    return;
  }
  refreshVariationList();
  renderOneVariation(id);
}

function onVariationPartnerCustomColorChange(id, color){
  const v = lonaVariations.find(v=>v.id===id);
  if(!v) return;
  v.partnerCustomColor = color;
  if(!footerLogoSourceData) return;
  autoCutoutFromDataUrl(footerLogoSourceData, {mode:"mono", ink:hexToRgb(color), max:1400}, (res)=>{
    v.partnerLogoDataUrl = res.dataUrl;
    renderOneVariation(id);
  });
}

// ── UI da lista de variações ────────────────────────────────────────────────

function refreshVariationList(){
  const box = document.getElementById("variationList");
  if(!box) return;
  box.innerHTML = "";
  lonaVariations.forEach((v, i)=>{
    const corOpts = COR_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${v.cor===val?" selected":""}>${lbl}</option>`).join("");
    const logoOpts = LOGO_COLOR_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${(v.logoColor||"auto")===val?" selected":""}>${lbl}</option>`).join("");
    const partnerOpts = PARTNER_COLOR_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${(v.partnerLogoColor||"auto")===val?" selected":""}>${lbl}</option>`).join("");
    const acabamentoOpts = ACABAMENTO_OPTIONS.map(([val,lbl])=>
      `<option value="${val}"${(v.acabamento||"argolas")===val?" selected":""}>${lbl}</option>`).join("");
    const isCustomLogo    = (v.logoColor||"auto")==="custom";
    const isCustomPartner = (v.partnerLogoColor||"auto")==="custom";

    const div = document.createElement("div");
    div.className = "variation-item";
    div.innerHTML =
      `<div class="var-main-row">` +
        `<span class="var-num">Pág.${3+i}</span>` +
        `<select class="var-cor-sel" title="Cor da lona" onchange="onVariationCorChange(${v.id},this.value)">${corOpts}</select>` +
        `<select class="var-acab-sel" title="Acabamento" onchange="onVariationAcabamentoChange(${v.id},this.value)">${acabamentoOpts}</select>` +
        `<select class="var-logo-sel" title="Cor do logo" onchange="onVariationLogoColorChange(${v.id},this.value)">${logoOpts}</select>` +
        `<input type="color" class="var-custom-color" title="Cor personalizada do logo"` +
          ` value="${v.logoCustomColor||'#ffffff'}" style="display:${isCustomLogo?'inline-block':'none'}"` +
          ` oninput="onVariationCustomColorChange(${v.id},this.value)">` +
        `<select class="var-partner-sel" title="Cor do logo parceiro" onchange="onVariationPartnerLogoColorChange(${v.id},this.value)">${partnerOpts}</select>` +
        `<input type="color" class="var-partner-color" title="Cor personalizada do parceiro"` +
          ` value="${v.partnerCustomColor||'#ffffff'}" style="display:${isCustomPartner?'inline-block':'none'}"` +
          ` oninput="onVariationPartnerCustomColorChange(${v.id},this.value)">` +
        `<button type="button" class="warn var-rm" onclick="removeLonaVariation(${v.id})">✕</button>` +
      `</div>` +
      `<div class="var-size-row">` +
        `<label>Lona tam.:</label>` +
        `<input type="number" class="var-size-w" placeholder="Comp. m" title="Comprimento da lona desta pagina extra"` +
          ` min="0.01" step="0.01" value="${v.lonaW!=null?v.lonaW:''}"` +
          ` onchange="onVariationLonaWChange(${v.id},this.value)">` +
        `<input type="number" class="var-size-h" placeholder="Larg. m" title="Largura total da lona desta pagina extra"` +
          ` min="0.01" step="0.01" value="${v.lonaH!=null?v.lonaH:''}"` +
          ` onchange="onVariationLonaHChange(${v.id},this.value)">` +
      `</div>` +
      `<div class="var-pos-row">` +
        `<label>Logo pos.:</label>` +
        `<input type="number" class="var-pos-x" placeholder="X%" title="Posição X do logo (0-100%)"` +
          ` min="0" max="100" step="1" value="${v.logoX!=null?v.logoX:''}"` +
          ` onchange="onVariationLogoXChange(${v.id},this.value)">` +
        `<input type="number" class="var-pos-y" placeholder="Y%" title="Posição Y do logo (0-100%)"` +
          ` min="0" max="100" step="1" value="${v.logoY!=null?v.logoY:''}"` +
          ` onchange="onVariationLogoYChange(${v.id},this.value)">` +
      `</div>`;
    box.appendChild(div);

    // Atualiza label no SVG
    const lbl = document.getElementById("varlabel_"+v.id);
    if(lbl){
      let posInfo=(v.logoX!=null||v.logoY!=null)?` | X:${v.logoX??'-'} Y:${v.logoY??'-'}`:'';
      const sizeInfo=(v.lonaW!=null||v.lonaH!=null)?` | Tam.: ${v.lonaW??form().w} x ${v.lonaH??form().h} m`:'';
      posInfo=sizeInfo+posInfo;
      lbl.querySelector("b").textContent =
        `Pág. ${3+i} — Lona: ${v.cor} | Acab.: ${v.acabamento||"argolas"} | Logo: ${v.logoColor||"auto"} | Parceiro: ${v.partnerLogoColor||"auto"}${posInfo}`;
    }
  });
}
