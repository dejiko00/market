#!/bin/bash
CONTAINER_NAME=market-mssql
docker container kill $(docker container ls -f name=$CONTAINER_NAME -q) &&
docker container prune filter name=$CONTAINER_NAME
echo "~~~"
echo "...They're gone. (´• ω •)"