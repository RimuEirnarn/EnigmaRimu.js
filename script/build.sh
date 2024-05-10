#!/bin/sh

npx esbuild --bundle --platform=neutral --outfile=build/EnigmaRimu.mjs --out-extension:.js=.mjs src/index.mjs --external:jquery --external:strftime
