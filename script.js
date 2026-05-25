// Force manual scroll restoration immediately to block browser jumps on mobile refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Bulletproof scroll-to-top handler for both mobile and desktop on refresh
function forceScrollToTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// Run immediately and also on standard load events
forceScrollToTop();
window.addEventListener('load', forceScrollToTop);
// Mobile browsers delay to guarantee scroll snap override
setTimeout(forceScrollToTop, 50);
setTimeout(forceScrollToTop, 150);

document.addEventListener('DOMContentLoaded', () => {
    // Make sure we start at the top on DOM completion
    forceScrollToTop();

    // -------------------------------------------------------------
    // 1. Navigation & Header scrolled status
    // -------------------------------------------------------------
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile burger toggle menu
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const active = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', active);
        });

        // Close burger menu when navigating to section
        document.querySelectorAll('.nav-menu a, .nav-menu button').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
            });
        });
    }

    // -------------------------------------------------------------
    // 2. Cinematic Video Cross-Fader & Section Indicators
    // -------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    const bgVideos = document.querySelectorAll('.bg-video-wrapper');
    const indicators = document.querySelectorAll('.indicator-dot');

    const sectionToVideo = {
        'hero': 'video-scene-1',
        'intro': 'video-scene-3',
        'demo': 'video-scene-4',
        'growth': 'video-scene-5',
        'features': 'video-scene-5', // shares Scene 5 background for transition continuity
        'pricing': 'video-scene-7',
        'cta': 'video-scene-8'
    };

    // Store state of running timeouts to cancel inactive video triggers
    const videoPauseTimeouts = {};
    let isAudioMuted = true; // all videos start muted to conform to autoplay standards
    
    // Check if the current browser is running on a touch-enabled mobile device
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    function crossfadeBackground(sectionId) {
        const targetVideoId = sectionToVideo[sectionId];
        
        bgVideos.forEach(wrapper => {
            const video = wrapper.querySelector('video');
            if (wrapper.id === targetVideoId) {
                // Cancel pending pauses for this video if any
                if (videoPauseTimeouts[wrapper.id]) {
                    clearTimeout(videoPauseTimeouts[wrapper.id]);
                    delete videoPauseTimeouts[wrapper.id];
                }
                
                wrapper.classList.add('active');
                if (video) {
                    video.muted = isAudioMuted; // set dynamic audio state on viewport focus
                    video.currentTime = 0; // reset video to play from the beginning on scroll enter
                    video.play().catch(err => {
                        console.warn("Video playback interrupted/blocked on scroll transition: ", err);
                    });
                }
            } else {
                wrapper.classList.remove('active');
                if (video) {
                    video.muted = true; // force-mute background files instantly to prevent noise leaks
                }
                
                // Pause background videos after the opacity fade transition completes to conserve CPU & GPU.
                if (!isMobile && video && !video.paused && !videoPauseTimeouts[wrapper.id]) {
                    videoPauseTimeouts[wrapper.id] = setTimeout(() => {
                        if (!wrapper.classList.contains('active')) {
                            video.pause();
                        }
                        delete videoPauseTimeouts[wrapper.id];
                    }, 1200); // matches CSS fade speed
                }
            }
        });
    }

    function updateNavIndicators(sectionId) {
        indicators.forEach(dot => {
            if (dot.getAttribute('data-section') === sectionId) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // High-performance scroll center calculation for instant video transitions
    let currentActiveId = 'hero';

    function handleScrollSectionCheck() {
        let activeSection = null;
        let minDistance = Infinity;
        const viewportCenter = window.innerHeight / 2;

        sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            const sectionCenter = rect.top + (rect.height / 2);
            const distance = Math.abs(sectionCenter - viewportCenter);

            if (distance < minDistance) {
                minDistance = distance;
                activeSection = sec;
            }
        });

        if (activeSection && activeSection.id !== currentActiveId) {
            currentActiveId = activeSection.id;
            crossfadeBackground(currentActiveId);
            updateNavIndicators(currentActiveId);
            
            // Trigger auto scroll countdown reset and sync
            if (isAutoPlayActive) {
                startAutoScrollTimer(currentActiveId);
            }
        }
    }

    // Throttled scroll listener using requestAnimationFrame for zero-lag 60fps scrolling
    let scrollChecking = false;
    window.addEventListener('scroll', () => {
        if (!scrollChecking) {
            window.requestAnimationFrame(() => {
                handleScrollSectionCheck();
                scrollChecking = false;
            });
            scrollChecking = true;
        }
    });

    // Run once on load to initialize first section states
    handleScrollSectionCheck();

    // Smooth Scroll indicator dots trigger click events
    indicators.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                pauseAutoPlayOnInteraction(); // pause autoplay on custom navigations
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // -------------------------------------------------------------
    // 3. Cinematic Auto Scroll (Auto Play Tour) Engine
    // -------------------------------------------------------------
    const autoScrollToggle = document.getElementById('autoScrollToggle');
    const autoScrollText = document.getElementById('autoScrollText');
    const progressRing = document.getElementById('autoScrollProgressRing');
    
    let isAutoPlayActive = true; // Auto Play starts ON natively
    let autoScrollIntervalId = null;
    let autoScrollProgressValue = 0;
    
    // Circle circumference for SVG progress ring (2 * PI * r = 2 * 3.14159 * 8 = 50.26)
    const CIRCUMFERENCE = 2 * Math.PI * 8;
    if (progressRing) {
        progressRing.style.strokeDasharray = CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = CIRCUMFERENCE;
    }

    // Map section IDs to standard slideshow display durations in milliseconds
    const sectionDurations = {
        'hero': 8000,
        'intro': 9000,
        'demo': 15000, // longer duration to let WhatsApp demo run several messages
        'growth': 9000,
        'features': 10000,
        'pricing': 8000,
        'cta': null // stops at last CTA section
    };
    
    // Sequential section order array
    const sectionOrder = ['hero', 'intro', 'demo', 'growth', 'features', 'pricing', 'cta'];

    function startAutoScrollTimer(sectionId) {
        stopAutoScrollTimer();
        
        const duration = sectionDurations[sectionId];
        if (!duration || !isAutoPlayActive) {
            setProgressRing(0);
            return;
        }
        
        let elapsed = 0;
        const intervalStep = 50; // update progress ring every 50ms for smooth linear animation
        
        autoScrollIntervalId = setInterval(() => {
            elapsed += intervalStep;
            autoScrollProgressValue = Math.min((elapsed / duration), 1);
            
            setProgressRing(autoScrollProgressValue);
            
            if (elapsed >= duration) {
                clearInterval(autoScrollIntervalId);
                scrollToNextSection(sectionId);
            }
        }, intervalStep);
    }

    function stopAutoScrollTimer() {
        if (autoScrollIntervalId) {
            clearInterval(autoScrollIntervalId);
            autoScrollIntervalId = null;
        }
    }

    function setProgressRing(percent) {
        if (!progressRing) return;
        const offset = CIRCUMFERENCE - (percent * CIRCUMFERENCE);
        progressRing.style.strokeDashoffset = offset;
    }

    function scrollToNextSection(currentSectionId) {
        const currentIndex = sectionOrder.indexOf(currentSectionId);
        if (currentIndex === -1 || currentIndex >= sectionOrder.length - 1) return;
        
        const nextSectionId = sectionOrder[currentIndex + 1];
        const nextSection = document.getElementById(nextSectionId);
        
        if (nextSection) {
            scrollChecking = true;
            nextSection.scrollIntoView({ behavior: 'smooth' });
            
            // Allow checking again after smooth scroll completes
            setTimeout(() => {
                scrollChecking = false;
            }, 1000);
        }
    }

    function pauseAutoPlayOnInteraction() {
        if (isAutoPlayActive) {
            isAutoPlayActive = false;
            stopAutoScrollTimer();
            if (autoScrollToggle) {
                autoScrollToggle.classList.add('paused');
            }
            if (autoScrollText) {
                autoScrollText.textContent = 'Auto: Paused';
            }
            setProgressRing(0);
        }
    }

    // Interactive toggles for Auto Play Dashboard Pill
    if (autoScrollToggle) {
        autoScrollToggle.addEventListener('click', () => {
            isAutoPlayActive = !isAutoPlayActive;
            autoScrollToggle.classList.toggle('paused', !isAutoPlayActive);
            
            if (isAutoPlayActive) {
                autoScrollText.textContent = 'Auto Play';
                startAutoScrollTimer(currentActiveId);
            } else {
                autoScrollText.textContent = 'Auto: Off';
                stopAutoScrollTimer();
                setProgressRing(0);
            }
        });
    }

    // Detect user manual interaction events to gracefully pause auto play
    window.addEventListener('wheel', pauseAutoPlayOnInteraction, { passive: true });
    window.addEventListener('touchmove', pauseAutoPlayOnInteraction, { passive: true });
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown'].includes(e.key)) {
            pauseAutoPlayOnInteraction();
        }
    }, { passive: true });

    // Initial startup call
    if (isAutoPlayActive) {
        startAutoScrollTimer('hero');
    }

    // -------------------------------------------------------------
    // 4. Scroll Blur-to-Sharp Text Reveal Transition
    // -------------------------------------------------------------
    const revealObserverOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px' // triggers slightly before entering the full viewport
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // -------------------------------------------------------------
    // 5. WhatsApp Interactive AI Demo Simulation
    // -------------------------------------------------------------
    const chatBody = document.getElementById('whatsapp-chat-body');
    const typingIndicator = document.getElementById('whatsapp-typing-indicator');
    const featureCards = document.querySelectorAll('.demo-feature-card');

    const conversationFlows = {
        replies: [
            { type: 'received', text: 'AOA, custom chat bot ki details mil sakti hain?', delay: 1200 },
            { type: 'sent', text: 'Walaikum Assalam! Conversiq AI mein khushamdeed. 🌟 Main aik fully custom AI agent hoon aur Roman Urdu, English ya pure Urdu sab samajh sakta hoon.', delay: 2200 },
            { type: 'received', text: 'Roman Urdu me support ksy chalti h?', delay: 1400 },
            { type: 'sent', text: 'Bilkul seamless! Main customer ka local dialect aur context exact catch kar ke simple language mein friendly answer deta hoon, bilkul aik expert sales rep ki tarah.', delay: 2400 }
        ],
        automation: [
            { type: 'received', text: 'Are you guys available right now to take my booking?', delay: 1000 },
            { type: 'sent', text: 'Yes, absolutely! 🏪 Main 24/7 online active hoon. Aap ka physical store band ho jaye phir bhi main chats handle aur sales book karta rehta hoon!', delay: 2200 },
            { type: 'received', text: 'Great! Secure a consultation slot for tomorrow.', delay: 1500 },
            { type: 'sent', text: 'Done! Slot booked successfully. 📅 Logged under Conversiq booking database. We look forward to talking tomorrow!', delay: 2000 }
        ],
        capture: [
            { type: 'received', text: 'Hi, I want to try Conversiq. Please register my business.', delay: 1000 },
            { type: 'sent', text: 'Wonderful! ⚡ May I please have your Full Name and business category to log your profile details?', delay: 2000 },
            { type: 'received', text: 'Hammad Khan, E-commerce Store.', delay: 1400 },
            { type: 'sent', text: 'Logged! 📝 [Sync Success: Hammad Khan | E-commerce Store]. Details automatically synced directly to BITSOL lead manager sheet. Our team will contact you in a few minutes!', delay: 2400 }
        ]
    };

    let activeFlowKey = 'replies';
    let simulationActive = true;
    let currentFlowTimeout = null;

    // Helper utility to introduce asynchronous delays
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function playWhatsAppFlow(flowKey) {
        if (!simulationActive) return;
        
        clearTimeout(currentFlowTimeout);
        chatBody.innerHTML = '';
        activeFlowKey = flowKey;

        // Sync visual highlighted card
        featureCards.forEach(card => {
            if (card.getAttribute('data-flow') === flowKey) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        const messages = conversationFlows[flowKey];
        
        for (let i = 0; i < messages.length; i++) {
            if (!simulationActive || activeFlowKey !== flowKey) return;
            
            const msg = messages[i];
            await sleep(800); // realistic gap before message starts

            if (msg.type === 'sent') {
                typingIndicator.style.display = 'flex';
                chatBody.scrollTop = chatBody.scrollHeight;
                await sleep(msg.delay); // simulate text composition timing
                typingIndicator.style.display = 'none';
            } else {
                await sleep(500); // minor buffer for user reading/typing
            }

            if (!simulationActive || activeFlowKey !== flowKey) return;
            appendMessageBubble(msg.type, msg.text);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Loop automatically to the next section after a long reading pause
        const keys = Object.keys(conversationFlows);
        const nextIndex = (keys.indexOf(flowKey) + 1) % keys.length;
        
        currentFlowTimeout = setTimeout(() => {
            playWhatsAppFlow(keys[nextIndex]);
        }, 6000);
    }

    function appendMessageBubble(type, text) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble bubble-${type}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        bubble.innerHTML = `
            <div>${text.replace(/\n/g, '<br>')}</div>
            <span class="bubble-time">${timestamp}</span>
        `;
        
        chatBody.appendChild(bubble);
    }

    // Attach card click triggers to jump directly to specific features
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetFlow = card.getAttribute('data-flow');
            playWhatsAppFlow(targetFlow);
        });
    });

    // Start WhatsApp simulator on entry
    playWhatsAppFlow('replies');

    // -------------------------------------------------------------
    // 6. Interactive Mouse-Spotlight Glow Effect (Stripe/Apple Card Design)
    // -------------------------------------------------------------
    const featureBoxes = document.querySelectorAll('.feature-box, .stat-card');

    featureBoxes.forEach(box => {
        box.addEventListener('mousemove', (e) => {
            const rect = box.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            box.style.setProperty('--mouse-x', `${mouseX}px`);
            box.style.setProperty('--mouse-y', `${mouseY}px`);
        });
    });

    // -------------------------------------------------------------
    // 7. Lead Registration Upgraded WhatsApp Redirect Form & Success State
    // -------------------------------------------------------------
    const leadForm = document.getElementById('leadForm');
    const registrationModal = document.getElementById('registrationModal');
    
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('clientName').value.trim();
            const phoneInput = document.getElementById('clientPhone').value.trim();
            const categorySelect = document.getElementById('businessCategory').value;
            const volumeSelect = document.getElementById('chatVolume').value;
            
            if (!nameInput || !phoneInput || !categorySelect || !volumeSelect) return;

            // Trigger cinematic success screen transition within modal content
            const formState = document.getElementById('modalFormState');
            const successState = document.getElementById('modalSuccessState');
            
            if (formState && successState) {
                formState.style.opacity = '0';
                setTimeout(() => {
                    formState.style.display = 'none';
                    successState.style.display = 'flex';
                    // Trigger reflow to animate opacity transition
                    void successState.offsetWidth;
                    successState.classList.add('active');
                }, 300);
            }

            // Compile rich lead text for direct WhatsApp link
            const messageText = `Hi BITSOL Marketing! I saw the Conversiq AI Landing Page and I want to try it out. Please guide me on the next steps!\n\n*My Onboarding Details:*\n• *Name:* ${nameInput}\n• *WhatsApp Number:* ${phoneInput}\n• *Business Niche:* ${categorySelect}\n• *Monthly WhatsApp Volume:* ${volumeSelect}\n\nThank you!`;
            const encodedText = encodeURIComponent(messageText);
            
            const whatsappNumber = "923120141581"; 
            const directUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
            
            // Redirect after elegant checkmark pulse finishes animating
            setTimeout(() => {
                window.open(directUrl, '_blank');
                closeModal();

                // Cleanly reset modal form structure back to input state
                setTimeout(() => {
                    if (formState && successState) {
                        formState.style.display = 'block';
                        formState.style.opacity = '1';
                        successState.style.display = 'none';
                        successState.classList.remove('active');
                        leadForm.reset();
                    }
                }, 500);
            }, 2500);
        });
    }

    // -------------------------------------------------------------
    // 8. Popup Modal Activation Triggers
    // -------------------------------------------------------------
    const modalClose = document.getElementById('modalClose');

    function openModal() {
        if (registrationModal) {
            pauseAutoPlayOnInteraction(); // pause auto play when user starts registration
            registrationModal.classList.add('active');
            registrationModal.setAttribute('aria-hidden', 'false');
            document.documentElement.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (registrationModal) {
            registrationModal.classList.remove('active');
            registrationModal.setAttribute('aria-hidden', 'true');
            document.documentElement.style.overflow = 'initial';
        }
    }

    // Attach click listeners to all modal triggers globally
    document.querySelectorAll('.trigger-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (registrationModal) {
        registrationModal.addEventListener('click', (e) => {
            if (e.target === registrationModal) {
                closeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && registrationModal && registrationModal.classList.contains('active')) {
            closeModal();
        }
    });

    // -------------------------------------------------------------
    // 9. Cinematic Ambient Audio Controller Click Handler
    // -------------------------------------------------------------
    const soundToggle = document.getElementById('soundToggle');
    const soundText = document.getElementById('soundText');
    const soundIconOff = soundToggle?.querySelector('.sound-icon-off');
    const soundIconOn = soundToggle?.querySelector('.sound-icon-on');

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isAudioMuted = !isAudioMuted;
            soundToggle.classList.toggle('sound-on', !isAudioMuted);
            
            if (soundIconOff && soundIconOn) {
                soundIconOff.style.display = isAudioMuted ? 'block' : 'none';
                soundIconOn.style.display = isAudioMuted ? 'none' : 'block';
            }
            
            if (soundText) {
                soundText.textContent = isAudioMuted ? 'Sound: Off' : 'Sound: On';
            }
            
            bgVideos.forEach(wrapper => {
                const video = wrapper.querySelector('video');
                if (video) {
                    if (wrapper.classList.contains('active')) {
                        video.muted = isAudioMuted;
                        if (!isAudioMuted && video.paused) {
                            video.play().catch(e => console.log("Unmute play retry blocked: ", e));
                        }
                    } else {
                        video.muted = true;
                    }
                }
            });
        });
    }
});
