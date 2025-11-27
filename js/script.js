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

    /* =========================================
       3. Password Protection (パスワードロック)
       ========================================= */
    const lockScreen = document.getElementById('lockScreen');
    const passwordInput = document.getElementById('passwordInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const errorMsg = document.getElementById('errorMsg');

    // ★ここでパスワードを設定します
    const CORRECT_PASSWORD = "stf02055"; 

    // ロック解除の処理
    const checkPassword = () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            // パスワード正解
            lockScreen.classList.add('is-unlocked');
            // セッションストレージに保存（ブラウザを閉じるまでロック解除状態を維持）
            sessionStorage.setItem('isUnlocked', 'true');
        } else {
            // パスワード不正解
            errorMsg.textContent = "Password is incorrect.";
            passwordInput.value = "";
            // 入力欄を揺らすアニメーション（おまけ）
            passwordInput.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 200 });
        }
    };

    if (lockScreen) {
        // すでに解除済みかチェック（ページ遷移してもロックされないようにする）
        if (sessionStorage.getItem('isUnlocked') === 'true') {
            lockScreen.classList.add('is-unlocked'); // 最初から隠す
        } else {
            // ボタンクリックで判定
            unlockBtn.addEventListener('click', checkPassword);

            // Enterキーでも判定
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    checkPassword();
                }
            });
        }
    }

});