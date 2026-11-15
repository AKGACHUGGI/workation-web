"""라운드 3 추가 후보 2개 (+ 비교용 C3+S+P2, C1). round3.py 와 같은 기준. 사용: python3 round3b.py [sigungu|dong]"""
import sys, json
import round3
from round3 import C3, D
round3.CAND = {
    'C3+S+P2': dict(C3, BRANCH_SHARE=True, PLACE_SAT=2.0),
    'C3+S+P2+B': dict(C3, BRANCH_SHARE=True, PLACE_SAT=2.0, METRIC='diff'),
    'CAP15+S+P2': dict(D, MIX=(.2, .1, .7), BRANCH_SHARE=True, PLACE_SAT=2.0),
    'C1': round3.C1,
}
scope = sys.argv[1] if len(sys.argv) > 1 else 'sigungu'
sys.argv = ['round3.py', scope]
exec(open('round3.py').read().split("if __name__ == '__main__':")[1].replace('\n    ', '\n').replace("result_round3_", "result_round3b_"), vars(round3))
