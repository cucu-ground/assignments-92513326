import Link from 'next/link';
import { getNotices } from '@/lib/notices';
import { NoticeListItem } from '@/components/NoticeListItem';

export default async function NoticesPage() {
  const notices = await getNotices();

  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          공지사항
        </h1>
        <Link
          href="/notices/new"
          className="text-sm font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          + 새 글 작성
        </Link>
      </div>
      <ul className="flex flex-col gap-4">
        {notices.map((n) => (
          <NoticeListItem key={n.id} notice={n} />
        ))}
      </ul>
    </div>
  );
}
