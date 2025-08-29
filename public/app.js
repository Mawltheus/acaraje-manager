// Global variables
let currentSection = 'dashboard';
let orders = [];
let menuItems = [];
let ingredients = [];
let deliveryAreas = [];
let dashboardStats = {};

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadDashboardData();
        await loadOrders();
        await loadMenuItems();
        await loadIngredients();
        await loadDeliveryAreas();
        
        // Set default section
        showSection('dashboard');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showAlert('Erro ao carregar dados iniciais', 'danger');
    }
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to nav link
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            refreshDashboard();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'menu':
            renderMenuItems();
            break;
        case 'ingredients':
            renderIngredients();
            break;
        case 'delivery':
            renderDeliveryAreas();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        dashboardStats = await response.json();
        renderDashboard();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function renderDashboard() {
    // Update stats cards
    document.getElementById('todayOrders').textContent = dashboardStats.todayStats?.orders || 0;
    document.getElementById('todayRevenue').textContent = formatCurrency(dashboardStats.todayStats?.revenue || 0);
    document.getElementById('pendingOrders').textContent = dashboardStats.generalStats?.pendingOrders || 0;
    document.getElementById('preparingOrders').textContent = dashboardStats.generalStats?.preparingOrders || 0;
    
    // Render recent orders
    renderRecentOrders();
    
    // Render top items
    renderTopItems();
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    tbody.innerHTML = '';
    
    if (!dashboardStats.recentOrders || dashboardStats.recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum pedido hoje</td></tr>';
        return;
    }
    
    dashboardStats.recentOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.customerInfo.name}</td>
            <td>${formatCurrency(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${order._id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderTopItems() {
    const container = document.getElementById('topItemsList');
    container.innerHTML = '';
    
    if (!dashboardStats.topItems || dashboardStats.topItems.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Nenhum dado disponível</p>';
        return;
    }
    
    dashboardStats.topItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'top-item';
        itemDiv.innerHTML = `
            <span class="top-item-name">${item.name}</span>
            <span class="top-item-quantity">${item.quantity}</span>
        `;
        container.appendChild(itemDiv);
    });
}

async function refreshDashboard() {
    await loadDashboardData();
}

// Orders Functions
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const data = await response.json();
        orders = data.orders || [];
        renderOrders();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

function renderOrders() {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum pedido encontrado</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.customerInfo.name}</td>
            <td>${order.customerInfo.phone}</td>
            <td>${order.items.length} item(s)</td>
            <td>${formatCurrency(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewOrderDetails('${order._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="updateOrderStatus('${order._id}', 'confirmed')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="updateOrderStatus('${order._id}', 'cancelled')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showAlert('Status do pedido atualizado com sucesso!', 'success');
            await loadOrders();
            await loadDashboardData();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showAlert('Erro ao atualizar status do pedido', 'danger');
    }
}

async function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let url = `${API_BASE}/orders?`;
    if (statusFilter) url += `status=${statusFilter}&`;
    if (dateFilter) url += `date=${dateFilter}&`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        orders = data.orders || [];
        renderOrders();
    } catch (error) {
        console.error('Erro ao filtrar pedidos:', error);
    }
}

// Menu Functions
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        menuItems = await response.json();
        renderMenuItems();
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
    }
}

function renderMenuItems() {
    const container = document.getElementById('menuItems');
    container.innerHTML = '';
    
    if (menuItems.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Nenhum item no cardápio</p></div>';
        return;
    }
    
    menuItems.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
            <div class="menu-item-card">
                <div class="menu-item-image">
                    <i class="fas fa-utensils"></i>
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-title">${item.name}</div>
                    <div class="menu-item-price">${formatCurrency(item.price)}</div>
                    <div class="menu-item-category">${getCategoryText(item.category)}</div>
                    <p class="text-muted">${item.description}</p>
                    <div class="availability-toggle">
                        <span>Disponível:</span>
                        <div class="toggle-switch ${item.available ? 'active' : ''}" 
                             onclick="toggleMenuItemAvailability('${item._id}', ${!item.available})">
                        </div>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="editMenuItem('${item._id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMenuItem('${item._id}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

async function toggleMenuItemAvailability(itemId, available) {
    try {
        const response = await fetch(`${API_BASE}/menu/${itemId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ available })
        });
        
        if (response.ok) {
            showAlert('Disponibilidade atualizada!', 'success');
            await loadMenuItems();
        } else {
            throw new Error('Erro ao atualizar disponibilidade');
        }
    } catch (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        showAlert('Erro ao atualizar disponibilidade', 'danger');
    }
}

// Ingredients Functions
async function loadIngredients() {
    try {
        const response = await fetch(`${API_BASE}/ingredients`);
        ingredients = await response.json();
        renderIngredients();
    } catch (error) {
        console.error('Erro ao carregar ingredientes:', error);
    }
}

function renderIngredients() {
    const tbody = document.getElementById('ingredientsTable');
    tbody.innerHTML = '';
    
    if (ingredients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum ingrediente cadastrado</td></tr>';
        return;
    }
    
    ingredients.forEach(ingredient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ingredient.name}</td>
            <td>${getCategoryText(ingredient.category)}</td>
            <td>
                <span class="badge ${ingredient.available ? 'bg-success' : 'bg-danger'}">
                    ${ingredient.available ? 'Disponível' : 'Indisponível'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editIngredient('${ingredient._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-${ingredient.available ? 'warning' : 'success'}" 
                            onclick="toggleIngredientAvailability('${ingredient._id}', ${!ingredient.available})">
                        <i class="fas fa-${ingredient.available ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteIngredient('${ingredient._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleIngredientAvailability(ingredientId, available) {
    try {
        const response = await fetch(`${API_BASE}/ingredients/${ingredientId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ available })
        });
        
        if (response.ok) {
            showAlert('Disponibilidade do ingrediente atualizada!', 'success');
            await loadIngredients();
        } else {
            throw new Error('Erro ao atualizar disponibilidade');
        }
    } catch (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        showAlert('Erro ao atualizar disponibilidade', 'danger');
    }
}

// Delivery Areas Functions
async function loadDeliveryAreas() {
    try {
        const response = await fetch(`${API_BASE}/delivery-areas`);
        deliveryAreas = await response.json();
        renderDeliveryAreas();
    } catch (error) {
        console.error('Erro ao carregar áreas de entrega:', error);
    }
}

function renderDeliveryAreas() {
    const tbody = document.getElementById('deliveryAreasTable');
    tbody.innerHTML = '';
    
    if (deliveryAreas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma área de entrega cadastrada</td></tr>';
        return;
    }
    
    deliveryAreas.forEach(area => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${area.name}</td>
            <td>${formatCurrency(area.fee)}</td>
            <td>${area.estimatedTime} min</td>
            <td>
                <span class="badge ${area.active ? 'bg-success' : 'bg-danger'}">
                    ${area.active ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editDeliveryArea('${area._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-${area.active ? 'warning' : 'success'}" 
                            onclick="toggleDeliveryAreaStatus('${area._id}', ${!area.active})">
                        <i class="fas fa-${area.active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteDeliveryArea('${area._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleDeliveryAreaStatus(areaId, active) {
    try {
        const response = await fetch(`${API_BASE}/delivery-areas/${areaId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active })
        });
        
        if (response.ok) {
            showAlert('Status da área de entrega atualizado!', 'success');
            await loadDeliveryAreas();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showAlert('Erro ao atualizar status', 'danger');
    }
}

// Modal Functions
function showAddMenuItemModal() {
    const modalHtml = `
        <div class="modal fade" id="addMenuItemModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Item ao Cardápio</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addMenuItemForm">
                            <div class="mb-3">
                                <label class="form-label">Nome</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <textarea class="form-control" name="description" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" name="category" required>
                                    <option value="acarajes">Acarajés</option>
                                    <option value="abaras">Abarás</option>
                                    <option value="bebidas">Bebidas</option>
                                    <option value="outros">Outros</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Preço</label>
                                <input type="number" class="form-control" name="price" step="0.01" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveMenuItem()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('addMenuItemModal'));
    modal.show();
}

function showAddIngredientModal() {
    const modalHtml = `
        <div class="modal fade" id="addIngredientModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Ingrediente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addIngredientForm">
                            <div class="mb-3">
                                <label class="form-label">Nome</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" name="category" required>
                                    <option value="proteina">Proteína</option>
                                    <option value="vegetal">Vegetal</option>
                                    <option value="molho">Molho</option>
                                    <option value="tempero">Tempero</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <textarea class="form-control" name="description"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveIngredient()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('addIngredientModal'));
    modal.show();
}

function showAddDeliveryAreaModal() {
    const modalHtml = `
        <div class="modal fade" id="addDeliveryAreaModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Área de Entrega</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addDeliveryAreaForm">
                            <div class="mb-3">
                                <label class="form-label">Nome do Bairro</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Taxa de Entrega</label>
                                <input type="number" class="form-control" name="fee" step="0.01" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Tempo Estimado (minutos)</label>
                                <input type="number" class="form-control" name="estimatedTime" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <textarea class="form-control" name="description"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="saveDeliveryArea()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modals-container').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('addDeliveryAreaModal'));
    modal.show();
}

// Save Functions
async function saveMenuItem() {
    const form = document.getElementById('addMenuItemForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Item adicionado com sucesso!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addMenuItemModal')).hide();
            await loadMenuItems();
        } else {
            throw new Error('Erro ao adicionar item');
        }
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        showAlert('Erro ao adicionar item', 'danger');
    }
}

async function saveIngredient() {
    const form = document.getElementById('addIngredientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Ingrediente adicionado com sucesso!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addIngredientModal')).hide();
            await loadIngredients();
        } else {
            throw new Error('Erro ao adicionar ingrediente');
        }
    } catch (error) {
        console.error('Erro ao salvar ingrediente:', error);
        showAlert('Erro ao adicionar ingrediente', 'danger');
    }
}

async function saveDeliveryArea() {
    const form = document.getElementById('addDeliveryAreaForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/delivery-areas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showAlert('Área de entrega adicionada com sucesso!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addDeliveryAreaModal')).hide();
            await loadDeliveryAreas();
        } else {
            throw new Error('Erro ao adicionar área');
        }
    } catch (error) {
        console.error('Erro ao salvar área:', error);
        showAlert('Erro ao adicionar área de entrega', 'danger');
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'confirmed': 'Confirmado',
        'preparing': 'Preparando',
        'ready': 'Pronto',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
}

function getCategoryText(category) {
    const categoryMap = {
        'acarajes': 'Acarajés',
        'abaras': 'Abarás',
        'bebidas': 'Bebidas',
        'outros': 'Outros',
        'proteina': 'Proteína',
        'vegetal': 'Vegetal',
        'molho': 'Molho',
        'tempero': 'Tempero',
        'outro': 'Outro'
    };
    return categoryMap[category] || category;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Placeholder functions for future implementation
function viewOrderDetails(orderId) {
    showAlert('Funcionalidade em desenvolvimento', 'info');
}

function editMenuItem(itemId) {
    showAlert('Funcionalidade em desenvolvimento', 'info');
}

function deleteMenuItem(itemId) {
    if (confirm('Tem certeza que deseja remover este item?')) {
        showAlert('Funcionalidade em desenvolvimento', 'info');
    }
}

function editIngredient(ingredientId) {
    showAlert('Funcionalidade em desenvolvimento', 'info');
}

function deleteIngredient(ingredientId) {
    if (confirm('Tem certeza que deseja remover este ingrediente?')) {
        showAlert('Funcionalidade em desenvolvimento', 'info');
    }
}

function editDeliveryArea(areaId) {
    showAlert('Funcionalidade em desenvolvimento', 'info');
}

function deleteDeliveryArea(areaId) {
    if (confirm('Tem certeza que deseja remover esta área de entrega?')) {
        showAlert('Funcionalidade em desenvolvimento', 'info');
    }
}

function loadReports() {
    showAlert('Relatórios em desenvolvimento', 'info');
}
