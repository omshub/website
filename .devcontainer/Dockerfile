# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.234.0/containers/typescript-node/.devcontainer/base.Dockerfile

# Use the bullseye (Debian) image for compatibility with ARM/Apple Silicon.
ARG VARIANT="22-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt-get update && apt-get install -y \
  # Note: `openjdk-11-jdk` required for Firebase Emulators suite
  openjdk-11-jdk \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm via corepack (built into Node.js 16.9+)
RUN corepack enable && corepack prepare pnpm@latest --activate
