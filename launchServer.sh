#!/bin/bash

cd /home/josh/code/nvd/FloraView/
mongod --dbpath data/db > /dev/null &
node app.js
