import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'fs';
const root = process.argv[2];
const svg = readFileSync(`${root}/public/brand/kumo-mark.svg`);
const sizes = [16, 32, 48, 256];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()));
// ICO container holding PNG frames (supported by every current browser).
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length; const dir: Buffer[] = [];
sizes.forEach((s, i) => { const e = Buffer.alloc(16); e.writeUInt8(s >= 256 ? 0 : s, 0); e.writeUInt8(s >= 256 ? 0 : s, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12); offset += pngs[i].length; dir.push(e); });
writeFileSync(`${root}/public/favicon.ico`, Buffer.concat([header, ...dir, ...pngs]));
writeFileSync(`${root}/public/iconLogo.png`, await sharp(svg, { density: 384 }).resize(256, 256).png().toBuffer());
writeFileSync(`${root}/public/iconLogo.webp`, await sharp(svg, { density: 384 }).resize(256, 256).webp().toBuffer());
writeFileSync(`${root}/public/brand/kumo-mark-512.png`, await sharp(svg, { density: 768 }).resize(512, 512).png().toBuffer());
writeFileSync(`${root}/public/apple-touch-icon.png`, await sharp(svg, { density: 384 }).resize(180, 180).png().toBuffer());
// Open Graph card: black field, mark, wordmark.
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0a0a0a"/><rect x="0" y="600" width="1200" height="30" fill="#facc15"/><g transform="translate(110,215) scale(3)">${svg.toString().replace(/<\/?svg[^>]*>/g,'')}</g><text x="340" y="320" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="800" fill="#ffffff">Kumo <tspan fill="#facc15">One</tspan></text><text x="344" y="390" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#d4d4d4">CRM, sites, agenda, projetos e IA em um só lugar</text></svg>`;
writeFileSync(`${root}/public/og.jpg`, await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toBuffer());
console.log('ok');
