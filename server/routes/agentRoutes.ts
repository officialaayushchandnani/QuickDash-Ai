import { Router } from 'express';
import { getAgents, toggleAgentStatus } from '../controllers/agentController';

const agentRouter = Router();

agentRouter.get('/', getAgents);
agentRouter.patch('/:id/toggle-status', toggleAgentStatus);

export default agentRouter;
