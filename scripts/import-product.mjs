#!/usr/bin/env node
/**
 * Product Import Script for SF Paragliding
 *
 * Imports a product from a Shopify store (flyaboveall.store) into the local
 * Payload CMS database including images, sizes, colors, and sizing chart.
 *
 * Usage:
 *   node scripts/import-product.mjs <shopify-handle> [options]
 *
 * Examples:
 *   node scripts/import-product.mjs ozone-buzz-z7
 *   node scripts/import-product.mjs ozone-buzz-z7 --dry-run
 *   node scripts/import-product.mjs ozone-buzz-z7 --price 4900 --custom-price 5100
 *
 * Options:
 *   --dry-run         Print what would be done without making changes
 *   --price <n>       Override base price (in dollars)
 *   --custom-price <n> Price for CUSTOM color option (in dollars)
 *   --slug <s>        Override the product slug (default: derived from name)
 *   --sku <s>         Override the SKU
 *
 * Prerequisites:
 *   - PostgreSQL with pg module available (run from project root with NODE_PATH=./node_modules)
 *   - Images directory at /var/www/sfparagliding.com/media/ (or MEDIA_DIR env var)
 *   - Database credentials via env vars or defaults
 *
 * Environment Variables:
 *   DB_HOST     (default: localhost)
 *   DB_USER     (default: sfparagliding)
 *   DB_PASSWORD (default: 55rshKCXR7JaBfLXqgTyeluxAPhZdL)
 *   DB_NAME     (default: sfparagliding)
 *   MEDIA_DIR   (default: /var/www/sfparagliding.com/media)
 */

import pg from 'pg';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// ─── Config ───────────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sfparagliding',
  password: process.env.DB_PASSWORD || '55rshKCXR7JaBfLXqgTyeluxAPhZdL',
  database: process.env.DB_NAME || 'sfparagliding',
};
const MEDIA_DIR = process.env.MEDIA_DIR || '/var/www/sfparagliding.com/media';
const SHOPIFY_STORE = 'flyaboveall.store';

// ─── CLI Args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const handle = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
};
const manufacturer = getArg('manufacturer') || null;
const categoryId = getArg('category-id') || null;

if (!handle) {
  console.error('Usage: node scripts/import-product.mjs <shopify-handle> [options]');
  console.error('');
  console.error('Options:');
  console.error('  --dry-run              Print what would be done without making changes');
  console.error('  --price <n>            Override base price (dollars)');
  console.error('  --custom-price <n>     Price for CUSTOM color option (dollars)');
  console.error('  --slug <slug>          Override product slug');
  console.error('  --sku <sku>            Override SKU');
  console.error('  --manufacturer <name>  Set manufacturer (e.g. "Ozone")');
  console.error('  --category-id <id>     Set category ID');
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Failed to parse JSON from ${url}`)); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { file.close(); fs.unlinkSync(dest); reject(e); });
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
  return types[ext] || 'image/jpeg';
}

// ─── Lexical JSON builders ────────────────────────────────────────────────────

function txt(t) {
  return { type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 };
}
function hdr(t) {
  return {
    type: 'tablecell',
    children: [{ type: 'paragraph', children: [txt(t)], direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '' }],
    direction: 'ltr', format: '', indent: 0, version: 1, headerState: 1,
  };
}
function cell(t) {
  return {
    type: 'tablecell',
    children: [{ type: 'paragraph', children: [txt(t)], direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '' }],
    direction: 'ltr', format: '', indent: 0, version: 1, headerState: 0,
  };
}
function tableRow(cells) { return { type: 'tablerow', children: cells, direction: 'ltr', format: '', indent: 0, version: 1 }; }
function lexTable(rows) { return { type: 'table', children: rows, direction: 'ltr', format: '', indent: 0, version: 1 }; }
function lexDoc(blocks) {
  return JSON.stringify({ root: { type: 'root', children: blocks, direction: 'ltr', format: '', indent: 0, version: 1 } });
}
function p(text) {
  return {
    type: 'paragraph',
    children: [txt(text)],
    direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
  };
}
function heading(text, tag = 'h3') {
  return {
    type: 'heading', tag,
    children: [txt(text)],
    direction: 'ltr', format: '', indent: 0, version: 1,
  };
}
function ul(items) {
  return {
    type: 'list', listType: 'bullet', tag: 'ul',
    children: items.map((text) => ({
      type: 'listitem',
      children: [txt(text)],
      direction: 'ltr', format: '', indent: 0, version: 1, value: 1,
    })),
    direction: 'ltr', format: '', indent: 0, start: 1, version: 1,
  };
}

/**
 * Build a sizing chart from HTML table data.
 * @param {string[][]} tableData - Array of rows, each row is array of cell strings
 */
function buildSizingChart(tableData) {
  if (!tableData || tableData.length < 2) return null;
  const headerRow = tableRow(tableData[0].map((h) => hdr(h)));
  const bodyRows = tableData.slice(1).map((r) =>
    tableRow(r.map((c, i) => (i === 0 ? hdr(c) : cell(c))))
  );
  return lexDoc([lexTable([headerRow, ...bodyRows])]);
}

/**
 * Parse HTML body for table data.
 */
function parseTablesFromHtml(html) {
  if (!html) return [];
  const tables = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi) || [];
  return tables.map((t) => {
    const rows = t.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    return rows.map((row) => {
      const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
      return cells.map((c) => c.replace(/<[^>]*>/g, '').trim());
    });
  });
}

/**
 * Extract sizes, colors, and variants from Shopify product data.
 */
function extractVariants(product) {
  const sizes = [];
  const colors = [];
  const seenSizes = new Set();
  const seenColors = new Set();

  for (const variant of product.variants || []) {
    if (variant.option1 && !seenSizes.has(variant.option1)) {
      seenSizes.add(variant.option1);
      sizes.push({ label: variant.option1, value: slugify(variant.option1) });
    }
    if (variant.option2 && !seenColors.has(variant.option2)) {
      seenColors.add(variant.option2);
      const isCustom = variant.option2.toUpperCase() === 'CUSTOM';
      colors.push({
        label: variant.option2,
        value: slugify(variant.option2),
        priceModifier: isCustom ? parseFloat(variant.price) : null,
      });
    }
  }

  return { sizes, colors };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📦 Importing product: ${handle}`);
  console.log(`   Dry run: ${dryRun ? 'YES' : 'no'}\n`);

  // 1. Fetch product from Shopify
  console.log('1. Fetching product data from Shopify...');
  let shopifyProduct;
  try {
    const data = await fetchJson(`https://${SHOPIFY_STORE}/products/${handle}.json`);
    shopifyProduct = data.product;
    console.log(`   ✓ Found: ${shopifyProduct.title}`);
    console.log(`   ✓ Images: ${shopifyProduct.images.length}`);
    console.log(`   ✓ Variants: ${shopifyProduct.variants.length}`);
  } catch (e) {
    console.error(`   ✗ Failed to fetch product: ${e.message}`);
    console.error(`   Try: https://${SHOPIFY_STORE}/products/${handle}.json`);
    process.exit(1);
  }

  // 2. Extract product data
  const productName = shopifyProduct.title;
  const productSlug = getArg('slug') || slugify(productName);
  const productSku = getArg('sku') || `${slugify(shopifyProduct.vendor)}-${slugify(productName)}`.toUpperCase().slice(0, 15);
  const basePrice = getArg('price') ? parseFloat(getArg('price')) : parseFloat(shopifyProduct.variants[0]?.price || 0);
  const { sizes, colors } = extractVariants(shopifyProduct);

  // Handle custom price override
  const customPrice = getArg('custom-price');
  if (customPrice) {
    const customColor = colors.find((c) => c.value === 'custom');
    if (customColor) customColor.priceModifier = parseFloat(customPrice);
  }

  // 3. Parse sizing chart from body HTML
  const tables = parseTablesFromHtml(shopifyProduct.body_html);
  const sizingChartData = tables.length > 0 ? tables[tables.length - 1] : null;
  const sizingChart = buildSizingChart(sizingChartData);

  console.log(`\n   Product: ${productName}`);
  console.log(`   Slug: ${productSlug}`);
  console.log(`   SKU: ${productSku}`);
  console.log(`   Price: $${basePrice}`);
  console.log(`   Sizes: ${sizes.map((s) => s.label).join(', ') || 'none'}`);
  console.log(`   Colors: ${colors.map((c) => c.label + (c.priceModifier ? ` ($${c.priceModifier})` : '')).join(', ') || 'none'}`);
  console.log(`   Sizing chart: ${sizingChart ? 'yes' : 'no'}`);
  console.log(`   Manufacturer: ${manufacturer || 'none'}`);
  console.log(`   Category ID: ${categoryId || 'none'}`);
  console.log(`   Images: ${shopifyProduct.images.length}`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN — no changes made.\n');
    shopifyProduct.images.forEach((img, i) => {
      const ext = path.extname(new URL(img.src).pathname) || '.jpg';
      console.log(`   Image ${i + 1}: ${productSlug}${i > 0 ? `-${i + 1}` : ''}${ext}`);
    });
    return;
  }

  // 4. Connect to database
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // 5. Get next IDs
    const { rows: [{ max: maxMediaId }] } = await client.query('SELECT COALESCE(MAX(id), 0) as max FROM media');
    const { rows: [{ max: maxProductId }] } = await client.query('SELECT COALESCE(MAX(id), 0) as max FROM products');
    let nextMediaId = parseInt(maxMediaId) + 1;
    const productId = parseInt(maxProductId) + 1;

    // 6. Check slug doesn't already exist
    const { rows: existing } = await client.query('SELECT id FROM products WHERE slug = $1', [productSlug]);
    if (existing.length > 0) {
      console.error(`\n   ✗ Product with slug "${productSlug}" already exists (id=${existing[0].id}). Skipping.`);
      return;
    }

    // 7. Download images and create media records
    console.log('\n2. Downloading images...');
    const mediaIds = [];
    for (let i = 0; i < shopifyProduct.images.length; i++) {
      const img = shopifyProduct.images[i];
      const srcUrl = new URL(img.src);
      const ext = path.extname(srcUrl.pathname) || '.jpg';
      const filename = `${productSlug}${i > 0 ? `-${i + 1}` : ''}${ext}`;
      const filePath = path.join(MEDIA_DIR, filename);
      const mimeType = getMimeType(filename);
      const mediaId = nextMediaId++;

      // Download
      console.log(`   Downloading: ${filename}...`);
      await downloadFile(img.src, filePath);
      const stats = fs.statSync(filePath);

      // Create media record
      await client.query(
        `INSERT INTO media (id, filename, mime_type, filesize, width, height, alt, url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [mediaId, filename, mimeType, stats.size, img.width || 1000, img.height || 667,
         `${productName} ${i > 0 ? `image ${i + 1}` : ''}`.trim(), `/api/media/file/${filename}`]
      );
      mediaIds.push(mediaId);
      console.log(`   ✓ Media #${mediaId}: ${filename} (${(stats.size / 1024).toFixed(0)} KB)`);
    }

    // 8. Create description (placeholder — you should rewrite this)
    const description = lexDoc([
      p(`${productName} — imported from ${SHOPIFY_STORE}. Description pending.`),
      heading('Key Features'),
      p('Product details coming soon.'),
    ]);

    // 9. Create product
    console.log('\n3. Creating product...');
    await client.query(
      `INSERT INTO products (id, name, slug, price, sku, inventory, description, status, sizing_chart, manufacturer, category_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 10, $6::jsonb, 'active', $7::jsonb, $8, $9, NOW(), NOW())`,
      [productId, productName, productSlug, basePrice, productSku, description, sizingChart, manufacturer, categoryId ? parseInt(categoryId) : null]
    );
    console.log(`   ✓ Product #${productId}: ${productName}`);

    // 10. Link images
    for (let i = 0; i < mediaIds.length; i++) {
      await client.query(
        `INSERT INTO products_images (id, _order, _parent_id, image_id) VALUES ($1, $2, $3, $4)`,
        [`img_${productId}_${i + 1}`, i + 1, productId, mediaIds[i]]
      );
    }
    console.log(`   ✓ Linked ${mediaIds.length} images`);

    // 11. Create sizes
    for (let i = 0; i < sizes.length; i++) {
      await client.query(
        `INSERT INTO products_sizes (id, _order, _parent_id, label, value) VALUES ($1, $2, $3, $4, $5)`,
        [`sz_${productId}_${i + 1}`, i + 1, productId, sizes[i].label, sizes[i].value]
      );
    }
    if (sizes.length) console.log(`   ✓ Added ${sizes.length} sizes`);

    // 12. Create colors
    for (let i = 0; i < colors.length; i++) {
      await client.query(
        `INSERT INTO products_colors (id, _order, _parent_id, label, value, price_modifier) VALUES ($1, $2, $3, $4, $5, $6)`,
        [`cl_${productId}_${i + 1}`, i + 1, productId, colors[i].label, colors[i].value, colors[i].priceModifier]
      );
    }
    if (colors.length) console.log(`   ✓ Added ${colors.length} colors`);

    // 13. Update sequences
    await client.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
    await client.query(`SELECT setval('media_id_seq', (SELECT MAX(id) FROM media))`);

    console.log(`\n✅ Successfully imported: ${productName}`);
    console.log(`   URL: https://sfparagliding.com/products/${productSlug}`);
    console.log(`   Admin: https://sfparagliding.com/admin/collections/products/${productId}`);
    console.log(`\n⚠️  Remember to rewrite the description in the admin panel!\n`);

  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`\n❌ Error: ${e.message}`);
  process.exit(1);
});
