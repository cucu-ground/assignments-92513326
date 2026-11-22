import { NextResponse } from 'next/server';

// 🚨 [12주차 · 취약 버전] "배포 전에 환경변수가 잘 읽히는지 빨리
// 확인하고 싶어서" 급하게 만들고 지우는 걸 잊어버린 디버그
// 엔드포인트라고 상상해보세요. 실제로 이런 라우트는 인증 없이 GET
// 요청 한 번이면 누구나 접근할 수 있습니다 — 즉 MONGODB_URI(DB 접속
// 비밀번호 포함)와 AUTH_SECRET(세션 서명 키)이 인터넷에 있는 아무나에게
// 그대로 노출됩니다. "실수로 남겨둔 디버그/헬스체크 엔드포인트"는
// 실제 침해 사고에서 반복적으로 등장하는 원인입니다.
//
// 13~14주차에 이 라우트 자체를 삭제하고, "환경변수는 절대 API 응답에
// 담지 않는다"는 원칙과 시크릿 스캐닝(예: GitHub Secret Scanning,
// gitleaks) 같은 예방 도구를 함께 다룹니다.
export async function GET() {
  return NextResponse.json({
    MONGODB_URI: process.env.MONGODB_URI,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
}
