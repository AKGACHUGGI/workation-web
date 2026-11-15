import json,math,sys,collections
D=sys.argv[1];K=['quiet','crowd','peer','overnight','vibe']
P={'quiet':dict(quiet=3,crowd=3,peer=1,overnight=1,vibe=0),'lively':dict(quiet=0,crowd=1,peer=3,overnight=2,vibe=3)}
comp=lambda s,w:sum(s[k]*w[k] for k in K)/sum(w.values()) if sum(w.values()) else 0
it=json.load(open(f'{D}/tier_sigungu.json'))['items']; byname={i['name']:i for i in it}
def run(ev,hl_int,hl_place,cap=15,mix=(.5,.2,.3),search_w=1.0,diff=False,base_w=P['quiet']):
    m={k:0 for k in K};t=collections.Counter();pl=collections.Counter();S=0
    def addn(v,w):
        s=sum(v.values())
        if s>0:
            for k in K:m[k]+=v[k]/s*w
    for e in ev:
        wi=.5**(e['age']/hl_int); wp=.5**(e['age']/hl_place)
        if e['kind']=='search':
            S+=wi*search_w; addn(P[e['preset']],wi*search_w); continue
        S+=wi; pl[e['item']['id']]+=wp
        addn({k:max(0,e['item']['scores'][k]-50)/50 for k in K},wi*.5)
        for x in e['item']['terrain']:t[x]+=wi*.5
    s=1-math.exp(-S/2); out={}
    for u in it:
        if sum(m.values())>0:
            mm=comp(u['scores'],m)/100
            if diff: mm=max(0,mm-comp(u['scores'],base_w)/100)*2  # 차이형, 스케일 2배
        else: mm=0
        tm=max(t.values()) if t else 0
        tt=max([t[x]/tm for x in u['terrain']]) if tm and u['terrain'] else 0
        out[u['name']]=cap*(mix[0]*s*mm+mix[1]*s*tt+mix[2]*(1-math.exp(-pl[u['id']])))
    return out
g=byname['고성군']
ev=[dict(kind='view',item=g,age=30+a*0.5) for a in range(4)]+[dict(kind='search',preset='lively',age=0)]
liv=sorted(it,key=lambda u:-comp(u['scores'],P['lively']))[0]['name']
print('lively 1위',liv)
for name,kw in {'HL7 전부':dict(hl_int=7,hl_place=7),'HL21 전부':dict(hl_int=21,hl_place=21),
 '분리: 의도HL7, 장소HL21':dict(hl_int=7,hl_place=21),
 '분리+검색가중2':dict(hl_int=7,hl_place=21,search_w=2),
 '분리+차이형':dict(hl_int=7,hl_place=21,diff=True),
 'HL7 + 차이형':dict(hl_int=7,hl_place=7,diff=True)}.items():
    o=run(ev,**kw); top=sorted(o.items(),key=lambda x:-x[1])[:3]
    print(f"{name}: 고성 {o['고성군']:.2f}  {liv} {o[liv]:.2f}  상위3 {[(n,round(v,2)) for n,v in top]}")
