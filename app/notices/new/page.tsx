import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createNoticeAction } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';

// middleware.ts가 이미 이 페이지를 로그인 필수로 막고 있지만, 페이지 자체도
// 세션을 한 번 더 확인합니다(심층 방어). 그리고 어차피 세션이 필요합니다 —
// 더 이상 "작성자" 입력칸이 없고, 로그인한 사람의 이름을 그대로 보여줄
// 뿐입니다.
export default async function NewNoticePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-8 py-16">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        새 공지 작성
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        작성자:{' '}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {session.user.name}
        </span>{' '}
        (로그인 세션에서 자동으로 채워집니다 — 직접 입력하지 않습니다)
      </p>
      <form action={createNoticeAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="rounded-md border border-black/[.08] px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="content"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            내용
          </label>
          <textarea
            id="content"
            name="content"
            rows={6}
            required
            className="resize-none rounded-md border border-black/[.08] px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-transparent"
          />
        </div>
        <SubmitButton label="등록하기" />
      </form>
    </div>
  );
}
