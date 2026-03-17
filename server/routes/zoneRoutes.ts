import { Router } from 'express';
import { getZones } from '../controllers/zoneController';

const zoneRouter = Router();
zoneRouter.route('/').get(getZones);
export default zoneRouter;