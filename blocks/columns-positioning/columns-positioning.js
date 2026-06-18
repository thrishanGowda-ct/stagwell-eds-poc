export default function decorate(block) {
  const row = block.firstElementChild;
  const [col1, col2, col3] = [...row.children];

  // Move "Effective" heading inline into col1's h2 as a styled span
  const heading1 = col1?.querySelector('h1,h2,h3,h4,h5,h6');
  const heading2 = col2?.querySelector('h1,h2,h3,h4,h5,h6');
  if (heading1 && heading2) {
    const span = document.createElement('span');
    span.className = 'columns-positioning-effective';
    span.textContent = heading2.textContent.trim();
    heading1.append(span);
    col2.remove();
  }

  if (col3) col3.classList.add('columns-positioning-cta-col');
}
