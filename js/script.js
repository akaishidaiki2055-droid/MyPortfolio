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

    /* =========================================
       4. Image Lightbox with Zoom & Pan
       ========================================= */
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomableImages = document.querySelectorAll('.js-zoomable img');

    if (lightbox && lightboxImg) {
        let scale = 1;
        let pointX = 0;
        let pointY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        // 画像の変形を適用する関数
        const updateTransform = () => {
            lightboxImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
        };

        // ライトボックスを開く
        zoomableImages.forEach(img => {
            img.parentElement.addEventListener('click', (e) => {
                e.preventDefault(); // デフォルト動作防止
                lightboxImg.src = img.src;
                lightbox.classList.add('is-open');
                // リセット
                scale = 1;
                pointX = 0;
                pointY = 0;
                updateTransform();
            });
        });

        // ライトボックスを閉じる
        const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            setTimeout(() => { lightboxImg.src = ""; }, 300); // アニメーション後にクリア
        };

        lightboxClose.addEventListener('click', closeLightbox);
        
        // 背景クリックで閉じる（画像自体クリックでは閉じない）
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });

        /* --- ズーム機能 (Wheel) --- */
        lightbox.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.001; // 感度調整
            const newScale = Math.min(Math.max(1, scale + delta), 5); // 1倍〜5倍に制限
            scale = newScale;
            
            // 縮小しきったら位置もリセット
            if (scale === 1) { pointX = 0; pointY = 0; }
            
            updateTransform();
        });

        /* --- ドラッグ移動機能 (Mouse) --- */
        lightboxImg.addEventListener('mousedown', (e) => {
            if (scale > 1) { // 拡大中のみ移動可能
                isDragging = true;
                startX = e.clientX - pointX;
                startY = e.clientY - pointY;
                e.preventDefault(); // 画像ドラッグ防止
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                pointX = e.clientX - startX;
                pointY = e.clientY - startY;
                updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        /* --- スマホ用ピンチズーム & タッチ移動 --- */
        let initialDistance = 0;
        let initialScale = 1;

        lightboxImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // ピンチ開始
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = scale;
            } else if (e.touches.length === 1 && scale > 1) {
                // ドラッグ開始
                isDragging = true;
                startX = e.touches[0].clientX - pointX;
                startY = e.touches[0].clientY - pointY;
            }
        });

        lightboxImg.addEventListener('touchmove', (e) => {
            e.preventDefault(); // スクロール防止

            if (e.touches.length === 2) {
                // ピンチ中
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const diff = currentDistance / initialDistance;
                scale = Math.min(Math.max(1, initialScale * diff), 5);
                updateTransform();
            } else if (e.touches.length === 1 && isDragging) {
                // ドラッグ中
                pointX = e.touches[0].clientX - startX;
                pointY = e.touches[0].clientY - startY;
                updateTransform();
            }
        });

        lightboxImg.addEventListener('touchend', () => {
            isDragging = false;
            if (scale < 1) { scale = 1; updateTransform(); } // 戻り防止
        });
    }

});