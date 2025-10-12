import express from 'express';
import { uploadExcel, getExcelData, fetchSheetUrl } from '../controllers/dataController.js';

const router = express.Router();

// Upload JSON-array data (from frontend after parsing Excel or CSV)
router.post('/uploadExcel', uploadExcel);

// Given a sheet URL (public Google Sheet or CSV URL) return parsed JSON array
router.post('/fetchSheetData', fetchSheetUrl);

// Get stored data by sheet name
router.get('/getExcelData/:sheetName', getExcelData);

export default router;
