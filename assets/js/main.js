$(function () {
  // 각 도구는 독립적인 상태를 유지해 탭을 바꿔도 사용자가 설정한 값을 잃지 않도록 합니다.
  const gradientPresets = {
    violet: { kind: 'linear', start: '#7c3aed', end: '#38bdf8', from: 0, to: 100, angle: 135, center: 'center' },
    sunset: { kind: 'linear', start: '#f97316', end: '#ec4899', from: 0, to: 100, angle: 135, center: 'center' },
    mint: { kind: 'linear', start: '#34d399', end: '#38bdf8', from: 5, to: 95, angle: 90, center: 'center' },
    peach: { kind: 'radial', start: '#fda4af', end: '#facc15', from: 0, to: 100, angle: 135, center: 'center' }
  };
  const shadowPresets = {
    soft: { x: 0, y: 8, blur: 24, spread: -3, color: '#20172f', opacity: 16, inset: false },
    floating: { x: 0, y: 18, blur: 38, spread: -6, color: '#21182f', opacity: 22, inset: false },
    sharp: { x: 0, y: 5, blur: 0, spread: 0, color: '#21182f', opacity: 28, inset: false },
    inset: { x: 0, y: 3, blur: 14, spread: 0, color: '#21182f', opacity: 18, inset: true }
  };
  const defaults = {
    color: { r: 124, g: 58, b: 237, alpha: 100 },
    gradient: { kind: 'linear', start: '#7c3aed', end: '#38bdf8', from: 0, to: 100, angle: 135, center: 'center', preset: 'violet' },
    shadow: { ...shadowPresets.soft, preset: 'soft' },
    corners: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, linked: true },
    borders: { width: 3, style: 'solid', color: '#6546c8', radius: 12, top: true, right: true, bottom: true, left: true }
  };
  const state = {
    color: { ...defaults.color },
    gradient: { ...defaults.gradient },
    shadow: { ...defaults.shadow },
    corners: { ...defaults.corners },
    borders: { ...defaults.borders }
  };
  const colorFields = ['hex-input', 'rgb-r', 'rgb-g', 'rgb-b', 'hsl-h', 'hsl-s', 'hsl-l'];
  const colorErrors = {
    'hex-input': 'hex-error', 'rgb-r': 'rgb-r-error', 'rgb-g': 'rgb-g-error',
    'rgb-b': 'rgb-b-error', 'hsl-h': 'hsl-h-error', 'hsl-s': 'hsl-s-error', 'hsl-l': 'hsl-l-error'
  };

  colorFields.forEach(id => $(`#${id}`).attr('aria-describedby', colorErrors[id]));

  // HEX, RGB, HSL을 서로 변환할 때 RGB를 기준 상태로 유지해
  // 반복 변환으로 인한 반올림 오차가 누적되지 않도록 합니다.
  function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('');
  }

  function hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  // 투명도 백분율을 CSS Alpha와 HEX Alpha로 변환합니다.
  function alphaToHex(alpha) {
    return Math.round(alpha * 255 / 100).toString(16).padStart(2, '0').toUpperCase();
  }

  function formatAlpha(alpha) {
    return (alpha / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function rgbToHsl({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (delta > 0) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else hue = 60 * ((r - g) / delta + 4);
      if (hue < 0) hue += 360;
    }

    return {
      h: Number(hue.toFixed(1)),
      s: Number((saturation * 100).toFixed(1)),
      l: Number((lightness * 100).toFixed(1))
    };
  }

  function hslToRgb(hue, saturation, lightness) {
    hue = ((hue % 360) + 360) % 360;
    saturation /= 100;
    lightness /= 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const offset = lightness - chroma / 2;
    let channels;

    if (hue < 60) channels = [chroma, x, 0];
    else if (hue < 120) channels = [x, chroma, 0];
    else if (hue < 180) channels = [0, chroma, x];
    else if (hue < 240) channels = [0, x, chroma];
    else if (hue < 300) channels = [x, 0, chroma];
    else channels = [chroma, 0, x];

    return {
      r: Math.round((channels[0] + offset) * 255),
      g: Math.round((channels[1] + offset) * 255),
      b: Math.round((channels[2] + offset) * 255)
    };
  }

  function setColorError(id, message) {
    $(`#${id}`).attr('aria-invalid', String(Boolean(message)));
    $(`#${colorErrors[id]}`).text(message || '');
  }

  // 현재 색상 상태를 기준으로 미리보기와 CSS 코드를 갱신합니다.
  // 사용자가 입력 중인 필드는 값이 덮어써지지 않도록 보호합니다.
  function renderColor(skipId) {
    const rgb = state.color;
    const hsl = rgbToHsl(rgb);
    const hex = rgbToHex(rgb);
    const alpha = state.color.alpha;
    const alphaValue = formatAlpha(alpha);
    const rgbaValue = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaValue})`;
    const roundedHsl = {
      h: Math.round(hsl.h),
      s: Math.round(hsl.s),
      l: Math.round(hsl.l)
    };
    const hslValue = `hsl(${roundedHsl.h}, ${roundedHsl.s}%, ${roundedHsl.l}%)`;
    const hslaValue = `hsla(${roundedHsl.h}, ${roundedHsl.s}%, ${roundedHsl.l}%, ${alphaValue})`;
    const hexAlphaValue = `${hex.toUpperCase()}${alphaToHex(alpha)}`;
    const values = {
      'hex-input': hex.toUpperCase(), 'rgb-r': rgb.r, 'rgb-g': rgb.g, 'rgb-b': rgb.b,
      'hsl-h': hsl.h, 'hsl-s': hsl.s, 'hsl-l': hsl.l
    };

    colorFields.forEach(function (id) {
      const input = document.getElementById(id);
      const isActive = input === document.activeElement;
      const isInvalid = input.getAttribute('aria-invalid') === 'true';
      if (id !== skipId && !isActive && !isInvalid) $(`#${id}`).val(values[id]);
    });

    $('#color-picker').val(hex);
    $('#color-summary').text(hex.toUpperCase());
    $('#color-alpha').val(alpha);
    $('#color-alpha-value').text(`${alpha}%`);
    $('.alpha-choice').each(function () {
      $(this).attr('aria-pressed', String(Number($(this).data('alpha')) === alpha));
    });
    $('#color-preview-hex').text(hex.toUpperCase());
    $('#color-block, #background-example').css('background-color', rgbaValue);
    $('#text-example').css('color', rgbaValue);
    $('#rgba-compare-box').css('background-color', rgbaValue);
    $('#opacity-compare-box').css({ backgroundColor: hex, opacity: alpha / 100 });
    $('.swatch').each(function () {
      $(this).attr('aria-pressed', String($(this).data('color').toLowerCase() === hex));
    });

    const rgbValue = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    $('#color-hex-code').val(hex.toUpperCase());
    $('#color-rgb-code').val(rgbValue);
    $('#color-rgba-code').val(rgbaValue);
    $('#color-hsl-code').val(hslValue);
    $('#color-hsla-code').val(hslaValue);
    $('#color-hex-alpha-code').val(hexAlphaValue);
    updateColorCss();
  }

  // 선택한 CSS 속성과 색상값으로 복사 가능한 선언을 생성합니다.
  function updateColorCss() {
    const rgb = state.color;
    const declaration = `${$('#color-css-property').val()}: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${formatAlpha(state.color.alpha)});`;
    $('#color-css-code').val(declaration);
  }

  function parseColorInput(id) {
    const raw = String($(`#${id}`).val()).trim();
    if (id === 'hex-input') {
      const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(raw);
      if (!match) {
        setColorError(id, '올바른 HEX 색상 코드를 입력해주세요.');
        return null;
      }
      let value = match[1];
      if (value.length === 3) value = value.split('').map(char => char + char).join('');
      setColorError(id, '');
      $('#hex-input').val(`#${value.toUpperCase()}`);
      return hexToRgb(`#${value.toLowerCase()}`);
    }

    const isHsl = id.startsWith('hsl-');
    const ids = isHsl ? ['hsl-h', 'hsl-s', 'hsl-l'] : ['rgb-r', 'rgb-g', 'rgb-b'];
    const values = ids.map(fieldId => String($(`#${fieldId}`).val()).trim());
    const numbers = values.map(value => value === '' ? NaN : Number(value));
    const maximums = isHsl ? [360, 100, 100] : [255, 255, 255];
    const pattern = isHsl ? /^\d+(?:\.\d+)?$/ : /^\d+$/;

    ids.forEach(function (fieldId, index) {
      const valid = pattern.test(values[index]) && Number.isFinite(numbers[index]) && numbers[index] >= 0 && numbers[index] <= maximums[index];
      const message = isHsl
        ? `값은 0~${maximums[index]} 범위로 입력하세요.`
        : `RGB 값은 0~${maximums[index]} 사이의 정수로 입력하세요.`;
      setColorError(fieldId, valid ? '' : message);
    });

    const valid = numbers.every((value, index) => pattern.test(values[index]) && value >= 0 && value <= maximums[index]);
    if (!valid) return null;
    return isHsl
      ? hslToRgb(numbers[0], numbers[1], numbers[2])
      : { r: numbers[0], g: numbers[1], b: numbers[2] };
  }

  function updateColorFromField(id) {
    const color = parseColorInput(id);
    if (!color) return;
    state.color = { ...state.color, ...color };
    renderColor(id);
  }

  $('#color-picker').on('input', function () {
    state.color = { ...state.color, ...hexToRgb(this.value) };
    setColorError('hex-input', '');
    $('#hex-input').val(rgbToHex(state.color).toUpperCase());
    renderColor();
  });

  colorFields.forEach(function (id) {
    $(`#${id}`).on('input', function () {
      updateColorFromField(id);
    }).on('blur', function () {
      if (this.getAttribute('aria-invalid') !== 'true') {
        setColorError(id, '');
        renderColor();
      }
    });
  });

  $('.swatch').on('click', function () {
    state.color = { ...state.color, ...hexToRgb($(this).data('color')) };
    colorFields.forEach(id => setColorError(id, ''));
    renderColor();
  });

  $('#color-alpha').on('input', function () {
    state.color.alpha = Number(this.value);
    renderColor();
  });

  $('.alpha-choice').on('click', function () {
    state.color.alpha = Number($(this).data('alpha'));
    renderColor();
  });

  $('#color-css-property').on('change', updateColorCss);

  // 탭 이동은 방향키와 Home/End를 지원하고, 숨긴 패널은 포커스에서 제외합니다.
  function activateTab(tabId, moveFocus) {
    $('.tool-tab').each(function () {
      const active = this.id === tabId;
      $(this).attr({ 'aria-selected': String(active), tabindex: active ? '0' : '-1' }).toggleClass('active', active);
      $(`#${$(this).attr('aria-controls')}`).prop('hidden', !active);
    });
    if (moveFocus) $(`#${tabId}`).trigger('focus');
  }

  $('.tool-tab').on('click', function () {
    activateTab(this.id, false);
  }).on('keydown', function (event) {
    const tabs = $('.tool-tab').toArray();
    const index = tabs.indexOf(this);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[next].id, true);
  });

  // 메뉴에서 연결된 탭 주소로 들어오면 해당 도구를 먼저 보여줍니다.
  // 하위 메뉴에서 해시가 바뀌면 같은 페이지에서도 연결된 도구 탭을 전환합니다.
  function activateLinkedPanel() {
    const linkedPanel = window.location.hash;
    if (!linkedPanel) return;
    const linkedTab = $(`.tool-tab[aria-controls="${linkedPanel.slice(1)}"]`);
    if (linkedTab.length) activateTab(linkedTab.attr('id'), false);
  }

  activateLinkedPanel();
  window.addEventListener('hashchange', activateLinkedPanel);

  // 그라데이션 상태를 UI와 CSS 코드에 동시에 반영합니다.
  // 시작 위치가 끝 위치보다 커지면 한쪽 값을 보정해 비정상 상태를 막습니다.
  function renderGradient() {
    const gradient = state.gradient;
    const image = gradient.kind === 'linear'
      ? `linear-gradient(${gradient.angle}deg, ${gradient.start} ${gradient.from}%, ${gradient.end} ${gradient.to}%)`
      : `radial-gradient(circle at ${gradient.center}, ${gradient.start} ${gradient.from}%, ${gradient.end} ${gradient.to}%)`;

    $('#angle-control').prop('hidden', gradient.kind !== 'linear');
    $('#center-control').prop('hidden', gradient.kind !== 'radial');
    $('#gradient-preview').css('background-image', image);
    $('#gradient-code').val(`background: ${image};`);
    $('#gradient-start-position').val(gradient.from);
    $('#gradient-end-position').val(gradient.to);
    $('#gradient-start-value').text(`${gradient.from}%`);
    $('#gradient-end-value').text(`${gradient.to}%`);
    $('#gradient-angle').val(gradient.angle);
    $('#gradient-angle-value').text(`${gradient.angle}°`);
    $('#gradient-kind').val(gradient.kind);
    $('#gradient-start').val(gradient.start);
    $('#gradient-end').val(gradient.end);
    $('#gradient-center').val(gradient.center);
    $('[data-gradient-preset]').each(function () {
      $(this).attr('aria-pressed', String($(this).data('gradient-preset') === gradient.preset));
    });
  }

  $('#gradient-kind, #gradient-start, #gradient-end, #gradient-center').on('input change', function () {
    state.gradient.kind = $('#gradient-kind').val();
    state.gradient.start = $('#gradient-start').val();
    state.gradient.end = $('#gradient-end').val();
    state.gradient.center = $('#gradient-center').val();
    state.gradient.preset = '';
    renderGradient();
  });

  $('#gradient-angle').on('input', function () {
    state.gradient.angle = Number(this.value);
    state.gradient.preset = '';
    renderGradient();
  });

  $('#gradient-start-position, #gradient-end-position').on('input', function () {
    const gradient = state.gradient;
    if (this.id === 'gradient-start-position') {
      gradient.from = Number(this.value);
      if (gradient.from > gradient.to) gradient.to = gradient.from;
    } else {
      gradient.to = Number(this.value);
      if (gradient.to < gradient.from) gradient.from = gradient.to;
    }
    gradient.preset = '';
    renderGradient();
  });

  $('[data-gradient-preset]').on('click', function () {
    const preset = $(this).data('gradient-preset');
    Object.assign(state.gradient, gradientPresets[preset], { preset });
    renderGradient();
  });

  // 그림자 값은 슬라이더와 숫자 입력이 같은 상태를 공유하도록 갱신합니다.
  // 이렇게 해야 실제 결과와 표기값이 항상 일치합니다.
  function renderShadow() {
    const shadow = state.shadow;
    const rgb = hexToRgb(shadow.color);
    const alpha = (shadow.opacity / 100).toFixed(2);
    const inset = shadow.inset ? 'inset ' : '';
    const value = `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;

    $('#shadow-sample').css('box-shadow', value);
    $('#shadow-code').val(`box-shadow: ${value};`);
    ['x', 'y', 'blur', 'spread', 'opacity'].forEach(function (key) {
      const suffix = key === 'opacity' ? '%' : 'px';
      $(`#shadow-${key}-range`).val(shadow[key]);
      $(`#shadow-${key}-number`).val(shadow[key]);
      $(`#shadow-${key}-value`).text(`${shadow[key]}${suffix}`);
    });
    $('#shadow-color').val(shadow.color);
    $('#shadow-inset').prop('checked', shadow.inset);
    $('[data-shadow-preset]').each(function () {
      $(this).attr('aria-pressed', String($(this).data('shadow-preset') === shadow.preset));
    });
  }

  // 모서리 값과 연결 옵션을 미리보기 및 border-radius 코드에 반영합니다.
  function renderCorners() {
    const corners = state.corners;
    const cornerInputs = {
      topLeft: ['corner-top-left-range', 'corner-top-left-number', 'corner-top-left-value'],
      topRight: ['corner-top-right-range', 'corner-top-right-number', 'corner-top-right-value'],
      bottomRight: ['corner-bottom-right-range', 'corner-bottom-right-number', 'corner-bottom-right-value'],
      bottomLeft: ['corner-bottom-left-range', 'corner-bottom-left-number', 'corner-bottom-left-value']
    };
    Object.keys(cornerInputs).forEach(function (corner) {
      const [rangeId, numberId, outputId] = cornerInputs[corner];
      $(`#${rangeId}, #${numberId}`).val(corners[corner]);
      $(`#${outputId}`).text(`${corners[corner]}px`);
    });
    $('#corner-linked').prop('checked', corners.linked);
    $('#corner-preview').css('border-radius', `${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px`);
    $('#corner-code').val(`border-radius: ${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px;`);
  }

  $('.corner-field input').on('input', function () {
    const field = $(this).closest('.corner-field');
    const corner = field.data('corner');
    const value = this.value === '' ? NaN : Number(this.value);
    if (!Number.isInteger(value) || value < 0 || value > 150) {
      this.setAttribute('aria-invalid', 'true');
      return;
    }
    this.removeAttribute('aria-invalid');
    state.corners[corner] = value;
    if (state.corners.linked) {
      ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].forEach(key => { state.corners[key] = value; });
    }
    renderCorners();
    this.focus();
  });

  $('#corner-linked').on('change', function () {
    state.corners.linked = this.checked;
  });

  $('[data-corner-preset]').on('click', function () {
    const value = Number($(this).data('corner-preset'));
    ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].forEach(key => { state.corners[key] = value; });
    $('.corner-field input').removeAttr('aria-invalid');
    renderCorners();
  });

  // 테두리 설정은 공통 값과 각 면의 사용 여부로 CSS를 만들어냅니다.
  function renderBorders() {
    const border = state.borders;
    const sides = ['top', 'right', 'bottom', 'left'];
    const color = border.color.toUpperCase();
    const visible = border.style !== 'none' && border.width > 0;
    const rule = visible ? `${border.width}px ${border.style} ${color}` : 'none';
    const declarations = sides.every(side => border[side])
      ? [`border: ${rule};`]
      : sides.map(side => `border-${side}: ${border[side] ? rule : 'none'};`);
    declarations.push(`border-radius: ${border.radius}px;`);

    $('#border-width-range, #border-width-number').val(border.width);
    $('#border-width-value').text(`${border.width}px`);
    $('#border-style').val(border.style);
    $('#border-color').val(border.color);
    $('#border-radius-range, #border-radius-number').val(border.radius);
    $('#border-radius-value').text(`${border.radius}px`);
    $('[data-border-side]').each(function () {
      $(this).prop('checked', border[$(this).data('border-side')]);
    });
    const previewBorders = { borderRadius: `${border.radius}px` };
    if (sides.every(side => border[side])) {
      previewBorders.border = visible ? `${border.width}px ${border.style} ${border.color}` : 'none';
    } else {
      sides.forEach(function (side) {
        const property = `border${side[0].toUpperCase()}${side.slice(1)}`;
        previewBorders[property] = border[side] && visible ? `${border.width}px ${border.style} ${border.color}` : 'none';
      });
    }
    $('#border-preview').css(previewBorders);
    $('#border-code').val(declarations.join('\n'));
  }

  function updateBorderNumber(input) {
    const key = input.id.startsWith('border-width') ? 'width' : 'radius';
    const value = input.value === '' ? NaN : Number(input.value);
    const maximum = key === 'width' ? 24 : 100;
    if (!Number.isInteger(value) || value < 0 || value > maximum) {
      input.setAttribute('aria-invalid', 'true');
      return;
    }
    input.removeAttribute('aria-invalid');
    state.borders[key] = value;
    renderBorders();
    input.focus();
  }

  $('#border-width-range, #border-width-number, #border-radius-range, #border-radius-number').on('input', function () {
    updateBorderNumber(this);
  });

  $('#border-style').on('change', function () {
    state.borders.style = this.value;
    renderBorders();
  });

  $('#border-color').on('input change', function () {
    state.borders.color = this.value;
    renderBorders();
  });

  $('[data-border-side]').on('change', function () {
    state.borders[$(this).data('border-side')] = this.checked;
    renderBorders();
  });

  $('.shadow-field input').on('input', function () {
    const field = $(this).closest('.shadow-field');
    const key = field.data('shadow');
    const min = Number(field.data('min'));
    const max = Number(field.data('max'));
    const value = this.value === '' ? NaN : Number(this.value);
    if (!Number.isInteger(value) || value < min || value > max) {
      this.setAttribute('aria-invalid', 'true');
      return;
    }

    this.removeAttribute('aria-invalid');
    state.shadow[key] = value;
    state.shadow.preset = '';
    field.find('input').not(this).val(value);
    renderShadow();
  });

  $('#shadow-color').on('input change', function () {
    state.shadow.color = this.value;
    state.shadow.preset = '';
    renderShadow();
  });

  $('#shadow-inset').on('change', function () {
    state.shadow.inset = this.checked;
    state.shadow.preset = '';
    renderShadow();
  });

  $('[data-shadow-preset]').on('click', function () {
    const preset = $(this).data('shadow-preset');
    Object.assign(state.shadow, shadowPresets[preset], { preset });
    $('.shadow-field input').removeAttr('aria-invalid');
    renderShadow();
  });

  // 복사 결과를 잠시 알린 뒤 상태 메시지를 비워 화면을 깔끔하게 유지합니다.
  const toastTimers = new WeakMap();
  function showCopyToast(status, message) {
    const element = $(status)[0];
    $(element).text(message);
    window.clearTimeout(toastTimers.get(element));
    toastTimers.set(element, window.setTimeout(() => $(element).empty(), 1800));
  }

  // Clipboard API가 막히면 코드 입력란을 선택해 직접 복사하도록 안내합니다.
  async function copyCode(button) {
    const target = document.getElementById($(button).data('copy'));
    const status = $(button).closest('.code-card').find('.copy-status');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(target.value);
      showCopyToast(status, '복사되었습니다.');
    } catch (error) {
      target.focus();
      target.select();
      try {
        showCopyToast(status, document.execCommand('copy') ? '복사되었습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      } catch (fallbackError) {
        showCopyToast(status, '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      }
    }
  }

  $('.copy-button').on('click', function () {
    copyCode(this);
  });

  // 초기화는 현재 선택한 도구만 변경합니다.
  $('.reset-tool').on('click', function () {
    const tool = $(this).data('reset');
    if (tool === 'color') {
      state.color = { ...defaults.color };
      colorFields.forEach(id => setColorError(id, ''));
      $('#color-css-property').val('background-color');
      renderColor();
    } else if (tool === 'gradient') {
      state.gradient = { ...defaults.gradient };
      renderGradient();
    } else if (tool === 'shadow') {
      state.shadow = { ...defaults.shadow };
      $('.shadow-field input').removeAttr('aria-invalid');
      renderShadow();
    } else if (tool === 'corners') {
      state.corners = { ...defaults.corners };
      $('.corner-field input').removeAttr('aria-invalid');
      renderCorners();
    } else if (tool === 'borders') {
      state.borders = { ...defaults.borders };
      $('#border-width-number, #border-radius-number').removeAttr('aria-invalid');
      renderBorders();
    }
  });

  renderColor();
  renderGradient();
  renderShadow();
  renderCorners();
  renderBorders();
});
