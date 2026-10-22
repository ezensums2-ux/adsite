$(function () {
  const $page = $('[data-example-demo]');
  if (!$page.length) return;

  const mode = $page.data('example-demo');
  const $stage = $('#examples-demo-stage');
  const $output = $('#examples-code');
  const $status = $('#examples-copy-status');
  const defaults = {
    buttons: { variant: 'primary', size: 'medium', shape: 'rounded', disabled: false },
    cards: { type: 'product', density: 20, shadow: true },
    navigation: { alignment: 'space-between', theme: 'light', width: 760 },
    forms: { layout: 'stacked', state: 'neutral', required: true },
    sections: { layout: 'split', theme: 'light', align: 'left', action: true }
  };

  function documentCode(title, markup, css, script) {
    return `<!doctype html>\n<html lang="ko">\n<head>\n  <meta charset="utf-8">\n  <title>${title}</title>\n  <style>\n${css}\n  </style>\n</head>\n<body>\n${markup}\n${script ? `\n<script>\n${script}\n</script>` : ''}\n</body>\n</html>`;
  }

  function numberValue(selector, fallback, minimum, maximum) {
    const value = Number($(selector).val());
    return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
  }

  function renderButtons() {
    const variants = ['primary', 'secondary', 'outline'];
    const sizes = ['small', 'medium', 'large'];
    const shapes = ['square', 'rounded', 'pill'];
    const variant = variants.includes($('#button-variant').val()) ? $('#button-variant').val() : defaults.buttons.variant;
    const size = sizes.includes($('#button-size').val()) ? $('#button-size').val() : defaults.buttons.size;
    const shape = shapes.includes($('#button-shape').val()) ? $('#button-shape').val() : defaults.buttons.shape;
    const disabled = $('#button-disabled').prop('checked');
    const classes = ['demo-button', `is-${variant}`, `is-${size}`, `is-${shape}`].join(' ');
    $stage.find('.demo-button').first().attr('class', classes).prop('disabled', disabled);
    $stage.find('.demo-button-secondary').prop('disabled', disabled);
    $('#examples-preview-note').text(`${variant} · ${size} · ${shape}${disabled ? ' · 비활성' : ''}`);
    const css = `    .button {\n      min-height: ${size === 'small' ? 34 : size === 'large' ? 50 : 42}px;\n      padding: 0 ${size === 'small' ? 12 : size === 'large' ? 20 : 16}px;\n      border-radius: ${shape === 'square' ? 2 : shape === 'pill' ? 999 : 8}px;\n      font-weight: 700;\n    }\n    .button-primary { border: 1px solid #6546c8; background: #6546c8; color: #fff; }\n    .button-secondary { border: 1px solid #ddd7ea; background: #fff; color: #3e3a49; }\n    .button-outline { border: 1px solid #6546c8; background: transparent; color: #5034ad; }\n    .button:disabled { border-color: #ddd9e5; background: #eceaf0; color: #9994a2; cursor: not-allowed; }`;
    const markup = `<button class="button button-${variant}" type="button"${disabled ? ' disabled' : ''}>계속하기</button>\n<button class="button button-secondary" type="button"${disabled ? ' disabled' : ''}>나중에</button>`;
    $output.val(documentCode('버튼 예제', `<div class="button-row">\n  ${markup.replace(/\n/g, '\n  ')}\n</div>`, css));
  }

  function renderCards() {
    const types = ['product', 'profile', 'article'];
    const type = types.includes($('#card-type').val()) ? $('#card-type').val() : defaults.cards.type;
    const density = numberValue('#card-density', 20, 12, 32);
    const shadow = $('#card-shadow').prop('checked');
    const content = {
      product: { label: 'FEATURED ITEM', title: '데일리 노트', description: '생각을 정리하는 가벼운 기록 도구입니다.', footer: '<strong class="demo-card-price">₩12,000</strong><a class="demo-card-link" href="#">자세히 보기</a>', art: '제품 이미지 영역', artStyle: 'background:linear-gradient(135deg,#dcefeb,#c5d6ec);color:#17695e;' },
      profile: { label: 'DESIGNER', title: '김하늘', description: '사용자에게 편안한 경험을 만드는 디자이너입니다.', footer: '<strong class="demo-card-price">서울 · 제품팀</strong><a class="demo-card-link" href="#">프로필 보기</a>', art: '<span class="demo-avatar">하</span>', artStyle: 'background:#f4f1fb;' },
      article: { label: 'CSS · 6분 읽기', title: '간격이 만드는 리듬', description: '일관된 간격은 화면을 읽는 순서를 자연스럽게 안내합니다.', footer: '<strong class="demo-card-price">2026. 10. 13</strong><a class="demo-card-link" href="#">읽어보기</a>', art: 'ARTICLE', artStyle: 'background:linear-gradient(135deg,#f4e8d9,#e5f0ec);color:#76543e;' }
    }[type];
    const markup = `<article class="demo-card${shadow ? ' has-shadow' : ''}" style="padding:0">\n  <div class="demo-card-art" style="${content.artStyle}">${content.art}</div>\n  <div class="demo-card-body" style="padding:${density}px">\n    <span class="demo-card-eyebrow">${content.label}</span>\n    <h2 class="demo-card-title">${content.title}</h2>\n    <p class="demo-card-description">${content.description}</p>\n    <div class="demo-card-footer">${content.footer}</div>\n  </div>\n</article>`;
    $stage.html(markup);
    $('#card-density-value').text(`${density}px`);
    $('#examples-preview-note').text(`${type} 카드 · 안쪽 여백 ${density}px · 그림자 ${shadow ? '켜짐' : '꺼짐'}`);
    const css = `    .card {\n      overflow: hidden;\n      border: 1px solid #e5e1eb;\n      border-radius: 8px;\n      background: #fff;\n      ${shadow ? 'box-shadow: 0 12px 28px rgb(37 36 49 / 13%);' : ''}\n    }\n    .card-body { padding: ${density}px; }\n    .card-title { margin: 0; font-size: 16px; }\n    .card-description { color: #777486; line-height: 1.7; }`;
    $output.val(documentCode('카드 예제', markup.replaceAll('demo-card', 'card').replaceAll('demo-card-art', 'card-art').replaceAll('demo-card-body', 'card-body').replaceAll('demo-card-eyebrow', 'card-eyebrow').replaceAll('demo-card-title', 'card-title').replaceAll('demo-card-description', 'card-description').replaceAll('demo-card-footer', 'card-footer').replaceAll('demo-card-price', 'card-meta').replaceAll('demo-card-link', 'card-link').replaceAll('demo-avatar', 'avatar'), css));
  }

  function renderNavigation() {
    const alignments = ['space-between', 'center', 'flex-end'];
    const themes = ['light', 'dark'];
    const alignment = alignments.includes($('#nav-alignment').val()) ? $('#nav-alignment').val() : defaults.navigation.alignment;
    const theme = themes.includes($('#nav-theme').val()) ? $('#nav-theme').val() : defaults.navigation.theme;
    const width = numberValue('#nav-width', 760, 320, 900);
    const compact = width < 560;
    const markup = `<header class="site-header demo-nav${theme === 'dark' ? ' is-dark' : ''}${compact ? ' is-compact' : ''}" style="justify-content:${alignment}">\n  <a class="demo-brand" href="#">STUDIO</a>\n  <nav class="site-nav-links demo-nav-links" id="demo-nav-links" aria-label="예제 내비게이션">\n    <a href="#services">서비스</a><a href="#work">작업</a><a href="#about">소개</a>\n  </nav>\n  <button class="demo-menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="demo-nav-links">메뉴</button>\n  <button class="demo-nav-cta" type="button">문의하기</button>\n</header>`;
    $stage.html(markup).css('width', '100%');
    $stage.find('.demo-nav').css({ width: `${width}px`, maxWidth: '100%', justifyContent: alignment });
    $stage.find('.demo-menu-toggle').on('click', function () {
      const expanded = $(this).attr('aria-expanded') === 'true';
      $(this).attr('aria-expanded', String(!expanded)).attr('aria-label', expanded ? '메뉴 열기' : '메뉴 닫기');
      $stage.find('.site-header').toggleClass('is-menu-open', !expanded);
    });
    $('#nav-width-value').text(`${width}px`);
    $('#examples-preview-note').text(`${width}px 화면 · ${compact ? '메뉴 버튼 표시' : '전체 링크 표시'} · ${theme === 'dark' ? '어두운 테마' : '밝은 테마'}`);
    const css = `    .site-header {\n      display: flex;\n      align-items: center;\n      justify-content: ${alignment};\n      flex-wrap: wrap;\n      gap: 12px;\n      padding: 12px 16px;\n      color: ${theme === 'dark' ? '#f7f4ff' : '#252431'};\n      background: ${theme === 'dark' ? '#211e2a' : '#fff'};\n    }\n    .site-nav-links { display: flex; gap: 16px; }\n    .demo-menu-toggle { display: none; }\n    @media (max-width: 560px) {\n      .site-nav-links { display: none; width: 100%; flex-direction: column; }\n      .demo-menu-toggle { display: inline-flex; }\n      .site-header.is-menu-open .site-nav-links { display: flex; }\n    }`;
    const script = `const menuButton = document.querySelector('.demo-menu-toggle');\nmenuButton.addEventListener('click', () => {\n  const expanded = menuButton.getAttribute('aria-expanded') === 'true';\n  menuButton.setAttribute('aria-expanded', String(!expanded));\n  document.querySelector('.site-header').classList.toggle('is-menu-open', !expanded);\n});`;
    $output.val(documentCode('헤더와 내비게이션 예제', markup, css, script));
  }

  function renderForms() {
    const layouts = ['stacked', 'compact'];
    const states = ['neutral', 'error', 'success'];
    const layout = layouts.includes($('#form-layout').val()) ? $('#form-layout').val() : defaults.forms.layout;
    const state = states.includes($('#form-state').val()) ? $('#form-state').val() : defaults.forms.state;
    const required = $('#form-required').prop('checked');
    const requiredLabel = required ? ' <span class="required" aria-hidden="true">*</span>' : '';
    const invalid = state === 'error';
    const feedback = state === 'error' ? '올바른 이메일 주소를 입력해 주세요.' : state === 'success' ? '이메일 주소가 확인되었습니다.' : '안내 메일을 받을 주소를 입력하세요.';
    const feedbackClass = state === 'error' ? 'is-error' : state === 'success' ? 'is-success' : '';
    const markup = `<form class="demo-form${layout === 'compact' ? ' is-compact' : ''}" novalidate>\n  <div class="demo-form-field">\n    <label class="demo-form-label" for="email">이메일${requiredLabel}</label>\n    <input class="demo-form-input" id="email" name="email" type="email" placeholder="name@example.com"${required ? ' required' : ''}${invalid ? ' aria-invalid="true" aria-describedby="email-feedback"' : ''}>\n  </div>\n  <p class="demo-form-feedback ${feedbackClass}" id="email-feedback" aria-live="polite">${feedback}</p>\n  <button class="demo-form-submit" type="submit">계속하기</button>\n</form>`;
    $stage.html(markup);
    $('#examples-preview-note').text(`${layout === 'compact' ? '가로 레이블' : '세로 레이블'} · ${state === 'neutral' ? '입력 대기' : state === 'error' ? '오류 안내' : '완료 안내'} · 필수 ${required ? '표시' : '아님'}`);
    const css = `    .form { display: grid; gap: 12px; }\n    .field { display: grid; gap: 5px; }\n    .form.is-compact .field { grid-template-columns: minmax(80px, .6fr) minmax(0, 1fr); align-items: center; }\n    .field label { font-size: 12px; font-weight: 700; }\n    .field input { min-height: 38px; padding: 8px 10px; border: 1px solid #d9d5e0; border-radius: 5px; }\n    .field input[aria-invalid="true"] { border-color: #c2414b; }\n    .feedback { color: ${state === 'error' ? '#b42332' : state === 'success' ? '#17695e' : '#777486'}; font-size: 12px; }\n    .required { color: #c2414b; }`;
    $output.val(documentCode('입력 폼 예제', markup.replaceAll('demo-form', 'form').replaceAll('demo-form-field', 'field').replaceAll('demo-form-label', 'label').replaceAll('demo-form-input', 'input').replaceAll('demo-form-feedback', 'feedback').replaceAll('demo-form-submit', 'submit'), css));
  }

  function renderSections() {
    const layouts = ['split', 'stack', 'feature'];
    const themes = ['light', 'dark'];
    const alignments = ['left', 'center'];
    const layout = layouts.includes($('#section-layout').val()) ? $('#section-layout').val() : defaults.sections.layout;
    const theme = themes.includes($('#section-theme').val()) ? $('#section-theme').val() : defaults.sections.theme;
    const align = alignments.includes($('#section-align').val()) ? $('#section-align').val() : defaults.sections.align;
    const action = $('#section-action').prop('checked');
    const markup = `<section class="content-section ${theme === 'dark' ? 'is-dark' : ''} ${align === 'center' ? 'is-center' : ''} is-${layout}" aria-labelledby="section-title">\n  <div class="section-copy">\n    <p class="kicker">DESIGN NOTES</p>\n    <h2 id="section-title">더 나은 화면을 위한 작은 원칙</h2>\n    <p>명확한 구조와 일관된 간격으로 콘텐츠를 편안하게 읽을 수 있도록 정리합니다.</p>\n    ${action ? '<button type="button">예제 살펴보기</button>' : ''}\n  </div>\n  ${layout !== 'stack' ? '<div class="section-visual" aria-hidden="true">콘텐츠 이미지 영역</div>' : ''}\n</section>`;
    $stage.html(markup);
    $stage.find('.content-section').addClass(`is-${layout}`).toggleClass('is-dark', theme === 'dark').toggleClass('is-center', align === 'center');
    $('#examples-preview-note').text(`${layout} 구성 · ${theme === 'dark' ? '어두운 배경' : '밝은 배경'} · ${align === 'center' ? '가운데 정렬' : '왼쪽 정렬'}`);
    const grid = layout === 'split' ? 'minmax(0, 1fr) minmax(120px, .8fr)' : '1fr';
    const css = `    .content-section {\n      display: grid;\n      grid-template-columns: ${grid};\n      gap: 16px;\n      align-items: center;\n      padding: 20px;\n      color: ${theme === 'dark' ? '#fff' : '#252431'};\n      background: ${theme === 'dark' ? '#252431' : '#fff'};\n      text-align: ${align};\n    }\n    .content-section.is-feature { justify-items: center; }\n    .content-section .section-visual { min-height: 130px; background: linear-gradient(135deg, #dff4ef, #e8e2f6 52%, #f5dbcb); }\n    @media (max-width: 560px) { .content-section { grid-template-columns: 1fr; } }`;
    $output.val(documentCode('소개와 콘텐츠 섹션', markup, css));
  }

  const renderers = { buttons: renderButtons, cards: renderCards, navigation: renderNavigation, forms: renderForms, sections: renderSections };
  const render = renderers[mode];
  if (!render) return;

  $page.on('input.examples change.examples', 'input, select', render);
  $('#examples-reset').on('click', function () {
    const values = defaults[mode];
    Object.keys(values).forEach(function (key) {
      const selector = `#${mode === 'buttons' ? 'button' : mode === 'cards' ? 'card' : mode === 'navigation' ? 'nav' : mode === 'forms' ? 'form' : 'section'}-${key}`;
      if ($(selector).attr('type') === 'checkbox') $(selector).prop('checked', values[key]);
      else $(selector).val(values[key]);
    });
    $status.text('');
    render();
  });

  $('#examples-copy').on('click', async function () {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText($output.val());
      $status.text('코드를 복사했습니다.');
    } catch (error) {
      $output.trigger('focus').trigger('select');
      const copied = document.execCommand('copy');
      $status.text(copied ? '코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
    }
  });

  render();
});