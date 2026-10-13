import sys,re,json
sys.argv=['x','/home/claude/cur/src.hwp']
exec(open('/tmp/claude-0/-home-claude/363cd83c-7093-59e1-8d71-47aff7911bb3/scratchpad/hwptree.py').read())
d=zlib.decompress(f.openstream('BodyText/Section1').read(),-15)
T=tree(list(recs(d)))
def clean(t):
    t=t.replace('\x00','');t=re.sub(r'CTRL[a-z% ]{4}','',t)
    return t
blocks=[]
def kind(c): return c[2][:4][::-1].decode('latin1')
for p in T:
    t,cs=para(p)
    t=clean(t)
    for c in cs:
        k=kind(c)
        if k in('head','foot','secd','cold','nwno','bokm','atno','%xrf'):continue
        if k=='gso ':
            lines=[clean(x).strip() for x in flat(gso_paras(c))]
            lines=[x for x in lines if x]
            if lines: blocks.append({'t':'g','lines':lines})
        elif k=='tbl ':
            r,co,cl=cells_of(c)
            cells=[{'r':x['r'],'c':x['c'],'rs':x['rs'],'cs':x['cs'],'lines':[clean(y) for y in flat(x['paras'])]} for x in cl]
            blocks.append({'t':'tbl','rows':r,'cols':co,'cells':cells})
        else: blocks.append({'t':'ctrl','k':k})
    if t.strip(): blocks.append({'t':'p','text':t.rstrip()})
json.dump(blocks,open('/home/claude/cur/blocks.json','w'),ensure_ascii=False)
from collections import Counter
print(len(blocks),Counter(b['t'] for b in blocks))
pua=Counter(ch for b in blocks for s in ([b.get('text','')]+b.get('lines',[])+[l for c in b.get('cells',[]) for l in c['lines']]) for ch in s if 0xE000<=ord(ch)<=0xF8FF or ord(ch)>=0xF0000)
print(pua)
print([ (b.get('k')) for b in blocks if b['t']=='ctrl'])
for b in blocks:
    if b['t']=='g': print('G',b['lines'])
