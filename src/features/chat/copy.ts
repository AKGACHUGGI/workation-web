/** 채팅 질문 최대 글자 수 (백엔드 400 QUESTION_INVALID 기준) */
export const CHAT_MAX = 100

export const CHAT_COPY = {
  chatLabel: '이 동네에 물어보기',
  chatPlaceholder: '이 동네에 대해 물어보세요',
  chatSend: '보내기',
  chatCount: (n: number) => `${n}/${CHAT_MAX}`,
  chatLog: '물어본 대화',
  chatExamplesLabel: '예시 질문',
  chatWaiting: '답을 기다리는 중',
  chatRetry: '다시 시도',
  chatError: '지금은 답을 가져오지 못했어요.',
  chatLimit: '잠시 후 다시 물어봐 주세요.',
  chatInvalid: '질문은 1~100자로 적어 주세요.',
  /** 첫 예시 질문 3개 = 백엔드 대표 질문 */
  chatExamples: [
    '이 동네 조용해?',
    '평일엔 몇 시가 붐비고 몇 시가 한산해?',
    '비슷한 동네는 어디야?',
  ],
} as const
