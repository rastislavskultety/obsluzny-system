FROM node:16

ENV CONFIG_FILE=config.docker.jsonc

# Install global tools
RUN npm install forever -g

# App folder
RUN mkdir -p /app
WORKDIR /app

# Install npm modules
COPY package.json /app/package.json
RUN npm install

# Build app
COPY . /app
RUN npm run build

# Run app with automatic restarts
CMD forever --minUptime 1000 --spinSleepTime 2000 dist/index.js
