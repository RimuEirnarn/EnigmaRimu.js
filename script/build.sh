#!/bin/sh

BUILD="build"
SPLIT="$BUILD/EnigmaRimu"
MAIN="EnigmaRimu.mjs"
method="$1"
name="$2"

build(){
    fname="$(basename $1)"
    if [ "$fname" = "index.mjs" ] && [ ! "$name" = "split" ]; then
        fname="$MAIN"
    fi
    if [ "$name" = "split" ]; then
        ARGS="--outdir=$SPLIT"
    else
        ARGS="--bundle --outfile=$BUILD/$fname"
    fi
    npx esbuild --platform=neutral $ARGS --out-extension:.js=.mjs "$@"
}

compile(){
    fname="$(basename $1)"
    if [ "$fname" = "index.mjs" ] && [ ! "$name" = "split" ]; then
        fname="$MAIN"
    fi
    if [ "$name" = "split" ]; then
        ARGS="--outdir=$SPLIT"
    else
        ARGS="--bundle --outfile=$BUILD/min-$fname"
    fi

    npx esbuild --minify --platform=neutral $ARGS --out-extension:.js=.mjs "$@"
}

do_which(){
    if [ "$method" = "build" ]; then
        build "$1"
    elif [ "$method" = "compile" ]; then
        compile "$1"
    else
        echo "Unrecognized method: $method"
        exit 1
    fi

}

if [ ! "$name" = "split" ]; then
    do_which src/index.mjs
else
    [ ! -d "$SPLIT" ] && mkdir "$SPLIT"
    #for i in src/*; do
    #    filename="$(basename $i)"
    #    if [ "$filename" = "index.mjs" ]; then
    #        continue
    #    fi
    #    do_which "$i"
    #done
    do_which "src/*"
fi
