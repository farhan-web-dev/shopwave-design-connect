import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock data - will be replaced with API calls
const featuredProducts = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rating: 4.5,
    reviews: 128,
    badge: 'Featured',
  },
  {
    id: '2',
    title: 'Smart Watch Series 8',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    rating: 4.8,
    reviews: 256,
  },
  {
    id: '3',
    title: 'Laptop Pro 16-inch',
    price: 1999.99,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    rating: 4.7,
    reviews: 89,
    badge: 'Popular',
  },
  {
    id: '4',
    title: 'Wireless Mouse',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    rating: 4.3,
    reviews: 342,
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CategoryGrid />
      
      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link to="/products">View All</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-primary text-white py-16 my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Limited Time Offer!</h2>
          <p className="text-xl mb-6 text-white/90">
            Get up to 50% off on selected electronics
          </p>
          <Button size="lg" variant="secondary">
            Shop Deals
          </Button>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Latest Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
