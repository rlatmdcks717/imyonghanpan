# 영역별 키워드 문제 파일(a??_*.py)을 모아 data/keyq.json으로 만듦
import glob,importlib.util,json,os
H=os.path.dirname(os.path.abspath(__file__));out=[]
for f in sorted(glob.glob(os.path.join(H,'a[0-9][0-9]_*.py'))):
    sp=importlib.util.spec_from_file_location('m',f);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
    qs=[]
    for i,(q,o,a,e) in enumerate(m.QS):
        assert len(o)==4 and 0<=a<4 and len(set(o))==4,(f,i,q)
        qs.append({"q":q,"o":o,"a":a,"e":e})
    out.append({"area":m.AREA,"qs":qs})
json.dump({"areas":out},open(os.path.join(H,'..','..','data','keyq.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print({a['area']:len(a['qs']) for a in out})
