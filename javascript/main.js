const burgerBtn = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuLinks = mobileMenu.querySelectorAll('a');

const line1 = document.getElementById('line-1')
const line2 = document.getElementById('line-2')
const line3 = document.getElementById('line-3')

const toggleMenu = () => {

    const isClosed = mobileMenu.classList.contains('hidden');

    if (isClosed) {

        mobileMenu.classList.remove('hidden');
        
        setTimeout(() => {
            mobileMenu.classList.remove('opacity-0', '-translate-y-4');
            mobileMenu.classList.add('opacity-100', 'translate-y-0');
        }, 10);
    } else {

        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
        }, 300);
    }

    line1.classList.toggle('rotate-45')
    line1.classList.toggle('translate-y-[10px]');

    line2.classList.toggle('opacity-0');

    line3.classList.toggle('-rotate-45');
    line3.classList.toggle('-translate-y-[10px]');
};

burgerBtn.addEventListener('click', toggleMenu);

menuLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
})

const allAccordions = document.querySelectorAll('.accordion-menu');

allAccordions.forEach(accordionContainer => {
    
    accordionContainer.addEventListener('click', (e) => {

        const trigger = e.target.closest('.accordion-trigger');
        if (!trigger) return;

        e.preventDefault();

        const parentItem = trigger.closest('.accordion-item');
        const content = parentItem.querySelector('.accordion-content');
        const icon = trigger.querySelector('img');

        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

        const allItemsInThisAccordion = accordionContainer.querySelectorAll('.accordion-item');
        allItemsInThisAccordion.forEach(item => {
            const itemContent = item.querySelector('.accordion-content');
            const itemIcon = item.querySelector('img');
            
            if (itemContent) {
                itemContent.style.maxHeight = '0px';
                itemContent.classList.remove('mt-4');
            }
            if (itemIcon) itemIcon.classList.remove('rotate-180');
        });

        if (!isOpen) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.classList.add('mt-4');
            if (icon) icon.classList.add('rotate-180');
        }
    });
});