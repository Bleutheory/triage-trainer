#!/usr/bin/env ts-node
/**
 * split‑injury‑profiles.ts
 * Automatically populate per‑cause profile stubs in src/data based on
 * injuryKeysByCause and the original injuryProfiles object.
 *
 * Run with: npx ts‑node split‑injury‑profiles.ts
 */

import fs from 'fs';
import path from 'path';
// Directly import your existing TS data
import { injuryKeysByCause, injuryProfiles as allProfiles } from './src/data/injuryProfiles';

const DATA_DIR = path.resolve(__dirname, 'src', 'data');

function populateCategory(cause: string, keys: string[]) {
  const filePath = path.join(DATA_DIR, `${cause}.ts`);
  const entries = keys
    .filter(key => allProfiles[key])
    .map(key => {
      const profile = allProfiles[key];
      // Serialize, preserving functions as strings
      let code = JSON.stringify(profile, (k, v) => typeof v === 'function' ? v.toString() : v, 2);
      // Convert quoted function-strings back into real code
      code = code.replace(/"(function\s*\([^)]*\)\s*\{[^}]*\})"/g, (_, fn) => fn);
      return `  "${key}": ${code}`;
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

// Ensure the data folder exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// For each cause in your keys map, populate its file
Object.entries(injuryKeysByCause).forEach(([cause, keys]) => populateCategory(cause, keys as string[]));

// Finally, write the combined index.ts
writeIndex();