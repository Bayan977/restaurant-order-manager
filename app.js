// Restaurant Order Manager

const defaultMenu = [
    { id: 1, name: "Burger",  price: 12 },
    { id: 2, name: "Pizza",   price: 15 },
    { id: 3, name: "Pasta",   price: 10 },
    { id: 4, name: "Salad",   price: 8  },
    { id: 5, name: "Steak",   price: 25 },
    { id: 6, name: "Soup",    price: 6  }
];

function getMenu() {
    const stored = localStorage.getItem('menu');
    return stored ? JSON.parse(stored) : defaultMenu;
}

function saveMenu(menu) {
    localStorage.setItem('menu', JSON.stringify(menu));
}

function addMenuItem() {
    const name  = document.getElementById('new-item-name').value.trim();
    const price = parseFloat(document.getElementById('new-item-price').value);
    if (!name || isNaN(price) || price <= 0) { alert('Enter a valid name and price.'); return; }
    const menu = getMenu();
    menu.push({ id: Date.now(), name, price });
    saveMenu(menu);
    document.getElementById('new-item-name').value  = '';
    document.getElementById('new-item-price').value = '';
    renderManage();
}

function deleteMenuItem(id) {
    saveMenu(getMenu().filter(item => item.id !== id));
    renderManage();
}

function renderManage() {
    const list = document.getElementById('manage-list');
    list.innerHTML = '';
    getMenu().forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `<span><strong>${item.name}</strong> — $${item.price}</span>`;
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.textContent = 'Delete';
        btn.onclick = () => deleteMenuItem(item.id);
        div.appendChild(btn);
        list.appendChild(div);
    });
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(page + '-page').classList.remove('hidden');
    if (page === 'menu')   renderMenu();
    if (page === 'order')  populateSelects();
    if (page === 'orders') renderOrders(getOrders());
    if (page === 'manage') renderManage();
}

function renderMenu() {
    const list = document.getElementById('menu-list');
    list.innerHTML = '';
    getMenu().forEach(item => {
        list.innerHTML += `
            <div class="menu-item">
                <strong>${item.name}</strong>
                <span>$${item.price}</span>
            </div>`;
    });
}

function populateSelects() {
    document.querySelectorAll('.item-select').forEach(select => {
        select.innerHTML = getMenu().map(item =>
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
            ${getMenu().map(item =>
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
        const menuItem = getMenu().find(m => m.id === itemId);

        total += menuItem.price * qty;

        items.push({ name: menuItem.name, price: menuItem.price, qty });
    });

    const order = {
        id:       Date.now(),
        customer: customerName,
        items,
        total,
        status:   'Pending',
        date:     new Date().toLocaleString()
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    const totalEl = document.getElementById('order-total');
    totalEl.innerHTML = `
        <div class="confirmation">
            ✅ Order placed successfully!<br>
            <strong>Customer:</strong> ${customerName}<br>
            <strong>Items:</strong> ${items.map(i => `${i.name} x${i.qty}`).join(', ')}<br>
            <strong>Total: $${total.toFixed(2)}</strong>
        </div>`;

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
    populateSelects();
}

function updateStatus(orderId, newStatus) {
    const orders = getOrders().map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
    );
    localStorage.setItem('orders', JSON.stringify(orders));
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
                <p>Status: <select onchange="updateStatus(${order.id}, this.value)">
                    <option ${order.status === 'Pending'   ? 'selected' : ''}>Pending</option>
                    <option ${order.status === 'Ready'     ? 'selected' : ''}>Ready</option>
                    <option ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select></p>
            </div>`;
    });
}

function searchOrders() {
    const query  = document.getElementById('search-input').value;
    const orders = getOrders();

    const filtered = orders.filter(order =>
        order.customer.toLowerCase().includes(query.toLowerCase())
    );

    renderOrders(filtered);
}

// Boot
showPage('menu');
