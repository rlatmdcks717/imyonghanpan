
/* ===== 점자 데이터 (보내 주신 점자표에서 점 위치를 읽어 옮김) =====
   점 번호: 왼쪽 위부터 1·2·3, 오른쪽 위부터 4·5·6. 여러 칸은 배열로. */
const BR_RAW={
  "초성":[["ㄱ","4"],["ㄴ","14"],["ㄷ","24"],["ㄹ","5"],["ㅁ","15"],["ㅂ","45"],["ㅅ","6"],["ㅈ","46"],["ㅊ","56"],["ㅋ","124"],["ㅌ","125"],["ㅍ","145"],["ㅎ","245"],["된소리","6"]],
  "받침":[["ㄱ","1"],["ㄴ","25"],["ㄷ","35"],["ㄹ","2"],["ㅁ","26"],["ㅂ","12"],["ㅅ","3"],["ㅇ","2356"],["ㅈ","13"],["ㅊ","23"],["ㅋ","235"],["ㅌ","236"],["ㅍ","256"],["ㅎ","356"]],
  "모음":[["ㅏ","126"],["ㅑ","345"],["ㅓ","234"],["ㅕ","156"],["ㅗ","136"],["ㅛ","346"],["ㅜ","134"],["ㅠ","146"],["ㅡ","246"],["ㅣ","135"],
          ["ㅐ","1235"],["ㅔ","1345"],["ㅚ","13456"],["ㅘ","1236"],["ㅝ","1234"],["ㅢ","2456"],["ㅖ","34"],["ㅟ","134 1235"],["ㅒ","345 1235"],["ㅙ","1236 1235"],["ㅞ","1234 1235"]],
  "약자":[["가","1246"],["나","14"],["다","24"],["마","15"],["바","45"],["사","123"],["자","46"],["카","124"],["타","125"],["파","145"],["하","245"],["것","456 234"],["ㅆ받침","34"],
          ["억","1456"],["언","23456"],["얼","2345"],["연","16"],["열","1256"],["영","12456"],["옥","1346"],["온","12356"],["옹","123456"],["운","1245"],["울","12346"],["은","1356"],["을","2346"],["인","12345"]],
  "약어":[["그래서","1 234"],["그러나","1 14"],["그러면","1 25"],["그러므로","1 26"],["그런데","1 1345"],["그리고","1 136"],["그리하여","1 156"]],
  "문장부호":[["“","236"],["”","356"],["‘","6 236"],["’","356 3"],["~","36 36"],["줄임표 …","6 6 6"],["(","36"],[")","36"],["!","235"],
          [".","256"],[",","5"],["?","236"],[":","5 2"],[";","56 23"],["-","36"],["밑줄 시작","6 36"],["밑줄 끝","36 3"],["※","35 35"]],
  "숫자":[["수표","3456"],["1","1"],["2","12"],["3","14"],["4","145"],["5","15"],["6","124"],["7","1245"],["8","125"],["9","24"],["0","245"],["숫자 .","3"],["숫자 ,","2"]],
  "연산":[["+","26"],["−","35"],["×","16"],["÷","34 34"],["=","25 25"]],
  "영어":[["로마자표","356"],["대문자표","6"],["이중대문자표","6 6"],["a","1"],["b","12"],["c","14"],["d","145"],["e","15"],["f","124"],["g","1245"],["h","125"],["i","24"],["j","245"],["k","13"],
          ["l","123"],["m","134"],["n","1345"],["o","135"],["p","1234"],["q","12345"],["r","1235"],["s","234"],["t","2345"],["u","136"],["v","1236"],["w","2456"],["x","1346"],["y","13456"],["z","1356"]]
};
const BR={},BR_ORDER=[];
for(const [g,list] of Object.entries(BR_RAW))for(const [l,c] of list){const id=g+":"+l;BR[id]={id,g,l,c:c.split(" ")};BR_ORDER.push(id);}
const BR_BY={};   // 점형(칸들을 | 로 이은 것) → 항목들
for(const id of BR_ORDER){const k=BR[id].c.join("|");(BR_BY[k]=BR_BY[k]||[]).push(id);}
const BR_SOURCE="점형 출처: 보내 주신 점자표 (원 출처 확인 필요). 일부 문장부호·숫자 기호는 현행 「한국 점자 규정」과 다를 수 있어요.";
const brIds=(g,ex=[])=>BR_RAW[g].map(([l])=>g+":"+l).filter(id=>!ex.includes(id));
const BR_NUMQ=BR_RAW["숫자"].slice(1,11).map(([l])=>"숫자:"+l);   // 1~0 (수표와 함께 보여 줌)

/* 점 한 칸 그리기 */
function bcell(d,cls=""){
  const on=new Set(String(d).split(""));
  return `<span class="bc ${cls}" aria-hidden="true">${[1,2,3,4,5,6].map(n=>`<i class="${on.has(String(n))?"on":""}"></i>`).join("")}</span>`;
}
const bcells=(cells,cls="")=>`<span class="bcs ${cls}">${cells.map(d=>bcell(d)).join("")}</span>`;
const dotsText=d=>d&&d!=="0"?"점 "+d.split("").join("·"):"빈칸";

/* ----- 점자표 ----- */
const BR_CHART_GROUPS=[["초성","자음 (첫소리)"],["받침","자음 (받침)"],["모음","모음"],["약자","약자"],["약어","약어"],["문장부호","문장부호"],["숫자","숫자"],["연산","연산 기호"],["영어","영어"]];
function bChart(){
  return `
  <div class="bar"><span>점 번호: 왼쪽 1·2·3, 오른쪽 4·5·6</span>
    <label class="switch"><input type="checkbox" id="hide" ${S.hide?"checked":""}> 글자 가리기</label></div>
  <div class="chips jump">${BR_CHART_GROUPS.map(([g,t])=>`<a href="#b-${g}" data-jump="b-${g}">${t}</a>`).join("")}</div>
  ${BR_CHART_GROUPS.map(([g,t])=>`
  <section class="sect" id="b-${g}"><h3>${t}</h3>
    ${g==="약자"?`<p class="src">모음 ‘ㅏ’는 헷갈리지 않는 범위에서 생략해요. 단, ‘ㄹ’과 ‘ㅊ’에는 ‘ㅏ’를 생략하지 않아요.</p>`:""}
    ${g==="숫자"?`<p class="src">숫자 앞에는 수표(점 3·4·5·6)를 먼저 써요.</p>`:""}
    <div class="bgrid">${BR_RAW[g].map(([l])=>{const e=BR[g+":"+l],k="b"+e.id;
      return `<button class="btile ${S.hide?"hide":""} ${S.shown[k]?"show":""}" data-j="${esc(k)}" aria-label="${S.hide&&!S.shown[k]?"가려진 글자 보기":esc(l)}">${bcells(e.c)}<b>${esc(l)}</b><small>${esc(e.c.map(dotsText).join(" + "))}</small></button>`;}).join("")}</div>
  </section>`).join("")}
  <p class="src">${BR_SOURCE}</p>`;
}

/* ----- 찍어 보기 ----- */
S.bt={cur:"",seq:[],pick:null};
const sortDots=s=>[...new Set(s.split(""))].filter(x=>"123456".includes(x)).sort().join("");
function toggleDot(n){const s=new Set(S.bt.cur.split("").filter(Boolean));s.has(n)?s.delete(n):s.add(n);S.bt.cur=sortDots([...s].join(""));}
function candHTML(key,title){
  const ids=BR_BY[key]||[];
  if(!ids.length)return `<p class="src">${title}: 표에 같은 점형이 없어요.</p>`;
  return `<div class="cands"><span class="src">${title}</span>${ids.map(id=>`<span class="cand"><em>${BR[id].g}</em>${esc(BR[id].l)}</span>`).join("")}</div>`;
}
function typer(){
  const b=S.bt;
  const multi=[];
  for(let k=Math.min(3,b.seq.length);k>=2;k--){const key=b.seq.slice(-k).join("|");(BR_BY[key]||[]).forEach(id=>multi.push(id));}
  const picked=b.pick!=null&&b.seq[b.pick]!=null?b.seq[b.pick]:null;
  return `
  <div><h2 class="h-big">점자 찍어 보기</h2><p class="sub-txt">점을 눌러 한 칸을 만들고 ‘칸 넣기’를 누르세요. 아래에 그 점형이 무슨 뜻인지 보여 줘요.</p></div>
  <div class="paper" aria-label="찍은 점자">
    ${b.seq.length?b.seq.map((d,i)=>`<button class="pcell ${b.pick===i?"sel":""}" data-pick="${i}" aria-label="${i+1}번째 칸 ${dotsText(d)}">${bcell(d)}</button>`).join(""):`<span class="src">아직 찍은 칸이 없어요.</span>`}
  </div>
  ${picked!=null?candHTML(picked,`${b.pick+1}번째 칸 (${dotsText(picked)})`):""}
  ${multi.length?`<div class="cands"><span class="src">이어진 칸으로 읽으면</span>${multi.map(id=>`<span class="cand"><em>${BR[id].g}</em>${esc(BR[id].l)}</span>`).join("")}</div>`:""}
  <div class="writer">
    <div class="dots6" role="group" aria-label="점 6개">${[1,4,2,5,3,6].map(n=>`<button class="dot ${b.cur.includes(String(n))?"on":""}" data-dot="${n}" aria-pressed="${b.cur.includes(String(n))}">${n}</button>`).join("")}</div>
    <div class="wside">
      <p class="dtxt">${b.cur?dotsText(b.cur):"점을 눌러 보세요"}</p>
      ${b.cur?candHTML(b.cur,"이 점형의 뜻"):""}
    </div>
  </div>
  <div class="row2"><button class="btn ghost" id="bClear">점 지우기</button><button class="btn" id="bPut">칸 넣기</button></div>
  <div class="row2"><button class="btn ghost" id="bBack">한 칸 지우기</button><button class="btn ghost" id="bAll">모두 지우기</button></div>
  <p class="src kbd">키보드: F·D·S·J·K·L = 점 1·2·3·4·5·6. 점자 타자기처럼 여러 키를 동시에 눌렀다 떼면 한 칸이 들어가요. 스페이스는 빈칸, 백스페이스는 한 칸 지우기.</p>
  <p class="src">${BR_SOURCE}</p>`;
}
function wireBraille(){
  const $=s=>app.querySelector(s);
  app.querySelectorAll("[data-jump]").forEach(a=>a.onclick=e=>{e.preventDefault();const el=document.getElementById(a.dataset.jump);if(el)scrollTo({top:el.getBoundingClientRect().top+scrollY-12,behavior:"smooth"});});
  app.querySelectorAll(".btile").forEach(t=>t.onclick=()=>{if(!S.hide)return;S.shown[t.dataset.j]=!S.shown[t.dataset.j];render();});
  app.querySelectorAll("[data-dot]").forEach(d=>d.onclick=()=>{toggleDot(d.dataset.dot);render();});
  app.querySelectorAll("[data-pick]").forEach(p=>p.onclick=()=>{const i=+p.dataset.pick;S.bt.pick=S.bt.pick===i?null:i;render();});
  const put=$("#bPut");if(put)put.onclick=()=>{S.bt.seq.push(S.bt.cur||"0");S.bt.cur="";S.bt.pick=null;render();};
  const cl=$("#bClear");if(cl)cl.onclick=()=>{S.bt.cur="";render();};
  const bk=$("#bBack");if(bk)bk.onclick=()=>{S.bt.seq.pop();S.bt.pick=null;render();};
  const al=$("#bAll");if(al)al.onclick=()=>{S.bt={cur:"",seq:[],pick:null};render();};
}
/* 점자 타자기 키보드 입력 */
const KEYDOT={KeyF:"1",KeyD:"2",KeyS:"3",KeyJ:"4",KeyK:"5",KeyL:"6"};
let held=new Set(),chord="";
function typingActive(){return S.view==="room"&&S.subject==="braille"&&S.tab==="type";}
function writeActive(){return S.view==="play"&&S.game&&!S.game.done&&S.game.st.type==="write"&&!S.game.answered;}
document.addEventListener("keydown",e=>{
  if(e.target&&e.target.tagName==="INPUT")return;
  const d=KEYDOT[e.code];
  if(typingActive()){
    if(d){e.preventDefault();if(!e.repeat){held.add(e.code);chord=sortDots(chord+d);S.bt.cur=chord;render();}}
    else if(e.code==="Space"){e.preventDefault();S.bt.seq.push("0");S.bt.cur="";render();}
    else if(e.code==="Backspace"){e.preventDefault();S.bt.seq.pop();render();}
  }else if(writeActive()&&d&&!e.repeat){e.preventDefault();const s=new Set((S.game.sel||"").split("").filter(Boolean));s.has(d)?s.delete(d):s.add(d);S.game.sel=sortDots([...s].join(""));render();}
});
document.addEventListener("keyup",e=>{
  if(!typingActive()||!KEYDOT[e.code])return;
  held.delete(e.code);
  if(!held.size&&chord){S.bt.seq.push(chord);chord="";S.bt.cur="";render();}
});

/* ----- 점자 스테이지 ----- */
const BR_CV=[...brIds("초성",["초성:된소리"]),...brIds("받침"),...brIds("모음")];
const BR_SINGLE=BR_CV.filter(id=>BR[id].c.length===1);
const BR_ABC="abcdefghijklmnopqrstuvwxyz".split("").map(c=>"영어:"+c);
STAGES.push(
  {grp:"자음·모음",id:"b1",name:"첫소리 자음",desc:"점형 보고 초성 고르기",type:"pick",kind:"br",pool:brIds("초성",["초성:된소리"]),badge:"초성:ㄱ"},
  {grp:"자음·모음",id:"b2",name:"받침 자음",desc:"점형 보고 받침 고르기",type:"pick",kind:"br",pool:brIds("받침"),badge:"받침:ㅇ"},
  {grp:"자음·모음",id:"b3",name:"모음",desc:"점형 보고 모음 고르기 · 두 칸 모음 포함",type:"pick",kind:"br",pool:brIds("모음"),badge:"모음:ㅏ"},
  {grp:"자음·모음",id:"b4",name:"점형 찾기",desc:"글자 보고 알맞은 점형 고르기",type:"reverse",kind:"br",pool:BR_CV,showGroup:true,badge:"모음:ㅗ"},
  {grp:"자음·모음",id:"b5",name:"직접 찍기",desc:"글자를 보고 점 6개를 직접 찍기",type:"write",kind:"br",pool:BR_SINGLE,showGroup:true,badge:"받침:ㅎ"},
  {grp:"약자·약어",id:"b6",name:"약자",desc:"점형 보고 약자 고르기",type:"pick",kind:"br",pool:brIds("약자"),badge:"약자:가"},
  {grp:"약자·약어",id:"b7",name:"약자 점형 찾기",desc:"약자 보고 알맞은 점형 고르기",type:"reverse",kind:"br",pool:brIds("약자"),badge:"약자:영"},
  {grp:"약자·약어",id:"b8",name:"약어",desc:"그래서, 그러나 등 7개",type:"pick",kind:"br",pool:brIds("약어"),badge:"약어:그래서"},
  {grp:"숫자·영어",id:"b9",name:"숫자",desc:"수표와 함께 쓴 숫자 읽기",type:"pick",kind:"br",pool:BR_NUMQ,numPrefix:true,badge:"숫자:수표"},
  {grp:"숫자·영어",id:"b10",name:"영어 알파벳",desc:"점형 보고 알파벳 고르기",type:"pick",kind:"br",pool:BR_ABC,badge:"영어:a"},
  {grp:"숫자·영어",id:"b11",name:"알파벳 점형 찾기",desc:"알파벳 보고 알맞은 점형 고르기",type:"reverse",kind:"br",pool:BR_ABC,badge:"영어:z"}
);
const BCATS=[
  {id:"jm",name:"자음·모음",desc:"초성, 받침, 모음 · 직접 찍기",groups:["자음·모음"],col:"purple",kind:"br",badge:"모음:ㅏ"},
  {id:"ab",name:"약자·약어",desc:"가, 억, 그래서 같은 줄임 점자",groups:["약자·약어"],col:"blue",kind:"br",badge:"약자:가"},
  {id:"ne",name:"숫자·영어",desc:"수표와 숫자, 알파벳",groups:["숫자·영어"],col:"orange",kind:"br",badge:"숫자:수표"}
];
const brCells=(st,id)=>(st.numPrefix?["3456"]:[]).concat(BR[id].c);
const brLabel=(st,id)=>(st.showGroup&&["초성","받침","모음"].includes(BR[id].g)?BR[id].g+" ":"")+BR[id].l;
