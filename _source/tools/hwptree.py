import olefile,zlib,struct,sys,json
sys.path.insert(0,'/tmp/claude-0/-home-claude/363cd83c-7093-59e1-8d71-47aff7911bb3/scratchpad')
f=olefile.OleFileIO(sys.argv[1])
def recs(b):
    i=0
    while i<len(b):
        h=struct.unpack('<I',b[i:i+4])[0];i+=4
        tag=h&0x3ff;lvl=(h>>10)&0x3ff;sz=h>>20
        if sz==0xfff: sz=struct.unpack('<I',b[i:i+4])[0];i+=4
        yield [tag,lvl,b[i:i+sz],[]];i+=sz
EXT={1,2,3,4,5,6,7,8,9,11,12,14,15,16,17,18,19,20,21,22,23}
def ptext(b):
    out=[];i=0;n=len(b)//2
    while i<n:
        c=struct.unpack('<H',b[2*i:2*i+2])[0]
        if c in EXT:
            out.append(('\x00CTRL'+b[2*i+2:2*i+6][::-1].decode('latin1')+'\x00').encode('utf-16le')) if c in (11,) else None
            i+=8;continue
        if c==9: out.append('\t'.encode('utf-16le'))
        elif c in (10,13): pass
        elif c==24: out.append('-'.encode('utf-16le'))
        elif c in(30,31): out.append(' '.encode('utf-16le'))
        elif c<32: pass
        else: out.append(b[2*i:2*i+2])
        i+=1
    return b''.join(out).decode('utf-16le','replace')
def tree(rs):
    root=[None,-1,b'',[]];st=[root]
    for r in rs:
        while st[-1][1]>=r[1]: st.pop()
        st[-1][3].append(r);st.append(r)
    return root[3]
# walk paragraphs
def para(node):
    """node is PARA_HEADER; returns dict with text and ctrls (list of control nodes in order)"""
    txt='';ctrls=[]
    for c in node[3]:
        if c[0]==67: txt=ptext(c[2])
        if c[0]==71: ctrls.append(c)
    return txt,ctrls
def cells_of(tblctrl):
    cells=[]
    kids=tblctrl[3]
    tbl=[k for k in kids if k[0]==77]
    rows,cols=struct.unpack('<HH',tbl[0][2][4:8]) if tbl else (0,0)
    cur=None
    for k in kids:
        if k[0]==72:
            b=k[2]
            col,row,cs,rs=struct.unpack('<HHHH',b[8:16])
            cur={'r':row,'c':col,'rs':rs,'cs':cs,'paras':[]};cells.append(cur)
            # paragraphs are children of list header? or siblings
            for p in k[3]:
                if p[0]==66: cur['paras'].append(p)
        elif k[0]==66 and cur is not None:
            cur['paras'].append(k)
    return rows,cols,cells
def flat(paras):
    out=[]
    for p in paras:
        t,cs=para(p)
        t=t.replace('\x00','')
        import re
        t=re.sub(r'CTRL[a-z% ]{4}','',t)
        if t.strip(): out.append(t)
        for c in cs:
            if c[2][:4][::-1]==b'tbl ':
                r,co,cl=cells_of(c)
                for cell in sorted(cl,key=lambda x:(x['r'],x['c'])): out+=flat(cell['paras'])
            elif c[2][:4][::-1]==b'gso ':
                out+=flat(gso_paras(c))
    return out
def gso_paras(c):
    ps=[]
    def rec(n):
        for k in n[3]:
            if k[0]==66: ps.append(k)
            else: rec(k)
    rec(c);return ps
