FROM node:lts-jessie-slim

WORKDIR /usr/src/app

RUN mkdir config

COPY ./src/package.json ./src/package-lock.json ./
RUN npm install

COPY ./src/funbox.js ./src/app.js ./src/sample-config.json  ./

VOLUME /usr/src/app/config

CMD [ "npm", "start" ]
