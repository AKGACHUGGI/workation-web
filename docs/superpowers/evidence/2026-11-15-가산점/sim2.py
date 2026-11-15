import json,math,sys,collections
D=sys.argv[1]
K=['quiet','crowd','peer','overnight','vibe']
P={'quiet':dict(quiet=3,crowd=3,peer=1,overnight=1,vibe=0),'lively':dict(quiet=0,crowd=1,peer=3,overnight=2,vibe=3)}
CAP=float(sys.argv[2]) if len(sys.argv)>2 else 15
MIX=dict(metric=.5,terrain=.2,place=.3)
def comp(s,w):
    t=sum(w.values()); return sum(s[k]*w[k] for k in K)/t if t else 0
def grades(v):
    n=len(v); so=sorted(v,reverse=True)
    return ['SABC'[min(3,int(((so.index(x))/n)//0.25))] for x in v]
def prof(ev):
    m={k:0 for k in K}; t=collections.Counter(); pl=collections.Counter(); S=0
    def addn(v,w):
        s=sum(v.values())
        if s>0:
            for k in K:m[k]+=v[k]/s*w
    for e in ev:
        w=.5**(e['age']/7); S+=w
        if e['kind']=='search':
            addn(P[e['preset']],w)
            for x in e.get('terrain',[]): t[x]+=w
            continue
        it=e['item']; pl[it['id']]+=w
        if e['kind']=='dong': pl[it['sigungu']['id']]+=w*.5
        addn({k:max(0,it['scores'][k]-50)/50 for k in K},w*.5)
        for x in it['terrain']: t[x]+=w*.5
    return m,t,pl,S
def boost(p,u):
    m,t,pl,S=p
    if S==0: return 0
    s=1-math.exp(-S/2)
    mm=comp(u['scores'],m)/100 if sum(m.values())>0 else 0
    tm=max(t.values()) if t else 0
    tmatch=max([t[x]/tm for x in u['terrain']]) if tm>0 and u['terrain'] else 0
    pw=pl[u['id']]+(pl[u['sigungu']['id']]*.5 if u.get('sigungu') else 0)
    return CAP*(MIX['metric']*s*mm+MIX['terrain']*s*tmatch+MIX['place']*(1-math.exp(-pw)))
for scope in ['sigungu','dong']:
    it=json.load(open(f'{D}/tier_{scope}.json'))['items']
    print(scope,'terrain분포',collections.Counter(tuple(i['terrain']) for i in it))
    base=[comp(i['scores'],P['quiet']) for i in it]; bg=grades(base)
    # 대상: B 등급 중 최하위 / C 최상위
    order=sorted(range(len(it)),key=lambda i:-base[i])
    tgt=[i for i in order if bg[i]=='C'][0]
    scen={
     '조회1회(C최상위, 지금)':[dict(kind='dong' if scope=='dong' else 'region',item=it[tgt],age=0)],
     '조회3회(같은곳, 3일간)':[dict(kind='dong' if scope=='dong' else 'region',item=it[tgt],age=a) for a in (0,1,2)],
     '검색quiet 1회':[dict(kind='search',preset='quiet',terrain=[],age=0)],
     '검색lively 3회+mountain':[dict(kind='search',preset='lively',terrain=['mountain'],age=a) for a in (0,1,2)],
     '조회10회(다른곳들,2주)':[dict(kind='dong' if scope=='dong' else 'region',item=it[order[j*len(it)//10]],age=j*1.4) for j in range(10)],
     '한달전 조회5회(같은곳)':[dict(kind='dong' if scope=='dong' else 'region',item=it[tgt],age=30+a) for a in range(5)],
    }
    for name,ev in scen.items():
        p=prof(ev); b=[boost(p,u) for u in it]
        pers=[x+y for x,y in zip(base,b)]; pg=grades(pers)
        raw2=sum(1 for x,y in zip(bg,pg) if 'SABC'.index(x)-'SABC'.index(y)>=2)
        up=sum(1 for x,y in zip(bg,pg) if 'SABC'.index(y)<'SABC'.index(x))
        down=sum(1 for x,y in zip(bg,pg) if 'SABC'.index(y)>'SABC'.index(x))
        bs=sorted(b)
        print(f"  {name}: S={p[3]:.2f} boost min/med/max={bs[0]:.1f}/{bs[len(bs)//2]:.1f}/{bs[-1]:.1f} 대상boost={b[tgt]:.1f} 대상 {bg[tgt]}->{pg[tgt]}(클램프전) 상승{up} 하락(클램프전){down} 2단계↑{raw2}")
