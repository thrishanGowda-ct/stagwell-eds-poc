function parseStatValue(text) {
  const match = text.trim().match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
  return {
    prefix: match[1], value: parseFloat(match[2]), suffix: match[3], decimals,
  };
}

function runCountUp(h4, parsed) {
  const {
    prefix, value, suffix, decimals,
  } = parsed;
  const duration = 600;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - t) ** 3;
    const current = value * eased;
    h4.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
    else h4.textContent = h4.dataset.target;
  }
  requestAnimationFrame(step);
}

/**
 * cards-stats block
 * When the section contains a .default-content-wrapper sibling (real CMS pages),
 * marks the section with has-cards-stats-intro so CSS can render it as a two-column
 * panel (grey editorial left, white stats right) without any DOM restructuring.
 * Falls back to detecting an authored first block row with h2/h3 (draft/test HTML).
 * Remaining rows are stat items — h4 (large number) + h5 (uppercase label).
 * Adds scroll-triggered entrance animation and count-up for numeric values.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const section = block.closest('.section');
  let statRows = rows;
  let introEl = null;

  // Case 1: sibling .default-content-wrapper in the section (real CMS content).
  // CSS grid on the section handles the layout — no DOM restructuring needed.
  const siblingWrapper = section && section.querySelector(':scope > .default-content-wrapper');
  if (siblingWrapper) {
    section.classList.add('has-cards-stats-intro');
  }

  // Case 2: first block row contains a heading (draft / test HTML).
  if (!siblingWrapper && rows.length > 0 && rows[0].querySelector('h1,h2,h3')) {
    introEl = document.createElement('div');
    introEl.className = 'cards-stats-intro';
    [...rows[0].children].forEach((cell) => {
      while (cell.firstElementChild) introEl.append(cell.firstElementChild);
    });
    statRows = rows.slice(1);
    block.classList.add('has-intro');
    if (section) section.classList.add('has-cards-stats-intro');
  }

  // Build stats list before clearing the block
  const ul = document.createElement('ul');
  statRows.forEach((row, index) => {
    const li = document.createElement('li');
    li.style.setProperty('--anim-delay', `${index * 150}ms`);
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) li.append(cell.firstElementChild);
    });
    ul.append(li);
  });

  block.textContent = '';
  if (introEl) block.append(introEl);
  block.append(ul);

  // Prepare count-up: parse h4 values and reset display to 0
  const countUpData = new Map();
  [...ul.children].forEach((li) => {
    const h4 = li.querySelector('h4');
    if (!h4) return;
    const original = h4.textContent.trim();
    h4.dataset.target = original;
    const parsed = parseStatValue(original);
    if (parsed) {
      countUpData.set(li, parsed);
      h4.textContent = `${parsed.prefix}0${parsed.suffix}`;
    }
  });

  block.classList.add('has-animation');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      [...ul.children].forEach((li, index) => {
        const delay = index * 150;
        setTimeout(() => li.classList.add('is-visible'), delay);
        const parsed = countUpData.get(li);
        if (parsed) setTimeout(() => runCountUp(li.querySelector('h4'), parsed), delay + 50);
      });
    });
  }, { threshold: 0.2 });

  observer.observe(ul);
}
