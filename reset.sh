#!/bin/bash

find . -type f -name "*.min.*" -exec rm '{}' \;

sed -i -e 's:link href="main.min.css":link href="main.css":' \
       -e 's:<script src="main.min.js"></script>:<script src="main.js"></script>:' index.html
