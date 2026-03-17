import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface CategoryCardProps {
    name: string;
    image: string;
    color: string;
    onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, color, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="cursor-pointer"
            onClick={onClick}
        >
            <Card className={`overflow-hidden border-transparent hover:border-brand-green/20 hover:shadow-xl transition-all duration-300`}>
                <div className={`${color} p-6 flex flex-col items-center justify-center gap-3 aspect-square`}>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <h3 className="font-semibold text-sm text-center text-gray-800">
                        {name}
                    </h3>
                </div>
            </Card>
        </motion.div>
    );
};
