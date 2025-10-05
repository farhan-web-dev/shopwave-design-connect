import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
}

const ProductCard = ({ id, title, price, image, rating = 4.5, reviews = 0, badge }: ProductCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`/products/${id}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {badge && (
              <Badge className="absolute top-2 left-2" variant="secondary">
                {badge}
              </Badge>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                // Handle favorite toggle
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/products/${id}`}>
            <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-primary">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-yellow-500">
              {'★'.repeat(Math.floor(rating))}
              {'☆'.repeat(5 - Math.floor(rating))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                // Handle add to cart
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
