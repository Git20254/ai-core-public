#!/bin/bash
set -e

API_URL="http://localhost:3000"

echo "🎵 Logging in as Fan..."
FAN_TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fan2@example.com","password":"Supersecure123"}' | jq -r '.access_token')
echo "✅ Fan logged in, token stored."

echo "🎤 Logging in as Artist..."
ARTIST_TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist1@example.com","password":"ArtistPro456"}' | jq -r '.access_token')
echo "✅ Artist logged in, token stored."

echo ""
echo "📌 Fan Profile (/users/me)"
curl -s -X GET $API_URL/users/me \
  -H "Authorization: Bearer $FAN_TOKEN" | jq

echo ""
echo "📌 Artist Profile (/users/me)"
curl -s -X GET $API_URL/users/me \
  -H "Authorization: Bearer $ARTIST_TOKEN" | jq

echo ""
echo "❤️ Fan likes first track"
curl -s -X POST $API_URL/tracks/1/like \
  -H "Authorization: Bearer $FAN_TOKEN" | jq

echo ""
echo "🔥 Trending Tracks"
curl -s -X GET $API_URL/tracks/trending | jq

echo ""
echo "💰 Generating a simulated payout for the artist..."
curl -s -X POST $API_URL/payments/generate \
  -H "Authorization: Bearer $ARTIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artistId":2}' | jq

echo ""
echo "✅ Test completed successfully."

