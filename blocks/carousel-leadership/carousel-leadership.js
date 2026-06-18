/**
 * carousel-leadership block
 *
 * Two instances in the leadership section:
 *   1. Featured chairman card (single row, pull-quote)
 *   2. People slider (multi-row horizontal carousel)
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
    const gap = 20;
    const amount = card ? card.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
    scroller.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  nav.querySelector('.slide-prev').addEventListener('click', () => scrollByCard(-1));
  nav.querySelector('.slide-next').addEventListener('click', () => scrollByCard(1));
  block.append(nav);
}

/**
 * @param {Element} contentCell
 * @param {Element} body
 * @returns {boolean}
 */
function buildBody(contentCell, body) {
  const link = contentCell.querySelector('a[href]');
  const source = link || contentCell;
  const nameEl = source.querySelector('strong');
  const blockquote = source.querySelector('blockquote');

  const textChunks = [];
  source.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'P') {
      n.childNodes.forEach((c) => textChunks.push(c));
    } else {
      textChunks.push(n);
    }
  });

  let quoteText = blockquote ? blockquote.textContent.trim() : '';
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
    } else if (!seenName && !quoteText) {
      quoteText = quoteText ? `${quoteText} ${text}` : text;
    } else if (seenName) {
      titleText = titleText ? `${titleText} ${text}` : text;
    }
  });

  const isFeatured = quoteText.length > 0;

  if (quoteText) {
    const icon = document.createElement('div');
    icon.classList.add('carousel-leadership-quote-icon');
    icon.setAttribute('aria-hidden', 'true');
    body.append(icon);

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

  let hasFeatured = false;

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

    if (isFeatured) {
      card.classList.add('carousel-leadership-card-featured');
      hasFeatured = true;
    }

    const linkEl = contentCell.querySelector('a[href]');
    const href = linkEl?.href || linkEl?.getAttribute('href');

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
  } else if (hasFeatured) {
    block.classList.add('carousel-leadership-is-featured');
  }
}
