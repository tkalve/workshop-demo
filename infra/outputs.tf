output "backend_url" {
  description = "Public URL of the backend Container App"
  value       = module.container_app.ingress_fqdn
}

output "frontend_url" {
  description = "Public URL of the Static Web App"
  value       = module.static_web_app.default_hostname
}

output "acr_login_server" {
  description = "Container Registry login server"
  value       = module.container_registry.login_server
}

output "static_web_app_api_key" {
  description = "Deployment token for the Static Web App (used in CI)"
  value       = module.static_web_app.api_key
  sensitive   = true
}
