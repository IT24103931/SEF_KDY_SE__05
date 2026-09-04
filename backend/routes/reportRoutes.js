import express from 'express';
import {
  createReport,
  getReportById,
  getReports,
  getSummaryStats
} from '../controllers/reportController.js';

const router = express.Router();

router.post('/', createReport);
router.get('/', getReports);
router.get('/stats/summary', getSummaryStats);
router.get('/:id', getReportById);

export default router;