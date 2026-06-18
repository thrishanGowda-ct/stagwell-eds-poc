/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-stats.
 * Base block: cards.
 * Source: https://www.stagwellglobal.com/
 *   (.et_pb_section_5 .et_pb_column_10  — Challenger Marketing Network)
 *   (.et_pb_section_8 .et_pb_column_13  — Investing in Stagwell)
 *   https://www.stagwellglobal.com/about-us/
 *   (#sw-featured-stats .et_pb_column_8 — Challenger stats)
 *   https://www.stagwellglobal.com/augmented-reality/
 *   (.et_pb_section_1 .et_pb_column_19 — Data Corner stats)
 * Shared across homepage, about-page, and augmented-reality templates.
 *
 * Source structure: a single Divi column (.et_pb_column) containing several
 * .et_pb_text stat modules. Each module wraps a .et_pb_text_inner holding an
 * <h4> (the headline number/value), an <h5> (the descriptive label), and —
 * on the Augmented Reality "Data Corner" — a description <p> with an
 * explanatory sentence (e.g. "have never used any AR technology.").
 *
 * Some homepage/about modules include an empty <p>&nbsp;</p> spacer (e.g. the
 * "$120B+ / ADDRESSABLE MARKET" stat) that carries no meaning and must be
 * ignored. We therefore keep every heading and every NON-EMPTY paragraph in
 * source order, while skipping paragraphs whose text content is empty /
 * whitespace / &nbsp; only.
 *
 * Target: cards "no-images" variant — text-only stat grid. One row per stat
 * with a single cell containing the number heading, its label heading, and
 * (when present) the description paragraph(s), in source order. The parser
 * operates on the single element passed to it, so it works identically for
 * every instance/template.
 */
export default function parse(element, { document }) {
  // Each stat is a Divi text module within the column. Scope to direct text
  // modules so we get one row per stat and skip wrapper/helper divs.
  const statModules = Array.from(
    element.querySelectorAll(':scope > .et_pb_text, :scope .et_pb_text'),
  );

  // Returns true when a node is a paragraph whose text is empty/whitespace/&nbsp;
  // only (a Divi layout spacer that must not be carried into the output).
  const isEmptyParagraph = (node) => {
    if (node.tagName !== 'P') return false;
    //   is the non-breaking space rendered from &nbsp;
    const text = (node.textContent || '').replace(/ /g, ' ').trim();
    return text.length === 0;
  };

  const cells = [];

  statModules.forEach((module) => {
    const inner = module.querySelector('.et_pb_text_inner') || module;

    // Collect headings (number + label) and any description paragraphs in
    // source order, dropping empty <p>&nbsp;</p> spacers.
    const content = Array.from(
      inner.querySelectorAll('h1, h2, h3, h4, h5, h6, p'),
    ).filter((node) => !isEmptyParagraph(node));

    // Only emit a row when the module carries meaningful stat content
    // (ignores empty/spacer-only and empty modules).
    if (content.length) {
      cells.push([content]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-stats', cells });
  element.replaceWith(block);
}
