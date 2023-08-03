#!/bin/bash

# Performs setup tasks _after_ the .devcontainer Docker container is created.

# Change from readonly access in workspace
sudo chmod -R 777 .

# Install Node dependencies.
sudo yarn install
sudo yarn build

# Install Firebase CLI
sudo npm install -g firebase-tools