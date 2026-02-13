variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

variable "repo_owner" {
  description = "GitHub Repository Owner"
  type        = string
}

variable "repo_name" {
  description = "GitHub Repository Name"
  type        = string
}

variable "youtube_api_key" {
  description = "YouTube API Key"
  type        = string
  sensitive   = true
}

variable "firebase_api_key" { type = string }
variable "firebase_auth_domain" { type = string }
variable "firebase_project_id" { type = string }
variable "firebase_storage_bucket" { type = string }
variable "firebase_messaging_sender_id" { type = string }
variable "firebase_app_id" { type = string }

variable "github_app_installation_id" {
  description = "GitHub App installation ID for Cloud Build connection"
  type        = number
}
