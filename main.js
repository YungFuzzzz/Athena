// main.js — interactive behavior with GSAP

const links = document.querySelectorAll('.links .link');
const coming = document.querySelectorAll('.coming-soon');
const tooltip = document.querySelector('.tooltip');
const logoBtn = document.querySelector('.logo-btn');

// Find the last real link (the active anchor before coming-soon ones)
function getActiveLink() {
  const allItems = Array.from(document.querySelectorAll('.link-item, .link-item.coming-soon'));
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
  }
  // last .link before the first .coming-soon
  const firstSoon = document.querySelector('.link-item.coming-soon');
  if (!firstSoon) {
    return document.querySelector('.links .link:last-of-type');
  }
  // previousElementSibling that contains an anchor
  let prev = firstSoon.previousElementSibling;
  while (prev) {
    const a = prev.querySelector('a');
    if (a) return a;
    prev = prev.previousElementSibling;
  }
  return document.querySelector('.links .link:last-of-type');
}

const activeLink = getActiveLink();

// logo scrolls to active link
logoBtn.addEventListener('click', (e) => {
  if (!activeLink) return;
  gsap.to(window, {duration:0.8, scrollTo: {y: activeLink, offsetY: 80}, ease: 'power2.out'});
});

// entry animations: make the opener cleaner and slower
if (document.querySelectorAll('.link, .link-item.coming-soon').length) {
  // animate anchors and coming-soon containers together with a slower, smoother motion
  gsap.from('.link, .link-item.coming-soon', {y: 8, opacity: 0, duration: 1.1, ease: 'power2.out'});
  // animate question-mark text inside coming-soon rows with a subtle slide/fade and a tiny stagger
  gsap.from('.link-item.coming-soon .title-text', {x: -6, opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.04, delay: 0.05});
}

// coming-soon tooltip behavior — top-most coming-soon shows tooltip "soon" when hovered
const topSoon = document.querySelector('.link-item.top-soon');
if (topSoon) {
  topSoon.addEventListener('mouseenter', (e) => {
    tooltip.textContent = 'next project';
    tooltip.style.opacity = '1';
    tooltip.setAttribute('aria-hidden', 'false');
  });
  topSoon.addEventListener('mouseleave', (e) => {
    tooltip.style.opacity = '0';
    tooltip.setAttribute('aria-hidden', 'true');
  });
  topSoon.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });
}

// disable pointer and keyboard for coming-soon items
coming.forEach(ci => {
  ci.setAttribute('aria-disabled', 'true');
  ci.querySelectorAll('a').forEach(a => a.setAttribute('tabindex','-1'));
});

// pointer-based hover handling per anchor to avoid stuck arrows when moving quickly
const anchors = document.querySelectorAll('.links .link');
// Delegated pointer handling + lazy initialization via IntersectionObserver
const linksList = document.querySelector('.links');

// cached measurement for '?' width
let charWidthCache = null;
function measureCharWidth(sampleEl){
  if (charWidthCache) return charWidthCache;
  const style = window.getComputedStyle(sampleEl || document.body);
  const meas = document.createElement('span');
  meas.style.font = style.font;
  meas.style.whiteSpace = 'nowrap';
  meas.style.position = 'absolute';
  meas.style.visibility = 'hidden';
  meas.textContent = '?';
  document.body.appendChild(meas);
  const w = meas.getBoundingClientRect().width || 8;
  document.body.removeChild(meas);
  charWidthCache = w;
  return w;
}

// fill single title (more efficient)
function fillQuestionMarksFor(titleEl){
  const txt = titleEl.querySelector('.title-text');
  const inner = titleEl.querySelector('.title-inner');
  const arrow = titleEl.querySelector('.arrow');
  if (!txt || !inner) return;
  const original = txt.textContent || '';
  if (!/^\?+$/.test(original.trim())) return;

  const container = titleEl.closest('.link-item') || titleEl.parentElement;
  const containerRect = container.getBoundingClientRect();
  const titleRect = titleEl.getBoundingClientRect();
  const arrowWidth = arrow ? (arrow.getBoundingClientRect().width + 6) : 0;
  const leftOffset = Math.max(0, titleRect.left - containerRect.left);
  const style = window.getComputedStyle(titleEl);
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const available = Math.max(0, containerRect.width - leftOffset - arrowWidth - paddingRight - 4);

  const charW = measureCharWidth(txt);
  const count = Math.max(1, Math.ceil(available / charW));
  txt.textContent = '?'.repeat(count);
}

// IntersectionObserver: initialize arrows and question marks only when item is near viewport
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent => {
    const li = ent.target;
    const title = li.querySelector('.title');
    const arrow = li.querySelector('.arrow');
    if (ent.isIntersecting){
      if (arrow) gsap.set(arrow, {x: '-0.9em', opacity:0});
      if (title) fillQuestionMarksFor(title);
    }
  });
},{root:null, rootMargin: '300px', threshold: 0.01});

document.querySelectorAll('.link-item').forEach(li=> io.observe(li));

// Delegated pointer handlers on the list element
if (linksList){
  linksList.addEventListener('pointerover', (e)=>{
    const a = e.target.closest('.link');
    if (!a || !linksList.contains(a)) return;
    const related = e.relatedTarget;
    if (related && a.contains(related)) return; // ignore intra-link moves
    const arrow = a.querySelector('.arrow');
    if (arrow){ gsap.killTweensOf(arrow); gsap.to(arrow, {x:0, opacity:1, duration:0.28, ease:'power2.out'}); }
    const inner = a.querySelector('.title-inner');
    const titleEl = a.querySelector('.title');
    if (inner && titleEl){
      const visible = titleEl.clientWidth;
      const full = inner.scrollWidth;
      const shift = Math.min(0, visible - full - 8);
      if (shift < 0){ gsap.killTweensOf(inner); gsap.to(inner, {x: shift, duration: Math.min(4, Math.abs(shift)/120), ease:'power1.inOut'}); }
    }
  });

  linksList.addEventListener('pointerout', (e)=>{
    const a = e.target.closest('.link');
    if (!a || !linksList.contains(a)) return;
    const related = e.relatedTarget;
    if (related && a.contains(related)) return; // still inside
    const arrow = a.querySelector('.arrow');
    if (arrow){ gsap.killTweensOf(arrow); gsap.to(arrow, {x: '-0.9em', opacity:0, duration:0.22, ease:'power2.inOut'}); }
    const inner = a.querySelector('.title-inner');
    if (inner){ gsap.killTweensOf(inner); gsap.to(inner, {x:0, duration:0.32, ease:'power2.out'}); }
  });
}

// small accessibility: keyboard focus shows arrow
links.forEach(a=>{
  a.addEventListener('focus', ()=> {
  const arrow = a.querySelector('.arrow');
  if (arrow) gsap.to(arrow, {x: 0, opacity:1, duration:0.28});
    const t = a.querySelector('.title-text');
    const inner = a.querySelector('.title-inner');
      const titleEl = a.querySelector('.title');
      if (inner && titleEl) {
        const visible = titleEl.clientWidth;
        const full = inner.scrollWidth;
        const shift = Math.min(0, visible - full - 8);
        if (shift < 0) gsap.to(inner, {x: shift, duration: Math.min(4, Math.abs(shift) / 120), ease: 'power1.inOut'});
      }
  })
  a.addEventListener('blur', ()=> {
  const arrow = a.querySelector('.arrow');
  if (arrow) gsap.to(arrow, {x: '-0.9em', opacity:0, duration:0.22});
  const inner = a.querySelector('.title-inner');
  if (inner) gsap.to(inner, {x:0, duration:0.28, ease:'power2.out'});
  })
});

// small resize observer to ensure active link is visible when page loads
window.addEventListener('load', ()=>{
  if (activeLink) {
    // slightly offset so header doesn't overlap
    // do not auto-scroll on small screens
    if (window.innerWidth > 600) {
      gsap.to(window, {duration:0.6, scrollTo: {y: activeLink, offsetY: 80}, delay:0.2, ease:'power2.out'});
    }
  }
});

// utility: debounce
function debounce(fn, wait=120){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), wait);
  }
}

// fill title-text that contain only question marks so they span the available width
function fillQuestionMarks(){
  const titles = document.querySelectorAll('.title');
  titles.forEach(title => {
    const txt = title.querySelector('.title-text');
    const inner = title.querySelector('.title-inner');
    const arrow = title.querySelector('.arrow');
    if (!txt || !inner) return;
    const original = txt.textContent || '';
    // only auto-fill when text is only question marks (or empty)
    if (!/^\?+$/.test(original.trim())) return;

  // measure available width inside the whole link-item (so ? fill corner-to-corner)
  const container = title.closest('.link-item') || title.parentElement;
  const containerRect = container.getBoundingClientRect();
  const titleRect = title.getBoundingClientRect();
  const arrowWidth = arrow ? (arrow.getBoundingClientRect().width + 6) : 0; // include gap
  const leftOffset = Math.max(0, titleRect.left - containerRect.left);
  const style = window.getComputedStyle(title);
  const paddingRight = parseFloat(style.paddingRight) || 0;
  const available = Math.max(0, containerRect.width - leftOffset - arrowWidth - paddingRight - 4);

  // measure width of single question char with same font
    const txtStyle = window.getComputedStyle(txt);
    const meas = document.createElement('span');
    meas.style.font = txtStyle.font;
    meas.style.whiteSpace = 'nowrap';
    meas.style.position = 'absolute';
    meas.style.visibility = 'hidden';
    meas.textContent = '?';
    document.body.appendChild(meas);
    const charWidth = meas.getBoundingClientRect().width || 8;
    document.body.removeChild(meas);
  const count = Math.max(1, Math.ceil(available / charWidth));
    txt.textContent = '?'.repeat(count);
  });
}

const onResizeFill = debounce(()=> fillQuestionMarks(), 120);
window.addEventListener('resize', onResizeFill);
window.addEventListener('load', ()=> fillQuestionMarks());

// Export nothing, this is module but used for side effects
