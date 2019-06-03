FROM node:8.11-slim

RUN yarn global add nodemon

COPY . /app

WORKDIR /app


RUN yarn install --production=false --pure-lockfile

CMD ["yarn", "start"]
