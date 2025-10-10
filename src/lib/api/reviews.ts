import { BASE_URL } from "@/lib/url";

export interface ReviewApiUser {
  _id?: string;
  id?: string;
  name?: string;
  profileImage?: string;
  image?: string;
}

export interface ReviewApi {
  _id?: string;
  id?: string;
  rating?: number;
  comment?: string;
  user?: ReviewApiUser;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userImage: string;
  createdAt?: string;
}

function mapReview(api: ReviewApi): Review {
  const id = String(api._id ?? api.id ?? "");
  const rating = typeof api.rating === "number" ? api.rating : 0;
  const comment = api.comment || "";
  const userName = api.user?.name || "Anonymous";
  const userImage =
    api.user?.profileImage || api.user?.image || "https://i.pravatar.cc/80";
  return { id, rating, comment, userName, userImage, createdAt: api.createdAt };
}

export async function fetchProductReviews(
  productId: string
): Promise<Review[]> {
  if (!productId) return [];
  // Reviews service is on port 5000 as requested
  const url = `http://localhost:5000/api/v1/reviews/product/${productId}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) return [];
  const json = await response.json();
  const list: ReviewApi[] =
    json?.data?.reviews ?? json?.reviews ?? json?.data ?? [];
  if (!Array.isArray(list)) return [];
  return list.map(mapReview);
}
