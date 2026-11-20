FROM node:24.22.1-alpine

WORKDIR /studyApp

COPY package*.json .

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate     

COPY . .

CMD ["sh", "-c", "./node_modules/.bin/prisma db push && node src/server.js"]
