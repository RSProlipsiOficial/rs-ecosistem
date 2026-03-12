const fs = require('fs');

const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\apps\\rs-admin\\components\\minisite-admin\\MinisiteAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { search: /bg-white dark:bg-rs-dark/g, replace: 'bg-[#1E1E1E]' },
    { search: /border-gray-200 dark:border-rs-gray/g, replace: 'border-[#2A2A2A]' },
    { search: /border-gray-200/g, replace: 'border-[#2A2A2A]' },
    { search: /border-gray-800/g, replace: 'border-[#2A2A2A]' },
    { search: /dark:border-gray-800/g, replace: 'border-[#2A2A2A]' },
    { search: /text-gray-900 dark:text-white/g, replace: 'text-white' },
    { search: /text-gray-900/g, replace: 'text-white' },
    { search: /bg-gray-50 dark:bg-black\/20/g, replace: 'bg-[#1E1E1E]' },
    { search: /bg-gray-50/g, replace: 'bg-[#1E1E1E]' },
    { search: /divide-gray-100 dark:divide-white\/5/g, replace: 'divide-[#2A2A2A]' },
    { search: /hover:bg-gray-50 dark:hover:bg-white\/5/g, replace: 'hover:bg-[#2A2A2A]' },
    { search: /bg-gray-100 dark:bg-white\/10/g, replace: 'bg-[#2A2A2A]' },
    { search: /text-gray-500 dark:text-gray-400/g, replace: 'text-[#9CA3AF]' },
    { search: /text-gray-500/g, replace: 'text-[#9CA3AF]' },
    { search: /text-gray-600 dark:text-gray-300/g, replace: 'text-[#E5E7EB]' },
    { search: /bg-rs-goldDark dark:bg-rs-gold/g, replace: 'bg-rs-gold text-black hover:bg-[#E5C100]' },
    { search: /bg-rs-black/g, replace: 'bg-[#121212]' },
    { search: /font-serif/g, replace: 'font-sans' }
];

let replaced = false;
replacements.forEach(({ search, replace }) => {
    if (search.test(content)) replaced = true;
    content = content.replace(search, replace);
});

if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Script completed and file updated.');
} else {
    console.log('No matches found.');
}
