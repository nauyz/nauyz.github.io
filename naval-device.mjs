import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const adb = 'D:/ai_project/名人ip认知app/.android-tools/sdk/platform-tools/adb.exe';
const serial = '9a4aa475';
const args = process.argv.slice(2);
const run = (...command) => execFileSync(adb, ['-s', serial, ...command], { maxBuffer: 16 * 1024 * 1024 });
if (args[0] === 'tap') run('shell', 'input', 'tap', args[1], args[2]);
if (args[0] === 'back') run('shell', 'input', 'keyevent', '4');
if (args[0] === 'swipe') run('shell', 'input', 'swipe', ...args.slice(1));
run('shell', 'uiautomator', 'dump', '/sdcard/naval-showcase-ui.xml');
const xml = run('shell', 'cat', '/sdcard/naval-showcase-ui.xml').toString();
fs.mkdirSync('qa/naval', { recursive: true });
fs.writeFileSync('qa/naval/current.xml', xml);
for (const node of xml.matchAll(/<node\b[^>]+>/g)) {
  const attrs = Object.fromEntries([...node[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
  if (attrs.text || attrs['content-desc']) console.log(JSON.stringify({ text: attrs.text, description: attrs['content-desc'], clickable: attrs.clickable, bounds: attrs.bounds }));
}
if (args.includes('--shot')) { run('shell', 'screencap', '-p', '/sdcard/naval-showcase.png'); run('pull', '/sdcard/naval-showcase.png', 'qa/naval/current.png'); }
