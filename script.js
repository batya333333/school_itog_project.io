function scrollTo(to, duration = 700) {
    const
        element = document.scrollingElement || document.documentElement,
        start = element.scrollTop,
        change = to - start,
        startDate = +new Date(),
        // t = current time
        // b = start value
        // c = change in value
        // d = duration
        easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        animateScroll = function () {
            const currentDate = +new Date();
            const currentTime = currentDate - startDate;
            element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
            if (currentTime < duration) {
                requestAnimationFrame(animateScroll);
            }
            else {
                element.scrollTop = to;
            }
        };
    animateScroll();
}

document.addEventListener('DOMContentLoaded', function () {
    let btn = document.querySelector('#toTop');
    window.addEventListener('scroll', function () {
        // Если прокрутили дальше 599px, показываем кнопку
        if (pageYOffset > 100) {
            btn.classList.add('show');
            // Иначе прячем
        } else {
            btn.classList.remove('show');
        }
    });

    // При клике прокручиываем на самый верх
    btn.onclick = function (click) {
        click.preventDefault();
        scrollTo(0, 400);
    }
});


// translator.js
class UniversalTranslator {
    constructor() {
        this.isEnglish = localStorage.getItem('globalTranslationState') === 'true';
        this.originalContents = new Map();
        this.translationCache = new Map();
        this.init();
    }

    init() {
        this.loadCache();
        
        // Если мы на index.html - обновляем кнопку
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            this.updateTranslateLink();
        }
        
        // Если перевод включен - переводим текущую страницу
        if (this.isEnglish) {
            setTimeout(() => {
                this.translateToEnglish();
            }, 500);
        }
    }

    updateTranslateLink() {
        const link = document.getElementById('translate-link');
        if (link) {
            link.textContent = this.isEnglish ? 'RU' : 'ENG';
        }
    }

    async toggleTranslation(event) {
        if (event) event.preventDefault();
        
        if (this.isEnglish) {
            this.resetToRussian();
        } else {
            await this.translateToEnglish();
        }
        
        this.isEnglish = !this.isEnglish;
        localStorage.setItem('globalTranslationState', this.isEnglish);
        
        // Обновляем кнопку только если мы на index.html
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            this.updateTranslateLink();
        }
    }

    async translateToEnglish() {
        const elementsToTranslate = this.getTranslatableSelectors();
        
        for (const selector of elementsToTranslate) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                await this.safeTranslateElement(element);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }
        
        this.saveCache();
    }

    getTranslatableSelectors() {
        return [
            '.menu-items a',
            '.main_about h1',
            '.main_about p',
            '.main_about h4 a',
            '.container_cards h1',
            '.article-body h2',
            '.article-body p',
            '.article-body a',
            '.marshrut_torist h1',
            '.marshrut_torist a',
            '.about_city h1',
            '.about_body h2',
            '.about_body p',
            '.content h1',
            '.info a',
            '.part',
            '.osnov h1',
            '.osnov p',
            '.history h1',
            '.history p', 
            '.culture h1',
            '.culture p',
            '.architect h1',
            '.architect p',
            '.cl h1',
            '.cl p',
            '.tr h1',
            '.tr p',
            '.fest h1',
            '.fest p',
            '.cith h1',
            '.cith p',
            // tm
            '.name h1',
            '.yousee h2',
            '.sp a',
            '.carousel-caption h1',
            '.carousel-caption p',
            '.section_1 h2',
            '.section_1 p',
            '.section_1 a',
            '.section_2 h2',
            '.section_2 p',
            '.section_2 a',
            '.section_3 h2',
            '.section_3 p',
            '.section_3 a',
            '.section_4 h2',
            '.section_4 p',
            '.section_4 a',
            '.section_5 h2',
            '.section_5 p',
            '.section_5 a',
            '.section_6 h2',
            '.section_6 p',
            '.section_6 a',
            '.section_7 h2',
            '.section_7 p',
            '.section_7 a',
            '.section_8 h2',
            '.section_8 p',
            '.section_8 a',
            '.section_9 h2',
            '.section_9 p',
            '.section_9 a',
            '.section1_text h2',
            '.section1_text p',
            '.section1_text a',
            '.section2_text h2',
            '.section2_text p',
            '.section2_text a',
            '.section3_text h2',
            '.section3_text p',
            '.section3_text a',
            '.section4_text h2',
            '.section4_text p',
            '.section4_text a',
            '.section5_text h2',
            '.section5_text p',
            '.section5_text a',
            '.section6_text h2',
            '.section6_text p',
            '.section6_text a',
            '.section7_text h2',
            '.section7_text p',
            '.section7_text a',
            '.section8_text h2',
            '.section8_text p',
            '.section8_text a',
            '.section9_text h2',
            '.section9_text p',
            '.section9_text a',
            '.menu-items a',
            '.navbar a',
            // monuments
            '.featurette-heading',
            '.featurette h2',
            '.featurette p',
            '.lead',
            '.featurette-divider',
            '.ab',
            '.float-end a',
            '.container a',
            'footer a',
        
        ];
    }

    async safeTranslateElement(element) {
        const originalText = element.textContent.trim();
        if (!originalText || originalText.length < 2) return;

        try {
            if (!this.originalContents.has(element)) {
                this.originalContents.set(element, {
                    text: originalText,
                    html: element.innerHTML,
                    href: element.getAttribute('href')
                });
            }

            const cacheKey = this.generateHash(originalText);
            let translatedText;

            if (this.translationCache.has(cacheKey)) {
                translatedText = this.translationCache.get(cacheKey);
            } else {
                translatedText = await this.googleTranslate(originalText);
                this.translationCache.set(cacheKey, translatedText);
            }

            const originalHref = element.getAttribute('href');
            element.textContent = translatedText;
            if (originalHref) {
                element.setAttribute('href', originalHref);
            }

        } catch (error) {
            console.error('Translation error:', error);
        }
    }

    resetToRussian() {
        this.originalContents.forEach((original, element) => {
            if (element.isConnected) {
                element.innerHTML = original.html;
            }
        });
    }

    generateHash(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 't_' + Math.abs(hash).toString(36);
    }

    async googleTranslate(text) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0].map(item => item[0]).join('');
    }

    saveCache() {
        const cacheObj = Object.fromEntries(this.translationCache);
        localStorage.setItem('translationCache', JSON.stringify(cacheObj));
    }

    loadCache() {
        const cached = localStorage.getItem('translationCache');
        if (cached) {
            const cacheObj = JSON.parse(cached);
            this.translationCache = new Map(Object.entries(cacheObj));
        }
    }
}

// Создаем глобальный экземпляр
const translator = new UniversalTranslator();

// Глобальная функция для HTML
function toggleTranslation(event) {
    translator.toggleTranslation(event);
}