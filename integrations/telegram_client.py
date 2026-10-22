import os
import httpx
from typing import Dict, Any
from db.database import reload_env

class TelegramClient:
    """
    Direct integration client for Telegram Bot Alerts & Farmer Notifications.
    Sends environmental warnings, purchase order dispatches, and farm telemetry updates.
    """

    @staticmethod
    def send_message(message_markdown: str) -> Dict[str, Any]:
        reload_env()
        bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
        chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()

        if not bot_token or not chat_id:
            return {
                "success": False,
                "sent": False,
                "status": "BOT_TOKEN_MISSING",
                "note": "Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env."
            }

        try:
            with httpx.Client(timeout=8.0) as client:
                resp = client.post(
                    f"https://api.telegram.org/bot{bot_token}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": message_markdown,
                        "parse_mode": "Markdown"
                    }
                )
                if resp.status_code == 200:
                    return {"success": True, "sent": True, "status": "DELIVERED", "response": resp.json()}
                else:
                    return {"success": False, "sent": False, "status": f"HTTP_{resp.status_code}", "error": resp.text}
        except Exception as e:
            return {"success": False, "sent": False, "status": "ERROR", "error": str(e)}
