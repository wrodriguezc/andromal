FROM node:10

LABEL maintainer="wrodriguezc@ucenfotec.ac.cr"

# Create app directory
WORKDIR /opt/andromal

# Install app dependencies
COPY package*.json ./

#Install packages
RUN npm install

#Copy app to image
COPY bin bin
COPY www www
COPY index.js .

#Setup SSH access
RUN mkdir --mode=700 /root/.ssh
COPY id_rsa /root/.ssh/
RUN chmod 600 /root/.ssh/id_rsa

#SETUP .ssh/config
RUN echo "Host *" >> /root/.ssh/config
RUN echo "StrictHostKeyChecking no" >> /root/.ssh/config
RUN echo "LogLevel ERROR" >> /root/.ssh/config
RUN echo "UserKnownHostsFile /dev/null" >> /root/.ssh/config

EXPOSE 8080
CMD [ "node", "index.js" ]