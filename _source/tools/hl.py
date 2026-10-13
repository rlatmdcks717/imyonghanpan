import json,re,subprocess,sys
K=170/72
q=json.load(open('/home/claude/past/qimgs.json'))
_cache={}
def words(ex,pg):
    if (ex,pg) not in _cache:
        bb=subprocess.run(['pdftotext','-f',str(pg),'-l',str(pg),'-bbox',f'/home/claude/past/{ex}.pdf','-'],capture_output=True,text=True).stdout
        import html
        _cache[(ex,pg)]=[(float(a)*K,float(b)*K,float(c)*K,float(d)*K,html.unescape(t)) for a,b,c,d,t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>',bb)]
    return _cache[(ex,pg)]
norm=lambda s:re.sub(r'\s+','',s)
def qwords(ex,n):
    out=[]
    for pi,part in enumerate(q[ex][str(n)]):
        for w in words(ex,part['pg']):
            cx=(w[0]+w[2])/2;cy=(w[1]+w[3])/2
            if part['ox']<=cx<=part['ox']+part['ow'] and part['oy']<=cy<=part['oy']+part['oh']:
                out.append((pi,)+w)
    return out
def find(ex,n,phrases):
    ws=qwords(ex,n);s='';idx=[]
    for i,w in enumerate(ws):
        t=norm(w[5]);s+=t;idx+= [i]*len(t)
    rects=[];miss=[]
    for ph in phrases:
        p=norm(ph);pos=s.find(p)
        if pos<0: miss.append(ph);continue
        while pos>=0:
            sel=sorted(set(idx[pos:pos+len(p)]))
            # 줄별로 묶기
            lines={}
            for i in sel:
                w=ws[i];key=(w[0],round(w[2]/6))
                lines.setdefault(key,[]).append(w)
            for (pi,_),L in lines.items():
                part=q[ex][str(n)][pi]
                x0=min(w[1] for w in L)-3;x1=max(w[3] for w in L)+3;y0=min(w[2] for w in L)-2;y1=max(w[4] for w in L)+2
                rects.append({'p':pi,'x':round((x0-part['ox'])/part['ow']*100,2),'y':round((y0-part['oy'])/part['oh']*100,2),'w':round((x1-x0)/part['ow']*100,2),'h':round((y1-y0)/part['oh']*100,2)})
            pos=s.find(p,pos+len(p))
    return rects,miss
if __name__=='__main__':
    ex,n=sys.argv[1],int(sys.argv[2])
    ws=qwords(ex,n);print(len(ws));print(''.join(w[5]+' ' for w in ws)[:1500])
