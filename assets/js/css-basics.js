$(function () {
  const defaults = {
    method: 'external',
    selector: 'tag',
    color: '#6546c8',
    text: 'CSS가 연결되었어요!'
  };

  const $method = $('#connection-method');
  const $selector = $('#selector-type');
  const $color = $('#sample-color');
  const $text = $('#sample-text');
  const $inlineNote = $('#inline-selector-note');
  const $previewSample = $('#connection-preview-sample');
  const $previewNote = $('#connection-preview-note');
  const $output = $('#generated-code');
  const $formatLabel = $('#code-format-label');
  const $copyStatus = $('#copy-status');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function getSelector() {
    const type = $selector.val();
    if (type === 'class') return { css: '.notice', attributes: 'class="notice"' };
    if (type === 'id') return { css: '#message', attributes: 'id="message"' };
    return { css: 'p', attributes: '' };
  }

  function buildHtml(values, selector) {
    const safeText = escapeHtml(values.text || defaults.text);
    const attributes = selector.attributes ? ` ${selector.attributes}` : '';

    if (values.method === 'inline') {
      return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>인라인 CSS 예시</title>
</head>
<body>
  <p${attributes} style="color: ${values.color};">${safeText}</p>
</body>
</html>`;
    }

    if (values.method === 'internal') {
      return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>내부 CSS 예시</title>
  <style>
    ${selector.css} {
      color: ${values.color};
    }
  </style>
</head>
<body>
  <p${attributes}>${safeText}</p>
</body>
</html>`;
    }

    return `<!-- index.html -->
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>외부 CSS 예시</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <p${attributes}>${safeText}</p>
</body>
</html>

/* style.css */
${selector.css} {
  color: ${values.color};
}`;
  }

  function render() {
    const method = $method.val() || defaults.method;
    const selector = getSelector();
    const values = {
      method: method,
      methodLabel: $method.find(':selected').text(),
      color: $color.val() || defaults.color,
      text: $text.val()
    };

    $inlineNote.prop('hidden', method !== 'inline');
    $selector.prop('disabled', method === 'inline');
    $output.val(buildHtml(values, selector));
    $previewSample.text(values.text || defaults.text).css('color', values.color);
    $previewNote.text(`연결 방법: ${values.methodLabel} · 선택 대상: ${selector.css}`);
    $formatLabel.text(method === 'external' ? 'HTML과 style.css' : 'HTML 문서');
  }

  $('#connection-method, #selector-type, #sample-color, #sample-text').on('input change', render);

  async function copyCode() {
    const text = $output.val();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $copyStatus.text('코드를 복사했습니다.');
    } catch (error) {
      $output.focus();
      $output[0].select();
      try {
        const copied = document.execCommand('copy');
        $copyStatus.text(copied ? '코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      } catch (copyError) {
        $copyStatus.text('코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      }
    }
  }

  $('#copy-code').on('click', copyCode);

  $('#reset-practice').on('click', function () {
    $method.val(defaults.method);
    $selector.val(defaults.selector);
    $color.val(defaults.color);
    $text.val(defaults.text);
    $copyStatus.text('');
    render();
  });

  render();
});
