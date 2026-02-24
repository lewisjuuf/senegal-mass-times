#!/bin/bash
# Start Backend Server Script

echo "🚀 Starting Senegal Mass Times Backend..."
echo ""

cd "$(dirname "$0")/backend"

# Check if in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Not in virtual environment"
    if [ -d "venv" ]; then
        echo "📦 Activating virtual environment..."
        source venv/bin/activate
    fi
fi

echo "🔧 Starting FastAPI server on http://localhost:8000"
echo "📖 API Docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
