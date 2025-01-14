document.addEventListener('DOMContentLoaded', function() {
    // 显示欢迎提示
    if ("Notification" in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                new Notification("欢迎来到御风大学!", {
                    icon: "img/School.png",
                    silent: true
                });
            }
        });
    }

    // 显示自定义欢迎提示
    const welcomeToast = document.querySelector('.welcome-toast');
    welcomeToast.classList.add('show');
    
    // 3秒后隐藏提示
    setTimeout(() => {
        welcomeToast.classList.remove('show');
    }, 3000);

    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    
    // 复制主导航内容到移动端菜单
    const mainNav = document.querySelector('.main-nav').innerHTML;
    document.querySelector('.mobile-menu-content').innerHTML = mainNav;
    
    // 切换移动端菜单
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        menuToggle.style.display = 'none';
    });
    
    closeMenu.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        menuToggle.style.display = 'block';
    });
    
    // 快捷导航功能
    const quickNavToggle = document.querySelector('.quick-nav-toggle');
    const quickNavMenu = document.querySelector('.quick-nav-menu');

    // 切换快捷导航显示
    quickNavToggle.addEventListener('click', function() {
        quickNavMenu.classList.toggle('active');
        // 将按钮改为激活状态
        this.classList.toggle('active');
    });

    // 生成快捷导航内容
    function generateQuickNavContent() {
        const navContent = document.querySelector('.quick-nav-content');
        const mainNav = document.querySelector('.main-nav');
        let html = '';

        mainNav.querySelectorAll('.dropdown').forEach(dropdown => {
            const title = dropdown.querySelector('.dropbtn').textContent;
            const links = dropdown.querySelector('.dropdown-content');
            
            if (links) {
                html += `
                    <div class="quick-nav-section">
                        <h3>${title}</h3>
                        ${links.innerHTML}
                    </div>
                `;
            }
        });

        navContent.innerHTML = html;
    }

    // 初始化快捷导航内容
    generateQuickNavContent();

    // 为所有链接添加点击事件
    document.querySelectorAll('a').forEach(link => {
        // 仅处理没有href或href为#的链接
        if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                // 在这里可以添加自定义的点击处理逻辑
                console.log('Link clicked:', this.textContent);
            });
        }
    });

    // 添加校园风景图片查看功能
    const campusViewLink = document.querySelector('.campus-view');
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'campus-image-modal';
    modal.innerHTML = `
        <div class="campus-image-container">
            <button class="close-image-modal">×</button>
            <img src="img/campus.jpg" alt="校园风景">
        </div>
    `;
    document.body.appendChild(modal);

    // 点击链接显示图片
    campusViewLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
    });

    // 点击关闭按钮或模态框外部关闭图片
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('close-image-modal')) {
            modal.classList.remove('active');
        }
    });

    // 按ESC键关闭图片
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    // 轮播图功能
    const carousel = {
        currentSlide: 0,
        slides: document.querySelectorAll('.slide'),
        indicators: document.querySelectorAll('.indicator'),
        prevButton: document.querySelector('.carousel-button.prev'),
        nextButton: document.querySelector('.carousel-button.next'),
        autoPlayInterval: null,
        isPlaying: true,
        playPauseBtn: null,
        slidesContainer: document.querySelector('.carousel-slides'),
        isAnimating: false,

        init() {
            if (this.slides.length === 0) return;

            // 克隆第一张和最后一张图片用于无缝循环
            const firstSlideClone = this.slides[0].cloneNode(true);
            const lastSlideClone = this.slides[this.slides.length - 1].cloneNode(true);
            this.slidesContainer.appendChild(firstSlideClone);
            this.slidesContainer.insertBefore(lastSlideClone, this.slides[0]);

            // 设置初始位置
            this.currentSlide = 1;
            this.updateSlidePosition(false);

            // 等待所有图片加载完成
            Promise.all(Array.from(this.slidesContainer.querySelectorAll('img')).map(img => {
                return img.complete ? Promise.resolve() : new Promise(resolve => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', resolve);
                });
            })).then(() => {
                document.querySelector('.loading-overlay').style.display = 'none';
                this.addPlayPauseButton();
                this.setupEventListeners();
                this.startAutoPlay();
            });
        },

        updateSlidePosition(animate = true) {
            if (!animate) {
                this.slidesContainer.style.transition = 'none';
            }
            const position = -this.currentSlide * 100;
            this.slidesContainer.style.transform = `translateX(${position}%)`;
            if (!animate) {
                // 强制重排
                this.slidesContainer.offsetHeight;
                this.slidesContainer.style.transition = 'transform 0.5s ease-in-out';
            }
        },

        showSlide(index, direction = 'next') {
            if (this.isAnimating) return;
            this.isAnimating = true;

            this.currentSlide = index;
            this.updateSlidePosition();

            // 更新指示器
            if (this.indicators.length > 0) {
                const actualIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
                this.indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === actualIndex);
                });
            }

            // 处理无缝循环
            setTimeout(() => {
                this.isAnimating = false;
                if (this.currentSlide === 0) {
                    this.currentSlide = this.slides.length;
                    this.updateSlidePosition(false);
                } else if (this.currentSlide === this.slides.length + 1) {
                    this.currentSlide = 1;
                    this.updateSlidePosition(false);
                }
            }, 500);
        },

        nextSlide() {
            if (!this.isAnimating) {
                this.showSlide(this.currentSlide + 1, 'next');
            }
        },

        prevSlide() {
            if (!this.isAnimating) {
                this.showSlide(this.currentSlide - 1, 'prev');
            }
        },

        addPlayPauseButton() {
            this.playPauseBtn = document.createElement('button');
            this.playPauseBtn.className = 'carousel-button play-pause';
            this.playPauseBtn.innerHTML = '❚❚';
            this.playPauseBtn.style.right = '80px';
            this.playPauseBtn.style.top = '20px';
            
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
            document.querySelector('.carousel-container').appendChild(this.playPauseBtn);
        },

        togglePlayPause() {
            this.isPlaying = !this.isPlaying;
            this.playPauseBtn.innerHTML = this.isPlaying ? '❚❚' : '►';
            
            if (this.isPlaying) {
                this.startAutoPlay();
            } else {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                    this.autoPlayInterval = null;
                }
            }
        },

        startAutoPlay() {
            if (this.isPlaying && !this.autoPlayInterval) {
                this.autoPlayInterval = setInterval(() => {
                    if (this.isPlaying) {
                        this.nextSlide();
                    }
                }, 5000);
            }
        },

        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        },

        setupEventListeners() {
            // 上一张/下一张按钮
            if (this.prevButton) {
                this.prevButton.addEventListener('click', () => this.prevSlide());
            }
            
            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => this.nextSlide());
            }

            // 指示器点击
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.showSlide(index + 1));
            });

            // 键盘控制
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });

            // 触摸滑动支持
            const container = document.querySelector('.carousel-container');
            let touchStartX = 0;
            let touchEndX = 0;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                touchEndX = e.touches[0].clientX;
            }, { passive: true });

            container.addEventListener('touchend', () => {
                const threshold = 50;
                const deltaX = touchEndX - touchStartX;

                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        this.prevSlide();
                    } else {
                        this.nextSlide();
                    }
                }
            });
        }
    };

    // 初始化轮播图
    carousel.init();
});
