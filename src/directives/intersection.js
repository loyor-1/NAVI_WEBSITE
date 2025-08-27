export default {
    // 指令生命周期：元素挂载后调用
    mounted(el, binding) {
        // 从指令参数中获取配置和回调
        const { options = {}, callback } = binding.value || {};
        // 默认配置（可见 30% 触发）
        const defaultOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3,
            ...options
        };
    
        // 创建 observer 实例
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // 调用回调函数，传递可见状态和元素信息
                if (typeof callback === 'function') {
                    callback(entry.isIntersecting, entry);
                }
            });
        }, defaultOptions);
    
        // 开始监测元素
        observer.observe(el);
    
        // 将 observer 存储在元素上，便于解绑时销毁
        el._observer = observer;
    },
  
    // 指令生命周期：元素卸载前调用
    unmounted(el) {
        // 停止监测，避免内存泄漏
        if (el._observer) {
            el._observer.unobserve(el);
            el._observer.disconnect();
        }
    }
};