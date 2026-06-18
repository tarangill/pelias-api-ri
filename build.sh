#!/usr/bin/env bash
set -euo pipefail

GITHUB_USER="tarangill"
IMAGE_NAME="pelias-api-ri"
REGISTRY="ghcr.io/${GITHUB_USER}"

LOCAL=false

for arg in "$@"; do
  [[ "$arg" == "--local" ]] && LOCAL=true
done

PLATFORMS="linux/amd64"
BUILDER="multiplatform-builder"

# Ensure a buildx builder exists
if ! docker buildx inspect "$BUILDER" &>/dev/null; then
  docker buildx create --name "$BUILDER" --driver docker-container --bootstrap
fi
docker buildx use "$BUILDER"

echo "==> Building and pushing ${IMAGE_NAME}..."

docker buildx build \
  --platform "$PLATFORMS" \
  --tag "$REGISTRY/$IMAGE_NAME:1.0" \
  --push \
  .

echo "==> Done."