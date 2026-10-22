import os
import sys
import uvicorn
from db.seed import seed_all

def main():
    print("=" * 65)
    print("🌾 AgriSense & AgriMarket AI — TrueFoundry + Voice AI + CALL-E")
    print("=" * 65)

    # Ensure database is seeded
    try:
        seed_all()
    except Exception as e:
        print(f"[Seed Notice] {e}")

    port = int(os.environ.get("PORT", 8000))
    print(f"\n[HTTP]     Web Dashboard:        http://localhost:{port}")
    print(f"[MCP]      Model Context Server: http://localhost:{port}/mcp")
    print(f"[AGENT]    TrueForge SSE Stream: http://localhost:{port}/api/agent/task")
    print(f"[VOICE]    Sarvam AI STT & TTS:  http://localhost:{port}/api/voice/config")
    print(f"[CALL-E]   Outbound Phone Calls: http://localhost:{port}/api/v1/marketplace/call-farmer")
    print(f"[TELEGRAM] Farm Alerts & Ledger: http://localhost:{port}/api/integrations/test-telegram\n")
    print("=" * 65 + "\n")

    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=port, reload=False)

if __name__ == "__main__":
    main()
