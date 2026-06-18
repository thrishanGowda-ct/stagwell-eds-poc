/**
 * carousel-leadership block
 *
 * A horizontally-scrolling slider of leadership people. Each row authored in
 * the block is one person:
 *   - cell 1: portrait image
 *   - cell 2: content. Either a person card (name in <strong>, then the title
 *     as trailing text) or a featured pull-quote card where the content starts
 *     with a ">" prefixed quote, followed by <strong>name</strong> and title.
 *
 * The block is used twice on the leadership section:
 *   1. A single-row "featured" instance (large portrait + pull-quote) — detected
 *      because it has exactly one card whose content carries a ">" quote prefix.
 *   2. A multi-row "people" instance rendered as a horizontally-scrolling row of
 *      uniform compact cards with Previous/Next navigation.
 *
 * Built on the Block Collection carousel mechanics (scroll-snap + prev/next),
 * but renders compact people cards (several visible at once) instead of
 * full-bleed slides.
 *
 * @param {Element} block The block element
 */
function buildNavButtons(block, scroller) {
  const nav = document.createElement('div');
  nav.classList.add('carousel-leadership-navigation-buttons');
  nav.innerHTML = `
    <button type="button" class="slide-prev" aria-label="Previous"></button>
    <button type="button" class="slide-next" aria-label="Next"></button>
  `;

  const scrollByCard = (dir) => {
    const card = scroller.querySelector('.carousel-leadership-card');
    const amount = card ? card.getBoundingClientRect().width + 20 : scroller.clientWidth * 0.8;
    scroller.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  nav.querySelector('.slide-prev').addEventListener('click', () => scrollByCard(-1));
  nav.querySelector('.slide-next').addEventListener('click', () => scrollByCard(1));
  block.append(nav);
}

/**
 * Turn a content cell into structured name / title / quote elements.
 * Expected authored content (after EDS decoration): a single <p> containing an
 * optional leading "> quote" text node, a <strong>Name</strong>, then the title
 * as a trailing text node.
 * @param {Element} contentCell the source cell
 * @param {Element} body destination element to populate
 * @returns {boolean} true when a pull-quote was found (featured card)
 */
function buildBody(contentCell, body) {
  // Unwrap an outer link if present so we can re-build the structure.
  const link = contentCell.querySelector('a[href]');
  const source = link || contentCell;
  const nameEl = source.querySelector('strong');

  // Collect every text node so we can find a leading "> quote" and the title.
  const textChunks = [];
  source.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'P') {
      n.childNodes.forEach((c) => textChunks.push(c));
    } else {
      textChunks.push(n);
    }
  });

  let quoteText = '';
  let titleText = '';
  let seenName = false;
  textChunks.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'STRONG') {
      seenName = true;
      return;
    }
    const text = (n.textContent || '').trim();
    if (!text) return;
    if (!seenName && text.startsWith('>')) {
      quoteText = text.replace(/^>\s*/, '');
    } else if (!seenName) {
      quoteText = quoteText ? `${quoteText} ${text}` : text;
    } else {
      titleText = titleText ? `${titleText} ${text}` : text;
    }
  });

  const isFeatured = quoteText.length > 0;

  if (quoteText) {
    const quote = document.createElement('p');
    quote.classList.add('carousel-leadership-card-quote');
    quote.textContent = quoteText;
    body.append(quote);
  }

  const meta = document.createElement('div');
  meta.classList.add('carousel-leadership-card-meta');

  if (nameEl) {
    const name = document.createElement('span');
    name.classList.add('carousel-leadership-card-name');
    name.textContent = nameEl.textContent.trim();
    meta.append(name);
  }
  if (titleText) {
    const title = document.createElement('span');
    title.classList.add('carousel-leadership-card-title');
    title.textContent = titleText;
    meta.append(title);
  }
  body.append(meta);

  return isFeatured;
}

export default function decorate(block) {
  const rows = [...block.children];

  const scroller = document.createElement('ul');
  scroller.classList.add('carousel-leadership-track');

  const singleCard = rows.length === 1;

  rows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells[0];
    const contentCell = cells[1] || cells[0];

    const card = document.createElement('li');
    card.classList.add('carousel-leadership-card');

    const imgWrap = document.createElement('div');
    imgWrap.classList.add('carousel-leadership-card-image');
    const pic = imageCell && (imageCell.querySelector('picture') || imageCell.querySelector('img'));
    if (pic) imgWrap.append(pic.closest('picture') || pic);

    const body = document.createElement('div');
    body.classList.add('carousel-leadership-card-body');
    const isFeatured = buildBody(contentCell, body);

    if (isFeatured || singleCard) {
      card.classList.add('carousel-leadership-card-featured');
    }

    // Whole card is clickable when the content linked to a bio page.
    const href = (contentCell.querySelector('a[href]') || {}).href
      || contentCell.querySelector('a[href]')?.getAttribute('href');

    if (href) {
      const anchor = document.createElement('a');
      anchor.classList.add('carousel-leadership-card-link');
      anchor.setAttribute('href', href);
      anchor.append(imgWrap, body);
      card.append(anchor);
    } else {
      card.append(imgWrap, body);
    }

    scroller.append(card);
    row.remove();
  });

  block.append(scroller);

  if (scroller.children.length > 1) {
    block.classList.add('carousel-leadership-slider');
    buildNavButtons(block, scroller);
  }
}
