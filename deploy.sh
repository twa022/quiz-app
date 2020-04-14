#!/bin/bash

# Delete and create a new gh-pages branch
git branch -d gh-pages
git checkout -b gh-pages || exit 1

# Minify the javascript file
sed -e '/console.log/d' main.js | minify --mime 'text/javascript' -o main.js

# Minify css and json files
find . -mindepth 1 -maxdepth 2 -type f -name "*.css" -not -name "*.min.css" -exec minify '{}' -o '{}' \;
find . -mindepth 1 -maxdepth 2 -type f -name "*.json" -not -name "*.min.json" -exec minify '{}' -o '{}' \;

# Remove the script from the deployed app
git rm deploy.sh

git add .
git commit -m "Deploy from commit $( git rev-parse HEAD )"
# Force the push onto gh-pages 
git push --set-upstream origin gh-pages -f

exit 0
