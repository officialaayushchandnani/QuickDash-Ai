import { Router } from 'express';
import productRouter from './productRoutes';
import orderRouter from './orderRoutes';
import seedRouter from './seedRoutes';
import customerRouter from './customerRoutes';
import authRouter from "./authRoutes";
import agentRouter from './agentRoutes';
import zoneRouter from './zoneRoutes';
import categoryRouter from './categoryRoutes'; // Add this import

const apiRouter = Router();

apiRouter.use('/seed', seedRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/agents', agentRouter);
apiRouter.use('/zones', zoneRouter);
apiRouter.use('/categories', categoryRouter); // Add this route

export default apiRouter;