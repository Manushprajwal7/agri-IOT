import os
import json
import asyncio
from fastapi.testclient import TestClient
from apps.api.main import app

def run_agent_test():
    print("=" * 60)
    print("Testing TrueForge Agent Loop & Approval Gate E2E")
    print("=" * 60)

    client = TestClient(app)

    # 1. Initiate task turn
    task_resp = client.post("/api/agent/task", json={
        "prompt": "Rent Mahindra tractor for 4 hours",
        "farmer_id": "farmer-001",
        "language_code": "en-IN"
    })
    assert task_resp.status_code == 200
    session_id = task_resp.json()["session_id"]
    print(f"[OK] Task turn initiated: Session {session_id}")

    # 2. Read SSE stream
    with client.stream("GET", f"/api/agent/session/{session_id}/stream") as stream:
        approval_found = False
        action_id = None
        for line in stream.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            evt = json.loads(line[6:])
            evt_type = evt.get("type")
            print(f"  -> Event: {evt_type}")
            if evt_type == "approval_required":
                approval_found = True
                action_id = evt.get("action_id")
                print(f"[OK] Reached TrueForge Approval Gate! Action ID: {action_id}")
                break

        assert approval_found, "Did not reach approval_required state"

    # 3. Submit Approval Decision (Allow)
    print(f"Submitting 'allow' decision for Action {action_id}...")
    with client.stream("POST", f"/api/agent/session/{session_id}/approval", json={"decision": "allow"}) as stream:
        completed = False
        for line in stream.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            evt = json.loads(line[6:])
            evt_type = evt.get("type")
            print(f"  -> Approval Execution Event: {evt_type}")
            if evt_type == "turn.complete":
                completed = True
                print(f"[OK] Turn completed! Status: {evt.get('status')}")
                clean_summary = evt.get('summary', '').encode('ascii', errors='ignore').decode('ascii')
                print(f"Summary: {clean_summary[:80]}...")
                break

        assert completed, "Turn did not complete after approval"

    print("=" * 60)
    print("SUCCESS: Full Agent Loop + Human Approval Verified!")
    print("=" * 60)

if __name__ == "__main__":
    run_agent_test()
