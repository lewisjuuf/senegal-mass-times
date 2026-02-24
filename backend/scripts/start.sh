#!/bin/bash
# Backend Startup Script with Virtual Environment

echo "🚀 Starting Senegal Mass Times Backend..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Activate virtual environment
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
    echo "✅ Virtual environment activated"
    echo ""
else
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo ""
fi

# Install/update dependencies
echo "📦 Checking dependencies..."
pip install -q -r requirements.txt

echo ""
echo "🔧 Starting FastAPI server..."
echo "📍 Backend: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "================================================"
echo ""

python3 -m uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
