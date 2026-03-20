/* =============================================
   ONE OF A KIND - main.js
      機能:
         1. Hero星空アニメーション (Star particles)
            2. スクロール連動フェードイン (IntersectionObserver)
               3. ステップ遅延アニメーション
                  ============================================= */

                  /* ---------- 1. HERO STAR PARTICLES ---------- */
                  function initStars() {
                    const container = document.getElementById('heroAnim');
                      if (!container) return;

                        const COUNT = 120;

                          for (let i = 0; i < COUNT; i++) {
                              const star = document.createElement('span');
                                  star.classList.add('star');

                                      const size   = Math.random() * 3 + 1;          // 1〜4px
                                          const x      = Math.random() * 100;             // %
                                              const y      = Math.random() * 100;             // %
                                                  const dur    = (Math.random() * 4 + 2).toFixed(2); // 2〜6s
                                                      const delay  = (Math.random() * 5).toFixed(2);  // 0〜5s delay

                                                          star.style.cssText = `
                                                                width: ${size}px;
                                                                      height: ${size}px;
                                                                            left: ${x}%;
                                                                                  top: ${y}%;
                                                                                        --dur: ${dur}s;
                                                                                              animation-delay: ${delay}s;
                                                                                                  `;

                                                                                                      container.appendChild(star);
                                                                                                        }
                                                                                                        }
                                                                                                        
                                                                                                        /* ---------- 2. SCROLL FADE-IN (IntersectionObserver) ---------- */
                                                                                                        function initScrollReveal() {
                                                                                                          const targets = document.querySelectorAll('.step, .gem-card, .price-card');
                                                                                                          
                                                                                                            if (!targets.length) return;
                                                                                                            
                                                                                                              const observer = new IntersectionObserver((entries) => {
                                                                                                                  entries.forEach((entry, idx) => {
                                                                                                                        if (entry.isIntersecting) {
                                                                                                                                // ステップカードは順番に遅延させる
                                                                                                                                        const delay = entry.target.dataset.step
                                                                                                                                                  ? (parseInt(entry.target.dataset.step) - 1) * 120
                                                                                                                                                            : idx * 80;
                                                                                                                                                            
                                                                                                                                                                    setTimeout(() => {
                                                                                                                                                                              entry.target.classList.add('visible');
                                                                                                                                                                                      }, delay);
                                                                                                                                                                                      
                                                                                                                                                                                              observer.unobserve(entry.target);
                                                                                                                                                                                                    }
                                                                                                                                                                                                        });
                                                                                                                                                                                                          }, {
                                                                                                                                                                                                              threshold: 0.15,
                                                                                                                                                                                                                  rootMargin: '0px 0px -60px 0px'
                                                                                                                                                                                                                    });
                                                                                                                                                                                                                    
                                                                                                                                                                                                                      targets.forEach(el => observer.observe(el));
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                      
                                                                                                                                                                                                                      /* ---------- 3. SMOOTH NAV HIGHLIGHT ---------- */
                                                                                                                                                                                                                      function initNavHighlight() {
                                                                                                                                                                                                                        const sections = document.querySelectorAll('section[id]');
                                                                                                                                                                                                                          const navLinks = document.querySelectorAll('#footer nav a');
                                                                                                                                                                                                                          
                                                                                                                                                                                                                            if (!sections.length || !navLinks.length) return;
                                                                                                                                                                                                                            
                                                                                                                                                                                                                              const io = new IntersectionObserver((entries) => {
                                                                                                                                                                                                                                  entries.forEach(entry => {
                                                                                                                                                                                                                                        if (entry.isIntersecting) {
                                                                                                                                                                                                                                                navLinks.forEach(link => {
                                                                                                                                                                                                                                                          link.style.color = link.getAttribute('href').includes(entry.target.id)
                                                                                                                                                                                                                                                                      ? '#c9a84c'
                                                                                                                                                                                                                                                                                  : '';
                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                      }, { threshold: 0.4 });
                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                        sections.forEach(s => io.observe(s));
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                        /* ---------- INIT ---------- */
                                                                                                                                                                                                                                                                                                        document.addEventListener('DOMContentLoaded', () => {
                                                                                                                                                                                                                                                                                                          initStars();
                                                                                                                                                                                                                                                                                                            initScrollReveal();
                                                                                                                                                                                                                                                                                                              initNavHighlight();
                                                                                                                                                                                                                                                                                                              });
