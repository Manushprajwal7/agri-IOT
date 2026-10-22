import os
import csv
import datetime
import httpx
from typing import Dict, Any, List
from db.database import ROOT_DIR, reload_env

LEDGER_PATH = os.path.join(ROOT_DIR, "data", "supply_chain_ledger.csv")

def append_to_ledger(record: Dict[str, Any]) -> str:
    reload_env()
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    fieldnames = [
        "Timestamp",
        "Action_ID",
        "Action_Type",
        "Reference_No",
        "Commodity",
        "Counterparty",
        "Amount_INR",
        "Status",
        "Verification_Hash"
    ]
    file_exists = os.path.exists(LEDGER_PATH) and os.path.getsize(LEDGER_PATH) > 0
    row = {
        "Timestamp": record.get("Timestamp", datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")),
        "Action_ID": record.get("Action_ID", ""),
        "Action_Type": record.get("Action_Type", ""),
        "Reference_No": record.get("Reference_No", ""),
        "Commodity": record.get("Commodity", ""),
        "Counterparty": record.get("Counterparty", ""),
        "Amount_INR": record.get("Amount_INR", 0),
        "Status": record.get("Status", "EXECUTED"),
        "Verification_Hash": record.get("Verification_Hash", "")
    }

    with open(LEDGER_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    sheet_webhook = os.environ.get("SPREADSHEET_WEBHOOK_URL", "").strip()
    if sheet_webhook and "docs.google.com/spreadsheets" not in sheet_webhook:
        try:
            httpx.post(sheet_webhook, json=row, timeout=5.0)
        except Exception:
            pass

    return LEDGER_PATH

def get_ledger_records(limit: int = 50) -> List[Dict[str, Any]]:
    if not os.path.exists(LEDGER_PATH):
        return []
    records = []
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            records.append(r)
    return list(reversed(records))[:limit]
