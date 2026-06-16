/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature.
 * Base block: cards.
 * Source: https://www.stagwellglobal.com/ (.et_pb_section_3 .et_pb_row_3)
 * Generated for Stagwell Global homepage migration.
 *
 * Source structure: a Divi row containing three .et_pb_column items
 * (et_pb_column_6, _7, _8). Each column holds a category heading (h3),
 * a feature image, and a descriptive paragraph.
 *
 * Target: standard cards block — one row per card, image in the first
 * cell, text content (heading + paragraph) in the second cell.
 */
export default function parse(element, { document }) {
  // Each card is a Divi column within the row. Direct-child scoping avoids
  // pulling nested helper divs as separate cards.
  const columns = Array.from(element.querySelectorAll(':scope > .et_pb_column'));

  const cells = [];

  columns.forEach((column) => {
    // Image cell: prefer the real <img> inside the image module.
    const image = column.querySelector('.et_pb_image img, img');

    // Text content: category heading + descriptive paragraph.
    const heading = column.querySelector('h1, h2, h3, h4, h5, h6');
    const paragraph = column.querySelector('.et_pb_text .et_pb_text_inner p, .et_pb_text_inner p, p');

    const body = [];
    if (heading) body.push(heading);
    if (paragraph) body.push(paragraph);

    // Only emit a card row when there is meaningful content.
    if (image || body.length) {
      cells.push([image || '', body.length ? body : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
