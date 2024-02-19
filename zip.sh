#!/usr/bin/env bash
ts=$(date +%s)

zip -r tiny-go-link-$ts.zip css js images manifest.json popup.html
