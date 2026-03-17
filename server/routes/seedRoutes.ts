import { Router } from 'express';
import { seedDatabase } from '../controllers/seedController';

const seedRouter = Router();

seedRouter.route('/').post(seedDatabase);

export default seedRouter;