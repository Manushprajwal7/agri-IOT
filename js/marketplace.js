/**
 * AgriSense & AgriMarket AI - Marketplace Module (Significantly Enhanced)
 * Social & community agricultural marketplace supporting Seeds, Fertilizers, Tractors, Tools & Rentals.
 * Uses 100% vector SVG icons (Zero Emojis).
 * Matches PRD Sections 23-29, 39, 42.
 */

class AgriMarketEngine {
  constructor() {
    this.currentCategory = 'All';
    this.currentFilterType = 'all'; // 'all' | 'sale' | 'rental'
    this.searchQuery = '';
    this.sortBy = 'popular'; // 'popular' | 'price-asc' | 'price-desc' | 'rating'
    this.priceRange = 'all'; // 'all' | 'under1000' | '1000-5000' | '5000-20000' | 'above20000'
    this.verifiedOnly = false;
    this.viewMode = 'grid'; // 'grid' | 'compact'
    this.selectedProduct = null;
    this.likedProducts = new Set();
    this.allProductsCache = [];
  }

  async init(containerId = 'marketplaceContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <!-- Marketplace Hero Banner & Stats Strip -->
      <div class="market-hero-banner">
        <div class="hero-content">
          <div class="hero-badge-pill">
            <span class="pulse-dot"></span>
            <span>APMC Mandya Live Gate & Peer-to-Peer Agritech Exchange</span>
          </div>
          <h2 class="hero-title">AgriMarket Community & Fleet Exchange</h2>
          <p class="hero-subtitle">
            Direct farmer-to-farmer trade, certified inputs from verified APMC depots, and on-demand heavy machinery rentals with zero middlemen brokerage.
          </p>
          <div class="hero-stats-row">
            <div class="hero-stat-card">
              <span class="stat-number" id="statListingCount">24+</span>
              <span class="stat-label">Verified Listings</span>
            </div>
            <div class="hero-stat-card">
              <span class="stat-number">12</span>
              <span class="stat-label">Machinery Hubs</span>
            </div>
            <div class="hero-stat-card">
              <span class="stat-number">₹0</span>
              <span class="stat-label">Brokerage Fee</span>
            </div>
            <div class="hero-stat-card">
              <span class="stat-number">Same-Day</span>
              <span class="stat-label">Field Dispatch</span>
            </div>
          </div>

          <!-- CALL-E Voice Supply Chain Call Initiation Strip -->
          <div class="hero-calle-cta-strip" style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.2); padding: 14px 20px; border-radius: 12px; backdrop-filter: blur(8px);">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 0 16px rgba(16, 185, 129, 0.5);">
                <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 22px; height: 22px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <strong style="color: #ffffff; font-size: 15px; display: block;">CALL-E AI Voice Supply Chain Agent</strong>
                <span style="color: #d1fae5; font-size: 13px;">Enquire on seeds, fertilizers, pesticides & tractors via automated phone call with instant booking</span>
              </div>
            </div>
            <button class="btn btn-calle-voice-launch" id="btnHeroInitiateCallE" style="background: #10b981; color: white; font-weight: 700; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); font-size: 14px;">
              <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Initiate Call-E Voice Call</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Control Toolbar & Filter Hub -->
      <div class="marketplace-header-bar">
        <div class="search-filter-row">
          <!-- Main Search Input -->
          <div class="search-input-box">
            <span class="search-icon">${I.search || ''}</span>
            <input type="text" id="marketSearchInput" class="form-control" placeholder="Search paddy seeds, tractors, bio-fertilizer, drone spray, drip kits..." />
            <button class="btn-clear-search" id="btnClearSearch" title="Clear Search" style="display:none;">✕</button>
            <button class="btn-voice-inline" id="btnMarketVoiceSearch" title="Voice Search with AI">
              ${I.mic || ''}
              <span class="voice-wave-ring"></span>
            </button>
          </div>

          <!-- Type Filter Tabs -->
          <div class="filter-type-toggles">
            <button class="btn-type-pill active" data-type="all">All Listings</button>
            <button class="btn-type-pill" data-type="sale">🌱 Buy Inputs</button>
            <button class="btn-type-pill" data-type="rental">🚜 Machinery Rentals</button>
          </div>

          <!-- Action Buttons -->
          <div class="header-action-group">
            <button class="btn btn-outline" id="btnOpenCallEModal" title="Voice Enquiry & Booking via Phone Call" style="border-color: #10b981; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
              <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Call-E Booking</span>
            </button>
            <button class="btn btn-primary btn-new-listing" id="btnOpenCreateListing">
              ${I.plus || ''} Post Free Listing
            </button>
            <button class="btn btn-outline btn-cart-toggle" id="btnOpenCart">
              ${I.cart || ''} <span class="cart-label">Basket</span>
              <span class="cart-badge-pill" id="cartCountBadge">0</span>
            </button>
          </div>
        </div>

        <!-- Secondary Filters Bar: Sort, Price Chips, Verified Toggle, View Switcher -->
        <div class="secondary-filter-bar">
          <div class="filter-controls-left">
            <!-- Sort By Selector -->
            <div class="sort-selector-wrap">
              <span class="filter-label">Sort:</span>
              <select id="marketSortSelect" class="form-select-sm">
                <option value="popular" selected>Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated (★ 4.8+)</option>
              </select>
            </div>

            <!-- Price Range Chips -->
            <div class="price-chip-group">
              <button class="price-chip active" data-price="all">All Prices</button>
              <button class="price-chip" data-price="under1000">&lt; ₹1,000</button>
              <button class="price-chip" data-price="1000-5000">₹1k - ₹5k</button>
              <button class="price-chip" data-price="5000-20000">₹5k - ₹20k</button>
              <button class="price-chip" data-price="above20000">₹20k+</button>
            </div>
          </div>

          <div class="filter-controls-right">
            <!-- Verified Only Toggle -->
            <label class="verified-toggle-label" title="Show only verified farmers & APMC certified depots">
              <input type="checkbox" id="verifiedOnlyCheckbox" />
              <span class="verified-toggle-custom"></span>
              <span class="verified-text">${I.shield || ''} Verified Only</span>
            </label>

            <!-- View Switcher (Grid vs Compact) -->
            <div class="view-mode-toggles">
              <button class="btn-view-mode active" id="btnViewGrid" title="Grid View">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button class="btn-view-mode" id="btnViewCompact" title="List View">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Horizontal Category Pill Slider -->
        <div class="category-scroll-container">
          <button class="cat-scroll-arrow left" id="catScrollLeft" title="Scroll Left">‹</button>
          <div class="category-scroll-bar" id="categoryScrollBar">
            <!-- Category pills injected here -->
          </div>
          <button class="cat-scroll-arrow right" id="catScrollRight" title="Scroll Right">›</button>
        </div>
      </div>

      <!-- Feed Container -->
      <div class="marketplace-content-layout">
        <div class="marketplace-feed-header">
          <span class="results-count-text" id="resultsCountText">Showing community listings...</span>
        </div>
        <div class="marketplace-feed" id="marketplaceFeed">
          <div class="loading-spinner-box">Loading community listings...</div>
        </div>
      </div>

      <!-- Product Details Modal -->
      <div class="modal-backdrop" id="productDetailsModal" style="display: none;">
        <div class="modal-dialog modal-lg" id="productModalContent"></div>
      </div>

      <!-- Create Listing Modal -->
      <div class="modal-backdrop" id="createListingModal" style="display: none;">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h4>${I.plus || ''} Publish Community Listing</h4>
            <button class="modal-close-btn" id="btnCloseCreateListing">${I.close || '✕'}</button>
          </div>
          <div class="modal-body">
            <form id="createListingForm">
              <div class="form-group">
                <label>Listing Type</label>
                <div class="radio-pill-group">
                  <label><input type="radio" name="listingType" value="sale" checked /> Sell Agricultural Product</label>
                  <label><input type="radio" name="listingType" value="rental" /> Machinery / Equipment Rental</label>
                </div>
              </div>
              <div class="form-group">
                <label>Product / Equipment Name</label>
                <input type="text" name="productName" class="form-control" placeholder="e.g. Hybrid Tomato F1 Seeds" required />
              </div>
              <div class="form-row">
                <div class="form-group col">
                  <label>Category</label>
                  <select name="category" class="form-select" required>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Manure">Manure</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Tractors">Tractors</option>
                    <option value="Machines">Machines</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Tools">Tools</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group col">
                  <label>Price (₹)</label>
                  <input type="number" name="price" class="form-control" placeholder="450" required />
                </div>
                <div class="form-group col">
                  <label>Unit</label>
                  <input type="text" name="unit" class="form-control" placeholder="packet / hour / bag / acre" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group col">
                  <label>Quantity / Availability</label>
                  <input type="number" name="quantityAvailable" class="form-control" value="10" required />
                </div>
                <div class="form-group col">
                  <label>Depot / Farm Location</label>
                  <input type="text" name="location" class="form-control" placeholder="Mandya APMC, Karnataka" required />
                </div>
              </div>
              <div class="form-group">
                <label>Key Features / Agronomic Specs (comma separated)</label>
                <input type="text" name="specs" class="form-control" placeholder="e.g. 120 Days Duration, High Yield, Drought Tolerant" />
              </div>
              <div class="form-group">
                <label>Description & Agronomic Details</label>
                <textarea name="description" class="form-control" rows="3" placeholder="Describe variety, condition, delivery availability, dosage..." required></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-outline" id="btnCancelCreateListing">Cancel</button>
                <button type="submit" class="btn btn-primary">${I.check || ''} Publish to AgriMarket</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Enhanced Slide-Over Cart Drawer -->
      <div class="cart-drawer-backdrop" id="cartDrawerBackdrop" style="display: none;">
        <div class="cart-drawer">
          <div class="cart-header">
            <div class="cart-title-wrap">
              <h4>${I.cart || ''} Agricultural Basket</h4>
              <span class="cart-subtitle-items" id="cartItemCountLabel">0 items</span>
            </div>
            <button class="modal-close-btn" id="btnCloseCart">${I.close || '✕'}</button>
          </div>

          <div class="cart-address-banner">
            <span class="addr-icon">${I.mapPin || ''}</span>
            <div class="addr-text">
              <strong>Delivering to: Plot 4B Mandya (Your Farm)</strong>
              <span>Rural express logistics route • Est. Today evening</span>
            </div>
          </div>

          <div class="cart-body" id="cartItemsList"></div>
          <div class="cart-footer" id="cartFooter"></div>
        </div>
      </div>

      <!-- Interactive CALL-E Voice Supply Chain Booking Modal -->
      <div class="modal-backdrop" id="callEModalBackdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div class="modal-dialog" style="max-width: 580px; width: 92%; background: var(--bg-card, #ffffff); border-radius: 16px; border: 1px solid var(--border-color, #e2e8f0); box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; animation: modalPop 0.25s ease-out;">
          
          <div class="modal-header" style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); color: #ffffff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
                <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">CALL-E Voice Supply Chain Assistant</h3>
                <span style="font-size: 12px; color: #a7f3d0;">APMC Mandya Live Gate • Autonomous Phone Booking</span>
              </div>
            </div>
            <button type="button" class="modal-close-btn" id="btnCloseCallEModal" style="background: none; border: none; font-size: 22px; color: #ffffff; cursor: pointer;">✕</button>
          </div>

          <div class="modal-body" style="padding: 24px; max-height: 75vh; overflow-y: auto;">
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
              <strong style="color: #166534; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                <span>✨ How it works</span>
              </strong>
              <p style="font-size: 13px; color: #15803d; margin: 4px 0 0 0; line-height: 1.5;">
                When you initiate the call, CALL-E dials your phone. Speak naturally to ask about commodity prices & availability. Once you agree, CALL-E books the order and issues a live Booking ID with delivery to Plot 4B Mandya!
              </p>
            </div>

            <!-- Target Phone Input Group -->
            <div class="form-group" style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Farmer's Receiving Phone Number (with Country Code):</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="callEPhoneInput" class="form-control" placeholder="+919844775528" value="+919844775528" style="font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600;" />
                <span id="callEConfigBadge" class="badge badge-success" style="align-self: center; white-space: nowrap; padding: 6px 10px;">● API Configured</span>
              </div>
              <span class="text-muted small" style="font-size: 12px; margin-top: 4px; display: block;">Default loaded from your <code>.env</code> file (ALERT_PHONE_NUMBER).</span>
            </div>

            <!-- Live Commodities Quick Reference -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; font-size: 13px; margin-bottom: 8px;">Commodities Available in Real-Time for Enquiry & Booking:</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <strong style="color: #0f172a; display: block;">🌱 Seeds</strong>
                  <span style="color: #334155;">Hybrid Tomato F1 (Arka Rakshak)</span>
                  <div style="margin-top: 4px; color: #059669; font-weight: 700;">₹450 / packet <span style="font-weight: 400; color: #64748b;">(24 in stock)</span></div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <strong style="color: #0f172a; display: block;">🚜 Machinery Rental</strong>
                  <span style="color: #334155;">Mahindra 575 DI (45 HP)</span>
                  <div style="margin-top: 4px; color: #059669; font-weight: 700;">₹1,200 / hr <span style="font-weight: 400; color: #64748b;">(2 available today)</span></div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <strong style="color: #0f172a; display: block;">🧪 Fertilizers & Manure</strong>
                  <span style="color: #334155;">Kaveri Vermicompost (50kg)</span>
                  <div style="margin-top: 4px; color: #059669; font-weight: 700;">₹350 / bag <span style="font-weight: 400; color: #64748b;">(80 bags in stock)</span></div>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
                  <strong style="color: #0f172a; display: block;">🛡️ Bio-Pesticides</strong>
                  <span style="color: #334155;">Cold Pressed Neem 10000 PPM</span>
                  <div style="margin-top: 4px; color: #059669; font-weight: 700;">₹520 / litre <span style="font-weight: 400; color: #64748b;">(45 bottles in stock)</span></div>
                </div>
              </div>
            </div>

            <!-- Call Live Status Display Box -->
            <div id="callEStatusBox" style="background: #f1f5f9; border-radius: 10px; padding: 14px; text-align: center; border: 1px dashed #cbd5e1; margin-bottom: 20px;">
              <span id="callEStatusIcon" style="font-size: 22px; display: block; margin-bottom: 4px;">📱</span>
              <div id="callEStatusTitle" style="font-weight: 600; font-size: 14px; color: #1e293b;">Ready to Place Voice Call</div>
              <p id="callEStatusDesc" style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Click the button below. Your phone will ring in 3-5 seconds.</p>
            </div>

            <div style="display: flex; gap: 12px;">
              <button type="button" class="btn btn-outline" id="btnCancelCallE" style="flex: 1;">Close</button>
              <button type="button" class="btn btn-primary" id="btnTriggerCallE" style="flex: 2; background: #059669; border-color: #059669; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; padding: 12px;">
                <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span id="triggerCallEBtnText">Place Call to My Phone</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    this.allProductsCache = await window.agriApi.getProducts();
    this.renderCategories();
    this.bindEvents();
    await this.refreshProducts();
    this.updateCartBadge();
  }

  renderCategories() {
    const I = window.AgriIcons || {};
    const categories = [
      { id: 'All', icon: I.sprout || '', label: 'All Items' },
      { id: 'Seeds', icon: I.sprout || '', label: 'Seeds' },
      { id: 'Tractors', icon: I.tractor || '', label: 'Tractors' },
      { id: 'Machines', icon: I.cpu || '', label: 'Machines & Harvesters' },
      { id: 'Fertilizers', icon: I.flask || '', label: 'Fertilizers' },
      { id: 'Manure', icon: I.leaf || '', label: 'Organic Manure' },
      { id: 'Pesticides', icon: I.shield || '', label: 'Bio-Pesticides' },
      { id: 'Irrigation', icon: I.droplet || '', label: 'Irrigation & Solar' },
      { id: 'Tools', icon: I.wrench || '', label: 'Tools & Drones' }
    ];

    const bar = document.getElementById('categoryScrollBar');
    if (!bar) return;

    // Calculate category counts
    const counts = { All: this.allProductsCache.length };
    this.allProductsCache.forEach(p => {
      const cat = p.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    bar.innerHTML = categories.map(c => {
      const count = c.id === 'All' ? counts.All : (counts[c.id] || 0);
      return `
        <button class="cat-pill ${c.id === this.currentCategory ? 'active' : ''}" data-cat="${c.id}">
          <span class="cat-icon">${c.icon}</span>
          <span class="cat-label">${c.label}</span>
          <span class="cat-count-badge">${count}</span>
        </button>
      `;
    }).join('');

    bar.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        bar.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.currentCategory = target.dataset.cat;
        this.refreshProducts();
      });
    });

    // Arrow navigation for horizontal scrolling
    const scrollLeftBtn = document.getElementById('catScrollLeft');
    const scrollRightBtn = document.getElementById('catScrollRight');
    if (scrollLeftBtn && scrollRightBtn) {
      scrollLeftBtn.addEventListener('click', () => bar.scrollBy({ left: -200, behavior: 'smooth' }));
      scrollRightBtn.addEventListener('click', () => bar.scrollBy({ left: 200, behavior: 'smooth' }));
    }
  }

  bindEvents() {
    const searchInput = document.getElementById('marketSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.refreshProducts();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.refreshProducts();
      });
    }

    // Type toggles (All, Buy Inputs, Machinery Rentals)
    document.querySelectorAll('.btn-type-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-type-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilterType = e.currentTarget.dataset.type;
        this.refreshProducts();
      });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById('marketSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.refreshProducts();
      });
    }

    // Price Filter Chips
    document.querySelectorAll('.price-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.price-chip').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.priceRange = e.currentTarget.dataset.price;
        this.refreshProducts();
      });
    });

    // Verified Only Checkbox
    const verifiedCheckbox = document.getElementById('verifiedOnlyCheckbox');
    if (verifiedCheckbox) {
      verifiedCheckbox.addEventListener('change', (e) => {
        this.verifiedOnly = e.target.checked;
        this.refreshProducts();
      });
    }

    // View Mode Switcher
    const gridBtn = document.getElementById('btnViewGrid');
    const compactBtn = document.getElementById('btnViewCompact');
    const feedContainer = document.getElementById('marketplaceFeed');

    if (gridBtn && compactBtn && feedContainer) {
      gridBtn.addEventListener('click', () => {
        gridBtn.classList.add('active');
        compactBtn.classList.remove('active');
        this.viewMode = 'grid';
        feedContainer.classList.remove('compact-mode');
      });
      compactBtn.addEventListener('click', () => {
        compactBtn.classList.add('active');
        gridBtn.classList.remove('active');
        this.viewMode = 'compact';
        feedContainer.classList.add('compact-mode');
      });
    }

    // Voice search button
    const voiceSearchBtn = document.getElementById('btnMarketVoiceSearch');
    if (voiceSearchBtn) {
      voiceSearchBtn.addEventListener('click', () => {
        if (window.aiAssistant) {
          window.aiAssistant.openModal();
          window.aiAssistant.triggerVoiceListen();
        }
      });
    }

    // Cart Drawer triggers
    const openCartBtn = document.getElementById('btnOpenCart');
    const closeCartBtn = document.getElementById('btnCloseCart');
    const cartBackdrop = document.getElementById('cartDrawerBackdrop');

    if (openCartBtn) openCartBtn.addEventListener('click', () => this.openCartDrawer());
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.closeCartDrawer());
    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', (e) => {
        if (e.target === cartBackdrop) this.closeCartDrawer();
      });
    }

    // Create Listing Modal triggers
    const openListingBtn = document.getElementById('btnOpenCreateListing');
    const closeListingBtn = document.getElementById('btnCloseCreateListing');
    const cancelListingBtn = document.getElementById('btnCancelCreateListing');
    const listingModal = document.getElementById('createListingModal');
    const listingForm = document.getElementById('createListingForm');

    if (openListingBtn) openListingBtn.addEventListener('click', () => { listingModal.style.display = 'flex'; });
    if (closeListingBtn) closeListingBtn.addEventListener('click', () => { listingModal.style.display = 'none'; });
    if (cancelListingBtn) cancelListingBtn.addEventListener('click', () => { listingModal.style.display = 'none'; });

    if (listingForm) {
      listingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(listingForm);
        const rawSpecs = formData.get('specs') || '';
        const specsArr = rawSpecs ? rawSpecs.split(',').map(s => s.trim()).filter(Boolean) : ['Farmer Direct', 'Quality Inspected'];

        const newListing = {
          name: formData.get('productName'),
          category: formData.get('category'),
          type: formData.get('listingType'),
          price: parseFloat(formData.get('price')),
          unit: formData.get('unit'),
          quantityAvailable: parseInt(formData.get('quantityAvailable'), 10),
          location: formData.get('location'),
          specs: specsArr,
          description: formData.get('description'),
          verifiedSeller: true
        };

        await window.agriApi.createProductListing(newListing);
        listingModal.style.display = 'none';
        listingForm.reset();
        if (window.showAgriToast) {
          window.showAgriToast('Your agricultural listing has been published!', 'success');
        }
        this.allProductsCache = await window.agriApi.getProducts();
        this.renderCategories();
        await this.refreshProducts();
      });
    }

    // CALL-E Voice Modal triggers
    const heroCallEBtn = document.getElementById('btnHeroInitiateCallE');
    const headerCallEBtn = document.getElementById('btnOpenCallEModal');
    const closeCallEBtn = document.getElementById('btnCloseCallEModal');
    const cancelCallEBtn = document.getElementById('btnCancelCallE');
    const triggerCallEBtn = document.getElementById('btnTriggerCallE');
    const callEBackdrop = document.getElementById('callEModalBackdrop');

    if (heroCallEBtn) heroCallEBtn.addEventListener('click', () => this.openCallEModal());
    if (headerCallEBtn) headerCallEBtn.addEventListener('click', () => this.openCallEModal());
    if (closeCallEBtn) closeCallEBtn.addEventListener('click', () => this.closeCallEModal());
    if (cancelCallEBtn) cancelCallEBtn.addEventListener('click', () => this.closeCallEModal());
    if (triggerCallEBtn) triggerCallEBtn.addEventListener('click', () => this.triggerCallE());
    if (callEBackdrop) {
      callEBackdrop.addEventListener('click', (e) => {
        if (e.target === callEBackdrop) this.closeCallEModal();
      });
    }

    window.addEventListener('agri:cart-updated', () => {
      this.updateCartBadge();
      this.renderCartDrawerItems();
    });
  }

  async openCallEModal() {
    const backdrop = document.getElementById('callEModalBackdrop');
    if (!backdrop) return;
    backdrop.style.display = 'flex';

    // Fetch config to populate the phone number
    try {
      const res = await fetch('/api/v1/marketplace/call-config');
      if (res.ok) {
        const config = await res.json();
        const phoneInput = document.getElementById('callEPhoneInput');
        const badge = document.getElementById('callEConfigBadge');
        if (phoneInput && config.phoneNumber) {
          phoneInput.value = config.phoneNumber;
        }
        if (badge) {
          if (config.configured) {
            badge.className = 'badge badge-success';
            badge.textContent = '● API Key Active';
          } else {
            badge.className = 'badge badge-warning';
            badge.textContent = '● API Key Missing in .env';
          }
        }
      }
    } catch (e) {
      console.warn('Could not load call config:', e);
    }
  }

  closeCallEModal() {
    const backdrop = document.getElementById('callEModalBackdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

  async triggerCallE() {
    const phoneInput = document.getElementById('callEPhoneInput');
    const phone = phoneInput ? phoneInput.value.trim() : '+919844775528';
    const statusBox = document.getElementById('callEStatusBox');
    const statusTitle = document.getElementById('callEStatusTitle');
    const statusDesc = document.getElementById('callEStatusDesc');
    const statusIcon = document.getElementById('callEStatusIcon');
    const btn = document.getElementById('btnTriggerCallE');
    const btnText = document.getElementById('triggerCallEBtnText');

    if (!phone) {
      alert('Please enter a valid phone number with country code (e.g. +919844775528).');
      return;
    }

    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Dialing Phone...';
    if (statusIcon) statusIcon.textContent = '📞';
    if (statusBox) {
      statusBox.style.background = '#eff6ff';
      statusBox.style.borderColor = '#93c5fd';
    }
    if (statusTitle) statusTitle.textContent = `Dialing ${phone}...`;
    if (statusDesc) statusDesc.textContent = 'CALL-E is establishing connection. Your phone will ring in 3-5 seconds!';
    if (statusBox) statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const res = await fetch('/api/v1/marketplace/call-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (statusIcon) statusIcon.textContent = '🎉';
        if (statusBox) {
          statusBox.style.background = '#f0fdf4';
          statusBox.style.borderColor = '#86efac';
        }
        if (statusTitle) statusTitle.textContent = 'Call Dispatched Successfully!';
        if (statusDesc) {
          statusDesc.innerHTML = `
            <strong>Call ID:</strong> ${data.callId}<br>
            <strong>Booking Ref:</strong> ${data.bookingId}<br>
            Pick up your phone now to enquire and book commodities!
          `;
        }
        if (btnText) btnText.textContent = 'Call Dispatched ✓';
        if (window.showAgriToast) {
          window.showAgriToast(`Calling ${phone}! Pick up to book seeds or tractors.`, 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to dispatch call');
      }
    } catch (err) {
      console.error('Call error:', err);
      if (statusIcon) statusIcon.textContent = '⚠️';
      if (statusBox) {
        statusBox.style.background = '#fef2f2';
        statusBox.style.borderColor = '#fca5a5';
      }
      if (statusTitle) statusTitle.textContent = 'Call Initiation Error';
      if (statusDesc) statusDesc.textContent = err.message;
      if (btnText) btnText.textContent = 'Retry Call';
      if (window.showAgriToast) {
        window.showAgriToast('Call error: ' + err.message, 'danger');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async refreshProducts() {
    const feed = document.getElementById('marketplaceFeed');
    const countText = document.getElementById('resultsCountText');
    const statCounter = document.getElementById('statListingCount');
    if (!feed) return;
    const I = window.AgriIcons || {};

    const products = await window.agriApi.searchProducts(
      this.searchQuery,
      this.currentCategory,
      this.currentFilterType,
      this.sortBy,
      this.priceRange,
      this.verifiedOnly
    );

    if (statCounter && this.allProductsCache.length) {
      statCounter.textContent = `${this.allProductsCache.length}+`;
    }

    if (countText) {
      countText.innerHTML = `Showing <strong>${products.length}</strong> listings in <strong>${this.currentCategory === 'All' ? 'All Categories' : this.currentCategory}</strong>`;
    }

    if (products.length === 0) {
      feed.innerHTML = `
        <div class="empty-state-card" style="text-align: center; padding: 60px 20px; grid-column: 1 / -1;">
          <div style="font-size: 42px; color: #94a3b8; margin-bottom: 16px;">${I.search || ''}</div>
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">No agricultural listings found</h3>
          <p class="text-muted" style="max-width: 480px; margin: 0 auto 20px;">
            We couldn't find items matching your search or filters. Try adjusting your price range, search terms, or ask the AI Assistant.
          </p>
          <button class="btn btn-primary" id="btnResetMarketSearch">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('btnResetMarketSearch');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.currentCategory = 'All';
          this.currentFilterType = 'all';
          this.sortBy = 'popular';
          this.priceRange = 'all';
          this.verifiedOnly = false;
          const input = document.getElementById('marketSearchInput');
          if (input) input.value = '';
          const clearBtn = document.getElementById('btnClearSearch');
          if (clearBtn) clearBtn.style.display = 'none';
          const verifiedCheckbox = document.getElementById('verifiedOnlyCheckbox');
          if (verifiedCheckbox) verifiedCheckbox.checked = false;
          document.querySelectorAll('.btn-type-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
          document.querySelectorAll('.price-chip').forEach((b, i) => b.classList.toggle('active', i === 0));
          this.renderCategories();
          this.refreshProducts();
        });
      }
      return;
    }

    feed.innerHTML = products.map(p => this.renderProductCard(p)).join('');

    // Attach listeners for each card
    products.forEach(p => {
      // Wishlist / Like button
      const likeBtn = document.getElementById(`like-btn-${p.id}`);
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const countSpan = document.getElementById(`like-count-${p.id}`);
          if (this.likedProducts.has(p.id)) {
            this.likedProducts.delete(p.id);
            p.likes--;
            likeBtn.classList.remove('liked');
          } else {
            this.likedProducts.add(p.id);
            p.likes++;
            likeBtn.classList.add('liked');
            likeBtn.classList.add('heart-burst');
            setTimeout(() => likeBtn.classList.remove('heart-burst'), 600);
          }
          if (countSpan) countSpan.textContent = p.likes;
        });
      }

      // Add to Cart / Rent Booking button
      const buyBtn = document.getElementById(`buy-btn-${p.id}`);
      if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.agriApi.addToCart(p, 1);
          
          const origHtml = buyBtn.innerHTML;
          buyBtn.innerHTML = `${I.check || '✓'} Added!`;
          buyBtn.classList.add('btn-added-flash');
          setTimeout(() => {
            buyBtn.innerHTML = origHtml;
            buyBtn.classList.remove('btn-added-flash');
          }, 1400);

          if (window.showAgriToast) {
            window.showAgriToast(`Added "${p.name}" to agricultural basket`, 'success');
          }
        });
      }

      // Quick View details button
      const viewBtn = document.getElementById(`view-btn-${p.id}`);
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showProductDetails(p);
        });
      }

      // Card Click opens details
      const card = document.getElementById(`product-card-${p.id}`);
      if (card) {
        card.addEventListener('click', () => this.showProductDetails(p));
      }

      // Ask AI button
      const askAiBtn = document.getElementById(`ask-ai-${p.id}`);
      if (askAiBtn) {
        askAiBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.aiAssistant) {
            window.aiAssistant.openModal();
            let query = `Can you provide agronomic guidance for ${p.name} from ${p.sellerName}? Is it suitable for my current soil moisture (around 68%)?`;
            if (p.type === 'rental') {
              query = `What are the requirements and best field conditions for renting the ${p.name} from ${p.sellerName}?`;
            }
            window.aiAssistant.processUserText(query);
          }
        });
      }
    });
  }

  renderProductCard(p) {
    const isRental = p.type === 'rental';
    const isLiked = this.likedProducts.has(p.id);
    const I = window.AgriIcons || {};

    // Calculate discount percentage if original price exists
    let discountBadge = '';
    if (p.originalPrice && p.originalPrice > p.price) {
      const discountPct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      discountBadge = `<span class="discount-badge">${discountPct}% OFF</span>`;
    }

    // Specs tags
    const specsHtml = (p.specs || []).slice(0, 3).map(s => `
      <span class="spec-tag">${s}</span>
    `).join('');

    return `
      <div class="market-card ${isRental ? 'card-rental' : 'card-sale'}" id="product-card-${p.id}">
        <!-- Card Media -->
        <div class="card-media">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="media-overlay-gradient"></div>

          <!-- Top-left badges -->
          <div class="media-top-left-badges">
            <span class="badge ${isRental ? 'badge-warning' : 'badge-primary'} card-type-badge">
              ${isRental ? '🚜 FOR RENT' : '🌱 FOR SALE'}
            </span>
            ${p.badge ? `<span class="badge badge-accent card-feature-badge">${p.badge}</span>` : ''}
          </div>

          <!-- Top-right Wishlist button -->
          <button class="btn-like-floating ${isLiked ? 'liked' : ''}" id="like-btn-${p.id}" title="Save to Wishlist">
            ${I.heart || ''}
            <span class="like-floating-count" id="like-count-${p.id}">${p.likes || 0}</span>
          </button>

          <!-- Quick view hint -->
          <div class="card-quick-overlay">
            <span class="quick-view-pill">${I.info || ''} Quick Specs</span>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <!-- Seller Metadata Row -->
          <div class="seller-meta-row">
            <div class="seller-avatar-initial">
              ${(p.sellerName || 'A')[0]}
            </div>
            <div class="seller-info-col">
              <div class="seller-title-flex">
                <span class="seller-name">${p.sellerName}</span>
                ${p.verifiedSeller ? `<span class="verified-icon-badge" title="APMC / AgriSense Verified Seller">${I.check || '✓'}</span>` : ''}
              </div>
              <div class="seller-subline">
                <span class="seller-rating-pill">★ ${p.sellerRating}</span>
                <span class="seller-location-text">${I.mapPin || ''} ${p.location} ${p.distance ? `• ${p.distance}` : ''}</span>
              </div>
            </div>
          </div>

          <!-- Title -->
          <h4 class="product-title" title="${p.name}">${p.name}</h4>

          <!-- Agronomic Specs Row -->
          <div class="card-specs-row">
            ${specsHtml}
          </div>

          <!-- Description snippet -->
          <p class="product-snippet">${p.description}</p>

          <!-- Price & Stock Row -->
          <div class="price-availability-row">
            <div class="price-block">
              <div class="price-main-line">
                <span class="currency">₹</span>
                <span class="price-val">${p.price.toLocaleString('en-IN')}</span>
                <span class="price-unit">/${p.unit}</span>
              </div>
              ${p.originalPrice && p.originalPrice > p.price ? `
                <div class="price-sub-line">
                  <span class="original-price">₹${p.originalPrice.toLocaleString('en-IN')}</span>
                  ${discountBadge}
                </div>
              ` : ''}
            </div>

            <div class="stock-block">
              <span class="stock-pill ${p.quantityAvailable > 0 ? (isRental ? 'rental-open' : 'in-stock') : 'out-of-stock'}">
                ${isRental ? `Available (${p.quantityAvailable} units)` : (p.quantityAvailable > 0 ? `In Stock (${p.quantityAvailable})` : 'Out of Stock')}
              </span>
            </div>
          </div>

          <!-- Action Buttons Footer -->
          <div class="card-footer-actions">
            <button class="btn-ask-ai" id="ask-ai-${p.id}" title="Ask AI about dosage, suitability & field application">
              ${I.bot || ''} <span>Ask AI</span>
            </button>
            <button class="btn-view-card" id="view-btn-${p.id}" title="View details and full agronomic specs">
              <span>Specs</span>
            </button>
            <button class="btn ${isRental ? 'btn-warning' : 'btn-primary'} btn-buy-card" id="buy-btn-${p.id}">
              ${isRental ? `${I.tractor || ''} Book Machine` : `${I.cart || ''} Add to Basket`}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showProductDetails(p) {
    const modal = document.getElementById('productDetailsModal');
    const content = document.getElementById('productModalContent');
    if (!modal || !content) return;
    const I = window.AgriIcons || {};
    const isRental = p.type === 'rental';

    const specsList = (p.specs || []).map(s => `<li>${I.check || '✓'} ${s}</li>`).join('');

    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-header-meta">
          <span class="badge ${isRental ? 'badge-warning' : 'badge-primary'}">${isRental ? 'Machinery Rental' : 'Certified Farm Input'}</span>
          ${p.badge ? `<span class="badge badge-accent">${p.badge}</span>` : ''}
          <span class="text-muted small">ID: ${p.id}</span>
        </div>
        <button class="modal-close-btn" id="btnCloseDetailsModal">${I.close || '✕'}</button>
      </div>

      <div class="modal-body">
        <div class="product-modal-grid">
          <!-- Left Column: Image & Seller Trust Box -->
          <div class="modal-left-col">
            <div class="modal-product-img">
              <img src="${p.image}" alt="${p.name}" />
            </div>

            <div class="seller-card-box">
              <div class="seller-box-header">
                <div class="seller-avatar-initial">${(p.sellerName || 'A')[0]}</div>
                <div>
                  <strong>${p.sellerName}</strong>
                  <div class="seller-box-rating">
                    ★ ${p.sellerRating} (${p.reviewCount || 48} farmer reviews)
                  </div>
                </div>
              </div>
              <div class="seller-box-location">
                ${I.mapPin || ''} ${p.location} ${p.distance ? `(${p.distance} from your farm)` : ''}
              </div>
            </div>

            <div class="modal-trust-box">
              <div class="trust-item">${I.shield || '✓'} 100% Quality Inspected & APMC Certified</div>
              <div class="trust-item">${I.truck || '✓'} Direct Field-Gate Fast Dispatch</div>
              <div class="trust-item">${I.check || '✓'} Zero Middlemen Brokerage Fee</div>
              ${isRental ? `<div class="trust-item">${I.award || '✓'} Fuel & Certified Driver Included</div>` : ''}
            </div>
          </div>

          <!-- Right Column: Specs, Sensor Integration, Pricing & Booking -->
          <div class="modal-right-col">
            <h3 class="modal-product-title">${p.name}</h3>
            
            <div class="modal-price-box">
              <div class="modal-price-main">
                <span class="currency">₹</span>
                <span class="big-price">${p.price.toLocaleString('en-IN')}</span>
                <span class="big-unit">/${p.unit}</span>
              </div>
              ${p.originalPrice && p.originalPrice > p.price ? `
                <div class="modal-original-price-row">
                  <span class="modal-strike-price">MSRP ₹${p.originalPrice.toLocaleString('en-IN')}</span>
                  <span class="discount-badge">${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% Discount</span>
                </div>
              ` : ''}
            </div>

            <!-- AgriSense IoT Telemetry Match -->
            <div class="iot-telemetry-match-card">
              <div class="iot-match-header">
                ${I.activity || I.zap || ''} <strong>AgriSense Farm Match</strong>
              </div>
              <p class="iot-match-desc">
                Current Mandya Plot 4B moisture is <strong>68% (Optimal)</strong>. 
                ${isRental ? 'Soil compaction and wetness levels are ideal for machinery deployment today.' : 'This input is fully compatible with your current tillering phenological stage.'}
              </p>
            </div>

            <div class="modal-desc-section">
              <h4>Description & Agronomic Usage</h4>
              <p class="modal-desc">${p.description}</p>
            </div>

            ${p.specs && p.specs.length ? `
              <div class="modal-specs-section">
                <h4>Key Agronomic Highlights</h4>
                <ul class="modal-specs-bullet-list">
                  ${specsList}
                </ul>
              </div>
            ` : ''}

            <!-- Booking / Purchase Stepper -->
            <div class="modal-order-stepper-row">
              <div class="quantity-stepper-box">
                <label>${isRental ? 'Hours / Days:' : 'Quantity:'}</label>
                <div class="stepper-controls">
                  <button type="button" class="btn-step" id="modalQtyMinus">-</button>
                  <input type="number" id="modalQtyInput" value="1" min="1" max="${p.quantityAvailable}" readonly />
                  <button type="button" class="btn-step" id="modalQtyPlus">+</button>
                </div>
              </div>
              <div class="modal-total-calc-box">
                <span class="total-label">Subtotal:</span>
                <span class="total-calc-val" id="modalTotalCalc">₹${p.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="modal-actions-bar">
              <button class="btn btn-outline" id="modalAskAiBtn">
                ${I.bot || ''} Ask Agronomist AI
              </button>
              <button class="btn ${isRental ? 'btn-warning' : 'btn-primary'} btn-modal-buy" id="modalBuyBtn">
                ${isRental ? `${I.tractor || ''} Confirm Rental Booking` : `${I.cart || ''} Add to Basket`}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Modal Qty Stepper
    let currentQty = 1;
    const qtyInput = document.getElementById('modalQtyInput');
    const totalCalc = document.getElementById('modalTotalCalc');
    const minusBtn = document.getElementById('modalQtyMinus');
    const plusBtn = document.getElementById('modalQtyPlus');

    const updateTotal = () => {
      if (qtyInput) qtyInput.value = currentQty;
      if (totalCalc) totalCalc.textContent = `₹${(p.price * currentQty).toLocaleString('en-IN')}`;
    };

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        if (currentQty > 1) { currentQty--; updateTotal(); }
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        if (currentQty < p.quantityAvailable) { currentQty++; updateTotal(); }
      });
    }

    // Modal Buy
    const modalBuyBtn = document.getElementById('modalBuyBtn');
    if (modalBuyBtn) {
      modalBuyBtn.addEventListener('click', () => {
        window.agriApi.addToCart(p, currentQty);
        modal.style.display = 'none';
        if (window.showAgriToast) {
          window.showAgriToast(`Added ${currentQty}x "${p.name}" to agricultural basket!`, 'success');
        }
        this.openCartDrawer();
      });
    }

    // Modal Ask AI
    const modalAskAiBtn = document.getElementById('modalAskAiBtn');
    if (modalAskAiBtn) {
      modalAskAiBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (window.aiAssistant) {
          window.aiAssistant.openModal();
          window.aiAssistant.processUserText(`Tell me agronomic recommendations and dosage for ${p.name}`);
        }
      });
    }

    const closeBtn = document.getElementById('btnCloseDetailsModal');
    if (closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  }

  // --- CART DRAWER IMPLEMENTATION ---
  openCartDrawer() {
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (backdrop) {
      backdrop.style.display = 'flex';
      this.renderCartDrawerItems();
    }
  }

  closeCartDrawer() {
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (backdrop) backdrop.style.display = 'none';
  }

  updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;
    const cart = window.agriApi.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
    badge.classList.toggle('has-items', count > 0);
  }

  renderCartDrawerItems() {
    const list = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartFooter');
    const countLabel = document.getElementById('cartItemCountLabel');
    if (!list || !footer) return;

    const cart = window.agriApi.getCart();
    const I = window.AgriIcons || {};

    if (countLabel) {
      const totalUnits = cart.reduce((s, i) => s + i.quantity, 0);
      countLabel.textContent = `${totalUnits} items`;
    }

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="empty-cart-state" style="text-align: center; padding: 40px 10px;">
          <div style="font-size: 40px; color: #94a3b8; margin-bottom: 12px;">${I.cart || ''}</div>
          <h4>Your Agricultural Basket is Empty</h4>
          <p class="text-muted small">Browse seeds, fertilizers, or rent heavy equipment for your farm.</p>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn btn-outline" style="width: 100%;" id="btnContinueShopping">Continue Browsing</button>
      `;
      const continueBtn = document.getElementById('btnContinueShopping');
      if (continueBtn) continueBtn.addEventListener('click', () => this.closeCartDrawer());
      return;
    }

    let subtotal = 0;
    list.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="cart-item-row" id="cart-item-${item.productId}">
          <img src="${item.image || 'assets/images/tomato_seeds.svg'}" alt="${item.name}" />
          <div class="cart-item-details">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-price">₹${item.price.toLocaleString('en-IN')} / ${item.unit}</div>
            <div class="cart-qty-ctrl">
              <button class="btn-qty" onclick="window.agriMarket.modifyCartQty('${item.productId}', -1)">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="btn-qty" onclick="window.agriMarket.modifyCartQty('${item.productId}', 1)">+</button>
              <span class="cart-item-subtotal">₹${itemTotal.toLocaleString('en-IN')}</span>
              <button class="btn-remove" onclick="window.agriMarket.removeCartItem('${item.productId}')" title="Remove item">
                ${I.close || '✕'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const subsidyDiscount = subtotal > 1500 ? 150 : 0;
    const finalTotal = subtotal - subsidyDiscount;

    footer.innerHTML = `
      <div class="cart-summary-box">
        <div class="summary-line">
          <span>Items Subtotal</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${subsidyDiscount > 0 ? `
          <div class="summary-line text-success">
            <span>Rural Freight Subsidy</span>
            <span>- ₹${subsidyDiscount}</span>
          </div>
        ` : ''}
        <div class="summary-line">
          <span>GST / APMC Cess</span>
          <span class="text-success">₹0 (Govt Agricultural Exemption)</span>
        </div>
        <div class="summary-total-line">
          <strong>Payable Amount</strong>
          <strong class="total-price">₹${finalTotal.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <button class="btn btn-primary btn-checkout" id="btnPlaceOrder" style="width: 100%;">
        ${I.check || ''} Place Order (Instant UPI / KCC Checkout)
      </button>
      <div class="checkout-guarantee-note">
        ${I.shield || ''} Protected by AgriMarket Smart Contract Escrow
      </div>
    `;

    const placeOrderBtn = document.getElementById('btnPlaceOrder');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', async () => {
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `Processing Secure Order...`;

        setTimeout(() => {
          const newOrder = window.agriApi.checkout('Kisan Credit Card (Ref: KCC-2026/8941)');
          this.closeCartDrawer();
          this.updateCartBadge();

          if (window.showAgriToast) {
            window.showAgriToast(`Order #${newOrder.orderId} Confirmed! View in Orders & Logistics.`, 'success');
          }

          // Navigate to orders if available
          if (window.agriApp) {
            window.agriApp.switchView('orders');
          }
        }, 1000);
      });
    }
  }

  modifyCartQty(productId, delta) {
    const cart = window.agriApi.getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeCartItem(productId);
        return;
      }
      localStorage.setItem('agri_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('agri:cart-updated'));
    }
  }

  removeCartItem(productId) {
    window.agriApi.removeFromCart(productId);
  }
}

// Global initialization
window.AgriMarketEngine = AgriMarketEngine;
window.agriMarket = new AgriMarketEngine();
window.openCallEGlobalModal = () => {
  if (window.agriMarket) {
    window.agriMarket.openCallEModal();
  }
};
