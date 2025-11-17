module.exports = {
  apps: [
    { name: "rs-site", cwd: "./apps/rs-site", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_SITE_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_SITE_PORT } },
    { name: "rs-admin", cwd: "./apps/rs-admin", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_ADMIN_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_ADMIN_PORT } },
    { name: "rs-consultor", cwd: "./apps/rs-consultor", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_CONSULTOR_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_CONSULTOR_PORT } },
    { name: "rs-marketplace", cwd: "./apps/rs-marketplace", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_MARKETPLACE_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_MARKETPLACE_PORT } },
    { name: "rs-walletpay", cwd: "./apps/rs-walletpay", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_WALLETPAY_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_WALLETPAY_PORT } },
    { name: "rs-logistica", cwd: "./apps/rs-logistica", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_LOGISTICA_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_LOGISTICA_PORT } },
    { name: "rs-studio", cwd: "./apps/rs-studio", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_STUDIO_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_STUDIO_PORT } },
    { name: "rs-docs", cwd: "./apps/rs-docs", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_DOCS_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_DOCS_PORT } },
    { name: "rs-template-game", cwd: "./apps/rs-template-game", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_TEMPLATE_GAME_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_TEMPLATE_GAME_PORT } },
    { name: "rs-ops-app", cwd: "./apps/rs-ops-app", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_OPS_APP_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_OPS_APP_PORT } },
    { name: "rs-api", cwd: "./apps/rs-api", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_API_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_API_PORT } },
    { name: "rs-core", cwd: "./apps/rs-core", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_CORE_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_CORE_PORT } },
    { name: "rs-config", cwd: "./apps/rs-config", script: "npm", args: "run start", env: { NODE_ENV: "development", PORT: process.env.RS_CONFIG_PORT }, env_production: { NODE_ENV: "production", PORT: process.env.RS_CONFIG_PORT } }
  ]
}