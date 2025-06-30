#!/bin/bash
CONTAINER_NAME=market-mssql
# docker container ls -f name=$CONTAINER_NAME -q
docker container rm -f $CONTAINER_NAME
echo "~~~"
echo "...They're gone. (´• ω •)"