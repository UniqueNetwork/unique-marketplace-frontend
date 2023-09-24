FROM node:lts as builder
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build


FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/build /usr/share/nginx/html

COPY ./.docker/env.js /usr/share/nginx/html

COPY ./.docker/new-entrypoint.sh /new-entrypoint.sh
RUN chmod +x /new-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/new-entrypoint.sh"]
CMD ["nginx"]
