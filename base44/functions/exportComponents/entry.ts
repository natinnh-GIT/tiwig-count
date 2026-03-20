import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format } = await req.json();

    // Fetch all components
    const components = await base44.entities.Component.list();

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Name', 'Category', 'Brand', 'Caliber', 'Quantity', 'Unit', 'Cost Per Unit', 'Total Cost', 'Lot Number', 'Purchase Date', 'Purchased From', 'Barcode', 'Description'];
      const rows = components.map(c => [
        c.name || '',
        c.category || '',
        c.brand || '',
        c.caliber || '',
        c.quantity || 0,
        c.unit || '',
        c.cost_per_unit || '',
        c.total_cost || '',
        c.lot_number || '',
        c.purchase_date || '',
        c.purchased_from || '',
        c.barcode || '',
        c.description || ''
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': 'attachment; filename=components.csv'
        }
      });
    }

    if (format === 'xlsx') {
      const { write } = await import('npm:xlsx@0.18.5');

      const headers = ['Name', 'Category', 'Brand', 'Caliber', 'Quantity', 'Unit', 'Cost Per Unit', 'Total Cost', 'Lot Number', 'Purchase Date', 'Purchased From', 'Barcode', 'Description'];
      const rows = components.map(c => [
        c.name || '',
        c.category || '',
        c.brand || '',
        c.caliber || '',
        c.quantity || 0,
        c.unit || '',
        c.cost_per_unit || '',
        c.total_cost || '',
        c.lot_number || '',
        c.purchase_date || '',
        c.purchased_from || '',
        c.barcode || '',
        c.description || ''
      ]);

      const wb = { SheetNames: ['Components'], Sheets: {} };
      const ws = {};

      // Set headers
      headers.forEach((h, i) => {
        const col = String.fromCharCode(65 + i);
        ws[`${col}1`] = { t: 's', v: h };
      });

      // Set data rows
      rows.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          const col = String.fromCharCode(65 + colIdx);
          const cellRef = `${col}${rowIdx + 2}`;
          ws[cellRef] = { t: typeof cell === 'number' ? 'n' : 's', v: cell };
        });
      });

      ws['!ref'] = `A1:${String.fromCharCode(65 + headers.length - 1)}${rows.length + 1}`;
      wb.Sheets['Components'] = ws;

      const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
      return new Response(wbout, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=components.xlsx'
        }
      });
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});