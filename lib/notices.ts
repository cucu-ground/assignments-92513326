import { connectDB } from './mongodb';
import { Notice as NoticeModel } from '@/models/Notice';

export type Notice = {
  id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
};

type NoticeDocLike = {
  _id: unknown;
  title: string;
  author: string;
  content: string;
  createdAt?: Date;
};

function toNotice(doc: NoticeDocLike): Notice {
  return {
    id: String(doc._id),
    title: doc.title,
    author: doc.author,
    content: doc.content,
    createdAt: (doc.createdAt ?? new Date()).toISOString().slice(0, 10),
  };
}

async function seedIfEmpty() {
  const count = await NoticeModel.countDocuments();
  if (count > 0) return;

  await NoticeModel.insertMany([
    {
      title: '사과는 맛있어',
      author: '이효정',
      content: '원숭이 엉덩이는 빨게. 빨가면 사과, 사과는 맛있어',
    },
    {
      title: 'test',
      author: '이효정',
      content: 'test',
    },
    {
      title: '안녕하세요',
      author: '이효정',
      content: '안녕하세요',
    },
  ]);
}

// const notices: Notice[] = [
//   {
//     id: '1',
//     title: '웹서버보안프로그래밍 개강 안내',
//     author: '이효정',
//     content: '강의계획서를 확인하고 열심히 공부해봅시다.',
//     createdAt: '2026-09-01',
//   },
//   {
//     id: '2',
//     title: 'GitHub Organization 초대 안내',
//     author: '이효정',
//     content:
//       '과제 제출용 GitHub Organization 초대 메일을 확인하고 가입해주세요.',
//     createdAt: '2026-09-03',
//   },
//   {
//     id: '3',
//     title: '5주차 실습 — 공지사항 게시판',
//     author: '이효정',
//     content:
//       '이번 주부터 만드는 공지사항 게시판이 학기 내내 성장하는 코스 프로젝트입니다.',
//     createdAt: '2026-09-24',
//   },
// ];

// let nextId = 4;

// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

export async function getNotices(): Promise<Notice[]> {
  await connectDB();
  await seedIfEmpty();
  const docs = await NoticeModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toNotice(doc as NoticeDocLike));
}

export async function getNotice(id: string): Promise<Notice | undefined> {
  await connectDB();
  try {
    const doc = await NoticeModel.findById(id).lean();
    return doc ? toNotice(doc as NoticeDocLike) : undefined;
  } catch {
    return undefined;
  }
}

export async function createNotice(input: {
  title: string;
  author: string;
  content: string;
}): Promise<Notice> {
  await connectDB();
  const doc = await NoticeModel.create(input);
  return toNotice(doc);
}

// export async function createNotice(input: {
//   title: string;
//   author: string;
//   content: string;
// }): Promise<Notice> {
//   await delay(300);
//   const notice: Notice = {
//     id: String(nextId++),
//     title: input.title,
//     author: input.author,
//     content: input.content,
//     createdAt: new Date().toISOString().slice(0, 10),
//   };
//   notices.push(notice);
//   return notice;
// }
