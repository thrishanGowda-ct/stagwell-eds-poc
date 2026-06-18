/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-intro.
 * Base block: hero
 * Source URL: https://www.stagwellglobal.com/
 * Selector: .et_pb_section_0
 * Generated: 2026-06-16
 *
 * Page intro for the Stagwell homepage:
 *   - Extended Stagwell logo image (linked)
 *   - Earnings webcast announcement line with an inline link
 *   - Two-line large headline ("Transforming" / "Marketing")
 *
 * Output structure (hero):
 *   Row 1: block name ('hero-intro')
 *   Row 2: logo image (background/lead image cell)
 *   Row 3: content cell -> webcast announcement paragraph + combined headline
 */
export default function parse(element, { document }) {
  // --- INPUT EXTRACTION (validated against .et_pb_section_0 source HTML) ---

  // Extended Stagwell logo image. First image module in the section.
  const logoImg = element.querySelector('.et_pb_image_0 img, .et_pb_image img');

  // Circular play-icon shown before the webcast line (second image module).
  const playIcon = element.querySelector('.et_pb_image_1 img');

  // Walk the text modules in source order so the parser adapts to whatever
  // mix of headings/paragraphs a page provides (the homepage leads with an
  // announcement paragraph then the headline; About Us leads with the headline
  // then an intro paragraph). Consecutive headings are merged into one
  // multi-line headline; paragraphs are kept in place.
  const textInners = Array.from(element.querySelectorAll('.et_pb_text .et_pb_text_inner'));
  const items = [];
  textInners.forEach((inner) => {
    Array.from(inner.children)
      .filter((node) => node.matches('h1, h2, h3, h4, h5, h6, p'))
      .forEach((node) => items.push(node));
    // Fallback: text module with no element children (plain text) → wrap as <p>.
    if (!inner.children.length && (inner.textContent || '').trim()) {
      const p = document.createElement('p');
      p.textContent = inner.textContent.trim();
      items.push(p);
    }
  });

  // --- BUILD CELLS (matches hero block table structure) ---
  const cells = [];

  // Lead image row (only if logo present).
  if (logoImg) {
    cells.push([logoImg]);
  }

  // Content row. Wrap in a single container so the row renders as ONE column.
  const contentCell = document.createElement('div');

  // Play-icon precedes the content.
  if (playIcon) {
    const iconPara = document.createElement('p');
    iconPara.append(playIcon);
    contentCell.append(iconPara);
  }

  // Emit items in order, merging runs of consecutive headings into a single
  // multi-line heading element.
  let i = 0;
  while (i < items.length) {
    const node = items[i];
    if (/^h[1-6]$/i.test(node.tagName)) {
      const runLevel = node.tagName.toLowerCase();
      const lines = [];
      while (i < items.length && /^h[1-6]$/i.test(items[i].tagName)) {
        const t = (items[i].textContent || '').trim();
        if (t.length) lines.push(t);
        i += 1;
      }
      const heading = document.createElement(runLevel);
      heading.innerHTML = lines.join('<br>');
      contentCell.append(heading);
    } else {
      contentCell.append(node);
      i += 1;
    }
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-intro', cells });
  element.replaceWith(block);
}
