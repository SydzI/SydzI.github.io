/* global IcarusThemeSettings, firebase */

// Firebase Counter - 阅读量统计功能

if (IcarusThemeSettings && IcarusThemeSettings.services && IcarusThemeSettings.services.firebase && IcarusThemeSettings.services.firebase.enable) {
    
    // 初始化Firebase
    try {
        // 确保firebase对象存在
        if (typeof firebase === 'undefined') {
            console.error('Firebase library not loaded');
            // 如果Firebase库未加载，隐藏计数器元素
            document.querySelectorAll('.firestore-visitors-count').forEach(el => {
                el.style.display = 'none';
            });
        } else {
            
            firebase.initializeApp({
                apiKey: IcarusThemeSettings.services.firebase.apiKey,
                projectId: IcarusThemeSettings.services.firebase.projectId
            });
            
            // 开发环境检测
            const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
            const isDevelopment = isLocalhost || window.location.hostname.includes('192.168.');
            
            // 移除所有调试日志输出
            
            // 获取数据库引用
            const db = firebase.firestore();
            const articlesCollection = IcarusThemeSettings.services.firebase.collection || 'articles';
            const articles = db.collection(articlesCollection);
            
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
                            if (isDevelopment) console.log('计数已更新:', count);
                            return count;
                        }).catch(error => {
                            console.error('Error updating count:', error);
                            return count; // 返回增加前的计数
                        });
                    }
                    
                    return count;
                }).catch(error => {
                    console.error('Error getting count:', error);
                    // 出错时返回默认值0
                    return 0;
                });
            };

            // 处理阅读计数的函数
            const handleViewCount = () => {
                // 获取当前URL路径
                const currentPath = window.location.pathname;
                
                // 增强首页识别：使用多个可能的选择器
                const isIndexPage = document.querySelector('.article-list') !== null ||
                                   document.querySelector('.article-card-list') !== null ||
                                   document.querySelectorAll('.article-card').length > 0 || // 降低阈值以适应首页
                                   (currentPath === '/' && document.querySelector('article.article') !== null); // 特殊处理：根路径+article.article元素
                
                // 增强文章页面识别：使用更精确的选择器组合
                // 重要：首页优先判断，且文章页判断要排除首页的情况，并增加特定的文章页特征
                const isArticlePage = !isIndexPage && (
                    // 传统文章页选择器
                    (document.querySelector('.article-container') !== null && document.querySelector('.article-content') !== null) ||
                    (document.querySelector('article.post') !== null && document.querySelector('.article-content') !== null) ||
                    document.querySelector('[id="post-content"]') !== null ||
                    // 针对hexo s环境的增强选择器，但需要确保不是首页
                    (document.querySelector('article.article') !== null && 
                     document.querySelector('article.card-content.article') !== null &&
                     document.querySelectorAll('.article-card').length === 0 &&
                     currentPath !== '/')
                );
                                    
                // 页面类型信息 - 仅在开发环境显示
                if (isDevelopment) {
                    console.log(`[Firebase] 当前页面类型: ${isArticlePage ? '文章页' : isIndexPage ? '首页' : '其他页面'}`);
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
                        } else {
                            // 标记为在当前会话中已访问
                            sessionStorage.setItem(title, true);
                        }
                        
                        getCount(doc, increaseCount).then(count => {
                            countElement.innerText = count;
                        }).catch(e => {
                            // 移除错误日志
                        });
                    } else {
                        // 静默处理：未找到文章标题或计数元素
                    }
                } else if (isIndexPage) {
                    // 首页文章列表处理
                    // 修改选择器以匹配实际HTML结构
                    // 首页文章结构: .card > .card-content.article > .title.is-3.is-size-4-mobile
                    const titleElements = document.querySelectorAll(
                        '.card .article .title.is-3, .card .article .title.is-4-mobile, ' +
                        '.card article .title.is-3, .card article .title.is-4-mobile, ' +
                        '.card .article p.title, .card article p.title'
                    );
                    const countElements = document.querySelectorAll('.card .article .firestore-visitors-count, .card article .firestore-visitors-count');
                
                // 移除首页元素检测日志
                
                if (titleElements.length > 0 && countElements.length > 0) {
                    const promises = [...titleElements].map(element => {
                            const title = element.textContent.trim();
                            const doc = articles.doc(title);
                            // 首页只获取计数，不增加计数
                            return getCount(doc, false).then(count => {
                                return count;
                            });
                        });
                    
                    Promise.all(promises).then(counts => {
                            counts.forEach((val, idx) => {
                                if (countElements[idx]) {
                                    countElements[idx].innerText = val;
                                }
                            });
                        }).catch(e => {
                            // 错误处理：尝试显示一些默认值或替代文本
                            countElements.forEach(el => {
                                if (el.innerText === '0') {
                                    el.innerText = '加载中...';
                                }
                            });
                        });
                } else {
                    // 尝试使用更通用的选择器
                    const fallbackTitleElements = document.querySelectorAll('.article-card a[href^="/"]');
                    const fallbackCountElements = document.querySelectorAll('.article-card .firestore-visitors-count');
                    
                    if (fallbackTitleElements.length > 0 && fallbackCountElements.length > 0) {
                        // 这里可以添加备选逻辑
                    }
                }
                } else {
                    // 静默处理：当前页面既不是文章页也不是首页
                }
            };

            // 监听传统页面加载完成事件
            document.addEventListener('DOMContentLoaded', () => {
                handleViewCount();
            });
            
            // 监听PJAX页面加载完成事件（适配Icarus主题的PJAX机制）
            document.addEventListener('page:loaded', () => {
                handleViewCount();
            });
        }
    } catch (error) {
        // 移除初始化失败日志
        // 如果初始化失败，尝试隐藏计数器元素以避免显示为0
        document.querySelectorAll('.firestore-visitors-count').forEach(el => {
            el.style.display = 'none';
        });
    }
}