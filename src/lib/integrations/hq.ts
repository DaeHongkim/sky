import "server-only";

/**
 * HIHONG RECRUIT의 책임 범위는 채용확정(HIRED)까지다.
 * 이후 근태/배치/급여/POS 등은 별도 HIHONG HQ 시스템의 영역이며 이 프로젝트에 구현하지 않는다.
 *
 * 이 함수는 향후 HIHONG HQ와 연동할 지점을 표시하는 자리표시자(placeholder)다.
 * 실제 HQ 시스템 URL/인증 방식이 정해지면 이 함수 내부에서
 * `POST {HQ_BASE_URL}/api/integrations/hq/hired` 등으로 이벤트를 전달하도록 교체한다.
 * 지금은 아무 외부 호출도 하지 않는다 (미구현).
 */
export interface HireCompletedEvent {
  applicationId: string;
  jobSeekerId: string;
  companyId: string;
  jobPostId: string;
  contractId: string;
  hiredAt: string;
}

export async function notifyHqHireCompleted(event: HireCompletedEvent): Promise<void> {
  // TODO: HIHONG HQ 시스템이 준비되면 실제 webhook/API 호출로 교체.
  console.info("[hq-integration] HireCompleted event ready (not yet sent):", event.applicationId);
}
