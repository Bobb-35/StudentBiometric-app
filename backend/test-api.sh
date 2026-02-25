#!/bin/bash
# API Testing Script - Test all endpoints

BASE_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Biometric Attendance System - API Test Suite        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "  Command: curl -X $method $BASE_URL$endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    if [ -z "$response" ]; then
        echo -e "  ${RED}❌ No response - Is the backend running?${NC}"
        echo ""
        return 1
    fi
    
    echo -e "  ${GREEN}✓ Response:${NC}"
    echo "  $response" | head -c 200
    echo ""
    echo ""
}

# Test Authentication
echo -e "${BLUE}=== Authentication Tests ===${NC}"
echo ""

test_endpoint "POST" "/auth/login" \
    '{"email":"admin@biometric.com","password":"password"}' \
    "Login as Admin"

# Test User Endpoints
echo -e "${BLUE}=== User Management Tests ===${NC}"
echo ""

test_endpoint "GET" "/users" "" \
    "Get all users"

test_endpoint "GET" "/users/1" "" \
    "Get user by ID"

test_endpoint "GET" "/users/role/STUDENT" "" \
    "Get students"

# Test Course Endpoints
echo -e "${BLUE}=== Course Management Tests ===${NC}"
echo ""

test_endpoint "GET" "/courses" "" \
    "Get all courses"

test_endpoint "GET" "/courses/1" "" \
    "Get course by ID"

test_endpoint "GET" "/courses/lecturer/2" "" \
    "Get courses by lecturer"

# Test Session Endpoints
echo -e "${BLUE}=== Attendance Session Tests ===${NC}"
echo ""

test_endpoint "GET" "/sessions" "" \
    "Get all sessions"

test_endpoint "GET" "/sessions/status/ACTIVE" "" \
    "Get active sessions"

# Test Attendance Records
echo -e "${BLUE}=== Attendance Record Tests ===${NC}"
echo ""

test_endpoint "GET" "/attendance" "" \
    "Get all attendance records"

test_endpoint "GET" "/attendance/student/3" "" \
    "Get student attendance"

# Test Biometric
echo -e "${BLUE}=== Biometric Tests ===${NC}"
echo ""

test_endpoint "GET" "/biometric/user/3" "" \
    "Get biometric enrollment"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              API Testing Complete                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "If all tests passed, your backend is working correctly!"
echo ""
