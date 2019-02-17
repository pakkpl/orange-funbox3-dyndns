FROM node:lts-jessie-slim

WORKDIR /usr/src/app

COPY ./src/package.json ./
COPY ./src/package-lock.json ./

RUN npm install

COPY ./src/config/sample-config.json ./config/

VOLUME /usr/src/app/config

COPY ./src/funbox.js ./
COPY ./src/app.js ./

CMD [ "npm", "start" ]
