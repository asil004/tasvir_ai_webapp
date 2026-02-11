#!/bin/bash

# Automatic cleanup cron job o'rnatish
# Har hafta yakshanba kuni soat 03:00 da cleanup qiladi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/cleanup.sh"

echo "🔧 Setting up automatic cleanup cron job..."

# Make cleanup script executable
chmod +x "$CLEANUP_SCRIPT"

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * 0 $CLEANUP_SCRIPT >> $SCRIPT_DIR/cleanup.log 2>&1") | crontab -

echo "✅ Cron job installed!"
echo "📅 Cleanup will run every Sunday at 03:00 AM"
echo ""
echo "To check cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove:"
echo "  crontab -e"
echo "  (then delete the line)"
