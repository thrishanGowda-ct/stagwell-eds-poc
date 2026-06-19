/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature.
 * Base block: cards.
 *
 * Shared across multiple templates with two distinct source layouts:
 *
 * 1. Homepage / multi-column grid (e.g. .et_pb_section_3 .et_pb_row_3):
 *    a single Divi row holding several .et_pb_column items, each column being
 *    one card (category heading h3 + feature image + descriptive paragraph).
 *    -> emit ONE card row per column. (Original homepage behaviour, unchanged.)
 *
 * 2. Augmented Reality / single-article stacked rows (e.g.
 *    .et_pb_section_0 .et_pb_row_4 / _6 / _8): each row is ONE article laid
 *    out as an image column (.et_pb_column_1_4 with .et_pb_image img) plus a
 *    text column (.et_pb_column_1_2 with an h4 title, a description paragraph,
 *    and a "Read More" paragraph/link). The importer calls this parser once
 *    per matched row, so each AR row must become exactly ONE card combining
 *    the image + (title + description + Read More).
 *
 * Disambiguation: a multi-column grid card-set has multiple headings (one per
 * card), whereas a single-article AR row has exactly one heading for the whole
 * row. We count the headings in the element to decide which layout applies.
 *
 * Target: standard cards block — one row per card, image in the first cell,
 * text content (heading + paragraph(s) + link) in the second cell.
 */
export default function parse(element, { document }) {
  const cells = [];

  // All content headings within this element (across every column).
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));

  if (headings.length <= 1) {
    // ---- Single-article layout (Augmented Reality stacked rows) ----
    // The whole row is one card: take the row's image plus the heading,
    // description paragraph(s) and the "Read More" link/paragraph.
    const image = element.querySelector('.et_pb_image img, img');
    const heading = headings[0] || null;

    // Text paragraphs (description + "Read More") live in the text column.
    // Prefer an explicit link if "Read More" is a real anchor; otherwise keep
    // the paragraph so the call-to-action text is preserved.
    const paragraphs = Array.from(
      element.querySelectorAll('.et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p'),
    );

    const body = [];
    if (heading) body.push(heading);
    paragraphs.forEach((p) => body.push(p));

    if (image || body.length) {
      cells.push([image || '', body.length ? body : '']);
    }
  } else {
    // ---- Multi-column grid layout (homepage feature cards) ----
    // Each direct-child Divi column is one card. Direct-child scoping avoids
    // pulling nested helper divs as separate cards.
    const columns = Array.from(element.querySelectorAll(':scope > .et_pb_column'));

    columns.forEach((column) => {
      // Image cell: prefer the real <img> inside the image module.
      const image = column.querySelector('.et_pb_image img, img');

      // Text content: category heading + descriptive paragraph(s).
      const heading = column.querySelector('h1, h2, h3, h4, h5, h6');
      const paragraphs = Array.from(
        column.querySelectorAll('.et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p'),
      );

      const body = [];
      if (heading) body.push(heading);
      paragraphs.forEach((p) => body.push(p));

      // Only emit a card row when there is meaningful content.
      if (image || body.length) {
        cells.push([image || '', body.length ? body : '']);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
