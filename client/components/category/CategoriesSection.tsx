import React from 'react';
import { CategoryCard } from './CategoryCard';

interface Category {
    _id?: string;
    name: string;
    image: string;
}

const CATEGORY_COLORS = [
    'bg-amber-50',
    'bg-pink-50',
    'bg-lime-50',
    'bg-orange-50',
    'bg-yellow-50',
    'bg-cyan-50',
    'bg-purple-50',
];

export const CategoriesSection: React.FC<{
    categories: Category[];
    onCategoryClick?: (category: string) => void;
}> = ({ categories, onCategoryClick }) => {

    const handleCategoryClick = (categoryName: string) => {
        if (onCategoryClick) {
            onCategoryClick(categoryName);
            // Scroll to products section
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="py-12 px-4 md:px-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {categories.map((category, index) => (
                        <CategoryCard
                            key={category._id || category.name}
                            name={category.name}
                            image={category.image || '/placeholder.svg'}
                            color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            onClick={() => handleCategoryClick(category.name)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
