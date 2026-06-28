/* ── FreshCart main.js ────────────────────────────────────────────── */
$(function () {

  /* ── Toast Notifications ──────────────────────────────────────── */
  function showToast(msg, type = 'success') {
    const toast = $('<div class="fc-toast-item ' + type + '">' + msg + '</div>');
    $('#fc-toast').append(toast);
    setTimeout(() => toast.fadeOut(400, () => toast.remove()), 3000);
  }

  /* ── Update Cart Badge (navbar) ───────────────────────────────── */
  function updateCartBadge(count) {
    const badge = $('#cart-count');
    if (count > 0) {
      badge.text(count).show();
    } else {
      badge.hide();
    }
  }

  /* ── Floating Cart Button ─────────────────────────────────────── */
  function updateFloatingCart(count) {
    if (count > 0) {
      $('#floating-cart').show();
      $('#floating-count').text(count);
    } else {
      $('#floating-cart').hide();
    }
  }

  /* ── Product Listing: AJAX search + category filter ──────────── */
  let searchTimer;

  function loadProducts() {
    const search   = $('#search-input').val().trim();
    const category = $('.fc-category-pill.active').data('category') || 'All';

    const params = {};
    if (search)             params.search   = search;
    if (category !== 'All') params.category = category;

    $('#products-grid').html('<div class="text-center py-5"><div class="spinner-border text-success"></div></div>');

    $.getJSON('/products/api/products', params, function (products) {
      renderProducts(products);
    }).fail(function () {
      $('#products-grid').html('<p class="text-danger">Failed to load products.</p>');
    });
  }

  function renderProducts(products) {
    if (!products.length) {
      $('#products-grid').html(
        '<div class="fc-empty col-12"><div class="fc-empty-icon">🛒</div>' +
        '<p>No products found.</p></div>'
      );
      return;
    }

    const html = products.map(p => {
      const stockLabel = p.stock === 0
        ? '<span class="fc-stock-low">Out of stock</span>'
        : p.stock <= 5
        ? '<span class="fc-stock-low">⚠️ Only ' + p.stock + ' left!</span>'
        : '<span class="text-muted" style="font-size:.8rem">In stock</span>';

      const addBtn = p.stock === 0
        ? '<button class="btn btn-sm btn-secondary w-100" disabled>Out of Stock</button>'
        : `<div class="d-flex align-items-center gap-2 mt-2">
            <div class="qty-control">
              <button class="qty-card-minus" data-id="${p._id}">−</button>
              <input type="number" class="qty-card-input" id="qty-${p._id}" value="1" min="1" max="${p.stock}">
              <button class="qty-card-plus" data-id="${p._id}" data-max="${p.stock}">+</button>
            </div>
            <button class="btn btn-fc-primary btn-sm flex-grow-1 add-to-cart" data-id="${p._id}">
              🛒 Add
            </button>
          </div>`;

      return `
        <div class="col-12 col-sm-6 col-lg-4 mb-4">
          <div class="fc-card card h-100">
            <a href="/products/${p._id}">
              <img src="${p.image}" class="card-img-top" alt="${p.name}"
                   onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop'">
            </a>
            <div class="card-body d-flex flex-column">
              <span class="badge-category mb-1">${p.category}</span>
              <h5 class="card-title">${p.name}</h5>
              <p class="text-muted small mb-2" style="flex:1">${p.description.substring(0, 65)}…</p>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fc-price">₹${p.price.toFixed(2)}</span>
                ${stockLabel}
              </div>
              ${addBtn}
            </div>
          </div>
        </div>`;
    }).join('');

    $('#products-grid').html(html);
  }

  // Search input — debounced
  $('#search-input').on('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 350);
  });

  // Category pill click
  $(document).on('click', '.fc-category-pill', function () {
    $('.fc-category-pill').removeClass('active');
    $(this).addClass('active');
    loadProducts();
  });

  // Initial load (if on products page)
  if ($('#products-grid').length) loadProducts();

  /* ── qty +/- buttons on product cards ────────────────────────── */
  $(document).on('click', '.qty-card-plus', function () {
    const id  = $(this).data('id');
    const max = $(this).data('max');
    const input = $('#qty-' + id);
    const val = parseInt(input.val());
    if (val < max) input.val(val + 1);
  });

  $(document).on('click', '.qty-card-minus', function () {
    const id  = $(this).data('id');
    const input = $('#qty-' + id);
    const val = parseInt(input.val());
    if (val > 1) input.val(val - 1);
  });

  /* ── Add to Cart (AJAX) ───────────────────────────────────────── */
  $(document).on('click', '.add-to-cart', function () {
    const btn       = $(this);
    const productId = btn.data('id');
    const qty       = $('#qty-' + productId).val() || $('#qty-select').val() || 1;

    btn.prop('disabled', true).text('Adding…');

    $.post('/cart/add', { productId, quantity: qty }, function (res) {
      if (res.success) {
        updateCartBadge(res.cartCount);
        updateFloatingCart(res.cartCount);
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    }).fail(function () {
      showToast('Please login to add items to cart.', 'error');
    }).always(function () {
      btn.prop('disabled', false).text('🛒 Add');
    });
  });

  /* ── Cart Page: qty +/- buttons ──────────────────────────────── */
  $(document).on('click', '.qty-plus, .qty-minus', function () {
    const row       = $(this).closest('tr');
    const productId = row.data('product-id');
    const input     = row.find('.qty-input');
    let qty         = parseInt(input.val());

    if ($(this).hasClass('qty-plus')) qty += 1;
    else if (qty > 1)                 qty -= 1;
    else { removeCartItem(productId, row); return; }

    input.val(qty);
    updateCartItem(productId, qty, row);
  });

  $(document).on('change', '.qty-input', function () {
    const row = $(this).closest('tr');
    const pid = row.data('product-id');
    const qty = parseInt($(this).val());
    if (qty < 1) { removeCartItem(pid, row); return; }
    updateCartItem(pid, qty, row);
  });

  function updateCartItem(productId, quantity, row) {
    $.post('/cart/update', { productId, quantity }, function (res) {
      if (res.success) {
        const itemTotal = res.cart.find(i => i.productId === productId);
        if (itemTotal) row.find('.item-total').text('₹' + (itemTotal.price * itemTotal.quantity).toFixed(2));
        $('#cart-total').text('₹' + res.total.toFixed(2));
        updateCartBadge(res.cartCount);
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  $(document).on('click', '.remove-item', function () {
    const row = $(this).closest('tr');
    const pid = row.data('product-id');
    removeCartItem(pid, row);
  });

  function removeCartItem(productId, row) {
    $.post('/cart/remove', { productId }, function (res) {
      if (res.success) {
        row.fadeOut(300, () => row.remove());
        $('#cart-total').text('₹' + res.total.toFixed(2));
        updateCartBadge(res.cartCount);
        updateFloatingCart(res.cartCount);
        if (res.cart.length === 0) {
          $('#cart-table-wrap').html('<div class="fc-empty"><div class="fc-empty-icon">🛒</div><p>Your cart is empty.</p><a href="/products" class="btn btn-fc-primary mt-2">Shop Now</a></div>');
        }
      }
    });
  }

  /* ── Checkout: AJAX place order ──────────────────────────────── */
  $('#checkout-form').on('submit', function (e) {
    e.preventDefault();
    if (!$(this).valid()) return;

    const data = {
      street:        $('#street').val(),
      city:          $('#city').val(),
      pincode:       $('#pincode').val(),
      phone:         $('#phone').val(),
      paymentMethod: $('input[name="paymentMethod"]:checked').val(),
    };

    $('#place-order-btn').prop('disabled', true).text('Placing Order…');

    $.post('/orders/place', data, function (res) {
      if (res.success) {
        showToast('🎉 ' + res.message, 'success');
        setTimeout(() => window.location.href = '/orders', 1500);
      } else {
        showToast(res.message, 'error');
        $('#place-order-btn').prop('disabled', false).text('Place Order');
      }
    }).fail(function () {
      showToast('Failed to place order. Try again.', 'error');
      $('#place-order-btn').prop('disabled', false).text('Place Order');
    });
  });

});