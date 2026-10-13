import numpy as np,glob,os,json
from PIL import Image
os.makedirs('/home/claude/past/out',exist_ok=True)
man={}
def trim(a,pad=14):
    dark=a<200
    rows=np.where(dark.any(1))[0];cols=np.where(dark.any(0))[0]
    if len(rows)==0: return None
    return a[max(rows[0]-pad,0):rows[-1]+pad, max(cols[0]-pad,0):cols[-1]+pad]
for ex in ['2025A','2025B','2026A','2026B']:
    files=sorted(glob.glob(f'/home/claude/past/hi/{ex}-*.png'),key=lambda x:int(x.split('-')[-1][:-4]))
    parts=[]
    for f in files:
        a=np.array(Image.open(f).convert('L'))
        h,w=a.shape
        # 가운데 세로 구분선 찾기 (w/2 근처에서 어두운 픽셀이 가장 긴 열)
        best=None
        for x in range(int(w*0.45),int(w*0.55)):
            col=a[:,x]<150
            if best is None or col.sum()>best[1]: best=(x,col.sum())
        x0=best[0];col=a[:,x0]<150
        ys=np.where(col)[0]
        # 가장 긴 연속 구간
        segs=[];s=ys[0];p=ys[0]
        for y in ys[1:]:
            if y-p>3: segs.append((s,p));s=y
            p=y
        segs.append((s,p));y0,y1=max(segs,key=lambda t:t[1]-t[0])
        pg=os.path.basename(f)[:-4]
        if y0>h*0.12:  # 위쪽 머리말(1쪽 제목 상자)
            head=trim(a[0:y0,:]); 
            if head is not None: parts.append(('head',head))
        for side,(xa,xb) in (('L',(0,x0-4)),('R',(x0+5,w))):
            c=trim(a[y0:y1,xa:xb])
            if c is not None and (c<200).sum()>500: parts.append((side,c))
    out=[]
    for i,(k,c) in enumerate(parts):
        im=Image.fromarray(c)
        if im.width>1000: im=im.resize((1000,int(im.height*1000/im.width)),Image.LANCZOS)
        fn=f'{ex}_{i+1:02d}.webp';im.save('/home/claude/past/out/'+fn,'WEBP',quality=72,method=6)
        out.append({'f':fn,'w':im.width,'h':im.height,'k':k})
    man[ex]=out
json.dump(man,open('/home/claude/past/manifest.json','w'),ensure_ascii=False,indent=0)
for k,v in man.items(): print(k,len(v),[x['k'] for x in v])
