# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.234.0/containers/typescript-node/.devcontainer/base.Dockerfile

# Use the bullseye (Debian) image for compatibility with ARM/Apple Silicon.
ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN apt-get update && apt-get install -y openjdk-11-jdk \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
