const fs = require('fs');
const files = [
  'src/pages/Dashboard.jsx', 
  'src/pages/Income.jsx', 
  'src/pages/Expenses.jsx', 
  'src/pages/Profile.jsx',
  'src/components/ui/Input.jsx',
  'src/components/ui/Modal.jsx',
  'src/components/layout/Navbar.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Text colors
  content = content.replace(/text-slate-50\b/g, 'text-slate-900 dark:text-slate-50');
  content = content.replace(/text-slate-100/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-200/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-300/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
  
  // Backgrounds
  content = content.replace(/bg-slate-900\/40/g, 'bg-slate-50/80 dark:bg-slate-900/40');
  content = content.replace(/bg-slate-900\/50/g, 'bg-slate-50 dark:bg-slate-900/50');
  content = content.replace(/bg-slate-800\/40/g, 'bg-slate-100/80 dark:bg-slate-800/40');
  content = content.replace(/bg-slate-800\/50/g, 'bg-slate-100 dark:bg-slate-800/50');
  content = content.replace(/bg-slate-800\/80/g, 'bg-slate-200 dark:bg-slate-800/80');
  content = content.replace(/bg-slate-800(?![\/])/g, 'bg-slate-200 dark:bg-slate-800');
  content = content.replace(/bg-slate-900\/10/g, 'bg-slate-100 dark:bg-slate-900/10');
  
  // Borders
  content = content.replace(/border-slate-700\/50/g, 'border-slate-200 dark:border-slate-700/50');
  content = content.replace(/border-slate-700\/60/g, 'border-slate-200 dark:border-slate-700/60');
  content = content.replace(/divide-slate-700\/50/g, 'divide-slate-200 dark:divide-slate-700/50');

  // Fixes to prevent double-injections if the script is accidentally run twice
  content = content.replace(/text-slate-900 dark:text-slate-900 dark:text-slate-50/g, 'text-slate-900 dark:text-slate-50');

  fs.writeFileSync(f, content);
  console.log(`Transformed ${f}`);
});
