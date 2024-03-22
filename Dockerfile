FROM node
EXPOSE 3000
RUN mkdir -m 777 -p /home/node/huddle
WORKDIR /home/node/huddle
ENTRYPOINT npm i && npm start