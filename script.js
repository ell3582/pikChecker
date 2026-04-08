const { createApp, ref, computed, onMounted } = Vue;

const PIKMIN_DECOR_LIST = [
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
    { name: '理髮店', icon: '💈', colors: ['red', 'yellow', 'blue'] },
    { name: '公園 (三葉草)', icon: '🌳', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '圖書館', icon: '📚', colors: ['red', 'yellow', 'blue'] },
    { name: '車站 (紙火車)', icon: '🚉', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '服飾店 (髮夾)', icon: '👗', colors: ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'] },
    { name: '雨天 (葉子帽)', icon: '☔', colors: ['blue'] },
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

        const decorData = PIKMIN_DECOR_LIST;
        const ownedData = ref({});

        // 更強大的 URL 解碼功能 (處理 GitHub Subfolders)
        const loadFromUrl = () => {
            const hash = window.location.hash.slice(1); // 攞 # 號後面的內容
            if (!hash) return {};
            try {
                const safeHash = hash.replace(/-/g, '+').replace(/_/g, '/');
                const decodedJson = decodeURIComponent(escape(atob(safeHash)));
                return JSON.parse(decodedJson);
            } catch (e) {
                console.error("URL 解析失敗:", e);
                return {};
            }
        };

        onMounted(() => {
            ownedData.value = loadFromUrl();
            window.addEventListener('hashchange', () => {
                ownedData.value = loadFromUrl();
            });
        });

        const updateUrl = () => {
            const jsonStr = JSON.stringify(ownedData.value);
            const base64 = btoa(unescape(encodeURIComponent(jsonStr))); 
            const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            // 關鍵：直接修改 hash，GitHub Pages 會保留 subfolder
            window.location.hash = safeBase64;
        };

        const togglePikmin = (catName, colorId) => {
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            updateUrl();
        };

        const generateShareLink = () => {
            // 確保攞到包含 subfolder 嘅 Full URL
            const fullUrl = window.location.href;
            navigator.clipboard.writeText(fullUrl).then(() => {
                alert("✅ 連結已複製！請 Bookmark 此網址。");
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
}).mount('#app');
