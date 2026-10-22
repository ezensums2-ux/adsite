$(function () {
  const $page = $('[data-animation-demo]');
  if (!$page.length) return;

  const mode = $page.data('animation-demo');
  const $object = $('#animation-object');
  const $output = $('#animation-code');
  const $copyStatus = $('#animation-copy-status');
  const $dynamicStyle = $('<style id="animation-demo-styles"></style>').appendTo('head');
  const defaults = {
    transform: { x: 0, y: 0, rotate: 0, scale: 100, origin: 'center' },
    transition: { property: 'transform', duration: 500, timing: 'ease', delay: 0, active: false },
    keyframes: { preset: 'pulse', duration: 1000, count: '1' },
    examples: { preset: 'lift', duration: 700, iterations: '1' }
  };

  function numberValue(selector, fallback, minimum, maximum) {
    const value = Number($(selector).val());
    return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
  }

  function documentCode(title, html, css) {
    return `<!doctype html>\n<html lang="ko">\n<head>\n  <meta charset="utf-8">\n  <title>${title}</title>\n  <style>\n${css}\n  </style>\n</head>\n<body>\n${html}\n</body>\n</html>`;
  }

  function renderTransform() {
    const x = numberValue('#transform-x', 0, -80, 80);
    const y = numberValue('#transform-y', 0, -80, 80);
    const rotate = numberValue('#transform-rotate', 0, -180, 180);
    const scale = numberValue('#transform-scale', 100, 50, 150) / 100;
    const originOptions = ['center', 'top left', 'bottom right'];
    const origin = originOptions.includes($('#transform-origin').val()) ? $('#transform-origin').val() : defaults.transform.origin;
    const transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
    $object.css({ transform, transformOrigin: origin });
    $('#transform-x-value').text(`${x}px`);
    $('#transform-y-value').text(`${y}px`);
    $('#transform-rotate-value').text(`${rotate}deg`);
    $('#transform-scale-value').text(`${Math.round(scale * 100)}%`);
    $('#animation-preview-note').text(`translate(${x}px, ${y}px) · rotate(${rotate}deg) · scale(${scale})`);
    $output.val(documentCode('Transform 실습', '<div class="target">변형 대상</div>', `    .target {\n      transform: ${transform};\n      transform-origin: ${origin};\n    }`));
  }

  function renderTransition() {
    const properties = ['transform', 'background-color', 'opacity'];
    const timings = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
    const property = properties.includes($('#transition-property').val()) ? $('#transition-property').val() : defaults.transition.property;
    const timing = timings.includes($('#transition-timing').val()) ? $('#transition-timing').val() : defaults.transition.timing;
    const duration = numberValue('#transition-duration', 500, 100, 2000);
    const delay = numberValue('#transition-delay', 0, 0, 1000);
    const active = $('#transition-active').prop('checked');
    const transition = `${property} ${duration}ms ${timing} ${delay}ms`;
    $object.css({
      transition,
      transform: active && property === 'transform' ? 'translateX(54px) scale(1.15)' : '',
      backgroundColor: active && property === 'background-color' ? '#bce8df' : '',
      opacity: active && property === 'opacity' ? '.35' : ''
    });
    $('#transition-duration-value').text(`${duration}ms`);
    $('#transition-delay-value').text(`${delay}ms`);
    $('#animation-preview-note').text(`transition: ${transition} · ${active ? '끝 상태 적용 중' : '기본 상태'}`);
    const endState = property === 'transform' ? 'transform: translateX(54px) scale(1.15);' : property === 'background-color' ? 'background-color: #bce8df;' : 'opacity: .35;';
    $output.val(documentCode('Transition 실습', '<button class="target">상태 변화</button>', `    .target {\n      transition: ${transition};\n    }\n    .target.is-active {\n      ${endState}\n    }`));
  }

  function keyframeRules(preset) {
    const rules = {
      pulse: '@keyframes pulse {\n      0%, 100% { transform: scale(1); }\n      50% { transform: scale(1.28); }\n    }',
      slide: '@keyframes slide {\n      0%, 100% { transform: translateX(-55px); }\n      50% { transform: translateX(55px); }\n    }',
      spin: '@keyframes spin {\n      from { transform: rotate(0deg); }\n      to { transform: rotate(360deg); }\n    }'
    };
    return rules[preset] || rules.pulse;
  }

  function renderKeyframes() {
    const presets = ['pulse', 'slide', 'spin'];
    const preset = presets.includes($('#keyframes-preset').val()) ? $('#keyframes-preset').val() : defaults.keyframes.preset;
    const duration = numberValue('#keyframes-duration', 1000, 300, 3000);
    const count = ['1', '3', 'infinite'].includes($('#keyframes-count').val()) ? $('#keyframes-count').val() : defaults.keyframes.count;
    const css = `${keyframeRules(preset)}\n    .target {\n      animation: ${preset} ${duration}ms ease-in-out ${count};\n      animation-fill-mode: both;\n    }\n    @media (prefers-reduced-motion: reduce) {\n      .target { animation-duration: 0.01ms; animation-iteration-count: 1; }\n    }`;
    $dynamicStyle.text(css);
    $object.css('animation', 'none');
    $('#keyframes-duration-value').text(`${duration}ms`);
    $('#animation-play').text('재생').attr('aria-pressed', 'false').data('playing', false).data('has-played', false);
    $('#animation-preview-note').text(`${preset} · ${duration}ms · ${count === 'infinite' ? '계속 반복' : `${count}회 반복`}`);
    $output.val(documentCode('Keyframes 실습', '<div class="target">재생 대상</div>', css));
  }

  function exampleKeyframes(preset) {
    const rules = {
      lift: '@keyframes card-lift {\n      from { transform: translateY(0); box-shadow: 0 2px 5px rgb(37 36 49 / 12%); }\n      to { transform: translateY(-12px); box-shadow: 0 16px 26px rgb(37 36 49 / 20%); }\n    }',
      pulse: '@keyframes status-pulse {\n      0%, 100% { transform: scale(1); background-color: #eee9fb; }\n      50% { transform: scale(1.12); background-color: #dff4ef; }\n    }',
      shake: '@keyframes attention-shake {\n      0%, 100% { transform: translateX(0); }\n      25% { transform: translateX(-8px); }\n      75% { transform: translateX(8px); }\n    }'
    };
    return rules[preset] || rules.lift;
  }

  function renderExamples() {
    const presets = ['lift', 'pulse', 'shake'];
    const preset = presets.includes($('#effect-preset').val()) ? $('#effect-preset').val() : defaults.examples.preset;
    const duration = numberValue('#effect-duration', 700, 200, 1600);
    const iterations = ['1', '2', '3'].includes($('#effect-iterations').val()) ? $('#effect-iterations').val() : defaults.examples.iterations;
    const animationName = { lift: 'card-lift', pulse: 'status-pulse', shake: 'attention-shake' }[preset];
    const css = `${exampleKeyframes(preset)}\n    .target {\n      animation: ${animationName} ${duration}ms ease-in-out ${iterations};\n      animation-fill-mode: both;\n    }\n    @media (prefers-reduced-motion: reduce) {\n      .target { animation-duration: 0.01ms; animation-iteration-count: 1; }\n    }`;
    $dynamicStyle.text(css);
    $object.css('animation', 'none');
    $('#animation-play').text('효과 재생').prop('disabled', false);
    $('#effect-duration-value').text(`${duration}ms`);
    $('#animation-preview-note').text(`${preset} · ${duration}ms · ${iterations}회`);
    $output.val(documentCode('CSS 효과 예제', '<button class="target">상호작용</button>', css));
  }

  const renderers = { transform: renderTransform, transition: renderTransition, keyframes: renderKeyframes, examples: renderExamples };
  const render = renderers[mode];
  if (!render) return;

  $page.on('input.animation change.animation', 'input, select', render);
  $('#animation-reset').on('click', function () {
    const values = defaults[mode];
    Object.keys(values).forEach(function (key) {
      const selector = `#${mode}-${key}`;
      if ($(selector).attr('type') === 'checkbox') $(selector).prop('checked', values[key]);
      else $(selector).val(values[key]);
    });
    $('#animation-stop').trigger('click');
    $copyStatus.text('');
    render();
  });

  $('#animation-play').on('click', function () {
    const $button = $(this);
    if (mode === 'examples') {
      renderExamples();
      const preset = $('#effect-preset').val();
      const duration = numberValue('#effect-duration', 700, 200, 1600);
      const iterations = $('#effect-iterations').val();
      const animationName = { lift: 'card-lift', pulse: 'status-pulse', shake: 'attention-shake' }[preset];
      $object[0].offsetWidth;
      $object.css('animation', `${animationName} ${duration}ms ease-in-out ${iterations} both`);
      $button.text('재생 중').prop('disabled', true);
      $('#animation-preview-note').text(`${preset} 효과 재생 중`);
      return;
    }
    if ($button.data('playing')) {
      $object.css('animationPlayState', 'paused');
      $button.data('playing', false).text('계속 재생').attr('aria-pressed', 'false');
      $('#animation-preview-note').text('애니메이션을 일시 정지했습니다.');
      return;
    }
    if ($button.data('has-played')) {
      $object.css('animationPlayState', 'running');
      $button.data('playing', true).text('일시 정지').attr('aria-pressed', 'true');
      return;
    }
    renderKeyframes();
    const duration = numberValue('#keyframes-duration', 1000, 300, 3000);
    const preset = $('#keyframes-preset').val();
    const count = $('#keyframes-count').val();
    $object[0].offsetWidth;
    $object.css('animation', `${preset} ${duration}ms ease-in-out ${count} both`);
    $button.data('playing', true).data('has-played', true).text('일시 정지').attr('aria-pressed', 'true');
    $('#animation-preview-note').text('애니메이션 재생 중');
  });

  $('#animation-stop').on('click', function () {
    $object.css('animation', 'none');
    $('#animation-play').data('playing', false).data('has-played', false).text('재생').attr('aria-pressed', 'false');
    $('#animation-preview-note').text('처음 상태로 돌아왔습니다.');
  });

  $object.on('animationend', function () {
    if (mode === 'examples') {
      $('#animation-play').text('다시 재생').prop('disabled', false);
      $('#animation-preview-note').text('효과가 끝났습니다. 다시 재생할 수 있습니다.');
      return;
    }
    if (mode !== 'keyframes' || $('#keyframes-count').val() === 'infinite') return;
    $('#animation-play').data('playing', false).data('has-played', false).text('다시 재생').attr('aria-pressed', 'false');
    $('#animation-preview-note').text('재생이 끝났습니다. 다시 재생할 수 있습니다.');
  });

  $('#animation-copy').on('click', async function () {
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