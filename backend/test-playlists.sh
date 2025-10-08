#!/bin/bash
set -e

echo ""
echo "🎵 Logging in as Fan (playlist owner)..."
FAN_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fan2@example.com","password":"password123"}')
FAN_TOKEN=$(echo $FAN_LOGIN | jq -r .access_token)
echo "✅ Fan logged in."

echo ""
echo "🎤 Logging in as Artist (potential collaborator)..."
ARTIST_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist1@example.com","password":"password123"}')
ARTIST_TOKEN=$(echo $ARTIST_LOGIN | jq -r .access_token)
echo "✅ Artist logged in."

echo ""
echo "🎶 Creating a new public playlist..."
CREATE_PLAYLIST=$(curl -s -X POST http://localhost:3000/playlists/create \
  -H "Authorization: Bearer $FAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Collab Mix","description":"Test playlist for collab features","isPublic":true}')
echo $CREATE_PLAYLIST | jq
PLAYLIST_ID=$(echo $CREATE_PLAYLIST | jq -r .playlist.id)

if [ "$PLAYLIST_ID" == "null" ]; then
  echo "❌ Failed to create playlist. Exiting."
  exit 1
fi

echo ""
echo "➕ Adding first track..."
ADD_TRACK_1=$(curl -s -X POST http://localhost:3000/playlists/$PLAYLIST_ID/tracks/1 \
  -H "Authorization: Bearer $FAN_TOKEN")
echo $ADD_TRACK_1 | jq

echo ""
echo "➕ Adding second track..."
ADD_TRACK_2=$(curl -s -X POST http://localhost:3000/playlists/$PLAYLIST_ID/tracks/2 \
  -H "Authorization: Bearer $FAN_TOKEN")
echo $ADD_TRACK_2 | jq

echo ""
echo "🤝 Inviting artist as a collaborator..."
INVITE=$(curl -s -X POST http://localhost:3000/playlists/$PLAYLIST_ID/collaborators/invite \
  -H "Authorization: Bearer $FAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"artist1@example.com","canEdit":true,"canInvite":true}')
echo $INVITE | jq

echo ""
echo "👀 Viewing collaborators (as owner)..."
COLLAB_LIST=$(curl -s -X GET http://localhost:3000/playlists/$PLAYLIST_ID/collaborators \
  -H "Authorization: Bearer $FAN_TOKEN")
echo $COLLAB_LIST | jq

echo ""
echo "🎧 Artist adds a track as collaborator..."
ADD_TRACK_COLLAB=$(curl -s -X POST http://localhost:3000/playlists/$PLAYLIST_ID/tracks/3 \
  -H "Authorization: Bearer $ARTIST_TOKEN")
echo $ADD_TRACK_COLLAB | jq

echo ""
echo "🧩 Artist removes a track (collaborator edit test)..."
REMOVE_TRACK=$(curl -s -X DELETE http://localhost:3000/playlists/$PLAYLIST_ID/tracks/1 \
  -H "Authorization: Bearer $ARTIST_TOKEN")
echo $REMOVE_TRACK | jq

echo ""
echo "✏️ Owner updates collaborator permissions (remove canInvite)..."
UPDATE_COLLAB=$(curl -s -X PATCH http://localhost:3000/playlists/$PLAYLIST_ID/collaborators/2 \
  -H "Authorization: Bearer $FAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"canEdit":true,"canInvite":false}')
echo $UPDATE_COLLAB | jq

echo ""
echo "❌ Removing collaborator..."
REMOVE_COLLAB=$(curl -s -X DELETE http://localhost:3000/playlists/$PLAYLIST_ID/collaborators/2 \
  -H "Authorization: Bearer $FAN_TOKEN")
echo $REMOVE_COLLAB | jq

echo ""
echo "📈 Listing all public playlists..."
LIST=$(curl -s -X GET http://localhost:3000/playlists/public)
echo $LIST | jq

echo ""
echo "🧹 Deleting playlist..."
DELETE=$(curl -s -X DELETE http://localhost:3000/playlists/$PLAYLIST_ID \
  -H "Authorization: Bearer $FAN_TOKEN")
echo $DELETE | jq

echo ""
echo "✅ Collaboration test completed successfully."

