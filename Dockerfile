FROM node
WORKDIR /data
RUN npm install
COPY *.json .
COPY src src
RUN npm install
CMD bash
