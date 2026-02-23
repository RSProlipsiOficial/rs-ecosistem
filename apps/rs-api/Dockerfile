FROM node:20-alpine
WORKDIR /app
ENV PORT=5004
EXPOSE 5004
COPY package.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

