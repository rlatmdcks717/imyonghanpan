
/* ===== 상태 ===== */
const S={view:"title",subject:null,tab:null,hide:false,shown:{},game:null,idx:0,open:false,fillInput:"",fillResult:null};
const app=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const img=(j,cls="")=>`<img ${cls?`class="${cls}"`:""} src="${FS[j]}" alt="지문자 손 모양">`;
const starRow=(n,cls="stars")=>`<span class="${cls}" aria-label="별 ${n}개">${[1,2,3].map(i=>`<span class="${i<=n?"on":""}">${IC.star}</span>`).join("")}</span>`;
const totalStars=()=>Object.values(saved.stars).reduce((a,b)=>a+b,0);
const maxStars=STAGES.filter(s=>!s.locked).length*3;
const norm=s=>s.replace(/\s+/g,"").replace(/[.'"]/g,"").toLowerCase();
const starChip=()=>`<span class="stat-chip" aria-label="모은 별">${IC.star}${totalStars()}<span style="color:var(--faint);font-weight:500">/${maxStars}</span></span>`;
const GROUP_COLOR={"글자 익히기":"green","한글 단어 읽기":"purple","영어 단어 읽기":"locked"};
const GROUP_DESC={"글자 익히기":"자음과 모음 손 모양 익히기","한글 단어 읽기":"지문자로 쓴 단어 읽기","영어 단어 읽기":"준비 중"};
const ZIG=[0,56,84,56,0,-56,-84,-56];

function setBottom(on){document.body.classList.toggle("has-bottom",!!on);}
function render(){
  if(S.view==="title")return titleScreen();
  if(S.view==="lobby")return lobby();
  if(S.view==="play")return play();
  room();
}

/* ----- 타이틀 ----- */
function titleScreen(){
  setBottom(false);
  app.innerHTML=`
  <section class="ts">
    <h1 class="logo"><span class="small">임용</span><span class="main">한 판</span></h1>
    <p class="tagline">책을 펼치기 어려운 날에도,<br>한 문제부터 시작하는 임용 공부.</p>
    <button class="btn" id="start">시작하기</button>
  </section>`;
  app.querySelector("#start").onclick=()=>{S.view="lobby";render();};
}

/* ----- 과목 선택 ----- */
function lobby(){
  setBottom(false);
  app.innerHTML=`
  <div class="top"><button class="icon-btn" id="toTitle" aria-label="타이틀로 돌아가기">${IC.back}</button><span class="t"></span>${starChip()}</div>
  <div><h2 class="h-big">어떤 과목을 한 판 할까요?</h2><p class="sub-txt">과목을 고르면 스테이지가 열려요.</p></div>
  <nav class="subjects" aria-label="과목">${SUBJECTS.map(s=>`
    <button class="subj ${s.off?"off":""}" data-s="${s.id}" ${s.off?'aria-disabled="true"':""} style="${s.col?`--c:var(--${s.col});--d:var(--${s.col}-d)`:""}">
      <span class="g">${s.off?IC.lock:s.g}</span>
      <span style="min-width:0"><b>${s.name}</b><small>${s.desc}</small></span>
      ${s.off?"":`<span class="arrow">${IC.chev}</span>`}
    </button>`).join("")}</nav>
  <p class="note">시험용 버전이에요. 별과 학습 기록은 이 기기에만 저장돼요.</p>`;
  app.querySelector("#toTitle").onclick=()=>{S.view="title";render();};
  app.querySelectorAll(".subj:not(.off)").forEach(b=>b.onclick=()=>{S.view="room";S.subject=b.dataset.s;S.tab=TABS[S.subject][0][0];resetRoom();render();});
}
function resetRoom(){Object.assign(S,{shown:{},idx:0,open:false,fillInput:"",fillResult:null});}

/* ----- 과목 화면 ----- */
function room(){
  setBottom(true);
  const subj=SUBJECTS.find(s=>s.id===S.subject);
  const body=S.tab==="stage"?stagePath():S.tab==="dex"?dex():S.tab==="more"?more():sped();
  app.innerHTML=`
  <div class="top"><button class="icon-btn" id="back" aria-label="과목 선택으로">${IC.back}</button><span class="t">${subj.name}</span>${starChip()}</div>
  ${S.subject==="sped"?`<span class="pill">청각장애 영역 샘플 · 검토 전</span>`:""}
  ${body}
  <nav class="bnav" role="tablist"><div class="in">${TABS[S.subject].map(([k,l,ic])=>`<button role="tab" aria-selected="${S.tab===k}" data-t="${k}">${IC[ic]}<span>${l}</span></button>`).join("")}</div></nav>`;
  wireRoom();
}

function stagePath(){
  let html="",grp="",n=0;
  STAGES.forEach(st=>{
    if(st.grp!==grp){
      if(grp)html+=`</div>`;grp=st.grp;const col=GROUP_COLOR[grp];
      html+=`<div class="unit ${col==="locked"?"locked":""}" style="${col!=="locked"?`--c:var(--${col});--d:var(--${col}-d)`:""}"><small>${STAGES.filter(s=>s.grp===grp)[0].lv&&col!=="locked"?"난이도 1~3단계":"단원"}</small><b>${grp}</b><small style="opacity:.9;letter-spacing:0;font-weight:500">${GROUP_DESC[grp]}</small></div><div class="path">`;
    }
    const col=GROUP_COLOR[st.grp],stars=saved.stars[st.id]||0;
    const face=st.locked?IC.lock:st.type==="word"?st.badge:img(st.badge);
    html+=`<button class="node ${st.locked?"lock":""} ${stars===3?"done":""}" data-st="${st.id}" ${st.locked?'aria-disabled="true"':""}
      style="transform:translateX(${ZIG[n%ZIG.length]}px);${col!=="locked"?`--c:var(--${col});--d:var(--${col}-d)`:""}" aria-label="${st.lv?st.lv+" ":""}${st.name}">
      <span class="disc">${face}</span>
      <span class="name">${st.lv&&!st.locked?st.lv+" · ":""}${st.name}</span>
      ${st.locked?`<span class="src">${st.desc}</span>`:starRow(stars)}
    </button>`;n++;
  });
  return html+`</div><p class="hint">한 판에 ${ROUND}문제, 하트 ${LIVES}개. 정답률 90% 이상이면 별 3개예요.</p>`;
}

function dex(){
  const tiles=l=>l.map(j=>`<button class="tile ${S.hide?"hide":""} ${S.shown[j]?"show":""}" data-j="${j}" aria-label="${S.hide&&!S.shown[j]?"가려진 글자 보기":j}">${img(j)}<b>${j}</b></button>`).join("");
  return `
  <div class="bar"><span>자음 ${CONS.length}개 · 모음 ${VOWS.length}개</span>
    <label class="switch"><input type="checkbox" id="hide" ${S.hide?"checked":""}> 글자 가리기</label></div>
  ${S.hide?`<p class="src">손 모양을 보고 글자를 떠올린 뒤, 칸을 누르면 글자가 보여요.</p>`:""}
  <section class="sect"><h3>자음</h3><div class="grid">${tiles(CONS)}</div></section>
  <section class="sect"><h3>모음</h3><div class="grid">${tiles(VOWS)}</div></section>
  <p class="src">${FS_SOURCE}</p>`;
}

function more(){
  return `
  <div><h2 class="h-big">더 배우기</h2><p class="sub-txt">지문자 이외의 수어는 국립국어원 자료로 스스로 공부할 수 있어요.</p></div>
  ${LINKS.map(l=>`<a class="link" href="${l.u}" target="_blank" rel="noopener"><span class="g">${IC.ext}</span><span style="min-width:0"><b>${l.t}</b><span>${l.d}</span></span></a>`).join("")}
  <section class="sect"><h3>한국수어사전에서 단어 찾기</h3>
    <form class="search" id="dform"><label for="din" class="vh">찾을 단어</label><input id="din" autocomplete="off" placeholder="예: 안녕하세요"><button class="btn blue" type="submit">찾기</button></form>
    <p class="src" id="dout"></p></section>
  <section class="sect"><h3>바로 찾아보기</h3><div class="chips">${SAMPLE_WORDS.map(w=>`<a href="${DICT(w)}" target="_blank" rel="noopener">${w}</a>`).join("")}</div></section>
  <p class="src">한국수어사전 자료는 '저작자표시-비영리-변경금지 2.0 대한민국' 조건으로 제공돼요.</p>`;
}

function sped(){
  if(S.tab==="fill"){
    const L=SPED.fill,it=L[S.idx],r=S.fillResult;
    return `<div class="bar"><span>${S.idx+1} / ${L.length}</span></div>
    <article class="card"><p class="qtext">${esc(it.pre)} <span class="blank">${r?`<span class="hl">${esc(it.ans[0])}</span>`:"&nbsp;"}</span> ${esc(it.post)}</p>
      <form class="search" id="fform"><label for="fin" class="vh">빈칸에 들어갈 말</label><input id="fin" autocomplete="off" placeholder="정답 입력" value="${esc(S.fillInput)}" ${r?"disabled":""}><button class="btn" type="submit" ${r?"disabled":""}>확인</button></form>
      ${r?`<div class="ans"><span class="verdict ${r.ok?"ok":"no"}">${r.ok?"정답이에요!":"아쉬워요"}</span><p>정답: ${esc(it.ans[0])}</p><span class="src">출처: ${esc(it.src)}</span></div>`:""}
    </article>${nav(L.length)}`;
  }
  const L=SPED.concept,it=L[S.idx],st=saved.cards[S.idx];
  return `<div class="bar"><span>${S.idx+1} / ${L.length}</span><span>알아요 ${Object.values(saved.cards).filter(v=>v==="know").length} / ${L.length}</span></div>
  <article class="card"><p class="qtext">${esc(it.q)}</p>
    ${S.open?`<div class="ans"><p>${esc(it.a)}</p><span class="src">출처: ${esc(it.src)}</span></div>
      <div class="row2"><button class="btn ghost" data-mk="again">다시 보기</button><button class="btn" data-mk="know">알아요</button></div>`
    :`<button class="btn blue" id="reveal">답 보기</button>`}
    ${st?`<span class="src">지난번 표시: ${st==="know"?"알아요":"다시 보기"}</span>`:""}
  </article>${nav(L.length)}`;
}
const nav=n=>`<div class="row2"><button class="btn ghost" id="prev" ${S.idx===0?"disabled":""}>이전</button><button class="btn ghost" id="next" ${S.idx>=n-1?"disabled":""}>다음</button></div>`;

function wireRoom(){
  const $=s=>app.querySelector(s);
  $("#back").onclick=()=>{S.view="lobby";render();};
  app.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;resetRoom();render();scrollTo(0,0);});
  app.querySelectorAll(".node:not(.lock)").forEach(b=>b.onclick=()=>startGame(b.dataset.st));
  const h=$("#hide");if(h)h.onchange=()=>{S.hide=h.checked;S.shown={};render();};
  app.querySelectorAll(".tile").forEach(t=>t.onclick=()=>{if(!S.hide)return;S.shown[t.dataset.j]=!S.shown[t.dataset.j];render();});
  const df=$("#dform");if(df)df.onsubmit=e=>{e.preventDefault();const v=$("#din").value.trim();if(!v)return;$("#dout").innerHTML=`<a href="${DICT(v)}" target="_blank" rel="noopener">한국수어사전에서 '${esc(v)}' 검색 결과 열기</a>`;};
  const rv=$("#reveal");if(rv)rv.onclick=()=>{S.open=true;render();};
  app.querySelectorAll("[data-mk]").forEach(b=>b.onclick=()=>{saved.cards[S.idx]=b.dataset.mk;save();S.open=false;if(S.idx<SPED.concept.length-1)S.idx++;render();});
  const ff=$("#fform");if(ff)ff.onsubmit=e=>{e.preventDefault();const v=$("#fin").value.trim();if(!v)return;S.fillInput=v;S.fillResult={ok:SPED.fill[S.idx].ans.some(x=>norm(x)===norm(v))};render();};
  const go=d=>{S.idx+=d;S.open=false;S.fillInput="";S.fillResult=null;render();};
  const p=$("#prev"),n=$("#next");if(p)p.onclick=()=>go(-1);if(n)n.onclick=()=>go(1);
}

/* ----- 게임 ----- */
function startGame(id){
  const st=STAGES.find(s=>s.id===id);
  let qs=[];
  if(st.type==="word")qs=shuffle(st.words).slice(0,ROUND);
  else{let last=null;for(let i=0;i<ROUND;i++){let a;do{a=pick(st.pool);}while(a===last);last=a;qs.push(a);}}
  S.game={st,qs,i:0,lives:LIVES,right:0,combo:0,best:0,answered:null,sel:null,input:"",opts:null,done:false,anim:""};
  makeOpts();S.view="play";render();scrollTo(0,0);
}
function makeOpts(){
  const g=S.game;if(g.st.type==="word"){g.opts=null;return;}
  const a=g.qs[g.i];const pool=g.st.type==="reverse"?(CONS.includes(a)?CONS:VOWS):g.st.pool;
  g.opts=shuffle([a,...shuffle(pool.filter(x=>x!==a)).slice(0,3)]);
}
function check(){
  const g=S.game,a=g.qs[g.i];
  let ok;
  if(g.st.type==="word"){const v=(app.querySelector("#win")||{}).value||"";if(!v.trim())return;g.input=v.trim();ok=norm(g.input)===norm(a.w);}
  else{if(!g.sel)return;ok=g.sel===a;}
  g.answered={ok};
  if(ok){g.right++;g.combo++;g.best=Math.max(g.best,g.combo);g.anim="pop";}else{g.lives--;g.combo=0;g.anim="shake";}
  render();
}
function nextQ(){
  const g=S.game;
  if(g.lives<=0||g.i>=g.qs.length-1)return finish();
  g.i++;g.answered=null;g.sel=null;g.input="";g.anim="";makeOpts();render();
  const inp=app.querySelector("#win");if(inp)inp.focus();
}
function finish(){
  const g=S.game;g.done=true;
  const rate=g.right/g.qs.length;
  g.stars=g.lives<=0?0:rate>=.9?3:rate>=.7?2:rate>=.5?1:0;
  g.newBest=g.stars>(saved.stars[g.st.id]||0);
  if(g.newBest){saved.stars[g.st.id]=g.stars;save();}
  render();
}
function play(){
  const g=S.game;
  if(g.done)return result();
  setBottom(true);
  const a=g.qs[g.i],ans=g.answered,total=g.qs.length,done=g.i+(ans?1:0);
  const optCls=o=>ans?(o===a?"right":(o===g.sel?"wrong":"")):"";
  let q="";
  if(g.st.type==="pick"){
    q=`<h2 class="ask">이 손 모양은 어떤 글자일까요?</h2>${img(a,"big")}
    <div class="choices">${g.opts.map(o=>`<button class="opt ${optCls(o)}" data-o="${o}" aria-pressed="${!ans&&g.sel===o}" ${ans?"disabled":""}>${o}</button>`).join("")}</div>`;
  }else if(g.st.type==="reverse"){
    q=`<h2 class="ask">이 글자의 손 모양을 고르세요</h2><span class="bigchar">${a}</span>
    <div class="choices">${g.opts.map(o=>`<button class="opt img ${optCls(o)}" data-o="${o}" aria-pressed="${!ans&&g.sel===o}" ${ans?"disabled":""} aria-label="보기">${img(o)}</button>`).join("")}</div>`;
  }else{
    q=`<h2 class="ask">지문자로 쓴 단어를 읽어 보세요</h2>
    <div class="word">${a.s.map(sy=>`<div class="syl">${sy.map(j=>img(j)).join("")}</div>`).join("")}</div>
    <label for="win" class="vh">단어 입력</label><input class="answer-in" id="win" autocomplete="off" placeholder="여기에 단어를 입력하세요" value="${esc(g.input)}" ${ans?"disabled":""}>`;
  }
  const right=g.st.type==="word"?a.w:a;
  const last=g.lives<=0||g.i>=total-1;
  const sheet=ans
    ?`<div class="sheet sheet-up ${ans.ok?"ok":"no"}"><div class="in">
        <div class="v"><span class="ic">${ans.ok?IC.check:IC.x}</span>${ans.ok?pick(["정답이에요!","훌륭해요!","잘했어요!"]):"아쉬워요"}</div>
        ${!ans.ok?`<p class="detail">정답: ${right}</p>`:""}
        ${g.st.type==="word"?`<p class="detail jamo">${a.s.map(sy=>sy.join(" ")).join("  +  ")}</p>`:""}
        <button class="btn ${ans.ok?"":"red"}" id="nextQ">${last?"결과 보기":"계속"}</button></div></div>`
    :`<div class="sheet"><div class="in"><button class="btn" id="check" ${(g.st.type==="word"?g.input:g.sel)?"":"disabled"}>확인</button></div></div>`;
  app.innerHTML=`
  <div class="ltop"><button class="icon-btn" id="quit" aria-label="그만하기">${IC.x}</button>
    <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${Math.max(4,done/total*100)}%"></i></div>
    <span class="lives" aria-label="남은 하트 ${g.lives}개">${IC.heart}${g.lives}</span></div>
  <div class="combo" aria-live="polite">${g.combo>=2?`${IC.fire} ${g.combo}연속 정답!`:""}</div>
  <section class="${g.anim}" style="display:flex;flex-direction:column;gap:22px">${q}</section>
  ${sheet}`;
  g.anim="";
  const $=s=>app.querySelector(s);
  $("#quit").onclick=()=>{S.view="room";S.tab="stage";render();};
  app.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{g.sel=b.dataset.o;render();});
  const w=$("#win");
  if(w){w.oninput=()=>{g.input=w.value;const c=$("#check");if(c)c.disabled=!w.value.trim();};
        w.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();check();}};}
  const c=$("#check");if(c)c.onclick=check;
  const nq=$("#nextQ");if(nq){nq.onclick=nextQ;nq.focus();}
}
function result(){
  setBottom(false);
  const g=S.game,answered=Math.max(1,g.i+1);
  const msg=g.lives<=0?"하트를 모두 썼어요":g.stars===3?"완벽해요!":g.stars===2?"잘했어요!":g.stars===1?"조금만 더!":"다시 도전해 봐요";
  app.innerHTML=`
  <section class="result pop">
    <span class="sub-txt">${g.st.lv?g.st.lv+" · ":""}${g.st.name}</span>
    ${starRow(g.stars,"bigstars")}
    <h2 class="${g.stars?"":"fail"}">${msg}</h2>
    ${g.newBest?`<span class="newbest">새 최고 기록</span>`:""}
    <div class="tiles">
      <div class="tile3 g"><small>맞힌 문제</small><b>${g.right}</b></div>
      <div class="tile3 b"><small>정답률</small><b>${Math.round(g.right/answered*100)}%</b></div>
      <div class="tile3 o"><small>최대 연속</small><b>${g.best}</b></div>
    </div>
    <div class="row2"><button class="btn ghost" id="toList">목록으로</button><button class="btn" id="again">다시 하기</button></div>
  </section>`;
  app.querySelector("#toList").onclick=()=>{S.view="room";S.tab="stage";render();};
  app.querySelector("#again").onclick=()=>startGame(g.st.id);
}

render();
</script>
