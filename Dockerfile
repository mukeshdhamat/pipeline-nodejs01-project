# Extending image
FROM node:14.17.5

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install autoconf automake libtool nasm make pkg-config git apt-utils

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Versions
RUN npm -v
RUN node -v

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install -g nodemon
COPY . /usr/src/app/
# Port to listener
EXPOSE 5005


# Main command
CMD [ "npm", "start"]
