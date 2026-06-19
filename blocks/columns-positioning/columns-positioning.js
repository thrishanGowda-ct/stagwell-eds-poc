/**
 * columns-positioning block
 * Homepage: merges "Effective" into the main heading; CTA in third column.
 * About Us: two-column text + image ("Our Story") on /en/about-us.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const columns = [...row.children];
  const imageColIndex = columns.findIndex((col) => col.querySelector('picture, img'));

  if (imageColIndex >= 0 && columns.length === 2) {
    block.classList.add('columns-positioning-media');
    const imageFirst = imageColIndex === 0;
    const textCol = imageFirst ? columns[1] : columns[0];
    const imageCol = columns[imageColIndex];

    if (imageFirst) {
      block.classList.add('columns-positioning-media-left');
      imageCol.classList.add('columns-positioning-media-image');
      textCol.classList.add('columns-positioning-media-text');
    } else {
      textCol.classList.add('columns-positioning-media-text');
      imageCol.classList.add('columns-positioning-media-image');
    }

    const arHeading = textCol.querySelector('h3');
    if (arHeading && /ar tech/i.test(arHeading.textContent)) {
      block.classList.add('columns-positioning-ar');
      textCol.classList.add('columns-positioning-ar-text');
      const accent = arHeading.querySelector('strong, em, span');
      if (accent && /^action/i.test(accent.textContent.trim())) {
        accent.classList.add('columns-positioning-ar-accent');
      } else if (/action/i.test(arHeading.textContent)) {
        arHeading.innerHTML = arHeading.innerHTML.replace(
          /(<strong>)?Action(\s*)(<\/strong>)?/i,
          '<span class="columns-positioning-ar-accent">Action$2</span>',
        );
      }
      const quote = textCol.querySelector('blockquote');
      if (quote) {
        quote.classList.add('columns-positioning-ar-quote');
        const quoteParagraph = quote.querySelector('p');
        if (quoteParagraph) {
          quoteParagraph.innerHTML = quoteParagraph.innerHTML
            .replace(/^[\s\u201C\u201D"'‘’]+/, '')
            .replace(/[\s\u201C\u201D"'‘’]+$/, '');
        }
      }
      const cite = [...textCol.querySelectorAll('p')].find((p) => (
        !p.querySelector('strong') && /^forbes$/i.test(p.textContent.trim())
      ));
      if (cite) {
        cite.classList.add('columns-positioning-ar-cite');
        cite.querySelector('em')?.classList.add('columns-positioning-ar-cite-name');
      }
      return;
    }

    const headings = [...textCol.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const lead = headings.find((h) => /^our$/i.test(h.textContent.trim()));
    const accent = headings.find((h) => /^(story|impact)$/i.test(h.textContent.trim()));
    if (lead && accent) {
      const span = document.createElement('span');
      span.className = 'columns-positioning-story-accent';
      span.textContent = accent.textContent.trim();
      lead.append(document.createTextNode(' '), span);
      accent.remove();
    } else {
      const heading = headings[0];
      if (heading && !heading.querySelector('span') && /^our\s+story$/i.test(heading.textContent.trim())) {
        heading.innerHTML = 'Our <span class="columns-positioning-story-accent">Story</span>';
      }
    }
    return;
  }

  const [col1, col2, col3] = columns;
  const heading1 = col1?.querySelector('h1, h2, h3, h4, h5, h6');
  const heading2 = col2?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading1 && heading2) {
    const span = document.createElement('span');
    span.className = 'columns-positioning-effective';
    span.textContent = heading2.textContent.trim();
    heading1.append(span);
    col2.remove();
  }

  if (col3) col3.classList.add('columns-positioning-cta-col');
}
