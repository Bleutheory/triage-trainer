#!/usr/bin/env node
/**
 * split-injury-profiles.js
 * Pure JS splitter: requires the built JS data module.
 */

const fs = require('fs');
const path = require('path');

// Require the compiled JS version of your data
const { injuryKeysByCause, injuryProfiles } = require('./src/data/js/injuryProfiles');

const DATA_DIR = path.resolve(__dirname, 'src', 'data');

function populateCategory(cause) {
  const keys = injuryKeysByCause[cause] || [];
  const filePath = path.join(DATA_DIR, `${cause}.ts`);
  const entries = keys
    .filter(key => injuryProfiles[key])
    .map(key => {
      const profile = injuryProfiles[key];
      // Build object code manually, preserving functions
      const propLines = Object.entries(profile).map(([prop, val]) => {
        let valCode;
        if (typeof val === 'function') {
          valCode = val.toString();
        } else {
          valCode = JSON.stringify(val, null, 2);
        }
        return `    "${prop}": ${valCode}`;
      });
      const objCode = `{\n${propLines.join(',\n')}\n  }`;
      return `  "${key}": ${objCode}`;
    })
    .join(',\n');

  const content = `import { InjuryProfile } from '../types';

const ${cause}: Record<string, InjuryProfile> = {
${entries}
};

export default ${cause};
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Populated ${cause}.ts with ${keys.length} entries.`);
}

function writeIndex() {
  const indexPath = path.join(DATA_DIR, 'index.ts');
  const content = `import ballistic from './ballistic';
import blast from './blast';
import burns from './burns';
import crush from './crush';
import environmental from './environmental';
import penetrating from './penetrating';
import other from './other';
import { InjuryProfile } from '../types';

const injuryProfiles: Record<string, InjuryProfile> = {
  ...ballistic,
  ...blast,
  ...burns,
  ...crush,
  ...environmental,
  ...penetrating,
  ...other,
};

export default injuryProfiles;
`;
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Created index.ts merging all categories.');
}

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Populate each category based on the keys map
Object.keys(injuryKeysByCause).forEach(populateCategory);

// Finally, write the combined index file
writeIndex();