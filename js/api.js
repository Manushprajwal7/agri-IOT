/**
 * AgriSense & AgriMarket AI - API Abstraction Layer (Enhanced)
 * Modular, backend-ready architecture matching PRD Sections 48, 49, 51-54, 63, 84, 85, 93.
 */

class ApiService {
  constructor() {
    this.useMock = true;
    this.apiBaseUrl = window.AGRI_CONFIG?.API_BASE_URL || '/api/v1';
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem('agri_cart')) {
      localStorage.setItem('agri_cart', JSON.stringify([]));
    }

    if (!localStorage.getItem('agri_current_user')) {
      localStorage.setItem('agri_current_user', JSON.stringify({
        id: "farmer-001",
        role: "farmer",
        name: "Ramesh Kumar (Demo Farmer)",
        location: "Mandya, Karnataka",
        language: "kn",
        device: "AGRI-ESP32-001"
      }));
    }

    if (!localStorage.getItem('agri_settings')) {
      localStorage.setItem('agri_settings', JSON.stringify({
        sarvamEndpoint: "https://api.sarvam.ai/v1/indic-nlu",
        sarvamVoiceLang: "kn-IN",
        mqttBrokerUrl: "wss://broker.hivemq.com:8884/mqtt",
        deviceTelemetryTopic: "agrisense/devices/AGRI-ESP32-001/telemetry",
        pushAlertsEnabled: true,
        voiceFeedbackAudio: true,
        highMoistureThreshold: 85,
        lowMoistureThreshold: 30,
        highHumidityThreshold: 85
      }));
    }

    if (!localStorage.getItem('agri_orders')) {
      const demoOrders = [
        {
          orderId: "AGRI-10245",
          buyerId: "farmer-001",
          buyerName: "Ramesh Kumar (Demo Farmer)",
          sellerId: "seller-101",
          sellerName: "Rajesh Farm Supplies",
          sellerLocation: "Mandya APMC Yard, Karnataka",
          items: [
            {
              productId: "prod-001",
              name: "Hybrid Tomato F1 Seeds (Arka Rakshak)",
              quantity: 2,
              price: 450,
              unit: "packet (50g)"
            }
          ],
          total: 900,
          status: "confirmed",
          statusIndex: 1,
          date: new Date(Date.now() - 3600000 * 4).toISOString(),
          formattedDate: "Today, 10:30 AM",
          paymentMode: "Demo UPI Instant (Ref: UPI/2026/89412)",
          traceabilityHash: "0x8f4d92a1c4b7e930128456f082e691ba73c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2",
          blockchainTag: "AGRI-TRACE-BLOCK-48912",
          timeline: [
            { title: "Order Placed", time: "10:30 AM", done: true, desc: "Farmer placed order via Voice Assistant" },
            { title: "Seller Confirmed", time: "10:32 AM", done: true, desc: "Rajesh Farm Supplies accepted batch #TR-99" },
            { title: "Processing & Packaging", time: "Pending", done: false, desc: "Certified seed quality sealing" },
            { title: "Dispatched", time: "Pending", done: false, desc: "Assigned to regional rural logistics vehicle" },
            { title: "Delivered", time: "Pending", done: false, desc: "Direct handoff at Mandya Plot 4B" }
          ]
        },
        {
          orderId: "AGRI-10244",
          buyerId: "farmer-001",
          buyerName: "Ramesh Kumar (Demo Farmer)",
          sellerId: "seller-102",
          sellerName: "GreenField Agro Equipment",
          sellerLocation: "Mandya Rural & Mysuru Road",
          items: [
            {
              productId: "prod-002",
              name: "Mahindra 575 DI Tractor (45 HP)",
              quantity: 4,
              price: 1200,
              unit: "hours"
            }
          ],
          total: 4800,
          status: "completed",
          statusIndex: 4,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          formattedDate: "2 days ago",
          paymentMode: "Kisan Credit Card (Ref: KCC-8841)",
          traceabilityHash: "0x12c4b7e930128456f082e691ba73c4d5e6f1a2b3c4d5e6f7a8b9c0d1e28f4d92",
          blockchainTag: "AGRI-TRACE-BLOCK-48890",
          timeline: [
            { title: "Order Placed", time: "Sep 22, 08:00 AM", done: true, desc: "Field tilling booking submitted" },
            { title: "Seller Confirmed", time: "Sep 22, 08:15 AM", done: true, desc: "Equipment owner confirmed operator" },
            { title: "Processing & Mobilized", time: "Sep 22, 09:00 AM", done: true, desc: "Tractor prepped with rotavator attachment" },
            { title: "Dispatched to Field", time: "Sep 22, 10:00 AM", done: true, desc: "Arrived at Plot 4B Mandya" },
            { title: "Rental Completed", time: "Sep 22, 02:00 PM", done: true, desc: "4 hours tilling logged & verified" }
          ]
        }
      ];
      localStorage.setItem('agri_orders', JSON.stringify(demoOrders));
    }
  }

  // --- USER & AUTH SERVICES (PRD Section 4, 43, 63) ---
  async getUsers() {
    try {
      const res = await fetch('data/users.json');
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('agri_current_user') || '{}');
  }

  setCurrentUser(userObj) {
    localStorage.setItem('agri_current_user', JSON.stringify(userObj));
    window.dispatchEvent(new CustomEvent('agri:user-changed', { detail: userObj }));
  }

  // --- SETTINGS (PRD Section 5, 13, 64) ---
  getSettings() {
    return JSON.parse(localStorage.getItem('agri_settings') || '{}');
  }

  saveSettings(newSettings) {
    const updated = { ...this.getSettings(), ...newSettings };
    localStorage.setItem('agri_settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('agri:settings-changed', { detail: updated }));
    return updated;
  }

  // --- SENSOR SERVICES ---
  async getSensorData() {
    if (this.useMock) {
      try {
        const res = await fetch('data/sensors.json');
        return await res.json();
      } catch (e) {
        return {
          current: { soilMoisture: 68, temperature: 28.4, humidity: 74, moistureStatus: 'normal' }
        };
      }
    }
    const res = await fetch(`${this.apiBaseUrl}/sensors/latest`);
    return await res.json();
  }

  // --- MARKETPLACE SERVICES ---
  async getProducts() {
    let customProducts = [];
    try {
      const stored = localStorage.getItem('agri_custom_products');
      if (stored) customProducts = JSON.parse(stored);
    } catch (e) {}

    if (this.useMock) {
      try {
        const res = await fetch('data/products.json');
        const defaultProducts = await res.json();
        return [...customProducts, ...defaultProducts];
      } catch (e) {
        return customProducts;
      }
    }
    const res = await fetch(`${this.apiBaseUrl}/products`);
    return await res.json();
  }

  async searchProducts(query = '', category = 'All', filterType = 'all', sortBy = 'popular', priceRange = 'all', verifiedOnly = false) {
    const products = await this.getProducts();
    const q = query.toLowerCase().trim();

    let filtered = products.filter(p => {
      const matchesQ = !q || 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.specs && p.specs.some(s => s.toLowerCase().includes(q)));
      
      const matchesCat = category === 'All' || p.category.toLowerCase() === category.toLowerCase();
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesVerified = !verifiedOnly || p.verifiedSeller === true;

      let matchesPrice = true;
      if (priceRange === 'under1000') matchesPrice = p.price < 1000;
      else if (priceRange === '1000-5000') matchesPrice = p.price >= 1000 && p.price <= 5000;
      else if (priceRange === '5000-20000') matchesPrice = p.price > 5000 && p.price <= 20000;
      else if (priceRange === 'above20000') matchesPrice = p.price > 20000;

      return matchesQ && matchesCat && matchesType && matchesVerified && matchesPrice;
    });

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return filtered;
  }

  async createProductListing(listing) {
    const customListings = JSON.parse(localStorage.getItem('agri_custom_products') || '[]');
    const newProduct = {
      id: 'prod-' + Date.now(),
      sellerId: 'farmer-001',
      sellerName: 'Demo Farmer (You)',
      sellerRating: 5.0,
      badge: 'Community Listing',
      likes: 0,
      image: listing.image || 'assets/images/tomato_seeds.svg',
      ...listing
    };
    customListings.unshift(newProduct);
    localStorage.setItem('agri_custom_products', JSON.stringify(customListings));
    return newProduct;
  }

  // --- CART & ORDER SERVICES ---
  getCart() {
    return JSON.parse(localStorage.getItem('agri_cart') || '[]');
  }

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem('agri_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('agri:cart-updated', { detail: cart }));
    return cart;
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('agri_cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('agri:cart-updated', { detail: cart }));
    return cart;
  }

  clearCart() {
    localStorage.setItem('agri_cart', JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('agri:cart-updated', { detail: [] }));
  }

  async getOrders() {
    return JSON.parse(localStorage.getItem('agri_orders') || '[]');
  }

  async createOrder(orderPayload) {
    const orders = await this.getOrders();
    const orderId = 'AGRI-' + Math.floor(10000 + Math.random() * 90000);
    const hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    const newOrder = {
      orderId,
      buyerId: 'farmer-001',
      buyerName: 'Ramesh Kumar (Demo Farmer)',
      sellerId: orderPayload.sellerId || 'seller-101',
      sellerName: orderPayload.sellerName || 'Verified Supplier',
      sellerLocation: 'Mandya Hub, Karnataka',
      items: orderPayload.items || [],
      total: orderPayload.total,
      status: 'confirmed',
      statusIndex: 1,
      date: new Date().toISOString(),
      formattedDate: 'Just now',
      paymentMode: 'Demo Direct Krishi Pay (Simulated)',
      traceabilityHash: hash,
      blockchainTag: 'AGRI-TRACE-BLOCK-' + Math.floor(40000 + Math.random() * 20000),
      timeline: [
        { title: "Order Placed", time: "Just now", done: true, desc: "Order recorded in AgriMarket ledger" },
        { title: "Seller Confirmed", time: "Just now", done: true, desc: "Supplier verified product lot" },
        { title: "Processing & Packaging", time: "Next 2 hours", done: false, desc: "QC check & tamper-proof tag applied" },
        { title: "Dispatched", time: "Tomorrow", done: false, desc: "Dispatched via rural delivery network" },
        { title: "Delivered", time: "In 2 days", done: false, desc: "Destination delivery at farm plot" }
      ]
    };

    orders.unshift(newOrder);
    localStorage.setItem('agri_orders', JSON.stringify(orders));
    this.clearCart();
    window.dispatchEvent(new CustomEvent('agri:order-created', { detail: newOrder }));
    return newOrder;
  }

  // --- SUSTAINABILITY METRICS (PRD Section 85) ---
  getSustainabilityMetrics() {
    return {
      waterSavedLiters: 142000,
      waterEfficiencyPct: 28,
      fertilizerRunoffPreventedKg: 340,
      dieselFuelSavedLiters: 85,
      carbonOffsetKgCO2: 520,
      soilHealthScore: 88,
      harvestForecastTons: 38.5
    };
  }

  // --- CROP & SATELLITE INTELLIGENCE SERVICES ---
  async getCropPrediction(model = 'MobileNetV2', crop = 'Rice (Paddy)') {
    await new Promise(r => setTimeout(r, 500));
    return {
      model: model === 'MobileNetV2' ? 'MobileNetV2 (Edge Quantized)' : 'Custom Agronomic CNN',
      crop: crop,
      stage: 'Vegetative Stage (Active Tillering)',
      cropCycle: 'Day 46 / 120',
      cycleProgressPct: 38,
      healthCondition: 'Healthy Canopy (Nominal)',
      confidence: model === 'MobileNetV2' ? 87 : 84,
      disclaimer: "AI predictions are decision-support aids based on satellite spectral reflectance."
    };
  }

  async getTranslations(lang = 'en') {
    try {
      const res = await fetch('data/translations.json');
      const all = await res.json();
      return all[lang] || all['en'];
    } catch (e) {
      return {};
    }
  }
}

window.agriApi = new ApiService();
