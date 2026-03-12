const fs = require('fs');
const path = require('path');
const srcDir = 'd:/Rs  Ecosystem/rs-ecosystem/apps/Link na Bio MiniSite/rs-minisite';
const destDir = 'd:/Rs  Ecosystem/rs-ecosystem/apps/rs-admin/components/minisite-admin';

console.log('Copying files from ' + srcDir + ' to ' + destDir);

try {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(path.join(srcDir, 'components/AdminDashboard.tsx'), path.join(destDir, 'MinisiteAdmin.tsx'));
    console.log('Copied MinisiteAdmin.tsx');

    fs.copyFileSync(path.join(srcDir, 'types.ts'), path.join(destDir, 'types.ts'));
    console.log('Copied types.ts');

    fs.copyFileSync(path.join(srcDir, 'constants.ts'), path.join(destDir, 'constants.ts'));
    console.log('Copied constants.ts');

} catch (e) {
    console.error("Error copying: ", e);
}
