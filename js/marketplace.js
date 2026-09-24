/**
 * AgriSense & AgriMarket AI - Marketplace Module
 * Social/Community agricultural marketplace supporting Seeds, Fertilizers, Tractors, Tools & Rentals.
 * Uses 100% vector SVG icons (Zero Emojis).
 * Matches PRD Sections 23-29, 39, 42.
 */

class AgriMarketEngine {
  constructor() {
    this.currentCategory = 'All';
    this.currentFilterType = 'all'; // 'all' | 'sale' | 'rental'
    this.searchQuery = '';
    this.selectedProduct = null;
    this.likedProducts = new Set();
  }

  async init(containerId = 'marketplaceContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <div class="marketplace-header-bar">
        <div class="search-filter-row">
          <div class="search-input-box">
            <span class="search-icon">${I.search || ''}</span>
            <input type="text" id="marketSearchInput" class="form-control" placeholder="Search tomato seeds, tractors, organic manure, drip irrigation..." />
            <button class="btn-voice-inline" id="btnMarketVoiceSearch" title="Voice Search with AI">${I.mic || ''}</button>
          </div>
          <div class="filter-type-toggles">
            <button class="btn-type-pill active" data-type="all">All Listings</button>
            <button class="btn-type-pill" data-type="sale">Buy Inputs</button>
            <button class="btn-type-pill" data-type="rental">Machinery Rental</button>
          </div>
          <button class="btn btn-secondary btn-new-listing" id="btnOpenCreateListing">
            ${I.plus || ''} Post Listing
          </button>
          <button class="btn btn-outline btn-cart-toggle" id="btnOpenCart">
            ${I.cart || ''} Cart (<span id="cartCountBadge">0</span>)
          </button>
        </div>

        <div class="category-scroll-bar" id="categoryScrollBar">
          <!-- Category pills injected here -->
        </div>
      </div>

      <div class="marketplace-content-layout">
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
            <h4>Publish Community Listing</h4>
            <button class="modal-close-btn" id="btnCloseCreateListing">${I.close || '✕'}</button>
          </div>
          <div class="modal-body">
            <form id="createListingForm">
              <div class="form-group">
                <label>Listing Type</label>
                <div class="radio-pill-group">
                  <label><input type="radio" name="listingType" value="sale" checked /> Sell Agricultural Product</label>
                  <label><input type="radio" name="listingType" value="rental" /> Equipment / Machinery Rental</label>
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
                  <input type="text" name="unit" class="form-control" placeholder="packet / hour / bag" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group col">
                  <label>Quantity Available</label>
                  <input type="number" name="quantityAvailable" class="form-control" value="10" required />
                </div>
                <div class="form-group col">
                  <label>Depot / Farm Location</label>
                  <input type="text" name="location" class="form-control" placeholder="Mandya, Karnataka" required />
                </div>
              </div>
              <div class="form-group">
                <label>Description & Agronomic Details</label>
                <textarea name="description" class="form-control" rows="3" placeholder="Describe variety, condition, delivery availability..."></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-outline" id="btnCancelCreateListing">Cancel</button>
                <button type="submit" class="btn btn-primary">${I.check || ''} Publish to AgriMarket</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Cart Drawer -->
      <div class="cart-drawer-backdrop" id="cartDrawerBackdrop" style="display: none;">
        <div class="cart-drawer">
          <div class="cart-header">
            <h4>Agricultural Basket</h4>
            <button class="modal-close-btn" id="btnCloseCart">${I.close || '✕'}</button>
          </div>
          <div class="cart-body" id="cartItemsList"></div>
          <div class="cart-footer" id="cartFooter"></div>
        </div>
      </div>
    `;

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
      { id: 'Fertilizers', icon: I.flask || '', label: 'Fertilizers' },
      { id: 'Manure', icon: I.leaf || '', label: 'Manure' },
      { id: 'Pesticides', icon: I.shield || '', label: 'Pesticides' },
      { id: 'Tractors', icon: I.tractor || '', label: 'Tractors' },
      { id: 'Machines', icon: I.cpu || '', label: 'Machines' },
      { id: 'Equipment', icon: I.wrench || '', label: 'Equipment' },
      { id: 'Tools', icon: I.wrench || '', label: 'Tools' },
      { id: 'Irrigation', icon: I.droplet || '', label: 'Irrigation' }
    ];

    const bar = document.getElementById('categoryScrollBar');
    if (!bar) return;

    bar.innerHTML = categories.map(c => `
      <button class="cat-pill ${c.id === this.currentCategory ? 'active' : ''}" data-cat="${c.id}">
        <span class="cat-icon">${c.icon}</span>
        <span class="cat-label">${c.label}</span>
      </button>
    `).join('');

    bar.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        bar.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.currentCategory = target.dataset.cat;
        this.refreshProducts();
      });
    });
  }

  bindEvents() {
    const searchInput = document.getElementById('marketSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.refreshProducts();
      });
    }

    document.querySelectorAll('.btn-type-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-type-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilterType = e.currentTarget.dataset.type;
        this.refreshProducts();
      });
    });

    const voiceSearchBtn = document.getElementById('btnMarketVoiceSearch');
    if (voiceSearchBtn) {
      voiceSearchBtn.addEventListener('click', () => {
        if (window.aiAssistant) {
          window.aiAssistant.openModal();
          window.aiAssistant.triggerVoiceListen();
        }
      });
    }

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
        const newListing = {
          name: formData.get('productName'),
          category: formData.get('category'),
          type: formData.get('listingType'),
          price: parseFloat(formData.get('price')),
          unit: formData.get('unit'),
          quantityAvailable: parseInt(formData.get('quantityAvailable'), 10),
          location: formData.get('location'),
          description: formData.get('description')
        };
        await window.agriApi.createProductListing(newListing);
        listingModal.style.display = 'none';
        listingForm.reset();
        if (window.showAgriToast) {
          window.showAgriToast('Listing published to AgriMarket!', 'success');
        }
        await this.refreshProducts();
      });
    }

    window.addEventListener('agri:cart-updated', () => {
      this.updateCartBadge();
      this.renderCartDrawerItems();
    });
  }

  async refreshProducts() {
    const feed = document.getElementById('marketplaceFeed');
    if (!feed) return;
    const I = window.AgriIcons || {};

    const products = await window.agriApi.searchProducts(this.searchQuery, this.currentCategory, this.currentFilterType);

    if (products.length === 0) {
      feed.innerHTML = `
        <div class="empty-state-card" style="text-align: center; padding: 40px 20px; grid-column: 1 / -1;">
          <div style="font-size: 32px; color: #94a3b8; margin-bottom: 12px;">${I.search || ''}</div>
          <h4>No agricultural listings match your criteria</h4>
          <p class="text-muted small">Try searching for "seeds", "tractor", or speak directly to the AI Assistant.</p>
          <button class="btn btn-outline" id="btnResetMarketSearch" style="margin-top: 14px;">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('btnResetMarketSearch');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.currentCategory = 'All';
          this.currentFilterType = 'all';
          const input = document.getElementById('marketSearchInput');
          if (input) input.value = '';
          this.renderCategories();
          this.refreshProducts();
        });
      }
      return;
    }

    feed.innerHTML = products.map(p => this.renderProductCard(p)).join('');

    products.forEach(p => {
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
          }
          if (countSpan) countSpan.textContent = p.likes;
        });
      }

      const buyBtn = document.getElementById(`buy-btn-${p.id}`);
      if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.agriApi.addToCart(p, 1);
          if (window.showAgriToast) {
            window.showAgriToast(`Added "${p.name}" to cart`, 'success');
          }
        });
      }

      const card = document.getElementById(`product-card-${p.id}`);
      if (card) {
        card.addEventListener('click', () => this.showProductDetails(p));
      }

      const askAiBtn = document.getElementById(`ask-ai-${p.id}`);
      if (askAiBtn) {
        askAiBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.aiAssistant) {
            window.aiAssistant.openModal();
            window.aiAssistant.processUserText(`Tell me about ${p.name} from ${p.sellerName}`);
          }
        });
      }
    });
  }

  renderProductCard(p) {
    const isRental = p.type === 'rental';
    const isLiked = this.likedProducts.has(p.id);
    const I = window.AgriIcons || {};

    return `
      <div class="market-card ${isRental ? 'card-rental' : 'card-sale'}" id="product-card-${p.id}">
        <div class="card-media">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <span class="badge ${isRental ? 'badge-warning' : 'badge-primary'} card-type-badge">
            ${isRental ? 'FOR RENT' : 'FOR SALE'}
          </span>
          ${p.badge ? `<span class="badge badge-accent card-feature-badge">${p.badge}</span>` : ''}
        </div>

        <div class="card-content">
          <div class="seller-meta">
            <span class="seller-avatar-badge">${I.user || ''}</span>
            <div class="seller-info">
              <span class="seller-name">${p.sellerName}</span>
              <span class="seller-rating" style="display:inline-flex; align-items:center; gap:3px;">${I.award || ''} ${p.sellerRating} • ${p.location}</span>
            </div>
          </div>

          <h4 class="product-title">${p.name}</h4>
          <p class="product-snippet">${p.description}</p>

          <div class="price-availability-row">
            <div class="price-block">
              <span class="currency">₹</span>
              <span class="price-val">${p.price.toLocaleString('en-IN')}</span>
              <span class="price-unit">/${p.unit}</span>
            </div>
            <span class="stock-pill ${p.quantityAvailable > 0 ? 'in-stock' : 'out-of-stock'}">
              ${p.quantityAvailable > 0 ? `In Stock (${p.quantityAvailable})` : 'Out of Stock'}
            </span>
          </div>

          <div class="card-footer-actions">
            <button class="btn-like ${isLiked ? 'liked' : ''}" id="like-btn-${p.id}">
              ${I.heart || ''} <span id="like-count-${p.id}">${p.likes || 0}</span>
            </button>
            <button class="btn-ask-ai" id="ask-ai-${p.id}" title="Ask AI about this listing">
              ${I.bot || ''} Ask AI
            </button>
            <button class="btn ${isRental ? 'btn-warning' : 'btn-primary'} btn-buy-card" id="buy-btn-${p.id}">
              ${isRental ? 'Book Rental' : 'Add to Cart'}
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

    content.innerHTML = `
      <div class="modal-header">
        <h4>${p.name}</h4>
        <button class="modal-close-btn" id="btnCloseDetailsModal">${I.close || '✕'}</button>
      </div>
      <div class="modal-body product-modal-body">
        <div class="product-modal-grid">
          <div class="modal-product-img">
            <img src="${p.image}" alt="${p.name}" />
            <span class="badge ${p.type === 'rental' ? 'badge-warning' : 'badge-primary'}">
              ${p.type === 'rental' ? 'RENTAL EQUIPMENT' : 'AGRICULTURAL INPUT'}
            </span>
          </div>
          <div class="modal-product-specs">
            <div class="seller-card-box">
              <strong>Verified Seller:</strong> ${p.sellerName} (Rating: ${p.sellerRating} / 5.0)<br>
              <strong>Location:</strong> ${p.location}<br>
              <strong>Available Units:</strong> ${p.quantityAvailable} ${p.unit}s
            </div>

            <div class="modal-price-box">
              <span class="big-price">₹${p.price.toLocaleString('en-IN')}</span>
              <span class="big-unit">per ${p.unit}</span>
            </div>

            <p class="modal-desc">${p.description}</p>

            <div class="modal-trust-box">
              <span class="trust-item">${I.check || ''} Farm Quality & Germination Verified</span>
              <span class="trust-item">${I.check || ''} Direct Farmer-to-Farmer Support</span>
              <span class="trust-item">${I.check || ''} Transparent Regional Mandya APMC Pricing</span>
            </div>

            <div class="modal-actions-bar">
              <button class="btn btn-outline" id="btnContactSeller">Contact Seller</button>
              <button class="btn btn-primary" id="btnModalAddToCart">
                ${p.type === 'rental' ? 'Confirm Rental Booking' : 'Add to Basket (₹' + p.price + ')'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('btnCloseDetailsModal').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    document.getElementById('btnModalAddToCart').onclick = () => {
      window.agriApi.addToCart(p, 1);
      modal.style.display = 'none';
      if (window.showAgriToast) window.showAgriToast(`Added "${p.name}" to cart!`, 'success');
      this.openCartDrawer();
    };

    document.getElementById('btnContactSeller').onclick = () => {
      alert(`Connecting to ${p.sellerName} at ${p.location} (Demo Dispatch Channel).`);
    };
  }

  updateCartBadge() {
    const cart = window.agriApi.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badge = document.getElementById('cartCountBadge');
    if (badge) badge.textContent = count;
  }

  openCartDrawer() {
    const drawer = document.getElementById('cartDrawerBackdrop');
    if (drawer) {
      drawer.style.display = 'flex';
      this.renderCartDrawerItems();
    }
  }

  closeCartDrawer() {
    const drawer = document.getElementById('cartDrawerBackdrop');
    if (drawer) drawer.style.display = 'none';
  }

  renderCartDrawerItems() {
    const list = document.getElementById('cartItemsList');
    const footer = document.getElementById('cartFooter');
    if (!list || !footer) return;
    const I = window.AgriIcons || {};

    const cart = window.agriApi.getCart();

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="empty-cart-view" style="text-align: center; padding: 40px 10px;">
          <div style="font-size: 32px; color: #94a3b8; margin-bottom: 10px;">${I.cart || ''}</div>
          <p class="text-muted small">Your agricultural basket is empty.</p>
        </div>
      `;
      footer.innerHTML = ``;
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    list.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <h5>${item.name}</h5>
          <span class="cart-price">₹${item.price} / ${item.unit}</span>
          <div class="cart-qty-ctrl">
            <button class="btn-qty" onclick="window.agriMarket.updateQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="btn-qty" onclick="window.agriMarket.updateQty('${item.id}', 1)">+</button>
            <button class="btn-remove" onclick="window.agriMarket.removeItem('${item.id}')">${I.close || '✕'}</button>
          </div>
        </div>
      </div>
    `).join('');

    footer.innerHTML = `
      <div class="cart-summary-box">
        <div class="summary-line">
          <span>Subtotal (${cart.length} items):</span>
          <span>₹${total.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-line text-success">
          <span>Agricultural Transport Subsidy:</span>
          <span>FREE</span>
        </div>
        <div class="summary-total-line">
          <strong>Total Payable:</strong>
          <strong class="total-price">₹${total.toLocaleString('en-IN')}</strong>
        </div>
      </div>
      <button class="btn btn-primary btn-block btn-checkout" id="btnProceedCheckout">
        Proceed to Demo Checkout (₹${total.toLocaleString('en-IN')})
      </button>
    `;

    document.getElementById('btnProceedCheckout').onclick = () => {
      this.closeCartDrawer();
      if (window.showCheckoutModal) {
        window.showCheckoutModal(cart, total);
      }
    };
  }

  updateQty(productId, delta) {
    const cart = window.agriApi.getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      window.agriApi.removeFromCart(productId);
    } else {
      localStorage.setItem('agri_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('agri:cart-updated', { detail: cart }));
    }
  }

  removeItem(productId) {
    window.agriApi.removeFromCart(productId);
  }
}

window.agriMarket = new AgriMarketEngine();
