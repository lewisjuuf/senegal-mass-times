#!/bin/bash
# Regression Test Runner for Senegal Mass Times

echo "🧪 Running Regression Tests..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "❌ Backend is not running on port 8000"
    echo "Please start the backend first:"
    echo "  cd backend && ./start.sh"
    exit 1
fi

# Run tests
python3 test_api.py

exit $?
