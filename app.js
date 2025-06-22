// app.js

// ----- Theme Toggle ----- function toggleTheme() { document.body.classList.toggle('light'); localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); } if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');

// ----- LocalStorage Helpers ----- const getData = (key) => JSON.parse(localStorage.getItem(key) || '[]'); const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ----- Render All ----- function renderAll() { renderSales(); renderExpenses(); renderShopee(); drawChart(); } window.onload = renderAll;

// ----- Save Sale ----- function saveSale() { const sales = getData('sales'); const date = document.getElementById('saleDate').value; const product = document.getElementById('product').value.trim(); const quantity = parseFloat(document.getElementById('quantity').value); const price = parseFloat(document.getElementById('price').value); if (!date || !product || isNaN(quantity) || isNaN(price)) return alert('Fill all fields'); sales.push({ id: Date.now(), date, product, quantity, price }); setData('sales', sales); document.getElementById('saleDate').value = ""; document.getElementById('product').value = ""; document.getElementById('quantity').value = ""; document.getElementById('price').value = ""; renderSales(); }

function renderSales() { const sales = getData('sales'); const search = document.getElementById('searchProduct').value.toLowerCase(); const list = document.getElementById('salesList'); list.innerHTML = ""; sales.filter(s => s.product.toLowerCase().includes(search)).forEach(sale => { const item = document.createElement('div'); const total = (sale.quantity * sale.price).toFixed(2); item.innerHTML = <div> <b>${sale.date}</b> - ${sale.product} - Qty: ${sale.quantity}, Price: ₱${sale.price}, Total: ₱${total} <button onclick="editSale(${sale.id})">Edit</button> <button onclick="deleteSale(${sale.id})">Delete</button> </div>; list.appendChild(item); }); }

function deleteSale(id) { const sales = getData('sales').filter(s => s.id !== id); setData('sales', sales); renderSales(); drawChart(); }

function editSale(id) { const sales = getData('sales'); const sale = sales.find(s => s.id === id); if (!sale) return; const newProduct = prompt("Edit product", sale.product); const newQuantity = prompt("Edit quantity", sale.quantity); const newPrice = prompt("Edit price", sale.price); if (newProduct && !isNaN(parseFloat(newQuantity)) && !isNaN(parseFloat(newPrice))) { sale.product = newProduct; sale.quantity = parseFloat(newQuantity); sale.price = parseFloat(newPrice); setData('sales', sales); renderSales(); drawChart(); } }

// ----- Expenses ----- function saveExpense() { const expenses = getData('expenses'); const date = document.getElementById('expenseDate').value; const type = document.getElementById('expenseType').value.trim(); const amount = parseFloat(document.getElementById('expenseAmount').value); if (!date || !type || isNaN(amount)) return alert('Fill all fields'); expenses.push({ id: Date.now(), date, type, amount }); setData('expenses', expenses); document.getElementById('expenseDate').value = ""; document.getElementById('expenseType').value = ""; document.getElementById('expenseAmount').value = ""; renderExpenses(); }

function renderExpenses() { const expenses = getData('expenses'); const list = document.getElementById('expensesList'); list.innerHTML = ""; expenses.forEach(exp => { const item = document.createElement('div'); item.innerHTML = <div> <b>${exp.date}</b> - ${exp.type} - ₱${exp.amount} <button onclick="editExpense(${exp.id})">Edit</button> <button onclick="deleteExpense(${exp.id})">Delete</button> </div>; list.appendChild(item); }); }

function deleteExpense(id) { const expenses = getData('expenses').filter(e => e.id !== id); setData('expenses', expenses); renderExpenses(); drawChart(); }

function editExpense(id) { const expenses = getData('expenses'); const exp = expenses.find(e => e.id === id); if (!exp) return; const newType = prompt("Edit type", exp.type); const newAmount = prompt("Edit amount", exp.amount); if (newType && !isNaN(parseFloat(newAmount))) { exp.type = newType; exp.amount = parseFloat(newAmount); setData('expenses', expenses); renderExpenses(); drawChart(); } }

// ----- Shopee Tracker ----- function saveShopee() { const tracker = getData('shopee'); const trackingNumber = document.getElementById('trackingNumber').value.trim(); const released = document.getElementById('paymentReleased').checked; if (!trackingNumber) return alert('Enter tracking number'); tracker.push({ id: Date.now(), trackingNumber, released }); setData('shopee', tracker); document.getElementById('trackingNumber').value = ""; document.getElementById('paymentReleased').checked = false; renderShopee(); }

function renderShopee() { const tracker = getData('shopee'); const list = document.getElementById('shopeeList'); list.innerHTML = ""; tracker.forEach(t => { const item = document.createElement('div'); item.innerHTML = <div> ${t.trackingNumber} - Released: <input type="checkbox" ${t.released ? 'checked' : ''} onchange="toggleShopee(${t.id}, this.checked)"> <button onclick="deleteShopee(${t.id})">Delete</button> </div>; list.appendChild(item); }); }

function toggleShopee(id, value) { const tracker = getData('shopee'); const item = tracker.find(t => t.id === id); if (item) item.released = value; setData('shopee', tracker); }

function deleteShopee(id) { const tracker = getData('shopee').filter(t => t.id !== id); setData('shopee', tracker); renderShopee(); }

// ----- Chart ----- function drawChart() { const sales = getData('sales'); const expenses = getData('expenses'); const daily = {};

sales.forEach(s => { const total = s.quantity * s.price; daily[s.date] = (daily[s.date] || { sales: 0, expenses: 0 }); daily[s.date].sales += total; });

expenses.forEach(e => { daily[e.date] = (daily[e.date] || { sales: 0, expenses: 0 }); daily[e.date].expenses += e.amount; });

const labels = Object.keys(daily).sort(); const salesData = labels.map(d => daily[d].sales); const expenseData = labels.map(d => daily[d].expenses);

const totalSales = salesData.reduce((a, b) => a + b, 0); const totalExpenses = expenseData.reduce((a, b) => a + b, 0);

const ctx = document.getElementById('logbookChart').getContext('2d'); if (window.myChart) window.myChart.destroy(); window.myChart = new Chart(ctx, { type: 'bar', data: { labels, datasets: [ { label: 'Sales', data: salesData, backgroundColor: 'rgba(0, 176, 255, 0.6)' }, { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(255, 99, 132, 0.6)' } ] } });

document.getElementById('totals').innerHTML = <p><b>Total Sales:</b> ₱${totalSales.toFixed(2)}</p> <p><b>Total Expenses:</b> ₱${totalExpenses.toFixed(2)}</p> <p><b>Net:</b> ₱${(totalSales - totalExpenses).toFixed(2)}</p>; }

// ----- Export Data ----- function exportData() { const data = { sales: getData('sales'), expenses: getData('expenses'), shopee: getData('shopee') }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'jaysky-logbook-backup.json'; a.click(); URL.revokeObjectURL(url); }

