FROM node 

WORKDIR /apps/funsexbot

RUN apt-get update -y && apt-get install -y imagemagick librsvg2-bin librsvg2-2 librsvg2-dev 

COPY package.json .

RUN npm install

COPY . . 

CMD ["npm", "run", "start"]