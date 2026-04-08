const { createApp, ref, computed, onMounted } = Vue;

// 2026 最新 Collection 數據庫
const PIKMIN_LIST = [
    { name: '荷蘭木鞋 (2026)', icon: '👞', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '朱古力 (2026)', icon: '💝', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '御節料理', icon: '🍱', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '餐廳 (廚師帽)', icon: '🍴', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '咖啡店', icon: '☕', colors: ['red', 'yellow', 'blue'] },
    { name: '甜點店 (馬卡龍)', icon: '🍰', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '電影院', icon: '🎬', colors: ['red', 'yellow', 'blue'] },
    { name: '藥妝店 (牙刷)', icon: '💊', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '超市 (香蕉/蘑菇)', icon: '🛒', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '麵包店', icon: '🥐', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '公園 (三葉草)', icon: '🌳', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '車站 (紙火車)', icon: '🚉', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '路邊 (貼紙)', icon: '🍃', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] }
];

createApp({
    setup() {
        const pikminColors = [
            { id: 'red', label: '紅', bg: 'bg-red-500' },
            { id: 'yellow', label: '黃', bg: 'bg-yellow-400' },
            { id: 'blue', label: '青', bg: 'bg-blue-500' },
            { id: 'white', label: '白', bg: 'bg-white border-slate-200' },
            { id: 'purple', label: '紫', bg: 'bg-purple-600' },
            { id: 'winged', label: '羽', bg: 'bg-pink-400' },
            { id: 'rock', label: '岩', bg: 'bg-slate-600' }
        ];

        const ownedData = ref({});
        const decorData = PIKMIN_LIST;

        // 從網址 Hash 讀取數據並解碼
        const load = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return {};
            try {
                const safeHash = hash.replace(/-/g, '+').replace(/_/g, '/');
                return JSON.parse(decodeURIComponent(escape(atob(safeHash))));
            } catch (e) {
                console.warn("URL Data Corrupted");
                return {};
            }
        };

        onMounted(() => {
            ownedData.value = load();
            // 當用戶撳「返回」或手動改 URL 嗰陣更新畫面
            window.onhashchange = () => { ownedData.value = load(); };
        });

        // 更新網址 Hash (自動 Save)
        const updateUrl = () => {
            const jsonStr = JSON.stringify(ownedData.value);
            const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
            const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            window.location.hash = safeBase64;
        };

        const togglePikmin = (cat, col) => {
            const key = `${cat}_${col}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            updateUrl();
        };

        const getColorData = (id) => pikminColors.find(c => c.id === id);
        const getState = (cat, col) => ownedData.value[`${cat}_${col}`] || 0;
        const getStateClass = (cat, col) => `state-${getState(cat, col)}`;
        const getCategoryOwnedCount = (cat) => cat.colors.filter(id => getState(cat.name, id) > 0).length;

        const totalCount = computed(() => decorData.reduce((acc, cat) => acc + cat.colors.length, 0));
        const ownedCount = computed(() => {
            let count = 0;
            decorData.forEach(cat => {
                cat.colors.forEach(id => { if (getState(cat.name, id) > 0) count++; });
            });
            return count;
        });
        const progress = computed(() => totalCount.value ? Math.round((ownedCount.value / totalCount.value) * 100) : 0);
        
        const generateShareLink = () => {
            navigator.clipboard.writeText(window.location.href).then(() => alert("✅ 網址已複製！"));
        };

        const resetData = () => {
            if(confirm('確定要清除所有進度？')) {
                ownedData.value = {};
                window.location.hash = '';
            }
        };

        return { pikminColors, decorData, togglePikmin, getState, getStateClass, getCategoryOwnedCount, getColorData, ownedCount, totalCount, progress, generateShareLink, resetData };
    }
}).mount('#app');
