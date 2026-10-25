import os
import uuid
import httpx
from typing import Dict, Any, List, Optional
from db.database import reload_env

class CallEClient:
    """
    Direct integration client for CALL-E Outbound Voice Call Agent (https://api.heycall-e.com/v1/calls).
    Places live phone calls to farmers and suppliers with real agricultural domain knowledge.
    """

    @staticmethod
    def place_call(
        phone_number: str,
        task_prompt: Optional[str] = None,
        commodities_summary: Optional[str] = None,
        booking_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        reload_env()
        api_key = os.environ.get("CALLE_API_KEY", "").strip()
        base_url = os.environ.get("CALLE_BASE_URL", "https://api.heycall-e.com").strip().rstrip("/")
        target_phone = phone_number.strip() or os.environ.get("FARMER_PHONE_NUMBER", "+918496074290").strip()

        if not booking_id:
            booking_id = f"AGRI-BOOK-{uuid.uuid4().hex[:4].upper()}"

        if not commodities_summary:
            commodities_summary = (
                "1. Hybrid Tomato F1 Seeds (Arka Rakshak): Rs. 450 per 50g packet (24 packets in stock)\n"
                "2. Mahindra 575 DI Tractor (45 HP): Rs. 1,200 per hour rental (driver & rotavator included)\n"
                "3. Kaveri Organic Vermicompost Manure: Rs. 350 per 50kg bag (80 bags in stock)\n"
                "4. Cold Pressed Neem Oil 10,000 PPM Bio-Pesticide: Rs. 520 per litre (45 bottles in stock)"
            )

        if not task_prompt:
            task_prompt = (
                f"Role: You are the AgriMarket Voice Representative calling from Mandya APMC Yard, Karnataka to speak with farmer Ramesh at {target_phone}.\n"
                f"Goal: Inform the farmer about available inventory and confirm if they want to order seeds, fertilizer, or book a tractor.\n"
                f"Live Inventory Available at Mandya Hub:\n{commodities_summary}\n\n"
                f"Instructions:\n"
                f"1. Warm Greeting: 'Namaskara Ramesh! I am your AgriMarket Voice Assistant calling from Mandya APMC. How can I assist your farm today?'\n"
                f"2. Quotation: Clearly state exact price in Rupees and available quantities.\n"
                f"3. Verbal Confirmation: If the farmer agrees to buy or rent, confirm with: 'Booking confirmed! Your order reference is {booking_id}. Scheduled for dispatch to your farm at Plot 4B Mandya. Payment settled upon delivery.'\n"
                f"4. Politeness: Thank the farmer and wish them a bountiful harvest!\n"
                f"Success criteria: The farmer answers, hears the inventory options, and confirms or declines the booking.\n"
                f"Failure criteria: The farmer does not answer, hangs up immediately, or line is busy."
            )

        if not api_key:
            return {
                "success": False,
                "triggered": False,
                "status": "API_KEY_REQUIRED",
                "phone": target_phone,
                "booking_id": booking_id,
                "error": "CALLE_API_KEY is not set in .env file."
            }

        endpoint = f"{base_url}/v1/calls"
        payload = {
            "task": task_prompt,
            "recipients": [{"phones": [target_phone]}],
            "metadata": {
                "booking_id": booking_id,
                **(metadata or {})
            }
        }

        try:
            with httpx.Client(timeout=35.0) as client:
                resp = client.post(
                    endpoint,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "Idempotency-Key": f"agri-{uuid.uuid4().hex}"
                    },
                    json=payload
                )

                data = resp.json() if resp.content else {}

                # 1. Successful Call Initiation
                if resp.status_code in (200, 201, 202):
                    call_id = data.get("id") or data.get("call_id") or f"calle_{uuid.uuid4().hex[:8]}"
                    print(f"[CALL-E] Live outbound call initiated! ID: {call_id} -> {target_phone}")
                    return {
                        "success": True,
                        "triggered": True,
                        "status": "LIVE_CALL_INITIATED",
                        "call_id": call_id,
                        "booking_id": booking_id,
                        "phone": target_phone,
                        "task_prompt": task_prompt,
                        "response": data
                    }

                # 2. Credit / Balance Exhausted (HTTP 402)
                if resp.status_code == 402 or "insufficient_balance" in resp.text:
                    err_msg = (
                        "Insufficient CALL-E account balance. "
                        "Please top up credits at https://dashboard.heycall-e.com/account/billing to place phone calls."
                    )
                    print(f"[CALL-E Notice] {err_msg}")
                    return {
                        "success": False,
                        "triggered": False,
                        "status": "INSUFFICIENT_CREDITS",
                        "phone": target_phone,
                        "booking_id": booking_id,
                        "error": err_msg,
                        "billing_url": "https://dashboard.heycall-e.com/account/billing",
                        "response": data
                    }

                # 3. Concurrency Limit (HTTP 429)
                if resp.status_code == 429 or "concurrency" in resp.text.lower():
                    err_msg = (
                        "CALL-E shared line is at its concurrency limit (1 active call). "
                        "Please wait 1-2 minutes for the previous task to finish on dashboard.heycall-e.com, then retry."
                    )
                    print(f"[CALL-E Notice] {err_msg}")
                    return {
                        "success": False,
                        "triggered": False,
                        "status": "CONCURRENCY_LIMIT",
                        "phone": target_phone,
                        "booking_id": booking_id,
                        "error": err_msg,
                        "response": data
                    }

                # 4. Other API Errors (e.g. 422 prompt validation)
                print(f"[CALL-E] API returned {resp.status_code}: {resp.text[:200]}")
                err_detail = data.get("error", {})
                if isinstance(err_detail, dict):
                    error_msg = err_detail.get("message") or data.get("message")
                else:
                    error_msg = data.get("message") or data.get("error") or f"HTTP {resp.status_code}"

                return {
                    "success": False,
                    "triggered": False,
                    "status": f"HTTP_{resp.status_code}",
                    "phone": target_phone,
                    "error": str(error_msg),
                    "response": data
                }

        except httpx.TimeoutException:
            err_msg = "CALL-E connection timed out while establishing phone call gateway. Please retry."
            print(f"[CALL-E Timeout] {err_msg}")
            return {
                "success": False,
                "triggered": False,
                "status": "GATEWAY_TIMEOUT",
                "phone": target_phone,
                "error": err_msg
            }
        except Exception as e:
            print(f"[CALL-E Error] {e}")
            return {
                "success": False,
                "triggered": False,
                "status": "CONNECTION_ERROR",
                "phone": target_phone,
                "error": str(e)
            }
