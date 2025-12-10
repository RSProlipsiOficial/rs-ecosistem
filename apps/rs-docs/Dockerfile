FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build || true
RUN npm i -g serve
ENV PORT=3010
CMD ["sh","-c","if [ -f dist/index.html ] || [ -f index.html ] || [ -f vite.config.ts ] || [ -f vite.config.js ]; then exec serve -s dist -l ${PORT}; else exec npm run start; fi"]