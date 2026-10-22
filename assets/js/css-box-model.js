$(function () {
  const defaults = {
    contentWidth: '200',
    padding: '20',
    border: '4',
    margin: '16',
    boxSizing: 'content-box',
    text: '콘텐츠 영역'
  };

  const $contentWidth = $('#content-width');
  const $padding = $('#padding-size');
  const $border = $('#border-size');
  const $margin = $('#margin-size');
  const $boxSizing = $('#box-sizing');
  const $text = $('#box-text');
  const $previewSample = $('#box-preview-sample');
  const $previewNote = $('#box-preview-note');
  const $output = $('#generated-code');
  const $copyStatus = $('#copy-status');

  function getValue($input, fallback, minimum, maximum) {
    const parsed = Number($input.val());
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : Number(fallback);
  }

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

  function getValues() {
    const boxSizing = $boxSizing.val() === 'border-box' ? 'border-box' : 'content-box';
    return {
      contentWidth: getValue($contentWidth, defaults.contentWidth, 100, 360),
      padding: getValue($padding, defaults.padding, 0, 60),
      border: getValue($border, defaults.border, 0, 20),
      margin: getValue($margin, defaults.margin, 0, 60),
      boxSizing: boxSizing,
      text: escapeHtml($text.val() || defaults.text)
    };
  }

  function createDocument(values) {
    const totalWidth = values.boxSizing === 'content-box'
      ? values.contentWidth + values.padding * 2 + values.border * 2
      : values.contentWidth;

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>CSS 박스 모델 예시</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 12px;
      font-family: sans-serif;
      color: #252431;
      background: #f7f4ff;
    }
    .stage {
      min-height: 330px;
      padding: 12px;
      overflow: auto;
      border: 1px dashed #c9bddf;
      border-radius: 10px;
      background: #fff;
    }
    .box {
      box-sizing: ${values.boxSizing};
      width: ${values.contentWidth}px;
      max-width: 100%;
      margin: ${values.margin}px;
      padding: ${values.padding}px;
      border: ${values.border}px solid #6546c8;
      border-radius: 8px;
      background: #f0ecfb;
      color: #5034ad;
      font-size: 14px;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .dimension-note {
      margin: 12px 0 0;
      color: #5f5b69;
      font-size: 12px;
      line-height: 1.6;
    }
    .dimension-note strong {
      color: #5034ad;
    }
  </style>
</head>
<body>
  <div class="stage">
    <div class="box">${values.text}</div>
    <p class="dimension-note">box-sizing: <strong>${values.boxSizing}</strong><br>
      ${values.boxSizing === 'content-box' ? '전체 너비' : '지정한 전체 너비'}: <strong>${totalWidth}px</strong>
      ${values.boxSizing === 'content-box' ? `(콘텐츠 ${values.contentWidth}px + 패딩 ${values.padding * 2}px + 테두리 ${values.border * 2}px)` : `(콘텐츠·패딩·테두리 포함, 마진 제외)`}
    </p>
  </div>
</body>
</html>`;
  }

  function render() {
    const values = getValues();
    const html = createDocument(values);
    const totalWidth = values.boxSizing === 'content-box'
      ? values.contentWidth + values.padding * 2 + values.border * 2
      : values.contentWidth;

    $previewSample.text($text.val() || defaults.text).css({
      boxSizing: values.boxSizing,
      width: `${values.contentWidth}px`,
      margin: `${values.margin}px`,
      padding: `${values.padding}px`,
      borderWidth: `${values.border}px`
    });
    $previewNote.html(`box-sizing: <strong>${values.boxSizing}</strong><br>${values.boxSizing === 'content-box' ? '전체 너비' : '지정한 전체 너비'}: <strong>${totalWidth}px</strong> ${values.boxSizing === 'content-box' ? `(콘텐츠 ${values.contentWidth}px + 패딩 ${values.padding * 2}px + 테두리 ${values.border * 2}px)` : '(콘텐츠·패딩·테두리 포함, 마진 제외)'}`);
    $output.val(html);
  }

  $('#content-width, #padding-size, #border-size, #margin-size, #box-sizing, #box-text').on('input change', render);

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
    $contentWidth.val(defaults.contentWidth);
    $padding.val(defaults.padding);
    $border.val(defaults.border);
    $margin.val(defaults.margin);
    $boxSizing.val(defaults.boxSizing);
    $text.val(defaults.text);
    $copyStatus.text('');
    render();
  });

  render();
});
