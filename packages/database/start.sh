#!/bin/bash
echo $(pwd)
CONTAINER_NAME=market-mssql
PORT=1437
BUILD=$(docker build -q -t $CONTAINER_NAME:dev .)

docker run --name $CONTAINER_NAME --env-file ../../.env -p $PORT:$PORT -d $(docker build -q -t $CONTAINER_NAME:dev .)