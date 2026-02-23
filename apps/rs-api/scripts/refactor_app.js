const fs = require('fs');
const path = 'd:/Rs  Ecosystem/rs-ecosystem/apps/rs-consultor/App.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Verify current content at expected lines
const startLineIndex = 403; // Line 404 (0-indexed)
const endLineIndex = 485;   // Line 486

// Verification
if (!lines[startLineIndex].includes('React.useEffect')) {
    console.error('Line 404 mismatch. Expected React.useEffect, found:', lines[startLineIndex]);
    console.log('Context:', lines.slice(startLineIndex - 2, startLineIndex + 2));
    process.exit(1);
}

if (!lines[startLineIndex + 1].includes('const checkSessionAndFetchUser')) {
    console.error('Line 405 mismatch. Expected const checkSessionAndFetchUser, found:', lines[startLineIndex + 1]);
    process.exit(1);
}

const newBlock = [
    '  // Fetch user from Supabase and handle session',
    '  React.useEffect(() => {',
    '    checkSessionAndFetchUser();',
    '  }, [checkSessionAndFetchUser]);'
];

// Reconstruct
// Slicing: 0 to 402 (keep lines 1..403)
// Insert newBlock.
// Slicing: 486 to end (keep lines 487..end)

const before = lines.slice(0, 402);
// index 402 is the comment `// Fetch user...`
// Our newBlock includes it.
// So we start replacing at 402.

const after = lines.slice(486);
// index 486 is the line after `}, []);` in the OLD block.
// index 485 was `}, []);`.

const newContent = [...before, ...newBlock, ...after].join('\n');
fs.writeFileSync(path, newContent, 'utf8');
console.log('Success');
