document.addEventListener('DOMContentLoaded', function() {
  // 检测本地环境（包括 localhost 和 127.0.0.1）
  const isLocal = /localhost|127\.0\.0\.1/.test(window.location.hostname);
  
  // 如果是本地环境，则不初始化 Valine 访问统计
  if (isLocal) {
    console.log('[Valine] 本地访问已跳过计数');
    return; 
  }

  // 非本地环境时正常初始化
  new Valine({
    el: '#vcomments',
    appId: T2UWk3ujlmzua4yKz4VEQe2I-MdYXbMMI,  // 替换为你的实际 ID
    appKey: fr73RF31Z7iChYTGlXKY7tfw,
    visitor: true  // 实际生效的访问统计
  });
});