import subprocess,re,json,numpy as np,glob
from PIL import Image
res={}
for ex in ['2025A','2025B','2026A','2026B']:
    files=sorted(glob.glob(f'/home/claude/past/hi/{ex}-*.png'),key=lambda x:int(x.split('-')[-1][:-4]))
    txt=''
    for pi,f in enumerate(files,1):
        a=np.array(Image.open(f).convert('L'));h,w=a.shape
        best=max(range(int(w*.45),int(w*.55)),key=lambda x:(a[:,x]<150).sum())
        ys=np.where(a[:,best]<150)[0]
        segs=[];s=p=ys[0]
        for y in ys[1:]:
            if y-p>3: segs.append((s,p));s=y
            p=y
        segs.append((s,p));y0,y1=max(segs,key=lambda t:t[1]-t[0])
        k=72/170
        X=best*k;Y0=y0*k;Y1=y1*k;W=w*k
        for (x,wd) in ((0,X),(X+2,W-X-2)):
            out=subprocess.run(['pdftotext','-f',str(pi),'-l',str(pi),'-x',str(int(x)),'-y',str(int(Y0)),'-W',str(int(wd)),'-H',str(int(Y1-Y0)),f'/home/claude/past/{ex}.pdf','-'],capture_output=True,text=True).stdout
            txt+=out+'\n'
    # 문항 나누기
    parts=re.split(r'\n\s*(\d{1,2})\.\s',('\n'+txt))
    qs={}
    for i in range(1,len(parts)-1,2):
        n=int(parts[i])
        if n not in qs and (not qs or n==max(qs)+1): qs[n]=parts[i+1]
        elif n in qs: qs[n]+=' '+parts[i+1]
        else: qs[max(qs)]+='\n'+parts[i]+'. '+parts[i+1]
    res[ex]={n:re.sub(r'[ \t]+',' ',t).strip() for n,t in qs.items()}
    print(ex,sorted(res[ex].keys()))
json.dump(res,open('/home/claude/past/qtext.json','w'),ensure_ascii=False,indent=1)
