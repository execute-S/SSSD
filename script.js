// Disable context menu and dragstart globally on all images to prevent downloading
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Force scroll restoration to manual so page always starts at the top on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const navbar = document.getElementById('navbar');
    const headerLarge = document.getElementById('header-large');
    const headerSmall = document.getElementById('header-small');
    const sections = document.querySelectorAll('.mobile-section');
    const navItems = document.querySelectorAll('.bottom-nav-item');
    const socialTrigger = document.getElementById('social-trigger-btn');
    const socialMenu = document.getElementById('social-menu');
    const mobileCycleIcons = document.querySelectorAll('#social-trigger-btn .cycle-icon');
    const desktopCycleIcons = document.querySelectorAll('#desktop-social-trigger .cycle-icon');

    // --- State variables for continuous scrolling ---
    let scrollY = 0;
    let targetScrollY = 0;
    let activeTab = 'hero'; // Track the active tab section (starts with home/hero)
    const headerSpacer = document.querySelector('.header-spacer');

    let startHeight = window.innerHeight * 0.5; // 50vh initially
    const endHeight = 80; // Shrunk header height (80px)
    let scrollRange = startHeight - endHeight;

    // Recalculate dimensions on window resize to ensure fluid layouts
    window.addEventListener('resize', () => {
        startHeight = window.innerHeight * 0.5;
        scrollRange = startHeight - endHeight;
    });

    // Smooth animation loop using requestAnimationFrame
    function animate() {
        if (window.innerWidth >= 1024) {
            // Disable mobile scrolling/shrinking header behavior on desktop
            if (navbar) {
                navbar.style.height = '';
            }
            if (headerLarge) {
                headerLarge.style.opacity = '';
                headerLarge.style.transform = '';
                headerLarge.style.visibility = '';
                headerLarge.style.pointerEvents = '';
            }
            if (headerSmall) {
                headerSmall.style.opacity = '';
                headerSmall.style.transform = '';
                headerSmall.style.visibility = '';
                headerSmall.style.pointerEvents = '';
            }
            requestAnimationFrame(animate);
            return;
        }

        targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Linear Interpolation (Lerp) for butter-smooth scroll tracking
        scrollY += (targetScrollY - scrollY) * 0.1;
        
        if (activeTab === 'hero') {
            // Constrain scroll tracking to the transition zone [0, scrollRange]
            const currentScroll = Math.max(0, Math.min(scrollY, scrollRange));
            const progress = currentScroll / scrollRange; // 0 (top) to 1 (shrunk)

            // Calculate and apply dynamic header height
            const currentHeight = startHeight - currentScroll;
            if (navbar) {
                navbar.style.height = currentHeight + 'px';

                // Toggle scrolled class for box-shadow activation
                if (scrollY > 40) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Interpolate Large Banner (Fade out and slide up)
            if (headerLarge) {
                headerLarge.style.opacity = 1 - progress;
                headerLarge.style.transform = 'translate3d(0, ' + (-progress * 25) + 'px, 0)';
                headerLarge.style.visibility = progress > 0.95 ? 'hidden' : 'visible';
                headerLarge.style.pointerEvents = progress > 0.8 ? 'none' : 'auto';
            }

            // Interpolate Small Banner (Fade in and slide up from below)
            if (headerSmall) {
                headerSmall.style.opacity = progress;
                headerSmall.style.transform = 'translate3d(0, ' + ((1 - progress) * 15) + 'px, 0)';
                headerSmall.style.visibility = progress < 0.05 ? 'hidden' : 'visible';
                headerSmall.style.pointerEvents = progress < 0.2 ? 'none' : 'auto';
            }
        } else {
            // Non-home sections: force small header state immediately
            if (navbar) {
                navbar.style.height = endHeight + 'px';
                navbar.classList.add('scrolled');
            }
            if (headerLarge) {
                headerLarge.style.opacity = 0;
                headerLarge.style.visibility = 'hidden';
                headerLarge.style.pointerEvents = 'none';
            }
            if (headerSmall) {
                headerSmall.style.opacity = 1;
                headerSmall.style.transform = 'translate3d(0, 0, 0)';
                headerSmall.style.visibility = 'visible';
                headerSmall.style.pointerEvents = 'auto';
            }
        }

        requestAnimationFrame(animate);
    }
    animate();

    // --- Bottom Navigation Tab Switching ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            activeTab = targetTab;

            // Set spacer height immediately to prevent layout jumps
            if (headerSpacer) {
                headerSpacer.style.height = activeTab === 'hero' ? '50vh' : endHeight + 'px';
            }

            // Reset scroll to top so header transitions back to large size
            window.scrollTo({
                top: 0,
                behavior: 'instant' // Instant reset to prevent scroll-clashing
            });

            // Update navbar active classes
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show active section and hide others
            sections.forEach(section => {
                section.classList.remove('active-section');
                if (section.getAttribute('id') === targetTab) {
                    section.classList.add('active-section');
                }
            });
        });
    });

    // --- Re-engineered Floating Social Card ---
    const socialWidget = document.getElementById('social-widget');
    const socialMenuCard = document.getElementById('social-menu-card');
    const socialMainView = document.getElementById('social-view-main');
    const socialWhatsAppView = document.getElementById('social-view-whatsapp');
    const socialWhatsAppTrigger = document.getElementById('social-card-whatsapp-trigger');

    function openSocialMenu() {
        if (socialWidget) {
            socialWidget.classList.add('active');
        }
    }

    function closeSocialMenu() {
        if (socialWidget) {
            socialWidget.classList.remove('active');
            // Reset view state back to default main menu after slide-out transition
            setTimeout(() => {
                if (socialMainView && socialWhatsAppView) {
                    socialMainView.style.display = 'flex';
                    socialWhatsAppView.style.display = 'none';
                }
            }, 300);
        }
    }

    if (socialTrigger) {
        socialTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Toggle open/close on trigger button click
            if (socialWidget.classList.contains('active')) {
                closeSocialMenu();
            } else {
                openSocialMenu();
            }
        });
    }

    // Close when clicking outside of the active menu card
    document.addEventListener('click', (e) => {
        if (socialWidget && socialWidget.classList.contains('active')) {
            if (!socialMenuCard.contains(e.target) && !socialTrigger.contains(e.target)) {
                closeSocialMenu();
            }
        }
    });

    // Toggle WhatsApp Sub-Menu state
    if (socialWhatsAppTrigger) {
        socialWhatsAppTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (socialMainView && socialWhatsAppView) {
                socialMainView.style.display = 'none';
                socialWhatsAppView.style.display = 'flex';
            }
        });
    }

    // --- Cycling Monochromatic Icons in Floating Button & Desktop Button ---
    let activeIconIndex = 0;
    const cycleInterval = setInterval(() => {
        // Cycle mobile floating button icons
        if (mobileCycleIcons.length > 0 && (!socialWidget || !socialWidget.classList.contains('active'))) {
            mobileCycleIcons[activeIconIndex].classList.remove('active');
        }
        // Cycle desktop header button icons
        if (desktopCycleIcons.length > 0) {
            desktopCycleIcons[activeIconIndex].classList.remove('active');
        }

        activeIconIndex = (activeIconIndex + 1) % 6; // Both widgets contain exactly 6 icons

        if (mobileCycleIcons.length > 0 && (!socialWidget || !socialWidget.classList.contains('active'))) {
            mobileCycleIcons[activeIconIndex].classList.add('active');
        }
        if (desktopCycleIcons.length > 0) {
            desktopCycleIcons[activeIconIndex].classList.add('active');
        }
    }, 2000); // Cycle every 2 seconds
    // --- Photos Slideshow Loop ---
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlideIndex = 0;
    let slideshowInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlideIndex = index;
    }

    function startSlideshow() {
        slideshowInterval = setInterval(() => {
            const nextIndex = (currentSlideIndex + 1) % slides.length;
            showSlide(nextIndex);
        }, 3000);
    }

    if (slides.length > 0) {
        startSlideshow();
        
        // Let indicators be interactive on click
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                clearInterval(slideshowInterval);
                showSlide(idx);
                startSlideshow();
            });
        });
    }

    // --- Interactive Tab Hooks ---
    const viewAlbumBtn = document.getElementById('view-album-trigger');
    const albumNavBtn = document.querySelector('.bottom-nav-item[data-tab="album"]');
    if (viewAlbumBtn && albumNavBtn) {
        viewAlbumBtn.addEventListener('click', () => {
            albumNavBtn.click();
        });
    }

    const seePoojaDatesBtn = document.getElementById('see-pooja-dates-btn');
    const poojasNavBtn = document.querySelector('.bottom-nav-item[data-tab="poojas"]');
    if (seePoojaDatesBtn && poojasNavBtn) {
        seePoojaDatesBtn.addEventListener('click', () => {
            poojasNavBtn.click();
        });
    }



    // --- Automatic Seva Date Pickers & Dynamic Labels ---
    const todayStr = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.seva-date-picker').forEach(picker => {
        picker.value = todayStr;
        picker.min = todayStr; // Prevent booking in the past
    });

    let poojaDates = {};
    let dateToPoojaMap = {};

    window.bookSeva = function(sevaName, btn) {
        // Online booking disabled temporarily. Hover tooltip displays notice.
    };

    // Helper to format dates to readable strings (e.g. "20 Jul 2026")
    function formatReadableDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${day} ${months[monthIndex]} ${year}`;
    }

    // --- Fetch Notice Board JSON & Populate ---
    var noticeContainer = document.getElementById('notice-list-container');
    if (noticeContainer) {
        fetch('notices.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (Array.isArray(data) && data.length > 0) {
                    noticeContainer.innerHTML = ''; // Clear fallback notice
                    data.forEach(function(item) {
                        var li = document.createElement('li');
                        var bullet = document.createElement('span');
                        bullet.className = 'bullet-notice';
                        bullet.textContent = '✦';
                        
                        var contentDiv = document.createElement('div');
                        contentDiv.className = 'notice-item-content';
                        
                        if (item.title) {
                            var strong = document.createElement('strong');
                            strong.textContent = item.title + ': ';
                            contentDiv.appendChild(strong);
                        }
                        
                        var textNode = document.createTextNode(item.text || '');
                        contentDiv.appendChild(textNode);
                        
                        li.appendChild(bullet);
                        li.appendChild(contentDiv);
                        noticeContainer.appendChild(li);
                    });
                }
            })
            .catch(function(err) {
                console.warn('Could not load notices.json, displaying default fallback notice.', err);
            });
    }

    // --- Fetch Pooja Dates JSON & Populate ---
    fetch('pooja_dates.json')
        .then(function(response) { return response.json(); })
        .then(data => {
            poojaDates = data;
            // Build date to pooja list map supporting single strings or array arrays
            dateToPoojaMap = {};
            for (const name in poojaDates) {
                const rawVal = poojaDates[name];
                const dateList = Array.isArray(rawVal) ? rawVal : [rawVal];
                
                dateList.forEach(dateVal => {
                    if (!dateToPoojaMap[dateVal]) {
                        dateToPoojaMap[dateVal] = [];
                    }
                    dateToPoojaMap[dateVal].push(name);
                });
            }

            // Populate all data-seva displays (or replace with select dropdowns if multiple dates)
            document.querySelectorAll('.seva-date-display').forEach(display => {
                const name = display.getAttribute('data-seva');
                if (poojaDates[name]) {
                    const rawVal = poojaDates[name];
                    const dateList = Array.isArray(rawVal) ? rawVal : [rawVal];

                    if (dateList.length === 1) {
                        const dateVal = dateList[0];
                        display.setAttribute('data-date', dateVal);
                        display.textContent = formatReadableDate(dateVal);
                    } else if (dateList.length > 1) {
                        // Dynamically create a custom dropdown for multiple options
                        const select = document.createElement('select');
                        select.className = 'seva-date-select';
                        
                        dateList.forEach(dateVal => {
                            const option = document.createElement('option');
                            option.value = dateVal;
                            option.textContent = formatReadableDate(dateVal);
                            select.appendChild(option);
                        });
                        
                        // Replace display span with select dropdown
                        display.parentNode.replaceChild(select, display);
                    }
                } else {
                    display.textContent = 'Contact Temple';
                }
            });

            // Re-render calendar to show markers
            if (window.refreshCalendar) {
                window.refreshCalendar();
            }
        })
        .catch(err => {
            console.warn('Error reading pooja_dates.json:', err);
        });

    // --- Automatic Calendar Generator ---
    const calendarContainer = document.getElementById('pooja-calendar-container');
    if (calendarContainer) {
        let currentDate = new Date();
        let activeYear = currentDate.getFullYear();
        let activeMonth = currentDate.getMonth();

        function renderCalendar(year, month) {
            calendarContainer.innerHTML = '';

            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            // 1. Header with navigation controls
            const header = document.createElement('div');
            header.className = 'calendar-header';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'calendar-nav-btn';
            prevBtn.innerHTML = '&#9664;';
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activeMonth--;
                if (activeMonth < 0) {
                    activeMonth = 11;
                    activeYear--;
                }
                renderCalendar(activeYear, activeMonth);
            });

            const title = document.createElement('h3');
            title.className = 'calendar-title';
            title.textContent = `${monthNames[month]} ${year}`;

            const nextBtn = document.createElement('button');
            nextBtn.className = 'calendar-nav-btn';
            nextBtn.innerHTML = '&#9654;';
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                activeMonth++;
                if (activeMonth > 11) {
                    activeMonth = 0;
                    activeYear++;
                }
                renderCalendar(activeYear, activeMonth);
            });

            header.appendChild(prevBtn);
            header.appendChild(title);
            header.appendChild(nextBtn);
            calendarContainer.appendChild(header);

            // 2. Weekdays and Dates grid
            const grid = document.createElement('div');
            grid.className = 'calendar-grid';

            const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            weekdays.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                grid.appendChild(dayHeader);
            });

            const firstDayIndex = new Date(year, month, 1).getDay();
            const lastDayDate = new Date(year, month + 1, 0).getDate();

            // Insert empty slots
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day-cell empty';
                grid.appendChild(emptyCell);
            }

            const realToday = new Date();
            for (let day = 1; day <= lastDayDate; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day-cell';
                cell.textContent = day;

                // Mark current day
                if (day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear()) {
                    cell.classList.add('today');
                }

                // Check if date has pooja from JSON configuration
                const mm = String(month + 1).padStart(2, '0');
                const dd = String(day).padStart(2, '0');
                const dateStr = `${year}-${mm}-${dd}`;

                if (dateToPoojaMap[dateStr]) {
                    cell.classList.add('has-pooja');
                }

                // Interactive Day Click Selection & Tooltip Trigger
                cell.addEventListener('click', () => {
                    // Update normal date pickers
                    document.querySelectorAll('.seva-date-picker').forEach(picker => {
                        picker.value = dateStr;
                    });

                    // Outline selected cell
                    document.querySelectorAll('.calendar-day-cell').forEach(c => {
                        c.style.outline = 'none';
                        c.style.boxShadow = '';
                    });
                    cell.style.outline = '1.5px solid var(--accent-gold)';
                    cell.style.outlineOffset = '-1.5px';

                    // Show Pooja Tooltip if configured
                    if (dateToPoojaMap[dateStr]) {
                        document.querySelectorAll('.calendar-tooltip').forEach(t => t.remove());

                        const tooltip = document.createElement('div');
                        tooltip.className = 'calendar-tooltip';
                        tooltip.textContent = dateToPoojaMap[dateStr].join(', ');
                        cell.appendChild(tooltip);

                        // Clear automatically after 6 seconds
                        setTimeout(() => {
                            tooltip.style.transition = 'opacity 0.4s ease';
                            tooltip.style.opacity = '0';
                            setTimeout(() => {
                                if (tooltip.parentNode) {
                                    tooltip.remove();
                                }
                            }, 400);
                        }, 6000);
                    }
                });

                grid.appendChild(cell);
            }

            calendarContainer.appendChild(grid);
        }

        window.refreshCalendar = function() {
            renderCalendar(activeYear, activeMonth);
        };

        renderCalendar(activeYear, activeMonth);
    }

    // --- Desktop Layout Logic ---
    const desktopEbookBtn = document.getElementById('desktop-ebook-btn');
    const desktopLeftHeader = document.querySelector('.desktop-left');
    const desktopSocialTrigger = document.getElementById('desktop-social-trigger');
    const desktopSocialContainer = document.getElementById('desktop-social-container');

    // Toggle eBook Section in the middle column
    if (desktopEbookBtn) {
        desktopEbookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('show-ebook');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Return to Home (Hero) Section when logo/temple name is clicked
    if (desktopLeftHeader) {
        desktopLeftHeader.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove('show-ebook');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Desktop Social dropdown toggle
    if (desktopSocialTrigger && desktopSocialContainer) {
        desktopSocialTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopSocialContainer.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!desktopSocialContainer.contains(e.target)) {
                desktopSocialContainer.classList.remove('active');
            }
        });
    }

    // Intercept desktop button triggers for columns to scroll smoothly instead of clicking mobile tabs
    if (viewAlbumBtn) {
        viewAlbumBtn.addEventListener('click', (e) => {
            if (window.innerWidth >= 1024) {
                e.preventDefault();
                e.stopPropagation();
                const targetEl = document.getElementById('album');
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, true); // use capture phase
    }

    if (seePoojaDatesBtn) {
        seePoojaDatesBtn.addEventListener('click', (e) => {
            if (window.innerWidth >= 1024) {
                e.preventDefault();
                e.stopPropagation();
                const targetEl = document.getElementById('poojas');
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, true); // use capture phase
    }
});

// Fisher-Yates Shuffling Logic to randomize the array completely
function shufflePhotos(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function initGallery() {
  try {
    // 1. Fetch the automated gallery.json list
    const response = await fetch('gallery.json');
    if (!response.ok) throw new Error('Failed to load gallery data');
    const photoFiles = await response.json();
    
    // 2. Shuffle all available photos
    const randomizedPhotos = shufflePhotos(photoFiles);
    
    // 3. Update home page slideshow slides with 3 random photos
    const slideshowContents = document.querySelectorAll('.slide-content');
    slideshowContents.forEach((slideContent, index) => {
      if (randomizedPhotos[index]) {
        slideContent.style.backgroundImage = `linear-gradient(to bottom, rgba(45, 38, 33, 0.1), rgba(45, 38, 33, 0.75)), url('temple-gallery/${randomizedPhotos[index]}')`;
        slideContent.style.backgroundSize = 'cover';
        slideContent.style.backgroundPosition = 'center';
      }
    });

    // 4. Slice the array to pick exactly the first 50 random photos
    const selectedPhotos = randomizedPhotos.slice(0, 50);
    
    // 5. Target your existing gallery UI container
    const container = document.getElementById('temple-gallery-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear out any placeholder/existing markup

    // 6. Loop through the 50 random photos and append them to your UI
    selectedPhotos.forEach(fileName => {
      const card = document.createElement('div');
      card.className = 'album-card glass-card'; // Matches existing CSS card layout
      
      const link = document.createElement('a');
      link.href = 'https://www.google.com/maps/place/Shri+Siddhi+Subrahmanyeshwara+Devasthanam/@12.9333963,77.5625359,19.33z/data=!4m6!3m5!1s0x3bae151f44881cdb:0x71efdbd5d8e1c023!8m2!3d12.9338525!4d77.5623417!16s%2Fg%2F11pldtvfnt';
      link.target = '_blank';
      link.rel = 'noopener';
      
      const img = document.createElement('img');
      img.src = `temple-gallery/${fileName}`; 
      img.alt = 'Temple Photo';
      img.loading = 'lazy'; // Highly recommended: ensures smooth rendering for 50 images
      img.draggable = false;
      
      link.appendChild(img);
      card.appendChild(link);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error setting up random gallery:", error);
  }
}

// Triggers the randomization every single time the DOM loads/refreshes
document.addEventListener('DOMContentLoaded', initGallery);
