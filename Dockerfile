FROM node:16

WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
RUN npm install -g npm@latest
RUN npm install -g nodemon@latest
RUN npm install
CMD [ "npm", "start" ]
