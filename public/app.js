// Global variables
let currentSection = 'dashboard';
let orders = [];
let menuItems = [];
let ingredients = [];
let deliveryAreas = [];
let dashboardStats = {};

// API Base URL - Pode ser configurada via variável de ambiente ou usar o valor padrão
let apiBase = window.API_BASE_URL || 'http://localhost:3000';

// Garantir que a URL da API termine com /api
if (!apiBase.endsWith('/api')) {
    apiBase = apiBase.endsWith('/') ? 
        `${apiBase}api` : 
        `${apiBase}/api`;
}

// Se estivermos em produção e a URL não for HTTPS, forçar HTTPS
if (window.location.protocol === 'https:' && apiBase.startsWith('http:')) {
    apiBase = apiBase.replace('http:', 'https:');
}

const API_BASE = apiBase;

/**
 * Escapa caracteres especiais para prevenir XSS
 * @param {string} unsafe - String não segura para ser exibida no HTML
 * @returns {string} String segura para exibição no HTML
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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
    console.log('Carregando dados do dashboard...');
    
    // Inicializar dashboardStats com valores padrão
    dashboardStats = {
        todayStats: { orders: 0, revenue: 0 },
        generalStats: { pendingOrders: 0, preparingOrders: 0 },
        recentOrders: [],
        topItems: []
    };
    
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar dados do dashboard');
        }
        
        const data = await response.json();
        dashboardStats = {
            ...dashboardStats,
            ...data
        };
        
        console.log('Dados do dashboard carregados com sucesso');
        renderDashboard();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showAlert(`Erro ao carregar dashboard: ${error.message}`, 'danger');
        
        // Renderizar dashboard mesmo em caso de erro, com os valores padrão
        renderDashboard();
        
        // Mostrar mensagem de erro adicional
        const dashboardContainer = document.getElementById('dashboardContent');
        if (dashboardContainer) {
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-warning';
            errorAlert.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                Não foi possível carregar todos os dados do dashboard. 
                <button class="btn btn-sm btn-outline-warning ms-2" onclick="loadDashboardData()">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            `;
            dashboardContainer.prepend(errorAlert);
        }
    }
}

function renderDashboard() {
    try {
        console.log('Renderizando dashboard com os seguintes dados:', dashboardStats);
        
        // Atualizar cartões de estatísticas
        const todayOrdersElement = document.getElementById('todayOrders');
        const todayRevenueElement = document.getElementById('todayRevenue');
        const pendingOrdersElement = document.getElementById('pendingOrders');
        const preparingOrdersElement = document.getElementById('preparingOrders');
        
        if (todayOrdersElement) todayOrdersElement.textContent = dashboardStats.todayStats?.orders || 0;
        if (todayRevenueElement) todayRevenueElement.textContent = formatCurrency(dashboardStats.todayStats?.revenue || 0);
        if (pendingOrdersElement) pendingOrdersElement.textContent = dashboardStats.generalStats?.pendingOrders || 0;
        if (preparingOrdersElement) preparingOrdersElement.textContent = dashboardStats.generalStats?.preparingOrders || 0;
        
        // Atualizar link do site
        const websiteUrl = dashboardStats.websiteUrl || 'https://acarajeeabaradolouro.netlify.app/';
        const websiteLink = document.getElementById('websiteUrl');
        if (websiteLink) {
            websiteLink.href = websiteUrl;
            websiteLink.title = `Acessar ${websiteUrl}`;
            websiteLink.innerHTML = `
                <i class="fas fa-external-link-alt me-1"></i>
                Acessar Site
            `;
        }
        
        // Atualizar data/hora da última atualização
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = `Atualizado em ${now.toLocaleTimeString()}`;
            lastUpdatedElement.title = `Última atualização: ${now.toLocaleString()}`;
        }
        
        // Renderizar pedidos recentes e itens mais vendidos
        renderRecentOrders();
        renderTopItems();
        
    } catch (error) {
        console.error('Erro ao renderizar dashboard:', error);
        
        // Mostrar mensagem de erro no container do dashboard
        const dashboardContent = document.getElementById('dashboardContent');
        if (dashboardContent) {
            dashboardContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Ocorreu um erro ao renderizar o dashboard. 
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="renderDashboard()">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '';
        
        if (!dashboardStats.recentOrders || dashboardStats.recentOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-inbox me-2"></i>
                        Nenhum pedido recente encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        // Ordenar pedidos por data (mais recentes primeiro)
        const sortedOrders = [...dashboardStats.recentOrders].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        // Limitar a exibição aos 5 pedidos mais recentes
        const recentOrders = sortedOrders.slice(0, 5);
        
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Formatar a data para exibição
            const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
            const formattedDate = orderDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determinar a classe de status para estilização
            const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;
            
            // Garantir que o ID do pedido seja seguro para uso no HTML
            const orderId = (order._id || '').replace(/'/g, "\\'");
            
            // Garantir que os dados sejam seguros para exibição
            const orderNumber = (order.orderNumber || 'N/A').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const customerName = (order.customerInfo?.name || 'Cliente não identificado')
                .toString()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            row.innerHTML = `
                <td>#${orderNumber}</td>
                <td>${customerName}</td>
                <td>${formatCurrency(order.total || 0)}</td>
                <td>${formattedDate}</td>
                <td>
                    <span class="badge ${statusClass}">
                        ${getStatusText(order.status) || 'Pendente'}
                    </span>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="viewOrderDetails('${orderId}')"
                            title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao renderizar pedidos recentes:', error);
        
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Erro ao carregar pedidos recentes
                        <button class="btn btn-sm btn-outline-danger ms-2" 
                                onclick="renderRecentOrders()">
                            <i class="fas fa-sync-alt"></i> Tentar novamente
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

function renderTopItems() {
    const container = document.getElementById('topItemsList');
    if (!container) return;
    
    try {
        container.innerHTML = '';
        
        if (!dashboardStats.topItems || dashboardStats.topItems.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-chart-pie me-2"></i>
                    Nenhum dado de itens mais vendidos disponível
                </div>
            `;
            return;
        }
        
        // Criar um elemento de lista para os itens mais vendidos
        const list = document.createElement('div');
        list.className = 'list-group list-group-flush';
        
        // Limitar a exibição aos 5 itens mais vendidos
        const topItems = dashboardStats.topItems.slice(0, 5);
        
        topItems.forEach((item, index) => {
            // Criar elemento de item da lista
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            // Adicionar classe de destaque para o primeiro item
            if (index === 0) {
                listItem.classList.add('bg-light', 'fw-bold');
            }
            
            // Formatar o nome do item (garantir que seja seguro para HTML)
            const itemName = (item.name || 'Item sem nome')
                .toString()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
                
            // Formatar a quantidade
            const quantity = parseInt(item.quantity || 0);
            
            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <span class="badge bg-primary me-2">${index + 1}</span>
                    <span class="text-truncate" title="${itemName}">${itemName}</span>
                </div>
                <span class="badge bg-secondary rounded-pill">${quantity} vendido${quantity !== 1 ? 's' : ''}</span>
            `;
            
            list.appendChild(listItem);
        });
        
        container.appendChild(list);
        
    } catch (error) {
        console.error('Erro ao renderizar itens mais vendidos:', error);
        
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Ocorreu um erro ao carregar os itens mais vendidos.
                <button class="btn btn-sm btn-outline-warning ms-2" 
                        onclick="renderTopItems()">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
    }
}

async function refreshDashboard() {
    // Mostrar indicador de carregamento
    const refreshButton = document.getElementById('refreshDashboardBtn');
    const originalHtml = refreshButton?.innerHTML;
    
    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Atualizando...
        `;
    }
    
    try {
        await loadDashboardData();
        showAlert('Dashboard atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
        showAlert(`Erro ao atualizar dashboard: ${error.message}`, 'danger');
    } finally {
        // Restaurar o botão ao estado original
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.innerHTML = originalHtml || '<i class="fas fa-sync-alt"></i> Atualizar';
        }
    }
}

// Orders Functions
async function loadOrders() {
    console.log('Carregando pedidos...');
    
    try {
        const response = await fetch(`${API_BASE}/orders`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar pedidos');
        }
        
        const data = await response.json();
        orders = data.orders || [];
        console.log(`Pedidos carregados: ${orders.length} pedidos`);
        
        renderOrders();
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        showAlert(`Erro ao carregar pedidos: ${error.message}`, 'danger');
        
        // Renderizar mensagem de erro na interface
        const container = document.getElementById('ordersTable');
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Erro ao carregar pedidos. Por favor, tente novamente.
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadOrders()">
                                <i class="fas fa-sync-alt"></i> Tentar novamente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
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
    if (!orderId || !status) {
        showAlert('ID do pedido e status são obrigatórios', 'warning');
        return;
    }
    
    // Encontrar o botão que foi clicado para mostrar o estado de carregamento
    const actionButton = document.querySelector(`button[onclick*="updateOrderStatus('${orderId}'"][data-status="${status}"]`);
    const originalButtonHtml = actionButton?.innerHTML;
    
    try {
        // Mostrar indicador de carregamento no botão
        if (actionButton) {
            actionButton.disabled = true;
            actionButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Atualizando...</span>
            `;
        }
        
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (response.ok) {
            showAlert('Status do pedido atualizado com sucesso!', 'success');
            
            // Atualizar a interface do usuário
            await Promise.all([
                loadOrders(),
                loadDashboardData()
            ]);
            
            // Se estivermos visualizando os detalhes do pedido, recarregá-los
            const orderDetailsModal = document.getElementById('orderDetailsModal');
            if (orderDetailsModal && orderDetailsModal.classList.contains('show')) {
                const orderIdFromModal = orderDetailsModal.querySelector('.modal-title')?.textContent?.match(/#(\w+)/)?.[1];
                if (orderIdFromModal === orderId) {
                    await viewOrderDetails(orderId);
                }
            }
        } else {
            const errorMessage = data.message || 'Erro ao atualizar o status do pedido';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        
        // Mostrar mensagem de erro detalhada
        const errorMessage = error.message || 'Erro ao atualizar o status do pedido. Por favor, tente novamente.';
        showAlert(errorMessage, 'danger');
        
        // Forçar recarregamento dos pedidos para garantir que a interface esteja consistente
        try {
            await loadOrders();
            await loadDashboardData();
        } catch (e) {
            console.error('Erro ao recarregar os dados:', e);
        }
    } finally {
        // Restaurar o estado original do botão
        if (actionButton) {
            actionButton.disabled = false;
            actionButton.innerHTML = originalButtonHtml || 'Atualizar';
        }
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
    console.log('Carregando itens do menu...');
    
    const container = document.getElementById('menuItems');
    if (!container) return;
    
    // Mostrar indicador de carregamento
    const loadingHtml = `
        <div class="col-12 text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando itens do menu...</p>
        </div>
    `;
    container.innerHTML = loadingHtml;
    
    try {
        const response = await fetch(`${API_BASE}/menu`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar itens do menu');
        }
        
        menuItems = await response.json();
        console.log(`Itens do menu carregados: ${menuItems.length} itens`);
        
        // Renderizar os itens do menu
        renderMenuItems();
        
    } catch (error) {
        console.error('Erro ao carregar cardápio:', error);
        
        // Mostrar mensagem de erro na interface
        const errorHtml = `
            <div class="col-12 text-center my-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Erro ao carregar itens do menu.
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadMenuItems()">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                    <p class="mt-2 mb-0 small">${escapeHtml(error.message || 'Tente novamente mais tarde')}</p>
                </div>
            </div>
        `;
        container.innerHTML = errorHtml;
        
        // Mostrar alerta também
        showAlert(`Erro ao carregar cardápio: ${error.message}`, 'danger');
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
        col.className = 'col-md-4 mb-4';
        
        // Criar elementos manualmente para evitar problemas de escape
        const menuItemCard = document.createElement('div');
        menuItemCard.className = 'menu-item-card h-100';
        
        // Criar a estrutura do card
        menuItemCard.innerHTML = `
            <div class="menu-item-image">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="menu-item-content">
                <div class="menu-item-title">${escapeHtml(item.name || 'Sem nome')}</div>
                <div class="menu-item-price">${formatCurrency(item.price || 0)}</div>
                <div class="menu-item-category">${getCategoryText(item.category)}</div>
                <p class="text-muted">${escapeHtml(item.description || '')}</p>
                <div class="availability-toggle">
                    <span>Disponível:</span>
                    <div class="toggle-switch ${item.available ? 'active' : ''}" 
                         data-item-id="${escapeHtml(String(item.id || ''))}" 
                         data-available="${item.available ? 'true' : 'false'}">
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary edit-item" data-item-id="${escapeHtml(String(item.id || ''))}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-item" data-item-id="${escapeHtml(String(item.id || ''))}">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar o card à coluna
        col.appendChild(menuItemCard);
        
        // Adicionar event listeners após a inserção no DOM
        setTimeout(() => {
            // Toggle de disponibilidade
            const toggleSwitch = col.querySelector('.toggle-switch');
            if (toggleSwitch) {
                toggleSwitch.addEventListener('click', () => {
                    const itemId = toggleSwitch.getAttribute('data-item-id');
                    const currentState = toggleSwitch.getAttribute('data-available') === 'true';
                    toggleMenuItemAvailability(itemId, !currentState);
                });
            }
            
            // Botão de editar
            const editButton = col.querySelector('.edit-item');
            if (editButton) {
                editButton.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.getAttribute('data-item-id');
                    editMenuItem(itemId);
                });
            }
            
            // Botão de remover
            const deleteButton = col.querySelector('.delete-item');
            if (deleteButton) {
                deleteButton.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.getAttribute('data-item-id');
                    if (confirm('Tem certeza que deseja remover este item?')) {
                        deleteMenuItem(itemId);
                    }
                });
            }
        }, 0);
        
        container.appendChild(col);
    });
}

async function toggleMenuItemAvailability(itemId, available) {
    console.log(`Atualizando disponibilidade do item ${itemId} para ${available ? 'disponível' : 'indisponível'}`);
    
    // Encontrar o toggle que foi clicado usando o atributo data-item-id
    const toggleElement = document.querySelector(`.toggle-switch[data-item-id="${itemId}"]`);
    const originalClass = toggleElement?.className || '';
    
    try {
        // Mostrar estado de carregamento
        if (toggleElement) {
            toggleElement.classList.remove('active');
            toggleElement.classList.add('loading');
            toggleElement.style.pointerEvents = 'none';
        }
        
        const response = await fetch(`${API_BASE}/menu/${itemId}/availability`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ available })
        });
        
        const data = await response.json().catch(() => ({}));
        console.log('Resposta da API:', data);
        
        if (response.ok) {
            // Atualizar a interface do usuário
            if (toggleElement) {
                toggleElement.classList.toggle('active', available);
            }
            
            // Mostrar mensagem de sucesso
            showAlert('Disponibilidade atualizada com sucesso!', 'success');
            
            // Recarregar a lista de itens para garantir consistência
            await loadMenuItems();
        } else {
            const errorMessage = data.message || 'Erro ao atualizar disponibilidade';
            console.error('Erro na resposta da API:', errorMessage);
            
            // Reverter o estado do toggle em caso de erro
            if (toggleElement) {
                toggleElement.classList.toggle('active', !available);
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar disponibilidade:', error);
        showAlert(`Erro ao atualizar disponibilidade: ${error.message || 'Tente novamente mais tarde'}`, 'danger');
        
        // Forçar recarregamento dos itens do menu em caso de erro
        try {
            await loadMenuItems();
        } catch (e) {
            console.error('Erro ao recarregar itens do menu:', e);
        }
    } finally {
        // Restaurar o estado do toggle
        if (toggleElement) {
            toggleElement.className = originalClass;
            toggleElement.style.pointerEvents = '';
        }
    }
}

// Ingredients Functions
async function loadIngredients() {
    console.log('Carregando ingredientes...');
    
    try {
        const response = await fetch(`${API_BASE}/ingredients`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar ingredientes');
        }
        
        ingredients = await response.json();
        console.log(`Ingredientes carregados: ${ingredients.length} itens`);
        
        renderIngredients();
    } catch (error) {
        console.error('Erro ao carregar ingredientes:', error);
        showAlert(`Erro ao carregar ingredientes: ${error.message}`, 'danger');
        
        // Renderizar mensagem de erro na interface
        const container = document.getElementById('ingredientsTable');
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Erro ao carregar ingredientes. Por favor, tente novamente.
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadIngredients()">
                                <i class="fas fa-sync-alt"></i> Tentar novamente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
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
                    <button class="btn btn-outline-primary" onclick="editIngredient('${ingredient.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-${ingredient.available ? 'warning' : 'success'}" 
                            onclick="toggleIngredientAvailability('${ingredient.id}', ${!ingredient.available})">
                        <i class="fas fa-${ingredient.available ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteIngredient('${ingredient.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleIngredientAvailability(ingredientId, available) {
    console.log(`Atualizando disponibilidade do ingrediente ${ingredientId} para ${available ? 'disponível' : 'indisponível'}`);
    
    try {
        const response = await fetch(`${API_BASE}/ingredients/${ingredientId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ available })
        });
        
        const data = await response.json().catch(() => ({}));
        console.log('Resposta da API:', data);
        
        if (response.ok) {
            showAlert('Disponibilidade do ingrediente atualizada com sucesso!', 'success');
            await loadIngredients();
        } else {
            const errorMessage = data.message || 'Erro ao atualizar disponibilidade do ingrediente';
            console.error('Erro na resposta da API:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar disponibilidade do ingrediente:', error);
        showAlert(`Erro ao atualizar disponibilidade: ${error.message}`, 'danger');
        
        // Forçar recarregamento dos ingredientes em caso de erro
        try {
            await loadIngredients();
        } catch (e) {
            console.error('Erro ao recarregar ingredientes:', e);
        }
    }
}

// Delivery Areas Functions
async function loadDeliveryAreas() {
    console.log('Carregando áreas de entrega...');
    
    try {
        const response = await fetch(`${API_BASE}/delivery-areas`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar áreas de entrega');
        }
        
        deliveryAreas = await response.json();
        console.log(`Áreas de entrega carregadas: ${deliveryAreas.length} itens`);
        
        renderDeliveryAreas();
    } catch (error) {
        console.error('Erro ao carregar áreas de entrega:', error);
        showAlert(`Erro ao carregar áreas de entrega: ${error.message}`, 'danger');
        
        // Renderizar mensagem de erro na interface
        const container = document.getElementById('deliveryAreasTable');
        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Erro ao carregar áreas de entrega. Por favor, tente novamente.
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadDeliveryAreas()">
                                <i class="fas fa-sync-alt"></i> Tentar novamente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
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
                    <button class="btn btn-outline-primary" onclick="editDeliveryArea('${area.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-${area.active ? 'warning' : 'success'}" 
                            onclick="toggleDeliveryAreaStatus('${area.id}', ${!area.active})">
                        <i class="fas fa-${area.active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteDeliveryArea('${area.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleDeliveryAreaStatus(areaId, active) {
    console.log(`Atualizando status da área de entrega ${areaId} para ${active ? 'ativo' : 'inativo'}`);
    
    try {
        const response = await fetch(`${API_BASE}/delivery-areas/${areaId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active })
        });
        
        const data = await response.json().catch(() => ({}));
        console.log('Resposta da API:', data);
        
        if (response.ok) {
            showAlert('Status da área de entrega atualizado com sucesso!', 'success');
            await loadDeliveryAreas();
        } else {
            const errorMessage = data.message || 'Erro ao atualizar status da área de entrega';
            console.error('Erro na resposta da API:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar status da área de entrega:', error);
        showAlert(`Erro ao atualizar status: ${error.message}`, 'danger');
        
        // Forçar recarregamento das áreas de entrega em caso de erro
        try {
            await loadDeliveryAreas();
        } catch (e) {
            console.error('Erro ao recarregar áreas de entrega:', e);
        }
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
async function saveMenuItem(isEdit = false, itemId = null) {
    const formId = isEdit ? 'editMenuItemForm' : 'addMenuItemForm';
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Formulário não encontrado');
        showAlert('Erro: Formulário não encontrado', 'danger');
        return;
    }
    
    // Desabilitar botões durante o processamento
    const submitButton = form.querySelector('button[type="submit"], button.btn-primary');
    const originalButtonText = submitButton?.innerHTML;
    
    try {
        // Mostrar estado de carregamento
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Salvando...</span>
                ${isEdit ? 'Atualizando...' : 'Salvando...'}
            `;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validar dados
        if (!data.name || data.name.trim() === '') {
            throw new Error('O nome do item é obrigatório');
        }
        
        if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
            throw new Error('Preço inválido');
        }
        
        // Processar dados
        data.price = parseFloat(data.price);
        data.available = data.available === 'on' || data.available === 'true';
        
        console.log('Enviando dados do item:', data);
        
        const url = isEdit && itemId ? `${API_BASE}/menu/${itemId}` : `${API_BASE}/menu`;
        const method = isEdit && itemId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json().catch(() => ({}));
        console.log('Resposta da API:', responseData);
        
        if (response.ok) {
            const successMessage = isEdit ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!';
            showAlert(successMessage, 'success');
            
            // Fechar o modal apropriado
            const modalId = isEdit ? 'editMenuItemModal' : 'addMenuItemModal';
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Recarregar a lista de itens
            await loadMenuItems();
            
            // Limpar o formulário se for uma adição
            if (!isEdit) {
                form.reset();
            }
        } else {
            let errorMessage = responseData.message || 
                (isEdit ? 'Erro ao atualizar item' : 'Erro ao adicionar item');
            
            // Tratar erros de validação do servidor
            if (response.status === 422 && responseData.errors) {
                errorMessage = Object.values(responseData.errors)
                    .map(err => Array.isArray(err) ? err.join(', ') : err)
                    .join('\n');
            }
            
            console.error('Erro na resposta da API:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
        
        // Rolar para o topo do formulário para mostrar a mensagem de erro
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Destacar campos com erro
        if (error.message.includes('nome')) {
            const nameInput = form.querySelector('[name="name"]');
            if (nameInput) {
                nameInput.focus();
                nameInput.classList.add('is-invalid');
            }
        } else if (error.message.includes('preço') || error.message.includes('price')) {
            const priceInput = form.querySelector('[name="price"]');
            if (priceInput) {
                priceInput.focus();
                priceInput.classList.add('is-invalid');
            }
        }
    } finally {
        // Restaurar o estado do botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText || 'Salvar';
        }
    }
}

async function saveIngredient(isEdit = false, ingredientId = null) {
    const formId = isEdit ? 'editIngredientForm' : 'addIngredientForm';
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Formulário não encontrado');
        showAlert('Erro: Formulário não encontrado', 'danger');
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Converter valores necessários
    data.available = data.available === 'on';
    data.stock = parseFloat(data.stock) || 0;
    
    console.log('Enviando dados do ingrediente:', data);
    
    // Desabilitar botão de envio durante o processamento
    const submitButton = form.querySelector('button[type="submit"], button.btn-primary');
    const originalButtonText = submitButton?.innerHTML;
    
    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Salvando...</span>
                ${isEdit ? 'Atualizando...' : 'Salvando...'}
            `;
        }
        
        const url = isEdit && ingredientId ? `${API_BASE}/ingredients/${ingredientId}` : `${API_BASE}/ingredients`;
        const method = isEdit && ingredientId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json().catch(() => ({}));
        console.log('Resposta da API:', responseData);
        
        if (response.ok) {
            const successMessage = isEdit ? 'Ingrediente atualizado com sucesso!' : 'Ingrediente adicionado com sucesso!';
            showAlert(successMessage, 'success');
            
            // Fechar o modal apropriado
            const modalId = isEdit ? 'editIngredientModal' : 'addIngredientModal';
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Recarregar a lista de ingredientes
            await loadIngredients();
            
            // Limpar o formulário se for uma adição
            if (!isEdit) {
                form.reset();
            }
        } else {
            let errorMessage = responseData.message || 
                (isEdit ? 'Erro ao atualizar ingrediente' : 'Erro ao adicionar ingrediente');
            
            // Tratar erros de validação do servidor
            if (response.status === 422 && responseData.errors) {
                errorMessage = Object.values(responseData.errors)
                    .map(err => Array.isArray(err) ? err.join(', ') : err)
                    .join('\n');
            }
            
            console.error('Erro na resposta da API:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao salvar ingrediente:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
        
        // Rolar para o topo do formulário para mostrar a mensagem de erro
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
        // Restaurar o estado do botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText || (isEdit ? 'Atualizar' : 'Salvar');
        }
    }
}

async function saveDeliveryArea(isEdit = false, areaId = null) {
    const formId = isEdit ? 'editDeliveryAreaForm' : 'addDeliveryAreaForm';
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Formulário não encontrado');
        showAlert('Erro: Formulário não encontrado', 'danger');
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Converter valores necessários
    data.fee = parseFloat(data.fee) || 0;
    data.estimatedTime = parseInt(data.estimatedTime) || 30;
    data.active = data.active === 'on';
    
    console.log('Enviando dados da área de entrega:', data);
    
    // Desabilitar botão de envio durante o processamento
    const submitButton = form.querySelector('button[type="submit"], button.btn-primary');
    const originalButtonText = submitButton?.innerHTML;
    
    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="visually-hidden">Salvando...</span>
                ${isEdit ? 'Atualizando...' : 'Salvando...'}
            `;
        }
        
        const url = isEdit && areaId ? `${API_BASE}/delivery-areas/${areaId}` : `${API_BASE}/delivery-areas`;
        const method = isEdit && areaId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json().catch(() => ({}));
        console.log('Resposta da API:', responseData);
        
        if (response.ok) {
            const successMessage = isEdit ? 'Área de entrega atualizada com sucesso!' : 'Área de entrega adicionada com sucesso!';
            showAlert(successMessage, 'success');
            
            // Fechar o modal apropriado
            const modalId = isEdit ? 'editDeliveryAreaModal' : 'addDeliveryAreaModal';
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            
            // Recarregar a lista de áreas de entrega
            await loadDeliveryAreas();
            
            // Limpar o formulário se for uma adição
            if (!isEdit) {
                form.reset();
            }
        } else {
            let errorMessage = responseData.message || 
                (isEdit ? 'Erro ao atualizar área de entrega' : 'Erro ao adicionar área de entrega');
            
            // Tratar erros de validação do servidor
            if (response.status === 422 && responseData.errors) {
                errorMessage = Object.values(responseData.errors)
                    .map(err => Array.isArray(err) ? err.join(', ') : err)
                    .join('\n');
            }
            
            console.error('Erro na resposta da API:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao salvar área de entrega:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
        
        // Rolar para o topo do formulário para mostrar a mensagem de erro
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
        // Restaurar o estado do botão
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText || (isEdit ? 'Atualizar' : 'Salvar');
        }
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

// Exibe os detalhes de um pedido específico
async function viewOrderDetails(orderId) {
    if (!orderId) {
        showAlert('ID do pedido não fornecido', 'warning');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        const modalContent = document.createElement('div');
        modalContent.className = 'text-center py-4';
        modalContent.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando detalhes do pedido...</p>
        `;
        
        // Criar e exibir o modal
        const modal = new bootstrap.Modal(document.createElement('div'));
        const modalElement = `
            <div class="modal fade" tabindex="-1" id="orderDetailsModal">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalhes do Pedido #${orderId}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body" id="orderDetailsContent">
                            ${modalContent.outerHTML}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary" onclick="printOrder('${orderId}')">
                                <i class="fas fa-print me-1"></i> Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar o modal ao DOM e mostrá-lo
        document.body.insertAdjacentHTML('beforeend', modalElement);
        const modalInstance = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modalInstance.show();
        
        // Buscar os detalhes do pedido
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar os detalhes do pedido');
        }
        
        const order = await response.json();
        
        // Formatar os itens do pedido
        const itemsHtml = order.items?.map(item => `
            <tr>
                <td>${item.name || 'Item sem nome'}</td>
                <td class="text-center">${item.quantity || 1}</td>
                <td class="text-end">${formatCurrency(item.price || 0)}</td>
                <td class="text-end">${formatCurrency((item.quantity || 1) * (item.price || 0))}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" class="text-center">Nenhum item encontrado</td></tr>';
        
        // Formatar a data do pedido
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
        const formattedDate = orderDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Atualizar o conteúdo do modal com os detalhes do pedido
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        if (orderDetailsContent) {
            orderDetailsContent.innerHTML = `
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6 class="fw-bold">Informações do Cliente</h6>
                        <p class="mb-1"><strong>Nome:</strong> ${order.customerInfo?.name || 'Não informado'}</p>
                        <p class="mb-1"><strong>Telefone:</strong> ${order.customerInfo?.phone || 'Não informado'}</p>
                        <p class="mb-1"><strong>Endereço:</strong> ${order.deliveryAddress?.address || 'Não informado'}</p>
                        <p class="mb-1"><strong>Bairro:</strong> ${order.deliveryAddress?.neighborhood || 'Não informado'}</p>
                        <p class="mb-1"><strong>Complemento:</strong> ${order.deliveryAddress?.complement || 'Não informado'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold">Detalhes do Pedido</h6>
                        <p class="mb-1"><strong>Número do Pedido:</strong> #${order.orderNumber || orderId}</p>
                        <p class="mb-1"><strong>Data:</strong> ${formattedDate}</p>
                        <p class="mb-1"><strong>Status:</strong> <span class="badge bg-${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></p>
                        <p class="mb-1"><strong>Forma de Pagamento:</strong> ${order.paymentMethod || 'Não informado'}</p>
                        <p class="mb-1"><strong>Troco para:</strong> ${order.paymentChange ? formatCurrency(order.paymentChange) : 'Não necessário'}</p>
                    </div>
                </div>
                
                <h6 class="fw-bold mt-4 mb-3">Itens do Pedido</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th class="text-center">Qtd</th>
                                <th class="text-end">Preço Unit.</th>
                                <th class="text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end fw-bold">Subtotal:</td>
                                <td class="text-end fw-bold">${formatCurrency(order.subtotal || 0)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end">Taxa de Entrega:</td>
                                <td class="text-end">${formatCurrency(order.deliveryFee || 0)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end">Total:</td>
                                <td class="text-end fw-bold">${formatCurrency(order.total || 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                ${order.notes ? `
                    <div class="alert alert-info mt-3 mb-0">
                        <strong>Observações:</strong> ${order.notes}
                    </div>
                ` : ''}
            `;
        }
        
    } catch (error) {
        console.error('Erro ao carregar detalhes do pedido:', error);
        
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        if (orderDetailsContent) {
            orderDetailsContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${error.message || 'Erro ao carregar os detalhes do pedido'}
                    <button class="btn btn-sm btn-outline-danger ms-2" 
                            onclick="viewOrderDetails('${orderId}')">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Função auxiliar para obter a classe CSS do badge de status
function getStatusBadgeClass(status) {
    const statusMap = {
        'pending': 'warning',
        'preparing': 'info',
        'ready': 'primary',
        'on_the_way': 'info',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
}

// Função para imprimir o pedido
function printOrder(orderId) {
    // Implementação futura para impressão do pedido
    showAlert('Funcionalidade de impressão em desenvolvimento', 'info');
}

async function editMenuItem(itemId) {
    try {
        // Mostrar indicador de carregamento
        showAlert('Carregando dados do item...', 'info');
        
        // Buscar os dados atuais do item
        const response = await fetch(`${API_BASE}/menu/${itemId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar dados do item');
        }
        
        const item = await response.json();
        
        // Criar o modal de edição
        const modalHtml = `
            <div class="modal fade" id="editMenuItemModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Item do Cardápio</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editMenuItemForm">
                                <input type="hidden" name="id" value="${item.id}">
                                <div class="mb-3">
                                    <label class="form-label">Nome</label>
                                    <input type="text" class="form-control" name="name" value="${escapeHtml(item.name || '')}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Descrição</label>
                                    <textarea class="form-control" name="description" required>${escapeHtml(item.description || '')}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Categoria</label>
                                    <select class="form-select" name="category" required>
                                        <option value="acarajes" ${item.category === 'acarajes' ? 'selected' : ''}>Acarajés</option>
                                        <option value="abaras" ${item.category === 'abaras' ? 'selected' : ''}>Abarás</option>
                                        <option value="bebidas" ${item.category === 'bebidas' ? 'selected' : ''}>Bebidas</option>
                                        <option value="outros" ${item.category === 'outros' ? 'selected' : ''}>Outros</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Preço</label>
                                    <input type="number" class="form-control" name="price" step="0.01" value="${item.price || ''}" required>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="available" id="availableCheck" ${item.available ? 'checked' : ''}>
                                    <label class="form-check-label" for="availableCheck">
                                        Disponível
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="saveMenuItem(true, '${item.id}')">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modais existentes
        const existingModal = document.getElementById('editMenuItemModal');
        if (existingModal) {
            const modalInstance = bootstrap.Modal.getInstance(existingModal);
            if (modalInstance) modalInstance.dispose();
            existingModal.remove();
        }
        
        // Adicionar o novo modal ao DOM
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar o modal
        const modal = new bootstrap.Modal(document.getElementById('editMenuItemModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar dados do item:', error);
        showAlert(`Erro ao carregar dados do item: ${error.message}`, 'danger');
    }
}

async function deleteMenuItem(itemId) {
    if (!itemId) {
        console.error('ID do item não fornecido');
        showAlert('Erro: ID do item não fornecido', 'danger');
        return;
    }
    
    // Confirmar a exclusão com o usuário
    const confirmed = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não pode ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, remover item!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });
    
    if (!confirmed.isConfirmed) {
        return;
    }
    
    // Encontrar o botão que foi clicado
    const deleteButton = document.querySelector(`.delete-item[data-item-id="${itemId}"]`);
    const originalButtonHtml = deleteButton?.innerHTML;
    
    try {
        // Mostrar estado de carregamento
        if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="ms-1">Removendo...</span>
            `;
        }
        
        const response = await fetch(`${API_BASE}/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (response.ok) {
            // Mostrar mensagem de sucesso
            await Swal.fire({
                title: 'Removido!',
                text: 'O item foi removido com sucesso.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Recarregar a lista de itens
            await loadMenuItems();
        } else {
            const errorMessage = data.message || 
                (response.status === 404 ? 'Item não encontrado' : 'Erro ao remover item');
            
            // Se for um erro de validação, mostrar os erros
            if (response.status === 422 && data.errors) {
                const errorList = Object.values(data.errors)
                    .map(err => `• ${Array.isArray(err) ? err.join('\n• ') : err}`)
                    .join('\n');
                
                throw new Error(`Erro de validação:\n${errorList}`);
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Erro ao remover item:', error);
        
        // Mostrar mensagem de erro detalhada
        await Swal.fire({
            title: 'Erro!',
            html: `Não foi possível remover o item.<br><br>
                  <small class="text-muted">${error.message || 'Tente novamente mais tarde.'}</small>`,
            icon: 'error',
            confirmButtonText: 'Entendi'
        });
        
        // Se for um erro de rede, oferecer para tentar novamente
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            const shouldRetry = await Swal.fire({
                title: 'Erro de conexão',
                text: 'Não foi possível conectar ao servidor. Deseja tentar novamente?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sim, tentar novamente',
                cancelButtonText: 'Cancelar'
            });
            
            if (shouldRetry.isConfirmed) {
                await deleteMenuItem(itemId);
                return;
            }
        }
    } finally {
        // Restaurar o estado do botão
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = originalButtonHtml || '<i class="fas fa-trash"></i> Remover';
        }
    }
}

async function editIngredient(ingredientId) {
    try {
        // Mostrar indicador de carregamento
        showAlert('Carregando dados do ingrediente...', 'info');
        
        // Buscar os dados atuais do ingrediente
        const response = await fetch(`${API_BASE}/ingredients/${ingredientId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar dados do ingrediente');
        }
        
        const ingredient = await response.json();
        
        // Criar o modal de edição
        const modalHtml = `
            <div class="modal fade" id="editIngredientModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Ingrediente</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editIngredientForm">
                                <input type="hidden" name="id" value="${ingredient.id}">
                                <div class="mb-3">
                                    <label class="form-label">Nome</label>
                                    <input type="text" class="form-control" name="name" value="${escapeHtml(ingredient.name || '')}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Categoria</label>
                                    <select class="form-select" name="category" required>
                                        <option value="proteina" ${ingredient.category === 'proteina' ? 'selected' : ''}>Proteína</option>
                                        <option value="vegetal" ${ingredient.category === 'vegetal' ? 'selected' : ''}>Vegetal</option>
                                        <option value="molho" ${ingredient.category === 'molho' ? 'selected' : ''}>Molho</option>
                                        <option value="tempero" ${ingredient.category === 'tempero' ? 'selected' : ''}>Tempero</option>
                                        <option value="outro" ${ingredient.category === 'outro' ? 'selected' : ''}>Outro</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Preço</label>
                                    <input type="number" class="form-control" name="price" step="0.01" value="${ingredient.price || '0'}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Estoque</label>
                                    <input type="number" class="form-control" name="stock" step="0.1" value="${ingredient.stock || '0'}" required>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="available" id="availableCheck" ${ingredient.available ? 'checked' : ''}>
                                    <label class="form-check-label" for="availableCheck">
                                        Disponível
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="saveIngredient(true, '${ingredient.id}')">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modais existentes
        const existingModal = document.getElementById('editIngredientModal');
        if (existingModal) {
            const modalInstance = bootstrap.Modal.getInstance(existingModal);
            if (modalInstance) modalInstance.dispose();
            existingModal.remove();
        }
        
        // Adicionar o novo modal ao DOM
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar o modal
        const modal = new bootstrap.Modal(document.getElementById('editIngredientModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar dados do ingrediente:', error);
        showAlert(`Erro ao carregar dados do ingrediente: ${error.message}`, 'danger');
    }
}

async function deleteIngredient(ingredientId) {
    if (confirm('Tem certeza que deseja remover este ingrediente?')) {
        try {
            const response = await fetch(`${API_BASE}/ingredients/${ingredientId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                showAlert('Ingrediente removido com sucesso!', 'success');
                await loadIngredients();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao remover ingrediente');
            }
        } catch (error) {
            console.error('Erro ao remover ingrediente:', error);
            showAlert(`Erro ao remover ingrediente: ${error.message}`, 'danger');
        }
    }
}

async function editDeliveryArea(areaId) {
    try {
        // Mostrar indicador de carregamento
        showAlert('Carregando dados da área de entrega...', 'info');
        
        // Buscar os dados atuais da área de entrega
        const response = await fetch(`${API_BASE}/delivery-areas/${areaId}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao carregar dados da área de entrega');
        }
        
        const area = await response.json();
        
        // Criar o modal de edição
        const modalHtml = `
            <div class="modal fade" id="editDeliveryAreaModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Área de Entrega</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editDeliveryAreaForm">
                                <input type="hidden" name="id" value="${area.id}">
                                <div class="mb-3">
                                    <label class="form-label">Nome</label>
                                    <input type="text" class="form-control" name="name" value="${escapeHtml(area.name || '')}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Taxa de Entrega</label>
                                    <div class="input-group">
                                        <span class="input-group-text">R$</span>
                                        <input type="number" class="form-control" name="fee" step="0.01" value="${area.fee || '0'}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tempo Estimado (minutos)</label>
                                    <input type="number" class="form-control" name="estimatedTime" value="${area.estimatedTime || '30'}" required>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="active" id="activeCheck" ${area.active ? 'checked' : ''}>
                                    <label class="form-check-label" for="activeCheck">
                                        Ativo
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="saveDeliveryArea(true, '${area.id}')">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modais existentes
        const existingModal = document.getElementById('editDeliveryAreaModal');
        if (existingModal) {
            const modalInstance = bootstrap.Modal.getInstance(existingModal);
            if (modalInstance) modalInstance.dispose();
            existingModal.remove();
        }
        
        // Adicionar o novo modal ao DOM
        document.getElementById('modals-container').insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostrar o modal
        const modal = new bootstrap.Modal(document.getElementById('editDeliveryAreaModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar dados da área de entrega:', error);
        showAlert(`Erro ao carregar dados da área de entrega: ${error.message}`, 'danger');
    }
}

async function deleteDeliveryArea(areaId) {
    if (confirm('Tem certeza que deseja remover esta área de entrega?')) {
        try {
            const response = await fetch(`${API_BASE}/delivery-areas/${areaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                showAlert('Área de entrega removida com sucesso!', 'success');
                await loadDeliveryAreas();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao remover área de entrega');
            }
        } catch (error) {
            console.error('Erro ao remover área de entrega:', error);
            showAlert(`Erro ao remover área de entrega: ${error.message}`, 'danger');
        }
    }
}

function loadReports() {
    showAlert('Relatórios em desenvolvimento', 'info');
}
