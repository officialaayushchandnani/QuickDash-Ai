
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.ts';
import Product from './models/Product.ts';
import Category from './models/Category.ts';
import { demoProducts, demoCategories } from './controllers/seed.ts';

dotenv.config();

const seed = async () => {
    try {
        await connectDatabase();

        console.log('Clearing existing data...');
        await Product.deleteMany({});
        await Category.deleteMany({});

        console.log(`Seeding ${demoProducts.length} products and ${demoCategories.length} categories...`);
        await Product.insertMany(demoProducts);
        await Category.insertMany(demoCategories);

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
