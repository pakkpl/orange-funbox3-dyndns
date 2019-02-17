FROM node:lts-jessie-slim

WORKDIR /usr/src/app

COPY ./src/package.json ./src/package-lock.json ./
RUN npm install

COPY ./src/config/sample-config.json ./config/
COPY ./src/funbox.js ./src/app.js  ./

VOLUME /usr/src/app/config

CMD [ "npm", "start" ]
