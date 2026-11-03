'use server';
// 이 파일의 함수들은 Server Action입니다. 클라이언트 컴포넌트에서
// 그냥 함수처럼 import해서 호출하면, Next.js가 자동으로 서버에
// 요청을 보내고 결과를 받아옵니다 — 별도의 API 엔드포인트를
// 직접 만들지 않아도 됩니다. (6주차 MongoDB CRUD에서 본격적으로 사용)

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { getProduct } from '@/lib/products';
import { addToCart, updateCartQty, removeFromCart } from '@/lib/cart';
import { createNotice, deleteNotice, getNotice } from '@/lib/notices';
import { createUser } from '@/lib/users';
import { signIn, signOut, auth } from '@/auth';

// 10주차부터 상품 목록/상세 페이지는 "좋아요" 대신 실제 장바구니 담기를
// 지원합니다. 폼에서 넘어온 수량(qty)을 그대로 믿지 않고, 실제 재고를
// 다시 조회해서 그 범위 안으로 맞춥니다 — "클라이언트가 보낸 값은 항상
// 조작될 수 있다"는 9주차의 교훈이 장바구니에도 그대로 적용됩니다.
export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '');
  const requestedQty = Math.max(1, Number(formData.get('qty') ?? 1) || 1);
  if (!productId) {
    throw new Error('잘못된 상품입니다.');
  }

  const product = await getProduct(productId);
  if (!product || product.stock === 0) {
    throw new Error('담을 수 없는 상품입니다.');
  }

  const qty = Math.min(requestedQty, product.stock);
  await addToCart(productId, qty);

  // 장바구니 개수 배지는 모든 페이지의 SiteHeader(루트 레이아웃)에 있으므로,
  // 특정 경로가 아니라 레이아웃 자체를 다시 그리도록 알려줘야 합니다.
  revalidatePath('/', 'layout');
}

export async function updateCartQtyAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '');
  const requestedQty = Number(formData.get('qty') ?? 0);
  if (!productId) {
    throw new Error('잘못된 상품입니다.');
  }

  if (requestedQty <= 0) {
    await removeFromCart(productId);
  } else {
    const product = await getProduct(productId);
    const qty = product ? Math.min(requestedQty, product.stock) : requestedQty;
    await updateCartQty(productId, qty);
  }

  revalidatePath('/', 'layout');
}

export async function removeFromCartAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '');
  if (!productId) {
    throw new Error('잘못된 상품입니다.');
  }
  await removeFromCart(productId);
  revalidatePath('/', 'layout');
}

// 9주차부터 이 액션은 로그인 여부를 직접 확인합니다. middleware.ts가
// /notices/new 페이지 접근 자체를 막아주지만, Server Action은 middleware의
// matcher와 무관하게 어디서든(다른 페이지, 심지어 조작된 요청에서도) 호출될
// 수 있습니다. 그래서 "이중 방어"로 액션 내부에서도 반드시 다시 확인합니다.
export async function createNoticeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!title || !content) {
    // 실습 단계의 아주 단순한 검증입니다.
    // 실제 서비스라면 에러 상태를 돌려주고 폼에 메시지를 보여줘야 합니다.
    throw new Error('제목과 내용을 모두 입력해주세요.');
  }

  // author는 더 이상 폼에서 입력받지 않습니다 — 로그인한 사용자의 세션에서
  // 서버가 직접 가져옵니다. 그렇지 않으면 누구든 폼 값을 조작해서
  // 다른 사람 이름으로 글을 쓸 수 있습니다.
  const notice = await createNotice({
    title,
    content,
    authorId: session.user.id,
    authorName: session.user.name ?? '이름 없음',
  });
  revalidatePath('/notices');
  redirect(`/notices/${notice.id}`);
}

// 삭제 권한 검사가 이번 주의 핵심입니다. 화면에는 작성자 본인 또는
// admin에게만 삭제 버튼이 보이지만(app/notices/[id]/page.tsx), 그건 어디까지나
// 사용자 경험일 뿐입니다. 버튼이 안 보인다고 해서 요청 자체를 막을 수는
// 없습니다 — 개발자 도구나 직접 조작한 요청으로 얼마든지 이 함수를 호출할
// 수 있으므로, 진짜 방어는 반드시 여기, 서버 코드 안에 있어야 합니다.
export async function deleteNoticeAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) {
    throw new Error('잘못된 요청입니다.');
  }

  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const notice = await getNotice(id);
  if (!notice) {
    throw new Error('존재하지 않는 게시글입니다.');
  }

  const isOwner = notice.authorId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new Error('삭제 권한이 없습니다.');
  }

  await deleteNotice(id);
  revalidatePath('/notices');
  redirect('/notices');
}

// 회원가입: 비밀번호를 해싱해 User 컬렉션에 저장한 뒤, 곧바로 로그인까지
// 이어서 처리합니다. signIn()이 성공하면 내부적으로 리다이렉트를 던지므로
// registerAction은 반환값을 따로 처리하지 않습니다.
export async function registerAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) {
    throw new Error('이름, 이메일, 비밀번호를 모두 입력해주세요.');
  }
  if (password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.');
  }

  await createUser({ name, email, password });
  await signIn('credentials', { email, password, redirectTo: '/' });
}

// 로그인. Auth.js는 로그인 실패도 "에러를 던지는 방식"으로 알려줍니다.
// AuthError만 따로 잡아서 /login?error=1 로 돌려보내고, 그 외의 에러
// (Next.js의 리다이렉트 신호 포함)는 그대로 다시 던져야 합니다 — 여기서
// 삼켜버리면 로그인 성공 후 리다이렉트까지 막혀버립니다.
export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?error=1');
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
