#!/bin/bash


# Minify the javascript and CSS files
sed -e '/console.log/d' -e 's:=[\ ]*quizzes.json:= quizzes.min.json:' main.js | minify --mime 'text/javascript' -o main.min.js
minify main.css -o main.min.css

# Use the minified versios.
sed -i -e 's:link href="main.css":link href="main.min.css":' \
       -e 's:<script src="main.js"></script>:<script src="main.min.js"></script>:' index.html

for file in `find . -mindepth 2 -maxdepth 2 -type f -name "*.css" -not -name "*.min.css"` ; do
	minify "$file" -o "${file/\.css/.min.css}"
done

for file in `find . -mindepth 2 -maxdepth 2 -type f -name "*.json" -not -name "*.min.json"` ; do
	minify "$file" -o "${file/\.json/.min.json}"
done

sed -e 's:\("theme"\:.*\)\.css:\1.min.css:' \
    -e 's:\("quiz"\:.*\)\.json:\1.min.json:' quizzes.json | minify --mime 'text/json' -o quizzes.min.json

git stash
git branch gh-pages
git checkout gh-pages
git stash pop

git rm main.{js,css}
git rm quizzes.json
find . -mindepth 2 -maxdepth 2 -type f -name "*.css" -not -name "*.min.css" -exec git rm '{}' \;
find . -mindepth 2 -maxdepth 2 -type f -name "*.json" -not -name "*.min.json" -exec git rm '{}' \;

git rm deploy.sh
git rm reset.sh

exit 0
