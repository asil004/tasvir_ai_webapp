#!/bin/bash

# Tasvir AI WebApp - Monitoring Script
# VPS server va container monitoring

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Tasvir AI WebApp - System Monitor         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# 1. System Resources
echo -e "${YELLOW}🖥️  System Resources:${NC}"
echo "────────────────────────────────────────────────"

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo -e "CPU Usage:    ${GREEN}${CPU_USAGE}%${NC}"

# Memory Usage
MEM_TOTAL=$(free -m | awk 'NR==2{printf "%.0f", $2}')
MEM_USED=$(free -m | awk 'NR==2{printf "%.0f", $3}')
MEM_PERCENT=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
echo -e "Memory:       ${GREEN}${MEM_USED}MB / ${MEM_TOTAL}MB (${MEM_PERCENT}%)${NC}"

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
DISK_USED=$(df -h / | awk 'NR==2{print $3}')
DISK_TOTAL=$(df -h / | awk 'NR==2{print $2}')

if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "Disk:         ${RED}${DISK_USED} / ${DISK_TOTAL} (${DISK_USAGE}%) ⚠️${NC}"
else
    echo -e "Disk:         ${GREEN}${DISK_USED} / ${DISK_TOTAL} (${DISK_USAGE}%)${NC}"
fi

echo ""

# 2. Docker Container Status
echo -e "${YELLOW}🐳 Docker Containers:${NC}"
echo "────────────────────────────────────────────────"

if docker ps | grep -q tasvir-ai-webapp; then
    echo -e "Status:       ${GREEN}● Running${NC}"

    # Container stats
    CONTAINER_CPU=$(docker stats --no-stream --format "{{.CPUPerc}}" tasvir-ai-webapp 2>/dev/null | cut -d'%' -f1)
    CONTAINER_MEM=$(docker stats --no-stream --format "{{.MemUsage}}" tasvir-ai-webapp 2>/dev/null)

    echo -e "CPU:          ${GREEN}${CONTAINER_CPU}%${NC}"
    echo -e "Memory:       ${GREEN}${CONTAINER_MEM}${NC}"
else
    echo -e "Status:       ${RED}● Not Running${NC}"
fi

echo ""

# 3. Application Health
echo -e "${YELLOW}🏥 Application Health:${NC}"
echo "────────────────────────────────────────────────"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "HTTP Status:  ${GREEN}${HTTP_CODE} ✓${NC}"
else
    echo -e "HTTP Status:  ${RED}${HTTP_CODE} ✗${NC}"
fi

# Response time
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000 2>/dev/null || echo "N/A")
echo -e "Response:     ${GREEN}${RESPONSE_TIME}s${NC}"

echo ""

# 4. Recent Logs
echo -e "${YELLOW}📋 Recent Logs (last 5):${NC}"
echo "────────────────────────────────────────────────"
docker logs --tail=5 tasvir-ai-webapp 2>/dev/null || echo "No logs available"

echo ""

# 5. Disk Warning
if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${RED}⚠️  WARNING: Disk usage is high (${DISK_USAGE}%)${NC}"
    echo -e "${YELLOW}Run: ./cleanup.sh to free up space${NC}"
    echo ""
fi

# 6. Quick Actions
echo -e "${BLUE}Quick Actions:${NC}"
echo "  make logs        - View full logs"
echo "  make restart     - Restart container"
echo "  ./cleanup.sh     - Clean up disk space"
echo "  make status      - Detailed status"
echo ""

# Auto-refresh option
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo -e "${YELLOW}Refreshing in 5 seconds...${NC}"
sleep 5
exec $0
