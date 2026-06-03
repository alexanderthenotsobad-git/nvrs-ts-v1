#!/bin/bash
set -e

PROJECT_ID="nvrs-platform-dev"
REGION="us-central1"
SERVICE_NAME="nvrs-frontend-dev"
IMAGE_TAG="us-central1-docker.pkg.dev/${PROJECT_ID}/nvrs-repo/nvrs-frontend:dev"
API_URL="https://ai.alexanderthenotsobad.us"

echo "🚀 Deploying to Google Cloud Run"
echo "📦 Service: ${SERVICE_NAME}"
echo "📦 API URL: ${API_URL}"
echo "🏷️  Image Tag: ${IMAGE_TAG}"
echo ""

# Step 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build \
  --no-cache \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  -f Dockerfile.gcr \
  -t "${IMAGE_TAG}" .

# Step 2: Push to Google Artifact Registry
echo "📤 Pushing to Google Artifact Registry..."
docker push "${IMAGE_TAG}"

# Step 3: Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_TAG}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --set-env-vars "NEXT_PUBLIC_API_URL=${API_URL}" \
  --allow-unauthenticated

# Step 4: Clean up Docker cache
echo "🧹 Cleaning up Docker disk cache..."
docker system prune -a --volumes -f

# Step 5: Get the deployed URL
echo ""
echo "✅ Deployment complete!"
DEPLOYED_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format='value(status.url)')
echo "🌐 Your app is live at: ${DEPLOYED_URL}"
echo ""
echo "📱 Test on your phone and verify that:"
echo "   1. The page loads without NetworkError"
echo "   2. Images appear correctly"
echo "   3. The menu tray works"
echo "   4. Network requests go to ${API_URL} (not localhost:3003)"