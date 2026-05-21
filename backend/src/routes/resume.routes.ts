import { Router } from 'express';
import { getResumes, uploadResume, deleteResume, upload } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getResumes);
router.post('/', upload.single('file'), uploadResume);
router.delete('/:id', deleteResume);

export default router;
