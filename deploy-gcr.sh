#!/bin/bash
set -e

PROJECT_ID="nvrs-platform-dev"
REGION="us-central1"
SERVICE_NAME="nvrs-frontend-dev"
IMAGE_TAG="us-central1-docker.pkg.dev/${PROJECT_ID}/nvrs-repo/nvrs-frontend:ai-v1"
API_URL="https://ai.alexanderthenotsobad.us"

echo "🚀 Deploying to Google Cloud Run"
echo "📦 Service: ${SERVICE_NAME}"
echo "📦 API URL: ${API_URL}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"

docker build \
  --no-cache \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  -f Dockerfile.gcr \
  -t "${IMAGE_TAG}" .

docker push "${IMAGE_TAG}"

gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_TAG}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --set-env-vars "NEXT_PUBLIC_API_URL=${API_URL}" \
  --allow-unauthenticated

docker system prune -a --volumes -f

echo "✅ Deployment complete!"