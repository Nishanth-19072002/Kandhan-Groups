const fs = require('fs');

let c = fs.readFileSync('app/admin/quotations/page.tsx', 'utf8');

// Replace dark container styles
c = c.replace(/className="space-y-6 max-w-7xl mx-auto"/g, 'className="space-y-6 max-w-7xl mx-auto"');
c = c.replace(/text-2xl font-bold text-white/g, 'text-2xl font-extrabold text-slate-900');
c = c.replace(/text-xs text-slate-400 mt-1/g, 'text-xs text-slate-500 mt-1');
c = c.replace(/bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white/g, 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs');

// Filter bar
c = c.replace(/bg-slate-900\/80 p-4 rounded-2xl border border-slate-800 space-y-3/g, 'bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3');
c = c.replace(/bg-slate-950\/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/g, 'bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500');
c = c.replace(/px-3 py-2 bg-slate-950\/90 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400/g, 'px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500');
c = c.replace(/bg-slate-800\/60/g, 'border-slate-100');
c = c.replace(/bg-slate-800\/80 text-slate-400 hover:text-white/g, 'bg-slate-100 text-slate-600 hover:text-slate-900');

// Table container & Client Header
c = c.replace(/bg-slate-900\/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl/g, 'bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs');
c = c.replace(/bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 border-b border-slate-800/g, 'bg-slate-50/90 px-5 py-3.5 border-b border-slate-200');
c = c.replace(/bg-amber-500\/10 border border-amber-500\/30 flex items-center justify-center font-bold text-amber-400 text-sm/g, 'bg-amber-100 border border-amber-300 flex items-center justify-center font-extrabold text-amber-800 text-sm');
c = c.replace(/font-bold text-white text-sm/g, 'font-extrabold text-slate-900 text-sm');
c = c.replace(/bg-slate-800 text-slate-300 border border-slate-700/g, 'bg-white text-slate-700 border border-slate-200 shadow-xs');
c = c.replace(/bg-slate-800\/80 border border-slate-700\/80 text-slate-300/g, 'bg-white border border-slate-200 text-slate-700 shadow-xs');
c = c.replace(/bg-amber-500\/10 border border-amber-500\/30 text-amber-400 font-bold/g, 'bg-amber-50 border border-amber-200 text-amber-800 font-extrabold');
c = c.replace(/text-amber-500\/70/g, 'text-amber-700/80');

// Table Head & Body
c = c.replace(/bg-slate-950\/70 text-slate-400 uppercase tracking-wider border-b border-slate-800\/80 font-bold text-\[10px\]/g, 'bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]');
c = c.replace(/divide-y divide-slate-800\/50/g, 'divide-y divide-slate-100');
c = c.replace(/hover:bg-slate-800\/40 transition group/g, 'hover:bg-slate-50 transition group');
c = c.replace(/font-mono text-amber-400 font-bold/g, 'font-mono text-slate-900 font-extrabold');
c = c.replace(/bg-amber-500\/15 text-amber-300 border border-amber-500\/30/g, 'bg-amber-50 text-amber-700 border border-amber-200');
c = c.replace(/font-medium text-slate-200/g, 'font-semibold text-slate-800');
c = c.replace(/text-right font-medium text-slate-300/g, 'text-right font-semibold text-slate-900');
c = c.replace(/text-right font-bold text-amber-400 text-sm/g, 'text-right font-black text-amber-600 text-sm');

// Action buttons
c = c.replace(/bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white/g, 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900');
c = c.replace(/bg-slate-800 hover:bg-rose-500\/20 text-slate-400 hover:text-rose-400/g, 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600');

// Modals
c = c.replace(/bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl/g, 'bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900');
c = c.replace(/border-b border-slate-800/g, 'border-b border-slate-200');
c = c.replace(/border-t border-slate-800/g, 'border-t border-slate-200');
c = c.replace(/text-slate-300/g, 'text-slate-700');
c = c.replace(/bg-slate-950 border border-slate-800/g, 'bg-slate-50 border border-slate-300 text-slate-900');
c = c.replace(/bg-slate-950\/80 border border-slate-800/g, 'bg-slate-50 border border-slate-200 text-slate-700');
c = c.replace(/bg-slate-950\/70 border border-slate-800/g, 'bg-slate-50 border border-slate-200 text-slate-700');
c = c.replace(/bg-slate-900 border border-slate-800/g, 'bg-white border border-slate-200 text-slate-900');
c = c.replace(/bg-slate-950 text-slate-400/g, 'bg-slate-100 text-slate-600');
c = c.replace(/bg-slate-950\/40/g, 'bg-white');

fs.writeFileSync('app/admin/quotations/page.tsx', c, 'utf8');
console.log('Quotations page converted to White/Navy/Gold theme!');

