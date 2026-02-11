.PHONY: help build up down restart logs status clean deploy update

# Colors
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m

help: ## Show this help message
	@echo '$(GREEN)Tasvir AI WebApp - Docker Commands$(NC)'
	@echo ''
	@echo '$(YELLOW)Usage:$(NC)'
	@echo '  make [command]'
	@echo ''
	@echo '$(YELLOW)Available commands:$(NC)'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images
	@echo '$(YELLOW)Building Docker images...$(NC)'
	docker compose build

build-no-cache: ## Build Docker images without cache
	@echo '$(YELLOW)Building Docker images (no cache)...$(NC)'
	docker compose build --no-cache

up: ## Start all containers
	@echo '$(YELLOW)Starting containers...$(NC)'
	docker compose up -d
	@echo '$(GREEN)✓ Containers started!$(NC)'
	@make status

up-webapp: ## Start only webapp container
	@echo '$(YELLOW)Starting webapp container...$(NC)'
	docker compose up -d webapp
	@echo '$(GREEN)✓ WebApp started!$(NC)'

down: ## Stop all containers
	@echo '$(YELLOW)Stopping containers...$(NC)'
	docker compose down
	@echo '$(GREEN)✓ Containers stopped!$(NC)'

restart: ## Restart all containers
	@echo '$(YELLOW)Restarting containers...$(NC)'
	docker compose restart
	@echo '$(GREEN)✓ Containers restarted!$(NC)'

restart-webapp: ## Restart webapp container
	@echo '$(YELLOW)Restarting webapp...$(NC)'
	docker compose restart webapp
	@echo '$(GREEN)✓ WebApp restarted!$(NC)'

logs: ## Show logs (follow mode)
	docker compose logs -f webapp

logs-all: ## Show all container logs
	docker compose logs -f

logs-tail: ## Show last 100 log lines
	docker compose logs --tail=100 webapp

status: ## Show container status
	@echo '$(YELLOW)Container Status:$(NC)'
	@docker compose ps
	@echo ''
	@echo '$(YELLOW)Resource Usage:$(NC)'
	@docker stats --no-stream tasvir-ai-webapp 2>/dev/null || echo "Container not running"

health: ## Check application health
	@echo '$(YELLOW)Checking health...$(NC)'
	@curl -s http://localhost:3000 > /dev/null && echo '$(GREEN)✓ Application is healthy!$(NC)' || echo '$(YELLOW)⚠ Application is not responding$(NC)'

shell: ## Access webapp container shell
	docker exec -it tasvir-ai-webapp sh

clean: ## Remove containers, volumes, and images
	@echo '$(YELLOW)Cleaning up Docker resources...$(NC)'
	docker compose down -v
	docker rmi tasvir_ai_webapp-webapp 2>/dev/null || true
	@echo '$(GREEN)✓ Cleanup complete!$(NC)'

clean-all: ## Remove all Docker resources including unused images
	@echo '$(YELLOW)Deep cleaning Docker resources...$(NC)'
	docker compose down -v
	docker system prune -af
	@echo '$(GREEN)✓ Deep cleanup complete!$(NC)'

deploy: ## Full deployment (build + up)
	@echo '$(GREEN)Starting deployment...$(NC)'
	@make build
	@make down
	@make up
	@sleep 5
	@make health
	@echo '$(GREEN)✓ Deployment complete!$(NC)'

deploy-prod: ## Production deployment with no cache
	@echo '$(GREEN)Starting production deployment...$(NC)'
	@make build-no-cache
	@make down
	@make up
	@sleep 5
	@make health
	@echo '$(GREEN)✓ Production deployment complete!$(NC)'

update: ## Pull latest code and redeploy
	@echo '$(YELLOW)Updating application...$(NC)'
	git pull
	@make deploy
	@echo '$(GREEN)✓ Update complete!$(NC)'

backup: ## Backup important files
	@echo '$(YELLOW)Creating backup...$(NC)'
	@mkdir -p backups
	@tar -czf backups/backup-$$(date +%Y%m%d-%H%M%S).tar.gz \
		.env.production \
		docker-compose.yml \
		nginx.conf \
		webapp/.env.local 2>/dev/null || true
	@echo '$(GREEN)✓ Backup created in ./backups/$(NC)'

env-check: ## Check environment variables
	@echo '$(YELLOW)Environment Variables:$(NC)'
	@test -f .env.production && cat .env.production || echo 'No .env.production file found'

test-local: ## Test webapp locally (without Docker)
	@echo '$(YELLOW)Testing locally...$(NC)'
	cd webapp && npm run dev

install-deps: ## Install webapp dependencies locally
	@echo '$(YELLOW)Installing dependencies...$(NC)'
	cd webapp && npm install
	@echo '$(GREEN)✓ Dependencies installed!$(NC)'

# Production specific commands
ssl-setup: ## Show SSL setup instructions
	@echo '$(YELLOW)SSL Setup Instructions:$(NC)'
	@echo '1. Install certbot: sudo apt-get install certbot'
	@echo '2. Get certificate: sudo certbot certonly --standalone -d yourdomain.com'
	@echo '3. Copy certificates: sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem ./ssl/'
	@echo '4. Update nginx.conf with your domain'
	@echo '5. Restart: make restart'

firewall-setup: ## Show firewall setup instructions
	@echo '$(YELLOW)Firewall Setup Instructions:$(NC)'
	@echo 'sudo apt-get install ufw'
	@echo 'sudo ufw allow 22/tcp    # SSH'
	@echo 'sudo ufw allow 80/tcp    # HTTP'
	@echo 'sudo ufw allow 443/tcp   # HTTPS'
	@echo 'sudo ufw enable'

monitor: ## Monitor container resources (real-time)
	docker stats tasvir-ai-webapp

# Default target
.DEFAULT_GOAL := help
