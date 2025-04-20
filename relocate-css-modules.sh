#!/usr/bin/env bash
# relocate-css-modules.sh
# For every component file in src/components, create a corresponding module CSS file,
# and move both the component file and its CSS file into a same-named subfolder.

set -e
shopt -s nullglob

COMPONENTS_DIR="src/components"

for src_file in "$COMPONENTS_DIR"/*.{tsx,ts,js}; do
  # Derive component name and directory
  filename=$(basename "$src_file")
  comp_name="${filename%.*}"
  comp_dir="$COMPONENTS_DIR/$comp_name"

  # Create the component folder
  mkdir -p "$comp_dir"

  # Move the source file into the component folder
  mv "$src_file" "$comp_dir/$filename"

  # Create a CSS module file if it doesn't exist
  css_file="$comp_dir/$comp_name.module.css"
  if [ ! -f "$css_file" ]; then
    cat > "$css_file" <<EOF
/* Styles for ${comp_name} component */
EOF
  fi

  # If it's a TSX or TS file, prepend a CSS import if not present
  ext="${filename##*.}"
  if [[ "$ext" == "tsx" || "$ext" == "ts" ]]; then
    target="$comp_dir/$filename"
    if ! grep -q "module.css" "$target"; then
      # Insert the import after any React import or at top
      sed -i '' "1s|^|import styles from './${comp_name}.module.css';\n|" "$target"
    fi
  fi
done

echo "Relocated component files and created CSS modules."
 
# Scaffold per-category injury profile modules and index
DATA_DIR="src/data"
mkdir -p "$DATA_DIR"

# Define the causes
causes=(ballistic blast burns crush environmental penetrating other)

for cause in "${causes[@]}"; do
  file="$DATA_DIR/$cause.ts"
  if [ ! -f "$file" ]; then
    cat > "$file" <<EOF
import { InjuryProfile } from '../types';

/**
 * Profiles for $cause injuries.
 */
const $cause: Record<string, InjuryProfile> = {
  // TODO: copy entries from original injuryProfiles for keys in injuryKeysByCause.$cause
};

export default $cause;
EOF
  fi
done

# Create index.ts merging all categories
index_file="$DATA_DIR/index.ts"
if [ ! -f "$index_file" ]; then
  cat > "$index_file" <<EOF
import ballistic from './ballistic';
import blast from './blast';
import burns from './burns';
import crush from './crush';
import environmental from './environmental';
import penetrating from './penetrating';
import other from './other';
import { InjuryProfile } from '../types';

/**
 * Combined injuryProfiles object.
 */
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
EOF
fi