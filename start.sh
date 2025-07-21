#!/bin/bash

while true; do
  node ./dist/main.js
  exit_code=$?

  if [ $exit_code -eq 10 ]; then
    echo "Updating bot..."
    git pull
    npm run build
    echo "Restarting..."
    continue
  else
    echo "Bot stopped with exit code $exit_code"
    break
  fi
done