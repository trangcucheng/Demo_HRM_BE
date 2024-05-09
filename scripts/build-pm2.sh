#!/bin/env bash
set -o xtrace

git pull
npm run build
pm2 restart dsm-be
pm2 logs dsm-be
