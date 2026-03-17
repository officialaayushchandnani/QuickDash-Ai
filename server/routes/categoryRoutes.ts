import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';

const router = Router();

router.route('/').get(getCategories).post(createCategory);

export default router;
