/* global IcarusThemeSettings, firebase */

// Firebase Counter - 阅读量统计功能

if (IcarusThemeSettings.services && IcarusThemeSettings.services.firebase && IcarusThemeSettings.services.firebase.enable) {
    
    // 初始化Firebase
    try {
        firebase.initializeApp({
            apiKey: IcarusThemeSettings.services.firebase.apiKey,
            projectId: IcarusThemeSettings.services.firebase.projectId
        });
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
        if (isDevelopment) console.log('Firebase 初始化成功');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        // 如果初始化失败，尝试隐藏计数器元素以避免显示为0
        document.querySelectorAll('.firestore-visitors-count').forEach(el => {
            el.style.display = 'none';
        });
        // 提前退出，避免后续代码执行
        return;
    }

    (function() {
        // 获取阅读次数函数
        const getCount = (doc, increaseCount) => {
            // 获取文档数据
            return doc.get().then(d => {
                // 初始化计数
                let count = d.exists ? d.data().count : 0;
                
                // 如果需要增加计数（只在文章页面且未在同一会话访问过）
                if (increaseCount) {
                    // 增加计数
                    count++;
                    return doc.set({ count }).then(() => {
                        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
                        const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
                        if (isDevelopment) console.log('计数已更新:', count);
                        return count;
                    });
                }
                
                return Promise.resolve(count);
            }).catch(error => {
                console.error('Error getting count:', error);
                // 出错时返回默认值0
                return 0;
            });
        };

        const db = firebase.firestore();
        const articles = db.collection(IcarusThemeSettings.services.firebase.collection);

        // 处理阅读计数的函数
        const handleViewCount = () => {
            const isArticlePage = document.querySelector('.article-container') !== null;
            const isIndexPage = document.querySelector('.article-list') !== null;

            // 在本地开发环境显示调试信息
            const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
            const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
            
            if (isDevelopment) {
                // 显示Firebase配置信息（注意不要泄露敏感信息）
                console.log('\n=========== Firebase 调试信息 ===========');
                console.log('Collection:', IcarusThemeSettings.services.firebase.collection);
                console.log('当前URL:', window.location.href);
                console.log('是否文章页:', isArticlePage);
                console.log('是否首页:', isIndexPage);
                console.log('========================================\n');
            }

            if (isArticlePage) {
                // 文章页面处理
                const titleElement = document.querySelector('.title.is-3, .title.is-4-mobile');
                const countElement = document.querySelector('.firestore-visitors-count');
                
                if (titleElement && countElement) {
                    const title = titleElement.textContent.trim();
                    const doc = articles.doc(title);
                    
                    // 确定是否增加计数：不在本地开发环境且同一会话未访问过
                    let increaseCount = !isDevelopment;
                    
                    if (sessionStorage.getItem(title)) {
                        increaseCount = false;
                        if (isDevelopment) console.log(`[调试] 同一会话已访问过文章: "${title}"，不增加计数`);
                    } else {
                        // 标记为在当前会话中已访问
                        sessionStorage.setItem(title, true);
                        if (isDevelopment) console.log(`[调试] 首次访问文章: "${title}"，会话标记已设置`);
                    }
                    
                    if (isDevelopment) {
                        console.log(`[调试] 开发环境，模拟${increaseCount ? '增加' : '不增加'}计数操作`);
                        // 在开发环境下也可以模拟增加计数的输出
                        console.log(`[调试] 模拟更新文章: "${title}" 的阅读量`);
                    }
                    
                    getCount(doc, increaseCount).then(count => {
                        if (isDevelopment) console.log(`[调试] 文章 "${title}" 阅读量: ${count}`);
                        countElement.innerText = count;
                    }).catch(e => console.error('Error updating count:', e));
                } else {
                    if (isDevelopment) console.log('[调试] 未找到文章标题或计数元素');
                }
            } else if (isIndexPage) {
                // 首页文章列表处理
                const titleElements = document.querySelectorAll('.article-card .title.is-3, .article-card .title.is-4-mobile');
                const countElements = document.querySelectorAll('.article-card .firestore-visitors-count');
                
                if (isDevelopment) console.log(`[调试] 处理首页，发现 ${titleElements.length} 篇文章`);
                
                if (titleElements.length > 0 && countElements.length > 0) {
                    const promises = [...titleElements].map(element => {
                        const title = element.textContent.trim();
                        const doc = articles.doc(title);
                        // 首页只获取计数，不增加计数
                        if (isDevelopment) console.log(`[调试] 首页获取文章计数: "${title}"`);
                        return getCount(doc, false);
                    });
                    
                    Promise.all(promises).then(counts => {
                        if (isDevelopment) console.log(`[调试] 首页文章计数已全部获取`);
                        counts.forEach((val, idx) => {
                            if (countElements[idx]) {
                                countElements[idx].innerText = val;
                            }
                        });
                    }).catch(e => console.error('Error fetching counts:', e));
                }
            } else {
                if (isDevelopment) console.log('[调试] 当前页面既不是文章页也不是首页，不处理阅读量统计');
            }
        };

        // 监听传统页面加载完成事件
        document.addEventListener('DOMContentLoaded', () => {
            const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
            const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
            if (isDevelopment) console.log('[调试] DOMContentLoaded 事件触发，开始处理阅读量统计');
            handleViewCount();
        });
        
        // 监听PJAX页面加载完成事件（适配Icarus主题的PJAX机制）
        document.addEventListener('page:loaded', () => {
            const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
            const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
            if (isDevelopment) console.log('[调试] page:loaded 事件触发，开始处理阅读量统计');
            handleViewCount();
        });
        
        // 开发环境下显示初始化完成信息
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
        if (isDevelopment) {
            console.log('[调试] Firebase 计数器功能已初始化完成');
            console.log('[调试] 开发环境调试模式已开启');
        }
    })();
}