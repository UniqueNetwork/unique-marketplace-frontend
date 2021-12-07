FROM node:lts

EXPOSE 3000
WORKDIR /
COPY . .
RUN yarn install
ENV NODE_ENV = production
RUN yarn build

CMD ["yarn", "start"]
