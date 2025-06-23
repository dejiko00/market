#!/bin/bash
BUILD=$(docker build -q --build-context db=./db -t mssql:dev ./docker/.)
docker run --env-file ./.env -p 1437:1437 -d $BUILD
