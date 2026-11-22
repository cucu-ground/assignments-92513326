import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNotice } from '@/lib/notices';
import { auth } from '@/auth';
import { deleteNoticeAction } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';

// products/[id]/page.tsx와 동일한 동적 라우팅 패턴입니다.
type Props = { params: Promise<{ id: string }> };

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = await getNotice(id);

  if (!notice) {
    notFound();
  }

  const session = await auth();
  // 삭제 버튼을 보여줄지 말지는 여기서 결정하지만, 이건 순전히 사용자
  // 경험을 위한 것입니다. 실제 삭제 권한 검사는 deleteNoticeAction 안에서
  // (lib/actions.ts) 다시 한번 이뤄집니다 — 버튼이 안 보인다고 요청을
  // 못 보내는 건 아니기 때문입니다.
  const canDelete =
    !!session?.user &&
    (session.user.id === notice.authorId || session.user.role === 'admin');

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-4 px-8 py-16">
      <Link href="/notices" className="text-sm text-zinc-500 hover:underline">
        ← 목록으로
      </Link>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {notice.title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {notice.authorName} · {notice.createdAt}
      </p>
      {/*
        🚨 [12주차 · 취약 버전] 줄바꿈을 <br>로 보여주고 싶어서
        dangerouslySetInnerHTML을 썼습니다. content는 누구나 글쓰기 폼으로
        직접 입력한 값(사용자 입력)인데, 여기서는 아무런 이스케이프/새니타이즈
        없이 그대로 HTML로 렌더링합니다 — 즉 <script>...</script> 같은 값을
        제목/내용에 넣으면 그 글을 여는 모든 사용자의 브라우저에서 그대로
        실행됩니다(저장형 XSS, Stored Cross-Site Scripting). 13주차에
        DOMPurify 같은 새니타이저로 이 취약점을 직접 고칩니다.
      */}
      <div
        className="whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300"
        dangerouslySetInnerHTML={{
          __html: notice.content.replace(/\n/g, '<br>'),
        }}
      />

      {canDelete && (
        <form action={deleteNoticeAction} className="pt-2">
          <input type="hidden" name="id" value={notice.id} />
          <SubmitButton label="삭제" />
        </form>
      )}
    </div>
  );
}
