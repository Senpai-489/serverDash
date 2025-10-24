import ExcelData from '../models/dataModel.js';
import * as csv from 'csv-parse/sync';

// Get all sheets for a company
export const getAllSheets = async (req, res) => {
  try {
    const { companyName } = req.params;
    const sheets = await ExcelData.find({ companyName }).sort({ createdAt: -1 });
    res.status(200).json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ message: 'Error fetching sheets', error: error.message });
  }
};

// Get data from a specific sheet
export const getSheetData = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = await ExcelData.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.status(200).json(sheet.data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ message: 'Error fetching sheet data', error: error.message });
  }
};

// Create a new sheet
export const createSheet = async (req, res) => {
  try {
    const { companyName, name, data, sourceType, sourceUrl, uploadedBy } = req.body;

    if (!companyName || !name) {
      return res.status(400).json({ message: 'Company name and sheet name are required' });
    }

    // Generate unique sheet ID
    const sheetId = `${companyName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Assign unique IDs and default state to each data item
    const dataWithIds = Array.isArray(data) ? data.map(item => ({
      ...item,
      _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      state: item.state || 'New', // Add default state
      createdAt: new Date()
    })) : [];

    const newSheet = new ExcelData({
      sheetId,
      name,
      companyName,
      data: dataWithIds,
      sourceType: sourceType || 'file',
      sourceUrl: sourceUrl || null,
      uploadedBy: uploadedBy || 'unknown'
    });

    await newSheet.save();
    res.status(201).json({ message: 'Sheet created successfully', sheet: newSheet });
  } catch (error) {
    console.error('Error creating sheet:', error);
    res.status(500).json({ message: 'Error creating sheet', error: error.message });
  }
};

// Update existing sheet (upload data to existing sheet)
export const uploadExcel = async (req, res) => {
  try {
    const { sheetId, data, uploadedBy, sourceType, sourceUrl } = req.body;

    if (!sheetId) {
      return res.status(400).json({ message: 'Sheet ID is required' });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'Valid data array is required' });
    }

    // Assign unique IDs and default state to each item
    const dataWithIds = data.map(item => ({
      ...item,
      _id: item._id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      state: item.state || 'New', // Add default state
      createdAt: item.createdAt || new Date()
    }));

    const sheet = await ExcelData.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }

    sheet.data = dataWithIds;
    sheet.uploadedBy = uploadedBy || sheet.uploadedBy;
    sheet.sourceType = sourceType || sheet.sourceType;
    sheet.sourceUrl = sourceUrl || sheet.sourceUrl;
    sheet.updatedAt = new Date();

    await sheet.save();
    res.status(200).json({ message: 'Data uploaded successfully', sheet });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ message: 'Error uploading data', error: error.message });
  }
};

// Delete a sheet
export const deleteSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    
    const result = await ExcelData.findOneAndDelete({ sheetId });
    
    if (!result) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.status(200).json({ message: 'Sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting sheet:', error);
    res.status(500).json({ message: 'Error deleting sheet', error: error.message });
  }
};

// Add a single lead to a sheet
export const addLead = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const leadData = req.body;

    const sheet = await ExcelData.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }

    const newLead = {
      ...leadData,
      _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      state: leadData.state || 'New', // Ensure state defaults to 'New'
      createdAt: new Date()
    };

    sheet.data.push(newLead);
    sheet.updatedAt = new Date();
    await sheet.save();

    res.status(201).json({ message: 'Lead added successfully', lead: newLead });
  } catch (error) {
    console.error('Error adding lead:', error);
    res.status(500).json({ message: 'Error adding lead', error: error.message });
  }
};

// Delete a single lead from a sheet
export const deleteLead = async (req, res) => {
  try {
    const { sheetId, leadId } = req.params;

    const sheet = await ExcelData.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }

    const initialLength = sheet.data.length;
    sheet.data = sheet.data.filter(item => item._id !== leadId);

    if (sheet.data.length === initialLength) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    sheet.updatedAt = new Date();
    await sheet.save();

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: 'Error deleting lead', error: error.message });
  }
};

// Update lead state
export const updateLeadState = async (req, res) => {
  try {
    const { sheetId, leadId } = req.params;
    const { state } = req.body;

    if (!state) {
      return res.status(400).json({ message: 'State is required' });
    }

    const validStates = ['New', 'In Conversation', 'Converted', 'Dead Lead'];
    if (!validStates.includes(state)) {
      return res.status(400).json({ message: 'Invalid state value' });
    }

    const sheet = await ExcelData.findOne({ sheetId });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }

    const lead = sheet.data.find(item => item._id === leadId);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.state = state;
    sheet.updatedAt = new Date();
    await sheet.save();

    res.status(200).json({ message: 'Lead state updated successfully', lead });
  } catch (error) {
    console.error('Error updating lead state:', error);
    res.status(500).json({ message: 'Error updating lead state', error: error.message });
  }
};

// Fetch sheet from URL
export const fetchSheetUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    let fetchUrl = url;

    // Convert Google Sheets editor URL to CSV export URL
    const gSheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (gSheetsMatch) {
      const fileId = gSheetsMatch[1];
      const gidMatch = url.match(/[#&]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      fetchUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&gid=${gid}`;
    }

    // Use global fetch if available (Node 18+), otherwise error
    if (typeof fetch === 'undefined') {
      return res.status(500).json({ 
        message: 'Fetch not available. Please upgrade to Node 18+ or install node-fetch.' 
      });
    }

    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const records = csv.parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching sheet URL:', error);
    res.status(500).json({ message: 'Error fetching sheet data', error: error.message });
  }
};

// Legacy support - get data by old sheetName format
export const getExcelData = async (req, res) => {
  try {
    const { sheetName } = req.params;
    
    // Find the most recent sheet for this company
    const sheet = await ExcelData.findOne({ companyName: sheetName }).sort({ createdAt: -1 });
    
    if (!sheet) {
      return res.status(200).json([]); // Return empty array for compatibility
    }
    
    res.status(200).json(sheet.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
};