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
    const allComponents = await base44.entities.Component.list();
    const categoryOrder = { brass: 0, bullets: 1, powder: 2, primers: 3 };
    const components = allComponents.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

    if (format === 'csv') {
      // Generate CSV
      const fmtDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleString('en-US', { 
          timeZone: 'America/New_York', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };
      const headers = ['Name', 'Category', 'Brand', 'Caliber', 'Quantity', 'Unit', 'Cost Per Unit', 'Total Cost', 'Lot Number', 'Purchase Date', 'Purchased From', 'Barcode', 'Description', 'Photo URL'];
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
        fmtDate(c.purchase_date),
        c.purchased_from || '',
        c.barcode || '',
        c.description || '',
        c.photo_url || ''
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

      const fmtDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleString('en-US', { 
          timeZone: 'America/New_York', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };

      const headers = ['Name', 'Category', 'Brand', 'Caliber', 'Quantity', 'Unit', 'Cost Per Unit', 'Total Cost', 'Lot Number', 'Purchase Date', 'Purchased From', 'Barcode', 'Description', 'Photo URL'];
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
        fmtDate(c.purchase_date),
        c.purchased_from || '',
        c.barcode || '',
        c.description || '',
        c.photo_url || ''
      ]);

      const data = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Components');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(wbout)));
      return Response.json({ file: base64 });
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});