const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create backup directory name with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupName = `soa-table-backup-${timestamp}`;
const backupPath = path.join(process.cwd(), backupName);

// Create backup directory
fs.mkdirSync(backupPath, { recursive: true });

// Files and directories to exclude
const excludeList = ['node_modules', '.git', 'dist', 'create-backup.js', backupName];

// Function to copy directory recursively
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (excludeList.includes(entry.name)) {
      continue;
    }
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log(`Creating backup: ${backupName}`);
  copyDir(process.cwd(), backupPath);
  console.log(`✅ Backup created successfully in: ${backupName}/`);
  console.log(`📁 You can download this folder or copy its contents.`);
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
}