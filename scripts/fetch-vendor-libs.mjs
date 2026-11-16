#!/usr/bin/env node
/**
 * Downloads the third-party libraries listed in resources/vendor-libraries.json
 * into public/libs/{local}, so apps can serve them themselves (vendor_assets = local).
 *
 * - Every file is checked against its SRI hash: the local copy is byte-identical
 *   to the CDN file the layouts used to load.
 * - Files a stylesheet references (fonts, images: url(...)) are downloaded too,
 *   at the same relative path, so the CSS works unchanged.
 *
 * Usage:  npm run libs            (zero dependencies, Node 18+)
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const libsDir = join(root, 'public', 'libs');
const { libraries } = JSON.parse(await readFile(join(root, 'resources', 'vendor-libraries.json'), 'utf8'));

async function download(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

function verifySri(bytes, integrity, url) {
    const [algorithm, expected] = integrity.split(/-(.+)/);
    const actual = createHash(algorithm).update(bytes).digest('base64');
    if (actual !== expected) {
        throw new Error(`SRI mismatch for ${url}\n  expected ${expected}\n  actual   ${actual}`);
    }
}

async function save(relativePath, bytes) {
    const target = join(libsDir, ...relativePath.split('/'));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
    return target;
}

/** url(...) references in a stylesheet that point at other files (not data: URIs or other hosts). */
function cssReferences(css) {
    const refs = new Set();
    for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
        const ref = match[2].trim();
        if (!ref.startsWith('data:') && !/^[a-z]+:\/\//i.test(ref) && !ref.startsWith('#')) {
            refs.add(ref);
        }
    }
    return [...refs];
}

let files = 0;
for (const lib of libraries) {
    const bytes = await download(lib.cdn);
    verifySri(bytes, lib.integrity, lib.cdn);
    await save(lib.local, bytes);
    files++;
    console.log(`✓ ${lib.name} (${lib.type})  →  public/libs/${lib.local}`);

    if (lib.type === 'css') {
        for (const ref of cssReferences(bytes.toString('utf8'))) {
            const cleanRef = ref.split(/[?#]/)[0];
            const assetUrl = new URL(cleanRef, lib.cdn).href;
            const localPath = posix.normalize(posix.join(posix.dirname(lib.local), cleanRef));
            await save(localPath, await download(assetUrl));
            files++;
            console.log(`    + ${localPath}`);
        }
    }
}

console.log(`\n${files} files in public/libs. Set the user-interface conf vendor_assets = local to use them.`);
