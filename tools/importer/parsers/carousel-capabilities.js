/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-capabilities.
 * Base block: carousel.
 * Source: https://www.stagwellglobal.com/ (.et_pb_section_4 .stagwell-main-slider)
 * Generated: 2026-06-16
 *
 * Dark rotating slider with 5 real slides (indices 01-05). The source HTML
 * contains duplicated `.slick-cloned` slides (infinite-loop clones) that must
 * be skipped. Each slide table row uses the standard carousel format:
 *   - cell 1: slide image
 *   - cell 2: text content (index, name/title, descriptive text)
 */
export default function parse(element, { document }) {
  // Each unique slide is wrapped in an .et_pb_dp_dmb_module_820_item. The slider
  // duplicates slides as .slick-cloned for the infinite loop, so we defensively
  // exclude any item that lives inside a cloned slide and dedupe by numeric index.
  const slideItems = Array.from(
    element.querySelectorAll('.et_pb_dp_dmb_module_820_item'),
  ).filter((item) => !item.closest('.slick-cloned'));

  const cells = [['Carousel (capabilities)']];
  const seenIndexes = new Set();

  slideItems.forEach((item) => {
    const indexEl = item.querySelector('.stagwell-main-slider__index');
    const nameEl = item.querySelector('.stagwell-main-slider__name');
    const textEl = item.querySelector('.stagwell-main-slider__text');
    const imageEl = item.querySelector('img.stagwell-main-slider__image, .stagwell-main-slider__image-wrap img');

    // Dedupe by the numeric slide index (01-05). Skip anything we have already
    // emitted (defensive against residual clones) or items with no index.
    const indexKey = indexEl ? indexEl.textContent.trim() : '';
    if (!indexKey || seenIndexes.has(indexKey)) return;
    seenIndexes.add(indexKey);

    const imageCell = imageEl || '';

    const contentCell = [];
    if (indexEl) contentCell.push(indexEl);
    if (nameEl) contentCell.push(nameEl);
    if (textEl) contentCell.push(textEl);

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-capabilities',
    cells,
  });
  element.replaceWith(block);
}
