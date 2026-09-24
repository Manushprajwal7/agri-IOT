/**
 * AgriSense & AgriMarket AI - Orders & Supply-Chain Tracking Module
 * Matches PRD Sections 38, 40, 41, 84.
 * Uses 100% Vector SVG Icons (Zero Emojis).
 */

class OrdersEngine {
  constructor() {
    this.selectedOrder = null;
  }

  async init(containerId = 'ordersContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <div class="orders-layout-grid">
        <div class="orders-list-pane">
          <div class="pane-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-700);">${I.orders || ''}</span>
              <h4>Agricultural Purchase Orders</h4>
            </div>
            <span class="badge badge-accent">Live Supply Chain Sync</span>
          </div>
          <div class="orders-scroll-list" id="ordersListWrapper">
            <div class="loading-spinner-box">Loading orders...</div>
          </div>
        </div>

        <div class="order-detail-pane" id="orderDetailPane">
          <div class="empty-selection-box" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 32px; color: #94a3b8; margin-bottom: 12px;">${I.search || ''}</div>
            <p class="text-muted">Select an order from the left to view complete supply-chain tracking.</p>
          </div>
        </div>
      </div>

      <!-- Demo Checkout Modal (PRD Section 40) -->
      <div class="modal-backdrop" id="demoCheckoutModal" style="display: none;">
        <div class="modal-dialog modal-md">
          <div class="modal-header">
            <h4>Demo Krishi Pay Checkout</h4>
            <button class="modal-close-btn" id="btnCloseCheckoutModal">${I.close || '✕'}</button>
          </div>
          <div class="modal-body" id="checkoutModalBody"></div>
        </div>
      </div>
    `;

    this.bindEvents();
    await this.refreshOrders();
  }

  bindEvents() {
    window.addEventListener('agri:order-created', () => {
      this.refreshOrders();
    });

    const closeCheckoutBtn = document.getElementById('btnCloseCheckoutModal');
    const checkoutModal = document.getElementById('demoCheckoutModal');
    if (closeCheckoutBtn) closeCheckoutBtn.onclick = () => { checkoutModal.style.display = 'none'; };
    if (checkoutModal) {
      checkoutModal.onclick = (e) => {
        if (e.target === checkoutModal) checkoutModal.style.display = 'none';
      };
    }
  }

  async refreshOrders() {
    const listWrapper = document.getElementById('ordersListWrapper');
    if (!listWrapper) return;
    const I = window.AgriIcons || {};

    const orders = await window.agriApi.getOrders();

    if (orders.length === 0) {
      listWrapper.innerHTML = `
        <div class="empty-state-card" style="text-align: center; padding: 30px;">
          <p class="text-muted small">No agricultural orders placed yet.</p>
        </div>
      `;
      return;
    }

    listWrapper.innerHTML = orders.map((o, idx) => `
      <div class="order-card-summary ${this.selectedOrder?.orderId === o.orderId || (!this.selectedOrder && idx === 0) ? 'active' : ''}" 
           id="order-card-${o.orderId}" 
           onclick="window.ordersEngine.selectOrder('${o.orderId}')">
        <div class="order-card-header">
          <span class="order-id-tag">${o.orderId}</span>
          <span class="badge ${this.getStatusBadgeClass(o.status)}">${o.status.toUpperCase()}</span>
        </div>
        <h5 class="order-prod-name">${o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</h5>
        <div class="order-card-footer">
          <span class="order-seller-name" style="display: flex; align-items: center; gap: 4px;">
            ${I.user || ''} ${o.sellerName}
          </span>
          <strong class="order-total-price">₹${o.total.toLocaleString('en-IN')}</strong>
        </div>
        <span class="order-timestamp">${o.formattedDate || 'Recent'}</span>
      </div>
    `).join('');

    const toSelect = this.selectedOrder ? this.selectedOrder.orderId : orders[0].orderId;
    this.selectOrder(toSelect);
  }

  getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'badge-primary';
      case 'processing': return 'badge-warning';
      case 'dispatched': return 'badge-accent';
      case 'completed':
      case 'delivered': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  async selectOrder(orderId) {
    const orders = await window.agriApi.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;
    this.selectedOrder = order;

    const I = window.AgriIcons || {};

    document.querySelectorAll('.order-card-summary').forEach(c => c.classList.remove('active'));
    const activeCard = document.getElementById(`order-card-${orderId}`);
    if (activeCard) activeCard.classList.add('active');

    const detailPane = document.getElementById('orderDetailPane');
    if (!detailPane) return;

    detailPane.innerHTML = `
      <div class="tracking-view-card card">
        <div class="tracking-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h3>Order #${order.orderId}</h3>
            <span class="tracking-sub text-muted small">Placed by: ${order.buyerName} • ${order.formattedDate}</span>
          </div>
          <div class="status-action-pill">
            <span class="badge ${this.getStatusBadgeClass(order.status)} badge-lg">
              ${order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="order-items-table-box" style="margin-bottom: 20px;">
          <h5 style="margin-bottom: 8px;">Ordered Agricultural Products</h5>
          <table class="table-compact">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="order-grand-total" style="display: flex; justify-content: space-between; padding: 12px; background: var(--surface-subtle); border-radius: var(--radius-sm); margin-top: 10px;">
            <span>Total Paid (${order.paymentMode}):</span>
            <span class="grand-price" style="font-weight: 800; color: var(--primary-800);">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Supply-Chain Timeline Stepper (PRD Section 41) -->
        <div class="supply-chain-stepper-box">
          <div class="stepper-title-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--primary-700);">${I.truck || ''}</span>
              <h5>Real-Time Supply Chain Stepper</h5>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.ordersEngine.advanceOrderStatus('${order.orderId}')">
              ${I.zap || ''} Advance Next Stage
            </button>
          </div>
          <div class="stepper-steps">
            ${this.renderTimelineSteps(order)}
          </div>
        </div>

        <!-- Immutable Traceability Certificate (PRD Section 84) -->
        <div class="traceability-certificate-box" style="margin: 16px 0; padding: 14px; background: #f8fafc; border: 1px dashed var(--border-strong); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--primary-700);">${I.shield || ''}</span>
              <strong style="font-size: 12px;">Cryptographic Agricultural Traceability Digest (PRD §84)</strong>
            </div>
            <span class="badge badge-accent">${order.blockchainTag || 'AGRI-TRACE-BLOCK-48912'}</span>
          </div>
          <p class="small text-muted" style="margin-bottom: 6px;">Tamper-proof batch signature verified across Mandya regional agricultural supply chain ledger:</p>
          <code style="font-family: var(--font-mono); font-size: 11px; color: var(--primary-800); word-break: break-all; display: block; background: #e2f9ef; padding: 6px 10px; border-radius: 4px;">
            ${order.traceabilityHash || '0x8f4d92a1c4b7e930128456f082e691ba73c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2'}
          </code>
        </div>

        <div class="seller-dispatch-info">
          <div class="info-block">
            <span class="info-label">${I.mapPin || ''} Dispatch Origin</span>
            <span class="info-val">${order.sellerName}, Karnataka Hub</span>
          </div>
          <div class="info-block">
            <span class="info-label">${I.mapPin || ''} Destination Farm</span>
            <span class="info-val">Plot 4B, Mandya, Karnataka</span>
          </div>
          <div class="info-block">
            <span class="info-label">${I.check || ''} Quality Certification</span>
            <span class="info-val text-success">AgriSense Tamper-Proof Tag</span>
          </div>
        </div>
      </div>
    `;
  }

  renderTimelineSteps(order) {
    const I = window.AgriIcons || {};
    const stages = [
      { key: 'placed', title: 'ORDER PLACED', desc: 'Direct farm order registered in AgriMarket' },
      { key: 'confirmed', title: 'SELLER CONFIRMED', desc: 'Supplier verified inventory & prepared batch' },
      { key: 'processing', title: 'PROCESSING', desc: 'Quality inspected & packaged at regional depot' },
      { key: 'dispatched', title: 'DISPATCHED', desc: 'In transit via regional agricultural logistics' },
      { key: 'delivered', title: 'DELIVERED', desc: 'Handed over at farmer demo plot' }
    ];

    const currentIdx = order.statusIndex ?? 1;

    return stages.map((st, idx) => {
      const isDone = idx <= currentIdx;
      const isCurrent = idx === currentIdx;
      return `
        <div class="stepper-step ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''}">
          <div class="stepper-circle">${isDone ? (I.check || '✓') : idx + 1}</div>
          <div class="stepper-text">
            <strong>${st.title}</strong>
            <p>${st.desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  async advanceOrderStatus(orderId) {
    const orders = await window.agriApi.getOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    const stages = ['placed', 'confirmed', 'processing', 'dispatched', 'delivered'];
    let nextIdx = (order.statusIndex || 0) + 1;
    if (nextIdx >= stages.length) nextIdx = 0;

    order.statusIndex = nextIdx;
    order.status = stages[nextIdx];

    localStorage.setItem('agri_orders', JSON.stringify(orders));
    if (window.showAgriToast) {
      window.showAgriToast(`Order #${order.orderId} advanced to: ${order.status.toUpperCase()}`, 'info');
    }
    this.refreshOrders();
  }
}

window.showCheckoutModal = function(cart, total) {
  const modal = document.getElementById('demoCheckoutModal');
  const body = document.getElementById('checkoutModalBody');
  if (!modal || !body) return;

  const I = window.AgriIcons || {};

  body.innerHTML = `
    <div class="checkout-review-summary">
      <h5>Order Items</h5>
      <ul class="checkout-items-list" style="margin: 10px 0; padding-left: 18px;">
        ${cart.map(c => `<li>${c.name} (x${c.quantity}) — <strong>₹${(c.price * c.quantity).toLocaleString('en-IN')}</strong></li>`).join('')}
      </ul>
      <div class="checkout-total-banner" style="display: flex; justify-content: space-between; padding: 10px 14px; background: #e2f9ef; border-radius: var(--radius-sm); margin-bottom: 16px;">
        <span>Payable Amount:</span>
        <strong style="color: var(--primary-900); font-size: 18px;">₹${total.toLocaleString('en-IN')}</strong>
      </div>
    </div>

    <div class="payment-simulation-box">
      <div class="payment-method-selector" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
        <label><input type="radio" name="paymethod" checked /> UPI / RuPay Instant Krishi Gateway</label>
        <label><input type="radio" name="paymethod" /> Kisan Credit Card (KCC)</label>
      </div>
      <p class="text-muted small">Simulated transaction. Verification hash will be generated upon confirmation.</p>
      <button class="btn btn-primary btn-block btn-pay-now" id="btnSimulatePayment" style="margin-top: 12px;">
        ${I.check || ''} Simulate Payment (₹${total.toLocaleString('en-IN')})
      </button>
    </div>
  `;

  modal.style.display = 'flex';

  document.getElementById('btnSimulatePayment').onclick = async () => {
    const btn = document.getElementById('btnSimulatePayment');
    btn.disabled = true;
    btn.innerHTML = `Processing payment...`;

    await new Promise(r => setTimeout(r, 600));

    const newOrder = await window.agriApi.createOrder({
      sellerName: cart[0]?.sellerName || 'Verified Supplier',
      sellerId: cart[0]?.sellerId || 'seller-101',
      items: cart,
      total: total
    });

    modal.style.display = 'none';

    if (window.showAgriToast) {
      window.showAgriToast(`Payment Successful! Order #${newOrder.orderId} Created`, 'success');
    }

    if (window.navigateToView) {
      window.navigateToView('orders');
    }
  };
};

window.ordersEngine = new OrdersEngine();
