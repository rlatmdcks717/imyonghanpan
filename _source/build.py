# 임용한판 빌드 스크립트
# template.html + data/*.json  ->  저장소 맨 위의 index.html, sw.js, manifest.webmanifest
# 사용법: python3 _source/build.py   (저장소 폴더에서 실행)
import os, re, json, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
D = lambda f: os.path.join(HERE, 'data', f)
MAP = {'__FS__':'fs.json','__NUM__':'num.json','__EN__':'en.json','__LAW__':'law.json','__DOCS__':'docs.json',
       '__CMP__':'cmpmap.json','__LQ__':'quiz_law.json','__CUR__':'curr2.json','__PAST__':'past.json',
       '__PASTQ__':'pastq.json','__PASTHL__':'hl.json'}
body = open(os.path.join(HERE,'template.html'),encoding='utf-8').read()
for k,f in MAP.items():
    assert k in body, k
    body = body.replace(k, open(D(f),encoding='utf-8').read().strip())
open(os.path.join(HERE,'artifact.html'),'w',encoding='utf-8').write(body)   # 클로드 아티팩트용 본문
ver = re.search(r'version:"(v[\d.]+)', body).group(1)
head = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#58CC02">
<meta name="description" content="책을 펼치기 어려운 날에도 한 문제부터 시작하는 특수 임용 공부">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="임용한판">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
'''
i = body.index('</style>') + len('</style>')
html = head + body[:i] + '\n</head>\n<body>\n' + body[i:] + '''
<script>
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{});});}
</script>
</body>
</html>
'''
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(html)
json.dump({"name":"임용한판","short_name":"임용한판","description":"책을 펼치기 어려운 날에도 한 문제부터 시작하는 특수 임용 공부",
 "lang":"ko","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#FFFFFF","theme_color":"#58CC02",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},
 open(os.path.join(ROOT,'manifest.webmanifest'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
_h = hashlib.md5(html.encode())
for f in sorted(os.listdir(os.path.join(ROOT,'icons'))):   # 아이콘이 바뀌어도 새 버전으로 인식
    _h.update(open(os.path.join(ROOT,'icons',f),'rb').read())
h = _h.hexdigest()[:8]
sw = '''// 임용한판 서비스 워커: 처음 열 때 필수 파일을 저장해 두고, 인터넷이 없어도 열리게 함
const CACHE="hanpan-%s-%s";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-180.png","icons/icon-32.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
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
''' % (ver, h)
open(os.path.join(ROOT,'sw.js'),'w',encoding='utf-8').write(sw)
open(os.path.join(ROOT,'.nojekyll'),'w').write('')
print('built', ver, h)
