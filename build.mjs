import { build } from 'esbuild';
import esbuildCopy from 'esbuild-plugin-copy';
import archiver from 'archiver';
import webExtModule from 'web-ext';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const copy = esbuildCopy?.default ?? esbuildCopy;
const webExt = webExtModule?.default ?? webExtModule;

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, 'dist');
const outDir = path.join(distDir, 'extension');
const artifactsDir = path.join(rootDir, 'artifacts');
const isDev = process.argv.includes('--dev');

async function run() {
  console.log(`Building in ${isDev ? 'development' : 'production'} mode...`);
  await fs.rm(distDir, { recursive: true, force: true });

  await buildExtension();
  await packageArtifacts();
}

function buildExtension() {
  return build({
    entryPoints: [
      path.join(rootDir, 'background.js'),
      path.join(rootDir, 'content.js')
    ],
    outdir: outDir,
    bundle: true,
    format: 'iife',
    entryNames: '[name]',
    splitting: false,
    target: 'es2020',
    sourcemap: isDev,
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: [
          { from: ['manifest.json'], to: [path.join(outDir, 'manifest.json')] },
          { from: ['content.css'], to: [path.join(outDir, 'content.css')] },
          { from: ['icons/**/*'], to: [path.join(outDir, 'icons')] }
        ]
      })
    ]
  });
}

async function packageArtifacts() {
  try {
    await fs.mkdir(artifactsDir, { recursive: true });
    const [chromeArtifact, firefoxArtifact] = await Promise.all([
      packageChrome(),
      packageFirefox()
    ]);
    console.log(`Chrome package created: ${chromeArtifact}`);
    console.log(`Firefox package created: ${firefoxArtifact}`);
  } catch (err) {
    console.error('Packaging failed:', err);
    throw err;
  }
}

async function packageChrome() {
  const outFile = path.join(artifactsDir, 'josm-strava-heatmap-chrome.zip');
  await fs.rm(outFile, { force: true });
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(outDir, false);
    archive.finalize();
  }).then(() => outFile);
}

async function packageFirefox() {
  const result = await webExt.cmd.build({
    sourceDir: outDir,
    artifactsDir,
    overwriteDest: true,
    filename: 'josm-strava-heatmap-firefox.zip'
  }, {
    shouldExitProgram: false,
    showReadyMessage: false
  });
  if (Array.isArray(result?.artifacts) && result.artifacts.length) {
    const artifactPath = result.artifacts[0]?.path;
    if (!artifactPath) {
      throw new Error('Firefox package created but no artifact path reported.');
    }
    return artifactPath;
  }
  if (result?.extensionPath) {
    return result.extensionPath;
  }
  throw new Error('Firefox package created but no artifact path reported.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
