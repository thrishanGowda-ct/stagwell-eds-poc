/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-positioning.
 * Base block: columns
 * Source: https://www.stagwellglobal.com/ (.et_pb_section_2 .et_pb_row_2)
 * Generated: 2026-06-16
 *
 * Layout: 3-column positioning statement.
 *   - Column 1: heading "Creative+Connected="
 *   - Column 2: heading "Effective"
 *   - Column 3: paragraph + "Our Story" CTA link (href /about-us/)
 *
 * Output (standard columns block): a single row with one cell per column.
 */
export default function parse(element, { document }) {
  // Direct child columns of the row (validated against source.html: .et_pb_column_3/_4/_5)
  const columns = Array.from(element.querySelectorAll(':scope > .et_pb_column'));

  // Build one cell per column. Each cell collects the column's image (if any),
  // text content (headings/paragraphs) and any CTA link(s) within that column.
  const rowCells = columns.map((column) => {
    const cellContent = [];

    // Image module(s): an image-only column (e.g. Our Story / Our Impact) has
    // no text modules, just a picture/img. Include it so the column renders.
    const img = column.querySelector('.et_pb_image img, picture img, img');

    // Text modules: headings and paragraphs (et_pb_text inner content)
    const textNodes = Array.from(
      column.querySelectorAll('.et_pb_text_inner > *, .et_pb_text_inner'),
    ).filter((node) => node.matches('h1, h2, h3, h4, h5, h6, p'));

    if (textNodes.length) {
      cellContent.push(...textNodes);
    } else if (img) {
      // Image-only column: use the image as the cell content.
      cellContent.push(img);
    } else {
      // Fallback: if no specific heading/paragraph nodes were found, take the inner wrapper.
      const inner = column.querySelector('.et_pb_text_inner');
      if (inner) cellContent.push(inner);
    }

    // Testimonial / pull-quote module (e.g. the "Our AR Tech in Action" Forbes
    // quote). Capture the quote text as a <blockquote> and the author line so
    // the quote isn't dropped. Absent on pages with no testimonial (no-op).
    const testimonial = column.querySelector('.et_pb_testimonial');
    if (testimonial) {
      const quoteText = testimonial.querySelector(
        '.et_pb_testimonial_content, blockquote, p',
      );
      const author = testimonial.querySelector('.et_pb_testimonial_author');
      if (quoteText && (quoteText.textContent || '').trim()) {
        const bq = document.createElement('blockquote');
        bq.innerHTML = quoteText.innerHTML;
        cellContent.push(bq);
      }
      if (author && (author.textContent || '').trim()) {
        const cite = document.createElement('p');
        cite.innerHTML = `<em>${author.textContent.trim()}</em>`;
        cellContent.push(cite);
      }
    }

    // CTA link(s): inline button links (e.g. "Our Story" → /about-us/)
    const ctaLinks = Array.from(
      column.querySelectorAll('.stw_inline_button a, a.sw-btn__link, a[href]'),
    );
    // De-duplicate links that may match multiple selectors above
    const seen = new Set();
    ctaLinks.forEach((link) => {
      if (!seen.has(link)) {
        seen.add(link);
        cellContent.push(link);
      }
    });

    return cellContent.length ? cellContent : '';
  });

  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-positioning',
    cells,
  });
  element.replaceWith(block);
}
