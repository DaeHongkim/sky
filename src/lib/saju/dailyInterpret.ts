import type { TenGod } from "manseryeok";
import type { FortuneCategory } from "./profile";

type Tone = "good" | "mixed" | "caution";

interface CategoryLine {
  tone: Tone;
  text: string;
}

/** 육친별 × 영역별 기본 해석 (일간 庚 기준 매일 운세) */
export const TEN_GOD_CATEGORY: Record<
  TenGod,
  Record<FortuneCategory, CategoryLine>
> = {
  비견: {
    business: {
      tone: "mixed",
      text: "스스로 밀어붙이는 힘이 셉니다. 독단보다 역할 분담을 명확히 하세요.",
    },
    relations: {
      tone: "caution",
      text: "동료·경쟁자와 겹치는 일이 늘 수 있습니다. 선을 지키면 충돌이 줄어요.",
    },
    sns: {
      tone: "mixed",
      text: "자기주장형 콘텐츠는 반응이 오지만, 반박 댓글에도 대비하세요.",
    },
    judgment: {
      tone: "mixed",
      text: "확신은 빠르나 반대 의견 필터가 약해질 수 있습니다. 한 번 더 확인하세요.",
    },
    condition: {
      tone: "good",
      text: "활동량은 충분합니다. 과로만 피하면 리듬이 유지됩니다.",
    },
    romance: {
      tone: "mixed",
      text: "주도하려는 마음이 커집니다. 상대 페이스를 남겨 두세요.",
    },
  },
  겁재: {
    business: {
      tone: "caution",
      text: "욕심·경쟁 기운이 강합니다. 큰 지출·동업 결정은 하루 미루세요.",
    },
    relations: {
      tone: "caution",
      text: "말꼬리가 길어지기 쉬운 날입니다. 짧게 말하고 기록을 남기세요.",
    },
    sns: {
      tone: "caution",
      text: "자극적 이슈에 말려들기 쉽습니다. 공유·리포스트는 신중히.",
    },
    judgment: {
      tone: "caution",
      text: "승부욕이 판단을 흔들 수 있습니다. 숫자와 계약서만 보세요.",
    },
    condition: {
      tone: "mixed",
      text: "긴장·흥분이 올라옵니다. 수면과 수분 보충이 필요합니다.",
    },
    romance: {
      tone: "caution",
      text: "질투·집착 신호가 나올 수 있습니다. 거리 두기가 유리합니다.",
    },
  },
  식신: {
    business: {
      tone: "good",
      text: "아이디어·산출물이 잘 나옵니다. 실행 가능한 단위로 정리해 두세요.",
    },
    relations: {
      tone: "good",
      text: "부드러운 설득이 통합니다. 설명·제안형 대화가 유리합니다.",
    },
    sns: {
      tone: "good",
      text: "정보·팁·작업 과정 공유가 잘 먹힙니다. 과한 약속만 피하세요.",
    },
    judgment: {
      tone: "good",
      text: "감각적 판단이 살아 있습니다. 다만 계획만 늘리지 마세요.",
    },
    condition: {
      tone: "good",
      text: "소화·표현 리듬이 안정적입니다. 규칙적인 식사가 도움이 됩니다.",
    },
    romance: {
      tone: "good",
      text: "편안한 대화와 취향 공유로 호감이 쌓이기 좋은 날입니다.",
    },
  },
  상관: {
    business: {
      tone: "mixed",
      text: "혁신·비판 에너지가 셉니다. 기존 틀을 깨되, 최종 결정은 보류하세요.",
    },
    relations: {
      tone: "caution",
      text: "직설이 날을 세울 수 있습니다. 피드백은 사실만 짧게.",
    },
    sns: {
      tone: "mixed",
      text: "도발적 카피가 조회수를 부를 수 있으나 논쟁으로 번지기 쉽습니다.",
    },
    judgment: {
      tone: "caution",
      text: "반골 기운으로 ‘아니다’가 먼저 나옵니다. 대안을 정한 뒤 말하세요.",
    },
    condition: {
      tone: "mixed",
      text: "예민도가 올라갑니다. 카페인·야근을 줄이세요.",
    },
    romance: {
      tone: "mixed",
      text: "솔직함은 매력이나 잔소리가 되면 온도가 떨어집니다.",
    },
  },
  편재: {
    business: {
      tone: "good",
      text: "기회·현금 흐름이 움직이는 날입니다. 범위가 넓은 건을 스케치하기 좋습니다.",
    },
    relations: {
      tone: "good",
      text: "외부 인맥·소개가 열립니다. 가벼운 네트워킹이 유효합니다.",
    },
    sns: {
      tone: "good",
      text: "노출·도달이 늘기 쉬운 흐름입니다. 랜딩·문의 창구를 열어 두세요.",
    },
    judgment: {
      tone: "mixed",
      text: "기회는 보이되 흩어지기 쉽습니다. 우선순위 하나만 고르세요.",
    },
    condition: {
      tone: "good",
      text: "활동 반경이 넓어져도 에너지는 버팁니다. 이동 동선을 단순화하세요.",
    },
    romance: {
      tone: "good",
      text: "만남·소개·데이트 제안이 성사되기 쉬운 편입니다.",
    },
  },
  정재: {
    business: {
      tone: "good",
      text: "정산·계약·실익 점검에 유리합니다. 큰 모험보다 확정 수익을 챙기세요.",
    },
    relations: {
      tone: "good",
      text: "신뢰 기반 대화가 통합니다. 약속은 지킬 수 있는 범위만.",
    },
    sns: {
      tone: "mixed",
      text: "실용 정보·후기형이 좋습니다. 과장 홍보는 피하세요.",
    },
    judgment: {
      tone: "good",
      text: "손익 계산이 또렷합니다. 감정보다 장부를 따르세요.",
    },
    condition: {
      tone: "good",
      text: "안정 지향 리듬입니다. 과한 스케줄만 넣지 마세요.",
    },
    romance: {
      tone: "good",
      text: "성실함·현실적 배려가 어필됩니다. 거창한 이벤트보다 챙김이 유효합니다.",
    },
  },
  편관: {
    business: {
      tone: "caution",
      text: "압박·마감·규제 기운이 셉니다. 리스크 관리와 백업이 우선입니다.",
    },
    relations: {
      tone: "caution",
      text: "윗사람·권위와의 마찰 가능성이 있습니다. 보고는 사실 중심으로.",
    },
    sns: {
      tone: "caution",
      text: "논쟁·신고·규정 이슈에 민감합니다. 공격적 멘션은 피하세요.",
    },
    judgment: {
      tone: "mixed",
      text: "경계심이 높아 신중해집니다. 공포 결정은 피하고 체크리스트를 쓰세요.",
    },
    condition: {
      tone: "caution",
      text: "어깨·목 긴장이 오기 쉽습니다. 짧은 스트레칭을 넣으세요.",
    },
    romance: {
      tone: "caution",
      text: "거리감·부담이 느껴질 수 있습니다. 강제 진도는 역효과입니다.",
    },
  },
  정관: {
    business: {
      tone: "good",
      text: "명예·절차·공식 채널이 힘을 줍니다. 문서화·정식 제안이 유리합니다.",
    },
    relations: {
      tone: "good",
      text: "예의와 격식이 점수를 줍니다. 약속 시간을 지키세요.",
    },
    sns: {
      tone: "mixed",
      text: "브랜드·전문성 톤이 맞습니다. 가벼운 드립은 절제하세요.",
    },
    judgment: {
      tone: "good",
      text: "원칙 판단이 선명합니다. 예외 처리는 근거를 남기세요.",
    },
    condition: {
      tone: "good",
      text: "절제된 페이스가 컨디션을 지킵니다.",
    },
    romance: {
      tone: "good",
      text: "진지한 태도가 호감을 줍니다. 가벼운 밀당보다 명확한 의사가 낫습니다.",
    },
  },
  편인: {
    business: {
      tone: "mixed",
      text: "특수 지식·비정형 아이디어가 뜹니다. 검증 전 확장은 보류하세요.",
    },
    relations: {
      tone: "mixed",
      text: "혼자만의 해석이 길어질 수 있습니다. 핵심만 공유하세요.",
    },
    sns: {
      tone: "mixed",
      text: "딥한 콘텐츠·비하인드가 반응을 얻습니다. 너무 난해하면 이탈합니다.",
    },
    judgment: {
      tone: "mixed",
      text: "직관은 있으나 근거가 흐릴 수 있습니다. 1차 자료로 교차 확인하세요.",
    },
    condition: {
      tone: "mixed",
      text: "생각이 많아 수면이 얕아질 수 있습니다. 저녁 정보 섭취를 줄이세요.",
    },
    romance: {
      tone: "mixed",
      text: "정신적으로 끌리는 상대에게 마음이 갑니다. 현실 조건도 함께 보세요.",
    },
  },
  정인: {
    business: {
      tone: "good",
      text: "학습·문서·후원이 들어오는 흐름입니다. 공부·자료 정리가 자산이 됩니다.",
    },
    relations: {
      tone: "good",
      text: "도움·멘토링 관계가 열립니다. 감사 표현을 분명히 하세요.",
    },
    sns: {
      tone: "good",
      text: "교육형·요약형 콘텐츠가 잘 퍼집니다.",
    },
    judgment: {
      tone: "good",
      text: "차분히 배우는 태도가 판단을 돕습니다. 서두른 결론만 피하세요.",
    },
    condition: {
      tone: "good",
      text: "회복·휴식 기운이 있습니다. 과한 자극을 줄이세요.",
    },
    romance: {
      tone: "good",
      text: "돌봄·이해 중심의 관계가 편안합니다.",
    },
  },
};

/** 火土 채움 여부에 따른 축 메시지 */
export function fillAxisMessage(fillsFire: boolean, fillsEarth: boolean): {
  filled: boolean;
  headline: string;
  detail: string;
} {
  if (fillsFire && fillsEarth) {
    return {
      filled: true,
      headline: "火·土가 함께 들어오는 날",
      detail:
        "원국의 공백이 가장 잘 메워지는 흐름입니다. 실행·대외·몸 컨디션의 중심축으로 쓰세요.",
    };
  }
  if (fillsFire) {
    return {
      filled: true,
      headline: "火 기운이 채워지는 날",
      detail:
        "열기·시선·추진이 보강됩니다. 土까지는 약하니 마무리·안정의 장치를 따로 두세요.",
    };
  }
  if (fillsEarth) {
    return {
      filled: true,
      headline: "土 기운이 채워지는 날",
      detail:
        "중심·신뢰·실속이 보강됩니다. 火가 약하면 노출·시작의 불꽃을 의도적으로 켜세요.",
    };
  }
  return {
    filled: false,
    headline: "火·土가 비는 날",
    detail:
      "원국 공백이 그대로입니다. 오늘은 ‘채움’보다 과한 水·木을 덜어 내고, 색·방위로 火土를 보완하는 것이 핵심입니다.",
  };
}
