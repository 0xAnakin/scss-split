const fs = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, `../chunks`);

const defaultFilePath = path.join(__dirname, '../styles.scss');
const argFilePath = process.argv.slice(2)[0];
const filePath = (typeof argFilePath === 'string') && argFilePath.length ? argFilePath : defaultFilePath;

const defaultSeparator = `/* ////////////////////////////////////////////////////////////////////////////////////////////// */`;
const argSeparator = process.argv.slice(2)[1];
const separator = (typeof argSeparator === 'string') && argSeparator.length ? argSeparator : defaultSeparator;

console.log(`splitting ${filePath}.`);

(async () => {

    try {

        const scss = await fs.readFile(path.normalize(filePath), 'utf8');
        const scss_sections = scss.split(separator);
        const imports = [];

        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        for (const section of scss_sections) {

            const trimmed = section.trim();
            const fileName = trimmed.replace(/[\.\,\#\:\@]/g, ' ').trim().split(' ')[0];            
            const file = `_${fileName}.scss`;

            const importStr = `@import "./${fileName}";`;

            if (imports.includes(importStr)) {
                throw new Error(`Duplicate entry: ${importStr}`);
            }

            imports.push(importStr);

            await fs.writeFile(path.join(OUTPUT_DIR, file), trimmed, 'utf8');

        }

        await fs.writeFile(path.join(OUTPUT_DIR, '_styles.scss'), imports.join('\n'), 'utf8');

        console.log(`splitted into ${imports.length} scss files.`)

    } catch (err) {
        console.error(err);
    }

})()