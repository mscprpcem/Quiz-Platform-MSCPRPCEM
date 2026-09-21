#!/usr/bin/env node
/**
 * Standalone script to delete all GitHub Actions artifacts for mscprpcem/Quiz-platform.
 *
 * Usage:
 *   node scripts/delete-github-artifacts.js <YOUR_GITHUB_PAT>
 * or:
 *   $env:GITHUB_TOKEN="ghp_xxxx"
 *   node scripts/delete-github-artifacts.js
 */

const https = require('https');

const OWNER = 'mscprpcem';
const REPO = 'Quiz-platform';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('\x1b[31mError: Missing GitHub Token.\x1b[0m');
  console.log('\nUsage:');
  console.log('  node scripts/delete-github-artifacts.js <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>');
  console.log('Or set the GITHUB_TOKEN environment variable.');
  process.exit(1);
}

function request(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'Artifact-Cleaner-Script',
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : null);
          } catch (e) {
            resolve(data);
          }
        } else if (res.statusCode === 204) {
          resolve(null);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log(`\x1b[36mQuerying artifacts for ${OWNER}/${REPO}...\x1b[0m`);
  let totalDeleted = 0;
  let page = 1;

  while (true) {
    try {
      const res = await request(`/repos/${OWNER}/${REPO}/actions/artifacts?per_page=100&page=${page}`);
      const artifacts = res.artifacts || [];

      if (artifacts.length === 0) {
        if (page === 1) {
          console.log('\x1b[32mNo artifacts found! Storage is already clean.\x1b[0m');
        }
        break;
      }

      console.log(`Found ${artifacts.length} artifacts on page ${page}. Deleting...`);

      for (const art of artifacts) {
        try {
          await request(`/repos/${OWNER}/${REPO}/actions/artifacts/${art.id}`, 'DELETE');
          const mb = (art.size_in_bytes / 1024 / 1024).toFixed(2);
          console.log(`\x1b[32m✓ Deleted:\x1b[0m ${art.name} (id: ${art.id}, size: ${mb} MB)`);
          totalDeleted++;
        } catch (err) {
          console.warn(`\x1b[33m! Failed to delete artifact ${art.id}: ${err.message}\x1b[0m`);
        }
      }

      if (artifacts.length < 100) break;
      page++;
    } catch (err) {
      console.error('\x1b[31mFailed to list artifacts:\x1b[0m', err.message);
      break;
    }
  }

  console.log(`\n\x1b[32mCleanup finished! Successfully deleted ${totalDeleted} artifacts.\x1b[0m`);
}

run();
