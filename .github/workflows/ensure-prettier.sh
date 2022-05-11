#!/usr/bin/env bash

# Runs 'yarn prettier' and examines the git diff to determine whether Prettier wrote
# any formatting changes. The script exits with an error code if changes are detected.
# This is used by the GitHub Actions 'lint-and-format' job.

set -euo pipefail

yarn prettier

if git status --porcelain | grep .; then
    echo "Changes detected; did you format your code with 'yarn prettier'?"
    exit 1;
fi;