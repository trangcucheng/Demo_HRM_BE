#!/bin/sh
# docker-compose down
git pull
docker-compose -f docker-compose-project-only.yml up -d --build