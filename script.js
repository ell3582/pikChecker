const { createApp, ref, computed, onMounted } = Vue;

// 將資料抽出嚟，方便你日後喺呢度加新系列
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

        // 核心邏輯：從 URL Hash 讀取數據
        const loadFromUrl = () => {
            const hash = window.location.hash.replace('#', '');
            if (!hash) return {};
            try {
                const decodedJson = decodeURIComponent(escape(atob(hash.replace(/-/g, '+').replace(/_/g, '/'))));
                return JSON.parse(decodedJson);
            } catch (e) {
                console.error("URL 數據解析失敗");
                return {};
            }
        };

        // 啟動時載入
        onMounted(() => {
            ownedData.value = loadFromUrl();
            
            // 監聽網址手動變更（例如撳「返回」掣）
            window.addEventListener('hashchange', () => {
                ownedData.value = loadFromUrl();
            });
        });

        // 每當數據變動，自動更新網址
        const updateUrl = () => {
            const jsonStr = JSON.stringify(ownedData.value);
            const base64 = btoa(unescape(encodeURIComponent(jsonStr))); 
            const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            // 更新 Hash，唔會 Reload 頁面
            window.location.hash = safeBase64;
        };

        const togglePikmin = (catName, colorId) => {
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            updateUrl(); // 每次撳完自動推入網址
        };

        const generateShareLink = () => {
            // 直接攞目前網址就係最新收藏
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert("✅ 收藏網址已複製！你可以 Bookmark 呢條 Link 或者 Send 俾朋友。");
            });
        };

        const resetData = () => {
            if (confirm('確定清除所有進度？')) {
                ownedData.value = {};
                window.location.hash = '';
            }
        };

        // ... 其餘 Helper Functions (getState, progress 等) ...

        return {
            pikminColors, decorData, togglePikmin, getState, 
            getStateClass, getCategoryOwnedCount, getColorData,
            ownedCount, totalCount, progress, resetData,
            generateShareLink
        };
    }
}).mount('#app');
