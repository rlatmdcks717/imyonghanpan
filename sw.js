// 임용한판 서비스 워커: 처음 열 때 필수 파일을 저장해 두고, 인터넷이 없어도 열리게 함
const CACHE="hanpan-v0.59-edcdcbee";
const CORE=["./","index.html","manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  // 앱 화면: 인터넷이 되면 새 버전, 안 되면 저장본
  if(req.mode==="navigate"||url.pathname.endsWith("/index.html")){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("index.html",c));return r;}).catch(()=>caches.match("index.html")));return;}
  // 그림·글꼴 등: 저장본이 있으면 바로, 없으면 받아서 저장
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));}return r;})));
});
