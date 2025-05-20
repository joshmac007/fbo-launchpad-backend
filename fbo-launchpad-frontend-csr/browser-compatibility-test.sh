#!/bin/bash

# Browser Compatibility Testing Script for Fuel Orders Page
echo "===========================================" 
echo "  Browser Compatibility Testing - Fuel Orders Page"
echo "===========================================" 

# Instructions
echo ""
echo "This script will help you perform manual cross-browser testing."
echo "Please follow these steps:"
echo ""
echo "1. Make sure your development server is running (npm run dev)"
echo "2. For each browser, visit http://localhost:3000/orders"
echo "3. Test the following features and record results:"
echo "   - Table rendering and responsiveness"
echo "   - Filter functionality"
echo "   - Create Order modal"
echo "   - Order Detail modal"
echo "   - Action buttons"
echo ""
echo "4. Update memory-bank/browser-compatibility.md with your findings"
echo ""

# Check if dev server is running
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Development server is running"
else
    echo "❌ Development server is not running"
    echo "Please start the development server with: npm run dev"
    exit 1
fi

# Open browsers automatically (macOS specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "Opening browsers for testing..."
    
    # Open default browsers
    open -a "Google Chrome" http://localhost:3000/orders
    open -a "Safari" http://localhost:3000/orders
    open -a "Firefox" http://localhost:3000/orders
    
    # Optional: Wait and then open mobile simulator for Chrome
    sleep 5
    open -a "Google Chrome" --args --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1" http://localhost:3002/orders
else
    echo ""
    echo "Please open the following browsers manually:"
    echo "- Google Chrome"
    echo "- Mozilla Firefox"
    echo "- Safari"
    echo "- Mobile browsers or device emulators"
fi

echo ""
echo "After completing tests, update memory-bank/browser-compatibility.md"
echo "===========================================" 