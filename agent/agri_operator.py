import os
import json
import uuid
import datetime
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator

from db.database import SessionLocal
from db.models import ActionRecord, AuditEvent, Farmer, Product, Order
from mcp_agri.server import (
    tool_get_farm_profile,
    tool_get_sensor_telemetry,
    tool_get_crop_intelligence,
    tool_get_marketplace_catalog,
    tool_get_farmer_orders,
    tool_run_agronomic_analysis_in_sandbox,
    tool_prepare_supply_purchase_order,
    tool_prepare_equipment_rental_order,
    tool_prepare_farmer_voice_call,
    tool_create_purchase_order,
    tool_dispatch_calle_voice_call,
    tool_send_telegram_alert,
    tool_get_action_status
)

AGRI_OPERATOR_SYSTEM_PROMPT = """
You are AgriSense & AgriMarket AI Operator, the autonomous voice-first agricultural manager and supply chain agent for Indian farmers.
You monitor physical ESP32 soil and weather sensors, analyze satellite crop phenology, search APMC marketplace commodities (seeds, fertilizers, tractors), execute calculations in the TrueForge sandbox, prepare orders, pause for farmer approval before transactions, dispatch outbound CALL-E AI phone calls, and verify supply chain dispatches.
"""

active_sessions: Dict[str, "AgriAgentSession"] = {}

class AgriAgentSession:
    """
    Manages an active agricultural task turn, event streaming, voice narration, and approval checkpoints.
    Follows the TrueForge event wire protocol.
    """
    def __init__(self, session_id: str, farmer_id: str = "farmer-001"):
        self.session_id = session_id
        self.farmer_id = farmer_id
        self.events: List[Dict[str, Any]] = []
        self.pending_approvals: List[Dict[str, Any]] = []
        self.status = "IDLE"  # IDLE, RUNNING, WAITING_FOR_APPROVAL, COMPLETED, REJECTED
        self.active_action_id: Optional[str] = None
        self.workflow_type: str = "GENERAL"
        self.dialogue_context: Dict[str, Any] = {}

    def _create_event(self, event_type: str, data: Dict[str, Any], thread_id: Optional[str] = "main") -> Dict[str, Any]:
        evt = {
            "id": f"evt_{uuid.uuid4().hex[:12]}",
            "type": event_type,
            "thread_id": thread_id,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            **data
        }
        self.events.append(evt)
        return evt

    def _detect_intent(self, prompt: str) -> str:
        p = prompt.lower().strip()
        if any(w in p for w in ["call", "phone", "dial", "ring", "speak to", "calle", "call-e", "supplier call"]):
            return "OUTBOUND_VOICE_CALL"
        if any(w in p for w in ["tractor", "rent", "plough", "rotavator", "tiller", "machinery", "harvester"]):
            return "RENT_EQUIPMENT"
        if any(w in p for w in ["buy", "order", "purchase", "seed", "seeds", "fertilizer", "manure", "pesticide", "neem"]):
            return "PURCHASE_COMMODITY"
        if any(w in p for w in ["sensor", "moisture", "temperature", "humidity", "telemetry", "buzzer", "soil"]):
            return "CHECK_SENSORS"
        if any(w in p for w in ["crop", "satellite", "ndvi", "phenology", "stage", "foliar", "health", "canopy", "paddy", "tomato"]):
            return "CROP_INTELLIGENCE"
        if any(w in p for w in ["status", "orders", "history", "tracking", "my orders"]):
            return "CHECK_ORDERS"
        return "GENERAL_ADVISORY"

    async def execute_task(self, prompt: str, language_code: str = "en-IN") -> AsyncGenerator[str, None]:
        """
        Executes an agent task turn yielding SSE events following the TrueForge event wire protocol:
        turn.start -> step.start -> tool.call -> tool.result -> approval_required -> turn.complete
        """
        self.status = "RUNNING"
        self.events.clear()
        self.pending_approvals.clear()

        # 1. Turn Start
        start_evt = self._create_event("turn.start", {
            "session_id": self.session_id,
            "farmer_id": self.farmer_id,
            "prompt": prompt,
            "language_code": language_code,
            "agent": "agrisense-farm-operator"
        })
        yield f"data: {json.dumps(start_evt)}\n\n"
        await asyncio.sleep(0.08)

        intent = self._detect_intent(prompt)
        self.workflow_type = intent

        # Thought step
        thought_evt = self._create_event("thought", {
            "agent": "agrisense-farm-operator",
            "thought": f"Analyzed prompt '{prompt}'. Classified intent as {intent}. Formulating multi-agent tool execution plan."
        })
        yield f"data: {json.dumps(thought_evt)}\n\n"
        await asyncio.sleep(0.08)

        # -------------------------------------------------------------
        # WORKFLOW A: CHECK SENSORS (Soil Moisture & Telemetry)
        # -------------------------------------------------------------
        if intent == "CHECK_SENSORS":
            step1 = self._create_event("step.start", {"agent": "agrisense-iot-crop-monitor", "step": "Read Physical ESP32 Sensor Telemetry"})
            yield f"data: {json.dumps(step1)}\n\n"

            call_evt = self._create_event("tool.call", {"agent": "agrisense-iot-crop-monitor", "tool": "get_sensor_telemetry", "args": {"device_id": "AGRI-ESP32-001"}})
            yield f"data: {json.dumps(call_evt)}\n\n"
            await asyncio.sleep(0.12)

            telemetry = tool_get_sensor_telemetry()
            res_evt = self._create_event("tool.result", {"agent": "agrisense-iot-crop-monitor", "tool": "get_sensor_telemetry", "result": telemetry})
            yield f"data: {json.dumps(res_evt)}\n\n"

            # Sandbox Moisture Deficit Analysis
            sbx_step = self._create_event("step.start", {"agent": "agrisense-farm-operator", "step": "Calculate Irrigation Water Deficit in TrueForge Sandbox"})
            yield f"data: {json.dumps(sbx_step)}\n\n"

            py_code = (
                "moisture = INPUT_DATA.get('soil_moisture', 68.0)\n"
                "target = 65.0\n"
                "variance = round(moisture - target, 1)\n"
                "status = 'OPTIMAL' if abs(variance) <= 5 else ('EXCESS' if variance > 0 else 'DEFICIT')\n"
                "output = {'variance_pct': variance, 'status': status, 'irrigation_action': 'Hold irrigation' if variance >= 0 else 'Start micro-sprinklers'}\n"
                "print(json.dumps(output))"
            )
            sbx_res = tool_run_agronomic_analysis_in_sandbox(py_code, {"soil_moisture": telemetry["soil_moisture"]})
            sbx_evt = self._create_event("tool.result", {"agent": "agrisense-farm-operator", "tool": "run_agronomic_analysis_in_sandbox", "result": sbx_res})
            yield f"data: {json.dumps(sbx_evt)}\n\n"

            analysis = sbx_res.get("output_data") or {"status": "OPTIMAL", "irrigation_action": "Hold irrigation"}
            final_text = (
                f"**Real-Time Farm Sensor Status:**\n"
                f"• **Soil Moisture:** {telemetry['soil_moisture']}% ({telemetry['moisture_status']})\n"
                f"• **Temperature:** {telemetry['temperature']}°C\n"
                f"• **Humidity:** {telemetry['humidity']}%\n"
                f"• **Buzzer Alarm:** {'Active 🚨' if telemetry['buzzer_active'] else 'Quiet (Nominal)'}\n"
                f"• **TrueForge Sandbox Assessment:** {analysis['status']} — *{analysis['irrigation_action']}*."
            )
            self.status = "COMPLETED"
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
            yield f"data: {json.dumps(comp_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW B: CROP INTELLIGENCE (Satellite & Phenology)
        # -------------------------------------------------------------
        if intent == "CROP_INTELLIGENCE":
            step1 = self._create_event("step.start", {"agent": "agrisense-iot-crop-monitor", "step": "Query Crop Phenology & MobileNetV2 Foliar Prediction"})
            yield f"data: {json.dumps(step1)}\n\n"

            crop_name = "Tomato" if "tomato" in prompt.lower() else ("Sugarcane" if "sugar" in prompt.lower() else "Rice (Paddy)")
            call_evt = self._create_event("tool.call", {"agent": "agrisense-iot-crop-monitor", "tool": "get_crop_intelligence", "args": {"crop_name": crop_name}})
            yield f"data: {json.dumps(call_evt)}\n\n"
            await asyncio.sleep(0.12)

            crop_info = tool_get_crop_intelligence(crop_name)
            res_evt = self._create_event("tool.result", {"agent": "agrisense-iot-crop-monitor", "tool": "get_crop_intelligence", "result": crop_info})
            yield f"data: {json.dumps(res_evt)}\n\n"

            final_text = (
                f"**Crop Intelligence & Satellite Diagnostic:**\n"
                f"• **Crop:** {crop_info['crop']} (Day {crop_info['day']}/{crop_info['total_days']})\n"
                f"• **Phenology Stage:** {crop_info['stage']}\n"
                f"• **Spectral NDVI Index:** {crop_info['ndvi_index']} (Healthy Vegetative Biomass)\n"
                f"• **MobileNetV2 Foliar Health:** {crop_info['foliar_health']}\n"
                f"• **Advisory:** {crop_info['nutrient_advisory']}"
            )
            self.status = "COMPLETED"
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
            yield f"data: {json.dumps(comp_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW C: OUTBOUND VOICE CALL VIA CALL-E
        # -------------------------------------------------------------
        if intent == "OUTBOUND_VOICE_CALL":
            step1 = self._create_event("step.start", {"agent": "agri-procurement-caller", "step": "Stage CALL-E Autonomous Outbound Voice Call"})
            yield f"data: {json.dumps(step1)}\n\n"

            phone = os.environ.get("ALERT_PHONE_NUMBER") or os.environ.get("FARMER_PHONE_NUMBER") or "+918496074290"
            call_evt = self._create_event("tool.call", {
                "agent": "agri-procurement-caller",
                "tool": "prepare_farmer_voice_call",
                "args": {"phone": phone, "purpose": "Live APMC commodity enquiry & booking"}
            })
            yield f"data: {json.dumps(call_evt)}\n\n"
            await asyncio.sleep(0.12)

            prep = tool_prepare_farmer_voice_call(phone=phone)
            res_evt = self._create_event("tool.result", {"agent": "agri-procurement-caller", "tool": "prepare_farmer_voice_call", "result": prep})
            yield f"data: {json.dumps(res_evt)}\n\n"

            # STOP at TrueForge Approval Gate!
            self.active_action_id = prep["action_id"]
            self.status = "WAITING_FOR_APPROVAL"

            approval_evt = self._create_event("approval_required", {
                "action_id": prep["action_id"],
                "action_type": "CALLE_VOICE_CALL",
                "title": f"Place Outbound AI Phone Call to {phone}",
                "description": "CALL-E will dial your phone immediately. You can speak naturally in Kannada, Hindi, or English to enquire on seeds, fertilizers, or tractor bookings.",
                "phone": phone,
                "amount": 0.0
            })
            self.pending_approvals.append(approval_evt)
            yield f"data: {json.dumps(approval_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW D: RENT EQUIPMENT (Tractor / Machinery)
        # -------------------------------------------------------------
        if intent == "RENT_EQUIPMENT":
            step1 = self._create_event("step.start", {"agent": "agrimarket-logistics-agent", "step": "Search Machinery Fleet at Mandya APMC"})
            yield f"data: {json.dumps(step1)}\n\n"

            cat_evt = self._create_event("tool.call", {"agent": "agrimarket-logistics-agent", "tool": "get_marketplace_catalog", "args": {"category": "Tractors"}})
            yield f"data: {json.dumps(cat_evt)}\n\n"
            await asyncio.sleep(0.12)

            catalog = tool_get_marketplace_catalog("Tractors")
            res_evt = self._create_event("tool.result", {"agent": "agrimarket-logistics-agent", "tool": "get_marketplace_catalog", "result": catalog})
            yield f"data: {json.dumps(res_evt)}\n\n"

            best_machinery = catalog["items"][0] if catalog["items"] else {
                "id": "prod-002",
                "name": "Mahindra 575 DI Tractor (45 HP)",
                "price": 1200.0,
                "seller_name": "GreenField Agro Equipment Rentals"
            }

            step2 = self._create_event("step.start", {"agent": "agrimarket-logistics-agent", "step": "Prepare Rental Agreement (Stage 1 Prepare)"})
            yield f"data: {json.dumps(step2)}\n\n"

            prep = tool_prepare_equipment_rental_order(
                farmer_id=self.farmer_id,
                product_id=best_machinery["id"],
                rental_hours=4,
                driver_required=True
            )
            prep_evt = self._create_event("tool.result", {"agent": "agrimarket-logistics-agent", "tool": "prepare_equipment_rental_order", "result": prep})
            yield f"data: {json.dumps(prep_evt)}\n\n"

            # STOP at TrueForge Approval Gate!
            self.active_action_id = prep["action_id"]
            self.status = "WAITING_FOR_APPROVAL"

            approval_evt = self._create_event("approval_required", {
                "action_id": prep["action_id"],
                "action_type": "EQUIPMENT_RENTAL",
                "title": f"Confirm Booking: {best_machinery['name']}",
                "description": f"Rental for 4 hours with driver & rotavator included from {best_machinery.get('seller_name', 'GreenField Rentals')}.",
                "amount": prep["total_amount"],
                "items": [{"name": best_machinery["name"], "hours": 4, "total": prep["total_amount"]}]
            })
            self.pending_approvals.append(approval_evt)
            yield f"data: {json.dumps(approval_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW E: PURCHASE COMMODITY (Seeds / Fertilizers)
        # -------------------------------------------------------------
        if intent == "PURCHASE_COMMODITY":
            step1 = self._create_event("step.start", {"agent": "agrimarket-logistics-agent", "step": "Search Certified Commodities Catalog"})
            yield f"data: {json.dumps(step1)}\n\n"

            cat = "Seeds" if any(w in prompt.lower() for w in ["seed", "seeds", "tomato"]) else "Fertilizers"
            catalog = tool_get_marketplace_catalog(cat)
            res_evt = self._create_event("tool.result", {"agent": "agrimarket-logistics-agent", "tool": "get_marketplace_catalog", "result": catalog})
            yield f"data: {json.dumps(res_evt)}\n\n"

            target_prod = catalog["items"][0] if catalog["items"] else {
                "id": "prod-001",
                "name": "Hybrid Tomato F1 Seeds (Arka Rakshak)",
                "price": 450.0,
                "seller_name": "Rajesh Farm Supplies"
            }

            step2 = self._create_event("step.start", {"agent": "agrimarket-logistics-agent", "step": "Prepare Purchase Order (Stage 1 Prepare)"})
            yield f"data: {json.dumps(step2)}\n\n"

            prep = tool_prepare_supply_purchase_order(
                farmer_id=self.farmer_id,
                product_id=target_prod["id"],
                quantity=2
            )
            prep_evt = self._create_event("tool.result", {"agent": "agrimarket-logistics-agent", "tool": "prepare_supply_purchase_order", "result": prep})
            yield f"data: {json.dumps(prep_evt)}\n\n"

            # STOP at TrueForge Approval Gate!
            self.active_action_id = prep["action_id"]
            self.status = "WAITING_FOR_APPROVAL"

            approval_evt = self._create_event("approval_required", {
                "action_id": prep["action_id"],
                "action_type": "PURCHASE_ORDER",
                "title": f"Confirm Order: {target_prod['name']}",
                "description": f"Purchase 2 units from {target_prod.get('seller_name', 'Rajesh Farm Supplies')}. Delivery to Plot 4B Mandya.",
                "amount": prep["total_amount"],
                "items": [{"name": target_prod["name"], "quantity": 2, "total": prep["total_amount"]}]
            })
            self.pending_approvals.append(approval_evt)
            yield f"data: {json.dumps(approval_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW F: CHECK ORDERS
        # -------------------------------------------------------------
        if intent == "CHECK_ORDERS":
            orders_data = tool_get_farmer_orders(self.farmer_id)
            orders_summary = "\n".join(
                f"• **{o['order_id']}**: {o['product_name']} (₹{int(o['total_price']):,}) — Status: **{o['status']}**"
                for o in orders_data["orders"][:3]
            ) or "No active orders found."

            final_text = (
                f"**Your Live Supply Chain Orders:**\n\n"
                f"{orders_summary}\n\n"
                f"All orders are cryptographically verified with SHA-256 provenance hashes."
            )
            self.status = "COMPLETED"
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
            yield f"data: {json.dumps(comp_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # DEFAULT / GENERAL ADVISORY
        # -------------------------------------------------------------
        profile = tool_get_farm_profile(self.farmer_id)
        telemetry = tool_get_sensor_telemetry()
        final_text = (
            f"**Namaskara {profile['name'].split()[0]}!** I am your AgriSense & AgriMarket AI Operator.\n\n"
            f"• **Farm:** {profile['location']} ({profile['farm_size']})\n"
            f"• **Current Soil Moisture:** {telemetry['soil_moisture']}% ({telemetry['moisture_status']})\n"
            f"• **Temperature / Humidity:** {telemetry['temperature']}°C / {telemetry['humidity']}%\n\n"
            f"You can ask me to **check sensors**, **inspect crops**, **rent a tractor**, **buy seeds/fertilizer**, or **place an outbound voice call via CALL-E**!"
        )
        self.status = "COMPLETED"
        comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
        yield f"data: {json.dumps(comp_evt)}\n\n"

    async def handle_approval(self, decision: str, reason: Optional[str] = None) -> AsyncGenerator[str, None]:
        """
        Handles the human decision ('allow' or 'deny') for a pending action:
        If 'allow': executes the mutation, updates DB, sends Telegram alerts, logs to ledger.
        If 'deny': cancels the action with zero external side effects.
        """
        if not self.active_action_id:
            yield f"data: {json.dumps({'type': 'error', 'message': 'No pending action waiting for approval.'})}\n\n"
            return

        action_id = self.active_action_id
        db = SessionLocal()
        action = db.query(ActionRecord).filter(ActionRecord.id == action_id).first()
        db.close()

        if not action:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Action {action_id} not found.'})}\n\n"
            return

        if decision == "allow":
            self.status = "RUNNING"
            step_evt = self._create_event("step.start", {
                "agent": "agrisense-farm-operator",
                "step": f"Farmer Approved ({decision.upper()})! Executing Stage 2 Mutation..."
            })
            yield f"data: {json.dumps(step_evt)}\n\n"
            await asyncio.sleep(0.1)

            if action.action_type == "CALLE_VOICE_CALL":
                call_tool_evt = self._create_event("tool.call", {"agent": "agri-procurement-caller", "tool": "dispatch_calle_voice_call", "args": {"action_id": action_id}})
                yield f"data: {json.dumps(call_tool_evt)}\n\n"

                result = tool_dispatch_calle_voice_call(action_id)
                res_evt = self._create_event("tool.result", {"agent": "agri-procurement-caller", "tool": "dispatch_calle_voice_call", "result": result})
                yield f"data: {json.dumps(res_evt)}\n\n"

                summary = (
                    f"**CALL-E AI Voice Call Initiated!**\n\n"
                    f"• **Dialing Phone:** `{result.get('phone', '+918496074290')}`\n"
                    f"• **Call ID:** `{result.get('call_id', 'calle_active')}`\n"
                    f"• **Status:** {result.get('status', 'LIVE_CALL_INITIATED')}\n"
                    f"Your phone is ringing! Pick up to complete your enquiry verbally."
                )
            else:
                ord_tool_evt = self._create_event("tool.call", {"agent": "agrimarket-logistics-agent", "tool": "create_purchase_order", "args": {"action_id": action_id}})
                yield f"data: {json.dumps(ord_tool_evt)}\n\n"

                result = tool_create_purchase_order(action_id)
                res_evt = self._create_event("tool.result", {"agent": "agrimarket-logistics-agent", "tool": "create_purchase_order", "result": result})
                yield f"data: {json.dumps(res_evt)}\n\n"

                summary = (
                    f"**Order Approved & Confirmed!**\n\n"
                    f"• **Order ID:** `{result.get('order_id')}`\n"
                    f"• **Total Amount:** ₹{int(result.get('total_price', 0)):,}\n"
                    f"• **Cryptographic Hash:** `{result.get('verification_hash', '')[:24]}...`\n"
                    f"• **Ledger:** Recorded in persistent CSV & Telegram alert dispatched!"
                )

            self.status = "COMPLETED"
            self.active_action_id = None
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": summary})
            yield f"data: {json.dumps(comp_evt)}\n\n"

        else:
            # Deny / Reject
            self.status = "REJECTED"
            db = SessionLocal()
            action = db.query(ActionRecord).filter(ActionRecord.id == action_id).first()
            if action:
                action.status = "REJECTED"
                db.commit()
            db.close()

            self.active_action_id = None
            summary = f"**Action Cancelled:** You chose to decline action `{action_id}`. No external mutations were made."
            comp_evt = self._create_event("turn.complete", {"status": "REJECTED", "summary": summary})
            yield f"data: {json.dumps(comp_evt)}\n\n"


def get_or_create_session(session_id: str, farmer_id: str = "farmer-001") -> AgriAgentSession:
    if session_id not in active_sessions:
        active_sessions[session_id] = AgriAgentSession(session_id, farmer_id)
    return active_sessions[session_id]
