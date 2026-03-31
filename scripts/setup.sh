#!/bin/bash
# DataPeek Template Setup Script
# Usage: ./scripts/setup.sh <site-name> <domain> <entity-slug>
# Example: ./scripts/setup.sh pet-data petdatapeek.com pet

set -e

SITE_NAME=${1:-""}
DOMAIN=${2:-""}
ENTITY=${3:-"item"}

if [ -z "$SITE_NAME" ] || [ -z "$DOMAIN" ]; then
  echo "Usage: ./scripts/setup.sh <site-name> <domain> [entity-slug]"
  echo ""
  echo "Examples:"
  echo "  ./scripts/setup.sh pet-data petdatapeek.com pet"
  echo "  ./scripts/setup.sh weather-peek weatherpeek.com city"
  exit 1
fi

TARGET_DIR="/Users/jihoon/projects/$SITE_NAME"

if [ -d "$TARGET_DIR" ]; then
  echo "Error: Directory $TARGET_DIR already exists"
  exit 1
fi

echo "Creating new DataPeek site: $SITE_NAME"
echo "  Domain: $DOMAIN"
echo "  Entity: $ENTITY"
echo ""

# 1. Copy template
cp -r "$(dirname "$0")/.." "$TARGET_DIR"
rm -rf "$TARGET_DIR/.git" "$TARGET_DIR/node_modules" "$TARGET_DIR/.next"
echo "✓ Template copied to $TARGET_DIR"

# 2. Update site.config.ts
cd "$TARGET_DIR"
PASCAL_NAME=$(echo "$SITE_NAME" | sed -E 's/(^|-)([a-z])/\U\2/g')
sed -i '' "s/NewSitePeek/$PASCAL_NAME/g" site.config.ts
sed -i '' "s/newsitepeek.com/$DOMAIN/g" site.config.ts
sed -i '' "s/slug: 'item'/slug: '$ENTITY'/g" site.config.ts
sed -i '' "s/label: 'Items'/label: '${ENTITY}s'/g" site.config.ts
sed -i '' "s/labelSingular: 'Item'/labelSingular: '$ENTITY'/g" site.config.ts
echo "✓ site.config.ts updated"

# 3. Update package.json name
sed -i '' "s/datapeek-template/$SITE_NAME/" package.json
echo "✓ package.json updated"

# 4. Install dependencies
npm install --silent
echo "✓ Dependencies installed"

# 5. Git init
git init -q
git add -A
git commit -q -m "Initial commit from datapeek-template"
echo "✓ Git repository initialized"

echo ""
echo "========================================="
echo "  $PASCAL_NAME is ready!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. cd $TARGET_DIR"
echo "  2. Edit site.config.ts (gaId, description, colors, dataSource)"
echo "  3. Add your SQLite database to data/main.db"
echo "  4. Rename app/[entity] directory to app/[$ENTITY]"
echo "  5. npm run dev"
echo ""
echo "  Don't forget to:"
echo "  - Create GitHub repo and connect to Vercel"
echo "  - Update Google Analytics ID"
echo "  - Submit sitemap to Google Search Console"
