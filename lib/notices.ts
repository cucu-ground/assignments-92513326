// 6주차의 MongoDB 조회 위에, 9주차부터 "누가 썼는가"가 추가됩니다.
// author(자유 입력 텍스트) 대신 authorId/authorName을 저장합니다 — 이 값은
// 사용자가 폼에 입력하는 게 아니라 로그인 세션에서 서버가 채워 넣습니다
// (lib/actions.ts의 createNoticeAction 참고).

import { connectDB } from './mongodb';
import { Notice as NoticeModel } from '@/models/Notice';

export type Notice = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

// Mongoose 문서를 화면에서 쓰는 평범한 객체(Notice)로 변환합니다.
type NoticeDocLike = {
  _id: unknown;
  title: string;
  content: string;
  authorId: unknown;
  authorName: string;
  createdAt?: Date;
};

function toNotice(doc: NoticeDocLike): Notice {
  return {
    id: String(doc._id),
    title: doc.title,
    content: doc.content,
    authorId: String(doc.authorId),
    authorName: doc.authorName,
    createdAt: (doc.createdAt ?? new Date()).toISOString().slice(0, 10),
  };
}

// 8주차까지는 컬렉션이 비어있을 때 예시 데이터를 자동으로 채워 넣었지만,
// 이제는 실제로 로그인한 사용자가 글을 씁니다. 더 이상 가짜 작성자로
// 시드하지 않고, 대신 화면(app/notices/page.tsx)에서 빈 상태를 안내합니다.
export async function getNotices(): Promise<Notice[]> {
  await connectDB();
  const docs = await NoticeModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toNotice(doc as NoticeDocLike));
}

export async function getNotice(id: string): Promise<Notice | undefined> {
  await connectDB();
  try {
    const doc = await NoticeModel.findById(id).lean();
    return doc ? toNotice(doc as NoticeDocLike) : undefined;
  } catch {
    // id가 MongoDB ObjectId 형식이 아니면 findById가 에러를 던집니다.
    return undefined;
  }
}

export async function createNotice(input: {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
}): Promise<Notice> {
  await connectDB();
  const doc = await NoticeModel.create(input);
  return toNotice(doc);
}

// 삭제는 아무나 호출할 수 있는 함수가 아닙니다 — 이 함수 자체는 그냥
// DB에서 지우기만 할 뿐이고, "지울 권한이 있는가"는 반드시 호출하는 쪽
// (lib/actions.ts의 deleteNoticeAction)에서 먼저 확인해야 합니다.
export async function deleteNotice(id: string): Promise<void> {
  await connectDB();
  await NoticeModel.findByIdAndDelete(id);
}
