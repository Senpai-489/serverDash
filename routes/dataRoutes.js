import express from 'express';
import {
  getAllSheets,
  getSheetData,
  createSheet,
  uploadExcel,
  deleteSheet,
  addLead,
  deleteLead,
  updateLeadState,
  appendLeads,  // Add this
  fetchSheetUrl,
  getExcelData
} from '../controllers/dataController.js';` `

const router = express.Router();    

// Sheet management
router.get('/sheets/:companyName', getAllSheets); // Get all sheets for a company
router.get('/sheet/:sheetId', getSheetData); // Get data from specific sheet
router.post('/createSheet', createSheet); // Create new sheet
router.post('/uploadExcel', uploadExcel); // Upload data to existing sheet
router.delete('/deleteSheet/:sheetId', deleteSheet); // Delete sheet

// Lead management
router.post('/addLead/:sheetId', addLead); // Add lead to sheet
router.delete('/deleteLead/:sheetId/:leadId', deleteLead); // Delete lead from sheet
router.patch('/updateLeadState/:sheetId/:leadId', updateLeadState); // Update lead state
router.post('/appendLeads', appendLeads); // Append new leads (for refresh)

// Utility
router.post('/fetchSheetData', fetchSheetUrl); // Fetch data from URL

// Legacy support
router.get('/getExcelData/:sheetName', getExcelData);

export default router;
