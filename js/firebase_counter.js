/* global IcarusThemeSettings, firebase */

// Firebase Counter - 阅读量统计功能

if (IcarusThemeSettings.services && IcarusThemeSettings.services.firebase && IcarusThemeSettings.services.firebase.enable) {
    
    // 初始化Firebase
    firebase.initializeApp({
        apiKey: IcarusThemeSettings.services.firebase.apiKey,
        projectId: IcarusThemeSettings.services.firebase.projectId
    });

    (function() {
        // 获取阅读次数函数
        const getCount = (doc, increaseCount) => {
            // IncreaseCount will be false when not in article page
            return doc.get().then(d => {
                // Has no data, initialize count
                let count = d.exists ? d.data().count : 0;
                
                // If first view this article
                if (increaseCount) {
                    // Increase count
                    count++;
                    return doc.set({
                        count
                    }).then(() => count);
                } else {
                    return Promise.resolve(count);
                }
                
                return count;
            });
        };

        const db = firebase.firestore();
        const articles = db.collection(IcarusThemeSettings.services.firebase.collection);

        // 处理阅读计数的函数
        const handleViewCount = () => {
            const isArticlePage = document.querySelector('.article-container') !== null;
            const isIndexPage = document.querySelector('.article-list') !== null;

            if (isArticlePage) {
                // 文章页面处理
                // `https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent`
                const titleElement = document.querySelector('.title.is-3, .title.is-4-mobile');
                const countElement = document.querySelector('.firestore-visitors-count');
                
                if (titleElement && countElement) {
                    const title = titleElement.textContent.trim();
                    const doc = articles.doc(title);
                    
                    // 本地测试(hexo s)时不计数，只在生产环境计数
                    let increaseCount = window.location.hostname === document.location.hostname && 
                                      !['localhost', '127.0.0.1'].includes(window.location.hostname);
                    
                    if (sessionStorage.getItem(title)) {
                        increaseCount = false;
                    } else {
                        // Mark as visited in current session
                        sessionStorage.setItem(title, true);
                    }
                    
                    getCount(doc, increaseCount).then(count => {
                        countElement.innerText = count;
                    }).catch(e => console.error('Error updating count:', e));
                }
            } else if (isIndexPage) {
                // 首页文章列表处理
                const titleElements = document.querySelectorAll('.article-card .title.is-3, .article-card .title.is-4-mobile');
                const countElements = document.querySelectorAll('.article-card .firestore-visitors-count');
                
                if (titleElements.length > 0 && countElements.length > 0) {
                    const promises = [...titleElements].map(element => {
                        const title = element.textContent.trim();
                        const doc = articles.doc(title);
                        return getCount(doc, false);
                    });
                    
                    Promise.all(promises).then(counts => {
                        counts.forEach((val, idx) => {
                            if (countElements[idx]) {
                                countElements[idx].innerText = val;
                            }
                        });
                    }).catch(e => console.error('Error fetching counts:', e));
                }
            }
        };

        // 监听传统页面加载完成事件
        document.addEventListener('DOMContentLoaded', handleViewCount);
        
        // 监听PJAX页面加载完成事件（适配Icarus主题的PJAX机制）
        document.addEventListener('page:loaded', handleViewCount);
    })();
}