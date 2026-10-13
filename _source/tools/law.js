
/* ===== 장특법 (장애인 등에 대한 특수교육법) =====
   본문: 국가법령정보센터 원문 [시행 2025. 10. 1.] [법률 제21065호] — 원문 지문값으로 한 글자씩 대조함 */
const LAW = __LAW__;
const LAW_SRC = "출처: 국가법령정보센터 「장애인 등에 대한 특수교육법」 [시행 2025. 10. 1.] [법률 제21065호, 2025. 10. 1., 타법개정]";
const LAW_ARTS = LAW.flatMap((c,ci)=>c.arts.map(a=>({...a,ch:ci})));

/* 행위 주체 형광펜 */
const ACTORS=[
  {id:"gov",name:"국가·지방자치단체",col:"#FFE066",re:"국가 및 지방자치단체|지방자치단체의 장|지방자치단체|국가(?!교육위원회)"},
  {id:"moe",name:"교육부장관",col:"#A5D8FF",re:"교육부장관"},
  {id:"sup",name:"교육감",col:"#B2F2BB",re:"(?:해당 )?시ㆍ도 교육감|교육감"},
  {id:"dir",name:"교육장",col:"#96F2D7",re:"교육장(?!관)"},
  {id:"head",name:"학교·기관의 장",col:"#FFD8A8",re:"각급학교의 장|특성화특수학교의 장|특수교육기관의 장|일반학교의 장|특수학교의 장|국립학교의 장|해당 학교의 장|교육기관의 장|대학의 장|학교의 장|학교장"},
  {id:"par",name:"보호자",col:"#FCC2D7",re:"부모 등 보호자|보호자"},
  {id:"ctr",name:"특수교육지원센터",col:"#FFC9C9",re:"특수교육지원센터"},
  {id:"com",name:"운영위원회",col:"#D0BFFF",re:"중앙특수교육운영위원회|시ㆍ도특수교육운영위원회|시ㆍ군ㆍ구특수교육운영위원회|특수교육운영위원회|국가교육위원회"},
  {id:"team",name:"개별화교육지원팀",col:"#D8F5A2",re:"개별화교육지원팀"},
  {id:"tch",name:"교원",col:"#C5F6FA",re:"특수교육교원|일반교육교원"},
  {id:"uni",name:"대학 지원 기구",col:"#E9D8C4",re:"특별지원위원회|장애학생지원센터의 장|장애학생지원센터|장애인고등교육지원센터|고등교육센터"}
];
const ACTOR_RE=new RegExp(ACTORS.map(a=>`(${a.re})`).join("|"),"g");

/* 빈칸 후보: 행위 주체 + 기간·숫자 + 핵심 용어 */
const LAW_TERMS=["특수교육 관련서비스","개별화교육계획","통합교육계획","진로 및 직업교육","직업재활훈련","자립생활훈련","의무교육","무상","진단ㆍ평가","선별검사","순회교육","원격수업","전공과","가족지원","치료지원","지원인력","기숙사","생활지도원","간호사 또는 간호조무사","통학 지원","학습보조기","보조공학기기","서면","행정심판","심사청구","의견진술","대통령령","교육부령","교육규칙","실태조사","인권침해","최종의견","조기발견","취학지도","특수교육종합계획","특성화특수학교","정보접근","화면해설","폐쇄자막","수어통역","편의제공","개인별 교육지원계획","학칙","통합학급","특수학급","특수학교","일반학급","장애영아","거주지에서 가장 가까운 곳","행동중재전문가"];
const NUM_RE="만 \\d+세(?:부터 만 \\d+세)?|만 \\d+세미만|\\d+년마다|\\d+년 이상|\\d+주일 이내|\\d+주 이내|\\d+일 이내|\\d+개월 이상|\\d+인 이상 \\d+인 이하|\\d+인을 초과|\\d+분의 \\d+|\\d+년 이하|\\d+천만원 이하|\\d+만원 이하|매 학기|매년";
const BLANK_RE=new RegExp(`(${ACTORS.map(a=>a.re).join("|")})|(${NUM_RE})|(${LAW_TERMS.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})`,"g");

const lawNote=s=>s.replace(/(<(?:개정|신설|전문개정|제목개정|본조신설)[^>]*>|\[[^\]]*(?:개정|신설|이동)[^\]]*\])/g,"\u0000$1\u0001");
function lawLineHTML(text,hl){
  // 개정 표시는 회색 작은 글씨, 나머지는 형광펜
  return lawNote(text).split(/(\u0000[^\u0001]*\u0001)/).map(part=>{
    if(part.startsWith("\u0000"))return `<span class="lnote">${esc(part.slice(1,-1))}</span>`;
    let out="",last=0;ACTOR_RE.lastIndex=0;let m;
    while((m=ACTOR_RE.exec(part))){
      const gi=m.slice(1).findIndex(Boolean);const ac=ACTORS[gi];
      out+=esc(part.slice(last,m.index));
      out+=hl&&S.lawOn[ac.id]!==false?`<mark style="--hl:${ac.col}" title="${ac.name}">${esc(m[0])}</mark>`:esc(m[0]);
      last=m.index+m[0].length;
    }
    return out+esc(part.slice(last));
  }).join("");
}
const lineCls=l=>/^[①-⑳]/.test(l)?"hang":/^\d+(의\d+)?\./.test(l)?"ho":/^\[/.test(l)?"lnote blk":"";
function artBody(v,hl){
  return v.lines.map((l,i)=>i===0?(l?`<p>${lawLineHTML(l,hl)}</p>`:""):`<p class="${lineCls(l)}">${lawLineHTML(l,hl)}</p>`).join("");
}

/* ----- 법 읽기 ----- */
S.lawOn={};S.lawQ="";S.lawNext={};
function lawRead(){
  const q=S.lawQ.trim();
  const match=a=>!q||[a.no,a.title,...a.lines].join(" ").includes(q);
  return `
  <div><h2 class="h-big">장애인 등에 대한 특수교육법</h2><p class="src">${LAW_SRC}</p></div>
  <details class="legend" ${S.lawLegend?"open":""} id="lawLegend"><summary>형광펜 · 행위 주체 ${ACTORS.filter(a=>S.lawOn[a.id]!==false).length}/${ACTORS.length}</summary>
    <div class="lchips">${ACTORS.map(a=>`<button class="lchip" data-act="${a.id}" aria-pressed="${S.lawOn[a.id]!==false}"><i style="background:${a.col}"></i>${a.name}</button>`).join("")}</div>
    <div class="row2"><button class="btn ghost" id="hlAll">모두 켜기</button><button class="btn ghost" id="hlNone">모두 끄기</button></div>
  </details>
  <div class="search"><label for="lawq" class="vh">조문 검색</label><input id="lawq" placeholder="조문 검색 (예: 순회교육, 14일)" value="${esc(S.lawQ)}" autocomplete="off"></div>
  <div class="chips jump">${LAW.map((c,i)=>`<a href="#ch${i}" data-jump="ch${i}">${c.no}</a>`).join("")}</div>
  ${LAW.map((c,ci)=>{const arts=c.arts.filter(match);if(!arts.length)return "";return `
  <section class="sect" id="ch${ci}"><h3>${c.no} ${esc(c.title)}</h3>
    ${arts.map(a=>{const del=/^삭제/.test(a.lines[0]);return `
    <article class="lart ${del?"del":""}" id="art-${a.no}">
      <header><b>${a.no}${a.title?`(${esc(a.title)})`:""}</b>
        ${a.futureOnly?`<span class="fbadge">${esc(a.futureOnly)} 시행 예정</span>`:""}
        ${a.next?`<button class="fbadge btnlike" data-next="${a.no}">${esc(a.next.date)} 개정 예정 ${S.lawNext[a.no]?"▲":"▼"}</button>`:""}</header>
      ${artBody(a,true)}
      ${a.next&&S.lawNext[a.no]?`<div class="nextver"><p class="src">${esc(a.next.date)}부터 시행되는 개정 조문</p>${artBody(a.next,true)}</div>`:""}
    </article>`;}).join("")}
  </section>`;}).join("")||`<p class="src">‘${esc(q)}’이(가) 들어간 조문이 없어요.</p>`}
  <p class="src">${LAW_SRC}. 이미 공포되었지만 아직 시행 전인 개정 조문은 ‘개정 예정’으로 따로 표시했어요.</p>`;
}

/* ----- 빈칸 채우기 ----- */
const LAW_BLANKABLE=LAW_ARTS.filter(a=>!/^삭제/.test(a.lines[0])&&!a.futureOnly);
S.lb={idx:0,amt:"mid",seed:1,vals:{},graded:false,reveal:false};
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function buildBlanks(a,seed,amt){
  const segs=[];let id=0;const r=rng(seed+a.no.length*97);
  const rate={low:.2,mid:.4,high:.7}[amt];
  a.lines.forEach((line,li)=>{
    const parts=[];let last=0;
    const noted=lawNote(line);
    noted.split(/(\u0000[^\u0001]*\u0001)/).forEach(part=>{
      if(part.startsWith("\u0000")){parts.push({t:"note",s:part.slice(1,-1)});return;}
      BLANK_RE.lastIndex=0;let m,lst=0;
      while((m=BLANK_RE.exec(part))){parts.push({t:"txt",s:part.slice(lst,m.index)});parts.push({t:"cand",s:m[0]});lst=m.index+m[0].length;}
      parts.push({t:"txt",s:part.slice(lst)});
    });
    segs.push({li,parts});
  });
  const cands=segs.flatMap(s=>s.parts.filter(p=>p.t==="cand"));
  cands.forEach(p=>{p.blank=r()<rate;});
  if(cands.length&&!cands.some(p=>p.blank))cands[Math.floor(r()*cands.length)].blank=true;
  cands.filter(p=>p.blank).forEach(p=>p.id=id++);
  return {segs,count:id};
}
const normAns=s=>s.replace(/\s+/g,"").replace(/[·・.]/g,"ㆍ");
function lawBlank(){
  const a=LAW_BLANKABLE[S.lb.idx],b=buildBlanks(a,S.lb.seed,S.lb.amt);
  const all=b.segs.flatMap(s=>s.parts).filter(p=>p.blank);
  const right=all.filter(p=>normAns(S.lb.vals[p.id]||"")===normAns(p.s)).length;
  const body=b.segs.map(({li,parts})=>{
    const cls=li===0?"":lineCls(a.lines[li]);
    return `<p class="${cls}">${parts.map(p=>{
      if(p.t==="note")return `<span class="lnote">${esc(p.s)}</span>`;
      if(p.t!=="cand"||!p.blank)return esc(p.s);
      const v=S.lb.vals[p.id]||"",ok=normAns(v)===normAns(p.s);
      if(S.lb.reveal)return `<span class="bl show">${esc(p.s)}</span>`;
      return `<input class="bl ${S.lb.graded?(ok?"ok":"no"):""}" data-b="${p.id}" value="${esc(v)}" style="width:${Math.max(3,p.s.length)*1.05+1.4}em" aria-label="빈칸 ${p.id+1}" autocomplete="off" ${S.lb.graded&&ok?"readonly":""}>${S.lb.graded&&!ok?`<span class="bl ans">${esc(p.s)}</span>`:""}`;
    }).join("")}</p>`;}).join("");
  return `
  <div class="lbtop">
    <label for="lbsel" class="vh">조문 선택</label>
    <select id="lbsel">${LAW.map((c,ci)=>`<optgroup label="${c.no} ${esc(c.title)}">${LAW_BLANKABLE.map((x,i)=>x.ch===ci?`<option value="${i}" ${i===S.lb.idx?"selected":""}>${x.no}${x.title?`(${esc(x.title)})`:""}</option>`:"").join("")}</optgroup>`).join("")}</select>
    <div class="seg" role="group" aria-label="빈칸 양">${[["low","조금"],["mid","보통"],["high","많이"]].map(([k,l])=>`<button aria-pressed="${S.lb.amt===k}" data-amt="${k}">${l}</button>`).join("")}</div>
  </div>
  <article class="lart blankart"><header><b>${a.no}${a.title?`(${esc(a.title)})`:""}</b><span class="src">빈칸 ${b.count}개</span></header>${body}</article>
  ${S.lb.graded?`<div class="lbscore ${right===b.count?"ok":""}"><b>${right} / ${b.count}</b> 맞혔어요${right===b.count?" · 완벽해요!":" · 틀린 칸 아래에 정답이 보여요"}</div>`:""}
  <div class="row2"><button class="btn ghost" id="lbReveal">${S.lb.reveal?"빈칸으로 돌아가기":"정답 보기"}</button><button class="btn" id="lbGrade">${S.lb.graded?"다시 풀기":"채점하기"}</button></div>
  <div class="row2"><button class="btn ghost" id="lbPrev" ${S.lb.idx===0?"disabled":""}>이전 조문</button><button class="btn ghost" id="lbNext" ${S.lb.idx>=LAW_BLANKABLE.length-1?"disabled":""}>다음 조문</button></div>
  <button class="btn blue" id="lbRand">무작위 조문으로 새로 뚫기</button>
  <p class="src">띄어쓰기는 채점하지 않아요. ‘ㆍ’ 대신 ‘·’나 ‘.’을 써도 돼요. 행위 주체, 기간·숫자, 핵심 용어 중에서 빈칸을 뚫어요. 시행 전 개정 조문은 빼고 현재 시행 중인 조문으로만 만들어요.</p>`;
}

/* ----- 기출문제 ----- */
function lawExam(){
  return `<div class="card" style="align-items:center;text-align:center;padding:36px 20px">
    <span class="freebadge" style="background:var(--wash);color:var(--faint)">${IC.cards}</span>
    <h2 class="h-big">기출문제 준비 중</h2>
    <p class="sub-txt">보내 주시는 기출문제가 이곳에 들어갈 예정이에요.</p></div>`;
}

function wireLaw(){
  const $=s=>app.querySelector(s);
  app.querySelectorAll("[data-jump]").forEach(a=>a.onclick=e=>{e.preventDefault();const el=document.getElementById(a.dataset.jump);if(el)scrollTo({top:el.getBoundingClientRect().top+scrollY-12,behavior:"smooth"});});
  const lg=$("#lawLegend");if(lg)lg.ontoggle=()=>{S.lawLegend=lg.open;};
  app.querySelectorAll("[data-act]").forEach(b=>b.onclick=()=>{S.lawOn[b.dataset.act]=S.lawOn[b.dataset.act]===false;render();});
  const on=$("#hlAll");if(on)on.onclick=()=>{S.lawOn={};render();};
  const off=$("#hlNone");if(off)off.onclick=()=>{ACTORS.forEach(a=>S.lawOn[a.id]=false);render();};
  const q=$("#lawq");if(q){q.oninput=()=>{S.lawQ=q.value;clearTimeout(S._lq);S._lq=setTimeout(()=>{const pos=q.selectionStart;render();const n=$("#lawq");if(n){n.focus();n.setSelectionRange(pos,pos);}},250);};}
  app.querySelectorAll("[data-next]").forEach(b=>b.onclick=()=>{S.lawNext[b.dataset.next]=!S.lawNext[b.dataset.next];render();});
  // 빈칸
  const sel=$("#lbsel");if(sel)sel.onchange=()=>{S.lb={...S.lb,idx:+sel.value,vals:{},graded:false,reveal:false};render();};
  app.querySelectorAll("[data-amt]").forEach(b=>b.onclick=()=>{S.lb={...S.lb,amt:b.dataset.amt,vals:{},graded:false,reveal:false};render();});
  app.querySelectorAll("input.bl").forEach(inp=>{inp.oninput=()=>{S.lb.vals[inp.dataset.b]=inp.value;};
    inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();const all=[...app.querySelectorAll("input.bl:not([readonly])")];const i=all.indexOf(inp);if(all[i+1])all[i+1].focus();else $("#lbGrade").click();}};});
  const g=$("#lbGrade");if(g)g.onclick=()=>{if(S.lb.graded){S.lb={...S.lb,vals:{},graded:false};}else{S.lb.graded=true;S.lb.reveal=false;}render();};
  const rv=$("#lbReveal");if(rv)rv.onclick=()=>{S.lb.reveal=!S.lb.reveal;render();};
  const go=i=>{S.lb={...S.lb,idx:i,vals:{},graded:false,reveal:false,seed:S.lb.seed+1};render();scrollTo(0,0);};
  const p=$("#lbPrev");if(p)p.onclick=()=>go(S.lb.idx-1);
  const n=$("#lbNext");if(n)n.onclick=()=>go(S.lb.idx+1);
  const r=$("#lbRand");if(r)r.onclick=()=>go(Math.floor(Math.random()*LAW_BLANKABLE.length));
}
