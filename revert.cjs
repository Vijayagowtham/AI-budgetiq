const fs = require('fs');
const files = [
  'src/pages/Dashboard.jsx', 
  'src/pages/Income.jsx', 
  'src/pages/Expenses.jsx', 
  'src/pages/Profile.jsx',
  'src/components/ui/Input.jsx',
  'src/components/ui/Modal.jsx',
  'src/components/ui/Card.jsx',
  'src/components/layout/Navbar.jsx',
  'src/components/layout/Sidebar.jsx',
  'src/pages/Reports.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // This highly specific regex matches instances like:
  // "bg-white/90 dark:bg-slate-900/90" OR "text-slate-900 dark:text-slate-50"
  // It captures the tailwind class inside the dark: modifier and replaces the entire tuple with just that captured class.
  content = content.replace(/\b(?:bg|text|border|divide|shadow|ring)-[a-z0-9/-]+\s+dark:((?:bg|text|border|divide|shadow|ring)-[a-z0-9/-]+(?:\[[^\]]+\])?)\b/g, '$1');
  
  // After paired tuples are processed, we safely drop any leftover `dark:` prefixes for un-paired dark constraints.
  content = content.replace(/\bdark:/g, '');

  fs.writeFileSync(f, content);
  console.log(`Reverted ${f}`);
});
