terraform {
  required_version = ">= 1.9"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${var.app_name}-${var.environment}"
  location = var.location
}

module "container_registry" {
  source              = "./modules/container-registry"
  name                = "acr${replace(var.app_name, "-", "")}${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}

module "container_app" {
  source              = "./modules/container-app"
  app_name            = var.app_name
  environment         = var.environment
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  acr_login_server    = module.container_registry.login_server
  acr_admin_username  = module.container_registry.admin_username
  acr_admin_password  = module.container_registry.admin_password
  image_tag           = var.image_tag
  allowed_origins     = [module.static_web_app.default_hostname]
}

module "static_web_app" {
  source              = "./modules/static-web-app"
  app_name            = var.app_name
  environment         = var.environment
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}
