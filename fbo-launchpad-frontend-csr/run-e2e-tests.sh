#!/bin/bash

# Color codes for output formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}    FBO LaunchPad E2E Test Runner   ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Create test results directory if it doesn't exist
mkdir -p test-results

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo -e "${YELLOW}Warning: Application doesn't appear to be running on port 3000${NC}"
  echo -e "${YELLOW}Starting the development server...${NC}"
  
  # Start the app in the background
  npm run dev &
  APP_PID=$!
  
  # Wait for the app to start
  echo -e "${YELLOW}Waiting for the application to start...${NC}"
  for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null; then
      echo -e "${GREEN}Application is now running!${NC}"
      break
    fi
    
    if [ $i -eq 10 ]; then
      echo -e "${RED}Failed to start application, tests will likely fail.${NC}"
    fi
    
    echo -n "."
    sleep 2
  done
  echo ""
  
  # Remember that we started the app
  STARTED_APP=true
else
  echo -e "${GREEN}Application is already running on port 3000${NC}"
fi

# Parse command line arguments
TEST_FILE="fuel-order-lifecycle.spec.ts"
BROWSER="chromium"
HEADED=false
DEBUG=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --test=*)
      TEST_FILE="${1#*=}"
      shift
      ;;
    --browser=*)
      BROWSER="${1#*=}"
      shift
      ;;
    --headed)
      HEADED=true
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./run-e2e-tests.sh [--test=testfile.spec.ts] [--browser=chromium|firefox|webkit] [--headed] [--debug]"
      exit 1
      ;;
  esac
done

# Construct the test command based on options
TEST_CMD="npx playwright test tests/e2e/$TEST_FILE --project=$BROWSER"

if [ "$HEADED" = true ]; then
  TEST_CMD="$TEST_CMD --headed"
fi

if [ "$DEBUG" = true ]; then
  TEST_CMD="$TEST_CMD --debug"
fi

echo -e "${BLUE}Running test:${NC} $TEST_CMD"

# Run the tests
eval $TEST_CMD
TEST_RESULT=$?

# Generate test report summary
echo -e "${BLUE}Generating test report...${NC}"
npx playwright show-report

# If we started the app, stop it
if [ "$STARTED_APP" = true ]; then
  echo -e "${YELLOW}Stopping development server...${NC}"
  kill $APP_PID
  # Wait for the process to terminate
  wait $APP_PID 2>/dev/null
  echo -e "${GREEN}Development server stopped.${NC}"
fi

# Show final status
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✅ E2E tests passed successfully!${NC}"
else
  echo -e "${RED}❌ E2E tests failed!${NC}"
fi

echo -e "${BLUE}Test artifacts saved to:${NC} test-results/"
echo -e "${BLUE}=====================================${NC}"

exit $TEST_RESULT 