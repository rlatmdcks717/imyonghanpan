import olefile,zlib,struct,sys,json
f=olefile.OleFileIO(sys.argv[1])
def recs(b):
    i=0
    while i<len(b):
        h=struct.unpack('<I',b[i:i+4])[0];i+=4
        tag=h&0x3ff;lvl=(h>>10)&0x3ff;sz=h>>20
        if sz==0xfff: sz=struct.unpack('<I',b[i:i+4])[0];i+=4
        yield tag,lvl,b[i:i+sz];i+=sz
EXT={1,2,3,4,5,6,7,8,9,11,12,14,15,16,17,18,19,20,21,22,23}
def ptext(b):
    out=[];i=0;n=len(b)//2
    while i<n:
        c=struct.unpack('<H',b[2*i:2*i+2])[0]
        if c in EXT: i+=8;continue
        if c==9: out.append('\t'.encode('utf-16le'))
        elif c in (10,13): out.append('\n'.encode('utf-16le'))
        elif c==24: out.append('-'.encode('utf-16le'))
        elif c==30: out.append(' '.encode('utf-16le'))
        elif c==31: out.append(' '.encode('utf-16le'))
        elif c<32: pass
        else: out.append(b[2*i:2*i+2])
        i+=1
    return b''.join(out).decode('utf-16le','replace')
rows=[]
for s in ['BodyText/Section0','BodyText/Section1']:
    d=zlib.decompress(f.openstream(s).read(),-15)
    lv=None
    for tag,l,b in recs(d):
        if tag==66: lv=l   # PARA_HEADER
        elif tag==67: rows.append([lv,ptext(b).rstrip('\n')])
        elif tag==71: rows.append([l,'<<CTRL:'+b[:4][::-1].decode('latin1')+'>>'])
json.dump(rows,open(sys.argv[2],'w'),ensure_ascii=False)
print(len(rows))
