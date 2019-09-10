#To build the docker file run: docker build -t odedlevy/kafka-simulator:latest .
FROM node:11-alpine

WORKDIR /var/src

COPY package.json .

RUN npm install

COPY . .

CMD ["node","index.js"]