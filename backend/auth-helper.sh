#!/bin/bash
# auth-helper.sh
# Usage: eval $(./auth-helper.sh fan)

ROLE=$1

if [ "$ROLE" = "fan" ]; then
  EMAIL="fan2@example.com"
  PASSWORD="Supersecure123"
elif [ "$ROLE" = "artist" ]; then
  EMAIL="artist1@example.com"
  PASSWORD="ArtistPro456"
else
  echo "❌ Unknown role: $ROLE" >&2
  echo "Usage: ./auth-helper.sh [fan|artist]" >&2
  exit 1
fi

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed for $EMAIL" >&2
  exit 1
fi

# ✅ Only print the export (for eval)
echo "export AUTH_TOKEN=$TOKEN"

# Log to stderr so eval ignores it
echo "✅ Logged in as $EMAIL ($ROLE)" >&2

