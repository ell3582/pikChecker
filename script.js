const { createApp, ref, computed, onMounted } = Vue;

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

        const all = ['red', 'yellow', 'blue', 'white', 'purple', 'winged', 'rock'];
        const basic3 = ['red', 'yellow', 'blue'];

        // 數據庫：方便你日後自行增減
        const decorData = [
            { name: '荷蘭木鞋 (2026)', icon: '👞', colors: all },
    { name: '朱古力 (2026)', icon: '💝', colors: all },
    { name: '御節料理', icon: '🍱', colors: all },
    { name: '麻雀牌', icon: '🀄', colors: all },
    { name: '拼圖 (2025)', icon: '🧩', colors: all },

    // --- 日常生活 (常見) ---
    { name: '餐廳 (廚師帽)', icon: '🍴', colors: all },
    { name: '餐廳 (閃色)', icon: '✨', colors: ['red', 'yellow', 'blue'] },
    { name: '咖啡店', icon: '☕', colors: basic3 },
    { name: '甜點店 (馬卡龍)', icon: '🍰', colors: all },
    { name: '甜點店 (甜甜圈)', icon: '🍩', colors: all },
    { name: '電影院', icon: '🎬', colors: basic3 },
    { name: '藥妝店 (牙刷)', icon: '💊', colors: all },
    { name: '超市 (香蕉)', icon: '🍌', colors: all },
    { name: '超市 (蘑菇)', icon: '🍄', colors: all },
    { name: '麵包店', icon: '🥐', colors: all },
    { name: '理髮店', icon: '💈', colors: basic3 },
    { name: '設計師服裝', icon: '👗', colors: all },

    // --- 戶外與自然 ---
    { name: '公園 (三葉草)', icon: '🌳', colors: all },
    { name: '公園 (四葉草)', icon: '🍀', colors: all },
    { name: '圖書館', icon: '📚', colors: basic3 },
    { name: '森林 (甲蟲)', icon: '🐞', colors: all },
    { name: '森林 (橡實)', icon: '🌰', colors: all },
    { name: '砂濱 (貝殼)', icon: '🐚', colors: all },
    { name: '水邊 (硬幣)', icon: '🪙', colors: all },
    { name: '池塘 (睡蓮)', icon: '🪷', colors: all },

    // --- 交通與特殊場所 ---
    { name: '車站 (紙火車)', icon: '🚉', colors: all },
    { name: '車站 (售票機)', icon: '🎟️', colors: all },
    { name: '公車站 (公車票)', icon: '🚌', colors: all },
    { name: '機場 (小飛機)', icon: '✈️', colors: all },
    { name: '郵局 (郵票)', icon: '📮', colors: all },
    { name: '美術館 (相框)', icon: '🖼️', colors: all },
    { name: '動物園 (蒲公英)', icon: '🦁', colors: all },
    { name: '拉麵店', icon: '🍜', colors: ['red', 'yellow', 'blue'] },
    { name: '壽司店', icon: '🍣', colors: basic3 },
    { name: '山岳 (別針)', icon: '⛰️', colors: ['red', 'yellow', 'blue'] },

    // --- 其他 ---
    { name: '雨天 (葉子帽)', icon: '☔', colors: ['blue'] },
    { name: '路邊 (貼紙)', icon: '🍃', colors: all },
    { name: '路邊 (硬幣)', icon: '🪙', colors: all },
        ];

        const ownedData = ref({});

        onMounted(() => {
            const saved = localStorage.getItem('pikmin_tracker_2026_final');
            if (saved) ownedData.value = JSON.parse(saved);
        });

        const getColorData = (id) => pikminColors.find(c => c.id === id);
        const getState = (catName, colorId) => ownedData.value[`${catName}_${colorId}`] || 0;
        const getStateClass = (catName, colorId) => `state-${getState(catName, colorId)}`;

        const togglePikmin = (catName, colorId) => {
            const key = `${catName}_${colorId}`;
            ownedData.value[key] = ((ownedData.value[key] || 0) + 1) % 3;
            localStorage.setItem('pikmin_tracker_2026_final', JSON.stringify(ownedData.value));
        };

        const getCategoryOwnedCount = (cat) => {
            return cat.colors.filter(id => getState(cat.name, id) > 0).length;
        };

        const resetData = () => {
            if (confirm('確定重設所有進度？')) {
                ownedData.value = {};
                localStorage.removeItem('pikmin_tracker_2026_final');
            }
        };

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
            ownedCount, totalCount, progress, resetData
        };
    }
}).mount('#app');