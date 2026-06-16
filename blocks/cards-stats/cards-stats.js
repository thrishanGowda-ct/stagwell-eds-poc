/**
 * cards-stats block
 * Renders a grid of statistics. Each row authored as a single cell containing
 * a large number (h4) and an uppercase label (h5). Converts rows to ul/li for
 * a semantic, easily styled grid.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    // Move the authored cell contents (number + label) into the list item.
    [...row.children].forEach((cell) => {
      while (cell.firstElementChild) li.append(cell.firstElementChild);
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
