document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. Back to Top Button (トップへ戻るボタン)
       ========================================= */
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        // スクロール時の表示・非表示切り替え
        window.addEventListener('scroll', () => {
            // 300px以上スクロールしたらボタンを表示
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('is-visible');
            }
        });

        // クリック時のスムーススクロール
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* =========================================
       2. Scroll Animations (スクロールでふわっと表示)
       ========================================= */
    // 監視対象：.process-step クラスを持つ要素
    const animatedElements = document.querySelectorAll('.process-step');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // 一度表示されたら監視を解除（パフォーマンス対策）
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // 要素が10%見えたら発火

        animatedElements.forEach((step) => {
            observer.observe(step);
        });
    }

    const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.process-step').forEach((step) => {
            observer.observe(step);
        });

});