FROM node:16

RUN mkdir -p /app
WORKDIR /app

# Install npm modules
COPY package.json /app/package.json
RUN npm install

COPY . /app
RUN npm run generate

FROM nginx
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
