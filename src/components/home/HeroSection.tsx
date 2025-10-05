import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-home.jpg';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[500px] bg-muted/20 overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Featured products" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Your Daily
            <br />
            Destination for Great Deals
          </h1>
          <p className="text-lg mb-6 text-white/90">
            Discover amazing products from trusted sellers. Quality items at unbeatable prices.
          </p>
          <Button size="lg" asChild className="text-base px-8">
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
