const fs = require('fs');

function fixEnquiries() {
  const f = 'app/admin/enquiries/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('text-xs text-white"', 'text-xs text-slate-900"');
  fs.writeFileSync(f, c, 'utf8');
}

function fixInvoices() {
  const f = 'app/admin/invoices/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('text-white font-bold pt-1 border-t border-slate-200', 'text-slate-900 font-bold pt-1 border-t border-slate-200');
  c = c.replaceAll('text-white font-bold pt-1.5 border-t border-slate-200', 'text-slate-900 font-bold pt-1.5 border-t border-slate-200');
  fs.writeFileSync(f, c, 'utf8');
}

function fixPurchases() {
  const f = 'app/admin/purchases/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('text-white font-bold pt-1 border-t border-slate-200', 'text-slate-900 font-bold pt-1 border-t border-slate-200');
  c = c.replaceAll('text-white font-bold pt-1.5 border-t border-slate-200', 'text-slate-900 font-bold pt-1.5 border-t border-slate-200');
  fs.writeFileSync(f, c, 'utf8');
}

function fixQuotations() {
  const f = 'app/admin/quotations/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace('<span className="font-bold text-white">{group.quotes.length}</span>', '<span className="font-bold text-slate-900">{group.quotes.length}</span>');
  c = c.replaceAll('text-xs text-white"', 'text-xs text-slate-900"');
  c = c.replaceAll('<span className="text-white">Updated Grand Total:</span>', '<span className="text-slate-900 font-bold">Updated Grand Total:</span>');
  c = c.replaceAll('<span className="text-white">Grand Total Amount:</span>', '<span className="text-slate-900 font-bold">Grand Total Amount:</span>');
  c = c.replaceAll('<span className="font-bold text-white">{quoteToDelete.clientName}</span>', '<span className="font-bold text-slate-900">{quoteToDelete.clientName}</span>');
  fs.writeFileSync(f, c, 'utf8');
}

function fixUsers() {
  const f = 'app/admin/users/page.tsx';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('text-xs text-white font-semibold', 'text-xs text-slate-900 font-semibold');
  c = c.replaceAll('<span className="text-white font-bold">{targetUser.name}</span>', '<span className="text-slate-900 font-bold">{targetUser.name}</span>');
  fs.writeFileSync(f, c, 'utf8');
}

fixEnquiries();
fixInvoices();
fixPurchases();
fixQuotations();
fixUsers();
console.log('All targeted text-white issues resolved.');

