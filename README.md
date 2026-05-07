# Waffle 🧇

A real-time, browser-based chat app. Pick a nickname and start chatting — no account required.

## Features

- Single global chat room (ephemeral — no persistence)
- IRC-style commands: `/me`, `/nick`, `/who`
- Real-time via WebSockets (SignalR)
- Warm, cozy dark theme

## Commands

| Command | Description |
|---------|-------------|
| `/me <action>` | Broadcast an action (e.g. `/me waves hello`) |
| `/nick <newNick>` | Change your nickname |
| `/who @nick` | Show info about a user (join time) |

## Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React + TypeScript + Vite + TanStack Router         |
| Backend  | ASP.NET Core 10 + SignalR                           |
| Infra    | Terraform → Azure Container Apps + Static Web Apps  |

## Local Development

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### Backend

```bash
cd backend
dotnet run --project src/Waffle.Api
# Runs on http://localhost:5062
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (proxies /hubs → backend)
```

### Tests

```bash
cd backend
dotnet test
```

## Deployment (Azure)

### 1. Provision infrastructure

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # fill in your subscription_id
terraform init
terraform apply
```

### 2. Build and push backend image

```bash
ACR=$(terraform -chdir=infra output -raw acr_login_server)
docker build -t $ACR/waffle:latest backend/
az acr login --name $ACR
docker push $ACR/waffle:latest
```

### 3. Deploy frontend

The Static Web App is deployed via the GitHub Actions workflow using the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret (obtain from `terraform output static_web_app_api_key`).

## Project Structure

```
├── frontend/          React + Vite frontend
├── backend/           ASP.NET Core 10 backend
│   ├── src/Waffle.Api/
│   └── tests/Waffle.Api.Tests/
├── infra/             Terraform (Azure)
└── README.md
```

