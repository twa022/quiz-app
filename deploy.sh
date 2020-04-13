#!/bin/bash



sed -e '/console.log/d' -e 's:=[\ ]*quizzes.json:= quizzes.min.json:' main.js | minify --mime 'text/javascript' -o main.min.js
minify main.css -o main.min.css

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

exit 0
