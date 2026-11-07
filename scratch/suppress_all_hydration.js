const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.next') {
        processDir(full);
      }
    } else if (ent.name.endsWith('.tsx') || ent.name.endsWith('.jsx')) {
      let code = fs.readFileSync(full, 'utf8');
      let changed = false;

      // Add suppressHydrationWarning to <button
      code = code.replace(/<button(?![^>]*suppressHydrationWarning)(\s+[^>]*?)>/g, (m, attrs) => {
        changed = true;
        return `<button suppressHydrationWarning${attrs}>`;
      });

      // Add suppressHydrationWarning to <input
      code = code.replace(/<input(?![^>]*suppressHydrationWarning)(\s+[^>]*?)>/g, (m, attrs) => {
        changed = true;
        return `<input suppressHydrationWarning${attrs}>`;
      });

      // Add suppressHydrationWarning to <select
      code = code.replace(/<select(?![^>]*suppressHydrationWarning)(\s+[^>]*?)>/g, (m, attrs) => {
        changed = true;
        return `<select suppressHydrationWarning${attrs}>`;
      });

      if (changed) {
        fs.writeFileSync(full, code, 'utf8');
        console.log('Hydration suppressed in:', full.replace(process.cwd(), ''));
      }
    }
  }
}

processDir(path.join(process.cwd(), 'components'));
processDir(path.join(process.cwd(), 'app'));
console.log('Hydration protection completed.');

