FROM node:21-alpine3.18

WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
RUN npx prisma generate
RUN npm run build


EXPOSE 3000
CMD ["node", "build/index.js"]

