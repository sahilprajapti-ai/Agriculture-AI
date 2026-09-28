# AgriAI - AI Agriculture Problem Solver 🌾

AgriAI is a production-grade, AI-powered agricultural advisory platform designed to help farmers analyze crop diseases, pest infestations, irrigation schedules, and soil nutrient deficiencies.

---

## Architecture & Features

- **Multi-lingual AI Crop Diagnostics**: Multimodal analysis using Google Gemini models with intelligent fallback ladder (`gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-flash-latest`, `gemini-2.5-pro`) and localized expert fallback across English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
- **Interactive AI Assistant**: Real-time conversational guidance for practical crop management, irrigation, fertilizers, and pest mitigation.
- **Secure Authentication & Record Storage**: Passwordless/Google federated authentication and email credentials with session persistence and private crop history.
- **Multimodal Image Uploads**: Visual diagnostics supporting JPG, JPEG, PNG, and WEBP crop photos.

---

## 1. Prerequisites & GCP Setup

Enable the required Google Cloud APIs for Cloud Run, Secret Manager, and Firestore:

```bash
# Set your active GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable essential APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

---

## 2. Secret Management Setup

Create and configure operational credentials using Google Cloud Secret Manager (eliminating hardcoded secrets):

```bash
# Create and populate the Gemini API key secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Obtain your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant the default Cloud Run service account Secret Accessor role
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration

Deploy owner-bound security rules to ensure user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 4. Local Development

```bash
# Install dependencies
npm install

# Run the local development server (Port 3000)
npm run dev
```

---

## 5. Cloud Run Deployment Flow

Deploy the containerized service to Google Cloud Run with Secret Manager binding:

```bash
gcloud run deploy agriai-solver \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

---

## 6. Campaign Verification Binding

Register and verify the deployment for automated challenge tracking:

```bash
gcloud run services update agriai-solver \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```
