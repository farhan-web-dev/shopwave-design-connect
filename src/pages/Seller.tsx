"use client";

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSellerProducts } from "@/lib/api/products";
import { fetchSellerById, SellerInfo } from "@/lib/api/sellers";
import { Product } from "@/lib/api/products";
import { fetchSellerProfile, SellerProfile } from "@/lib/api/seller";
import ProductCard from "@/components/products/ProductCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SellerProfilePage() {
  const { sellerId } = useParams();

  // Fetch seller info
  const { data: sellerInfo, isLoading: sellerLoading } =
    useQuery<SellerInfo | null>({
      queryKey: ["seller", sellerId],
      queryFn: () => fetchSellerProfile(sellerId || ""),
      enabled: !!sellerId,
    });

  console.log("Seller Info:", sellerInfo);
  // Fetch seller’s products
  const {
    data: products = [],
    isLoading: productsLoading,
    isError,
  } = useQuery<Product[]>({
    queryKey: ["seller-products", sellerId],
    queryFn: () => fetchSellerProducts(sellerId || ""),
    enabled: !!sellerId,
  });

  if (sellerLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Skeleton className="h-32 w-full max-w-4xl rounded-lg mb-6" />
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-48 mt-4" />
      </div>
    );

  if (!sellerInfo)
    return (
      <div className="text-center py-20 text-gray-500">Seller not found 😢</div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
      {/* --- Banner Section --- */}
      <div className="relative h-56 md:h-72 w-full mb-16">
        <img
          src={sellerInfo?.logo || "/default-cover.jpg"}
          alt="Seller Cover"
          className="w-full h-full object-cover rounded-b-2xl shadow-md"
        />
        <div className="absolute -bottom-16 left-6 flex items-end gap-4">
          <img
            src={sellerInfo?.userId?.profileImage || "/default-avatar.png"}
            alt={sellerInfo?.storeName}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {sellerInfo.storeName}
            </h1>
            <p className="text-gray-500">{sellerInfo?.email}</p>
            {sellerInfo.verificationStatus && (
              <Badge className="bg-orange-500 text-white mt-2">
                Verified Seller
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* --- Seller Details --- */}
      <div className="mt-20">
        <Card className="p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            About {sellerInfo.storeName.split(" ")[0]}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {sellerInfo.description || "No description provided yet."}
          </p>

          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
            <p>Joined: {new Date(sellerInfo.createdAt).toLocaleDateString()}</p>
            <p>Products: {products.length}</p>
          </div>
        </Card>
      </div>

      {/* --- Seller Products --- */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Products by {sellerInfo.storeName.split(" ")[0]}
          </h2>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        ) : isError || products.length === 0 ? (
          <p className="text-gray-500">No products found for this seller.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                // rating={product.rating}
                // reviews={product.reviews}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Reviews Section --- */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
        <Card className="p-6 text-gray-600">
          No reviews yet. Be the first to review this seller!
        </Card>
      </div>

      {/* --- Back to Marketplace Button --- */}
      <div className="flex justify-center mt-12">
        <Button
          onClick={() => window.history.back()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          ← Back to Marketplace
        </Button>
      </div>
    </div>
  );
}
