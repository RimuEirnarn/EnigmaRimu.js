#!/bin/sh

npx esbuild --minify --bundle --platform=neutral --outfile=build/min-EnigmaRimu.mjs --out-extension:.js=.mjs src/index.mjs
