#!/bin/bash

# Performs setup tasks _after_ the .devcontainer Docker container is created.

# Install Node dependencies.
sudo yarn install
sudo yarn build
