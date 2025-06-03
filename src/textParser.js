export function convertTMPToHTML(tmp) {
  let html = tmp;

  // Headings
  html = html.replace(/<size=150%><b>(.*?)<\/b><\/size>/gi, '<h1>$1</h1>');
  html = html.replace(/<size=130%><b>(.*?)<\/b><\/size>/gi, '<h2>$1</h2>');
  html = html.replace(/<size=115%><b>(.*?)<\/b><\/size>/gi, '<h3>$1</h3>');

  // Inline formatting
  html = html.replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>');
  html = html.replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>');
  html = html.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');
  html = html.replace(/<link="(.*?)">(.*?)<\/link>/gi, '<a href="$1">$2</a>');

  // Handle lists
  // Group lines into blocks and replace in batch
  html = html.replace(/((?:\d+\. .+\n?)+)/g, match => {
    const items = match.trim().split(/\n/).map(line => line.replace(/^\d+\. /, '').trim());
    return `<ol>\n${items.map(i => `<li>${i}</li>`).join('\n')}\n</ol>`;
  });

  html = html.replace(/((?:• .+\n?)+)/g, match => {
    const items = match.trim().split(/\n/).map(line => line.replace(/^• /, '').trim());
    return `<ul>\n${items.map(i => `<li>${i}</li>`).join('\n')}\n</ul>`;
  });

  // Convert remaining line breaks to <br> if needed
  html = html.split(/\n{2,}/).map(block => `<p>${block.trim()}</p>`).join('\n');

  return html.trim();
}

export function convertQuillToTMP(html) {
  let tmp = html;

  // Headings
  tmp = tmp.replace(/<h1>(.*?)<\/h1>/gi, '<size=150%><b>$1</b></size>\n\n');
  tmp = tmp.replace(/<h2>(.*?)<\/h2>/gi, '<size=130%><b>$1</b></size>\n\n');
  tmp = tmp.replace(/<h3>(.*?)<\/h3>/gi, '<size=115%><b>$1</b></size>\n\n');

  // Bold, Italic, Underline
  tmp = tmp.replace(/<strong>(.*?)<\/strong>/gi, '<b>$1</b>');
  tmp = tmp.replace(/<em>(.*?)<\/em>/gi, '<i>$1</i>');
  tmp = tmp.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');

  // Hyperlinks
  tmp = tmp.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '<link="$1">$2</link>');

  // Ordered list items (Quill-style, no <ol>)
  let orderedIndex = 1;
  tmp = tmp.replace(/<li[^>]*data-list="ordered"[^>]*>(.*?)<\/li>/gi, (_, content) => {
    return `${orderedIndex++}. ${content.trim()}\n`;
  });

  // Unordered list items (Quill-style, no <ul>)
  tmp = tmp.replace(/<li[^>]*data-list="bullet"[^>]*>(.*?)<\/li>/gi, (_, content) => {
    return `• ${content.trim()}\n`;
  });

  // Paragraphs (keep inline formatting inside)
  tmp = tmp.replace(/<p>(.*?)<\/p>/gis, (_, content) => {
    return `${content.trim()}\n`;
  });

  // Line breaks
  tmp = tmp.replace(/<br\s*\/?>/gi, '\n');

  // Strip all other tags except TMP-allowed ones
  tmp = tmp.replace(/<(?!\/?(b|i|u|size|link)(?=>|\s.*>))\/?[^>]+>/gi, '');

  // Normalize spacing
  tmp = tmp.replace(/[ \t]+\n/g, '\n');         // Trim line-end spaces
  tmp = tmp.replace(/\n{3,}/g, '\n\n');         // Collapse triple line breaks
  tmp = tmp.trim();

  return tmp;
}