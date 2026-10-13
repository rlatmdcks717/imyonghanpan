import numpy as np,glob,os,json,re,subprocess
from PIL import Image
OUT='/home/claude/past/qout';os.makedirs(OUT,exist_ok=True)
K=170/72
def trim(a,pad=14):
    dark=a<200
    rows=np.where(dark.any(1))[0];cols=np.where(dark.any(0))[0]
    if len(rows)==0: return None
    global TY,TX
    TY=max(rows[0]-pad,0);TX=max(cols[0]-pad,0)
    return a[TY:rows[-1]+pad, TX:cols[-1]+pad]
res={}
for ex in ['2025A','2025B','2026A','2026B']:
    files=sorted(glob.glob(f'/home/claude/past/hi/{ex}-*.png'),key=lambda x:int(x.split('-')[-1][:-4]))
    segs=[]  # (q, page, col, y0px, y1px, xa, xb)
    cur=None
    for pi,f in enumerate(files,1):
        a=np.array(Image.open(f).convert('L'));h,w=a.shape
        x0=max(range(int(w*.45),int(w*.55)),key=lambda x:(a[:,x]<150).sum())
        ys=np.where(a[:,x0]<150)[0];ss=[];s=p=ys[0]
        for y in ys[1:]:
            if y-p>3: ss.append((s,p));s=y
            p=y
        ss.append((s,p));y0,y1=max(ss,key=lambda t:t[1]-t[0])
        bb=subprocess.run(['pdftotext','-f',str(pi),'-l',str(pi),'-bbox',f'/home/claude/past/{ex}.pdf','-'],capture_output=True,text=True).stdout
        ws=[(float(a1),float(b1),float(c1),float(d1),t) for a1,b1,c1,d1,t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>',bb)]
        for col,(xa,xb) in enumerate(((0,x0-4),(x0+5,w))):
            # 이 단 안의 문항 번호 (단 왼쪽 가장자리 근처)
            colws=[w_ for w_ in ws if xa/K<=w_[0]<xb/K]
            if not colws: continue
            left=min(w_[0] for w_ in colws)
            bye=[w_ for w_ in colws if '수고' in w_[4]]
            cy1=min([int(w_[1]*K)-12 for w_ in bye]+[y1])
            starts=sorted([(int(w_[1]*K)-10,int(w_[4][:-1])) for w_ in colws if re.fullmatch(r'\d{1,2}\.',w_[4]) and w_[3]-w_[1]>13 and w_[0]-left<12 and y0<w_[1]*K<cy1])
            # 다음 번호만 인정
            ok=[];nxt=(cur or 0)+1
            for y,n in starts:
                if n==nxt: ok.append((y,n));nxt+=1
            top=y0
            if cur is not None:
                end=ok[0][0] if ok else cy1
                if end-top>40: segs.append((cur,pi,col,top,end,xa,xb))
            for i,(y,n) in enumerate(ok):
                end=ok[i+1][0] if i+1<len(ok) else cy1
                segs.append((n,pi,col,y,end,xa,xb));cur=n
    # 자르기
    qs={}
    imgs={pi:np.array(Image.open(f).convert('L')) for pi,f in enumerate(files,1)}
    for (n,pi,col,ya,yb,xa,xb) in segs:
        c=trim(imgs[pi][ya:yb,xa:xb])
        if c is None or (c<200).sum()<400 or ((c<200).any(1)).sum()<40: continue
        txt_chk=None
        im=Image.fromarray(c)
        if im.width>1000: im=im.resize((1000,int(im.height*1000/im.width)),Image.LANCZOS)
        k=len(qs.setdefault(n,[]))+1
        fn=f'{ex}_q{n:02d}_{k}.webp';im.save(f'{OUT}/{fn}','WEBP',quality=72,method=6)
        qs[n].append({'f':'past/q/'+fn,'w':im.width,'h':im.height,'pg':pi,'ox':int(xa+TX),'oy':int(ya+TY),'ow':c.shape[1],'oh':c.shape[0]})
    res[ex]=qs
    print(ex,{n:len(v) for n,v in qs.items()})
json.dump(res,open('/home/claude/past/qimgs.json','w'))
