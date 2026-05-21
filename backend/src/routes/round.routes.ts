import { Router } from 'express';
import { getRounds, addRound, updateRound, deleteRound } from '../controllers/round.controller';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getRounds);
router.post('/', addRound);
router.put('/:roundId', updateRound);
router.delete('/:roundId', deleteRound);

export default router;
