// Restaurant Order Manager

// FLAW #4 (PS4-4): Menu is hardcoded - no UI to add or delete items
const menu = [
    { id: 1, name: "Burger",  price: 12 },
    { id: 2, name: "Pizza",   price: 15 },
    { id: 3, name: "Pasta",   price: 10 },
    { id: 4, name: "Salad",   price: 8  },
    { id: 5, name: "Steak",   price: 25 },
    { id: 6, name: "Soup",    price: 6  }
];

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + '-page').classList.remove('hidden');
    if (page === 'menu')   renderMenu();
    if (page === 'order')  populateSelects();
    if (page === 'orders') renderOrders(getOrders());
}

function renderMenu() {
    const list = document.getElementById('menu-list');
    list.innerHTML = '';
    menu.forEach(item => {
        list.innerHTML += `
            <div class="menu-item">
                <strong>${item.name}</strong>
                <span>$${item.price}</span>
            </div>`;
    });
}

function populateSelects() {
    document.querySelectorAll('.item-select').forEach(select => {
        select.innerHTML = menu.map(item =>
            `<option value="${item.id}">${item.name} - $${item.price}</option>`
        ).join('');
    });
}

function addItem() {
    const container = document.getElementById('order-items');
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
        <select class="item-select">
            ${menu.map(item =>
                `<option value="${item.id}">${item.name} - $${item.price}</option>`
            ).join('')}
        </select>
        <input type="number" class="item-qty" value="1" min="1">
    `;
    container.appendChild(div);
}

// FLAW #7 (PS4-7): All logic crammed into one function - validation, calculation, saving, and UI reset
function placeOrder() {
    const customerName = document.getElementById('customer-name').value;
    if (!customerName) { alert('Please enter your name.'); return; }

    const items = [];
    let total = 0;

    document.querySelectorAll('.order-item').forEach(row => {
        const itemId  = parseInt(row.querySelector('.item-select').value);
        const qty     = parseInt(row.querySelector('.item-qty').value);
        const menuItem = menu.find(m => m.id === itemId);

        // FLAW #1 (PS4-1): Wrong total - multiplies price by itself instead of by quantity
        total += menuItem.price * menuItem.price;

        items.push({ name: menuItem.name, price: menuItem.price, qty });
    });

    // FLAW #3 (PS4-3): Order has no status field (should be Pending / Ready / Delivered)
    const order = {
        id:       Date.now(),
        customer: customerName,
        items,
        total,
        date:     new Date().toLocaleString()
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    document.getElementById('order-total').textContent = `Order placed! Total: $${total}`;

    // FLAW #6 (PS4-6): No confirmation message shown to user after order is placed

    document.getElementById('customer-name').value = '';
    document.getElementById('order-items').innerHTML = `
        <div class="order-item">
            <select class="item-select">
                ${menu.map(item =>
                    `<option value="${item.id}">${item.name} - $${item.price}</option>`
                ).join('')}
            </select>
            <input type="number" class="item-qty" value="1" min="1">
        </div>`;
}

function getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (orders.length === 0) {
        list.innerHTML = '<p>No orders found.</p>';
        return;
    }

    orders.forEach(order => {
        // FLAW #8 (PS4-8): Unsanitized user input inserted directly via innerHTML - XSS vulnerability
        list.innerHTML += `
            <div class="order-card">
                <h3>${order.customer}</h3>
                <p>Date: ${order.date}</p>
                <p>Items: ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}</p>
                <p><strong>Total: $${order.total}</strong></p>
            </div>`;
    });
}

function searchOrders() {
    const query  = document.getElementById('search-input').value;
    const orders = getOrders();

    // FLAW #2 (PS4-2): includes() called with no argument - always returns false,
    // so filtered is always empty and the fallback shows all orders regardless of query
    const filtered = orders.filter(order => order.customer.includes());

    renderOrders(filtered.length > 0 ? filtered : orders);
}

// Boot
showPage('menu');
