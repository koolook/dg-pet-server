# About

This is my personal express.js + Mongodb + Mongoose study.
You can find the client side of this project in https://github.com/koolook/dg-pet-client 

# How to run

Before you run the server set up the following environment variables

 - HOST_JWT_SECRET - secret word for JWT operations
 - HOST_DB_CONNECT - your Mongodb connection string. For the local db in this docker container use `mongodb://mongodb:27017/`  

Use
```
> docker compose watch
``` 
to run server and DB in Docker container.
