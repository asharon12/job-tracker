import { Router } from 'express';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  summarizeJD,
} from '../controllers/application.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.post('/', createApplication);
router.get('/:id', getApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.post('/:id/summarize-jd', summarizeJD);

export default router;
