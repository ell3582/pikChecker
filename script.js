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
        const isShareMode = ref(false);

        // 啟動時檢查係咪 Share Mode
        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const shareData = urlParams.get('share');

            if (shareData) {
                try {
                    isShareMode.value = true;
                    // 將網址嘅 Base64 轉返做 JSON
                    ownedData.value = JSON.parse(atob(shareData));
                } catch (e) {
                    console.error("無法解析分享數據");
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
            //if (isShareMode.value) return; // 分享模式下唯讀
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            localStorage.setItem('pikmin_tracker_2026_final', JSON.stringify(ownedData.value));
        };

        const generateShareLink = () => {
            // 將所有收藏數據壓成一段 Base64 字串
            const dataString = btoa(JSON.stringify(ownedData.value));
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${dataString}`;
            
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("分享連結已複製！發送給朋友即可查看。");
            });
        };

        const exitShareMode = () => {
            window.location.href = window.location.origin + window.location.pathname;
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

        const resetData = () => {
            if (confirm('確定重設所有進度？')) {
                ownedData.value = {};
                localStorage.removeItem('pikmin_tracker_2026_final');
            }
        };

        return {
            pikminColors, decorData, togglePikmin, getState, 
            getStateClass, getCategoryOwnedCount, getColorData,
            ownedCount, totalCount, progress, resetData,
            isShareMode, generateShareLink, exitShareMode
        };
    }
}).mount('#app');
