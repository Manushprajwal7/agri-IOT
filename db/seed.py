import os
import json
from db.database import SessionLocal, init_db, ROOT_DIR
from db.models import Farmer, Supplier, Product, SensorTelemetry, Order

def seed_all():
    init_db()
    db = SessionLocal()
    try:
        # Seed Farmers & Suppliers from data/users.json
        users_file = os.path.join(ROOT_DIR, "data", "users.json")
        if os.path.exists(users_file):
            with open(users_file, "r", encoding="utf-8") as f:
                users_data = json.load(f)
                for u in users_data:
                    role = u.get("role")
                    if role == "farmer":
                        existing = db.query(Farmer).filter(Farmer.id == u["id"]).first()
                        if not existing:
                            db.add(Farmer(
                                id=u["id"],
                                name=u.get("name", "Demo Farmer"),
                                phone=u.get("phone", "+91 98450 12345"),
                                location=u.get("location", "Plot 4B, Mandya, Karnataka"),
                                farm_size=u.get("farmSize", "12.4 Ha"),
                                primary_crops=", ".join(u.get("primaryCrops", ["Rice (Paddy)", "Tomato"])),
                                language=u.get("language", "kn"),
                                soil_type=u.get("soilType", "Red Sandy Loam"),
                                irrigation_type=u.get("irrigationType", "Canal + Drip"),
                                kcc_card_no=u.get("kccCardNo", "KCC-KAR-2024-8841"),
                                connected_device=u.get("connectedDevice", "AGRI-ESP32-001")
                            ))
                    elif role in ("supplier", "equipment_owner"):
                        existing = db.query(Supplier).filter(Supplier.id == u["id"]).first()
                        if not existing:
                            db.add(Supplier(
                                id=u["id"],
                                name=u.get("name", "Supplier"),
                                contact_person=u.get("contactPerson", u.get("name")),
                                phone=u.get("phone", "+91 98452 77889"),
                                location=u.get("location", "Mandya APMC Yard"),
                                category=u.get("category", "Agriculture Inputs"),
                                rating=float(u.get("rating", 4.8)),
                                verified=bool(u.get("verifiedSupplier", True))
                            ))

        # Seed Products from data/products.json
        products_file = os.path.join(ROOT_DIR, "data", "products.json")
        if os.path.exists(products_file):
            with open(products_file, "r", encoding="utf-8") as f:
                products_data = json.load(f)
                for p in products_data:
                    existing = db.query(Product).filter(Product.id == p["id"]).first()
                    if not existing:
                        db.add(Product(
                            id=p["id"],
                            seller_id=p.get("sellerId"),
                            seller_name=p.get("sellerName"),
                            name=p.get("name"),
                            category=p.get("category", "General"),
                            price=float(p.get("price", 0)),
                            original_price=float(p.get("originalPrice", p.get("price", 0))),
                            unit=p.get("unit", "unit"),
                            quantity_available=int(p.get("quantityAvailable", 10)),
                            location=p.get("location", "Mandya APMC"),
                            distance=p.get("distance", "3.5 km"),
                            product_type=p.get("type", "sale"),
                            description=p.get("description", ""),
                            badge=p.get("badge", ""),
                            verified_seller=bool(p.get("verifiedSeller", True)),
                            specs=p.get("specs", [])
                        ))

        # Seed Initial Orders
        if db.query(Order).count() == 0:
            db.add(Order(
                id="AGRI-ORD-9021",
                farmer_id="farmer-001",
                seller_id="seller-101",
                seller_name="Rajesh Farm Supplies",
                product_id="prod-001",
                product_name="Hybrid Tomato F1 Seeds (Arka Rakshak)",
                quantity=2,
                total_price=900.0,
                unit="packet (50g)",
                status="DISPATCHED",
                delivery_location="Plot 4B, Mandya, Karnataka",
                payment_method="Kisan Credit Card / UPI",
                payment_status="PAID",
                verification_hash="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                tracking_step=2
            ))
            db.add(Order(
                id="AGRI-BOOK-512",
                farmer_id="farmer-001",
                seller_id="seller-102",
                seller_name="GreenField Agro Equipment Rentals",
                product_id="prod-002",
                product_name="Mahindra 575 DI Tractor (45 HP)",
                quantity=4,
                total_price=4800.0,
                unit="hour",
                status="CONFIRMED",
                delivery_location="Plot 4B, Mandya, Karnataka",
                payment_method="Kisan Credit Card / UPI",
                payment_status="PAID",
                verification_hash="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                tracking_step=1
            ))

        db.commit()
        print(f"[Database Seed] Successfully seeded database! Total products: {db.query(Product).count()}, Farmers: {db.query(Farmer).count()}, Suppliers: {db.query(Supplier).count()}, Orders: {db.query(Order).count()}")
    except Exception as e:
        db.rollback()
        print(f"[Database Seed Error] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
