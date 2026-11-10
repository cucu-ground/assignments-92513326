import Link from 'next/link';
import { auth } from '@/auth';
import { logoutAction } from '@/lib/actions';
import { getCartCount } from '@/lib/cart';

// 여러 페이지에서 공통으로 쓰는 상단 내비게이션입니다.
// app/layout.tsx에 한 번만 넣어두면 모든 페이지에 자동으로 보입니다 —
// "재사용 가능한 컴포넌트"의 가장 기본적인 예시입니다.
//
// 7주차부터 async Server Component가 되었습니다: auth()로 현재 세션을
// 직접 읽어서, 로그인 상태에 따라 다른 버튼을 보여줍니다. 9주차부터는
// role도 함께 보여줍니다. 10주차부터는 장바구니 개수도 여기서 함께
// 읽습니다 — 로그인 여부와 무관하게 누구나 장바구니를 쓸 수 있으므로
// auth()가 아니라 lib/cart.ts(쿠키)에서 가져옵니다.
export async function SiteHeader() {
  const session = await auth();
  const cartCount = await getCartCount();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="text-sm font-semibold text-black dark:text-zinc-50"
        >
          웹서버보안프로그래밍
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/products"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            상품
          </Link>
          <Link
            href="/cart"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            장바구니
            {cartCount > 0 && (
              <span className="ml-1.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-black">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/notices"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            공지사항
          </Link>
          <Link
            href="/notices/new"
            className="rounded-md border border-black/[.08] px-3 py-1.5 hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
          >
            글쓰기
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="hover:text-black dark:hover:text-zinc-50"
              >
                주문내역
              </Link>
              <span className="text-zinc-500 dark:text-zinc-400">
                {session.user.name}님
                {session.user.role === 'admin' && (
                  <span className="ml-1.5 rounded bg-black/[.06] px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
                    관리자
                  </span>
                )}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-black/[.08] px-3 py-1.5 hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-black/[.08] px-3 py-1.5 hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
