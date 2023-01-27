FROM node:alpine

RUN apk update && \
    mkdir -p /usr/app/API-GETSKILLS && \
    cd /usr/app/API-GETSKILLS

WORKDIR /usr/app/API-GETSKILLS
COPY . /usr/app/API-GETSKILLS/
EXPOSE 3003:3003

CMD ["npm", "run", "dev"]