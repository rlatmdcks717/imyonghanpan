/* ===== 교육과정: 특수교육 교육과정 총론 (제2부 초⋅중등학교 교육과정 중 필요한 부분) ===== */
const CUR = __CUR__;
const CUCH=CUR.chapters, cuCh=id=>CUCH.find(c=>c.id===id);
S.cu={ch:"nat",tdoc:"mid",tamt:"all",tseed:1,tvals:{},tgraded:false,treveal:false,
      bch:"nat",bi:0,amt:"low",seed:1,vals:{},graded:false,reveal:false};
const cuNorm=s=>String(s).replace(/[\s,]/g,"").replace(/[·・.⋅ㆍ‧･]/g,"ㆍ");
const CU_LCLS={gh:"ch",gs:"cgs",p:"cp",i1:"ci1",i2:"ci2",i3:"ci3",note:"cnote",cap:"ccap",dot:"cdot",sub:"ch"};
const CU_NUM=/\d[\d,]*\s?(?:%|개|학점|시간|분|회|주|년간)/g;
function cuMarkNums(s){return esc(s).replace(CU_NUM,m=>`<b class="kn">${m}</b>`);}
function cuRowLabel(t,c){const h=t.cells.filter(x=>x.r===c.r&&x.c<c.c).map(x=>x.s).filter(s=>s!=="교과(군)");return h.join(" ")||"칸";}
function cuTable(t,quiz){
  const grid=[];for(let r=0;r<t.rows;r++)grid.push([]);
  t.cells.forEach(c=>{grid[c.r].push(c);});
  return `<div class="tblwrap"><table class="ltbl ctbl"><tbody>${grid.map((row,ri)=>`<tr>${row.sort((a,b)=>a.c-b.c).map(c=>{
    const isNum=/^[\d,]+$/.test(c.s),tag=ri===0||!isNum?"th":"td";
    const span=`${c.rs>1?` rowspan="${c.rs}"`:""}${c.cs>1?` colspan="${c.cs}"`:""}`;
    const cls=c.s==="교과(군)"?' class="vert"':(isNum?' class="num"':"");
    let inner=esc(c.s);
    if(quiz&&quiz.has(c.r+"-"+c.c)){
      const key=c.r+"-"+c.c,v=S.cu.tvals[key]||"",ok=cuNorm(v)===cuNorm(c.s);
      inner=S.cu.treveal?`<span class="bl show">${esc(c.s)}</span>`:S.cu.tgraded?(ok?`<span class="bl okv">${esc(c.s)}</span>`:`<span class="bl wrongv">${v.trim()?`<s>${esc(v)}</s> `:""}${esc(c.s)}</span>`)
        :`<input class="cb tq" inputmode="numeric" data-tq="${key}" value="${esc(v)}" aria-label="${esc(cuRowLabel(t,c))} 빈칸" autocomplete="off">`;
    }
    return `<${tag}${span}${cls}>${inner}</${tag}>`;}).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const cuBox=lines=>`<div class="cbox">${lines.map(s=>`<p>${esc(s)}</p>`).join("")}</div>`;
function cuLines(lines){
  return lines.map(l=>l.k==="tbl"?cuTable(l):l.k==="box"?cuBox(l.lines):`<p class="${CU_LCLS[l.k]||""}">${l.k==="gh"||l.k==="sub"?esc(l.s):cuMarkNums(l.s)}</p>`).join("");
}
function cuChSelect(id,key){return `<label for="${id}" class="vh">단원 선택</label><select id="${id}" class="cuch" data-cuch="${key}">${CUCH.map(c=>`<option value="${c.id}" ${S.cu[key]===c.id?"selected":""}>${esc(c.short)}</option>`).join("")}</select>`;}
function currRead(){
  const C=cuCh(S.cu.ch),i=CUCH.indexOf(C);
  return `<div class="lbtop">${cuChSelect("cuch1","ch")}</div>
  <div><h2 class="h-big">${esc(C.name)}</h2><p class="src">${esc(CUR.src)}</p></div>
  ${C.intro?cuBox(C.intro):""}
  ${C.secs.length>1?`<div class="chips jump">${C.secs.map((s,k)=>`<a href="#cu-${k}" data-cujump="cu-${k}">${esc(s.h)}</a>`).join("")}</div>`:""}
  ${C.secs.map((s,k)=>`<section class="sect" id="cu-${k}">${s.h?`<h3>${esc(s.h)}</h3>`:""}<article class="lart cart">${cuLines(s.lines)}</article></section>`).join("")}
  <div class="row2"><button class="btn ghost" data-cugo="${i-1}" ${i===0?"disabled":""}>‹ 이전 단원</button><button class="btn ghost" data-cugo="${i+1}" ${i>=CUCH.length-1?"disabled":""}>다음 단원 ›</button></div>
  <p class="src">총론 원문 그대로예요. 숫자에는 굵게 표시만 더했어요. 제1부 유치원 교육과정, Ⅲ장의 공통 교육과정⋅선택 중심 교육과정과 기본 교육과정 초등학교 부분은 넣지 않았어요.</p>`;
}
/* 시수(학점)표 외우기 */
const cuTbl=doc=>cuCh(doc).secs.flatMap(s=>s.lines).find(l=>l.k==="tbl");
function cuQuizCells(doc){
  const t=cuTbl(doc);const nums=t.cells.filter(c=>/^[\d,]+$/.test(c.s)).map(c=>c.r+"-"+c.c);
  if(S.cu.tamt==="all")return {t,set:new Set(nums)};
  const r=rng(S.cu.tseed*31+nums.length);const pick=nums.map(k=>[k,r()]).sort((a,b)=>a[1]-b[1]).slice(0,Math.ceil(nums.length/2)).map(x=>x[0]);
  return {t,set:new Set(pick)};
}
function currTable(){
  const C=cuCh(S.cu.tdoc),{t,set}=cuQuizCells(S.cu.tdoc),L=C.secs.flatMap(s=>s.lines);
  const right=[...set].filter(k=>{const c=t.cells.find(x=>x.r+"-"+x.c===k);return cuNorm(S.cu.tvals[k]||"")===cuNorm(c.s);}).length;
  const cap=L.find(l=>l.k==="cap"),notes=L.filter(l=>l.k==="note");
  return `<div class="seg docseg" role="group" aria-label="학교급 선택">${["mid","high"].map(k=>`<button aria-pressed="${S.cu.tdoc===k}" data-tdoc="${k}">기본 교육과정 ${cuCh(k).school}</button>`).join("")}</div>
  <div class="lbtop"><div class="seg" role="group" aria-label="빈칸 양">${[["all","전부 비우기"],["half","절반만"]].map(([k,l])=>`<button aria-pressed="${S.cu.tamt===k}" data-tamt="${k}">${l}</button>`).join("")}</div></div>
  <article class="lart cart"><header><b>${C.school} ${S.cu.tdoc==="mid"?"시간 배당 기준":"학점 배당 기준"} ${cap?esc(cap.s):""}</b><span class="src">빈칸 ${set.size}개</span></header>${cuTable(t,set)}</article>
  ${S.cu.tgraded?`<div class="lbscore ${right===set.size?"ok":""}"><b>${right} / ${set.size}</b> 맞혔어요${right===set.size?" · 완벽해요!":" · 빨간 칸이 틀린 곳이에요"}</div>`:""}
  <div class="row2"><button class="btn ghost" id="tqReveal">${S.cu.treveal?"빈칸으로 돌아가기":"정답 보기"}</button><button class="btn" id="tqGrade">${S.cu.tgraded?"다시 풀기":"채점하기"}</button></div>
  ${S.cu.tamt==="half"?`<button class="btn blue" id="tqNew">다른 칸으로 새로 비우기</button>`:""}
  <details class="legend"><summary>표 아래 설명 보기</summary><div class="cart">${notes.map(n=>`<p class="cnote">${cuMarkNums(n.s)}</p>`).join("")}</div></details>
  <p class="src">숫자만 쓰면 돼요. 쉼표는 써도 되고 안 써도 돼요. 소계와 총합은 위 칸을 더한 값이라 계산으로 확인할 수도 있어요.</p>`;
}
/* 빈칸 채우기 */
const CU_TERMS=[
 // 성격·구성의 방향
 "국가 수준의 공통성","다양성","학습자 성장","교육과정 중심","질적 수준","디지털 전환","기후⋅생태환경 변화","인구 구조 변화","맞춤형 교육","자율화 및 분권화","주도성","공동체 의식","언어‧수리‧디지털 기초소양","언어⋅수리⋅디지털 기초소양","기초소양","학습자 맞춤형 교육과정 체제","깊이 있는 학습","학생 참여형 수업","자율화⋅분권화","포용성과 창의성","홍익인간","인격을 도야","자주적 생활 능력","인류 공영",
 "자기주도적인 사람","창의적인 사람","교양 있는 사람","더불어 사는 사람","자기관리 역량","지식정보처리 역량","창의적 사고 역량","심미적 감성 역량","협력적 소통 역량","공동체 역량",
 "기본 습관","바른 인성","민주시민의 자질","자아존중감","도전정신","창의적 사고력","성숙한 자아의식","평생 학습","인간의 존엄성",
 // 설계와 운영
 "학교 교육과정 위원회","자문","특수교사","학습 공동체","자체 평가","핵심 아이디어","지식⋅이해","과정⋅기능","가치⋅태도","자기주도 학습 능력","토의⋅토론 학습","소집단 협동 학습","오개념","지능정보기술","학습 결손","보충 학습","교과 교실","학점 기반 교육과정","의사소통 지원","행동 지원","보조공학 지원","추수 지도","성취기준","성취수준","평가기준","수행평가","서술형과 논술형","배울 기회","고정 관념","특수학급","한국어 교육과정","종립 학교","단수","복수",
 // 기본 사항
 "공통 교육과정","선택 중심 교육과정","기본 교육과정","학년군","보통 교과","전문 교과","특수교육 전문 교과","공통 과목","자립과 사회 통합","집중이수","진로연계교육","안전교육","범교과 학습 주제","안전⋅건강 교육","인성 교육","진로 교육","민주시민 교육","인권 교육","다문화 교육","통일 교육","독도 교육","경제⋅금융 교육","환경⋅지속가능발전 교육","계기 교육","원격수업","생활연령","순회교육","개별화교육계획","생활기능","통합교육용 교수⋅학습 자료",
 // 기본 교육과정 중·고
 "일상생활 활동","창의적 체험활동","진로와 직업","정보통신활용","생활영어","자율⋅자치 활동","동아리 활동","진로 활동","의사소통","자립생활","신체활동","여가활동","생활적응","생활 기술","자유학기","주제선택 활동","진로 탐색 활동","일제식 지필 평가","학교스포츠클럽 활동","타 학년군","복식 학급","중점학교","현장 실습","학교 밖 교육","체육","예술(음악/미술)","학교급 간 연계","학년별, 학기별","학생과 학부모","이수 시기","새로운 선택 과목","시⋅도 교육감","학기당","다른 특수학교 및 일반학교","선택 교과",
 // 학교 교육과정 지원
 "학업 성취도 평가","시⋅도 교육청 교육과정 위원회","통합교육","평가조정","국가직무능력표준","느린 학습자","정당한 편의","통합운영학교","최소 성취수준 보장","독서 활동","농산어촌학교","소규모학교","교육 격차","에듀테크","수준별 수업","보충 수업","과목 선택권","교육과정 컨설팅","연구학교"];
const CU_RE=new RegExp("("+CU_NUM.source+")|("+[...new Set(CU_TERMS)].sort((a,b)=>b.length-a.length).map(s=>s.replace(/[()\/⋅.]/g,"\\$&")).join("|")+")","g");
const cuHasCand=l=>{if(!l.s)return false;CU_RE.lastIndex=0;let m;while((m=CU_RE.exec(l.s))){if(!(m[2]&&/[가-힣]/.test(l.s[m.index-1]||"")))return true;}return false;};
const cuHead=s=>(s.match(/^([가-하]\.|\d+\)|[가-하]\)|[①-⑳])/)||[s.slice(0,10)+"…"])[0];
function cuUnits(id){
  const C=cuCh(id),units=[];
  C.secs.forEach(sec=>{
    let cur=null,ctx=null;
    const flush=()=>{if(cur)units.push(cur);cur=null;};
    const start=(l,label)=>{flush();cur={sec:sec.h,ctx,label,lines:[l]};};
    sec.lines.forEach(l=>{
      const last=cur&&cur.lines[cur.lines.length-1];
      switch(l.k){
        case "gh":flush();ctx=l.s;break;
        case "gs":if(cur&&(last.k==="p"||cur.list))cur.lines.push(l),cur.list=true;else start(l,cuHead(l.s));break;
        case "p":if(cur&&last.k==="p")cur.lines.push(l);else start(l,"도입 · "+l.s.slice(0,12)+"…");break;
        case "i1":if(cur&&(cur.lines[0].k==="gs"||cur.lines[0].k==="p")&&!cur.list)cur.lines.push(l);else start(l,cuHead(l.s));break;
        case "i2":case "i3":case "dot":if(cur)cur.lines.push(l);else start(l,cuHead(l.s));break;
        case "note":{let u=units.find(x=>x.note&&x.sec===sec.h);if(!u){flush();u={sec:sec.h,ctx,label:"표 아래 설명 (①~)",lines:[],note:true};units.push(u);}u.lines.push(l);break;}
        case "box":flush();units.push({sec:sec.h,ctx,label:"범교과 학습 주제",lines:l.lines.map(s=>({k:"p",s}))});break;
        default:break; // 표·표 번호는 시수표 외우기에서
      }
    });
    flush();
  });
  return units.filter(u=>u.lines.some(cuHasCand));
}
function cuBuild(u,seed,amt){
  const r=rng(seed*7+u.label.length*13+u.lines.length);let id=0;
  const segs=u.lines.map(l=>{const parts=[];let m,last=0;CU_RE.lastIndex=0;
    while((m=CU_RE.exec(l.s))){if(m[2]&&/[가-힣]/.test(l.s[m.index-1]||""))continue;parts.push({t:"txt",s:l.s.slice(last,m.index)});parts.push({t:"cand",s:m[0],kind:m[1]?"num":"term"});last=m.index+m[0].length;}
    parts.push({t:"txt",s:l.s.slice(last)});return {k:l.k,parts};});
  const cands=segs.flatMap(s=>s.parts.filter(p=>p.t==="cand"));
  const cap={low:2,mid:4,high:7}[amt],ratio={low:.2,mid:.4,high:.65}[amt];
  const n=Math.min(cap,Math.max(1,Math.round(cands.length*ratio)),cands.length);
  const w={num:4,term:1.5};
  const pool=cands.map(p=>({p,k:Math.pow(r(),1/w[p.kind])})).sort((a,b)=>b.k-a.k);
  const used=[];for(const {p} of pool){if(used.length>=n)break;if(used.some(q=>q.s===p.s))continue;p.blank=true;used.push(p);}
  cands.filter(p=>p.blank).forEach(p=>p.id=id++);
  return {segs,count:id};
}
function currBlank(){
  const units=cuUnits(S.cu.bch);if(S.cu.bi>=units.length)S.cu.bi=0;
  const u=units[S.cu.bi],b=cuBuild(u,S.cu.seed,S.cu.amt),C=cuCh(S.cu.bch);
  const all=b.segs.flatMap(s=>s.parts).filter(p=>p.blank);
  const right=all.filter(p=>cuNorm(S.cu.vals[p.id]||"")===cuNorm(p.s)).length;
  const body=b.segs.map(s=>`<p class="${CU_LCLS[s.k]||""}">${s.parts.map(p=>{
    if(p.t!=="cand"||!p.blank)return esc(p.s);
    const v=S.cu.vals[p.id]||"",ok=cuNorm(v)===cuNorm(p.s);
    if(S.cu.reveal)return `<span class="bl show">${esc(p.s)}</span>`;
    if(S.cu.graded)return ok?`<span class="bl okv">${esc(p.s)}</span>`:`<span class="bl wrongv">${v.trim()?`<s>${esc(v)}</s> `:""}${esc(p.s)}</span>`;
    return `<input class="cb" data-cb="${p.id}" value="${esc(v)}" title="${p.kind==="num"?"숫자":"핵심 용어"}" style="width:${Math.min(Math.max(3,p.s.length)*1.05+1.4,16)}em" aria-label="빈칸 ${p.id+1}" autocomplete="off">`;
  }).join("")}</p>`).join("");
  const groups=[...new Set(units.map(x=>x.sec))];
  return `<div class="lbtop">${cuChSelect("cuch2","bch")}
    <label for="cusel" class="vh">항목 선택</label>
    <select id="cusel">${groups.map(g=>`<optgroup label="${esc(g||C.short)}">${units.map((x,i)=>x.sec!==g?"":`<option value="${i}" ${i===S.cu.bi?"selected":""}>${x.ctx?esc(x.ctx.replace(/^[가-하]\.\s*/,""))+" · ":""}${esc(x.label)}</option>`).join("")}</optgroup>`).join("")}</select>
    <div class="seg" role="group" aria-label="빈칸 양">${[["low","조금"],["mid","보통"],["high","많이"]].map(([k,l])=>`<button aria-pressed="${S.cu.amt===k}" data-cuamt="${k}">${l}</button>`).join("")}</div>
  </div>
  <article class="lart cart blankart"><header><b>${esc(u.sec||C.short)}${u.ctx?" › "+esc(u.ctx):""}</b><span class="src">빈칸 ${b.count}개 · ${S.cu.bi+1}/${units.length}</span></header>${body}</article>
  ${S.cu.graded?`<div class="lbscore ${right===b.count?"ok":""}"><b>${right} / ${b.count}</b> 맞혔어요${right===b.count?" · 완벽해요!":" · 빨간 칸이 틀린 곳이에요"}</div>`:""}
  <div class="row2"><button class="btn ghost" id="cuReveal">${S.cu.reveal?"빈칸으로 돌아가기":"정답 보기"}</button><button class="btn" id="cuGrade">${S.cu.graded?"다시 풀기":"채점하기"}</button></div>
  <div class="row2"><button class="btn ghost" id="cuPrev" ${S.cu.bi===0?"disabled":""}>이전 항목</button><button class="btn ghost" id="cuNext" ${S.cu.bi>=units.length-1?"disabled":""}>다음 항목</button></div>
  <button class="btn blue" id="cuRand">이 단원에서 무작위로 새로 뚫기</button>
  <p class="src">숫자(50%, 8개, 192학점 같은 것)를 먼저, 그다음 인간상⋅핵심역량 이름 같은 핵심 용어를 조금만 뚫어요. 띄어쓰기와 쉼표는 채점하지 않아요. ‘⋅’ 대신 ‘·’나 ‘.’을 써도 돼요. 숫자 빈칸은 단위까지 써야 해요(예: 50%).</p>`;
}
function wireCurr(){
  const $=s=>app.querySelector(s);
  app.querySelectorAll("select[data-cuch]").forEach(sel=>sel.onchange=()=>{const k=sel.dataset.cuch;S.cu[k]=sel.value;
    if(k==="bch")Object.assign(S.cu,{bi:0,vals:{},graded:false,reveal:false});render();scrollTo(0,0);});
  app.querySelectorAll("[data-cugo]").forEach(b=>b.onclick=()=>{S.cu.ch=CUCH[+b.dataset.cugo].id;render();scrollTo(0,0);});
  app.querySelectorAll("[data-cujump]").forEach(a=>a.onclick=e=>{e.preventDefault();const el=document.getElementById(a.dataset.cujump);if(el)scrollTo({top:el.getBoundingClientRect().top+scrollY-12,behavior:"smooth"});});
  // 표
  app.querySelectorAll("[data-tdoc]").forEach(b=>b.onclick=()=>{Object.assign(S.cu,{tdoc:b.dataset.tdoc,tvals:{},tgraded:false,treveal:false});render();});
  app.querySelectorAll("[data-tamt]").forEach(b=>b.onclick=()=>{Object.assign(S.cu,{tamt:b.dataset.tamt,tvals:{},tgraded:false,treveal:false});render();});
  const enterNext=(sel,btn)=>inp=>inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const all=[...app.querySelectorAll(sel)];const i=all.indexOf(inp);if(all[i+1])all[i+1].focus();else $(btn).click();}};
  app.querySelectorAll("input[data-tq]").forEach(inp=>{inp.oninput=()=>{S.cu.tvals[inp.dataset.tq]=inp.value;};enterNext("input[data-tq]","#tqGrade")(inp);});
  const tg=$("#tqGrade");if(tg)tg.onclick=()=>{if(S.cu.tgraded)Object.assign(S.cu,{tvals:{},tgraded:false});else Object.assign(S.cu,{tgraded:true,treveal:false});render();};
  const tr=$("#tqReveal");if(tr)tr.onclick=()=>{S.cu.treveal=!S.cu.treveal;render();};
  const tn=$("#tqNew");if(tn)tn.onclick=()=>{Object.assign(S.cu,{tseed:S.cu.tseed+1,tvals:{},tgraded:false,treveal:false});render();};
  // 빈칸
  const sel=$("#cusel");if(sel)sel.onchange=()=>{Object.assign(S.cu,{bi:+sel.value,vals:{},graded:false,reveal:false});render();};
  app.querySelectorAll("[data-cuamt]").forEach(b=>b.onclick=()=>{Object.assign(S.cu,{amt:b.dataset.cuamt,vals:{},graded:false,reveal:false});render();});
  app.querySelectorAll("input[data-cb]").forEach(inp=>{inp.oninput=()=>{S.cu.vals[inp.dataset.cb]=inp.value;};enterNext("input[data-cb]","#cuGrade")(inp);});
  const g=$("#cuGrade");if(g)g.onclick=()=>{if(S.cu.graded)Object.assign(S.cu,{vals:{},graded:false});else Object.assign(S.cu,{graded:true,reveal:false});render();};
  const rv=$("#cuReveal");if(rv)rv.onclick=()=>{S.cu.reveal=!S.cu.reveal;render();};
  const n=cuUnits(S.cu.bch).length;
  const go=i=>{Object.assign(S.cu,{bi:i,vals:{},graded:false,reveal:false,seed:S.cu.seed+1});render();scrollTo(0,0);};
  const p=$("#cuPrev");if(p)p.onclick=()=>go(S.cu.bi-1);
  const nx=$("#cuNext");if(nx)nx.onclick=()=>go(S.cu.bi+1);
  const r=$("#cuRand");if(r)r.onclick=()=>go(Math.floor(Math.random()*n));
}

