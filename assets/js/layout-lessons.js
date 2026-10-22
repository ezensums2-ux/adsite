$(function () {
  const $page = $('[data-layout-demo]');
  if (!$page.length) return;

  const mode = $page.data('layout-demo');
  const $stage = $('#layout-demo-stage');
  const $output = $('#layout-code');
  const $copyStatus = $('#layout-copy-status');
  const defaultValues = {
    flexbox: { direction: 'row', justify: 'flex-start', align: 'stretch', gap: 12, wrap: 'nowrap', count: 4 },
    grid: { columns: 3, gap: 12, span: false },
    responsive: { width: 720 },
    examples: { pattern: 'dashboard', gap: 12 }
  };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function numberValue(selector, fallback, minimum, maximum) {
    const value = Number($(selector).val());
    return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
  }

  function itemsMarkup(count) {
    return Array.from({ length: count }, function (_, index) {
      return `<div class="layout-demo-item">항목 ${index + 1}</div>`;
    }).join('');
  }

  function createDocument(title, html, css) {
    return `<!doctype html>\n<html lang="ko">\n<head>\n  <meta charset="utf-8">\n  <title>${title}</title>\n  <style>\n${css}\n  </style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
  }

  function renderFlexbox() {
    const direction = ['row', 'row-reverse', 'column'].includes($('#flex-direction').val()) ? $('#flex-direction').val() : 'row';
    const justify = ['flex-start', 'center', 'space-between', 'space-around'].includes($('#flex-justify').val()) ? $('#flex-justify').val() : 'flex-start';
    const align = ['stretch', 'center', 'flex-start', 'flex-end'].includes($('#flex-align').val()) ? $('#flex-align').val() : 'stretch';
    const wrap = $('#flex-wrap').val() === 'wrap' ? 'wrap' : 'nowrap';
    const gap = numberValue('#flex-gap', 12, 0, 32);
    const count = numberValue('#flex-count', 4, 3, 7);
    $stage.css({ display: 'flex', flexDirection: direction, justifyContent: justify, alignItems: align, flexWrap: wrap, gap: `${gap}px` }).html(itemsMarkup(count));
    $('#flex-gap-value').text(`${gap}px`);
    $('#flex-count-value').text(`${count}개`);
    $('#layout-preview-note').text(`flex-direction: ${direction} · justify-content: ${justify} · align-items: ${align} · ${wrap}`);
    const css = `    .flex-demo {\n      display: flex;\n      min-height: 220px;\n      flex-direction: ${direction};\n      justify-content: ${justify};\n      align-items: ${align};\n      flex-wrap: ${wrap};\n      gap: ${gap}px;\n    }`;
    $output.val(createDocument('Flexbox 실습', `<div class="flex-demo">\n${Array.from({ length: count }, (_, index) => `  <div>항목 ${index + 1}</div>`).join('\n')}\n</div>`, css));
  }

  function renderGrid() {
    const columns = numberValue('#grid-columns', 3, 2, 4);
    const gap = numberValue('#grid-gap', 12, 0, 32);
    const span = $('#grid-span').prop('checked') && columns > 1;
    $stage.css({ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${gap}px` }).html(itemsMarkup(6));
    $stage.children().first().css('gridColumn', span ? 'span 2' : 'auto');
    $('#grid-columns-value').text(`${columns}열`);
    $('#grid-gap-value').text(`${gap}px`);
    $('#layout-preview-note').text(`grid-template-columns: repeat(${columns}, minmax(0, 1fr)) · 첫 아이템 ${span ? '2열 차지' : '기본 배치'}`);
    const css = `    .grid-demo {\n      display: grid;\n      grid-template-columns: repeat(${columns}, minmax(0, 1fr));\n      gap: ${gap}px;\n    }${span ? '\n    .grid-demo > :first-child {\n      grid-column: span 2;\n    }' : ''}`;
    $output.val(createDocument('Grid 실습', `<div class="grid-demo">\n${Array.from({ length: 6 }, (_, index) => `  <div>항목 ${index + 1}</div>`).join('\n')}\n</div>`, css));
  }

  function renderResponsive() {
    const width = numberValue('#responsive-width', 720, 320, 1100);
    const columns = width <= 520 ? 1 : width <= 820 ? 2 : 3;
    $stage.css({ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '12px' }).html(itemsMarkup(6));
    $('#responsive-width-value').text(`${width}px`);
    $('#layout-preview-note').text(`${width}px 화면 예시 · ${columns}열 레이아웃`);
    const css = `    .responsive-grid {\n      display: grid;\n      grid-template-columns: repeat(3, minmax(0, 1fr));\n      gap: 12px;\n    }\n    @media (max-width: 820px) {\n      .responsive-grid {\n        grid-template-columns: repeat(2, minmax(0, 1fr));\n      }\n    }\n    @media (max-width: 520px) {\n      .responsive-grid {\n        grid-template-columns: 1fr;\n      }\n    }`;
    $output.val(createDocument('반응형 그리드', `<div class="responsive-grid">\n${Array.from({ length: 6 }, (_, index) => `  <article>콘텐츠 ${index + 1}</article>`).join('\n')}\n</div>`, css));
  }

  function renderExamples() {
    const pattern = ['dashboard', 'gallery', 'split'].includes($('#example-pattern').val()) ? $('#example-pattern').val() : 'dashboard';
    const gap = numberValue('#example-gap', 12, 4, 28);
    const examples = {
      dashboard: {
        name: '대시보드',
        labels: ['상단 헤더', '사이드 메뉴', '주요 콘텐츠', '하단 정보'],
        areas: '"header header" "sidebar main" "footer footer"',
        columns: '150px minmax(0, 1fr)',
        rows: 'auto 1fr auto',
        markup: '<header>상단 헤더</header>\n  <aside>사이드 메뉴</aside>\n  <main>주요 콘텐츠</main>\n  <footer>하단 정보</footer>',
        css: `      grid-template-columns: 150px minmax(0, 1fr);\n      grid-template-rows: auto 1fr auto;\n      grid-template-areas: "header header" "sidebar main" "footer footer";\n      min-height: 250px;\n      gap: ${gap}px;\n    }\n    .dashboard-demo > * { padding: 14px; background: #e8f6f3; border-radius: 6px; }\n    .dashboard-demo header { grid-area: header; }\n    .dashboard-demo aside { grid-area: sidebar; }\n    .dashboard-demo main { grid-area: main; }\n    .dashboard-demo footer { grid-area: footer; }\n    @media (max-width: 560px) {\n      .dashboard-demo { grid-template-columns: 1fr; grid-template-areas: "header" "main" "sidebar" "footer"; }\n    }`
      },
      gallery: {
        name: '카드 갤러리',
        labels: ['카드 1', '카드 2', '카드 3', '카드 4', '카드 5', '카드 6'],
        columns: 'repeat(auto-fit, minmax(120px, 1fr))',
        markup: Array.from({ length: 6 }, (_, index) => `<article>카드 ${index + 1}</article>`).join('\n  '),
        css: `      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n      gap: ${gap}px;\n    }\n    .gallery-demo article { min-height: 72px; padding: 12px; background: #f0ecfb; border-radius: 6px; }`
      },
      split: {
        name: '콘텐츠 분할',
        labels: ['본문 콘텐츠', '보조 정보'],
        columns: 'minmax(0, 1.6fr) minmax(120px, .8fr)',
        markup: '<main>본문 콘텐츠</main>\n  <aside>보조 정보</aside>',
        css: `      grid-template-columns: minmax(0, 1.6fr) minmax(120px, .8fr);\n      gap: ${gap}px;\n    }\n    .split-demo > * { min-height: 150px; padding: 14px; background: #e8f6f3; border-radius: 6px; }\n    @media (max-width: 560px) {\n      .split-demo { grid-template-columns: 1fr; }\n    }`
      }
    };
    const example = examples[pattern];
    $stage.attr('data-example', pattern).css({ display: 'grid', gap: `${gap}px`, gridTemplateColumns: example.columns || '' }).html(example.labels.map(label => `<div class="layout-demo-item">${escapeHtml(label)}</div>`).join(''));
    if (pattern === 'dashboard') $stage.css({ gridTemplateAreas: example.areas, gridTemplateRows: example.rows }).children().each(function (index) { $(this).css('gridArea', ['header', 'sidebar', 'main', 'footer'][index]); });
    if (pattern === 'split') $stage.children().first().replaceWith('<div class="layout-demo-item">본문 콘텐츠</div>').next().replaceWith('<div class="layout-demo-item">보조 정보</div>');
    $('#example-gap-value').text(`${gap}px`);
    $('#layout-preview-note').text(`${example.name} · 간격 ${gap}px`);
    const css = `    .${pattern}-demo {\n      display: grid;\n${example.css}`;
    $output.val(createDocument(`${example.name} 레이아웃`, `<div class="${pattern}-demo">\n  ${example.markup}\n</div>`, css));
  }

  const renderers = { flexbox: renderFlexbox, grid: renderGrid, responsive: renderResponsive, examples: renderExamples };
  const render = renderers[mode];
  if (!render) return;

  $page.on('input.layout change.layout', 'input, select', render);
  $('#layout-reset').on('click', function () {
    const values = defaultValues[mode];
    Object.keys(values).forEach(function (key) {
      const selector = `#${mode === 'flexbox' ? `flex-${key}` : mode === 'grid' ? `grid-${key}` : mode === 'responsive' ? `responsive-${key}` : `example-${key}`}`;
      if ($(selector).attr('type') === 'checkbox') $(selector).prop('checked', values[key]);
      else $(selector).val(values[key]);
    });
    $copyStatus.text('');
    render();
  });

  $('#layout-copy').on('click', async function () {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText($output.val());
      $copyStatus.text('코드를 복사했습니다.');
    } catch (error) {
      $output.trigger('focus').trigger('select');
      const copied = document.execCommand('copy');
      $copyStatus.text(copied ? '코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
    }
  });

  render();
});