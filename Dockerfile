FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

RUN npm install
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
