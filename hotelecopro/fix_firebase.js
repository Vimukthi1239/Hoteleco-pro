const fs = require('fs');

const path = 'c:\\Users\\2000m\\OneDrive\\Desktop\\FYP\\hotelecopro\\src\\data\\firebase.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// We want lines 0 to 423 (which corresponds to 1 to 424 in 1-based indexing)
// And lines 620 to the end (which is 621 to the end in 1-based)

const cleanLines = [
    ...lines.slice(0, 424),
    ...lines.slice(620)
];

fs.writeFileSync(path, cleanLines.join('\n'));
console.log('Fixed firebase.js');
