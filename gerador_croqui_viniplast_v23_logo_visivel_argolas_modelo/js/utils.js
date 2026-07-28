function $(id){ return document.getElementById(id); }

function el(name, attrs={}, parent=null){
  const n=document.createElementNS(NS,name);
  Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));
  if(parent) parent.appendChild(n);
  return n;
}

function text(parent, str, x, y, size=14, weight="400", anchor="start", fill="#111", rotate=null, cls=""){
  const a={x,y,"font-size":size,"font-family":"Arial, Helvetica, sans-serif","font-weight":weight,"text-anchor":anchor,fill};
  if(rotate!==null) a.transform=`rotate(${rotate} ${x} ${y})`;
  if(cls) a.class=cls;
  // Calcular cor de contorno para melhor contraste
  try{
    const rgb=hexToRgb(fill||"#111");
    const lum=(0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2]);
    const outline = lum<150 ? "#ffffff" : "#000000";
    const strokeW = Math.max(0.4, Math.min(1.2, size*0.08));
    a.stroke = outline; a["stroke-width"] = strokeW; a["paint-order"] = "stroke fill"; a["stroke-linejoin"] = "round";
  }catch(e){}
  const t=el("text",a,parent); t.textContent=str; return t;
}

function wrapText(parent, str, x, y, maxW, size=12, lineH=16, cls="", anchor="start", fill="#111"){
  const words=(str||"").split(/\s+/); let line="", lines=[];
  words.forEach(w=>{ const test=line?line+" "+w:w; if(test.length*size*.55>maxW && line){lines.push(line); line=w;} else line=test; });
  if(line) lines.push(line);
  lines.slice(0,10).forEach((l,i)=>text(parent,l,x,y+i*lineH,size,"400",anchor,fill,null,cls));
}

// Renderiza texto com suporte a quebras manuais, bullets (- ) e formatação básica
// Suporta **negrito** e *itálico* inline.
function renderFormattedText(parent, str, x, y, maxW, size=12, lineH=16, options={}){
  const anchor = options.anchor||"start";
  const fill = options.fill||"#111";
  const maxLines = options.maxLines||10;
  if(!str) return;
  // iremos criar um elemento <text> separado para cada linha com posição absoluta (y),
  // usando o helper text() para garantir contorno/stroke automático.

  function splitParagraph(p){
    // detecta bullets
    const isBullet = p.trim().startsWith("- ");
    const content = isBullet ? p.trim().replace(/^\-\s+/,"") : p;
    // preservar parágrafos vazios (duas quebras -> linha em branco)
    if(String(content).trim()==="") return [""];
    // Wrap similar to wrapText
    const words = (content||"").split(/\s+/);
    let line = "", lines = [];
    words.forEach(w=>{ const test=line?line+" "+w:w; if(test.length*size*.55>maxW && line){lines.push(line); line=w;} else line=test; });
    if(line) lines.push(line);
    if(isBullet){ return lines.map((l,i)=> (i===0?"• "+l:"  "+l)); }
    return lines;
  }

  function parseInlineParts(line){
    const parts = [];
    let rest = line;
    const re = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
    let match, lastIndex=0;
    while((match=re.exec(rest)) !== null){
      const idx = match.index;
      if(idx>lastIndex){ parts.push({text: rest.substring(lastIndex, idx), weight:"400", style:"normal"}); }
      if(match[2]) parts.push({text: match[2], weight:"700", style:"normal"});
      else if(match[4]) parts.push({text: match[4], weight:"400", style:"italic"});
      lastIndex = re.lastIndex;
    }
    if(lastIndex < rest.length){ parts.push({text: rest.substring(lastIndex), weight:"400", style:"normal"}); }
    return parts.filter(p=>p.text!="");
  }

  const paragraphs = String(str).split(/\r?\n/);
  let lineCount = 0;
  let lastTextEl = null;
  for(const p of paragraphs){
    const lines = splitParagraph(p);
    for(const ln of lines){
      if(lineCount>=maxLines){
        // append ellipsis to previous line's last tspan
        if(lastTextEl){
          const lastChild = lastTextEl.lastChild;
          if(lastChild) lastChild.textContent = String(lastChild.textContent || "") + " ...";
        }
        return;
      }
      const yLine = y + lineCount*lineH;
      const txtLine = text(parent, "", x, yLine, size, "400", anchor, fill);
      lastTextEl = txtLine;
      const parts = parseInlineParts(ln);
      if(parts.length===0){
        const sp = document.createElementNS(NS, 'tspan');
        sp.textContent = '\u00A0'; // non-breaking space to force an empty line render
        txtLine.appendChild(sp);
      }
      parts.forEach(part=>{
        const sp = document.createElementNS(NS, 'tspan');
        if(part.weight) sp.setAttribute('font-weight', part.weight);
        if(part.style && part.style!=='normal') sp.setAttribute('font-style', part.style);
        sp.textContent = part.text;
        txtLine.appendChild(sp);
      });
      lineCount++;
    }
  }
}

function codeColor(code){
  return {PT:"#111111",AZ:"#135aa3",VD:"#1d7a35",VM:"#b00000",BR:"#fafafa",AM:"#f0c400",CZ:"#9a9a9a",LJ:"#e87922"}[code]||"#ddd";
}

function autoInk(code){
  if(!code) return "#1f2937";
  // If color is a hex code, compute luminance and return white for dark backgrounds
  if(typeof code === "string" && code.trim().startsWith("#")){
    const [r,g,b]=hexToRgb(code);
    const lum=(0.299*r+0.587*g+0.114*b);
    return lum<150 ? "#ffffff" : "#1f2937";
  }
  return ["PT","AZ","VD","VM"].includes(code) ? "#f7f7f7" : "#1f2937";
}

function hexToRgb(hex){
  const h=(hex||"#1f2937").replace("#","").trim();
  const s=h.length===3 ? h.split("").map(c=>c+c).join("") : h;
  const n=parseInt(s,16);
  if(!isFinite(n)) return [31,41,55];
  return [(n>>16)&255,(n>>8)&255,n&255];
}

function getInk(){
  const mode=$("logoColorMode").value;
  if(mode==="white") return "#ffffff";
  if(mode==="black") return "#1f2937";
  if(mode==="custom") return $("logoCustomColor").value||"#1f2937";
  return autoInk($("corLona").value);
}

function getApprovalLogoInk(){
  const mode=$("approvalLogoColorMode")?.value||"black";
  if(mode==="white") return "#ffffff";
  if(mode==="custom") return $("approvalLogoCustomColor")?.value||"#1f2937";
  return "#1f2937";
}

function showGuides(){ return $("showGuides").checked; }

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
