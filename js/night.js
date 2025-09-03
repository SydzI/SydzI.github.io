(function () {
/**
 * Icarus 夜间模式 by iMaeGoo
 * https://www.imaegoo.com/
 */

var isNight = localStorage.getItem('night');
var nightNav;
var nightIcon;

function applyNight(value) {
    // 确保value是布尔值
    var nightMode = value === true || value === 'true';
    if (nightMode) {
        document.body.classList.remove('light');
        document.body.classList.add('night');
        // 夜间模式显示太阳图标
        if (nightIcon) {
            nightIcon.classList.remove('fa-moon');
            nightIcon.classList.add('fa-sun');
        }
    } else {
        document.body.classList.remove('night');
        document.body.classList.add('light');
        // 日间模式显示月亮图标
        if (nightIcon) {
            nightIcon.classList.remove('fa-sun');
            nightIcon.classList.add('fa-moon');
        }
    }
}

function findNightNav() {
    nightNav = document.getElementById('night-nav');
    nightIcon = document.getElementById('night-icon');
    if (!nightNav || !nightIcon) {
        setTimeout(findNightNav, 100);
    } else {
        // 移除已有的事件监听器，避免重复绑定
        nightNav.removeEventListener('click', switchNight);
        // 重新绑定事件监听器
        nightNav.addEventListener('click', switchNight);
        // 初始化图标
        if (isNight && (isNight === 'true' || isNight === true)) {
            nightIcon.classList.remove('fa-moon');
            nightIcon.classList.add('fa-sun');
        } else {
            nightIcon.classList.remove('fa-sun');
            nightIcon.classList.add('fa-moon');
        }
    }
}

function switchNight() {
    // 简化切换逻辑，确保类型一致性
    isNight = isNight === 'true' || isNight === true ? 'false' : 'true';
    applyNight(isNight);
    localStorage.setItem('night', isNight);
}

// 初始化夜间模式
function initNightMode() {
    // 从localStorage获取最新的夜间模式状态
    isNight = localStorage.getItem('night');
    // 查找导航按钮并绑定事件
    findNightNav();
    // 应用夜间模式
    applyNight(isNight);
}

// 初始加载时执行
initNightMode();

// 监听Pjax页面切换事件，确保页面局部刷新后夜间模式仍然有效
// 兼容Hexo的Pjax实现
if (window.addEventListener) {
    window.addEventListener('pjax:end', initNightMode);
    window.addEventListener('pjax:success', initNightMode);
    // 兼容NexT主题的Pjax实现
    document.addEventListener('pjax:success', initNightMode);
}
}());