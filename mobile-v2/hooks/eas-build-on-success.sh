#!/bin/bash

# Hook EAS : Supprimer NSUserTrackingUsageDescription après prebuild

PLIST_PATH="$EAS_BUILD_WORKINGDIR/ios/DAKANews/Info.plist"

if [ -f "$PLIST_PATH" ]; then
  echo "🔍 Vérification de NSUserTrackingUsageDescription dans Info.plist..."
  
  # Supprimer la clé si elle existe
  /usr/libexec/PlistBuddy -c "Delete :NSUserTrackingUsageDescription" "$PLIST_PATH" 2>/dev/null || true
  
  # Vérification
  if grep -q "NSUserTrackingUsageDescription" "$PLIST_PATH"; then
    echo "❌ ERREUR : La clé existe toujours !"
    exit 1
  else
    echo "✅ NSUserTrackingUsageDescription supprimée avec succès"
  fi
else
  echo "⚠️ Info.plist introuvable à $PLIST_PATH"
fi
