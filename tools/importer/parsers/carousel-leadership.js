/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-leadership.
 * Base block: carousel.
 * Source: https://www.stagwellglobal.com/about-us/
 *   - .et_pb_section_3 .stw_featured_person  (the featured leader, Mark Penn)
 *   - .et_pb_section_3 .stw_people_slider     (the ~20 people cards)
 * Generated: 2026-06-18
 *
 * The page template maps this block to TWO instances, so this parser is invoked
 * once per element. It detects which kind of element it received:
 *   - a featured-person element  -> emits a single featured lead row
 *   - a people-slider element    -> emits one row per person card
 * Each call produces its own carousel-leadership block; the featured block sits
 * directly before the slider block in the same section, matching the original.
 *
 * Target row shape (per the carousel-leadership block decorator):
 *   - cell 1: portrait image
 *   - cell 2: content (optional pull-quote, name, title) wrapped in a bio link.
 *             A pull-quote in the content marks the card as "featured".
 *
 * NOTE: stagwell-cleanup.js strips the slider chrome (nav arrows + counter)
 * before parsing, so we only parse the real people content.
 */

/**
 * Build the content cell for a person: an anchor (bio link) wrapping the
 * optional pull-quote, name and title. Returns an array of nodes for the cell.
 */
function buildContentCell(document, { href, quote, name, title }) {
  const anchor = document.createElement('a');
  if (href) anchor.setAttribute('href', href);

  if (quote) {
    const bq = document.createElement('blockquote');
    bq.textContent = quote;
    anchor.append(bq);
  }
  if (name) {
    const nameEl = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = name;
    nameEl.append(strong);
    anchor.append(nameEl);
  }
  if (title) {
    const titleEl = document.createElement('p');
    titleEl.textContent = title;
    anchor.append(titleEl);
  }

  // If there is no bio link, return the inner nodes directly (no empty anchor).
  if (!href) return [...anchor.childNodes];
  return [anchor];
}

export default function parse(element, { document }) {
  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // -- Featured person instance ------------------------------------------
  // Match either the .stw_featured_person module element or a node that
  // contains a featured-person wrapper.
  const featuredRoot = element.matches('.stw_featured_person')
    ? element.querySelector('.stw-featured-person')
    : element.querySelector('.stw-featured-person');

  if (featuredRoot || element.matches('.stw_featured_person')) {
    const root = featuredRoot || element;
    const image = root.querySelector('.image-wrapper img, img');
    const quote = text(root.querySelector('.quote'));
    const name = text(root.querySelector('.details .name, .name'));
    const title = text(root.querySelector('.details .position, .position'));
    const link = root.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Bail gracefully if there is no meaningful content.
    if (!image && !name && !quote) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const contentCell = buildContentCell(document, { href, quote, name, title });
    const cells = [[image || '', contentCell]];

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'carousel-leadership',
      cells,
    });
    element.replaceWith(block);
    return;
  }

  // -- People slider instance --------------------------------------------
  // Each person is uniquely represented by a .stw-people-slider-item-wrapper
  // (Divi duplicates the et_pb_module shell, but the wrapper appears once per
  // person), so scope to those to avoid double-counting.
  const personWrappers = Array.from(
    element.querySelectorAll('.stw-people-slider-item-wrapper'),
  );

  const cells = [];
  personWrappers.forEach((wrapper) => {
    const item = wrapper.querySelector('.stw-people-slider-item') || wrapper;
    const image = item.querySelector('.image-wrapper img, img');
    const name = text(item.querySelector('.details .name, .name'));
    const title = text(item.querySelector('.details .position, .position'));
    const link = wrapper.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    if (!image && !name) return;

    const contentCell = buildContentCell(document, { href, quote: '', name, title });
    cells.push([image || '', contentCell]);
  });

  // Bail gracefully if no people were found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-leadership',
    cells,
  });
  element.replaceWith(block);
}
