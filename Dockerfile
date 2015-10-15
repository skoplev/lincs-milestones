FROM library/node:0.10

RUN apt-get update && apt-get install -y npm git

ENV SOURCE_DIR /home
WORKDIR $SOURCE_DIR

EXPOSE 8081

COPY package.json $SOURCE_DIR/
COPY bower.json $SOURCE_DIR/
COPY .bowerrc $SOURCE_DIR/

RUN npm install --production \
	&& npm install -g bower \
	&& bower -F install --allow-root

COPY *.js $SOURCE_DIR/
COPY routes $SOURCE_DIR/routes
COPY public $SOURCE_DIR/public
COPY views $SOURCE_DIR/views

CMD node app.js

