const SLIDE_TRANSITION_MS = 1000;
const BREAKPOINT_TABLET = 1131;
const BREAKPOINT_MOBILE = 600;

const PREV_ARROW_SVG = `
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="25" cy="25" r="24.5" transform="rotate(180 25 25)" stroke="#F5F7F6"/>
    <path d="M36 26C36.5523 26 37 25.5523 37 25C37 24.4477 36.5523 24 36 24V26ZM14.2929 24.2929C13.9024 24.6834 13.9024 25.3166 14.2929 25.7071L20.6569 32.0711C21.0474 32.4616 21.6805 32.4616 22.0711 32.0711C22.4616 31.6805 22.4616 31.0474 22.0711 30.6569L16.4142 25L22.0711 19.3431C22.4616 18.9526 22.4616 18.3195 22.0711 17.9289C21.6805 17.5384 21.0474 17.5384 20.6569 17.9289L14.2929 24.2929ZM36 24H15V26H36V24Z" fill="#F5F7F6"/>
  </svg>`;

const NEXT_ARROW_SVG = `
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle r="24.5" transform="matrix(1 8.74228e-08 8.74228e-08 -1 25 25)" stroke="#F5F7F6"/>
    <path d="M14 26C13.4477 26 13 25.5523 13 25C13 24.4477 13.4477 24 14 24V26ZM35.7071 24.2929C36.0976 24.6834 36.0976 25.3166 35.7071 25.7071L29.3431 32.0711C28.9526 32.4616 28.3195 32.4616 27.9289 32.0711C27.5384 31.6805 27.5384 31.0474 27.9289 30.6569L33.5858 25L27.9289 19.3431C27.5384 18.9526 27.5384 18.3195 27.9289 17.9289C28.3195 17.5384 28.9526 17.5384 29.3431 17.9289L35.7071 24.2929ZM14 24H35V26H14V24Z" fill="#F5F7F6"/>
  </svg>`;

function formatSlideNumber(num) {
  return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
}

function getSlidesToShow() {
  const { innerWidth } = window;
  if (innerWidth < BREAKPOINT_MOBILE) return 1;
  if (innerWidth < BREAKPOINT_TABLET) return 2;
  return 3;
}

function getRealSlideCount(block) {
  return parseInt(block.dataset.slideCount, 10) || 0;
}

function normalizeSlideIndex(slideIndex, slideCount) {
  if (slideCount === 0) return 0;
  let index = slideIndex;
  if (index < 0) index = slideCount - 1;
  if (index >= slideCount) index = 0;
  return index;
}

function getActiveIndexFromPosition(trackPosition, slideCount) {
  return ((trackPosition % slideCount) + slideCount) % slideCount;
}

function updateSlideAccessibility(block, activeIndex) {
  const slideCount = getRealSlideCount(block);
  const trackPosition = parseInt(block.dataset.trackPosition, 10) || 0;
  const track = block.querySelector('.carousel-capabilities-track');
  const slides = track?.querySelectorAll('.carousel-capabilities-slide') || [];

  slides.forEach((slide) => {
    slide.classList.remove('is-active');
  });

  if (trackPosition >= slideCount && slides[trackPosition]) {
    slides[trackPosition].classList.add('is-active');
  } else {
    block.querySelectorAll('.carousel-capabilities-slide:not(.is-clone)').forEach((slide, idx) => {
      if (idx === activeIndex) slide.classList.add('is-active');
    });
  }

  block.querySelectorAll('.carousel-capabilities-slide:not(.is-clone)').forEach((slide, idx) => {
    const isActive = idx === activeIndex;
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    slide.tabIndex = isActive ? 0 : -1;
    slide.querySelectorAll('a').forEach((link) => {
      if (isActive) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
}

function updateCounter(block, activeIndex, slideCount) {
  const current = block.querySelector('.carousel-capabilities-current');
  const total = block.querySelector('.carousel-capabilities-total');
  if (current) current.textContent = formatSlideNumber(activeIndex + 1);
  if (total) total.textContent = formatSlideNumber(slideCount);
}

function setTrackTransform(block, trackPosition, { instant = false } = {}) {
  const track = block.querySelector('.carousel-capabilities-track');
  const viewport = block.querySelector('.carousel-capabilities-viewport');
  if (!track || !viewport) return false;

  const slidesToShow = getSlidesToShow();
  const slideWidth = viewport.offsetWidth / slidesToShow;
  if (slideWidth <= 0) return false;

  track.querySelectorAll('.carousel-capabilities-slide').forEach((slide) => {
    slide.style.flex = `0 0 ${slideWidth}px`;
  });

  if (instant) {
    track.style.transitionProperty = 'none';
    track.style.transform = `translate3d(-${trackPosition * slideWidth}px, 0, 0)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transitionProperty = '';
      });
    });
    return true;
  }

  track.style.transform = `translate3d(-${trackPosition * slideWidth}px, 0, 0)`;
  return true;
}

function updateTrackPosition(block, { instant = false } = {}) {
  const track = block.querySelector('.carousel-capabilities-track');
  const viewport = block.querySelector('.carousel-capabilities-viewport');
  if (!track || !viewport) return false;

  const slideCount = getRealSlideCount(block);
  const activeIndex = parseInt(block.dataset.activeSlide, 10) || 0;
  const trackPosition = parseInt(block.dataset.trackPosition, 10);
  const resolvedPosition = Number.isNaN(trackPosition) ? activeIndex : trackPosition;

  if (!setTrackTransform(block, resolvedPosition, { instant })) return false;

  updateSlideAccessibility(block, activeIndex);
  updateCounter(block, activeIndex, slideCount);
  block.classList.add('carousel-capabilities-ready');
  return true;
}

function waitForTrackTransition(track) {
  return new Promise((resolve) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resolve();
      return;
    }

    let settled = false;
    let fallbackId;
    let handleEnd;

    const done = () => {
      if (settled) return;
      settled = true;
      track.removeEventListener('transitionend', handleEnd);
      window.clearTimeout(fallbackId);
      resolve();
    };

    handleEnd = (event) => {
      if (event.target === track && event.propertyName === 'transform') {
        done();
      }
    };

    fallbackId = window.setTimeout(done, SLIDE_TRANSITION_MS + 50);
    track.addEventListener('transitionend', handleEnd);
  });
}

function setupInfiniteClones(track) {
  const slides = [...track.querySelectorAll('.carousel-capabilities-slide:not(.is-clone)')];
  if (slides.length < 2) return;

  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add('is-clone');
    clone.classList.remove('is-active');
    clone.removeAttribute('id');
    clone.removeAttribute('aria-labelledby');
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.append(clone);
  });
}

function syncInfoHeights(block) {
  const infos = block.querySelectorAll('.carousel-capabilities-slide:not(.is-clone) .carousel-capabilities-info');
  if (infos.length === 0) return;

  infos.forEach((info) => {
    info.style.minHeight = '';
  });
  block.style.removeProperty('--carousel-capabilities-info-min-height');

  let maxHeight = 0;
  infos.forEach((info) => {
    maxHeight = Math.max(maxHeight, info.getBoundingClientRect().height);
  });

  if (maxHeight > 0) {
    block.style.setProperty('--carousel-capabilities-info-min-height', `${Math.ceil(maxHeight)}px`);
  }
}

function initTrackLayout(block) {
  const viewport = block.querySelector('.carousel-capabilities-viewport');
  if (!viewport) return;

  const applyLayout = () => {
    if (block.dataset.animating === 'true') return;
    updateTrackPosition(block);
    syncInfoHeights(block);
  };

  applyLayout();
  requestAnimationFrame(applyLayout);
  requestAnimationFrame(() => requestAnimationFrame(applyLayout));

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(applyLayout).observe(viewport);
  }
}

export function showSlide(block, slideIndex = 0, { instant = false } = {}) {
  const slideCount = getRealSlideCount(block);
  if (slideCount < 2 || block.dataset.animating === 'true') return;

  const activeIndex = normalizeSlideIndex(slideIndex, slideCount);
  block.dataset.activeSlide = String(activeIndex);
  block.dataset.trackPosition = String(activeIndex);
  updateTrackPosition(block, { instant });
}

async function moveTrack(block, direction) {
  if (block.dataset.animating === 'true') return;

  const slideCount = getRealSlideCount(block);
  const track = block.querySelector('.carousel-capabilities-track');
  if (!track || slideCount < 2) return;

  block.dataset.animating = 'true';

  let trackPosition = parseInt(block.dataset.trackPosition, 10) || 0;

  if (direction < 0 && trackPosition === 0) {
    setTrackTransform(block, slideCount, { instant: true });
    block.dataset.trackPosition = String(slideCount);
    trackPosition = slideCount;
  }

  trackPosition += direction;
  block.dataset.trackPosition = String(trackPosition);
  block.dataset.activeSlide = String(getActiveIndexFromPosition(trackPosition, slideCount));
  updateTrackPosition(block);

  await waitForTrackTransition(track);

  if (trackPosition >= slideCount) {
    trackPosition -= slideCount;
    block.dataset.trackPosition = String(trackPosition);
    block.dataset.activeSlide = String(getActiveIndexFromPosition(trackPosition, slideCount));
    updateTrackPosition(block, { instant: true });
  } else if (trackPosition < 0) {
    trackPosition += slideCount;
    block.dataset.trackPosition = String(trackPosition);
    block.dataset.activeSlide = String(getActiveIndexFromPosition(trackPosition, slideCount));
    updateTrackPosition(block, { instant: true });
  }

  block.dataset.animating = 'false';
}

async function goNext(block) {
  await moveTrack(block, 1);
}

async function goPrev(block) {
  await moveTrack(block, -1);
}

function formatCapabilitiesTitle(heading) {
  heading.classList.add('carousel-capabilities-title');
  if (heading.querySelector('span')) return;

  const br = heading.querySelector('br');
  if (br) {
    const span = document.createElement('span');
    let node = br.nextSibling;
    while (node) {
      const next = node.nextSibling;
      span.append(node);
      node = next;
    }
    const text = span.textContent.trim();
    if (text) {
      span.textContent = ` ${text}`;
      heading.append(span);
    }
    return;
  }

  const words = heading.textContent.trim().split(/\s+/);
  if (words.length < 2) return;

  const lastWord = words.pop();
  heading.textContent = '';
  heading.append(`${words.join(' ')} `);
  const span = document.createElement('span');
  span.textContent = lastWord;
  heading.append(span);
}

function absorbSectionIntro(block, staticColumn) {
  const section = block.closest('.section');
  if (!section) return;

  const wrapper = section.querySelector(':scope > .default-content-wrapper');
  if (!wrapper || wrapper.children.length === 0) return;

  const heading = wrapper.querySelector('h2');
  if (heading) {
    formatCapabilitiesTitle(heading);
    staticColumn.append(heading);
  }

  const introText = document.createElement('div');
  introText.classList.add('carousel-capabilities-text');
  [...wrapper.children].forEach((child) => {
    if (child !== heading) introText.append(child);
  });

  if (introText.children.length > 0) staticColumn.append(introText);
  wrapper.remove();
}

function observeImageReveal(block) {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      const { classList } = entry.target;
      if (classList.contains('carousel-capabilities-image-hover-animate')) return;
      classList.add('carousel-capabilities-image-hover-animate');
      if (index === 1) classList.add('carousel-capabilities-image-hover-animate-short');
      if (index === 2) classList.add('carousel-capabilities-image-hover-animate-long');
    });
  }, { threshold: 0.2 });

  block.querySelectorAll('.carousel-capabilities-slide:not(.is-clone) .carousel-capabilities-image-hover')
    .forEach((hover) => observer.observe(hover));
}

function bindEvents(block) {
  const slideCount = getRealSlideCount(block);
  if (slideCount < 2) return;

  block.querySelector('.slide-prev')?.addEventListener('click', () => {
    goPrev(block);
  });

  block.querySelector('.slide-next')?.addEventListener('click', () => {
    goNext(block);
  });

  block.querySelectorAll('.carousel-capabilities-slide:not(.is-clone)').forEach((slide) => {
    slide.addEventListener('click', () => {
      showSlide(block, parseInt(slide.dataset.slideIndex, 10));
    });
    slide.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showSlide(block, parseInt(slide.dataset.slideIndex, 10));
      }
    });
  });
}

function buildNavigationDetails(slideCount) {
  const details = document.createElement('div');
  details.classList.add('carousel-capabilities-details');
  details.innerHTML = `
    <div class="carousel-capabilities-numbering">
      <span class="carousel-capabilities-current">01</span>
      <span class="carousel-capabilities-total">${formatSlideNumber(slideCount)}</span>
    </div>
    <button type="button" class="carousel-capabilities-arrow slide-prev" aria-label="Previous slide">${PREV_ARROW_SVG}</button>
    <button type="button" class="carousel-capabilities-arrow slide-next" aria-label="Next slide">${NEXT_ARROW_SVG}</button>
  `;
  return details;
}

function buildSlideInfo(contentColumn) {
  const info = document.createElement('div');
  info.classList.add('carousel-capabilities-info');

  const items = contentColumn ? [...contentColumn.children] : [];
  if (items[0]) {
    items[0].classList.add('carousel-capabilities-index');
    info.append(items[0]);
  }
  if (items[1]) {
    items[1].classList.add('carousel-capabilities-name');
    info.append(items[1]);
  }
  if (items[2]) {
    items[2].classList.add('carousel-capabilities-text');
    info.append(items[2]);
  }

  return info;
}

function buildSlideImageWrap(imageColumn) {
  const imageWrap = document.createElement('div');
  imageWrap.classList.add('carousel-capabilities-image-wrap');

  const hover = document.createElement('div');
  hover.classList.add('carousel-capabilities-image-hover');
  imageWrap.append(hover);

  if (imageColumn) {
    while (imageColumn.firstChild) imageWrap.append(imageColumn.firstChild);
    imageWrap.querySelector('img')?.classList.add('carousel-capabilities-image');
  }

  return imageWrap;
}

function createSlide(row, slideIndex, carouselId) {
  const columns = row.querySelectorAll(':scope > div');
  const imageColumn = columns[0];
  const contentColumn = columns[1];

  const slide = document.createElement('div');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-capabilities-slide');
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const inner = document.createElement('div');
  inner.classList.add('carousel-capabilities-slide-inner');

  if (contentColumn) inner.append(buildSlideInfo(contentColumn));
  inner.append(buildSlideImageWrap(imageColumn));

  slide.append(inner);

  const labeledBy = slide.querySelector('.carousel-capabilities-name');
  if (labeledBy) {
    if (!labeledBy.id) labeledBy.id = `carousel-${carouselId}-slide-${slideIndex}-title`;
    slide.setAttribute('aria-labelledby', labeledBy.id);
  }

  return slide;
}

let carouselId = 0;

export default async function decorate(block) {
  carouselId += 1;
  const id = `carousel-${carouselId}`;
  block.setAttribute('id', id);
  block.dataset.activeSlide = '0';
  block.dataset.trackPosition = '0';

  const allRows = [...block.querySelectorAll(':scope > div')];
  allRows
    .filter((row) => row.querySelectorAll(':scope > div').length < 2)
    .forEach((row) => row.remove());

  const rows = [...block.querySelectorAll(':scope > div')];
  const slideCount = rows.length;
  const isSingleSlide = slideCount < 2;

  block.dataset.slideCount = String(slideCount);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const layoutRow = document.createElement('div');
  layoutRow.classList.add('carousel-capabilities-row');

  const staticColumn = document.createElement('div');
  staticColumn.classList.add('carousel-capabilities-static');
  absorbSectionIntro(block, staticColumn);

  if (!isSingleSlide) staticColumn.append(buildNavigationDetails(slideCount));

  const slider = document.createElement('div');
  slider.classList.add('carousel-capabilities-slider');

  const viewport = document.createElement('div');
  viewport.classList.add('carousel-capabilities-viewport');

  const track = document.createElement('div');
  track.classList.add('carousel-capabilities-track');
  track.style.transitionDuration = `${SLIDE_TRANSITION_MS}ms`;

  rows.forEach((slideRow, idx) => {
    track.append(createSlide(slideRow, idx, carouselId));
    slideRow.remove();
  });

  if (!isSingleSlide) setupInfiniteClones(track);

  viewport.append(track);
  slider.append(viewport);
  layoutRow.append(staticColumn, slider);
  block.replaceChildren(layoutRow);

  observeImageReveal(block);

  if (!isSingleSlide) {
    bindEvents(block);
    initTrackLayout(block);
  } else if (slideCount === 1) {
    block.querySelector('.carousel-capabilities-slide')?.classList.add('is-active');
  }
}
