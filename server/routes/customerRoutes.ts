import { Router } from 'express';
import { getCustomers, getCustomerById } from '../controllers/customerController';

const customerRouter = Router();
customerRouter.route('/').get(getCustomers);
customerRouter.route('/:id').get(getCustomerById);
export default customerRouter;