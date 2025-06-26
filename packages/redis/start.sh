docker build -t market-redis:dev ./redis/.
docker run --name market-redis -p 6379:6379 -v ./redis/data:/data -d market-redis:dev --save 60 1 --loglevel warning