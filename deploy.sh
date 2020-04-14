#!/bin/bash


# Minify the javascript and CSS files
sed -e '/console.log/d' main.js | minify --mime 'text/javascript' -o main.js

find . -mindepth 1 -maxdepth 2 -type f -name "*.css" -not -name "*.min.css" -exec minify '{}' -o '{}' \;
find . -mindepth 1 -maxdepth 2 -type f -name "*.json" -not -name "*.min.json" -exec minify '{}' -o '{}' \;

git stash
git branch gh-pages
git checkout gh-pages
git stash pop

git rm deploy.sh
git rm reset.sh

exit 0
