#!/bin/bash
# Start the Spring Boot backend server

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Starting Biometric Attendance System Backend         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "Starting Spring Boot server..."
echo "Server will be available at: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

mvn spring-boot:run
