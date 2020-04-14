#!/bin/bash

git branch -d gh-pages
git checkout -b gh-pages || exit 1

# Minify the javascript file
sed -e '/console.log/d' main.js | minify --mime 'text/javascript' -o main.js

find . -mindepth 1 -maxdepth 2 -type f -name "*.css" -not -name "*.min.css" -exec minify '{}' -o '{}' \;
find . -mindepth 1 -maxdepth 2 -type f -name "*.json" -not -name "*.min.json" -exec minify '{}' -o '{}' \;

git rm deploy.sh
git rm reset.sh

git push -f

exit 0
