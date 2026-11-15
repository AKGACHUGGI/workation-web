import json,math,statistics as st,sys
D=sys.argv[1]
K=['quiet','crowd','peer','overnight','vibe']
P={'quiet':dict(quiet=3,crowd=3,peer=1,overnight=1,vibe=0),'lively':dict(quiet=0,crowd=1,peer=3,overnight=2,vibe=3)}
def comp(s,w):
    t=sum(w.values()); return sum(s[k]*w[k] for k in K)/t if t else 0
def grades(v):
    n=len(v); so=sorted(v,reverse=True)
    return ['SABC'[min(3,int(((so.index(x))/n)//0.25))] for x in v]
for scope in ['sigungu','dong']:
    it=json.load(open(f'{D}/tier_{scope}.json'))['items']
    for pk,w in P.items():
        base=[comp(i['scores'],w) for i in it]; n=len(base); so=sorted(base,reverse=True)
        q=[so[int(n*f)] for f in (0.25,0.5,0.75)] if n>3 else []
        print(f"{scope} n={n} preset={pk} mean={st.mean(base):.1f} sd={st.pstdev(base):.1f} min={min(base):.1f} max={max(base):.1f} 경계(S/A,A/B,B/C)={[round(x,1) for x in q]} 간격={[round(q[i]-q[i+1],1) for i in range(len(q)-1)]} IQR={q[0]-q[2]:.1f}")
        # 최대 등급 이동 가능: C최상위에서 S경계까지 거리
        gs=grades(base)
        minS=min(b for b,g in zip(base,gs) if g=='S'); maxC=max(b for b,g in zip(base,gs) if g=='C')
        print(f"   C최고→S최저 거리={minS-maxC:.1f}")
