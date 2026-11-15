"""attacker: 반감기 분리안(의도 HL7, 장소 HL_P) 을 runner 하네스로 재는 스크립트"""
import boost as B
from boost import *
from scenarios import NOW, w4, rview
SG=load('2025-10','sigungu')
orig=B.build_profile
def bp_split(events,now,P):
    hp=P.get('HLP')
    if not hp: return orig(events,now,P)
    p=orig(events,now,P)  # metric/terrain/strength 는 HL(7)
    place={}
    for e in events:
        if now-e['at']>P['MAX_AGE']*DAY or e['kind']=='search': continue
        w=0.5**((now-e['at'])/(hp*DAY))
        place[e['target']]=place.get(e['target'],0)+w
        sg=e['payload'].get('sigunguId')
        if e['kind']=='dong_view' and sg: place[sg]=place.get(sg,0)+w*P['SHARE']
    p['place']=place; return p
def srch(pr,age=0): return dict(kind='search',target=None,at=NOW-age*DAY,payload=dict(q='',preset=pr,terrain=[],month=None))
def view(ev,screen,P):
    base=[composite(u['scores'],PRESET[screen]) for u in SG]; bg=to_grades(base)
    P=dict(P,SCREEN=PRESET[screen])
    p=bp_split(ev,NOW,P); b=[boost_for(p,u,P) for u in SG]; pg=[g for _,g in personalize(base,b)]
    return {u['id']:b[i] for i,u in enumerate(SG)},[f"{SG[i]['name']} {bg[i]}→{pg[i]}" for i in range(12) if bg[i]!=pg[i]]
top=max(SG,key=lambda u:composite(u['scores'],PRESET['lively']))
V={'현재(HL7,abs,.5/.2/.3)':dict(DEFAULT),
   'HL21 단일(.5/.2/.3)':dict(DEFAULT,HL=21,MAX_AGE=90),
   '분리 HLP21 abs .5/.2/.3':dict(DEFAULT,HLP=21,MAX_AGE=90),
   'diff .2/.1/.7 HL7':dict(DEFAULT,METRIC='diff',MIX=(.2,.1,.7)),
   'diff .2/.1/.7 분리HLP14':dict(DEFAULT,METRIC='diff',MIX=(.2,.1,.7),HLP=14,MAX_AGE=90),
   'diff .2/.1/.7 분리HLP21':dict(DEFAULT,METRIC='diff',MIX=(.2,.1,.7),HLP=21,MAX_AGE=90),
   'diff .3/.1/.6 분리HLP21':dict(DEFAULT,METRIC='diff',MIX=(.3,.1,.6),HLP=21,MAX_AGE=90)}
for n,P in V.items():
    b,ch=view(w4(30)+[srch('lively')],'lively',P); old=(b['51820']+b['51830'])/2
    b5,_=view([rview('51820',a) for a in [28,21,14,7,0]],'quiet',P); bx,_=view([rview('51820',a) for a in range(5)],'quiet',P)
    bm,chm=view([rview('51820',a) for a in [28,21,14,7]]+[rview('51150')],'quiet',P)
    print(f"{n}\n  2a 옛={old:.2f} 오늘1위 {top['name']}={b[top['id']]:.2f} 비={old/max(b[top['id']],1e-9):.2f} 변화={ch}\n  2b 주1회/하루5건={b5['51820']/bx['51820']:.2f}\n  2c 고성(옛)={bm['51820']:.2f} 강릉(오늘)={bm['51150']:.2f} 변화={chm}")
