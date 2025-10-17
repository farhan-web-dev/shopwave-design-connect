import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // ✅ Import icons

const images = ["/image1.png", "/image2.png", "/image3.png", "/image4.png"];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className="relative w-[95%] h-[380px] mt-8 mx-auto rounded-2xl overflow-hidden shadow-md">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={images[currentIndex]}
          alt="Banner"
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      {/* Text content */}
      <div className="relative container px-6 h-full flex items-center justify-between">
        <div className="max-w-xl text-white">
          <h1 className="text-4xl font-bold mb-3 leading-tight">
            Your Daily
            <br />
            Destination for Great Deals
          </h1>
          <p className="text-lg mb-6 text-white/90">
            Discover amazing products from trusted sellers. Quality items at
            unbeatable prices.
          </p>
          <Button
            size="lg"
            asChild
            className="text-base px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all"
          >
            <Link to="/products">Shop Now</Link>
          </Button>
        </div>

        {/* Left navigation */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/40 hover:bg-black/70 text-white"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Right navigation */}
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-black/40 hover:bg-black/70 text-white"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
