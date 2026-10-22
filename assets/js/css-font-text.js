$(function () {
  const defaults = {
    family: 'sans',
    size: '24',
    weight: '700',
    align: 'center',
    lineHeight: '1.6',
    decoration: 'none',
    text: '읽기 편한 글은 글꼴과 줄 간격의 조화에서 시작됩니다.'
  };

  const families = {
    sans: 'Arial, "Malgun Gothic", sans-serif',
    serif: 'Georgia, "Batang", serif',
    mono: 'Consolas, "Courier New", monospace',
    system: 'system-ui, sans-serif'
  };

  const $family = $('#font-family');
  const $size = $('#font-size');
  const $weight = $('#font-weight');
  const $align = $('#text-align');
  const $lineHeight = $('#line-height');
  const $decoration = $('#text-decoration');
  const $text = $('#sample-text');
  const $previewSample = $('#font-preview-sample');
  const $output = $('#generated-code');
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

  function getValues() {
    const parsedSize = Number($size.val());
    const fontSize = Number.isFinite(parsedSize) ? Math.min(48, Math.max(12, parsedSize)) : Number(defaults.size);
    const family = families[$family.val()] ? $family.val() : defaults.family;
    const weightOptions = ['400', '700', '900'];
    const alignOptions = ['left', 'center', 'right'];
    const lineHeightOptions = ['1.2', '1.6', '2'];
    const decorationOptions = ['none', 'underline', 'line-through'];

    return {
      family: family,
      fontFamily: families[family],
      size: fontSize,
      weight: weightOptions.includes($weight.val()) ? $weight.val() : defaults.weight,
      align: alignOptions.includes($align.val()) ? $align.val() : defaults.align,
      lineHeight: lineHeightOptions.includes($lineHeight.val()) ? $lineHeight.val() : defaults.lineHeight,
      decoration: decorationOptions.includes($decoration.val()) ? $decoration.val() : defaults.decoration,
      text: $text.val() || defaults.text
    };
  }

  function createDocument(values) {
    const safeText = escapeHtml(values.text);
    const safeFamily = values.fontFamily;

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>CSS 글꼴과 텍스트 예시</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    .text-sample {
      margin: 0;
      padding: 18px;
      border: 1px solid #ddd7ea;
      border-radius: 10px;
      background: #fff;
      font-family: ${safeFamily};
      font-size: ${values.size}px;
      font-weight: ${values.weight};
      text-align: ${values.align};
      line-height: ${values.lineHeight};
      text-decoration: ${values.decoration};
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <p class="text-sample">${safeText}</p>
</body>
</html>`;
  }

  function render() {
    const values = getValues();
    const html = createDocument(values);
    $previewSample.text(values.text).css({
      fontFamily: values.fontFamily,
      fontSize: `${values.size}px`,
      fontWeight: values.weight,
      textAlign: values.align,
      lineHeight: values.lineHeight,
      textDecoration: values.decoration
    });
    $output.val(html);
  }

  $('#font-family, #font-size, #font-weight, #text-align, #line-height, #text-decoration, #sample-text').on('input change', render);

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
    $family.val(defaults.family);
    $size.val(defaults.size);
    $weight.val(defaults.weight);
    $align.val(defaults.align);
    $lineHeight.val(defaults.lineHeight);
    $decoration.val(defaults.decoration);
    $text.val(defaults.text);
    $copyStatus.text('');
    render();
  });

  render();
});
