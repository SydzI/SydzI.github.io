/* global IcarusThemeSettings, firebase */

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
                    doc.set({
                        count
                    });
                }
                return count;
            });
        };

        const db = firebase.firestore();
        const articles = db.collection(IcarusThemeSettings.services.firebase.collection);

        // 监听页面加载完成事件
        document.addEventListener('DOMContentLoaded', () => {
            const isArticlePage = document.querySelector('.article-container') !== null;
            const isIndexPage = document.querySelector('.article-list') !== null;

            if (isArticlePage) {
                // 文章页面处理
                // `https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent`
                const title = document.querySelector('.title.is-3, .title.is-4-mobile').textContent.trim();
                const doc = articles.doc(title);
                let increaseCount = window.location.hostname === document.location.hostname;
                
                if (sessionStorage.getItem(title)) {
                    increaseCount = false;
                } else {
                    // Mark as visited in current session
                    sessionStorage.setItem(title, true);
                }
                
                getCount(doc, increaseCount).then(count => {
                    document.querySelector('.firestore-visitors-count').innerText = count;
                }).catch(e => console.error('Error updating count:', e));
            } else if (isIndexPage) {
                // 首页文章列表处理
                const promises = [...document.querySelectorAll('.article-card .title.is-3, .article-card .title.is-4-mobile')].map(element => {
                    const title = element.textContent.trim();
                    const doc = articles.doc(title);
                    return getCount(doc, false);
                });
                
                Promise.all(promises).then(counts => {
                    const metas = document.querySelectorAll('.article-card .firestore-visitors-count');
                    counts.forEach((val, idx) => {
                        if (metas[idx]) {
                            metas[idx].innerText = val;
                        }
                    });
                }).catch(e => console.error('Error fetching counts:', e));
            }
        });
    })();
}