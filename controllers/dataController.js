import ExcelData from '../models/dataModel.js';
import * as csv from 'csv-parse/sync';

export const uploadExcel = async (req, res) => {
  try {
    const { sheetName, data, uploadedBy, sourceType, sourceUrl } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    if (!sheetName) {
      return res.status(400).json({ message: 'sheetName is required' });
    }

    const updateData = {
      sheetName,
      data,
      uploadedBy: uploadedBy || 'unknown',
      sourceType: sourceType || 'file',
      lastUpdated: new Date()
    };

    if (updateData.sourceType === 'url' && sourceUrl) {
      updateData.sourceUrl = sourceUrl;
    }

    const result = await ExcelData.findOneAndUpdate(
      { sheetName },
      updateData,
      { upsert: true, new: true }
    );

    res.status(201).json({ 
      message: "Data uploaded successfully",
      sourceType: result.sourceType,
      lastUpdated: result.lastUpdated
    });
  } catch (error) {
    console.error('Error uploading excel data:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getExcelData = async (req, res) => {
  try {
    const { sheetName } = req.params;
    const data = await ExcelData.findOne({ sheetName });
    
    if (!data) {
      return res.status(404).json({ message: "No data found" });
    }

    res.status(200).json(data.data);
  } catch (error) {
    console.error('Error fetching excel data:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Support fetching Google Sheets or any CSV URL. For Google Sheets, convert
// a typical share URL to the export CSV endpoint if possible. Returns JSON array.
export const fetchSheetUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'url is required' });

    let fetchUrl = url.trim();

    // If it's a Google Sheets sharing URL, try to convert to CSV export
    // Example: https://docs.google.com/spreadsheets/d/FILE_ID/edit#gid=0
    const gsMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)\/(?:.*?)(?:gid=(\d+))?/);
    if (gsMatch) {
      const fileId = gsMatch[1];
      const gid = gsMatch[2] || '0';
      fetchUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=csv&gid=${gid}`;
    }

    // Use global fetch (Node 18+) if available, otherwise inform to install node-fetch
    const fetchImpl = (typeof fetch !== 'undefined') ? fetch : null;
    if (!fetchImpl) {
      return res.status(500).json({ message: 'Fetch is not available in this Node runtime. Please use Node 18+ or install node-fetch and restart the server.' });
    }

    // Fetch the CSV content
    const resp = await fetchImpl(fetchUrl);
    if (!resp.ok) {
      return res.status(400).json({ message: `Failed to fetch url: ${resp.statusText}` });
    }

    const text = await resp.text();

    // Parse CSV into objects (first row as header)
    let records = [];
    try {
      records = csv.parse(text, {
        columns: true,
        skip_empty_lines: true
      });
    } catch (parseErr) {
      console.warn('CSV parse failed, returning raw text', parseErr);
      return res.status(500).json({ message: 'Failed to parse CSV', error: parseErr.message });
    }

    res.json(records);
  } catch (error) {
    console.error('Error fetching sheet url:', error);
    res.status(500).json({ message: error.message });
  }
};