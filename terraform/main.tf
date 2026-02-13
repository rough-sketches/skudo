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
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Artifact Registry Repo
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "skudo-repo"
  description   = "Docker repository for Skudo App"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifactregistry]
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
        image = "${var.region}-docker.pkg.dev/${var.project_id}/skudo-repo/skudo-app:latest"
        env {
          name = "NEXT_PUBLIC_YOUTUBE_API_KEY"
          value = var.youtube_api_key
        }
        env {
          name = "NEXT_PUBLIC_FIREBASE_API_KEY"
          value = var.firebase_api_key
        }
        env {
          name = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
          value = var.firebase_auth_domain
        }
        env {
          name = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
          value = var.firebase_project_id
        }
        env {
          name = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
          value = var.firebase_storage_bucket
        }
         env {
          name = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
          value = var.firebase_messaging_sender_id
        }
        env {
          name = "NEXT_PUBLIC_FIREBASE_APP_ID"
          value = var.firebase_app_id
        }
      }
    }
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

# Cloud Build Trigger
resource "google_cloudbuild_trigger" "push_trigger" {
  name = "skudo-push-trigger"
  
  github {
    owner = var.repo_owner
    name  = var.repo_name
    push {
      branch = "^main$"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "--build-arg=NEXT_PUBLIC_FIREBASE_API_KEY=${var.firebase_api_key}",
        "--build-arg=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${var.firebase_auth_domain}",
        "--build-arg=NEXT_PUBLIC_FIREBASE_PROJECT_ID=${var.firebase_project_id}",
        "--build-arg=NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${var.firebase_storage_bucket}",
        "--build-arg=NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${var.firebase_messaging_sender_id}",
        "--build-arg=NEXT_PUBLIC_FIREBASE_APP_ID=${var.firebase_app_id}",
        "--build-arg=NEXT_PUBLIC_YOUTUBE_API_KEY=${var.youtube_api_key}",
        "-t", "${var.region}-docker.pkg.dev/${var.project_id}/skudo-repo/skudo-app:latest",
        "."
      ]
    }
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["push", "${var.region}-docker.pkg.dev/${var.project_id}/skudo-repo/skudo-app:latest"]
    }
    step {
      name = "gcr.io/google.com/cloudsdktool/cloud-sdk"
      entrypoint = "gcloud"
      args = ["run", "deploy", "skudo-app", "--image", "${var.region}-docker.pkg.dev/${var.project_id}/skudo-repo/skudo-app:latest", "--region", var.region]
    }
    images = ["${var.region}-docker.pkg.dev/${var.project_id}/skudo-repo/skudo-app:latest"]

    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
  }

  depends_on = [google_project_service.cloudbuild]
}
