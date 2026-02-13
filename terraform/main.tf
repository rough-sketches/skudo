terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.40.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable necessary APIs
resource "google_project_service" "cloudrun" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild" {
  service            = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Artifact Registry Repo
resource "google_artifact_registry_repository" "repo" {
  location               = var.region
  repository_id          = "skudo-repo"
  description            = "Docker repository for Skudo App"
  format                 = "DOCKER"
  depends_on             = [google_project_service.artifactregistry]
  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      package_name_prefixes = ["skudo-app"]
      keep_count            = 5
    }
  }
}

# Cloud Run Service
resource "google_cloud_run_service" "default" {
  name     = "skudo-app"
  location = var.region

  template {
    spec {
      containers {
        image = "us-docker.pkg.dev/cloudrun/container/hello"
        env {
          name  = "NEXT_PUBLIC_YOUTUBE_API_KEY"
          value = var.youtube_api_key
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_API_KEY"
          value = var.firebase_api_key
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
          value = var.firebase_auth_domain
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
          value = var.firebase_project_id
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
          value = var.firebase_storage_bucket
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
          value = var.firebase_messaging_sender_id
        }
        env {
          name  = "NEXT_PUBLIC_FIREBASE_APP_ID"
          value = var.firebase_app_id
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
    ]
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.cloudrun]
}

# Allow unauthenticated access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.default.location
  project     = google_cloud_run_service.default.project
  service     = google_cloud_run_service.default.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

# NOTE: Cloud Build Trigger is managed via gcloud CLI (not Terraform)
# because the GitHub connection requires OAuth which Terraform can't handle easily.
# To create/update the trigger, run the setup-trigger.sh script.
