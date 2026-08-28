/**
 * High-reliability A4 printing utility for browser and iframe sandboxes.
 * Ensures exact A4 page size, print margins, background colors, and crisp typography.
 */

export interface PrintA4Options {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  margin?: string;
  autoPrint?: boolean;
}

export function printA4Element(
  elementOrId: string | HTMLElement,
  options: PrintA4Options = {}
): void {
  const {
    title = 'Uwezo Elite School - Document',
    orientation = 'portrait',
    margin = '8mm 10mm',
    autoPrint = true,
  } = options;

  let targetElement: HTMLElement | null = null;
  if (typeof elementOrId === 'string') {
    targetElement = document.getElementById(elementOrId);
  } else {
    targetElement = elementOrId;
  }

  if (!targetElement) {
    // If element not found, fallback to window.print()
    console.warn(`Print element not found: ${elementOrId}, falling back to window.print()`);
    window.print();
    return;
  }

  const htmlContent = targetElement.innerHTML;

  // Create a clean, isolated hidden iframe to host only the printable document
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Gather stylesheet links from current document (Tailwind, Google Fonts, etc.)
  const headLinks: string[] = [];
  const styleTags: string[] = [];

  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    headLinks.push(link.outerHTML);
  });

  document.querySelectorAll('style').forEach((st) => {
    styleTags.push(st.outerHTML);
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
      ${headLinks.join('\n')}
      ${styleTags.join('\n')}
      <style>
        @page {
          size: A4 ${orientation};
          margin: ${margin};
        }
        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          background-color: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          font-size: 12px;
          line-height: 1.4;
        }
        .no-print, [data-no-print="true"] {
          display: none !important;
        }
        .printable-a4-sheet {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        .break-inside-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      </style>
    </head>
    <body>
      <div class="printable-a4-sheet">
        ${htmlContent}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Wait for fonts and images to load before triggering print
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print failed, calling window.print()', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  // Give a short delay for rendering styles/fonts
  setTimeout(triggerPrint, 350);
}
