document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations using Intersection Observer
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Tracking (Mock for demo)
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('CTA Clicked:', btn.innerText);
            // Aqui você adicionaria tracking do Pixel/GTM
        });
    });

    // WhatsApp Message Logging
    const waBtn = document.querySelector('.whatsapp-btn');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            console.log('Contato WhatsApp iniciado');
        });
    }
});
