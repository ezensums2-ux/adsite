$(function () {
  const defaults = {
    display: 'inline-block',
    text: '표시 대상',
    position: 'static',
    offsetX: 18,
    offsetY: 12,
    zIndex: 2
  };

  const $display = $('#display-mode');
  const $text = $('#display-text');
  const $position = $('#position-mode');
  const $offsetX = $('#offset-x');
  const $offsetY = $('#offset-y');
  const $zIndex = $('#z-index');
  const $displayTarget = $('#display-target');
  const $positionTarget = $('#position-target');
  const $displayNote = $('#display-note');
  const $positionNote = $('#position-note');
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

  function getNumber($input, fallback, minimum, maximum) {
    const parsed = Number($input.val());
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
  }

  function getValues() {
    const displayOptions = ['block', 'inline', 'inline-block', 'none'];
    const positionOptions = ['static', 'relative', 'absolute', 'sticky'];
    return {
      display: displayOptions.includes($display.val()) ? $display.val() : defaults.display,
      text: escapeHtml($text.val() || defaults.text),
      position: positionOptions.includes($position.val()) ? $position.val() : defaults.position,
      offsetX: getNumber($offsetX, defaults.offsetX, 0, 120),
      offsetY: getNumber($offsetY, defaults.offsetY, 0, 100),
      zIndex: getNumber($zIndex, defaults.zIndex, 0, 10)
    };
  }

  function createDocument(values) {
    const offsetRules = values.position === 'relative' || values.position === 'absolute'
      ? `  left: ${values.offsetX}px;\n  top: ${values.offsetY}px;\n`
      : values.position === 'sticky'
        ? `  top: ${values.offsetY}px;\n`
        : '';

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>CSS display와 position 예시</title>
  <style>
    .display-target {
      display: ${values.display};
    }
    .position-stage {
      position: relative;
      height: 240px;
      overflow: auto;
    }
    .position-target {
      position: ${values.position};
${offsetRules}  z-index: ${values.zIndex};
    }
  </style>
</head>
<body>
  <div class="display-stage">
    <span class="display-target">${values.text}</span>
    <span class="display-neighbor">이웃 요소</span>
  </div>
  <div class="position-stage">
    <div class="position-content">
      <span class="position-target">이동 대상</span>
      <p>스크롤 영역 안의 다른 콘텐츠</p>
    </div>
  </div>
</body>
</html>`;
  }

  function render() {
    const values = getValues();
    const usesLeftOffset = values.position === 'relative' || values.position === 'absolute';
    const usesTopOffset = usesLeftOffset || values.position === 'sticky';
    const usesZIndex = values.position !== 'static';

    $displayTarget.text($text.val() || defaults.text).css('display', values.display);
    $displayNote.text(`display: ${values.display} · ${values.display === 'none' ? '요소가 화면과 흐름에서 사라집니다.' : '이웃 요소와 놓이는 방식을 비교해 보세요.'}`);
    $positionTarget.text('이동 대상').css({
      position: values.position,
      left: usesLeftOffset ? `${values.offsetX}px` : '',
      top: usesTopOffset ? `${values.offsetY}px` : '',
      zIndex: values.zIndex
    });
    $offsetX.prop('disabled', !usesLeftOffset);
    $offsetY.prop('disabled', !usesTopOffset);
    $zIndex.prop('disabled', !usesZIndex);
    $('#offset-x-value').text(`${values.offsetX}px`);
    $('#offset-y-value').text(`${values.offsetY}px`);
    $('#z-index-value').text(values.zIndex);
    const positionDetails = values.position === 'static'
      ? '오프셋과 z-index는 static에서 적용되지 않습니다.'
      : values.position === 'sticky'
        ? `top: ${values.offsetY}px · z-index: ${values.zIndex}`
        : `left: ${values.offsetX}px · top: ${values.offsetY}px · z-index: ${values.zIndex}`;
    $positionNote.text(`position: ${values.position} · ${positionDetails}`);
    $output.val(createDocument(values));
  }

  $('#display-mode, #display-text, #position-mode, #offset-x, #offset-y, #z-index').on('input change', render);

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
    $display.val(defaults.display);
    $text.val(defaults.text);
    $position.val(defaults.position);
    $offsetX.val(defaults.offsetX);
    $offsetY.val(defaults.offsetY);
    $zIndex.val(defaults.zIndex);
    $('#position-stage').scrollTop(0);
    $copyStatus.text('');
    render();
  });

  render();
});