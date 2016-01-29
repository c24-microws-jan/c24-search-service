# c24-search-service

[![Build Status](https://travis-ci.org/c24-microws-jan/c24-search-service.svg)](https://travis-ci.org/c24-microws-jan/c24-search-service)
[![Dependencies](https://david-dm.org/c24-microws-jan/c24-search-service.svg)](https://david-dm.org/badges/shields)

CD search microservice

## Get cds

~~~ sh
GET /cd[/?query={query}&limit={limit}&offset={offset}]
~~~

## Get specific cd

~~~ sh
GET /cd/{id}
~~~

## Get most recent cds

~~~ sh
GET /cd/most_recent[/?limit={limit}&offset={offset}]
~~~


## Run it on your local node.js installation

* Run `npm install` inside the root folder to restore all packages
* Run the service with `node index.js` (or `npm start`)
* Browse to [http://localhost:3000/](http://localhost:3000/) to see the output

## Build the Docker container

~~~ sh
docker build -t c24-search-service .
~~~

## Run the Docker container locally

~~~ sh
docker run -it -p 3000:3000 c24-search-service
~~~

## Push the Docker container into the private registry

~~~ sh
docker tag c24-search-service 46.101.193.82:5000/c24-search-service:1.0.0
docker push 46.101.193.82:5000/c24-search-service:1.0.0
~~~
