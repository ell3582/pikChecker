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

        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.search);
            let shareData = urlParams.get('share');

            if (shareData) {
                // --- 數據匯入邏輯 ---
                try {
                    // 1. 還原安全 Base64 格式
                    shareData = shareData.replace(/-/g, '+').replace(/_/g, '/');
                    while (shareData.length % 4) shareData += '=';
                    
                    // 2. 解碼
                    const decodedJson = decodeURIComponent(escape(atob(shareData)));
                    const importedData = JSON.parse(decodedJson);
                    
                    // 3. 詢問用戶是否匯入（防止意外覆寫原本的進度）
                    if (confirm("偵測到分享數據，是否要匯入並覆蓋此裝置目前的紀錄？")) {
                        localStorage.setItem('pikmin_tracker_2026_final', JSON.stringify(importedData));
                        // 匯入後清除網址參數並重新整理，進入正常編輯模式
                        window.location.href = window.location.origin + window.location.pathname;
                        return;
                    } else {
                        // 如果用戶按取消，就載入本地原本的數據
                        loadLocalData();
                    }
                } catch (e) {
                    console.error("數據匯入失敗:", e);
                    loadLocalData();
                }
            } else {
                loadLocalData();
            }
        });

        const loadLocalData = () => {
            const saved = localStorage.getItem('pikmin_tracker_2026_final');
            if (saved) ownedData.value = JSON.parse(saved);
        };

        const togglePikmin = (catName, colorId) => {
            // 現在這裡不再有 isShareMode 的限制，隨時可以 edit
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            localStorage.setItem('pikmin_tracker_2026_final', JSON.stringify(ownedData.value));
        };

        const generateShareLink = () => {
            const jsonStr = JSON.stringify(ownedData.value);
            const base64 = btoa(unescape(encodeURIComponent(jsonStr))); 
            const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${safeBase64}`;
            
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("✅ 數據同步連結已複製！在其他裝置打開此連結即可繼續編輯。");
            });
        };

        // --- 其他 Helper Functions (getState, progress 等) 保持不變 ---

        return {
            pikminColors, decorData, togglePikmin, getState, 
            getStateClass, getCategoryOwnedCount, getColorData,
            ownedCount, totalCount, progress, resetData,
            generateShareLink
        };
    }
}).mount('#app');
