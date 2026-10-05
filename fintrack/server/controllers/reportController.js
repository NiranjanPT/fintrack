const reportService = require('../services/reportService');
const { parseMonthYear } = require('../utils/dateUtils');

// GET /api/reports?month=10&year=2026   (month=all -> full year report)
const getReport = async (req, res) => {
  const period = parseMonthYear(req.query, { allowAll: true });
  const report = await reportService.generateReport(req.user._id, period);
  res.json({ success: true, data: report });
};

// GET /api/reports/export?month=10&year=2026  -> downloads a CSV file
const exportReport = async (req, res) => {
  const period = parseMonthYear(req.query, { allowAll: true });
  const report = await reportService.generateReport(req.user._id, period, { includeTransactions: true });
  const csv = reportService.toCSV(report);

  const fileName = period.month
    ? `fintrack-report-${period.year}-${String(period.month).padStart(2, '0')}.csv`
    : `fintrack-report-${period.year}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  // BOM so Excel opens the ₹ symbol and other UTF-8 text correctly
  res.send(`﻿${csv}`);
};

module.exports = { getReport, exportReport };
