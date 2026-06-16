/**
 * hero-intro block
 * Wraps the second headline line (after the <br>) so it can be styled
 * in the display serif font to match the source design.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const heading = block.querySelector('h3');
  if (!heading) return;

  const br = heading.querySelector('br');
  if (!br) return;

  // Collect nodes that follow the <br> (the second line) into a styled span.
  const span = document.createElement('span');
  span.className = 'display-line';
  let node = br.nextSibling;
  while (node) {
    const next = node.nextSibling;
    span.appendChild(node);
    node = next;
  }
  if (span.childNodes.length) {
    heading.appendChild(span);
  }
}
