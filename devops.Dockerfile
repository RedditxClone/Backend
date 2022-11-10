FROM node:18.12.0

WORKDIR /app

COPY . .

RUN npm i -g @nestjs/cli@9.1.4

RUN npm install

EXPOSE 3000

CMD "npm" "run" "start"
