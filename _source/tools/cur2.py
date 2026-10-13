import json,re
B=json.load(open('/home/claude/cur/blocks.json'))
rows=json.load(open('/home/claude/cur/rows.json'))
intro0=[r[1].strip() for r in rows if r[1].strip().startswith('이 교육과정은 유아교육법') or r[1].strip().startswith('이 교육과정의 성격은 제1부')]
assert len(intro0)==2
def kind_of(s,ind,nxt):
    if re.match(r'^[가-하]\. ',s):
        return 'gh' if len(s)<30 and not s.endswith('다.') else 'gs'
    if re.match(r'^[①-⑳]',s): return 'note'
    if re.match(r'^\d+\) ',s): return 'i1'
    if re.match(r'^[가-하]\) ',s): return 'i2'
    if re.match(r'^\(\d+\) ',s): return 'i3'
    if re.match(r'^[⦁•]',s): return 'dot'
    if re.match(r'^<표 \d+>$',s): return 'cap'
    if re.match(r'^[󰊱-󰊸]',s): return 'sub'
    return 'p'
def conv(blocks):
    out=[]
    for b in blocks:
        if b['t']=='p':
            m=re.match(r'^(\s*)(.*)$',b['text']);s=m.group(2).rstrip()
            if s: out.append({'k':kind_of(s,len(m.group(1)),None),'s':s})
        elif b['t']=='tbl':
            if b['rows']==1 and b['cols']==1:
                ls=[x.strip() for x in b['cells'][0]['lines'] if x.strip()]
                out.append({'k':'box','lines':ls})
            else:
                cells=[{'r':c['r'],'c':c['c'],'rs':c['rs'],'cs':c['cs'],'s':' '.join(x.strip() for x in c['lines']).strip()} for c in b['cells']]
                for c in cells:
                    if c['s']=='교 과 (군)': c['s']='교과(군)'
                out.append({'k':'tbl','rows':b['rows'],'cols':b['cols'],'cells':cells})
        elif b['t']=='g': out.append({'k':'G','s':b['lines'][0]})
    return out
def chapter(a,b):
    L=conv(B[a:b]);secs=[];intro=None
    for l in L[1:]:
        if l['k']=='G': secs.append({'h':l['s'],'lines':[]});continue
        if not secs:
            if l['k']=='box': intro=l['lines'];continue
            secs.append({'h':None,'lines':[]})
        secs[-1]['lines'].append(l)
    return L[0]['s'],intro,secs
CH=[]
t,intro,secs=chapter(66,73);CH.append({'id':'nat','short':'성격','name':'교육과정의 성격','intro':None,'secs':[{'h':'총론의 성격','lines':[{'k':'p','s':x} for x in intro0]},{'h':'초⋅중등학교 교육과정의 성격','lines':secs[0]['lines']}]})
t,intro,secs=chapter(73,124);CH.append({'id':'c1','short':'Ⅰ 구성의 방향','name':t,'intro':intro,'secs':secs})
t,intro,secs=chapter(124,183);CH.append({'id':'c2','short':'Ⅱ 설계와 운영','name':t,'intro':intro,'secs':secs})
t,intro,secs=chapter(183,215);CH.append({'id':'c3','short':'Ⅲ 기본 사항','name':t+' › 1. 기본 사항','intro':intro,'secs':secs})
# 기본 교육과정 중/고
def kb(a,b,name):
    L=conv(B[a:b]);secs=[]
    for l in L:
        if l['k']=='gh': secs.append({'h':l['s'],'lines':[]});continue
        secs[-1]['lines'].append(l)
    return secs
CH.append({'id':'mid','short':'Ⅲ 기본 · 중학교','name':'Ⅲ. 3. 기본 교육과정 › 중학교','intro':None,'secs':kb(440,470,'중학교'),'school':'중학교'})
CH.append({'id':'high','short':'Ⅲ 기본 · 고등학교','name':'Ⅲ. 3. 기본 교육과정 › 고등학교','intro':None,'secs':kb(471,502,'고등학교'),'school':'고등학교'})
t,intro,secs=chapter(502,576);CH.append({'id':'c4','short':'Ⅳ 학교 교육과정 지원','name':t,'intro':intro,'secs':secs})
json.dump({'src':'교육부 고시 제2022-34호 [별책 1] 특수교육 교육과정 총론 › 제2부 초⋅중등학교 교육과정','chapters':CH},open('/home/claude/cur/curr2.json','w'),ensure_ascii=False)
from collections import Counter
for c in CH:
    print(c['id'],c['name'],'intro' if c['intro'] else '',[ (s['h'],len(s['lines']),dict(Counter(l['k'] for l in s['lines']))) for s in c['secs']])
