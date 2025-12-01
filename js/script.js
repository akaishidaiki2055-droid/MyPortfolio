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
       2. Scroll Animations (Universal Fade-in)
       ========================================= */
    // 監視対象：.js-fade クラスを持つすべての要素
    // ※以前の .process-step も対象に含めたい場合は、HTML側でクラスを追加するか、
    //   ここで document.querySelectorAll('.js-fade, .process-step') と書きます。
    //   今回は「.js-fade」に統一する運用を推奨します。
    const fadeElements = document.querySelectorAll('.js-fade');

    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // 画面の下端から50px入ったら発火（少し早めに見せる）
            threshold: 0.1 // 要素の10%が見えたら発火
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // 一度表示されたら監視を解除（パフォーマンス向上＆再アニメーション防止）
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach((el) => {
            observer.observe(el);
        });
    }

    /* =========================================
       3. Password Protection (パスワードロック & リダイレクト)
       ========================================= */
    const lockScreen = document.getElementById('lockScreen');
    const passwordInput = document.getElementById('passwordInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const errorMsg = document.getElementById('errorMsg');

    // ★パスワード設定
    const CORRECT_PASSWORD = "stf02055"; 

    // 現在のページが index.html かどうかを判定
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

    // 認証済みかどうかのチェック
    const isUnlocked = sessionStorage.getItem('isUnlocked') === 'true';

    // ▼▼ リダイレクト処理 ▼▼
    // 「認証されておらず」かつ「indexページではない」場合
    if (!isUnlocked && !isIndexPage) {
        // index.html に強制転送
        window.location.href = 'index.html';
    }
    // ▲▲ ここまで ▲▲

    // ロック解除の処理（index.html用）
    const checkPassword = () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            lockScreen.classList.add('is-unlocked');
            sessionStorage.setItem('isUnlocked', 'true');
        } else {
            errorMsg.textContent = "Password is incorrect.";
            passwordInput.value = "";
            passwordInput.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 200 });
        }
    };

    // ロック画面の制御（index.htmlにロック画面がある場合のみ実行）
    if (lockScreen) {
        if (isUnlocked) {
            lockScreen.classList.add('is-unlocked'); // すでに認証済みなら隠す
        } else {
            unlockBtn.addEventListener('click', checkPassword);
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

    /* =========================================
       5. Smart Navbar (Scroll Detection)
       ========================================= */
    const navbar = document.getElementById('mainNav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // 一番上にいる時は常に表示
        if (currentScrollY <= 0) {
            navbar.classList.remove('nav-hidden');
            return;
        }

        // 下にスクロール かつ 一定以上スクロールしたら隠す
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('nav-hidden');
        } 
        // 上にスクロールしたら出す
        else if (currentScrollY < lastScrollY) {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
    });

    /* =========================================
       6. Mobile Menu Toggle (Prevent Jump)
       ========================================= */
    const workLink = document.querySelector('.has-dropdown > a');
    const dropdownParent = document.querySelector('.has-dropdown');

    if (workLink && dropdownParent) {
        workLink.addEventListener('click', (e) => {
            // 画面幅が600px以下（スマホ）の場合のみ実行
            if (window.innerWidth <= 600) {
                // 1. 本来のリンク移動（index.htmlへの遷移）をキャンセル
                e.preventDefault();

                // 2. クラスを付け外ししてメニューを開閉
                dropdownParent.classList.toggle('menu-open');
            }
        });

        // メニュー以外の場所をタップしたら閉じる（UX向上）
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 600) {
                // タップした場所がメニューの中でなければ閉じる
                if (!dropdownParent.contains(e.target)) {
                    dropdownParent.classList.remove('menu-open');
                }
            }
        });
    }

    /* =========================================
       7. Image Slider Logic (Swipe & Click)
       ========================================= */
    const sliderContainer = document.getElementById('projectSlider');

    if (sliderContainer) {
        const track = sliderContainer.querySelector('.slider-track');
        const slides = Array.from(track.children);
        const nextBtn = sliderContainer.querySelector('.next');
        const prevBtn = sliderContainer.querySelector('.prev');
        const indicatorsContainer = sliderContainer.querySelector('.slider-indicators');
        const indicators = Array.from(indicatorsContainer.children);

        let currentIndex = 0;

        // スライドを移動させる関数
        const moveToSlide = (index) => {
            // インデックスの範囲制限
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;

            // インジケーターの更新
            indicators.forEach((ind, i) => {
                if (i === currentIndex) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
        };

        // クリックイベント
        if (nextBtn) nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
        if (prevBtn) prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));

        // インジケータークリック
        indicators.forEach((ind, i) => {
            ind.addEventListener('click', () => moveToSlide(i));
        });

        // --- スマホ用スワイプ機能 ---
        let touchStartX = 0;
        let touchEndX = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 50; // 50px以上動かしたらスワイプとみなす
            if (touchEndX < touchStartX - threshold) {
                // 左スワイプ -> 次へ
                moveToSlide(currentIndex + 1);
            } else if (touchEndX > touchStartX + threshold) {
                // 右スワイプ -> 前へ
                moveToSlide(currentIndex - 1);
            }
        };
    }

    /* =========================================
       8. Accordion Internal Close Button
       ========================================= */
    const internalCloseBtns = document.querySelectorAll('.internal-close-btn');

    internalCloseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 親のdetails要素を探す
            const details = btn.closest('details');
            
            if (details) {
                // 1. 閉じる
                details.removeAttribute('open');
                
                // 2. アコーディオンのトップ位置までスクロールして戻す（迷子防止）
                const rect = details.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // ヘッダーの高さ(約100px) + 余白分を引いた位置へ
                const targetTop = rect.top + scrollTop - 120;

                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =========================================
       9. Achievements Slider (Card Scroll)
       ========================================= */
    const achSlider = document.getElementById('achievementsSlider');
    
    if (achSlider) {
        const achTrack = achSlider.querySelector('.achievements-track');
        const achPrev = document.querySelector('.ach-btn.prev');
        const achNext = document.querySelector('.ach-btn.next');
        
        if (achTrack && achPrev && achNext) {
            // カードの幅 + gap(30px) を取得してスクロール量にする
            const getScrollAmount = () => {
                const card = achTrack.querySelector('.achievement-card');
                return card ? card.offsetWidth + 30 : 430;
            };

            achNext.addEventListener('click', () => {
                achTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });

            achPrev.addEventListener('click', () => {
                achTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });
        }
    }

});