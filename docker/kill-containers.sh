#!/bin/bash
docker container stop $(docker ps -q) &&
docker container prune -f
echo "~~~"
echo "...They're gone. (´• ω •)"