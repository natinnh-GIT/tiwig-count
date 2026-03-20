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
      const XLSX = await import('npm:xlsx@0.18.5');

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

      const data = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Components');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      let binaryString = '';
      for (let i = 0; i < wbout.length; i++) {
        binaryString += String.fromCharCode(wbout[i]);
      }
      const base64 = btoa(binaryString);
      return Response.json({ file: base64 });
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});