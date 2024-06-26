#!/bin/sh

BUILD="build"
SPLIT="$BUILD/EnigmaRimu"
MINSPLIT="$BUILD/min.EnigmaRimu"
MAIN="EnigmaRimu.mjs"
method="$1"
name="$2"
ARGS="--platform=neutral --out-extension:.js=.mjs --outbase=src/ --sourcemap"

build(){
    
    if [ "$name" = "split" ]; then
        BUILD_ARGS="--outdir=$SPLIT"
    else
        fname="$(basename $1)"
        if [ "$fname" = "index.mjs" ] && [ ! "$name" = "split" ]; then
            fname="$MAIN"
        fi
        BUILD_ARGS="--analyze=verbose --bundle --outfile=$BUILD/$fname"
    fi
    npx esbuild $ARGS $BUILD_ARGS "$@"
}

compile(){
        if [ "$name" = "split" ]; then
        BUILD_ARGS="--outdir=$MINSPLIT"
    else
        fname="$(basename $1)"
        if [ "$fname" = "index.mjs" ] && [ ! "$name" = "split" ]; then
            fname="$MAIN"
        fi

        BUILD_ARGS="--analyze=verbose --bundle --outfile=$BUILD/min.$fname"
    fi

    npx esbuild --minify $ARGS $BUILD_ARGS "$@"
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
    [ ! -d "$MINSPLIT" ] && mkdir "$MINSPLIT"
    #for i in src/*; do
    #    filename="$(basename $i)"
    #    if [ "$filename" = "index.mjs" ]; then
    #        continue
    #    fi
    #    do_which "$i"
    #done
    do_which "src/*"
fi
