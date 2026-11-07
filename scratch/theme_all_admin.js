const fs = require('fs');

const adminPages = [
  'app/admin/enquiries/page.tsx',
  'app/admin/orders/page.tsx',
  'app/admin/invoices/page.tsx',
  'app/admin/purchases/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/gst/page.tsx',
  'app/admin/backups/page.tsx',
  'app/admin/settings/page.tsx',
];

for (const file of adminPages) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');

  // Headers & Text
  c = c.replace(/text-2xl font-bold text-white/g, 'text-2xl font-extrabold text-slate-900');
  c = c.replace(/text-xs text-slate-400 mt-1/g, 'text-xs text-slate-500 mt-1');
  c = c.replace(/text-slate-400 mt-1/g, 'text-slate-500 mt-1');

  // Action bars / filter bars
  c = c.replace(/bg-slate-900\/60 p-4 rounded-2xl border border-slate-800/g, 'bg-white p-4 rounded-2xl border border-slate-200 shadow-xs');
  c = c.replace(/bg-slate-900\/80 p-4 rounded-2xl border border-slate-800/g, 'bg-white p-4 rounded-2xl border border-slate-200 shadow-xs');
  c = c.replace(/bg-slate-950\/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500/g, 'bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400');
  c = c.replace(/bg-slate-950\/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500/g, 'bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400');
  c = c.replace(/bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white/g, 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs');

  // Filter pills
  c = c.replace(/bg-slate-800\/80 text-slate-400 hover:text-white/g, 'bg-slate-100 text-slate-600 hover:text-slate-900');
  c = c.replace(/bg-slate-700 text-white font-bold/g, 'bg-[#0B192C] text-white font-bold');

  // Table wrappers
  c = c.replace(/bg-slate-900\/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl/g, 'bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs');
  c = c.replace(/bg-slate-900\/80 border border-slate-800\/80 rounded-2xl p-6/g, 'bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs');
  c = c.replace(/bg-slate-900\/60 border border-slate-800/g, 'bg-white border border-slate-200 shadow-xs');
  c = c.replace(/bg-slate-900\/80 border border-slate-800/g, 'bg-white border border-slate-200 shadow-xs');
  c = c.replace(/bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800/g, 'bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200');
  c = c.replace(/divide-y divide-slate-800\/50/g, 'divide-y divide-slate-100');
  c = c.replace(/divide-y divide-slate-800\/60/g, 'divide-y divide-slate-100');
  c = c.replace(/hover:bg-slate-800\/40 transition group/g, 'hover:bg-slate-50 transition group');
  c = c.replace(/font-bold text-white text-sm/g, 'font-extrabold text-slate-900 text-sm');
  c = c.replace(/font-bold text-white/g, 'font-extrabold text-slate-900');
  c = c.replace(/font-medium text-slate-200/g, 'font-semibold text-slate-800');
  c = c.replace(/text-slate-200/g, 'text-slate-800');

  // Buttons in table
  c = c.replace(/bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white/g, 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900');
  c = c.replace(/bg-slate-800 hover:bg-rose-500\/20 text-slate-400 hover:text-rose-400/g, 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600');

  // Modals
  c = c.replace(/bg-slate-900 border border-slate-800 rounded-2xl/g, 'bg-white border border-slate-200 rounded-2xl shadow-2xl');
  c = c.replace(/border-b border-slate-800/g, 'border-b border-slate-200');
  c = c.replace(/border-t border-slate-800/g, 'border-t border-slate-200');
  c = c.replace(/bg-slate-950 border border-slate-800/g, 'bg-slate-50 border border-slate-300 text-slate-900');
  c = c.replace(/bg-slate-950\/70 border border-slate-800/g, 'bg-slate-50 border border-slate-200 text-slate-700');
  c = c.replace(/bg-slate-950\/60/g, 'bg-slate-50');

  fs.writeFileSync(file, c, 'utf8');
  console.log(`Updated: ${file}`);
}

