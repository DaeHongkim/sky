/**
 * 이메일 발송 Provider 인터페이스. 실제 서비스에서는 SES/SendGrid 등으로 교체한다.
 * API Key 등 자격증명은 서버 환경변수에만 저장하고, 절대 console.log로 출력하지 않는다.
 */
export interface EmailProvider {
  send(input: { to: string; subject: string; html: string }): Promise<void>;
}

/**
 * 실제 이메일 발송 서비스(SES/SendGrid 등)가 아직 연결되지 않은 상태의 기본 provider.
 * 발신 자체는 수행하지 않으며(=미구현), 호출된 사실만 남긴다. 민감정보(토큰, 링크)는 로깅하지 않는다.
 */
export class NullEmailProvider implements EmailProvider {
  async send(input: { to: string; subject: string }): Promise<void> {
    console.info(`[email:noop] would send "${input.subject}" to ${input.to.replace(/(?<=.).(?=[^@]*@)/g, "*")}`);
  }
}

export function getEmailProvider(): EmailProvider {
  return new NullEmailProvider();
}
