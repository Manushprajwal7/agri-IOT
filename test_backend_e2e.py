import os
import json
import asyncio
from fastapi.testclient import TestClient
from apps.api.main import app

def run_tests():
    print("=" * 60)
    print("Running AgriSense TrueFoundry + Voice AI + CALL-E Verification")
    print("=" * 60)

    client = TestClient(app)

    # 1. MCP Discovery
    resp = client.get("/mcp")
    assert resp.status_code == 200, f"MCP discovery failed: {resp.status_code}"
    mcp_data = resp.json()
    print(f"[OK] MCP Discovery: {mcp_data['name']} (Tools: {mcp_data['tools_count']})")

    # 2. MCP Tools List
    resp = client.post("/mcp", json={"jsonrpc": "2.0", "id": "1", "method": "tools/list"})
    assert resp.status_code == 200
    tools = resp.json()["result"]["tools"]
    print(f"[OK] MCP Tools List: {len(tools)} tools returned")

    # 3. MCP Tool Call: get_sensor_telemetry
    resp = client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": "2",
        "method": "tools/call",
        "params": {"name": "get_sensor_telemetry", "arguments": {"device_id": "AGRI-ESP32-001"}}
    })
    assert resp.status_code == 200
    telemetry_content = json.loads(resp.json()["result"]["content"][0]["text"])
    print(f"[OK] MCP Tool Call (get_sensor_telemetry): Moisture={telemetry_content['soil_moisture']}%, Temp={telemetry_content['temperature']}C")

    # 4. MCP Tool Call: get_marketplace_catalog
    resp = client.post("/mcp", json={
        "jsonrpc": "2.0",
        "id": "3",
        "method": "tools/call",
        "params": {"name": "get_marketplace_catalog", "arguments": {"category": "Seeds"}}
    })
    assert resp.status_code == 200
    catalog_content = json.loads(resp.json()["result"]["content"][0]["text"])
    print(f"[OK] MCP Tool Call (get_marketplace_catalog): {catalog_content['total_items']} items in Mandya APMC Yard")

    # 5. Agent Task Creation
    resp = client.post("/api/agent/task", json={
        "prompt": "Check my soil moisture",
        "farmer_id": "farmer-001",
        "language_code": "en-IN"
    })
    assert resp.status_code == 200
    task_res = resp.json()
    session_id = task_res["session_id"]
    print(f"[OK] Agent Task Created: Session ID={session_id}")

    # 6. Integrations Config
    resp = client.get("/api/integrations/config")
    assert resp.status_code == 200
    cfg = resp.json()
    print(f"[OK] Integrations Config: CALL-E={cfg['calle_configured']}, Sarvam={cfg['sarvam_configured']}, Telegram={cfg['telegram_configured']}")

    # 7. Voice Config
    resp = client.get("/api/voice/config")
    assert resp.status_code == 200
    v_cfg = resp.json()
    print(f"[OK] Voice Config: Sarvam={v_cfg['sarvam_configured']}, Languages={len(v_cfg['supported_languages'])}")

    # 8. CALL-E Config
    resp = client.get("/api/v1/marketplace/call-config")
    assert resp.status_code == 200
    calle_cfg = resp.json()
    print(f"[OK] CALL-E Config: Configured={calle_cfg['configured']}, Phone={calle_cfg['phoneNumber']}")

    # 9. Products API
    resp = client.get("/api/products")
    assert resp.status_code == 200
    prods = resp.json()
    print(f"[OK] Products API: {len(prods)} products retrieved from DB")

    # 10. Web Dashboard Serving
    resp = client.get("/")
    assert resp.status_code == 200
    assert "AgriSense" in resp.text
    print(f"[OK] Web Dashboard HTML Serving ({len(resp.text)} bytes)")

    print("=" * 60)
    print("SUCCESS: ALL 10 VERIFICATION TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
