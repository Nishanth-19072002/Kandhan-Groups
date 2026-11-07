const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/quotations/page.tsx',
  'app/admin/enquiries/page.tsx',
  'app/admin/orders/page.tsx',
  'app/admin/invoices/page.tsx',
  'app/admin/purchases/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/gst/page.tsx',
  'app/admin/backups/page.tsx',
  'app/admin/settings/page.tsx'
];

files.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return;

  let text = fs.readFileSync(fullPath, 'utf8');

  // 1. Fix conflicting input text-white on white background
  text = text.replace(/className="([^"]*?)text-white([^"]*?)"/g, (match, prefix, suffix) => {
    // If it's an input, select, textarea
    return match; // We'll do targeted replacements
  });

  // Direct cleanup of broken input class strings created previously
  text = text.replaceAll('bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-xs text-white', 'bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500');
  text = text.replaceAll('bg-white border border-slate-200 text-slate-900 rounded-lg text-xs text-white', 'bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500');
  text = text.replaceAll('bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400', 'bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500');
  text = text.replaceAll('bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500', 'bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500');
  
  // 2. Labels
  text = text.replaceAll('text-slate-300 mb-1', 'text-slate-700 font-semibold mb-1');
  text = text.replaceAll('text-slate-400 mb-1', 'text-slate-700 font-semibold mb-1');
  text = text.replaceAll('text-slate-400 font-semibold whitespace-nowrap', 'text-slate-600 font-semibold whitespace-nowrap');

  // 3. Modal Headings & Close buttons
  text = text.replaceAll('text-base font-bold text-white flex items-center', 'text-base font-extrabold text-slate-900 flex items-center');
  text = text.replaceAll('text-base font-bold text-white', 'text-base font-extrabold text-slate-900');
  text = text.replaceAll('text-xs font-bold text-white uppercase', 'text-xs font-bold text-slate-800 uppercase');
  text = text.replaceAll('hover:text-white', 'hover:text-slate-900');

  // 4. Badges (Dark to Crisp Accessible Light Mode)
  text = text.replaceAll('bg-amber-500/15 text-amber-300 border-amber-500/30', 'bg-amber-50 text-amber-800 border-amber-200');
  text = text.replaceAll('bg-emerald-500/15 text-emerald-300 border-emerald-500/30', 'bg-emerald-50 text-emerald-800 border-emerald-200');
  text = text.replaceAll('bg-blue-500/15 text-blue-300 border-blue-500/30', 'bg-blue-50 text-blue-800 border-blue-200');
  text = text.replaceAll('bg-purple-500/15 text-purple-300 border-purple-500/30', 'bg-purple-50 text-purple-800 border-purple-200');
  text = text.replaceAll('bg-cyan-500/15 text-cyan-300 border-cyan-500/30', 'bg-cyan-50 text-cyan-800 border-cyan-200');
  text = text.replaceAll('bg-rose-500/15 text-rose-300 border-rose-500/30', 'bg-rose-50 text-rose-800 border-rose-200');
  text = text.replaceAll('bg-indigo-500/15 text-indigo-300 border-indigo-500/30', 'bg-indigo-50 text-indigo-800 border-indigo-200');

  // 5. Empty States
  text = text.replaceAll('bg-slate-900/40 rounded-2xl border border-slate-800/60 p-8', 'bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs');
  text = text.replaceAll('text-sm font-semibold text-slate-300', 'text-sm font-bold text-slate-800');

  // 6. Common table text colors
  text = text.replaceAll('font-semibold text-white', 'font-semibold text-slate-900');
  text = text.replaceAll('font-extrabold text-white text-sm', 'font-extrabold text-slate-900 text-sm');
  text = text.replaceAll('text-white text-sm', 'text-slate-900 text-sm');
  text = text.replaceAll('font-mono text-slate-300', 'font-mono text-slate-700 font-semibold');
  text = text.replaceAll('font-medium text-slate-300', 'font-semibold text-slate-800');
  text = text.replaceAll('text-slate-400 whitespace-nowrap', 'text-slate-600 whitespace-nowrap');

  // 7. Modals: background backdrop and box
  text = text.replaceAll('bg-black/85 backdrop-blur-sm', 'bg-slate-950/60 backdrop-blur-xs');
  text = text.replaceAll('bg-black/80 backdrop-blur-sm', 'bg-slate-950/60 backdrop-blur-xs');
  text = text.replaceAll('bg-slate-950/40 font-mono', 'bg-white font-mono');
  text = text.replaceAll('divide-y divide-slate-800/60', 'divide-y divide-slate-200');
  text = text.replaceAll('border border-slate-800 rounded-xl', 'border border-slate-200 rounded-xl');

  fs.writeFileSync(fullPath, text, 'utf8');
  console.log('Processed:', relPath);
});

