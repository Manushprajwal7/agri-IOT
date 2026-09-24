# Product Requirements Document (PRD)

# AgriSense & AgriMarket AI

## Integrated Smart Agriculture, Crop Intelligence & AI-Powered Agricultural Supply Chain Platform

**Version:** 1.0
**Status:** Prototype / Hackathon MVP
**Platform:** Responsive Web Application + ESP32 IoT Hardware Prototype
**Frontend:** HTML5, CSS3, Vanilla JavaScript
**Hardware:** ESP32 + 2.3" Color Display + Soil Moisture Sensor + Temperature/Humidity Sensor + Buzzer
**AI/ML:** CNN + MobileNetV2 + Satellite Imagery Analysis + Agentic AI
**Languages:** English + Indian regional/native languages
**Primary Users:** Farmers, agricultural suppliers, equipment owners/rental providers, agricultural buyers

---

# 1. Executive Summary

AgriSense & AgriMarket AI is an integrated digital agriculture platform designed to connect **physical farm sensing, AI-based crop intelligence, satellite imagery, and agricultural supply-chain commerce** into a single system.

The platform is divided into two major modules:

### Module 1 — AgriSense & Crop Intelligence

A physical IoT prototype built around an ESP32 continuously monitors agricultural/environmental conditions using:

- Soil moisture sensor
- Temperature sensor
- Humidity sensor
- ESP32
- 2.3-inch color display
- Buzzer

The hardware communicates with the web application and displays real-time environmental information.

The system provides:

- Soil moisture monitoring
- Temperature monitoring
- Humidity monitoring
- Moisture alerts
- Environmental condition alerts
- Hardware status
- Historical sensor readings
- AI-assisted crop intelligence

The platform also integrates satellite imagery and machine-learning models to demonstrate crop-cycle/crop-condition analysis.

The prototype will use previously trained:

- MobileNetV2 model
- CNN model

The project may also reference/use datasets such as:

- DeepGlobe
- xView
- SpaceNet

depending on the specific satellite-image analysis task being demonstrated.

---

### Module 2 — AgriMarket AI

AgriMarket AI is a farmer-focused agricultural supply-chain marketplace.

The marketplace allows farmers and agricultural suppliers to publish listings such as:

- Seeds
- Fertilizers
- Manure
- Pesticides
- Farming machines
- Tractors
- Equipment rentals
- Agricultural tools
- Other farming resources

The interface should resemble a simple social/community marketplace rather than a complicated e-commerce platform.

The key innovation is an **AI-powered voice-first purchasing and selling experience**.

Farmers should be able to communicate with the platform using natural language in their preferred Indian language.

The system will use:

- Speech recognition
- Sarvam AI
- Natural-language understanding
- Agentic AI
- Marketplace search
- Product/order agents
- Supplier discovery
- Order creation

The goal is to reduce dependence on complicated mobile interfaces and text-heavy workflows.

---

# 2. Problem Statement

Agriculture involves two major challenges:

## 2.1 Farm-Level Information Gap

Farmers often need timely information about:

- Soil moisture
- Temperature
- Humidity
- Weather-related conditions
- Crop growth
- Crop cycles
- Field conditions

Traditional monitoring can require manual observation and does not provide continuous digital visibility.

Satellite imagery and machine learning can provide additional crop intelligence, but this information is often separated from physical farm-level sensor data.

---

## 2.2 Agricultural Supply-Chain Fragmentation

Farmers may need to source:

- Seeds
- Fertilizers
- Manure
- Pesticides
- Machinery
- Tractors
- Farming equipment

At the same time, suppliers and equipment owners need ways to reach farmers.

Existing digital marketplaces can introduce another barrier when users are:

- Not comfortable with complex applications
- Not comfortable with English
- More comfortable communicating verbally
- Less experienced with digital commerce

Therefore, the platform should combine:

**Physical sensing + AI crop intelligence + satellite analytics + agricultural marketplace + voice-based AI agents.**

---

# 3. Product Vision

> Build a unified agricultural intelligence and supply-chain platform where physical farm data, satellite imagery, artificial intelligence, and farmer-to-farmer commerce work together through a simple, multilingual interface.

The platform should demonstrate the complete journey:

```text
FARM
  │
  ├── ESP32 Sensors
  │      ├── Soil Moisture
  │      ├── Temperature
  │      └── Humidity
  │
  ▼
AGRISENSE
  │
  ├── Real-Time Monitoring
  ├── Alerts
  ├── Historical Data
  └── Hardware Status
  │
  ▼
CROP INTELLIGENCE
  │
  ├── Satellite Imagery
  ├── CNN
  ├── MobileNetV2
  └── Crop-Cycle Analysis
  │
  ▼
AGRICULTURAL DECISIONS
  │
  ▼
AGRIMARKET
  │
  ├── Seeds
  ├── Fertilizers
  ├── Machinery
  ├── Equipment
  └── Rentals
  │
  ▼
AI AGENT
  │
  ├── Understand Farmer
  ├── Search Marketplace
  ├── Compare Listings
  ├── Confirm Order
  └── Create Order
```

---

# 4. Target Users

## 4.1 Farmer

Primary user.

Needs:

- Monitor farm conditions
- Understand crop conditions
- Receive alerts
- Find agricultural products
- Find machinery
- Rent equipment
- Buy supplies
- Communicate in a native language

---

## 4.2 Supplier

Can publish:

- Seeds
- Fertilizers
- Manure
- Pesticides
- Farming tools
- Agricultural equipment

---

## 4.3 Equipment Owner

Can publish:

- Tractor rentals
- Harvester rentals
- Machine rentals
- Farming equipment rentals

---

## 4.4 Platform Administrator

Can monitor:

- Registered users
- Hardware devices
- Sensor data
- Marketplace listings
- Orders
- AI-agent activity
- Alerts
- System health

---

# 5. Core Product Modules

The website must contain the following primary sections:

```text
Dashboard
│
├── Farm Overview
├── IoT Sensor Monitoring
├── Crop Intelligence
├── Satellite Analysis
├── Alerts
│
AgriMarket
│
├── Marketplace Feed
├── Product Search
├── Categories
├── Product Details
├── Create Listing
├── Orders
│
AI Assistant
│
├── Voice Input
├── Native Language
├── AI Conversation
├── Marketplace Search
├── Order Creation
│
System
│
├── Device Status
├── Notifications
└── Settings
```

---

# 6. Website Information Architecture

The application should use a modern dashboard-style layout.

## Main Navigation

The left sidebar or top navigation should contain:

1. Dashboard
2. Farm Monitor
3. Crop Intelligence
4. Satellite Analysis
5. Alerts
6. AgriMarket
7. AI Assistant
8. Orders
9. Devices
10. Settings

On mobile, navigation should collapse into a hamburger/bottom navigation system.

---

# 7. Visual Design Requirements

The design should communicate:

- Agriculture
- Technology
- Trust
- Simplicity
- AI
- Sustainability

The interface should NOT look like a generic corporate SaaS dashboard.

Use a modern agricultural technology aesthetic.

Recommended visual language:

- Green as primary accent
- Earth/natural secondary colors
- White/light backgrounds
- Dark text
- Rounded cards
- Soft shadows
- Clear icons
- Large readable numbers
- Simple charts
- High contrast alerts

Do not overuse gradients.

---

# 8. Dashboard

The dashboard is the main landing page after login.

## Header

Display:

```text
Good Morning, Farmer
Farm: Demo Farm
Location: Karnataka, India
Device: AGRI-ESP32-001
```

Header actions:

- Notifications
- Language selector
- AI Assistant
- Profile

---

# 9. Farm Monitoring Dashboard

The Farm Monitor page displays live IoT information.

## Sensor Cards

### Soil Moisture

Display:

```text
Soil Moisture
68%
Normal
```

Include:

- Current value
- Status
- Last updated time
- Mini trend chart

Possible states:

```text
LOW
NORMAL
HIGH
```

---

### Temperature

Example:

```text
Temperature
28.4°C
Normal
```

---

### Humidity

Example:

```text
Humidity
74%
High
```

---

### Environmental Status

Example:

```text
Environmental Status

MOISTURE DETECTED
```

or

```text
Conditions Normal
```

---

# 10. Hardware Integration

The hardware prototype uses:

```text
ESP32
│
├── Soil Moisture Sensor
├── Temperature/Humidity Sensor
├── Buzzer
└── 2.3" Color Display
```

The ESP32 is responsible for:

- Reading sensors
- Processing sensor readings
- Updating display
- Triggering buzzer
- Sending readings to the web/backend interface

---

# 11. Hardware Data Model

Sensor payload should conceptually follow:

```json
{
  "deviceId": "AGRI-ESP32-001",
  "timestamp": "2026-09-24T10:30:00",
  "soilMoisture": 68,
  "temperature": 28.4,
  "humidity": 74,
  "moistureStatus": "normal",
  "environmentStatus": "high_humidity"
}
```

The frontend should be designed so that this data can later be replaced from mock data with real ESP32 API/MQTT/WebSocket data.

---

# 12. Hardware Display

The physical 2.3-inch display should show simplified information.

Example:

```text
------------------------
       AGRISENSE
------------------------

SOIL
68% NORMAL

TEMP
28.4 C

HUMIDITY
74%

STATUS
NORMAL
------------------------
```

When an alert occurs:

```text
------------------------
       WARNING
------------------------

HIGH MOISTURE

CHECK FIELD
CONDITIONS

------------------------
```

The display should prioritize readability over information density.

---

# 13. Buzzer Logic

The buzzer should be triggered when configured environmental thresholds are reached.

Example logic:

```text
IF soil moisture < minimum threshold
    → LOW MOISTURE ALERT

IF humidity > configured threshold
    → HIGH HUMIDITY ALERT

IF moisture/environment condition requires warning
    → BUZZER ON
```

The exact thresholds should be configurable.

The frontend should display the threshold configuration but should not claim that humidity alone definitively detects rainfall.

Optional future hardware:

```text
Rain Sensor
```

This can provide direct rainfall detection.

---

# 14. Live Sensor Simulation

Because the web application is initially an HTML/CSS/JavaScript prototype, it must support a **Demo Mode**.

Demo Mode should simulate changing sensor values.

Example:

```text
Soil Moisture:
65 → 66 → 67 → 68

Temperature:
27.8 → 28.1 → 28.4

Humidity:
70 → 72 → 74
```

A "Simulation ON/OFF" control should be available.

---

# 15. Sensor Charts

Use JavaScript charting functionality or lightweight chart implementation.

Charts:

- Soil moisture over time
- Temperature over time
- Humidity over time

Time filters:

```text
1H
6H
24H
7D
30D
```

---

# 16. Alerts

The Alerts page displays important environmental events.

Example:

```text
⚠ High Soil Moisture

Soil moisture reached 86%.

2 minutes ago
```

```text
⚠ High Humidity

Humidity reached 91%.

10 minutes ago
```

```text
✓ Conditions Normal

Sensor readings returned to normal.

20 minutes ago
```

Each alert should contain:

- Alert type
- Severity
- Timestamp
- Sensor
- Value
- Recommended action

---

# 17. Crop Intelligence

The Crop Intelligence page connects sensor data with AI/ML analysis.

The page should display:

```text
Crop Intelligence

Crop:
Rice

Growth Stage:
Vegetative

Crop Cycle:
Day 46 / 120

Estimated Current Condition:
Healthy

AI Confidence:
87%
```

The exact output should be clearly labelled as:

```text
AI/Model Prediction
```

rather than presenting model predictions as guaranteed agricultural facts.

---

# 18. Crop Cycle Prediction

The platform will demonstrate crop-cycle analysis using trained machine-learning models.

Existing models available for demonstration:

- MobileNetV2
- CNN

Datasets/models may be associated with:

- DeepGlobe
- xView
- SpaceNet

The frontend should not hard-code claims about model accuracy unless an actual measured evaluation is supplied.

---

# 19. Satellite Analysis Page

The Satellite Analysis page should provide a visual satellite-analysis interface.

Layout:

```text
------------------------------------------------
Satellite Crop Intelligence
------------------------------------------------

[ Satellite Image ]

Crop Area: 12.4 hectares

Detected Region:
Agricultural Area

Model:
MobileNetV2

Prediction:
Vegetative Stage

Confidence:
87%

[Analyze Image]
------------------------------------------------
```

---

# 20. Satellite Image Viewer

The interface should support:

- Satellite image preview
- Zoom
- Pan
- Image upload
- Demo satellite image
- Analysis button
- Prediction result
- Confidence
- Model name

Possible image layers:

```text
Original
Satellite
Segmentation
Prediction
```

---

# 21. Model Selection

Provide a dropdown:

```text
AI Model

[ MobileNetV2 ▼ ]
```

Options:

```text
MobileNetV2
CNN
```

The architecture should allow additional models later.

---

# 22. AI Prediction Result

Prediction cards should contain:

```text
MODEL RESULT

Predicted Class:
Vegetative

Confidence:
87%

Model:
MobileNetV2

Inference:
Completed
```

Use a clear disclaimer:

```text
AI predictions are intended for demonstration and decision-support purposes and should not be treated as a replacement for professional agricultural advice.
```

---

# 23. AgriMarket

AgriMarket is the agricultural supply-chain marketplace.

The visual design should feel more like a community/social marketplace than a traditional e-commerce store.

---

# 24. Marketplace Feed

The homepage should contain a feed of farmer/supplier listings.

Example card:

```text
------------------------------------------------
Rajesh Farm Supplies
Seeds • Karnataka

Hybrid Tomato Seeds

₹480
per packet

Available: 24

[View] [Buy]
------------------------------------------------
```

Another:

```text
------------------------------------------------
GreenField Equipment

TRACTOR FOR RENT

₹1,200 / hour

Location:
Bengaluru Rural

Available Today

[View Details]
------------------------------------------------
```

---

# 25. Marketplace Categories

Categories:

```text
Seeds
Fertilizers
Manure
Pesticides
Tractors
Machines
Equipment
Tools
Irrigation
Other
```

Category icons should be used.

---

# 26. Marketplace Search

Search should support natural product terms.

Example:

```text
Search:
"tomato seeds"
```

Results:

```text
Tomato Hybrid Seeds
₹450

Tomato Seeds Premium
₹520

Organic Tomato Seeds
₹390
```

Filters:

- Category
- Price
- Location
- Availability
- Seller
- Rental/Buy

---

# 27. Product Listing

Each listing should contain:

```text
Product Image
Product Name
Seller Name
Category
Price
Unit
Location
Availability
Description
Seller Rating
```

Actions:

```text
Buy
Contact Seller
Ask AI
Save
Share
```

---

# 28. Create Listing

Farmers/suppliers can create marketplace posts.

Form:

```text
Product Name
Category
Description
Price
Quantity
Unit
Location
Buy/Rent
Availability
Images
Contact Preference
```

Button:

```text
Publish Listing
```

After publishing:

```text
✓ Listing Published
```

---

# 29. Social Marketplace Concept

Marketplace posts should resemble a social feed.

Each post may contain:

```text
Seller
Profile picture
Product
Description
Price
Location
Images

[Interested]
[Buy]
[Ask AI]
```

Users can optionally:

- Like
- Save
- Share
- Comment

For MVP, these interactions can be frontend-only/demo interactions.

---

# 30. AI Assistant

The AI Assistant is one of the major differentiating features.

It should be accessible from every major page through a floating button.

Example:

```text
┌─────────────────────────────┐
│       AI FARM ASSISTANT     │
│                             │
│ 🎙 Speak in your language   │
│                             │
│ "I need tomato seeds"       │
│                             │
│ AI:                         │
│ I found 4 tomato seed       │
│ listings near your area.   │
│                             │
│ [View Products]             │
└─────────────────────────────┘
```

---

# 31. Voice-First Interface

The AI assistant should prioritize voice over typing.

Main button:

```text
🎙 Speak
```

Supporting controls:

```text
Language
Microphone
Stop
Repeat
Text Input
```

---

# 32. Native Language Support

Sarvam AI should be integrated conceptually/architecturally for Indian-language interaction.

The language selector should include an extensible list such as:

```text
English
Hindi
Kannada
Tamil
Telugu
Malayalam
Marathi
Bengali
Gujarati
Punjabi
Odia
```

The actual supported languages should depend on the configured Sarvam AI services.

---

# 33. Voice Interaction Flow

Example:

```text
Farmer speaks
      ↓
Speech Recognition
      ↓
Language Detection
      ↓
Native Language Understanding
      ↓
AI Agent
      ↓
Marketplace Search
      ↓
Product Selection
      ↓
Order Confirmation
      ↓
Order Creation
      ↓
Voice Response
```

---

# 34. Example AI Conversation

Farmer:

```text
"I need tomato seeds."
```

AI:

```text
I found tomato seed listings available near you.
Would you like me to show the available options?
```

Farmer:

```text
"Show me the cheapest one."
```

AI:

```text
The lowest-priced option is Hybrid Tomato Seeds at ₹390 per packet.

Would you like to order one packet?
```

Farmer:

```text
"Yes."
```

AI:

```text
Please confirm:

Hybrid Tomato Seeds
Quantity: 1 packet
Price: ₹390

Do you want to place the order?
```

Farmer:

```text
"Yes."
```

AI:

```text
Order created successfully.
Order ID: AGRI-10245
```

---

# 35. Agentic AI Architecture

The system should conceptually use multiple specialized agents.

```text
                    AI ORCHESTRATOR
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
 Marketplace         Product           Order Agent
   Agent              Agent
       │                  │                  │
       ▼                  ▼                  ▼
 Search Listings      Compare          Create Order
                      Products
       │
       ▼
 Supplier Agent
```

---

# 36. Agent Responsibilities

## Marketplace Agent

Responsibilities:

- Understand marketplace requests
- Search listings
- Filter products
- Find suppliers
- Find rental equipment

---

## Product Agent

Responsibilities:

- Compare products
- Explain prices
- Check availability
- Summarize product details

---

## Order Agent

Responsibilities:

- Create cart/order
- Confirm quantity
- Confirm price
- Request confirmation
- Generate order ID

---

## Supplier Agent

Responsibilities:

- Help suppliers create listings
- Update availability
- Answer basic product queries

---

# 37. AI Safety / Confirmation

The AI must NEVER create an order solely from an ambiguous statement.

Before placing an order, display:

```text
ORDER CONFIRMATION

Product:
Hybrid Tomato Seeds

Quantity:
2 packets

Price:
₹780

Seller:
ABC Seeds

[Confirm Order]
[Cancel]
```

Voice confirmation can also be supported.

---

# 38. Order Management

The Orders page displays:

```text
Order ID
Product
Seller
Quantity
Price
Status
Date
```

Statuses:

```text
Pending
Confirmed
Processing
Ready
Completed
Cancelled
```

Example:

```text
AGRI-10245

Hybrid Tomato Seeds
2 packets

₹780

Confirmed

[View Details]
```

---

# 39. Cart

Cart functionality should support:

- Add item
- Remove item
- Change quantity
- Total price
- Seller information
- Order confirmation

For prototype/MVP, payment processing can be simulated.

---

# 40. Payment Prototype

Do not implement a real payment gateway in the initial HTML/CSS/JS prototype.

Use:

```text
Demo Payment

₹780

[Simulate Successful Payment]
```

After clicking:

```text
✓ Payment Successful

Order #AGRI-10245
```

The architecture should allow a real payment gateway to be integrated later.

---

# 41. Supply-Chain Tracking

Each order should have a simple timeline:

```text
ORDER PLACED
     │
     ▼
SELLER CONFIRMED
     │
     ▼
PROCESSING
     │
     ▼
DISPATCHED
     │
     ▼
DELIVERED
```

The prototype can simulate status changes.

---

# 42. Supplier Dashboard

Suppliers should have:

```text
My Listings
Orders
Inventory
Messages
Sales
```

Dashboard metrics:

```text
Active Listings
Pending Orders
Completed Orders
Revenue
```

---

# 43. Farmer Profile

Profile should display:

```text
Farmer Name
Farm Location
Farm Size
Primary Crop
Language
Connected Device
```

Optional:

```text
Marketplace Listings
Orders
Saved Products
```

---

# 44. Device Management

The Devices page should display:

```text
AGRI-ESP32-001

Status:
● Online

Last Seen:
10 seconds ago

Sensors:
✓ Soil Moisture
✓ Temperature
✓ Humidity

Display:
✓ Connected

Buzzer:
✓ Connected
```

---

# 45. Offline State

If the hardware disconnects:

```text
⚠ Device Offline

Last data received:
2 minutes ago

Last known values:
Soil Moisture: 68%
Temperature: 28.4°C
Humidity: 74%
```

The frontend should clearly distinguish:

```text
LIVE DATA
```

from:

```text
LAST KNOWN DATA
```

---

# 46. Demo Mode

Because this is a prototype, the website must function without physical hardware.

Provide a global:

```text
DEMO MODE
```

When enabled:

- Generate sensor values
- Generate marketplace listings
- Generate AI responses
- Generate satellite-analysis results
- Simulate device connectivity
- Simulate orders

This ensures the complete product can be demonstrated on a laptop.

---

# 47. Demo Scenario

The application should support a complete end-to-end demo.

## Step 1 — Farm Monitoring

Dashboard shows:

```text
Soil Moisture: 72%
Temperature: 28°C
Humidity: 76%
```

---

## Step 2 — Environmental Alert

Simulate increased moisture:

```text
Soil Moisture: 89%
```

System displays:

```text
⚠ HIGH SOIL MOISTURE
```

Buzzer status:

```text
ACTIVE
```

---

## Step 3 — Crop Intelligence

Navigate to Crop Intelligence.

Show:

```text
Crop: Rice
Growth Stage: Vegetative
AI Prediction: Healthy
Confidence: 87%
```

---

## Step 4 — Satellite Analysis

Show satellite image.

Click:

```text
Analyze
```

Display:

```text
Model: MobileNetV2
Prediction: Vegetative
Confidence: 87%
```

---

## Step 5 — Marketplace

Open AgriMarket.

Search:

```text
"I need tomato seeds"
```

---

## Step 6 — AI Agent

AI returns:

```text
I found 4 tomato seed listings.
```

---

## Step 7 — Voice Interaction

Click microphone.

Speak a supported language.

AI processes the request.

---

## Step 8 — Order

AI identifies product.

Display confirmation.

User confirms.

---

## Step 9 — Order Tracking

Show:

```text
Order Placed
↓
Seller Confirmed
↓
Processing
```

This demonstrates the entire platform.

---

# 48. Frontend Technology

The initial implementation must use:

```text
HTML5
CSS3
JavaScript
```

Avoid unnecessary frameworks for the first prototype.

Recommended structure:

```text
/
├── index.html
├── dashboard.html
├── marketplace.html
├── crop-intelligence.html
├── satellite.html
├── assistant.html
├── orders.html
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   ├── marketplace.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── sensors.js
│   ├── marketplace.js
│   ├── ai-assistant.js
│   ├── orders.js
│   └── demo.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── satellite/
│
└── data/
    ├── products.json
    ├── sensors.json
    └── users.json
```

---

# 49. Backend-Ready Architecture

Although the first version is frontend-focused, code should be structured so backend APIs can be integrated later.

Create an API abstraction layer:

```javascript
api.getSensorData();
api.getProducts();
api.searchProducts();
api.createOrder();
api.getOrders();
api.getCropPrediction();
api.sendAIMessage();
```

Initially these functions can use mock data.

Later they can connect to real APIs.

---

# 50. Proposed Backend Architecture

Future production architecture:

```text
ESP32
  │
  ├── MQTT / HTTP
  │
  ▼
IoT Gateway
  │
  ▼
Backend API
  │
  ├── Sensor Service
  ├── Crop AI Service
  ├── Marketplace Service
  ├── Order Service
  └── AI Agent Service
         │
         ├── Sarvam AI
         ├── LLM
         └── Agent Tools
```

---

# 51. Data Storage

Future backend database entities:

```text
Users
Farms
Devices
SensorReadings
CropPredictions
SatelliteImages
Products
Listings
Orders
OrderItems
Suppliers
AIConversations
Alerts
```

---

# 52. Sensor Data Schema

```json
{
  "id": "sensor-001",
  "deviceId": "AGRI-ESP32-001",
  "timestamp": "2026-09-24T10:30:00",
  "soilMoisture": 68,
  "temperature": 28.4,
  "humidity": 74
}
```

---

# 53. Marketplace Product Schema

```json
{
  "id": "product-001",
  "sellerId": "seller-001",
  "name": "Hybrid Tomato Seeds",
  "category": "Seeds",
  "price": 450,
  "unit": "packet",
  "quantityAvailable": 24,
  "location": "Bengaluru",
  "type": "sale",
  "description": "Hybrid tomato seeds suitable for agricultural cultivation.",
  "image": "/assets/images/tomato-seeds.jpg"
}
```

---

# 54. Order Schema

```json
{
  "orderId": "AGRI-10245",
  "buyerId": "farmer-001",
  "sellerId": "seller-001",
  "items": [
    {
      "productId": "product-001",
      "quantity": 2,
      "price": 450
    }
  ],
  "total": 900,
  "status": "confirmed"
}
```

---

# 55. AI Conversation Schema

```json
{
  "conversationId": "conversation-001",
  "language": "Kannada",
  "input": "I need tomato seeds",
  "intent": "SEARCH_PRODUCT",
  "agent": "MarketplaceAgent",
  "result": "4 products found"
}
```

---

# 56. AI Intent Classification

The AI system should recognize intents such as:

```text
SEARCH_PRODUCT
COMPARE_PRODUCTS
BUY_PRODUCT
RENT_EQUIPMENT
SELL_PRODUCT
CREATE_LISTING
CHECK_ORDER
CANCEL_ORDER
CHECK_SENSOR
CHECK_CROP
GENERAL_FARM_QUERY
```

---

# 57. AI Tool Architecture

The AI agent should have tools conceptually similar to:

```text
search_products()
get_product_details()
compare_products()
check_inventory()
create_cart()
calculate_order_total()
create_order()
get_order_status()
search_equipment()
create_listing()
get_sensor_status()
get_crop_prediction()
```

---

# 58. Natural Language Examples

The system should support queries such as:

```text
"I need fertilizer."

"Find tomato seeds."

"Show me a tractor for rent."

"What is the cheapest option?"

"Where is my order?"

"Show my soil moisture."

"Is my farm moisture level normal?"

"Check my crop."

"Sell my tractor."

"Create a listing for my seeds."
```

---

# 59. Voice Response

After processing a request, the system should provide both:

- Visual response
- Optional spoken response

Example:

```text
AI RESPONSE

I found three tractor rentals near your location.

Starting from ₹1,000 per hour.

[View Options]
```

Voice output can be generated through the configured speech service.

---

# 60. Accessibility

Because the target audience includes farmers who may not be comfortable with complicated interfaces:

- Large buttons
- Large text
- High contrast
- Minimal navigation depth
- Clear icons
- Voice-first interaction
- Native-language support
- Avoid excessive technical terminology
- Avoid dense tables
- Use visual status indicators

Important actions should be accessible in 1–3 interactions.

---

# 61. Language Selector

Global language selector:

```text
🌐 Language

English
ಕನ್ನಡ
हिन्दी
தமிழ்
తెలుగు
```

The application should be designed so translation strings are separated from UI code.

Example:

```javascript
translations = {
  en: {},
  hi: {},
  kn: {},
  ta: {},
  te: {},
};
```

---

# 62. Notification System

Notifications can include:

```text
High soil moisture detected
New marketplace listing
Order confirmed
Order dispatched
AI analysis completed
Device disconnected
```

Notifications should have severity:

```text
INFO
WARNING
SUCCESS
CRITICAL
```

---

# 63. Authentication

For prototype:

```text
Login
Register
Demo Login
```

Demo login should allow immediate access.

Example:

```text
[Continue as Farmer]
[Continue as Supplier]
```

Real authentication can be implemented later.

---

# 64. Security Requirements

Future production implementation should include:

- Authentication
- Authorization
- Secure API endpoints
- Input validation
- API-key protection
- Secure device authentication
- Encrypted communication
- Rate limiting
- Order confirmation
- Audit logs

API keys for Sarvam AI or other AI providers must never be exposed directly in frontend JavaScript in a production deployment.

---

# 65. Performance Requirements

The prototype should:

- Load quickly
- Work on desktop and mobile
- Avoid unnecessary animations
- Optimize satellite images
- Lazy-load marketplace images
- Keep JavaScript modular
- Avoid blocking the UI

Target:

```text
Initial page interaction < 3 seconds
```

when running locally with demo data.

---

# 66. Responsive Design

The website must support:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop:

```text
Sidebar + Main Content
```

Mobile:

```text
Top Header
Main Content
Bottom Navigation
```

---

# 67. Error States

Every major feature should have an error state.

Example:

```text
Unable to connect to ESP32.

Last known data:
68% soil moisture
28.4°C
74% humidity

[Retry]
```

AI error:

```text
The AI assistant could not process the request.

[Try Again]
[Use Text Instead]
```

Marketplace error:

```text
Unable to load marketplace listings.

[Retry]
```

---

# 68. Loading States

Use skeleton loaders rather than blank screens.

Examples:

```text
Loading sensor data...
Loading satellite image...
Analyzing crop...
Searching marketplace...
Processing voice...
Creating order...
```

---

# 69. Empty States

Example:

```text
No marketplace listings found.

Try:
- Changing your search
- Selecting another category
- Asking the AI assistant
```

---

# 70. Dashboard KPI Cards

The dashboard may display:

```text
SOIL MOISTURE
68%

TEMPERATURE
28.4°C

HUMIDITY
74%

DEVICE
ONLINE
```

Additional:

```text
ACTIVE ALERTS
2

CROP STATUS
HEALTHY*

MARKETPLACE ORDERS
3
```

The crop status should be labelled as model-generated if it comes from AI.

---

# 71. Crop Timeline

Create a visual crop cycle timeline:

```text
SEEDING
   │
   ▼
GERMINATION
   │
   ▼
VEGETATIVE
   │
   ▼
FLOWERING
   │
   ▼
MATURITY
   │
   ▼
HARVEST
```

Highlight the current predicted stage.

---

# 72. Farm Overview Map

Include a visual map placeholder.

Example:

```text
┌─────────────────────────────┐
│                             │
│       FARM LOCATION         │
│                             │
│          📍                 │
│                             │
│      Karnataka, India       │
│                             │
└─────────────────────────────┘
```

For MVP, a static map/illustration is acceptable.

---

# 73. Marketplace Location

Listings should show location:

```text
📍 Bengaluru Rural
```

This allows the future backend to implement location-based search.

---

# 74. Trust & Transparency

The marketplace should display:

```text
Seller
Location
Availability
Price
Listing Date
```

AI should never invent:

- Product availability
- Prices
- Seller information
- Order status

If information is unavailable:

```text
Information unavailable.
```

---

# 75. AI Agent Decision Flow

The agent should follow:

```text
USER INPUT
    ↓
LANGUAGE UNDERSTANDING
    ↓
INTENT DETECTION
    ↓
TASK PLANNING
    ↓
TOOL SELECTION
    ↓
TOOL EXECUTION
    ↓
RESULT VALIDATION
    ↓
USER RESPONSE
```

For transactions:

```text
USER REQUEST
    ↓
SEARCH
    ↓
PRODUCT SELECTION
    ↓
PRICE/QUANTITY CONFIRMATION
    ↓
USER CONFIRMATION
    ↓
ORDER CREATION
```

---

# 76. AI Agent UI

Display an optional activity panel:

```text
AI AGENT ACTIVITY

✓ Understood request
✓ Searching marketplace
✓ Found 4 listings
✓ Comparing prices
✓ Waiting for confirmation
```

This helps demonstrate the agentic architecture during a hackathon presentation.

---

# 77. AI Explainability

When appropriate, display:

```text
Why this result?

The assistant selected this listing because:
✓ Matches requested product
✓ Available
✓ Lowest displayed price
✓ Location matches search
```

This is preferable to presenting AI decisions as unexplained outputs.

---

# 78. Admin Dashboard

Optional prototype page.

Display:

```text
Total Farmers
Total Suppliers
Connected Devices
Active Listings
Orders
AI Requests
System Alerts
```

Example:

```text
Farmers: 128
Suppliers: 42
Devices Online: 17
Active Listings: 384
Orders: 96
```

These should be clearly marked as demo data.

---

# 79. Hardware-to-Web Architecture Diagram

The application should include a visual architecture section:

```text
             FARM
              │
      ┌───────┴────────┐
      │                │
 Soil Moisture   Temp/Humidity
      │                │
      └───────┬────────┘
              │
            ESP32
              │
       ┌──────┴──────┐
       │             │
    Display        Buzzer
       │
       ▼
   IoT Gateway
       │
       ▼
   Web Platform
       │
 ┌─────┼───────────┐
 │     │           │
 ▼     ▼           ▼
IoT   Crop AI   AgriMarket
      │             │
      ▼             ▼
Satellite        AI Agents
Imagery             │
                    ▼
                Sarvam AI
```

---

# 80. Product Differentiation

The product should communicate three major differentiators:

## 1. Physical + Digital

Not just a software dashboard.

The ESP32 prototype physically interacts with the farm environment.

---

## 2. AI + Satellite + IoT

Three information sources are combined:

```text
IoT Sensor Data
+
Satellite Imagery
+
AI/ML
```

---

## 3. Voice-First Agricultural Commerce

Farmers can interact with the marketplace using natural language rather than navigating a complex application.

---

# 81. MVP Scope

The first working prototype MUST include:

### Hardware

- ESP32
- Soil moisture sensor
- Temperature/humidity sensor
- Buzzer
- 2.3-inch display

### Website

- Dashboard
- Live/demo sensor values
- Sensor charts
- Alerts
- Crop Intelligence
- Satellite image page
- Model result simulation
- AgriMarket
- Product listings
- Search
- Product details
- Cart
- Demo order
- AI Assistant UI
- Voice interaction UI
- Language selector
- Responsive design

---

# 82. Phase 2

After MVP:

- Real ESP32 API
- MQTT
- Real satellite-image inference
- Real MobileNetV2 inference API
- Real CNN inference API
- Sarvam AI integration
- Speech-to-text
- Text-to-speech
- Agentic backend
- Database
- Authentication

---

# 83. Phase 3

Future production features:

- Real payment gateway
- Logistics integration
- GPS-based marketplace discovery
- Farmer verification
- Supplier verification
- Agricultural advisory
- Weather API
- Rain sensor
- Crop disease detection
- Yield prediction
- Supply-demand analytics
- Blockchain/immutable supply-chain tracking if required by the competition track

---

# 84. Optional Immutable Supply-Chain Layer

Since the selected track mentions immutable tracking, a future version can introduce traceability.

Example:

```text
FARMER
  ↓
PRODUCTION
  ↓
HARVEST
  ↓
COLLECTION
  ↓
PROCESSING
  ↓
DISTRIBUTION
  ↓
BUYER
```

Each stage can create a digitally signed record.

The MVP should not add blockchain merely for appearance. It should be introduced where traceability provides a concrete benefit.

---

# 85. Sustainability Dashboard

Optional future module:

```text
Water Usage
Input Usage
Crop Health
Harvest Estimate
Equipment Utilization
```

This can provide an additional sustainability angle.

---

# 86. Demo Data

The prototype must include realistic-looking demo data.

Example sensor:

```text
Device:
AGRI-ESP32-001

Soil Moisture:
68%

Temperature:
28.4°C

Humidity:
74%

Status:
ONLINE
```

Example products:

```text
Hybrid Tomato Seeds
₹450

Organic Fertilizer
₹850

Tractor Rental
₹1,200/hour

Power Tiller Rental
₹900/day

Organic Manure
₹350/bag
```

All demo products must be explicitly treated as fictional/demo data.

---

# 87. UX Principles

The interface should follow:

### Principle 1

**Show, don't explain.**

Use cards, charts, icons, and status indicators.

### Principle 2

**Voice before typing.**

Make the AI microphone highly visible.

### Principle 3

**Simple actions.**

Avoid complex menus.

### Principle 4

**Human confirmation for transactions.**

AI can recommend and prepare an order, but the user must confirm before an order is placed.

### Principle 5

**Transparent AI.**

Clearly distinguish:

```text
Sensor Data
AI Prediction
Demo Data
User Input
```

---

# 88. Suggested Homepage

The landing page should communicate the entire idea immediately.

Hero:

```text
SMART AGRICULTURE.
CONNECTED SUPPLY CHAINS.

From farm sensors to AI-powered agricultural commerce.
```

Buttons:

```text
Explore Farm Intelligence
Open AgriMarket
Talk to AI Assistant
```

Below hero:

```text
IoT Monitoring
     +
Satellite Intelligence
     +
AI Agents
     +
Agricultural Marketplace
```

---

# 89. Homepage Architecture Visualization

Create a visual interactive section:

```text
             YOUR FARM
                 │
                 ▼
          ┌──────────────┐
          │   AGRISENSE  │
          └──────┬───────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
     IoT DATA        SATELLITE AI
        │                 │
        └────────┬────────┘
                 ▼
          CROP INTELLIGENCE
                 │
                 ▼
          AGRIMARKET AI
                 │
                 ▼
       BUY • SELL • RENT
```

---

# 90. Acceptance Criteria

The prototype is considered successful when:

### Hardware

- ESP32 reads sensor data.
- Soil moisture is displayed.
- Temperature is displayed.
- Humidity is displayed.
- Buzzer can activate based on threshold.
- 2.3-inch display shows sensor status.

### Website

- Dashboard loads correctly.
- Sensor values update.
- Charts display data.
- Alerts are generated.
- Hardware status is visible.
- Crop intelligence page works.
- Satellite image can be displayed.
- AI model result can be demonstrated.
- Marketplace loads listings.
- Search works.
- Product details work.
- Cart works.
- Demo order can be created.
- AI assistant works in demo mode.
- Voice interaction interface exists.
- Language selection works.
- Website is responsive.

---

# 91. Demo Success Criteria

A judge should be able to understand the project within approximately 2–3 minutes.

The demo should follow:

```text
1. SHOW HARDWARE
       ↓
2. SHOW LIVE SENSOR DATA
       ↓
3. TRIGGER MOISTURE ALERT
       ↓
4. SHOW CROP AI
       ↓
5. SHOW SATELLITE IMAGE
       ↓
6. OPEN AGRIMARKET
       ↓
7. SPEAK TO AI
       ↓
8. FIND PRODUCT
       ↓
9. CONFIRM ORDER
       ↓
10. SHOW SUPPLY-CHAIN STATUS
```

---

# 92. Recommended Demo Narrative

The presenter should communicate the product as:

> "We are connecting the physical farm with the digital agricultural supply chain."

First demonstrate the ESP32.

Then show:

```text
Real-world farm condition
        ↓
Sensor data
        ↓
Web dashboard
```

Then demonstrate:

```text
Satellite imagery
        ↓
AI model
        ↓
Crop intelligence
```

Finally:

```text
Farmer needs agricultural input
        ↓
Speaks naturally
        ↓
AI understands
        ↓
Searches marketplace
        ↓
Finds supplier
        ↓
Confirms order
```

This creates a complete hardware → AI → marketplace story.

---

# 93. Development Instructions for Gemini / Antigravity

The implementation agent must follow these rules.

## Rule 1 — Build a working prototype

Do not generate only static mockups.

Interactions must work.

---

## Rule 2 — Demo-first architecture

Where real APIs are unavailable, use realistic mock services.

For example:

```javascript
MockSensorService;
MockMarketplaceService;
MockAIService;
MockSatelliteService;
MockOrderService;
```

The application must still function.

---

## Rule 3 — Keep real API integration replaceable

Use interfaces such as:

```javascript
sensorService.getLatestReadings();
marketplaceService.search();
aiService.chat();
cropService.predict();
orderService.create();
```

---

## Rule 4 — Never expose API keys

Do not place:

```text
SARVAM_API_KEY
LLM_API_KEY
```

inside frontend JavaScript.

Use environment variables/backend proxy when real APIs are introduced.

---

## Rule 5 — Clearly identify simulated information

Use a small label:

```text
DEMO DATA
```

where appropriate.

---

# 94. Code Quality Requirements

Code should be:

- Modular
- Readable
- Commented
- Reusable
- Responsive
- Semantic
- Accessible

Avoid:

- Huge single JavaScript files
- Inline CSS everywhere
- Hard-coded repeated HTML
- Hard-coded API secrets
- Unnecessary dependencies
- Unused libraries

---

# 95. Component Requirements

Reusable UI components should include:

```text
Navbar
Sidebar
SensorCard
AlertCard
ChartCard
ProductCard
ProductModal
OrderCard
AIChat
VoiceButton
StatusBadge
Modal
Toast
LoadingSkeleton
```

---

# 96. Color/Status System

Use semantic colors:

```text
GREEN  → Normal / Success
YELLOW → Warning
RED    → Critical
BLUE   → Information
GRAY   → Offline / Disabled
```

Do not rely only on color.

Also display:

```text
✓ Normal
⚠ Warning
✕ Critical
● Offline
```

---

# 97. Final Application Structure

The finished prototype should feel like one unified product:

```text
                    AGRISENSE
                        │
          ┌─────────────┴─────────────┐
          │                           │
       FARM AI                    AGRIMARKET
          │                           │
   ┌──────┼───────┐             ┌────┼────┐
   │      │       │             │    │    │
  IoT   Satellite Crop         Buy  Sell Rent
   │      │       │             │    │    │
   └──────┴───────┘             └────┼────┘
          │                           │
          └───────────┬───────────────┘
                      │
                 AI ASSISTANT
                      │
                 SARVAM AI
                      │
                NATIVE LANGUAGE
                      │
                AGENTIC ACTIONS
```

---

# 98. Final Product Positioning

The product should be presented as:

## "An AI-powered connected agriculture platform that links real-time farm sensing, satellite crop intelligence, and voice-first agricultural commerce."

The three core pillars are:

### 1. SENSE

ESP32 + sensors

```text
Soil
Temperature
Humidity
```

### 2. UNDERSTAND

AI + satellite imagery

```text
CNN
MobileNetV2
Satellite Data
Crop Intelligence
```

### 3. ACT

AI-powered agricultural marketplace

```text
BUY
SELL
RENT
ORDER
```

With:

```text
NATIVE LANGUAGE
+
VOICE
+
AGENTIC AI
```

---

# 99. One-Line Product Definition

> **AgriSense & AgriMarket AI is a connected agriculture platform that combines IoT farm monitoring, satellite-based crop intelligence, and multilingual agentic AI to help farmers monitor their fields and buy, sell, or rent agricultural resources through natural-language interaction.**

---

# 100. MVP Deliverable

The final generated website must provide a polished, responsive, interactive prototype containing:

```text
✓ Landing Page
✓ Farmer Dashboard
✓ ESP32 Sensor Dashboard
✓ Soil Moisture Monitoring
✓ Temperature Monitoring
✓ Humidity Monitoring
✓ Environmental Alerts
✓ Hardware Status
✓ Crop Intelligence
✓ Satellite Image Analysis
✓ MobileNetV2 Demo
✓ CNN Demo
✓ Crop Cycle Visualization
✓ AgriMarket Social Feed
✓ Product Search
✓ Product Categories
✓ Product Details
✓ Create Listing
✓ Cart
✓ Demo Checkout
✓ Order Tracking
✓ AI Assistant
✓ Voice Interaction UI
✓ Native Language Selector
✓ Agent Activity Visualization
✓ Supplier Dashboard
✓ Device Dashboard
✓ Notifications
✓ Responsive Mobile UI
✓ Demo Mode
```

The prototype should be designed so that **the same frontend can later be connected to the actual ESP32, trained ML models, Sarvam AI, backend APIs, database, and real marketplace services without redesigning the UI.**

# END OF PRD
