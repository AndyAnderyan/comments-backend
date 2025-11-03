#FROM ubuntu:latest
#LABEL authors="Anderyan"

#ENTRYPOINT ["top", "-b"]
# 1. З якого образу починаємо
FROM node:20-alpine

#2. Створюємо робочу директорію
WORKDIR /usr/src/app

#3. Копіюємо package.json та встановлюємо залежності
COPY package*.json ./
RUN npm install

#4. Копіюємо решту коду
COPY . .

#5. Збираємо TypeScript в JavaScript
RUN npm run build

#6. Вказуємо команду для запуску
CMD ["node", "dist/main"]
