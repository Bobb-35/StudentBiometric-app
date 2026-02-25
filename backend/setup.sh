#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Biometric Attendance System - Backend Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

echo -e "${YELLOW}[1/4]${NC} Checking prerequisites..."
command -v java &> /dev/null || { echo "❌ Java is not installed!"; exit 1; }
command -v mvn &> /dev/null || { echo "❌ Maven is not installed!"; exit 1; }
echo -e "${GREEN}✓ Java and Maven are installed${NC}"

echo ""
echo -e "${YELLOW}[2/4]${NC} Building Maven project..."
mvn clean install -DskipTests
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Maven build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Maven build successful${NC}"

echo ""
echo -e "${YELLOW}[3/4]${NC} Setting up database..."
echo -e "${BLUE}Please ensure MySQL is running with:${NC}"
echo "  - Host: localhost"
echo "  - Port: 3306"
echo "  - Root password: root"
echo ""
echo -e "${BLUE}Creating database and tables...${NC}"
mysql -u root -proot < src/main/resources/db/schema.sql
mysql -u root -proot < src/main/resources/db/sample-data.sql
echo -e "${GREEN}✓ Database setup complete${NC}"

echo ""
echo -e "${YELLOW}[4/4]${NC} Starting backend server..."
echo -e "${GREEN}✓ Backend setup complete!${NC}"
echo ""
echo -e "${BLUE}To start the server, run:${NC}"
echo "  mvn spring-boot:run"
echo ""
echo -e "${BLUE}Backend will be available at:${NC}"
echo "  http://localhost:8080/api"
