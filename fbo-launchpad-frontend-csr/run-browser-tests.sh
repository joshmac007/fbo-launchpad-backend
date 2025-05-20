#!/bin/bash

# Run Browser Tests Script for Fuel Orders Page
echo "===========================================" 
echo "  Automated Browser Compatibility Testing"
echo "===========================================" 

# Process command line options
DEBUG_MODE=false
SPECIFIC_FILE=""
HEADED_MODE=false
BROWSER="all"

while [[ $# -gt 0 ]]; do
  case $1 in
    --debug)
      DEBUG_MODE=true
      shift
      ;;
    --file)
      SPECIFIC_FILE="$2"
      shift 2
      ;;
    --headed)
      HEADED_MODE=true
      shift
      ;;
    --browser)
      BROWSER="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--debug] [--file <filename>] [--headed] [--browser <chrome|firefox|safari|mobile>]"
      exit 1
      ;;
  esac
done

# Create test results directory
mkdir -p test-results

# Check if dev server is running
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Development server is running"
else
    echo "❌ Development server is not running"
    echo "Starting the development server..."
    echo "This will run in the background. Press Ctrl+C to stop when testing is complete."
    npm run dev &
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 10
    
    # Check again
    curl -s http://localhost:3000 > /dev/null
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start development server"
        exit 1
    else
        echo "✅ Development server started successfully"
    fi
fi

# Build the command based on options
COMMAND="npx playwright test"

# Add debug-specific file if in debug mode
if [ "$DEBUG_MODE" = true ]; then
    COMMAND="$COMMAND tests/e2e/debug-auth.spec.ts"
    echo ""
    echo "🐞 Running in DEBUG mode"
# Add specific file if provided
elif [ -n "$SPECIFIC_FILE" ]; then
    COMMAND="$COMMAND $SPECIFIC_FILE"
    echo ""
    echo "🔍 Testing specific file: $SPECIFIC_FILE"
fi

# Add browser option if specified
if [ "$BROWSER" != "all" ]; then
    case $BROWSER in
        chrome)
            COMMAND="$COMMAND --project=chromium"
            ;;
        firefox)
            COMMAND="$COMMAND --project=firefox"
            ;;
        safari)
            COMMAND="$COMMAND --project=webkit"
            ;;
        mobile)
            COMMAND="$COMMAND --project=mobile-chrome,mobile-safari"
            ;;
        *)
            echo "Unknown browser: $BROWSER"
            echo "Valid options: chrome, firefox, safari, mobile"
            exit 1
            ;;
    esac
    echo "🌐 Testing in browser: $BROWSER"
fi

# Add headed mode if specified
if [ "$HEADED_MODE" = true ]; then
    COMMAND="$COMMAND --headed"
    echo "👁️ Running in headed mode"
fi

echo ""
echo "Running Playwright tests with command: $COMMAND"
echo ""

# Run the tests
eval $COMMAND

# Check if tests completed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All automated tests passed!"
else
    echo ""
    echo "❌ Some tests failed. Check the report for details."
fi

echo ""
echo "Test report available at: ./playwright-report/index.html"
echo ""
echo "To view the report, run:"
echo "npx playwright show-report"
echo ""

# If not in debug mode, ask if user wants to run headed tests for manual verification
if [ "$DEBUG_MODE" = false ] && [ "$HEADED_MODE" = false ]; then
    read -p "Would you like to run the tests in headed mode for manual verification? (y/n) " headed_choice
    if [[ $headed_choice == "y" ]]; then
        echo ""
        echo "Running tests in headed mode..."
        
        # Build the headed command
        HEADED_CMD="npx playwright test --headed"
        
        # Add specific file if provided
        if [ -n "$SPECIFIC_FILE" ]; then
            HEADED_CMD="$HEADED_CMD $SPECIFIC_FILE"
        fi
        
        # Add browser option if specified
        if [ "$BROWSER" != "all" ]; then
            case $BROWSER in
                chrome)
                    HEADED_CMD="$HEADED_CMD --project=chromium"
                    ;;
                firefox)
                    HEADED_CMD="$HEADED_CMD --project=firefox"
                    ;;
                safari)
                    HEADED_CMD="$HEADED_CMD --project=webkit"
                    ;;
                mobile)
                    HEADED_CMD="$HEADED_CMD --project=mobile-chrome"
                    ;;
            esac
        else
            # Default to chromium for headed mode if no browser specified
            HEADED_CMD="$HEADED_CMD --project=chromium"
        fi
        
        eval $HEADED_CMD
    fi
fi

# Update the browser-compatibility.md file
echo ""
echo "Don't forget to update memory-bank/browser-compatibility.md with your findings"
echo ""

# Ask if user wants to generate a template for browser-compatibility.md
read -p "Would you like to generate a browser compatibility report template? (y/n) " template_choice
if [[ $template_choice == "y" ]]; then
    report_date=$(date +"%Y-%m-%d")
    report_file="browser-compatibility-report-${report_date}.md"
    
    # Create template file
    cat > "$report_file" << EOL
# Browser Compatibility Test Report

## Test Date: $report_date

## Automated Test Results

| Browser | Status | Issues |
|---------|--------|--------|
| Chrome  | 🟢 Pass / 🔴 Fail | |
| Firefox | 🟢 Pass / 🔴 Fail | |
| Safari  | 🟢 Pass / 🔴 Fail | |
| Mobile Chrome | 🟢 Pass / 🔴 Fail | |
| Mobile Safari | 🟢 Pass / 🔴 Fail | |

## Feature Test Results

### Table Rendering
- [ ] Table renders correctly in all browsers
- [ ] Status badges display correctly
- [ ] Action buttons are properly aligned

### Filters and Sorting
- [ ] Status filter works in all browsers
- [ ] Tail number search functions properly
- [ ] Date filters operate correctly
- [ ] Column sorting works consistently

### Modals and Forms
- [ ] Create Order modal opens and displays correctly
- [ ] Order Details modal displays all information
- [ ] Form validation works across browsers
- [ ] Submit actions function as expected

### Responsive Design
- [ ] Desktop layout displays correctly
- [ ] Tablet layout functions properly
- [ ] Mobile layout provides good user experience
- [ ] Table scrolling/collapsing works as designed

## Issues Found

| Issue | Browser | Severity | Notes |
|-------|---------|----------|-------|
|       |         |          |       |

## Recommendations

- 
- 
- 

EOL
    
    echo "Template created: $report_file"
    echo "Please fill in the template with your test results"
fi

echo "===========================================" 