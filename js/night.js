(function () {
/**
 * Icarus 夜间模式 by iMaeGoo
 * https://www.imaegoo.com/
 * 增强版：确保页面间模式状态同步
 */

// 使用全局变量存储夜间模式状态
window.IcarusNightMode = {
    isNight: localStorage.getItem('night'),
    nightNav: null,
    nightIcon: null
};

function applyNight(value) {
    // 确保value是布尔值
    var nightMode = value === true || value === 'true';
    if (nightMode) {
        document.body.classList.remove('light');
        document.body.classList.add('night');
        // 夜间模式显示太阳图标
        if (window.IcarusNightMode.nightIcon) {
            window.IcarusNightMode.nightIcon.classList.remove('fa-moon');
            window.IcarusNightMode.nightIcon.classList.add('fa-sun');
        }
    } else {
        document.body.classList.remove('night');
        document.body.classList.add('light');
        // 日间模式显示月亮图标
        if (window.IcarusNightMode.nightIcon) {
            window.IcarusNightMode.nightIcon.classList.remove('fa-sun');
            window.IcarusNightMode.nightIcon.classList.add('fa-moon');
        }
    }
}

function findNightNav() {
    window.IcarusNightMode.nightNav = document.getElementById('night-nav');
    window.IcarusNightMode.nightIcon = document.getElementById('night-icon');
    if (!window.IcarusNightMode.nightNav || !window.IcarusNightMode.nightIcon) {
        setTimeout(findNightNav, 100);
    } else {
        // 移除已有的事件监听器，避免重复绑定
        window.IcarusNightMode.nightNav.removeEventListener('click', switchNight);
        // 重新绑定事件监听器
        window.IcarusNightMode.nightNav.addEventListener('click', switchNight);
        // 初始化图标
        if (window.IcarusNightMode.isNight && (window.IcarusNightMode.isNight === 'true' || window.IcarusNightMode.isNight === true)) {
            window.IcarusNightMode.nightIcon.classList.remove('fa-moon');
            window.IcarusNightMode.nightIcon.classList.add('fa-sun');
        } else {
            window.IcarusNightMode.nightIcon.classList.remove('fa-sun');
            window.IcarusNightMode.nightIcon.classList.add('fa-moon');
        }
    }
}

function switchNight() {
    // 简化切换逻辑，确保类型一致性
    window.IcarusNightMode.isNight = window.IcarusNightMode.isNight === 'true' || window.IcarusNightMode.isNight === true ? 'false' : 'true';
    applyNight(window.IcarusNightMode.isNight);
    localStorage.setItem('night', window.IcarusNightMode.isNight);
}

// 初始化夜间模式
function initNightMode() {
    // 从localStorage获取最新的夜间模式状态
    window.IcarusNightMode.isNight = localStorage.getItem('night');
    // 查找导航按钮并绑定事件
    findNightNav();
    // 应用夜间模式
    applyNight(window.IcarusNightMode.isNight);
}

// 初始加载时执行
initNightMode();

// 监听更多页面切换相关事件，确保在各种场景下模式状态都能同步
if (window.addEventListener) {
    // Pjax页面切换事件
    window.addEventListener('pjax:end', initNightMode);
    window.addEventListener('pjax:success', initNightMode);
    document.addEventListener('pjax:success', initNightMode);
    
    // 页面加载完成事件
    window.addEventListener('load', initNightMode);
    
    // 页面可见性变化事件（处理页面从后台切回前台的情况）
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            initNightMode();
        }
    });
    
    // 监听storage事件，处理多个标签页间的模式同步
    window.addEventListener('storage', function(event) {
        if (event.key === 'night') {
            window.IcarusNightMode.isNight = event.newValue;
            applyNight(window.IcarusNightMode.isNight);
        }
    });
}
}());