export type Product = {
  id: string;
  name: string;
  description: string;
  likes: number;
};

const products: Product[] = [
  { id: '1', name: '머그컵', description: '나의 최애 머그컵', likes: 3 },
  { id: '2', name: '행주', description: '나의 최애 머그컵', likes: 3 },
  { id: '3', name: '하트', description: '나의 최애 머그컵', likes: 3 },
  { id: '4', name: '식탁', description: '나의 최애 머그컵', likes: 3 },
  { id: '5', name: '컴퓨터', description: '나의 최애 머그컵', likes: 3 },
  { id: '6', name: '마우스', description: '나의 최애 머그컵', likes: 3 },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(): Promise<Product[]> {
  await delay(700);
  return products;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await delay(700);
  return products.find((p) => p.id == id);
}
