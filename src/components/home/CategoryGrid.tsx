import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, Home, Shirt, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';

const categories = [
  { id: 1, name: 'Electronics', icon: Smartphone, color: 'bg-blue-100' },
  { id: 2, name: 'Computers', icon: Laptop, color: 'bg-purple-100' },
  { id: 3, name: 'Accessories', icon: Watch, color: 'bg-green-100' },
  { id: 4, name: 'Home & Living', icon: Home, color: 'bg-orange-100' },
  { id: 5, name: 'Fashion', icon: Shirt, color: 'bg-pink-100' },
  { id: 6, name: 'Cameras', icon: Camera, color: 'bg-yellow-100' },
];

const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.id} to={`/products?category=${category.id}`}>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mb-3 mx-auto`}>
                  <Icon className="h-8 w-8 text-foreground" />
                </div>
                <p className="text-center font-medium text-sm">{category.name}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
