import apiClient from './apiClient';

/**
 * reportApi — Centralized API service for Financial Reports and File Exports.
 *
 * All calculations are performed on the backend database layer.
 * Frontend consumes computed aggregations and direct file streams (CSV, Excel, PDF).
 */

const getFilenameFromHeader = (contentDisposition, fallback = 'download') => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match && match[1] ? match[1].trim() : fallback;
};

const triggerBlobDownload = (blobData, filename, mimeType) => {
  const blob = new Blob([blobData], { type: mimeType });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(downloadUrl);
};

export const reportApi = {
  // ── JSON Report Endpoints ───────────────────────────────────────────────

  getMonthlyReport: async (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await apiClient.get('/reports/monthly', { params });
    return response.data;
  },

  getYearlyReport: async (year) => {
    const params = {};
    if (year) params.year = year;
    const response = await apiClient.get('/reports/yearly', { params });
    return response.data;
  },

  getExpenseReport: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get('/reports/expenses', { params });
    return response.data;
  },

  getIncomeReport: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get('/reports/income', { params });
    return response.data;
  },

  getBudgetReport: async (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await apiClient.get('/reports/budget', { params });
    return response.data;
  },

  getSavingsGoalReport: async () => {
    const response = await apiClient.get('/reports/savings-goals');
    return response.data;
  },

  getCashFlowReport: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get('/reports/cash-flow', { params });
    return response.data;
  },

  // ── Export Endpoints (CSV, Excel, PDF) ───────────────────────────────────

  downloadExport: async (reportType, format, params = {}) => {
    // reportType: 'monthly' | 'yearly' | 'expenses' | 'income' | 'budget' | 'savings-goals' | 'cash-flow'
    // format: 'csv' | 'excel' | 'pdf'
    const endpoint = `/reports/${reportType}/export/${format}`;

    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    };

    const response = await apiClient.get(endpoint, {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    const defaultExtensions = { csv: '.csv', excel: '.xlsx', pdf: '.pdf' };
    const defaultName = `${reportType}_report${defaultExtensions[format] || ''}`;
    const filename = getFilenameFromHeader(disposition, defaultName);

    triggerBlobDownload(response.data, filename, mimeTypes[format] || 'application/octet-stream');
    return filename;
  },
};

export default reportApi;
