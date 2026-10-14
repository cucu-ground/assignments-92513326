import Link from 'next/link';
import type { Notice } from '@/lib/notices';

export function NoticeListItem({ notice }: { notice: Notice }) {
  return (
    <li>
      <Link
        href={`/notices/${notice.id}`}
        className="block rounded-lg border border-black/[.08] px-5 py-4 transition-colors hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
      >
        <p className="font-medium text-black dark:text-zinc-50">
          {notice.title}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {notice.author} · {notice.createdAt} · 조회수 {notice.views}
        </p>
      </Link>
    </li>
  );
}
