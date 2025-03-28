// Speichere dies als apps/code-timer/package-extension.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isPublish = process.argv.includes('--publish');
const isPackageOnly = process.argv.includes('--package-only') || !isPublish;

// Pfade konfigurieren
const extensionDir = __dirname;
const tempDir = path.join(extensionDir, 'temp-package');

// Temporäres Verzeichnis erstellen
console.log('Erstelle temporäres Verzeichnis...');
if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Funktion zum Kopieren von Dateien/Verzeichnissen
function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    if (!exists) {
        console.warn(`Warnung: ${src} existiert nicht, wird übersprungen.`);
        return;
    }

    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();

    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Liste der zu kopierenden Dateien und Verzeichnisse
const itemsToCopy = [
    { src: 'build', dest: 'build' },
    { src: 'media', dest: 'media' },
    { src: 'images', dest: 'images' },
    { src: 'src', dest: 'src' },
    { src: 'resources', dest: 'resources' },
    { src: 'package.json', dest: 'package.json' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: 'README.md', dest: 'README.md' }
];

// Optional: LICENSE-Datei, falls vorhanden
if (fs.existsSync(path.join(extensionDir, 'LICENSE'))) {
    itemsToCopy.push({ src: 'LICENSE', dest: 'LICENSE' });
}

// Dateien kopieren
console.log('Kopiere Dateien...');
itemsToCopy.forEach(item => {
    const srcPath = path.join(extensionDir, item.src);
    const destPath = path.join(tempDir, item.dest);
    console.log(`Kopiere ${item.src} nach ${item.dest}`);
    copyRecursive(srcPath, destPath);
});

// VSIX erstellen oder Extension veröffentlichen
try {
    process.chdir(tempDir);

    if (isPackageOnly) {
        console.log('Erstelle VSIX-Paket...');
        execSync('npx vsce package', { stdio: 'inherit' });

        // VSIX-Datei zurück ins Hauptverzeichnis verschieben
        console.log('Verschiebe VSIX-Datei...');
        const vsixFiles = fs.readdirSync('.').filter(file => file.endsWith('.vsix'));
        if (vsixFiles.length > 0) {
            const vsixFile = vsixFiles[0];
            fs.copyFileSync(
                path.join(tempDir, vsixFile),
                path.join(extensionDir, vsixFile)
            );
            console.log(`VSIX-Paket erstellt: ${vsixFile}`);
        } else {
            console.error('Keine VSIX-Datei gefunden.');
        }
    } else if (isPublish) {
        console.log('Veröffentliche Extension im Marketplace...');
        execSync('npx vsce publish', { stdio: 'inherit' });
        console.log('Extension erfolgreich veröffentlicht!');
    }
} catch (error) {
    console.error('Fehler beim Erstellen/Veröffentlichen der Extension:', error);
}

// Aufräumen
console.log('Räume temporäres Verzeichnis auf...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('Fertig!');