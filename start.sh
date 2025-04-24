#!/bin/bash

# Increase the maximum number of open files for this session
ulimit -S -n 2048

# Clear watchman watches and state
watchman watch-del-all

# Clear Metro bundler cache
rm -rf $TMPDIR/metro-*
rm -rf node_modules/.cache/babel-loader/*

# Start Expo with limited workers
REACT_NATIVE_MAX_WORKERS=2 npx expo start --clear

# Or use this alternative if you're still having issues
# REACT_NATIVE_MAX_WORKERS=1 npx expo start --no-dev --minify 