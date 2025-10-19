"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Category } from "@/lib/api/categories";

interface Props {
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

const ShopByCategoryMenu = ({ categories, open, onClose }: Props) => {
  // Separate main and subcategories here
  const mainCategories = categories.filter((cat) => !cat.parentCategoryId);
  const getSubCategories = (parentId: string) =>
    categories.filter((cat) => cat.parentCategoryId?._id === parentId);

  console.log(
    categories.map((c) => ({
      id: c._id,
      name: c.name,
      parentCategoryId: c.parentCategoryId,
    }))
  );

  console.log("Main Categories:", mainCategories);
  console.log(
    "Subcategories:",
    mainCategories.map((cat) => getSubCategories(cat._id))
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          onMouseLeave={onClose}
          className="absolute left-0 top-full w-full bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="max-w-[1400px] mx-auto px-10 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-x-10 gap-y-6">
            {mainCategories.length > 0 ? (
              mainCategories.map((main) => {
                const subs = getSubCategories(main._id);
                return (
                  <div key={main._id} className="group">
                    {/* Main Category */}
                    <Link
                      to={`/products?category=${main._id}`}
                      className="block font-semibold text-gray-900 text-[15px] mb-2 group-hover:text-orange-600 transition-colors"
                    >
                      {main.name}
                    </Link>

                    {/* Subcategories */}
                    {subs.length > 0 && (
                      <ul className="space-y-1">
                        {subs.slice(0, 6).map((sub) => (
                          <li key={sub._id}>
                            <Link
                              to={`/products?category=${sub._id}`}
                              className="block text-gray-600 text-[14px] hover:text-orange-600 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No categories found.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShopByCategoryMenu;
