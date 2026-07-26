/**
 * exportUtils.js — Native browser utilities for exporting data.
 * Zero external dependencies.
 */

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(data, filename) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
}

export function exportToExcel(data, filename) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta charset="UTF-8"></head><body><table>';
  
  // Headers
  html += '<tr>';
  for (const h of headers) {
    html += `<th style="background-color: #f3f4f6; text-align: left; padding: 4px;">${h}</th>`;
  }
  html += '</tr>';

  // Rows
  for (const row of data) {
    html += '<tr>';
    for (const h of headers) {
      html += `<td style="padding: 4px;">${row[h] ?? ''}</td>`;
    }
    html += '</tr>';
  }

  html += '</table></body></html>';
  
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadFile(blob, `${filename}.xls`);
}

export function triggerPDFPrint() {
  // We use native print. The CSS in the page will have `@media print` 
  // to hide navbars, sidebars, and buttons, formatting the page beautifully for PDF.
  window.print();
}
