FROM postgres:15-bullseye
COPY ./docker-entrypoint-initdb.d/init-db.sh /docker-entrypoint-initdb.d/
