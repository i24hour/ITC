#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Azure Deployment Status Check${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

AZURE_URL="https://itc-warehouse-app-2025-c8hgg5deeagae5dj.centralindia-01.azurewebsites.net"

echo -e "${YELLOW}📡 Checking GitHub Actions deployment...${NC}"
echo -e "Visit: ${BLUE}https://github.com/i24hour/ITC-2/actions${NC}\n"

echo -e "${YELLOW}⏳ Waiting for deployment (this may take 2-3 minutes)...${NC}\n"

# Function to check if site is responding
check_site() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$AZURE_URL/api/health" --max-time 10)
    echo "$response"
}

echo -e "${YELLOW}Checking Azure website health...${NC}"

for i in {1..3}; do
    echo -e "\nAttempt $i/3..."
    
    HTTP_CODE=$(check_site)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Website is responding (HTTP $HTTP_CODE)${NC}"
        
        # Get detailed health info
        HEALTH_INFO=$(curl -s "$AZURE_URL/api/health")
        echo -e "\n${GREEN}Health Check Response:${NC}"
        echo "$HEALTH_INFO" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_INFO"
        
        echo -e "\n${GREEN}════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
        echo -e "\n${BLUE}🌐 Website URL:${NC}"
        echo -e "$AZURE_URL"
        echo -e "\n${BLUE}🔐 Login Page:${NC}"
        echo -e "$AZURE_URL/login.html"
        echo -e "\n${BLUE}📊 GitHub Actions:${NC}"
        echo -e "https://github.com/i24hour/ITC-2/actions"
        echo -e "\n${YELLOW}⚠️  Note: If you just pushed, wait 2-3 minutes for deployment to complete.${NC}\n"
        exit 0
    else
        echo -e "${YELLOW}⏳ Site returned HTTP $HTTP_CODE, waiting...${NC}"
        sleep 5
    fi
done

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⏳ DEPLOYMENT IN PROGRESS${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "\n${YELLOW}The deployment is still in progress. Please wait a few minutes.${NC}"
echo -e "\n${BLUE}Check deployment status at:${NC}"
echo -e "https://github.com/i24hour/ITC-2/actions"
echo -e "\n${BLUE}Or check Azure Portal:${NC}"
echo -e "https://portal.azure.com\n"

exit 1
