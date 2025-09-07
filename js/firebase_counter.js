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
            
            // 无论开发环境还是生产环境都输出初始化信息
            console.log('Firebase 初始化成功');
            console.log(isDevelopment ? '[调试] 开发环境调试模式已开启' : '[生产] 生产环境运行模式已开启');
            console.log(`[状态] Firebase 计数器功能已初始化完成，使用集合: ${IcarusThemeSettings.services.firebase.collection || 'articles'}`);
            
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
                // 增强文章页面识别：使用多个可能的选择器
                const isArticlePage = document.querySelector('.article-container') !== null || 
                                     document.querySelector('article.post') !== null ||
                                     document.querySelector('.article-content') !== null ||
                                     document.querySelector('[id="post-content"]') !== null;
                
                // 增强首页识别：使用多个可能的选择器
                const isIndexPage = document.querySelector('.article-list') !== null ||
                                   document.querySelector('.article-card-list') !== null ||
                                   document.querySelectorAll('.article-card').length > 0;
                                    
                // 调试信息：输出所有可能的选择器结果
                if (isDevelopment) {
                    console.log('[调试] 页面类型检测结果:');
                    console.log('  .article-container 存在:', document.querySelector('.article-container') !== null);
                    console.log('  article.post 存在:', document.querySelector('article.post') !== null);
                    console.log('  .article-content 存在:', document.querySelector('.article-content') !== null);
                    console.log('  #post-content 存在:', document.querySelector('[id="post-content"]') !== null);
                    console.log('  .article-list 存在:', document.querySelector('.article-list') !== null);
                    console.log('  .article-card-list 存在:', document.querySelector('.article-card-list') !== null);
                    console.log('  .article-card 数量:', document.querySelectorAll('.article-card').length);
                }

                // 无论开发环境还是生产环境都显示基本信息
                if (isDevelopment) {
                    console.log('\n=========== Firebase 调试信息 ===========');
                    console.log('Collection:', articlesCollection);
                    console.log('当前URL:', window.location.href);
                    console.log('是否文章页:', isArticlePage);
                    console.log('是否首页:', isIndexPage);
                    console.log('========================================\n');
                } else {
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
                        console.log(`[Firebase] 同一会话已访问过文章: "${title}"，不增加计数`);
                    } else {
                        // 标记为在当前会话中已访问
                        sessionStorage.setItem(title, true);
                        console.log(`[Firebase] 首次访问文章: "${title}"，会话标记已设置`);
                    }
                    
                    if (isDevelopment) {
                        console.log(`[调试] 开发环境，${increaseCount ? '准备增加' : '不增加'}计数`);
                    }
                        
                        getCount(doc, increaseCount).then(count => {
                            console.log(`[Firebase] 文章 "${title}" 阅读量: ${count}`);
                            countElement.innerText = count;
                        }).catch(e => console.error('[Firebase] 更新计数失败:', e));
                    } else {
                        if (isDevelopment) console.log('[调试] 未找到文章标题或计数元素');
                    }
                } else if (isIndexPage) {
                    // 首页文章列表处理
                    const titleElements = document.querySelectorAll('.article-card .title.is-3, .article-card .title.is-4-mobile');
                    const countElements = document.querySelectorAll('.article-card .firestore-visitors-count');
                    
                    console.log(`[Firebase] 处理首页，发现 ${titleElements.length} 篇文章`);
                    
                    if (titleElements.length > 0 && countElements.length > 0) {
                        const promises = [...titleElements].map(element => {
                                const title = element.textContent.trim();
                                const doc = articles.doc(title);
                                // 首页只获取计数，不增加计数
                                if (isDevelopment) console.log(`[调试] 首页获取文章计数: "${title}"`);
                                return getCount(doc, false);
                            });
                        
                        Promise.all(promises).then(counts => {
                                console.log(`[Firebase] 首页文章计数已全部获取，共 ${counts.length} 篇`);
                                counts.forEach((val, idx) => {
                                    if (countElements[idx]) {
                                        countElements[idx].innerText = val;
                                    }
                                });
                            }).catch(e => console.error('[Firebase] 获取计数失败:', e));
                    }
                } else {
                    if (isDevelopment) console.log('[调试] 当前页面既不是文章页也不是首页，不处理阅读量统计');
                }
            };

            // 监听传统页面加载完成事件
            document.addEventListener('DOMContentLoaded', () => {
                console.log(`[Firebase] DOMContentLoaded 事件触发，${isDevelopment ? '调试模式' : '生产模式'}下处理阅读量统计`);
                handleViewCount();
            });
            
            // 监听PJAX页面加载完成事件（适配Icarus主题的PJAX机制）
            document.addEventListener('page:loaded', () => {
                console.log(`[Firebase] page:loaded 事件触发，${isDevelopment ? '调试模式' : '生产模式'}下处理阅读量统计`);
                handleViewCount();
            });
        }
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        // 如果初始化失败，尝试隐藏计数器元素以避免显示为0
        document.querySelectorAll('.firestore-visitors-count').forEach(el => {
            el.style.display = 'none';
        });
    }
}