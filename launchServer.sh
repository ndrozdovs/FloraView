#!/bin/bash

# This script needs to run with sudo in order to open the db

cd /home/josh/code/nvd/FloraView/
mongod --dbpath data/db > /dev/null &
node app.js
