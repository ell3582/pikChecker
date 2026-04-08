const { createApp, ref, computed, onMounted } = Vue;

// 1. 確保呢度嘅資料格式正確
const PIKMIN_DECOR_LIST = [
    { name: '荷蘭木鞋 (2026)', icon: '👞', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '朱古力 (2026)', icon: '💝', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '御節料理', icon: '🍱', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '餐廳', icon: '🍴', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '咖啡店', icon: '☕', colors: ['red', 'yellow', 'blue'] },
    { name: '甜點店', icon: '🍰', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '電影院', icon: '🎬', colors: ['red', 'yellow', 'blue'] },
    { name: '藥妝店', icon: '💊', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '超市', icon: '🛒', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '麵包店', icon: '🥐', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '公園', icon: '🌳', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '車站', icon: '🚉', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '路邊', icon: '🍃', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] }
];

const app = createApp({
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

        const decorData = PIKMIN_DECOR_LIST;
        const ownedData = ref({});

        // 讀取網址 Hash 數據
        const loadFromUrl = () => {
            const hash = window.location.hash.slice(1);
            if (!hash) return {};
            try {
                // 還原 Base64 符號
                const safeHash = hash.replace(/-/g, '+').replace(/_/g, '/');
                const decodedJson = decodeURIComponent(escape(atob(safeHash)));
                return JSON.parse(decodedJson);
            } catch (e) {
                console.warn("數據載入失敗，已重設。詳情:", e);
                return {};
            }
        };

        onMounted(() => {
            ownedData.value = loadFromUrl();
            // 當用戶撳「返回」或手動改 URL 嗰陣更新畫面
            window.addEventListener('hashchange', () => {
                ownedData.value = loadFromUrl();
            });
        });

        const updateUrl = () => {
            try {
                const jsonStr = JSON.stringify(ownedData.value);
                const base64 = btoa(unescape(encodeURIComponent(jsonStr))); 
                const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                window.location.hash = safeBase64;
            } catch (e) {
                console.error("更新網址失敗:", e);
            }
        };

        const togglePikmin = (catName, colorId) => {
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            updateUrl();
        };

        const generateShareLink = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("✅ 連結已複製！請 Bookmark 呢個網址。");
            });
        };

        const resetData = () => {
            if (confirm('確定清除進度？')) {
                ownedData.value = {};
                window.location.hash = "";
            }
        };

        const getColorData = (id) => pikminColors.find(c => c.id === id);
        const getState = (catName, colorId) => ownedData.value[`${catName}_${colorId}`] || 0;
        const getStateClass = (catName, colorId) => `state-${getState(catName, colorId)}`;
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

        return {
            pikminColors, decorData, togglePikmin, getState, 
            getStateClass, getCategoryOwnedCount, getColorData,
            ownedCount, totalCount, progress, resetData,
            generateShareLink
        };
    }
});

app.mount('#app');
