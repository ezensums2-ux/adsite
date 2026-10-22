$(function () {
  const defaults = {
    color: '#6546c8',
    format: 'hex',
    size: '1.5',
    unit: 'rem',
    text: '색상과 크기를 바꿔 보세요!'
  };

  const unitDefaults = {
    px: '24',
    rem: '1.5',
    em: '1.2',
    '%': '120',
    vw: '5',
    vh: '5'
  };

  const $color = $('#text-color');
  const $format = $('#color-format');
  const $size = $('#size-value');
  const $unit = $('#size-unit');
  const $text = $('#sample-text');
  const $previewSample = $('#unit-preview-sample');
  const $previewNote = $('#unit-preview-note');
  const $output = $('#generated-code');
  const $copyStatus = $('#copy-status');

  function getColorValues(hex) {
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);
    const redRatio = red / 255;
    const greenRatio = green / 255;
    const blueRatio = blue / 255;
    const max = Math.max(redRatio, greenRatio, blueRatio);
    const min = Math.min(redRatio, greenRatio, blueRatio);
    const delta = max - min;
    let hue = 0;

    if (delta) {
      if (max === redRatio) hue = ((greenRatio - blueRatio) / delta) % 6;
      else if (max === greenRatio) hue = (blueRatio - redRatio) / delta + 2;
      else hue = (redRatio - greenRatio) / delta + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    const lightness = (max + min) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

    return {
      hex: hex.toLowerCase(),
      rgb: `rgb(${red}, ${green}, ${blue})`,
      hsl: `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`
    };
  }

  function getValues() {
    const parsedSize = Number($size.val());
    const maximumSize = $unit.val() === '%' ? 200 : 100;
    const safeSize = Number.isFinite(parsedSize) ? Math.min(maximumSize, Math.max(0.1, parsedSize)) : Number(unitDefaults[$unit.val()]);
    return {
      color: getColorValues($color.val() || defaults.color)[$format.val()] || defaults.color,
      size: safeSize,
      unit: $unit.val() || defaults.unit,
      text: $text.val() || defaults.text
    };
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

  function createDocument(values) {
    const safeText = escapeHtml(values.text);
    const safeSize = `${values.size}${values.unit}`;
    const safeColor = values.color;

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>CSS 색상과 단위 예시</title>
  <style>
    html {
      font-size: 16px;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: sans-serif;
      color: #252431;
      background: #f7f4ff;
    }
    .size-context {
      padding: 16px;
      border: 1px solid #ddd7ea;
      border-radius: 10px;
      background: #fff;
      font-size: 20px;
    }
    .sample-text {
      margin: 0;
      color: ${safeColor};
      font-size: ${safeSize};
      font-weight: 700;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .context-note {
      margin: 16px 0 0;
      color: #777486;
      font-size: 12px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="size-context">
    <p class="sample-text">${safeText}</p>
  </div>
  <p class="context-note">기준: html 16px · 부모 글자 크기 20px · 선택한 값 ${values.size}${values.unit}</p>
</body>
</html>`;
  }

  function render() {
    const values = getValues();
    const html = createDocument(values);
    $previewSample.text(values.text).css({
      color: values.color,
      fontSize: `${values.size}${values.unit}`
    });
    $previewNote.text(`기준: html 16px · 부모 글자 크기 20px · 선택한 값 ${values.size}${values.unit}`);
    $output.val(html);
  }

  $unit.on('change', function () {
    $size.val(unitDefaults[$unit.val()]);
    render();
  });

  $('#text-color, #color-format, #size-value, #sample-text').on('input change', render);

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
    $color.val(defaults.color);
    $format.val(defaults.format);
    $size.val(defaults.size);
    $unit.val(defaults.unit);
    $text.val(defaults.text);
    $copyStatus.text('');
    render();
  });

  render();
});
