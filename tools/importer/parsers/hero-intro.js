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

  // Earnings webcast announcement line (paragraph with inline link).
  const announcement = element.querySelector('.et_pb_text_0 .et_pb_text_inner, .et_pb_text_0 p');

  // Two-line headline lives across two text modules, each containing a single heading.
  const headingNodes = Array.from(
    element.querySelectorAll('.et_pb_text_1 h1, .et_pb_text_1 h2, .et_pb_text_1 h3, .et_pb_text_2 h1, .et_pb_text_2 h2, .et_pb_text_2 h3'),
  );

  // --- BUILD CELLS (matches hero block table structure) ---
  const cells = [];

  // Lead image row (only if logo present).
  if (logoImg) {
    cells.push([logoImg]);
  }

  // Content row: announcement line followed by the combined headline.
  // Wrap in a single container so the row renders as ONE column (one cell),
  // not multiple columns.
  const contentCell = document.createElement('div');

  if (announcement) {
    contentCell.append(announcement);
  }

  if (headingNodes.length) {
    // Combine the two headline lines into a single heading so it renders as
    // one two-line headline ("Transforming Marketing"). Preserve the heading level.
    const level = headingNodes[0].tagName.toLowerCase();
    const heading = document.createElement(level);
    const lines = headingNodes
      .map((h) => (h.textContent || '').trim())
      .filter((t) => t.length);
    heading.innerHTML = lines.join('<br>');
    contentCell.append(heading);
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-intro', cells });
  element.replaceWith(block);
}
