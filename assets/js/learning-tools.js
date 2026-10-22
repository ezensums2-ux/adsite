$(function () {
  // 숫자 입력을 검사해 잘못된 값이 계산 결과에 섞이지 않게 합니다.
  function readNumber(selector, minimum) {
    const input = document.querySelector(selector);
    if (!input) return null;
    const value = Number(input.value);
    const valid = input.value.trim() !== '' && Number.isFinite(value) && value >= minimum;
    input.setAttribute('aria-invalid', String(!valid));
    return valid ? value : null;
  }

  // 개발 도구: PX/REM, Clamp, 종횡비를 입력과 동시에 계산합니다.
  function initializeDeveloperTools() {
    if (!document.getElementById('px-value')) return;
    const updateRem = function () {
      const base = readNumber('#rem-base', 1);
      const px = readNumber('#px-value', 0);
      const reverseBase = readNumber('#rem-base-reverse', 1);
      const rem = readNumber('#rem-value', 0);
      if (base !== null && px !== null) {
        $('#px-rem-result').text(`${Number((px / base).toFixed(4))}rem`);
      } else $('#px-rem-result').text('기준 글자 크기와 PX 값을 확인하세요.');
      if (reverseBase !== null && rem !== null) {
        $('#rem-px-result').text(`${Number((rem * reverseBase).toFixed(4))}px`);
      } else $('#rem-px-result').text('기준 글자 크기와 REM 값을 확인하세요.');
    };
    $('#rem-base, #px-value, #rem-base-reverse, #rem-value').on('input', updateRem);

    const updateClamp = function () {
      const min = readNumber('#clamp-min', 0);
      const preferred = readNumber('#clamp-preferred', 0);
      const max = readNumber('#clamp-max', 0);
      if (min === null || preferred === null || max === null || min > max) {
        $('#clamp-result').text('값을 확인하세요. Minimum은 Maximum보다 클 수 없습니다.');
        return;
      }
      const fluid = Number((preferred / 12).toFixed(3));
      $('#clamp-result').text(`font-size: clamp(${min}px, ${fluid}vw, ${max}px);`);
    };
    $('#clamp-min, #clamp-preferred, #clamp-max').on('input', updateClamp);

    const gcd = function (a, b) {
      while (b) [a, b] = [b, a % b];
      return a;
    };
    const updateRatio = function () {
      const width = readNumber('#ratio-width', 1);
      const height = readNumber('#ratio-height', 1);
      if (width === null || height === null || !Number.isInteger(width) || !Number.isInteger(height)) {
        $('#ratio-result').text('Width와 Height에 1 이상의 정수를 입력하세요.');
        return;
      }
      const divisor = gcd(width, height);
      $('#ratio-result').text(`${width / divisor} : ${height / divisor}`);
    };
    $('#ratio-width, #ratio-height').on('input', updateRatio);
    updateRem();
    updateClamp();
    updateRatio();
    initializeTextTools();
  }

  function initializeTextTools() {
    function setToolStatus(button, message, invalid) {
      const section = button.closest('.learning-section');
      section.querySelector('.learning-status').textContent = message;
      const input = section.querySelector('input, textarea');
      if (input) input.setAttribute('aria-invalid', String(Boolean(invalid)));
    }

    $('#url-convert').on('click', function () {
      const input = document.getElementById('url-input');
      const output = document.getElementById('url-result');
      try {
        output.value = document.getElementById('url-mode').value === 'encode'
          ? encodeURIComponent(input.value)
          : decodeURIComponent(input.value);
        setToolStatus(this, 'URL 변환을 완료했습니다.', false);
      } catch (error) {
        output.value = '';
        setToolStatus(this, '잘못된 percent 인코딩입니다. 입력값을 확인하세요.', true);
      }
    });

    $('#base64-convert').on('click', function () {
      const input = document.getElementById('base64-input');
      const output = document.getElementById('base64-result');
      try {
        if (document.getElementById('base64-mode').value === 'encode') {
          const bytes = new TextEncoder().encode(input.value);
          output.value = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
        } else {
          const binary = atob(input.value.trim());
          const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
          output.value = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        }
        setToolStatus(this, 'Base64 변환을 완료했습니다.', false);
      } catch (error) {
        output.value = '';
        setToolStatus(this, 'Base64 입력이 올바르지 않거나 UTF-8 텍스트가 아닙니다.', true);
      }
    });

    $('#json-format').on('click', function () {
      const input = document.getElementById('json-input');
      const output = document.getElementById('json-result');
      try {
        const value = JSON.parse(input.value);
        output.value = JSON.stringify(value, null, document.getElementById('json-mode').value === 'pretty' ? 2 : 0);
        setToolStatus(this, '유효한 JSON입니다.', false);
      } catch (error) {
        output.value = '';
        setToolStatus(this, `JSON 문법 오류: ${error.message}`, true);
      }
    });

    const loremSentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      'Curabitur pretium tincidunt lacus, nulla gravida orci a odio.',
      'Nullam varius, turpis et commodo pharetra, est eros bibendum elit.'
    ];
    $('#lorem-generate').on('click', function () {
      const input = document.getElementById('lorem-count');
      const count = Number(input.value);
      if (!Number.isInteger(count) || count < 1 || count > 30) {
        input.setAttribute('aria-invalid', 'true');
        document.getElementById('lorem-result').value = '';
        setToolStatus(this, '문장 수는 1에서 30 사이의 정수여야 합니다.', true);
        return;
      }
      input.setAttribute('aria-invalid', 'false');
      document.getElementById('lorem-result').value = Array.from(
        { length: count },
        (_, index) => loremSentences[index % loremSentences.length]
      ).join(' ');
      setToolStatus(this, `${count}개 문장을 생성했습니다.`, false);
    });

    function minifyCss(source) {
      let result = '';
      let quote = '';
      let escaped = false;

      for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];

        if (quote) {
          result += character;
          if (escaped) escaped = false;
          else if (character === '\\') escaped = true;
          else if (character === quote) quote = '';
          continue;
        }

        if (character === '"' || character === "'") {
          result = result.trimEnd();
          quote = character;
          result += character;
        } else if (character === '/' && next === '*') {
          const end = source.indexOf('*/', index + 2);
          if (end === -1) throw new Error('닫히지 않은 주석이 있습니다.');
          const comment = source.slice(index, end + 2);
          if (comment.startsWith('/*!')) result += `${result && !/\s$/.test(result) ? ' ' : ''}${comment}`;
          index = end + 1;
        } else if (/\s/.test(character)) {
          let nextIndex = index + 1;
          while (nextIndex < source.length && /\s/.test(source[nextIndex])) nextIndex += 1;
          const previous = result[result.length - 1];
          const following = source[nextIndex];
          const punctuation = '{}:;,>';
          if (result && following && !punctuation.includes(previous) && !punctuation.includes(following) && !/\s$/.test(result)) {
            result += ' ';
          }
          index = nextIndex - 1;
        } else if ('{}:;,>'.includes(character)) {
          result = result.trimEnd();
          if (character === '}' && result.endsWith(';')) result = result.slice(0, -1);
          result += character;
        } else {
          result += character;
        }
      }

      if (quote) throw new Error('닫히지 않은 문자열이 있습니다.');
      return result.trim();
    }

    $('#css-minify').on('click', function () {
      const input = document.getElementById('css-input');
      const output = document.getElementById('css-result');
      try {
        output.value = minifyCss(input.value);
        setToolStatus(this, 'CSS 압축을 완료했습니다.', false);
      } catch (error) {
        output.value = '';
        setToolStatus(this, `CSS를 압축하지 못했습니다: ${error.message}`, true);
      }
    });

    $('#url-convert, #base64-convert, #json-format, #lorem-generate, #css-minify').trigger('click');
  }

  // 복사 버튼은 Clipboard API를 우선 사용하고, 막힌 환경에서는 선택 복사를 시도합니다.
  async function copyLearningValue(button) {
    const target = document.getElementById(button.dataset.learningCopy);
    const status = button.closest('.learning-section, .learning-card')?.querySelector('.learning-status')
      || document.getElementById('component-copy-status');
    if (!target || !status) return;
    const value = 'value' in target ? target.value : target.textContent;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
      status.textContent = '복사했습니다.';
    } catch (error) {
      if ('select' in target) {
        target.focus();
        target.select();
      } else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      status.textContent = '텍스트를 선택했습니다. Ctrl+C로 복사해 주세요.';
    }
  }
  $('[data-learning-copy]').on('click', function () {
    copyLearningValue(this);
  });

  // 선택한 UI 컴포넌트의 미리보기와 HTML/CSS 코드를 같은 설정값으로 생성합니다.
  function initializeComponentDemo() {
    const preview = document.getElementById('component-preview');
    if (!preview) return;
    const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
    const bounded = (selector, max) => {
      const value = Number(document.querySelector(selector).value);
      return Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
    };
    const labels = {
      button: '버튼', card: '카드', badge: '배지', tabs: '탭', accordion: '아코디언',
      modal: '모달', dropdown: '드롭다운', tooltip: '툴팁', toggle: '토글 스위치',
      progress: '프로그레스 바', alert: '알림 메시지', loading: '로딩 UI'
    };
    const initialType = window.location.hash.slice(1);
    if (Object.hasOwn(labels, initialType)) $('#component-type').val(initialType);

    const render = function () {
      const type = $('#component-type').val();
      const background = $('#button-bg').val();
      const textColor = $('#button-text-color').val();
      const radius = bounded('#button-radius', 50);
      const paddingX = bounded('#button-padding-x', 80);
      const paddingY = bounded('#button-padding-y', 50);
      const progress = bounded('#component-progress-value', 100);
      const label = $('#button-label').val() || labels[type];
      const safeLabel = escapeHTML(label);
      const padding = `${paddingY}px ${paddingX}px`;
      const templates = {
        button: {
          html: `<button class="custom-button" type="button">${safeLabel}</button>`,
          css: `.custom-button {\n  background: ${background};\n  color: ${textColor};\n  border-radius: ${radius}px;\n  padding: ${padding};\n  border: 0;\n}`,
          selector: '.custom-button',
          preview: `<button class="custom-button" type="button">${safeLabel}</button>`
        },
        card: {
          html: `<article class="custom-card"><h3>${safeLabel}</h3><p>카드 내용을 설명하는 문장입니다.</p></article>`,
          css: `.custom-card {\n  max-width: 320px;\n  padding: ${padding};\n  border-radius: ${radius}px;\n  color: ${textColor};\n  background: ${background};\n}`,
          selector: '.custom-card',
          preview: `<article class="custom-card"><h3>${safeLabel}</h3><p>카드 내용을 설명하는 문장입니다.</p></article>`
        },
        badge: {
          html: `<span class="custom-badge">${safeLabel}</span>`,
          css: `.custom-badge {\n  display: inline-block;\n  padding: ${padding};\n  border-radius: ${radius}px;\n  color: ${textColor};\n  background: ${background};\n}`,
          selector: '.custom-badge',
          preview: `<span class="custom-badge">${safeLabel}</span>`
        },
        tabs: {
          html: `<div class="custom-tabs" role="tablist"><button type="button" role="tab" aria-controls="component-panel" aria-selected="true">${safeLabel}</button><button type="button" role="tab" aria-controls="component-panel" aria-selected="false">두 번째 탭</button><button type="button" role="tab" aria-controls="component-panel" aria-selected="false">세 번째 탭</button></div><p class="custom-tab-panel" id="component-panel" role="tabpanel">선택한 탭의 콘텐츠입니다.</p>`,
          css: `.custom-tabs { display: flex; gap: 6px; }\n.custom-tabs button[aria-selected="true"] { color: ${textColor}; background: ${background}; }\n.custom-tabs button { padding: ${padding}; border: 0; border-radius: ${radius}px; }\n.custom-tab-panel { padding: 12px; }`,
          selector: '.custom-tabs',
          preview: `<div class="custom-tabs" role="tablist"><button type="button" role="tab" aria-controls="component-panel" aria-selected="true" data-demo-tab>${safeLabel}</button><button type="button" role="tab" aria-controls="component-panel" aria-selected="false" data-demo-tab>두 번째 탭</button><button type="button" role="tab" aria-controls="component-panel" aria-selected="false" data-demo-tab>세 번째 탭</button></div><p class="custom-tab-panel" id="component-panel" role="tabpanel">선택한 탭의 콘텐츠입니다.</p>`
        },
        accordion: {
          html: `<details class="custom-accordion"><summary>${safeLabel}</summary><p>열고 닫을 수 있는 상세 내용입니다.</p></details>`,
          css: `.custom-accordion { width: min(100%, 360px); padding: ${padding}; border-radius: ${radius}px; color: ${textColor}; background: ${background}; }\n.custom-accordion summary { cursor: pointer; font-weight: 700; }`,
          selector: '.custom-accordion',
          preview: `<details class="custom-accordion"><summary>${safeLabel}</summary><p>열고 닫을 수 있는 상세 내용입니다.</p></details>`
        },
        modal: {
          html: `<button type="button" aria-haspopup="dialog">모달 열기</button><div class="custom-modal" role="dialog" aria-modal="true" aria-label="${safeLabel}" hidden><h3>${safeLabel}</h3><p>모달 안의 콘텐츠입니다.</p><button type="button">닫기</button></div>`,
          css: `.custom-modal { width: min(100%, 320px); padding: ${padding}; border-radius: ${radius}px; color: ${textColor}; background: ${background}; box-shadow: 0 12px 32px rgb(0 0 0 / 20%); }\n.custom-modal[hidden] { display: none; }`,
          selector: '.custom-modal',
          preview: `<button type="button" data-demo-modal-open aria-haspopup="dialog">모달 열기</button><div class="demo-modal-backdrop" hidden><div class="custom-modal" role="dialog" aria-modal="true" aria-label="${safeLabel}"><h3>${safeLabel}</h3><p>모달 안의 콘텐츠입니다.</p><button type="button" data-demo-modal-close>닫기</button></div></div>`
        },
        dropdown: {
          html: `<div class="custom-dropdown"><button type="button" aria-expanded="false">${safeLabel}</button><ul hidden><li><a href="#">메뉴 항목 1</a></li><li><a href="#">메뉴 항목 2</a></li></ul></div>`,
          css: `.custom-dropdown { position: relative; }\n.custom-dropdown button { padding: ${padding}; border: 0; border-radius: ${radius}px; color: ${textColor}; background: ${background}; }\n.custom-dropdown ul { margin: 4px 0; padding: 10px; border: 1px solid #e9e6ef; border-radius: ${radius}px; background: #fff; list-style: none; }`,
          selector: '.custom-dropdown',
          preview: `<div class="custom-dropdown"><button type="button" aria-expanded="false" data-demo-dropdown>${safeLabel}</button><ul hidden><li><a href="#component-editor">메뉴 항목 1</a></li><li><a href="#component-editor">메뉴 항목 2</a></li></ul></div>`
        },
        tooltip: {
          html: `<button class="custom-tooltip" type="button" aria-describedby="tooltip-note">${safeLabel}<span id="tooltip-note" role="tooltip">추가 설명</span></button>`,
          css: `.custom-tooltip { position: relative; padding: ${padding}; border: 0; border-radius: ${radius}px; color: ${textColor}; background: ${background}; }\n.custom-tooltip [role="tooltip"] { position: absolute; bottom: calc(100% + 8px); left: 50%; padding: 6px 9px; border-radius: 5px; color: #fff; background: #252431; white-space: nowrap; transform: translateX(-50%); visibility: hidden; }\n.custom-tooltip:hover [role="tooltip"], .custom-tooltip:focus [role="tooltip"] { visibility: visible; }`,
          selector: '.custom-tooltip',
          preview: `<button class="custom-tooltip" type="button" aria-describedby="tooltip-note">${safeLabel}<span id="tooltip-note" role="tooltip">추가 설명</span></button>`
        },
        toggle: {
          html: `<label class="custom-toggle"><input type="checkbox"><span>${safeLabel}</span></label>`,
          css: `.custom-toggle { display: inline-flex; align-items: center; gap: 10px; padding: ${padding}; border-radius: ${radius}px; color: ${textColor}; background: ${background}; cursor: pointer; }\n.custom-toggle input { accent-color: ${background}; }`,
          selector: '.custom-toggle',
          preview: `<label class="custom-toggle"><input type="checkbox"><span>${safeLabel}</span></label>`
        },
        progress: {
          html: `<div class="custom-progress" role="progressbar" aria-label="${safeLabel}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width: ${progress}%"></span></div>`,
          css: `.custom-progress { height: 14px; overflow: hidden; border-radius: ${radius}px; background: #e9e6ef; }\n.custom-progress span { display: block; height: 100%; width: ${progress}%; background: ${background}; }`,
          selector: '.custom-progress',
          preview: `<div class="custom-progress" role="progressbar" aria-label="${safeLabel}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width: ${progress}%; background: ${background}"></span></div><span>${progress}%</span>`
        },
        alert: {
          html: `<div class="custom-alert" role="status">${safeLabel}</div>`,
          css: `.custom-alert { padding: ${padding}; border-radius: ${radius}px; color: ${textColor}; background: ${background}; }`,
          selector: '.custom-alert',
          preview: `<div class="custom-alert" role="status">${safeLabel}</div>`
        },
        loading: {
          html: `<div class="custom-loading" role="status"><span class="custom-spinner" aria-hidden="true"></span><span>${safeLabel}</span></div>`,
          css: `.custom-loading { display: inline-flex; align-items: center; gap: 10px; padding: ${padding}; color: ${textColor}; }\n.custom-spinner { width: 22px; height: 22px; border: 3px solid #e9e6ef; border-top-color: ${background}; border-radius: 50%; animation: spin 800ms linear infinite; }\n@keyframes spin { to { transform: rotate(360deg); } }`,
          selector: '.custom-loading',
          preview: `<div class="custom-loading" role="status"><span class="custom-spinner" aria-hidden="true"></span><span>${safeLabel}</span></div>`
        }
      };
      const selected = templates[type] || templates.button;
      preview.innerHTML = selected.preview;
      const mainElement = preview.querySelector(selected.selector);
      if (mainElement && ['button', 'card', 'badge', 'accordion', 'alert', 'modal', 'dropdown', 'tooltip'].includes(type)) {
        mainElement.style.color = textColor;
        mainElement.style.backgroundColor = background;
        mainElement.style.borderRadius = `${radius}px`;
        mainElement.style.padding = padding;
      }
      if (type === 'tabs') {
        preview.querySelectorAll('[data-demo-tab]').forEach(button => {
          button.style.padding = padding;
          button.style.border = '0';
          button.style.borderRadius = `${radius}px`;
          button.style.color = button.getAttribute('aria-selected') === 'true' ? textColor : '#514d5c';
          button.style.backgroundColor = button.getAttribute('aria-selected') === 'true' ? background : '#f0eef3';
        });
      }
      if (type === 'dropdown') {
        const trigger = preview.querySelector('[data-demo-dropdown]');
        trigger.style.padding = padding;
        trigger.style.border = '0';
        trigger.style.borderRadius = `${radius}px`;
        trigger.style.color = textColor;
        trigger.style.backgroundColor = background;
        const menu = preview.querySelector('.custom-dropdown ul');
        if (menu) {
          menu.style.padding = '10px';
          menu.style.borderRadius = `${radius}px`;
          menu.style.backgroundColor = '#fff';
        }
      }
      if (type === 'tooltip') {
        const tooltip = preview.querySelector('[role="tooltip"]');
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = 'calc(100% + 8px)';
        tooltip.style.left = '50%';
        tooltip.style.padding = '6px 9px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.color = '#fff';
        tooltip.style.backgroundColor = '#252431';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.visibility = 'hidden';
        const showTooltip = () => { tooltip.style.visibility = 'visible'; };
        const hideTooltip = () => { tooltip.style.visibility = 'hidden'; };
        mainElement.addEventListener('mouseenter', showTooltip);
        mainElement.addEventListener('focus', showTooltip);
        mainElement.addEventListener('mouseleave', hideTooltip);
        mainElement.addEventListener('blur', hideTooltip);
      }
      if (type === 'modal') {
        const backdrop = preview.querySelector('.demo-modal-backdrop');
        backdrop.style.cssText = 'position:absolute; inset:0; display:grid; place-items:center; background:rgb(20 18 28 / 24%);';
      }
      if (type === 'progress') {
        const track = preview.querySelector('.custom-progress');
        const fill = preview.querySelector('.custom-progress span');
        if (track) {
          track.style.width = 'min(100%, 340px)';
          track.style.height = '14px';
          track.style.overflow = 'hidden';
          track.style.borderRadius = `${radius}px`;
          track.style.backgroundColor = '#e9e6ef';
        }
        if (fill) {
          fill.style.width = `${progress}%`;
          fill.style.height = '100%';
          fill.style.display = 'block';
          fill.style.backgroundColor = background;
        }
      }
      if (type === 'toggle') {
        const toggle = preview.querySelector('.custom-toggle');
        toggle.style.gap = '10px';
        toggle.style.padding = padding;
        toggle.style.borderRadius = `${radius}px`;
        toggle.style.color = textColor;
        toggle.style.backgroundColor = background;
        toggle.querySelector('input').style.accentColor = background;
      }
      if (type === 'loading') {
        const loading = preview.querySelector('.custom-loading');
        loading.style.display = 'inline-flex';
        loading.style.alignItems = 'center';
        loading.style.gap = '10px';
        loading.style.padding = padding;
        loading.style.color = textColor;
        const spinner = preview.querySelector('.custom-spinner');
        spinner.style.cssText = `width:22px;height:22px;border:3px solid #e9e6ef;border-top-color:${background};border-radius:50%;animation:learning-spin 800ms linear infinite`;
      }
      $('#component-settings-title').text(`${labels[type]} 설정`);
      $('#component-preview-title').text(`Preview · ${labels[type]}`);
      $('#component-html-code').val(selected.html);
      $('#component-css-code').val(selected.css);
    };
    $('#component-type, #button-bg, #button-text-color, #button-radius, #button-padding-x, #button-padding-y, #button-label, #component-progress-value').on('input change', render);
    preview.addEventListener('click', function (event) {
      const tab = event.target.closest('[data-demo-tab]');
      if (tab) {
        preview.querySelectorAll('[data-demo-tab]').forEach(button => {
          button.setAttribute('aria-selected', String(button === tab));
          button.style.color = button === tab ? $('#button-text-color').val() : '#514d5c';
          button.style.backgroundColor = button === tab ? $('#button-bg').val() : '#f0eef3';
        });
        preview.querySelector('.custom-tab-panel').textContent = `선택한 탭: ${tab.textContent}`;
      }
      const dropdown = event.target.closest('[data-demo-dropdown]');
      if (dropdown) {
        const list = dropdown.nextElementSibling;
        const expanded = dropdown.getAttribute('aria-expanded') === 'true';
        dropdown.setAttribute('aria-expanded', String(!expanded));
        list.hidden = expanded;
      }
      if (event.target.closest('[data-demo-modal-open]')) {
        const backdrop = preview.querySelector('.demo-modal-backdrop');
        backdrop.hidden = false;
        backdrop.querySelector('[data-demo-modal-close]').focus();
      }
      if (event.target.closest('[data-demo-modal-close]')) {
        preview.querySelector('.demo-modal-backdrop').hidden = true;
        preview.querySelector('[data-demo-modal-open]').focus();
      }
    });
    render();
    const animationStyle = document.createElement('style');
    animationStyle.textContent = '@keyframes learning-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(animationStyle);
  }

  // 접근성 학습용 WCAG 상대 휘도와 대비율 계산기입니다.
  function initializeContrastChecker() {
    if (!document.getElementById('contrast-background')) return;
    const channel = value => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = hex => {
      const red = parseInt(hex.slice(1, 3), 16);
      const green = parseInt(hex.slice(3, 5), 16);
      const blue = parseInt(hex.slice(5, 7), 16);
      return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
    };
    const update = function () {
      const background = $('#contrast-background').val();
      const text = $('#contrast-text').val();
      const values = [luminance(background), luminance(text)].sort((a, b) => b - a);
      const ratio = (values[0] + 0.05) / (values[1] + 0.05);
      $('#contrast-preview').css({ backgroundColor: background, color: text });
      $('#contrast-result').text(`Contrast Ratio ${ratio.toFixed(2)} : 1`);
      $('#contrast-status').text(ratio >= 4.5
        ? '일반 텍스트 WCAG AA 대비 기준(4.5:1)을 충족합니다.'
        : ratio >= 3
          ? '큰 텍스트 기준(3:1)은 충족하지만 일반 텍스트 기준(4.5:1)은 부족합니다.'
          : '경고: 큰 텍스트(3:1)와 일반 텍스트(4.5:1) 대비 기준에 모두 부족합니다.');
    };
    $('#contrast-background, #contrast-text').on('input', update);
    update();
  }

  // JavaScript 이벤트 실습은 버튼 클릭 시 선택한 배경색과 문구를 적용합니다.
  function initializeJavaScriptPractice() {
    const button = document.getElementById('js-practice-button');
    if (!button) return;
    const renderCode = function () {
      const color = JSON.stringify($('#practice-color').val());
      const label = JSON.stringify($('#practice-label').val() || '색상이 변경됐어요!');
      $('#js-practice-code').val(
        `const preview = document.querySelector('#js-practice-preview');\n` +
        `const text = document.querySelector('#js-practice-text');\n` +
        `const button = document.querySelector('#js-practice-button');\n\n` +
        `button.addEventListener('click', () => {\n` +
        `  preview.style.backgroundColor = ${color};\n` +
        `  text.textContent = ${label};\n` +
        `});`
      );
    };
    $('#practice-color, #practice-label').on('input', renderCode);
    button.addEventListener('click', function () {
      $('#js-practice-preview').css('background-color', $('#practice-color').val());
      $('#js-practice-text').text($('#practice-label').val() || '색상이 변경됐어요!');
      $('#js-practice-status').text('클릭 이벤트가 실행되어 배경색과 문구가 바뀌었습니다.');
      renderCode();
    });
    $('#js-practice-reset').on('click', function () {
      $('#practice-color').val('#e9ddff');
      $('#practice-label').val('버튼을 눌러보세요');
      $('#js-practice-preview').css('background-color', '');
      $('#js-practice-text').text('버튼을 눌러보세요');
      $('#js-practice-status').text('실습을 초기 상태로 되돌렸습니다.');
      renderCode();
    });
    $('#js-practice-copy').on('click', async function () {
      const html = `<div class="learning-preview" id="js-practice-preview"><span id="js-practice-text">버튼을 눌러보세요</span></div>\n<button id="js-practice-button" type="button">배경 바꾸기</button>`;
      const bundle = `<!doctype html>\n<html lang="ko">\n<body>\n${html}\n<script>\n${$('#js-practice-code').val()}\n</script>\n</body>\n</html>`;
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(bundle);
        $('#js-practice-status').text('HTML과 JavaScript 코드를 복사했습니다.');
      } catch (error) {
        const temporary = document.createElement('textarea');
        temporary.value = bundle;
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand('copy');
        temporary.remove();
        $('#js-practice-status').text(copied
          ? 'HTML과 JavaScript 코드를 복사했습니다.'
          : 'HTML과 JavaScript 코드를 복사할 수 없습니다. 브라우저 권한을 확인해주세요.');
      }
    });
    renderCode();
  }

  // 예제 코드는 격리된 iframe에서만 실행하고, 각 실습의 HTML과 결과를 함께 제공합니다.
  function initializeJavaScriptLessons() {
    const runTimeouts = new WeakMap();
    const defaults = {
      intro: {
        code: `console.log('JavaScript가 실행됐어요!');\nconsole.log('외부 파일은 <script src="app.js" defer></script>로 연결할 수 있어요.');`,
        html: `<h3>외부 파일 연결</h3><pre><code>&lt;script src="app.js" defer&gt;&lt;/script&gt;</code></pre><p>defer는 HTML 분석이 끝난 뒤 스크립트를 실행합니다.</p><p>console.log 결과는 아래에 표시되고 개발자 도구 Console에서도 확인할 수 있어요.</p>`
      },
      variables: {
        code: `const learnerName = '민지';\nlet score = 10;\nscore += 5;\nconst isReady = true;\nconst emptyValue = null;\nlet notAssigned;\nconsole.log(typeof learnerName, learnerName);\nconsole.log(typeof score, score);\nconsole.log(typeof isReady, isReady);\nconsole.log(typeof emptyValue, emptyValue);\nconsole.log(typeof notAssigned, notAssigned);\nconsole.log(Number('42') + 8, String(42), Boolean(1));`,
        html: `<h3>변수와 자료형</h3><p>이름, 점수, 불리언, null, undefined와 형 변환을 확인해보세요.</p>`
      },
      operators: {
        code: `const sum = 12 + 5;\nconst difference = 12 - 5;\nconst product = 12 * 5;\nconst quotient = 12 / 5;\nconst remainder = 17 % 3;\nconsole.log('산술 (+, -, *, /, %):', sum, difference, product, quotient, remainder);\nconsole.log('엄격 비교:', 5 === '5');\nconsole.log('느슨한 비교:', 5 == '5');\nconsole.log('논리:', sum > 10 && remainder === 2);`,
        html: `<h3>연산자 결과</h3><p>===는 자료형까지 비교하고 ==는 필요하면 형 변환 후 비교합니다.</p>`
      },
      conditionals: {
        code: `const score = 75;\nlet result;\nif (score >= 90) {\n  result = '우수';\n} else if (score >= 60) {\n  result = '합격';\n} else {\n  result = '다시 도전';\n}\nconsole.log(score + '점: ' + result);`,
        html: `<h3>점수 결과</h3><p>코드의 score 값을 바꾸고 실행해보세요.</p>`
      },
      loops: {
        code: `for (let index = 0; index < 4; index++) {\n  console.log('for 반복:', index);\n}\nfor (const fruit of ['사과', '배', '포도']) {\n  console.log('for...of:', fruit);\n}`,
        html: `<h3>반복 결과</h3><p>이 실습은 한 번 실행할 때 최대 1,000회까지만 반복됩니다.</p>`
      },
      functions: {
        code: `const greeting = function (name) {\n  return '안녕하세요, ' + name;\n};\nconst greet = (name) => greeting(name) + '!';\nfunction makeMessage(name) {\n  const message = greet(name);\n  return message;\n}\nconsole.log(makeMessage('지우'));`,
        html: `<h3>함수 실행</h3><p>매개변수로 값을 받고 return으로 결과를 돌려줍니다.</p>`
      },
      arrays: {
        code: `const colors = ['보라', '파랑'];\nconsole.log('첫 번째:', colors[0]);\nconsole.log('개수:', colors.length);\ncolors.push('민트');\nconst removed = colors.pop();\nconsole.log('꺼낸 값:', removed);\nfor (const color of colors) {\n  console.log('색상:', color);\n}`,
        html: `<h3>배열 결과</h3><p>인덱스는 0부터 시작하며 push와 pop으로 항목을 추가·제거합니다.</p>`
      },
      objects: {
        code: `const button = { text: '저장', disabled: false };\nconsole.log(button.text);\nconsole.log(button['disabled']);\nbutton.color = 'purple';\nbutton.text = '저장 완료';\nconsole.log(button);`,
        html: `<h3>객체 속성</h3><p>점 표기와 대괄호 표기로 값을 읽고 변경합니다.</p>`
      },
      dom: {
        code: `const title = document.querySelector('#demo-title');\nconst items = document.querySelectorAll('.demo-item');\nconst missing = document.querySelector('#not-found');\nif (title) {\n  title.textContent = 'DOM에서 제목을 찾았어요!';\n  console.log(title.textContent);\n}\nitems.forEach((item) => console.log(item.textContent));\nconsole.log('없는 요소:', missing);`,
        html: `<h3 id="demo-title">선택될 제목</h3><p>querySelector는 첫 요소 하나, querySelectorAll은 일치하는 모든 요소를 찾습니다.</p><p class="demo-item">항목 1</p><p class="demo-item">항목 2</p>`
      },
      events: {
        code: `const button = document.querySelector('#event-button');\nconst field = document.querySelector('#event-input');\nconst selector = document.querySelector('#event-select');\nconst result = document.querySelector('#event-result');\nbutton.addEventListener('click', (event) => {\n  result.textContent = '클릭 이벤트: ' + event.type;\n});\nfield.addEventListener('input', (event) => {\n  result.textContent = '입력한 글자 수: ' + event.target.value.length;\n});\nselector.addEventListener('change', (event) => {\n  result.textContent = '선택한 값: ' + event.target.value;\n});`,
        html: `<button id="event-button" type="button">눌러보기</button><label>입력 이벤트 <input id="event-input" type="text" placeholder="글자를 입력하세요"></label><label>변경 이벤트 <select id="event-select"><option value="보라">보라</option><option value="민트">민트</option></select></label><p id="event-result">버튼을 누르거나 입력해보세요.</p>`
      },
      'html-css': {
        code: `const card = document.querySelector('#change-card');\nconst button = document.querySelector('#change-button');\nbutton.addEventListener('click', () => {\n  card.textContent = 'textContent로 내용을 바꿨어요.';\n  card.classList.toggle('highlight');\n  card.setAttribute('aria-live', 'polite');\n  card.style.color = '#5034ad';\n});`,
        html: `<style>.demo-card{padding:12px;border-radius:8px;background:#f5f3fa}.demo-card.highlight{background:#e9ddff}</style><div class="demo-card" id="change-card">이 카드의 내용과 스타일을 바꿔보세요.</div><button id="change-button" type="button">HTML / CSS 변경</button><p>innerHTML은 문자열을 HTML로 해석하므로 신뢰할 수 없는 입력에는 사용하지 마세요.</p>`
      },
      practice: {
        code: `const preview = document.querySelector('#practice-preview');\nconst button = document.querySelector('#practice-button');\nconst counterButton = document.querySelector('#counter-button');\nconst message = document.querySelector('#practice-message');\nlet count = 0;\nbutton.addEventListener('click', () => {\n  preview.classList.toggle('changed');\n  message.textContent = preview.classList.contains('changed') ? '배경과 문구가 바뀌었어요!' : '원래 상태로 돌아왔어요.';\n});\ncounterButton.addEventListener('click', () => {\n  count += 1;\n  counterButton.textContent = '카운터: ' + count;\n});`,
        html: `<style>#practice-preview{padding:12px;border-radius:8px;background:#f5f3fa}#practice-preview.changed{background:#e9ddff;color:#5034ad}</style><div id="practice-preview">배경색과 클래스를 바꿔보세요.</div><p id="practice-message">버튼으로 상태를 바꿔보세요.</p><button id="practice-button" type="button">클래스 토글</button><button id="counter-button" type="button">카운터: 0</button>`
      }
    };

    const explanations = {
      intro: '브라우저는 HTML을 읽은 뒤 JavaScript로 동작과 상호작용을 처리합니다. 외부 파일은 script src로 연결하고 defer를 사용하면 HTML 분석이 끝난 뒤 실행됩니다. console.log 출력은 개발자 도구의 Console에서도 확인할 수 있어요.',
      variables: 'const는 재할당하지 않는 변수, let은 값이 바뀌는 변수에 사용합니다. 문자열·숫자·불리언 외에 null과 undefined도 자주 만납니다. typeof로 유형을 확인하고 Number, String, Boolean으로 명시적 형 변환을 할 수 있습니다.',
      operators: '산술 연산은 +, -, *, /, %를 사용합니다. 비교 연산은 참·거짓을 만들며, 논리 연산자는 조건을 조합합니다. 가능한 한 자료형까지 비교하는 ===를 사용하세요.',
      conditionals: 'if와 else if로 조건을 순서대로 검사하고, 어느 조건도 참이 아니면 else가 실행됩니다. 점수 값을 바꾸어 각 분기를 확인해보세요.',
      loops: 'for는 반복 횟수와 종료 조건이 분명할 때, for...of는 배열의 값을 하나씩 읽을 때 편리합니다. 안전을 위해 반복문은 총 1,000회로 제한합니다.',
      functions: '함수 선언과 함수 표현식, 화살표 함수를 사용해 동작을 묶습니다. 매개변수는 입력, return은 결과이며, 함수 안에서 선언한 변수는 기본적으로 지역 스코프를 가집니다.',
      arrays: '배열은 순서가 있는 값의 모음입니다. 인덱스는 0부터 시작하고 length로 길이를 확인합니다. push는 끝에 추가하고 pop은 마지막 항목을 꺼냅니다.',
      objects: '객체는 관련된 값을 이름 있는 속성으로 묶습니다. 속성 이름을 알고 있으면 점 표기, 동적으로 이름을 정할 때는 대괄호 표기를 사용합니다.',
      dom: 'querySelector는 CSS 선택자와 일치하는 첫 요소를, querySelectorAll은 모든 요소를 찾습니다. 선택 결과가 null일 수 있으므로 사용 전 확인하세요.',
      events: 'addEventListener로 click, input, change 이벤트를 연결합니다. 콜백의 event 객체에는 이벤트 종류와 target 등 상황 정보가 들어 있습니다.',
      'html-css': 'textContent는 안전하게 텍스트를 바꾸고, style은 인라인 스타일을 지정합니다. classList와 setAttribute로 클래스와 속성을 관리하세요. innerHTML은 문자열을 마크업으로 해석하므로 외부 입력에 주의해야 합니다.',
      practice: '이전 단원의 DOM 선택, 이벤트, 변수, classList를 조합합니다. 버튼을 눌러 배경 클래스를 바꾸고 카운터를 증가시켜보세요.'
    };

    function safeLoopCode(source) {
      if (source.length > 12000) return { error: '코드는 12,000자 이하로 입력해주세요.' };
      const executableSource = maskJavaScriptStringsAndComments(source);
      if (/\b(?:while|do)\b/.test(executableSource)) {
        return { error: 'while과 do 반복문은 사용할 수 없습니다. 종료 조건이 분명한 제한 반복문을 사용하세요.' };
      }
      const classicLoop = /\bfor\s*\(([^)]*)\)\s*\{/g;
      const guardName = `__lessonGuard_${Math.random().toString(36).slice(2)}`;
      let loopCount = 0;
      let tooManyIterations = false;
      let cursor = 0;
      let transformed = '';
      let loopMatch;
      while ((loopMatch = classicLoop.exec(executableSource))) {
        const openParen = loopMatch[0].indexOf('(');
        const headerStart = loopMatch.index + openParen + 1;
        const headerEnd = loopMatch.index + loopMatch[0].lastIndexOf(')');
        const executableHeader = executableSource.slice(headerStart, headerEnd);
        const finiteLoop = /^\s*(?:let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*$/.exec(executableHeader);
        const finiteForOf = /^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s+of\s+([A-Za-z_$][\w$]*|\[([^\]]*)\])\s*$/.exec(executableHeader);
        const loopEnd = loopMatch.index + loopMatch[0].length;
        transformed += source.slice(cursor, loopEnd);
        if (finiteLoop && Number(finiteLoop[3]) - Number(finiteLoop[2]) > 1000) {
          tooManyIterations = true;
        } else if (finiteLoop) {
          loopCount += 1;
          transformed += `${guardName}();`;
        } else if (finiteForOf) {
          const literalValues = finiteForOf[2] !== undefined
            ? finiteForOf[2]
            : (new RegExp(`\\b(?:const|let|var)\\s+${finiteForOf[1]}\\s*=\\s*\\[([^\\]]*)\\]`)).exec(executableSource)?.[1];
          if (literalValues !== undefined && (!literalValues.trim() || literalValues.split(',').length <= 1000)) {
            loopCount += 1;
            transformed += `${guardName}();`;
          }
        }
        cursor = loopEnd;
      }
      transformed += source.slice(cursor);
      const forKeywords = (executableSource.match(/\bfor\s*\(/g) || []).length;
      if (tooManyIterations) return { error: '반복 횟수는 1,000회 이하로 설정해주세요.' };
      if (loopCount !== forKeywords) return { error: '반복문은 숫자 범위가 정해진 for 또는 배열 리터럴의 for...of만 사용할 수 있습니다.' };
      if (hasSynchronousRecursion(executableSource)) {
        return { error: '실습 환경에서는 재귀 호출을 사용할 수 없습니다.' };
      }
      const guard = `const ${guardName} = (() => {
        let iterations = 0;
        const startTime = performance.now();
        const now = performance.now.bind(performance);
        return () => {
          if (++iterations > 1000) throw new Error('반복 실행은 1,000회로 제한됩니다.');
          if (now() - startTime > 1500) throw new Error('실행 시간이 1.5초를 초과했습니다.');
        };
      })();`;
      return { code: `${guard}\n${transformed}` };
    }

    // 문자열과 주석의 키워드를 코드로 오인하지 않도록 같은 길이의 공백으로 가립니다.
    function maskJavaScriptStringsAndComments(source) {
      const characters = source.split('');
      const templateFrames = [];
      let mode = 'code';
      let index = 0;
      while (index < source.length) {
        const character = source[index];
        if (mode === 'single' || mode === 'double') {
          if (character !== '\n' && character !== '\r') characters[index] = ' ';
          if (character === '\\') {
            if (index + 1 < source.length && source[index + 1] !== '\n' && source[index + 1] !== '\r') {
              characters[index + 1] = ' ';
            }
            index += 2;
            continue;
          }
          if ((mode === 'single' && character === "'") || (mode === 'double' && character === '"')) {
            mode = 'code';
          }
          index += 1;
          continue;
        }

        if (mode === 'template') {
          characters[index] = ' ';
          if (character === '\\') {
            if (index + 1 < source.length && source[index + 1] !== '\n' && source[index + 1] !== '\r') {
              characters[index + 1] = ' ';
            }
            index += 2;
            continue;
          }
          if (character === '$' && source[index + 1] === '{') {
            characters[index + 1] = ' ';
            templateFrames[templateFrames.length - 1].inExpression = true;
            templateFrames[templateFrames.length - 1].braceDepth = 0;
            mode = 'code';
            index += 2;
            continue;
          }
          if (character === '`') {
            templateFrames.pop();
            mode = 'code';
          }
          index += 1;
          continue;
        }

        const activeTemplate = templateFrames[templateFrames.length - 1];
        if (activeTemplate && activeTemplate.inExpression) {
          if (character === '{') activeTemplate.braceDepth += 1;
          else if (character === '}') {
            if (activeTemplate.braceDepth === 0) {
              characters[index] = ' ';
              activeTemplate.inExpression = false;
              mode = 'template';
              index += 1;
              continue;
            }
            activeTemplate.braceDepth -= 1;
          }
        }

        if (character === "'") {
          mode = 'single';
          characters[index] = ' ';
          index += 1;
          continue;
        }
        if (character === '"') {
          mode = 'double';
          characters[index] = ' ';
          index += 1;
          continue;
        }
        if (character === '`') {
          templateFrames.push({ inExpression: false, braceDepth: 0 });
          mode = 'template';
          characters[index] = ' ';
          index += 1;
          continue;
        }
        if (character === '/' && source[index + 1] === '/') {
          while (index < source.length && source[index] !== '\n' && source[index] !== '\r') {
            characters[index] = ' ';
            index += 1;
          }
          continue;
        }
        if (character === '/' && source[index + 1] === '*') {
          characters[index] = ' ';
          characters[index + 1] = ' ';
          index += 2;
          while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
            if (source[index] !== '\n' && source[index] !== '\r') characters[index] = ' ';
            index += 1;
          }
          if (index < source.length) {
            characters[index] = ' ';
            characters[index + 1] = ' ';
            index += 2;
          }
          continue;
        }
        index += 1;
      }
      return characters.join('');
    }

    // 함수 본문 안에서 자기 자신을 즉시 호출하는 재귀만 제한합니다.
    function hasSynchronousRecursion(source) {
      const declarations = /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g;
      let declaration;
      while ((declaration = declarations.exec(source))) {
        const open = source.indexOf('{', declaration.index);
        let depth = 1;
        let end = open + 1;
        while (end < source.length && depth) {
          if (source[end] === '{') depth += 1;
          else if (source[end] === '}') depth -= 1;
          end += 1;
        }
        if (new RegExp(`\\b${declaration[1]}\\s*\\(`).test(source.slice(open + 1, end - 1))) return true;
      }

      const arrowBlocks = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/g;
      let arrow;
      while ((arrow = arrowBlocks.exec(source))) {
        const open = source.indexOf('{', arrow.index);
        let depth = 1;
        let end = open + 1;
        while (end < source.length && depth) {
          if (source[end] === '{') depth += 1;
          else if (source[end] === '}') depth -= 1;
          end += 1;
        }
        if (new RegExp(`\\b${arrow[1]}\\s*\\(`).test(source.slice(open + 1, end - 1))) return true;
      }

      const arrowExpressions = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*([^;]+)/g;
      let expression;
      while ((expression = arrowExpressions.exec(source))) {
        if (new RegExp(`\\b${expression[1]}\\s*\\(`).test(expression[2])) return true;
      }
      return false;
    }

    function buildFrame(html, code, runId) {
      const encodedCode = encodeURIComponent(code);
      const boot = `
        const runId = ${JSON.stringify(runId)};
        const result = document.getElementById('lesson-output');
        const send = (message, finished = true) => parent.postMessage({ type: 'javascript-lesson', runId, message, finished }, '*');
        const originalConsole = {};
        ['log', 'info', 'warn', 'error'].forEach((method) => {
          originalConsole[method] = console[method].bind(console);
          console[method] = (...args) => {
            const line = args.map((value) => {
              if (typeof value === 'string') return value;
              try { return JSON.stringify(value); } catch (error) { return String(value); }
            }).join(' ');
            result.textContent += (result.textContent ? '\\n' : '') + line;
            originalConsole[method](...args);
            if (method === 'error') send('실행 중 오류가 발생했습니다. 결과 영역의 메시지를 확인하세요.', false);
          };
        });
        window.addEventListener('error', (event) => {
          console.error(event.message || '알 수 없는 오류');
          send('오류가 발생했습니다. 코드를 확인하고 다시 실행해주세요.', false);
        });
        try {
          const learnerCode = decodeURIComponent(${JSON.stringify(encodedCode)});
          new Function(learnerCode)();
          send('실행이 완료되었습니다. 아래 미리보기와 출력 결과를 확인하세요.');
        } catch (error) {
          console.error(error.name + ': ' + error.message);
          send(error.message && error.message.includes('실행 시간이')
            ? '실행 시간 제한을 초과해 중단했습니다. 코드를 간단하게 바꿔 다시 실행해주세요.'
            : error.message && error.message.includes('반복 실행은 1,000회')
              ? '반복 횟수 제한을 초과해 실습을 중단했습니다.'
              : '오류가 발생했습니다. 문법과 선택자를 확인해주세요.');
        }
      `;
      return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:14px/1.5 Arial,sans-serif;color:#252431;margin:12px}button,input{font:inherit;margin:4px;padding:7px}#lesson-output{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:12px;padding:10px;border-radius:6px;background:#f5f3fa;color:#252431;min-height:20px}</style></head><body>${html}<pre id="lesson-output" aria-live="polite"></pre><script>${boot}<\/script></body></html>`;
    }

    // 편집한 HTML에서 JavaScript 삽입 경로를 제거하고 코드는 별도 편집기에서만 실행합니다.
    function sanitizeLessonHtml(html) {
      const template = document.createElement('template');
      template.innerHTML = html;
      template.content.querySelectorAll('script, iframe, object, embed, base, link').forEach(node => node.remove());
      template.content.querySelectorAll('*').forEach(function (element) {
        [...element.attributes].forEach(function (attribute) {
          const isEventHandler = /^on/i.test(attribute.name);
          const isJavaScriptUrl = /^(href|src|action|formaction|xlink:href)$/i.test(attribute.name)
            && /^\s*javascript:/i.test(attribute.value);
          if (isEventHandler || isJavaScriptUrl) element.removeAttribute(attribute.name);
        });
      });
      return template.innerHTML;
    }

    function escapeScriptClose(code) {
      return code.replace(/<\/script/gi, '<\\/script');
    }

    document.querySelectorAll('#intro, .lesson-item').forEach(function (lesson, index) {
      const id = lesson.id;
      const sample = defaults[id];
      if (!sample || lesson.querySelector('.javascript-lesson-lab')) return;
      const note = document.createElement('p');
      note.className = 'javascript-lesson-note';
      note.textContent = explanations[id];
      const lab = document.createElement('div');
      lab.className = 'javascript-lesson-lab';
      lab.dataset.lessonId = id;
      lab.innerHTML = `
        <h3>직접 실행해보기</h3>
        <label class="lesson-editor-label">예제 HTML
          <textarea class="lesson-html-editor" spellcheck="false" aria-label="${id} 실습 HTML"></textarea>
        </label>
        <label class="lesson-editor-label">JavaScript 코드
          <textarea class="lesson-js-editor" spellcheck="false" aria-label="${id} JavaScript 코드"></textarea>
        </label>
        <div class="learning-actions">
          <button class="button button-primary js-lesson-run" type="button">실행</button>
          <button class="button button-secondary js-lesson-reset" type="button">초기화</button>
          <button class="button button-secondary js-lesson-copy" type="button">HTML + 코드 복사</button>
        </div>
        <p class="learning-status js-lesson-status" role="status" aria-live="polite">코드를 수정한 뒤 실행을 눌러보세요.</p>
        <iframe class="javascript-lesson-frame" title="${id} 격리된 실행 결과" sandbox="allow-scripts"></iframe>`;
      lesson.append(note, lab);
      lab.dataset.initialCode = sample.code;
      lab.dataset.initialHtml = sample.html;
      lab.querySelector('.lesson-html-editor').value = sample.html;
      lab.querySelector('.lesson-js-editor').value = sample.code;
      if (id === 'intro') {
        lab.querySelector('.lesson-html-editor').setAttribute('aria-describedby', 'javascript-intro-guidance');
        const guidance = document.createElement('p');
        guidance.id = 'javascript-intro-guidance';
        guidance.className = 'learning-status';
        guidance.textContent = '실제 페이지에서는 defer를 사용하면 HTML을 모두 읽은 뒤 스크립트가 실행됩니다. console.log는 개발자 도구 Console에도 출력됩니다.';
        lab.insertBefore(guidance, lab.firstChild.nextSibling);
      }
    });

    // 허용한 반복문은 횟수와 실행 시간을 검사하고 별도 iframe에서 실행합니다.
    $(document).on('click', '.js-lesson-run', function () {
      const lab = this.closest('.javascript-lesson-lab');
      const code = lab.querySelector('.lesson-js-editor').value;
      const html = lab.querySelector('.lesson-html-editor').value;
      const status = lab.querySelector('.js-lesson-status');
      if (html.length > 12000) {
        status.textContent = 'HTML은 12,000자 이하로 입력해주세요.';
        return;
      }
      const safeHtml = sanitizeLessonHtml(html);
      const guarded = safeLoopCode(code);
      if (guarded.error) {
        status.textContent = guarded.error;
        return;
      }
      const frame = lab.querySelector('.javascript-lesson-frame');
      const runId = `${lab.dataset.lessonId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      frame.dataset.runId = runId;
      status.textContent = '실습 코드를 실행하고 있습니다.';
      window.clearTimeout(runTimeouts.get(frame));
      frame.srcdoc = buildFrame(safeHtml, guarded.code, runId);
      runTimeouts.set(frame, window.setTimeout(function () {
        if (frame.dataset.runId !== runId) return;
        frame.srcdoc = 'about:blank';
        status.textContent = '실행 시간이 2초를 초과해 실습을 중단했습니다. 코드를 간단하게 바꿔 다시 실행해주세요.';
        runTimeouts.delete(frame);
      }, 2000));
    });

    $(document).on('click', '.js-lesson-reset', function () {
      const lab = this.closest('.javascript-lesson-lab');
      lab.querySelector('.lesson-html-editor').value = lab.dataset.initialHtml;
      lab.querySelector('.lesson-js-editor').value = lab.dataset.initialCode;
      const frame = lab.querySelector('.javascript-lesson-frame');
      window.clearTimeout(runTimeouts.get(frame));
      runTimeouts.delete(frame);
      frame.srcdoc = 'about:blank';
      lab.querySelector('.js-lesson-status').textContent = '실습을 초기 상태로 되돌렸습니다.';
    });

    $(document).on('click', '.js-lesson-copy', async function () {
      const lab = this.closest('.javascript-lesson-lab');
      const html = lab.querySelector('.lesson-html-editor').value;
      const code = escapeScriptClose(lab.querySelector('.lesson-js-editor').value);
      const bundle = `<!doctype html>\n<html lang="ko">\n<head><meta charset="utf-8"><title>JavaScript 실습</title></head>\n<body>\n${html}\n<script>\n${code}\n</script>\n</body>\n</html>`;
      const status = lab.querySelector('.js-lesson-status');
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(bundle);
        status.textContent = 'HTML과 JavaScript 코드가 함께 복사되었습니다.';
      } catch (error) {
        const temporary = document.createElement('textarea');
        temporary.value = bundle;
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand('copy');
        temporary.remove();
        status.textContent = copied ? 'HTML과 JavaScript 코드가 함께 복사되었습니다.' : '복사할 수 없습니다. 브라우저 권한을 확인해주세요.';
      }
    });

    window.addEventListener('message', function (event) {
      if (event.source === window || !event.data || event.data.type !== 'javascript-lesson') return;
      document.querySelectorAll('.javascript-lesson-lab').forEach(function (lab) {
        const frame = lab.querySelector('.javascript-lesson-frame');
        if (frame.contentWindow === event.source && frame.dataset.runId === event.data.runId) {
          if (event.data.finished !== false) {
            window.clearTimeout(runTimeouts.get(frame));
            runTimeouts.delete(frame);
          }
          lab.querySelector('.js-lesson-status').textContent = event.data.message;
        }
      });
    });
  }

  // 이미지 편집은 서버 전송 없이 Canvas API에서 수행합니다.
  function initializeImageTools() {
    const fileInput = document.getElementById('image-file');
    if (!fileInput) return;
    const preview = document.getElementById('image-preview');
    const previewContext = preview.getContext('2d');
    const working = document.createElement('canvas');
    const workingContext = working.getContext('2d');
    const wrap = document.getElementById('image-canvas-wrap');
    const selection = document.getElementById('crop-selection');
    const state = {
      file: null, outputBlob: null, outputUrl: '', cropStart: null,
      cropEnd: null, selecting: false, generation: 0
    };

    const formatBytes = bytes => {
      if (!Number.isFinite(bytes)) return '-';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };
    const setStatus = message => { $('#image-status').text(message); };
    const syncPreview = function () {
      preview.width = working.width;
      preview.height = working.height;
      previewContext.clearRect(0, 0, preview.width, preview.height);
      previewContext.drawImage(working, 0, 0);
      $('#image-placeholder').prop('hidden', Boolean(working.width));
      $(preview).prop('hidden', !working.width);
      $('#image-width').val(working.width);
      $('#image-height').val(working.height);
    };
    const currentQuality = () => Number($('#image-quality').val()) / 100;
    const selectedMime = () => $('#image-format').val() || 'image/jpeg';
    const extensionFor = mime => mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];

    // 저장 형식과 압축 품질을 반영해 예상 파일 크기와 다운로드 데이터를 준비합니다.
    const renderExport = function () {
      if (!working.width || !working.height) return;
      const version = ++state.generation;
      $('#image-download').prop('disabled', true);
      const mime = selectedMime();
      const quality = currentQuality();
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = working.width;
      outputCanvas.height = working.height;
      const context = outputCanvas.getContext('2d');
      if (mime === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      }
      context.drawImage(working, 0, 0);
      outputCanvas.toBlob(function (blob) {
        if (version !== state.generation) return;
        if (!blob) {
          setStatus('이 브라우저에서 선택한 이미지 형식으로 저장할 수 없습니다.');
          return;
        }
        state.outputBlob = blob;
        if (state.outputUrl) URL.revokeObjectURL(state.outputUrl);
        state.outputUrl = URL.createObjectURL(blob);
        const actualMime = blob.type || mime;
        const originalName = state.file ? state.file.name.replace(/\.[^.]+$/, '') : 'image';
        $('#image-after-size').text(formatBytes(blob.size));
        $('#image-download')
          .prop('disabled', false)
          .attr('data-download-url', state.outputUrl)
          .attr('data-download-name', `${originalName}-edited.${extensionFor(actualMime)}`);
        setStatus(`변환 미리보기 준비 완료 (${extensionFor(actualMime).toUpperCase()}, ${formatBytes(blob.size)}).`);
      }, mime, quality);
    };

    const updateQualityLabels = function () {
      const value = $('#image-quality').val();
      $('#image-quality-label, #image-quality-duplicate-label').text(`${value}%`);
      $('#image-quality-duplicate').val(value);
    };
    const resetCropSelection = function () {
      state.cropStart = null;
      state.cropEnd = null;
      selection.style.display = 'none';
    };
    const pointerPoint = function (event) {
      const rect = preview.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
        rect
      };
    };
    const updateCropOverlay = function () {
      if (!state.cropStart || !state.cropEnd) return;
      const rect = preview.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const left = Math.min(state.cropStart.x, state.cropEnd.x);
      const top = Math.min(state.cropStart.y, state.cropEnd.y);
      const width = Math.abs(state.cropEnd.x - state.cropStart.x);
      const height = Math.abs(state.cropEnd.y - state.cropStart.y);
      selection.style.display = 'block';
      selection.style.left = `${rect.left - wrapRect.left + left}px`;
      selection.style.top = `${rect.top - wrapRect.top + top}px`;
      selection.style.width = `${width}px`;
      selection.style.height = `${height}px`;
    };

    fileInput.addEventListener('change', function () {
      const file = this.files && this.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setStatus('JPG, PNG, WebP 이미지 파일을 선택해 주세요.');
        this.value = '';
        return;
      }
      const loadVersion = ++state.generation;
      state.outputBlob = null;
      $('#image-download').prop('disabled', true);
      const temporaryUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () {
        if (loadVersion !== state.generation) {
          URL.revokeObjectURL(temporaryUrl);
          return;
        }
        if (image.naturalWidth * image.naturalHeight > 40000000) {
          URL.revokeObjectURL(temporaryUrl);
          setStatus('이미지가 너무 큽니다. 40메가픽셀 이하의 이미지를 선택해 주세요.');
          return;
        }
        state.file = file;
        state.outputBlob = null;
        if (state.outputUrl) URL.revokeObjectURL(state.outputUrl);
        state.outputUrl = '';
        working.width = image.naturalWidth;
        working.height = image.naturalHeight;
        workingContext.clearRect(0, 0, working.width, working.height);
        workingContext.drawImage(image, 0, 0);
        URL.revokeObjectURL(temporaryUrl);
        $('#image-file-name').text(file.name);
        $('#image-file-size').text(formatBytes(file.size));
        $('#image-dimensions').text(`${image.naturalWidth} × ${image.naturalHeight} px`);
        $('#image-file-type').text(file.type || '형식 정보 없음');
        $('#image-before-size').text(formatBytes(file.size));
        $('#image-reset').prop('disabled', false);
        resetCropSelection();
        syncPreview();
        renderExport();
        setStatus('이미지를 브라우저에서 열었습니다. 파일은 서버로 전송되지 않습니다.');
      };
      image.onerror = function () {
        URL.revokeObjectURL(temporaryUrl);
        setStatus('이미지를 열지 못했습니다. 다른 파일을 선택해 주세요.');
      };
      image.src = temporaryUrl;
    });

    $('#image-quality, #image-quality-duplicate').on('input', function () {
      $('#image-quality, #image-quality-duplicate').val(this.value);
      updateQualityLabels();
      renderExport();
    });
    $('#image-format').on('change', renderExport);

    $('#image-keep-ratio').on('change', function () {
      this.dataset.ratio = working.height ? String(working.width / working.height) : '1';
    }).trigger('change');
    $('#image-width').on('input', function () {
      const width = Number(this.value);
      if ($('#image-keep-ratio').prop('checked') && width > 0 && working.height) {
        $('#image-height').val(Math.max(1, Math.round(width / (working.width / working.height))));
      }
    });
    $('#image-height').on('input', function () {
      const height = Number(this.value);
      if ($('#image-keep-ratio').prop('checked') && height > 0 && working.width) {
        $('#image-width').val(Math.max(1, Math.round(height * (working.width / working.height))));
      }
    });
    $('#image-apply-resize').on('click', function () {
      const width = Number($('#image-width').val());
      const height = Number($('#image-height').val());
      if (!working.width || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 12000 || height > 12000 || width * height > 40000000) {
        setStatus('이미지를 먼저 고르고 가로·세로 1~12000px, 전체 40메가픽셀 이하로 입력하세요.');
        return;
      }
      const resized = document.createElement('canvas');
      resized.width = width;
      resized.height = height;
      resized.getContext('2d').drawImage(working, 0, 0, width, height);
      working.width = width;
      working.height = height;
      workingContext.drawImage(resized, 0, 0);
      syncPreview();
      resetCropSelection();
      renderExport();
    });

    preview.addEventListener('pointerdown', function (event) {
      if (!working.width || !$('#crop').is(':visible')) return;
      event.preventDefault();
      preview.setPointerCapture(event.pointerId);
      const point = pointerPoint(event);
      state.selecting = true;
      state.cropStart = { x: point.x, y: point.y };
      state.cropEnd = { x: point.x, y: point.y };
      updateCropOverlay();
    });
    preview.addEventListener('pointermove', function (event) {
      if (!state.selecting) return;
      const point = pointerPoint(event);
      let x = point.x;
      let y = point.y;
      const ratioValue = $('#crop-ratio').val();
      if (ratioValue !== 'free') {
        const parts = ratioValue.split(':').map(Number);
        const targetRatio = parts[0] / parts[1];
        const dx = x - state.cropStart.x;
        const dy = y - state.cropStart.y;
        if (Math.abs(dx) / Math.max(1, Math.abs(dy)) > targetRatio) {
          y = state.cropStart.y + Math.sign(dy || 1) * Math.abs(dx) / targetRatio;
        } else {
          x = state.cropStart.x + Math.sign(dx || 1) * Math.abs(dy) * targetRatio;
        }
        x = Math.max(0, Math.min(point.rect.width, x));
        y = Math.max(0, Math.min(point.rect.height, y));
      }
      state.cropEnd = { x, y };
      updateCropOverlay();
    });
    preview.addEventListener('pointerup', function () {
      state.selecting = false;
    });
    preview.addEventListener('pointercancel', function () {
      state.selecting = false;
    });
    $('#image-apply-crop').on('click', function () {
      if (!state.cropStart || !state.cropEnd) {
        setStatus('미리보기에서 먼저 잘라낼 영역을 드래그해 선택하세요.');
        return;
      }
      const rect = preview.getBoundingClientRect();
      const left = Math.min(state.cropStart.x, state.cropEnd.x);
      const top = Math.min(state.cropStart.y, state.cropEnd.y);
      const width = Math.abs(state.cropEnd.x - state.cropStart.x);
      const height = Math.abs(state.cropEnd.y - state.cropStart.y);
      if (width < 2 || height < 2 || !rect.width || !rect.height) {
        setStatus('잘라낼 영역을 조금 더 크게 선택하세요.');
        return;
      }
      const scaleX = working.width / rect.width;
      const scaleY = working.height / rect.height;
      const cropX = Math.round(left * scaleX);
      const cropY = Math.round(top * scaleY);
      const cropWidth = Math.max(1, Math.min(working.width - cropX, Math.round(width * scaleX)));
      const cropHeight = Math.max(1, Math.min(working.height - cropY, Math.round(height * scaleY)));
      const cropped = document.createElement('canvas');
      cropped.width = cropWidth;
      cropped.height = cropHeight;
      cropped.getContext('2d').drawImage(working, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      working.width = cropWidth;
      working.height = cropHeight;
      workingContext.drawImage(cropped, 0, 0);
      syncPreview();
      resetCropSelection();
      renderExport();
    });

    $('[data-image-rotate]').on('click', function () {
      if (!working.width) return setStatus('먼저 이미지를 선택하세요.');
      const angle = Number(this.dataset.imageRotate) * Math.PI / 180;
      const rotated = document.createElement('canvas');
      rotated.width = working.height;
      rotated.height = working.width;
      const context = rotated.getContext('2d');
      context.translate(rotated.width / 2, rotated.height / 2);
      context.rotate(angle);
      context.drawImage(working, -working.width / 2, -working.height / 2);
      working.width = rotated.width;
      working.height = rotated.height;
      workingContext.drawImage(rotated, 0, 0);
      syncPreview();
      renderExport();
    });
    $('[data-image-flip]').on('click', function () {
      if (!working.width) return setStatus('먼저 이미지를 선택하세요.');
      const flipped = document.createElement('canvas');
      flipped.width = working.width;
      flipped.height = working.height;
      const context = flipped.getContext('2d');
      if (this.dataset.imageFlip === 'horizontal') {
        context.translate(flipped.width, 0);
        context.scale(-1, 1);
      } else {
        context.translate(0, flipped.height);
        context.scale(1, -1);
      }
      context.drawImage(working, 0, 0);
      workingContext.clearRect(0, 0, working.width, working.height);
      workingContext.drawImage(flipped, 0, 0);
      syncPreview();
      renderExport();
    });

    $('#image-download').on('click', function () {
      if (!state.outputUrl || !state.outputBlob) return setStatus('저장할 이미지가 준비되지 않았습니다.');
      const link = document.createElement('a');
      link.href = state.outputUrl;
      link.download = this.dataset.downloadName || 'image-edited';
      link.click();
    });
    $('#image-reset').on('click', function () {
      if (!state.file) return;
      const temporaryUrl = URL.createObjectURL(state.file);
      const image = new Image();
      image.onload = function () {
        working.width = image.naturalWidth;
        working.height = image.naturalHeight;
        workingContext.clearRect(0, 0, working.width, working.height);
        workingContext.drawImage(image, 0, 0);
        URL.revokeObjectURL(temporaryUrl);
        syncPreview();
        resetCropSelection();
        renderExport();
        setStatus('원본 이미지로 되돌렸습니다.');
      };
      image.onerror = function () {
        URL.revokeObjectURL(temporaryUrl);
        setStatus('원본 이미지를 다시 열지 못했습니다.');
      };
      image.src = temporaryUrl;
    });

    // 이미지 메뉴 탭과 해시 링크는 같은 활성화 함수를 사용합니다.
    const activateImageMode = function (mode) {
      if (!document.getElementById(mode)) return;
      $('[data-image-mode]').each(function () {
        const active = this.dataset.imageMode === mode;
        $(this).toggleClass('active', active).attr('aria-selected', String(active));
        $(`#${this.dataset.imageMode}`).prop('hidden', !active);
      });
      if (mode !== 'crop') resetCropSelection();
    };
    $('[data-image-mode]').on('click', function () {
      activateImageMode(this.dataset.imageMode);
    }).on('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const tabs = $('[data-image-mode]').toArray();
      const index = tabs.indexOf(this);
      const next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      event.preventDefault();
      activateImageMode(tabs[next].dataset.imageMode);
      tabs[next].focus();
    });
    const hashMode = window.location.hash.slice(1);
    if (document.getElementById(hashMode)) activateImageMode(hashMode);
    updateQualityLabels();
    $(preview).prop('hidden', true);
  }

  initializeDeveloperTools();
  initializeComponentDemo();
  initializeContrastChecker();
  initializeJavaScriptPractice();
  initializeJavaScriptLessons();
  initializeImageTools();
});
