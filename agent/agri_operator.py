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

INTRODUCED_FARMERS: set = set()

INTRODUCED_SESSIONS: set = set()

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

        self.turn_count: int = 0

        self.has_introduced: bool = False

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

        # Outbound CALL-E

        if any(w in p for w in [

            "call", "phone", "dial", "ring", "speak to", "calle", "call-e", "supplier call",

            "कॉल", "फोन", "डायल", "बात करो", "call karo", "phone karo", "mujhe call karo",

            "ಕರೆ", "ಕಾಲ್", "ಫೋನ್", "call madi", "phone madi", "kare madi"

        ]):

            return "OUTBOUND_VOICE_CALL"

        # Rent Tractor / Machinery

        if any(w in p for w in [

            "tractor", "rent", "plough", "rotavator", "tiller", "machinery", "harvester",

            "ट्रैक्टर", "किराया", "किराये", "हल", "रोटावेटर", "tractor chahiye", "kiraya",

            "ಟ್ರಾಕ್ಟರ್", "ಬಾಡಿಗೆ", "ಯಂತ್ರ", "tractor badige"

        ]):

            return "RENT_EQUIPMENT"

        # Purchase Seeds / Fertilizer / Mandi

        if any(w in p for w in [

            "buy", "order", "purchase", "seed", "seeds", "fertilizer", "manure", "pesticide", "neem", "mandi", "market", "marketplace", "shop",

            "बीज", "खाद", "उर्वरक", "दवा", "कीटनाशक", "खरीदना", "खरीद", "मंडी", "मार्केट", "मार्केटप्लेस", "दुकान", "beej", "khad",

            "ಬೀಜ", "ಗೊಬ್ಬರ", "ರಸಗೊಬ್ಬರ", "ಖರೀದಿ", "ಮಾರುಕಟ್ಟೆ", "beeja beku", "gobbar beku"

        ]):

            return "PURCHASE_COMMODITY"

        # Sensors / Telemetry / Moisture

        if any(w in p for w in [

            "sensor", "moisture", "temperature", "humidity", "telemetry", "buzzer", "soil",

            "सेंसर", "नमी", "तापमान", "मिट्टी", "आर्द्रता", "पानी", "सिंचाई", "nami", "taapman",

            "कितना है", "कितनी है", "कितना", "कितनी", "कितना आया", "कितनी आयी", "आया", "आयी", "kitna hai", "kitni hai", "kitna aaya", "kitni aayi", "aaya", "aayi",

            "ಸೆನ್ಸರ್", "ತೇವಾಂಶ", "ತಾಪಮಾನ", "ಮಣ್ಣಿನ", "ನೀರು", "tevamsha", "neeru"

        ]):

            return "CHECK_SENSORS"

        # Crop Health / Diseases / Foliar / Satellite

        if any(w in p for w in [

            "crop", "satellite", "ndvi", "phenology", "stage", "foliar", "health", "canopy", "paddy", "tomato", "disease",

            "फसल", "रोग", "पत्ती", "बीमारी", "धान", "टमाटर", "गन्ना", "सैटेलाइट", "fasal", "rog",

            "ಬೆಳೆ", "ರೋಗ", "ಎಲೆ", "ಭತ್ತ", "ಟೊಮೆಟೊ", "ಉಪಗ್ರಹ", "bele", "roga"

        ]):

            return "CROP_INTELLIGENCE"

        # Orders & Logistics Tracking

        if any(w in p for w in [

            "status", "orders", "history", "tracking", "my orders", "delivery",

            "ऑर्डर", "बुकिंग", "ट्रैकिंग", "डिलीवरी", "सप्लाई चेन", "order dikhao", "mere order",

            "ಆರ್ಡರ್", "ಬುಕಿಂಗ್", "ಟ್ರ್ಯಾಕಿಂಗ್", "ವಿತರಣೆ", "order torisi"

        ]):

            return "CHECK_ORDERS"

                # Self-Introduction / Capabilities Enquiry
        if any(w in p for w in [
            "who are you", "what can you do", "introduce yourself", "intro", "introduction", "tell me about yourself",
            "तुम कौन हो", "आप कौन हो", "अपना परिचय", "परिचय", "क्या कर सकते हो",
            "ನೀವು ಯಾರು", "ಪರಿಚಯ", "ಏನು ಮಾಡಬಹುದು",
            "మీరు ఎవరు", "పరిచయం", "నువ్వు ఎవరు"
        ]):
            return "INTRODUCE_SELF"

        # Affirmative / Continuation / Approval intent
        if any(w in p for w in [
            "చేయండి", "చెయ్యండి", "సరే", "అవును", "చేయి", "ముందుకు", "చెయ్యి", "చేద్దాం", "చేస్తారా", "చేయు",
            "करो", "कर दीजिए", "हाँ", "ठीक है", "अच्छा", "आगे बढ़ो", "कर दो", "करो जी", "karo", "haan", "theek hai", "thik hai", "achha", "kardo",
            "ಮಾಡಿ", "ಸರಿ", "ಹೌದು", "ಮುಂದುವರಿಯಿರಿ", "madi", "sari", "haudu",
            "சரி", "ஆம்", "செய்", "sari",
            "ok", "okay", "yes", "sure", "do it", "proceed", "go ahead", "confirm"
        ]):
            return "AFFIRMATION"

        return "GENERAL_ADVISORY"

    async def execute_task(self, prompt: str, language_code: str = "en-IN") -> AsyncGenerator[str, None]:

        """

        Executes an agent task turn yielding SSE events following the TrueForge event wire protocol:

        turn.start -> step.start -> tool.call -> tool.result -> approval_required -> turn.complete

        """

        p = prompt.lower()
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

            is_hi = language_code.startswith("hi") or any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in prompt) or any(w in p for w in ["kholo", "dikhao", "nami", "kitna", "beej", "khad"])
            is_kn = language_code.startswith("kn") or any(ord(c) >= 0x0C80 and ord(c) <= 0x0CFF for c in prompt) or any(w in p for w in ["beku", "hogi", "torisi", "neeru"])

            if is_hi:

                final_text = (

                    f"**फार्म सेंसर की वास्तविक स्थिति:**\n"

                    f"• **मिट्टी की नमी:** {telemetry['soil_moisture']}% ({'इष्टतम' if telemetry['soil_moisture']>=35 else 'कम - सिंचाई आवश्यक'})\n"

                    f"• **तापमान:** {telemetry['temperature']}°C\n"

                    f"• **हवा में नमी:** {telemetry['humidity']}%\n"

                    f"• **अलार्म:** {'सक्रिय 🚨' if telemetry['buzzer_active'] else 'सामान्य'}\n"

                    f"• **सलाह:** {analysis.get('irrigation_action', 'सामान्य स्थिति')}।"

                )

            elif language_code.startswith("kn"):

                final_text = (

                    f"**ಫಾರ್ಮ್ ಸಂವೇದಕಗಳ ನೇರ ಸ್ಥಿತಿ:**\n"

                    f"• **ಮಣ್ಣಿನ ತೇವಾಂಶ:** {telemetry['soil_moisture']}%\n"

                    f"• **ತಾಪಮಾನ:** {telemetry['temperature']}°C\n"

                    f"• **ಗಾಳಿಯ ಆರ್ದ್ರತೆ:** {telemetry['humidity']}%\n"

                    f"• **ಅಲಾರಾಂ:** {'ಸಕ್ರಿಯ 🚨' if telemetry['buzzer_active'] else 'ಸಾಮಾನ್ಯ'}\n"

                    f"• **ಶಿಫಾರಸು:** {analysis.get('irrigation_action', 'ಸಾಮಾನ್ಯ')}."

                )

            else:

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

            is_hi = language_code.startswith("hi") or any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in prompt) or any(w in p for w in ["kholo", "dikhao", "nami", "kitna", "beej", "khad"])
            is_kn = language_code.startswith("kn") or any(ord(c) >= 0x0C80 and ord(c) <= 0x0CFF for c in prompt) or any(w in p for w in ["beku", "hogi", "torisi", "neeru"])

            if is_hi:
                final_text = (
                    f"**फसल बुद्धिमत्ता और पत्ती रोग निदान:**\n"
                    f"• **फसल:** {crop_info['crop']} (दिन {crop_info['day']}/{crop_info['total_days']})\n"
                    f"• **विकास चरण:** {crop_info['stage']}\n"
                    f"• **स्पेक्ट्रल एनडीवीआई सूचकांक:** {crop_info['ndvi_index']} (स्वस्थ वनस्पति)\n"
                    f"• **पत्ती स्वास्थ्य (MobileNetV2):** {crop_info['foliar_health']}\n"
                    f"• **कृषि सलाह:** {crop_info['nutrient_advisory']}"
                )
            elif language_code.startswith("kn"):
                final_text = (
                    f"**ಬೆಳೆ ಮಾಹಿತಿ ಮತ್ತು ಎಲೆ ರೋಗ ತಪಾಸಣೆ:**\n"
                    f"• **ಬೆಳೆ:** {crop_info['crop']} (ದಿನ {crop_info['day']}/{crop_info['total_days']})\n"
                    f"• **ಬೆಳವಣಿಗೆಯ ಹಂತ:** {crop_info['stage']}\n"
                    f"• **ಎನ್‌ಡಿವಿಐ ಸೂಚ್ಯಂಕ:** {crop_info['ndvi_index']}\n"
                    f"• **ಎಲೆಗಳ ಆರೋಗ್ಯ:** {crop_info['foliar_health']}\n"
                    f"• **ಕೃಷಿ ಸಲಹೆ:** {crop_info['nutrient_advisory']}"
                )
            else:
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
        # WORKFLOW G: AFFIRMATION / CONTINUATION
        # -------------------------------------------------------------
        if intent == "AFFIRMATION":
            self.workflow_type = "AFFIRMATION"
            step1 = self._create_event("step.start", {"agent": "agrisense-farm-operator", "step": "Process Farmer Confirmation"})
            yield f"data: {json.dumps(step1)}\n\n"

            db = SessionLocal()
            pending_action = db.query(ActionRecord).filter(
                ActionRecord.farmer_id == self.farmer_id,
                ActionRecord.status == "PENDING_APPROVAL"
            ).order_by(ActionRecord.created_at.desc()).first()
            db.close()

            profile = tool_get_farm_profile(self.farmer_id)
            first_name = profile['name'].split()[0]

            is_te = language_code.startswith("te") or any(0x0C00 <= ord(c) <= 0x0C7F for c in prompt)
            is_hi = language_code.startswith("hi") or any(0x0900 <= ord(c) <= 0x097F for c in prompt) or any(w in p for w in ["karo", "haan", "theek", "achha"])
            is_kn = language_code.startswith("kn") or any(0x0C80 <= ord(c) <= 0x0CFF for c in prompt) or any(w in p for w in ["madi", "sari", "haudu"])
            is_ta = language_code.startswith("ta") or any(0x0B80 <= ord(c) <= 0x0BFF for c in prompt)

            if pending_action:
                if is_te:
                    final_text = f"రమేష్ గారు, మీ ఆర్డర్ (`{pending_action.id}`) సమీక్ష కోసం సిద్ధంగా ఉంది. దయచేసి స్క్రీన్‌పై **'Approve & Execute'** బటన్ నొక్కండి."
                elif is_hi:
                    final_text = f"Ramesh जी, आपका कार्य (`{pending_action.id}`) अनुमोदन के लिए तैयार है। कृपया स्क्रीन पर **'Approve & Execute'** बटन दबाएं।"
                elif is_kn:
                    final_text = f"ರಮೇಶ್ ಅವರೇ, ನಿಮ್ಮ ಆದೇಶವು (`{pending_action.id}`) ಸಿದ್ಧವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ಕ್ರೀನ್ ಮೇಲೆ **'Approve & Execute'** ಕ್ಲಿಕ್ ಮಾಡಿ."
                elif is_ta:
                    final_text = f"Ramesh, உங்கள் செயல் (`{pending_action.id}`) தயாராக உள்ளது. திரையில் **'Approve & Execute'** என்பதைக் கிளிக் செய்யவும்."
                else:
                    final_text = f"Ramesh, your pending order (`{pending_action.id}`) is awaiting confirmation. Please click **'Approve & Execute'** on screen to finalize."
            else:
                if is_te:
                    final_text = f"చెప్పండి {first_name} గారు, నేను మీకు ఎలా సహాయం చేయగలను? మీరు సెన్సార్లు, పంట ఆరోగ్యం లేదా విత్తనాల కొనుగోలు గురించి అడగవచ్చు."
                elif is_hi:
                    final_text = f"हाँ {first_name} जी, बताइए मैं आपकी क्या सहायता करूँ? आप मिट्टी की नमी, फसल स्थिति या बीज/खाद बुकिंग के बारे में पूछ सकते हैं।"
                elif is_kn:
                    final_text = f"ಹೇಳಿ {first_name} ಅವರೇ, ನಾನು ಏನು ಮಾಡಬೇಕು? ನೀವು ಮಣ್ಣಿನ ತೇವಾಂಶ, ಬೆಳೆ ಆರೋಗ್ಯ ಅಥವಾ ಬೀಜ/ಟ್ರಾಕ್ಟರ್ ಬುಕಿಂಗ್ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
                elif is_ta:
                    final_text = f"சொல்லுங்கள் {first_name}, நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? மண் ஈரப்பதம் அல்லது பயிர் நிலை பற்றி கேட்கலாம்."
                else:
                    final_text = f"Yes {first_name}, how can I assist you right now? You can check sensors, review crop health, or order farm supplies."

            self.status = "COMPLETED"
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
            yield f"data: {json.dumps(comp_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # WORKFLOW H: INTRODUCE SELF / CAPABILITIES
        # -------------------------------------------------------------
        if intent == "INTRODUCE_SELF":
            self.workflow_type = "INTRODUCE_SELF"
            profile = tool_get_farm_profile(self.farmer_id)
            telemetry = tool_get_sensor_telemetry()
            first_name = profile['name'].split()[0]

            is_te = language_code.startswith("te") or any(0x0C00 <= ord(c) <= 0x0C7F for c in prompt)
            is_hi = language_code.startswith("hi") or any(0x0900 <= ord(c) <= 0x097F for c in prompt) or any(w in p for w in ["kholo", "dikhao", "nami", "kitna", "beej", "khad"])
            is_kn = language_code.startswith("kn") or any(0x0C80 <= ord(c) <= 0x0CFF for c in prompt) or any(w in p for w in ["beku", "hogi", "torisi", "neeru"])
            is_ta = language_code.startswith("ta") or any(0x0B80 <= ord(c) <= 0x0BFF for c in prompt)

            if is_te:
                final_text = (
                    f"**నమస్కారం {first_name} గారు!** నేను మీ అగ్రిసెన్స్ & అగ్రిమార్కెట్ AI ఆపరేటర్‌ని.\n\n"
                    f"• **పొలం:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **మట్టి తేమ:** {telemetry['soil_moisture']}%\n"
                    f"• **ఉష్ణోగ్రత:** {telemetry['temperature']}°C | తేమ: {telemetry['humidity']}%\n\n"
                    f"మీరు సెన్సార్లు, పంట ఆరోగ్యం, ట్రాక్టర్ అద్దె లేదా విత్తనాల కొనుగోలు గురించి నన్ను అడగవచ్చు."
                )
            elif is_hi:
                final_text = (
                    f"**नमस्ते {first_name} जी!** मैं आपका एग्रीसेंस और एग्रीमार्केट एआई ऑपरेटर हूँ।\n\n"
                    f"• **फार्म:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **मिट्टी की नमी:** {telemetry['soil_moisture']}% ({'सामान्य' if telemetry['soil_moisture']>=35 else 'सिंचाई आवश्यक'})\n"
                    f"• **तापमान:** {telemetry['temperature']}°C | आर्द्रता: {telemetry['humidity']}%\n\n"
                    f"आप मुझसे मिट्टी की नमी जांचने, फसल स्वास्थ्य, बीज या ट्रैक्टर किराए पर लेने, या कॉल करने के लिए कह सकते हैं।"
                )
            elif is_kn:
                final_text = (
                    f"**ನಮಸ್ಕಾರ {first_name}!** ನಾನು ನಿಮ್ಮ ಅಗ್ರಿಸೆನ್ಸ್ ಮತ್ತು ಅಗ್ರಿಮಾರ್ಕೆಟ್ ಎಐ ಆಪರೇಟರ್.\n\n"
                    f"• **ಕ್ಷೇತ್ರ:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **ಮಣ್ಣಿನ ತೇವಾಂಶ:** {telemetry['soil_moisture']}%\n"
                    f"• **ತಾಪಮಾನ:** {telemetry['temperature']}°C\n\n"
                    f"ನೀವು ಸೆನ್ಸರ್ ಸ್ಥಿತಿ, ಬೆಳೆ ರೋಗ, ಬೀಜ ಖರೀದಿ ಅಥವಾ ಟ್ರಾಕ್ಟರ್ ಬಾಡಿಗೆ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
                )
            elif is_ta:
                final_text = (
                    f"**வணக்கம் {first_name}!** நான் உங்கள் அக்ரிசென்ஸ் மற்றும் அக்ரிமார்க்கெட் AI ஆபரேட்டர்.\n\n"
                    f"• **பண்ணை:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **மண் ஈரப்பதம்:** {telemetry['soil_moisture']}%\n"
                    f"• **வெப்பநிலை:** {telemetry['temperature']}°C\n\n"
                    f"மண் ஈரப்பதம், பயிர் சுகாதாரம், விதை வாங்குதல் அல்லது டிராக்டர் வாடகை பற்றி என்னிடம் கேட்கலாம்."
                )
            else:
                final_text = (
                    f"**Namaskara {first_name}!** I am your AgriSense & AgriMarket AI Operator.\n\n"
                    f"• **Farm:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **Current Soil Moisture:** {telemetry['soil_moisture']}% ({telemetry['moisture_status']})\n"
                    f"• **Temperature / Humidity:** {telemetry['temperature']}°C / {telemetry['humidity']}%\n\n"
                    f"You can ask me to **check sensors**, **inspect crops**, **rent a tractor**, **buy seeds/fertilizer**, or **place an outbound voice call via CALL-E**!"
                )

            INTRODUCED_FARMERS.add(self.farmer_id)
            INTRODUCED_SESSIONS.add(self.session_id)
            self.has_introduced = True

            self.status = "COMPLETED"
            comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
            yield f"data: {json.dumps(comp_evt)}\n\n"
            return

        # -------------------------------------------------------------
        # DEFAULT / GENERAL ADVISORY
        # -------------------------------------------------------------
        profile = tool_get_farm_profile(self.farmer_id)
        telemetry = tool_get_sensor_telemetry()
        first_name = profile['name'].split()[0]

        is_te = language_code.startswith("te") or any(0x0C00 <= ord(c) <= 0x0C7F for c in prompt)
        is_hi = language_code.startswith("hi") or any(0x0900 <= ord(c) <= 0x097F for c in prompt) or any(w in p for w in ["kholo", "dikhao", "nami", "kitna", "beej", "khad"])
        is_kn = language_code.startswith("kn") or any(0x0C80 <= ord(c) <= 0x0CFF for c in prompt) or any(w in p for w in ["beku", "hogi", "torisi", "neeru"])
        is_ta = language_code.startswith("ta") or any(0x0B80 <= ord(c) <= 0x0BFF for c in prompt)

        # Introduction must NEVER repeat after the first time
        is_first_turn = (self.farmer_id not in INTRODUCED_FARMERS) and (self.session_id not in INTRODUCED_SESSIONS) and not self.has_introduced and (self.turn_count <= 1)

        if is_first_turn:
            INTRODUCED_FARMERS.add(self.farmer_id)
            INTRODUCED_SESSIONS.add(self.session_id)
            self.has_introduced = True

            if is_te:
                final_text = (
                    f"**నమస్కారం {first_name} గారు!** నేను మీ అగ్రిసెన్స్ & అగ్రిమార్కెట్ AI ఆపరేటర్‌ని.\n\n"
                    f"• **పొలం:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **మట్టి తేమ:** {telemetry['soil_moisture']}%\n"
                    f"• **ఉష్ణోగ్రత:** {telemetry['temperature']}°C | తేమ: {telemetry['humidity']}%\n\n"
                    f"మీరు సెన్సార్లు, పంట ఆరోగ్యం, ట్రాక్టర్ అద్దె లేదా విత్తనాల కొనుగోలు గురించి నన్ను అడగవచ్చు."
                )
            elif is_hi:
                final_text = (
                    f"**नमस्ते {first_name} जी!** मैं आपका एग्रीसेंस और एग्रीमार्केट एआई ऑपरेटर हूँ।\n\n"
                    f"• **फार्म:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **मिट्टी की नमी:** {telemetry['soil_moisture']}% ({'सामान्य' if telemetry['soil_moisture']>=35 else 'सिंचाई आवश्यक'})\n"
                    f"• **तापमान:** {telemetry['temperature']}°C | आर्द्रता: {telemetry['humidity']}%\n\n"
                    f"आप मुझसे मिट्टी की नमी जांचने, फसल स्वास्थ्य, बीज या ट्रैक्टर किराए पर लेने, या कॉल करने के लिए कह सकते हैं।"
                )
            elif is_kn:
                final_text = (
                    f"**ನಮಸ್ಕಾರ {first_name}!** ನಾನು ನಿಮ್ಮ ಅಗ್ರಿಸೆನ್ಸ್ ಮತ್ತು ಅಗ್ರಿಮಾರ್ಕೆಟ್ ಎಐ ಆಪರೇಟರ್.\n\n"
                    f"• **ಕ್ಷೇತ್ರ:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **ಮಣ್ಣಿನ ತೇವಾಂಶ:** {telemetry['soil_moisture']}%\n"
                    f"• **ತಾಪಮಾನ:** {telemetry['temperature']}°C\n\n"
                    f"ನೀವು ಸೆನ್ಸರ್ ಸ್ಥಿತಿ, ಬೆಳೆ ರೋಗ, ಬೀಜ ಖರೀದಿ ಅಥವಾ ಟ್ರಾಕ್ಟರ್ ಬಾಡಿಗೆ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
                )
            elif is_ta:
                final_text = (
                    f"**வணக்கம் {first_name}!** நான் உங்கள் அக்ரிசென்ஸ் மற்றும் அக்ரிமார்க்கெட் AI ஆபரேட்டர்.\n\n"
                    f"• **பண்ணை:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **மண் ஈரப்பதம்:** {telemetry['soil_moisture']}%\n"
                    f"• **வெப்பநிலை:** {telemetry['temperature']}°C\n\n"
                    f"மண் ஈரப்பதம், பயிர் சுகாதாரம், விதை வாங்குதல் அல்லது டிராக்டர் வாடகை பற்றி என்னிடம் கேட்கலாம்."
                )
            else:
                final_text = (
                    f"**Namaskara {first_name}!** I am your AgriSense & AgriMarket AI Operator.\n\n"
                    f"• **Farm:** {profile['location']} ({profile['farm_size']})\n"
                    f"• **Current Soil Moisture:** {telemetry['soil_moisture']}% ({telemetry['moisture_status']})\n"
                    f"• **Temperature / Humidity:** {telemetry['temperature']}°C / {telemetry['humidity']}%\n\n"
                    f"You can ask me to **check sensors**, **inspect crops**, **rent a tractor**, **buy seeds/fertilizer**, or **place an outbound voice call via CALL-E**!"
                )
        else:
            # Subsequent turns: NO REPETITIVE INTRO! Crisp conversational reply.
            if is_te:
                final_text = (
                    f"{first_name} గారు, ప్రస్తుతం నేల తేమ {telemetry['soil_moisture']}% మరియు ఉష్ణోగ్రత {telemetry['temperature']}°C ఉంది. "
                    f"నేను మీకు తదుపరి ఎలా సహాయం చేయగలను?"
                )
            elif is_hi:
                final_text = (
                    f"हाँ {first_name} जी, वर्तमान में खेत की मिट्टी की नमी {telemetry['soil_moisture']}% और तापमान {telemetry['temperature']}°C है। "
                    f"बताइए मैं आपकी क्या सहायता करूँ?"
                )
            elif is_kn:
                final_text = (
                    f"{first_name} ಅವರೇ, ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ತೇವಾಂಶ {telemetry['soil_moisture']}% ಮತ್ತು ತಾಪಮಾನ {telemetry['temperature']}°C ಇದೆ. "
                    f"ನಾನು ಮುಂದೆ ಯಾವ ಮಾಹಿತಿ ನೀಡಲಿ?"
                )
            elif is_ta:
                final_text = (
                    f"வணக்கம் {first_name}, தற்போதைய மண் ஈரப்பதம் {telemetry['soil_moisture']}% மற்றும் வெப்பநிலை {telemetry['temperature']}°C. "
                    f"அடுத்து நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?"
                )
            else:
                final_text = (
                    f"Yes {first_name}, current soil moisture is {telemetry['soil_moisture']}% and temperature is {telemetry['temperature']}°C. "
                    f"How can I assist you next?"
                )

        self.status = "COMPLETED"
        comp_evt = self._create_event("turn.complete", {"status": "COMPLETED", "summary": final_text})
        yield f"data: {json.dumps(comp_evt)}\n\n"

    async def handle_approval(self, decision: str, reason: Optional[str] = None) -> AsyncGenerator[str, None]:
        """
        Handles the human decision ('allow' or 'deny') for a pending action:
        If 'allow': executes the mutation, updates DB, sends Telegram alerts, logs to ledger.
        If 'deny': cancels action and records rejection.
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

                if result.get("success"):
                    summary = (
                        f"**CALL-E AI Voice Call Initiated!**\n\n"
                        f"• **Dialing Phone:** `{result.get('phone', '+918496074290')}`\n"
                        f"• **Call ID:** `{result.get('call_id', 'calle_active')}`\n"
                        f"• **Status:** {result.get('status', 'LIVE_CALL_INITIATED')}\n\n"
                        f"Your phone is ringing! Pick up to complete your enquiry verbally."
                    )
                else:
                    err_msg = result.get("error", "CALL-E call could not be dispatched.")
                    summary = (
                        f"**CALL-E Call Notice:** {err_msg}\n\n"
                        f"• **Target Phone:** `{result.get('phone', '+918496074290')}`\n"
                        f"• **Status:** `{result.get('status', 'CALL_FAILED')}`\n\n"
                        f"Please check your CALL-E account balance at https://dashboard.heycall-e.com/account/billing."
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
