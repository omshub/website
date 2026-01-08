#!/bin/bash

# Performs setup tasks _after_ the .devcontainer Docker container is created.

GITCONFIG_VOLUME="/root/.gitconfig-volume"
GITCONFIG_PERSISTED="$GITCONFIG_VOLUME/gitconfig"

# Ensure volume directory exists (Docker creates it but just in case)
mkdir -p "$GITCONFIG_VOLUME"

# Restore persisted git config if it exists
if [ -f "$GITCONFIG_PERSISTED" ]; then
  cp "$GITCONFIG_PERSISTED" /root/.gitconfig
fi

# Configure git user from environment variables (if set, overrides persisted)
if [ -n "$GIT_AUTHOR_NAME" ]; then
  git config --global user.name "$GIT_AUTHOR_NAME"
fi
if [ -n "$GIT_AUTHOR_EMAIL" ]; then
  git config --global user.email "$GIT_AUTHOR_EMAIL"
fi

# Function to persist git config (called when user sets up git)
persist_gitconfig() {
  if [ -f /root/.gitconfig ]; then
    cp /root/.gitconfig "$GITCONFIG_PERSISTED"
  fi
}

# Create helper script for persisting git config
cat > /usr/local/bin/save-gitconfig << 'EOF'
#!/bin/bash
cp /root/.gitconfig /root/.gitconfig-volume/gitconfig
echo "Git config saved! It will persist across container rebuilds."
EOF
chmod +x /usr/local/bin/save-gitconfig

# Check if git user is configured, prompt if not
if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
  echo ""
  echo "=========================================="
  echo "Git user not configured!"
  echo "Run these commands to set up git:"
  echo "  git config --global user.name \"Your Name\""
  echo "  git config --global user.email \"your.email@example.com\""
  echo "  save-gitconfig  # Persist across rebuilds"
  echo "=========================================="
  echo ""
else
  # Auto-persist if config exists but volume doesn't have it
  if [ ! -f "$GITCONFIG_PERSISTED" ]; then
    persist_gitconfig
  fi
fi

# Install Node dependencies using pnpm.
pnpm install
pnpm build

# Install Firebase CLI
sudo npm install -g firebase-tools