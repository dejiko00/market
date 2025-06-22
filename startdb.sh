#!/bin/bash
BUILD=$(docker build -q --build-context db=./db -t mssql:dev ./docker/.)
docker run --env-file ./.env -p 1234:1234 -d $BUILD
