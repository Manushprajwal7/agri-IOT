import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String(50), primary_key=True, default=lambda: f"farmer-{uuid.uuid4().hex[:6]}")
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    location = Column(String(200), default="Plot 4B, Mandya, Karnataka, India")
    farm_size = Column(String(50), default="12.4 Hectares (30.6 Acres)")
    primary_crops = Column(String(200), default="Rice (Paddy), Hybrid Tomato, Sugarcane")
    language = Column(String(10), default="kn")
    soil_type = Column(String(100), default="Red Sandy Loam with Clay Subsoil")
    irrigation_type = Column(String(100), default="Canal + Drip Micro-Irrigation")
    kcc_card_no = Column(String(50), default="KCC-KAR-2024-8841")
    connected_device = Column(String(50), default="AGRI-ESP32-001")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(String(50), primary_key=True, default=lambda: f"supp-{uuid.uuid4().hex[:6]}")
    name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    phone = Column(String(20), nullable=False)
    location = Column(String(200), default="Mandya APMC Yard, Karnataka")
    category = Column(String(100), default="Seeds & Fertilizers")
    rating = Column(Float, default=4.9)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True, default=lambda: f"prod-{uuid.uuid4().hex[:6]}")
    seller_id = Column(String(50), nullable=True)
    seller_name = Column(String(100), nullable=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    unit = Column(String(30), nullable=False)
    quantity_available = Column(Integer, default=10)
    location = Column(String(150), default="Mandya APMC, Karnataka")
    distance = Column(String(30), default="3.8 km")
    product_type = Column(String(20), default="sale")  # "sale" or "rental"
    description = Column(Text, nullable=True)
    badge = Column(String(50), nullable=True)
    verified_seller = Column(Boolean, default=True)
    specs = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, default=lambda: f"AGRI-ORD-{uuid.uuid4().hex[:6].upper()}")
    farmer_id = Column(String(50), default="farmer-001")
    seller_id = Column(String(50), nullable=True)
    seller_name = Column(String(100), nullable=True)
    product_id = Column(String(50), nullable=False)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    unit = Column(String(30), default="unit")
    status = Column(String(30), default="CONFIRMED")  # CONFIRMED, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    delivery_location = Column(String(200), default="Plot 4B, Mandya, Karnataka")
    payment_method = Column(String(50), default="Kisan Credit Card / UPI")
    payment_status = Column(String(20), default="PAID")
    verification_hash = Column(String(100), nullable=True)
    tracking_step = Column(Integer, default=1)  # 1 to 5
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

class SensorTelemetry(Base):
    __tablename__ = "sensor_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(50), default="AGRI-ESP32-001")
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    soil_raw = Column(Integer, default=2200)
    moisture_status = Column(String(20), default="normal")
    environment_status = Column(String(50), default="Optimal")
    buzzer_active = Column(Boolean, default=False)
    source = Column(String(30), default="SIMULATOR")  # "SIMULATOR" or "HARDWARE_ESP32"
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class ActionRecord(Base):
    __tablename__ = "action_records"

    id = Column(String(50), primary_key=True, default=lambda: f"act_{uuid.uuid4().hex[:8]}")
    action_type = Column(String(50), nullable=False)  # PURCHASE_ORDER, EQUIPMENT_RENTAL, CALLE_VOICE_CALL, TELEGRAM_ALERT, IRRIGATION_CONTROL
    status = Column(String(30), default="PENDING_APPROVAL")  # PENDING_APPROVAL, APPROVED, EXECUTED, REJECTED, FAILED
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    farmer_id = Column(String(50), default="farmer-001")
    amount = Column(Float, default=0.0)
    payload = Column(JSON, default=dict)
    execution_result = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    approved_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(50), primary_key=True, default=lambda: f"aud_{uuid.uuid4().hex[:8]}")
    agent_id = Column(String(50), default="agrisense-farm-operator")
    event_type = Column(String(50), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
