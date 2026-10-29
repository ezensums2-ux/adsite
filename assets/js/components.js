(function ($) {
  const componentScriptUrl = document.currentScript ? document.currentScript.src : '';

  // 메뉴와 푸터는 여러 페이지에서 재사용할 수 있도록 공통 설정을 기반으로 렌더링합니다.
  function escapeHTML(value) {
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

  // 메뉴 링크 경로를 반환합니다.
  function resolveMenuHref(href) {
    return href || '';
  }

  // 전체 페이지에서 공통으로 사용하는 상단 메뉴와 하위 메뉴입니다.
  function createPrimaryMenu() {
    const item = (id, label, href) => href ? { id, label, href } : { id, label };
    const htmlPages = [
      ['html-basic', '기본 문서 구조', 'html-basic.html'],
      ['html-text', '제목과 문단', 'html-text.html'],
      ['html-links', '링크와 이미지', 'html-links.html'],
      ['html-lists', '목록과 표', 'html-lists.html'],
      ['html-forms', '입력 폼과 버튼', 'html-forms.html'],
      ['html-semantics', '시맨틱 태그', 'html-semantics.html']
    ].map(([id, label, href]) => item(id, label, href));
    const cssPages = [
      ['css-basics', 'CSS 연결 방법과 선택자', 'css-basics.html'],
      ['css-priority', '우선순위와 상속', 'css-priority.html'],
      ['css-colors-units', '색상과 단위', 'css-colors-units.html'],
      ['css-font-text', '글꼴과 텍스트', 'css-font-text.html'],
      ['css-box-model', '박스 모델', 'css-box-model.html'],
      ['css-backgrounds', '배경과 이미지', 'css-backgrounds.html'],
      ['css-display-position', 'display와 position', 'css-display-position.html']
    ].map(([id, label, href]) => item(id, label, href));
    const anchors = (prefix, entries) => entries.map(([id, label, hash]) => item(id, label, hash ? `${prefix}${hash}` : undefined));
    return [
      { id: 'design', label: '디자인 도구', children: anchors('index.html', [
        ['tools', '색상 코드', '#panel-color'], ['gradient', '그라데이션 생성기', '#panel-gradient'],
        ['shadow', '그림자 생성기', '#panel-shadow'], ['corners', '모서리 생성기', '#panel-corners'],
        ['borders', '테두리 생성기', '#panel-borders']
      ]) },
      { id: 'image', label: '이미지 도구', children: anchors('image-tools.html', [
        ['image-compress', '이미지 압축', '#compress'], ['image-resize', '이미지 크기 조절', '#resize'],
        ['image-crop', '이미지 잘라내기', '#crop'], ['image-convert', '이미지 형식 변환', '#convert'],
        ['image-rotate', '이미지 회전', '#rotate'], ['image-flip', '이미지 반전', '#flip'],
        ['image-quality', '이미지 품질 조절', '#quality']
      ]) },
      { id: 'html', label: 'HTML 기초', children: [
        item('html-overview', 'HTML 기초 전체 보기', 'html.html'),
        ...htmlPages
      ] },
      { id: 'css', label: 'CSS 기초', children: [
        item('css-overview', 'CSS 기초 전체 보기', 'css.html'),
        ...cssPages
      ] },
      { id: 'layout', label: '레이아웃', children: [
        item('layout-overview', '레이아웃 전체 보기', 'layout.html'),
        item('layout-flexbox', 'Flexbox 실습', 'layout-flexbox.html'),
        item('layout-grid', 'Grid 실습', 'layout-grid.html'),
        item('layout-responsive', '반응형과 미디어 쿼리', 'layout-responsive.html'),
        item('layout-examples', '레이아웃 예제', 'layout-examples.html')
      ] },
      { id: 'animation', label: 'CSS 애니메이션', children: [
        item('animation-overview', '애니메이션 전체 보기', 'animation.html'),
        item('animation-transform', 'Transform', 'animation-transform.html'),
        item('animation-transition', 'Transition', 'animation-transition.html'),
        item('animation-keyframes', 'Keyframes', 'animation-keyframes.html'),
        item('animation-examples', '효과 예제', 'animation-examples.html')
      ] },
      { id: 'javascript', label: 'JavaScript 기초', children: anchors('javascript.html', [
        ['js-intro', 'JavaScript 소개', '#intro'], ['js-variables', '변수와 자료형', '#variables'],
        ['js-operators', '연산자', '#operators'], ['js-conditionals', '조건문', '#conditionals'],
        ['js-loops', '반복문', '#loops'], ['js-functions', '함수', '#functions'],
        ['js-arrays', '배열', '#arrays'], ['js-objects', '객체', '#objects'],
        ['js-dom', 'DOM 선택', '#dom'], ['js-events', '이벤트', '#events'],
        ['js-html-css', 'HTML / CSS 변경', '#html-css'], ['js-practice', '간단한 실습', '#practice']
      ]) },
      { id: 'components', label: 'UI 컴포넌트', children: [
        item('component-button', '버튼', 'ui-components.html#button'),
        item('component-card', '카드', 'ui-components.html#card'),
        item('component-badge', '배지', 'ui-components.html#badge'),
        item('component-tabs', '탭', 'ui-components.html#tabs'),
        item('component-accordion', '아코디언', 'ui-components.html#accordion'),
        item('component-modal', '모달', 'ui-components.html#modal'),
        item('component-dropdown', '드롭다운', 'ui-components.html#dropdown'),
        item('component-tooltip', '툴팁', 'ui-components.html#tooltip'),
        item('component-toggle', '토글 스위치', 'ui-components.html#toggle'),
        item('component-progress', '프로그레스 바', 'ui-components.html#progress'),
        item('component-alert', '알림 메시지', 'ui-components.html#alert'),
        item('component-loading', '로딩 UI', 'ui-components.html#loading')
      ] },
      { id: 'accessibility', label: '웹 접근성', children: anchors('accessibility.html', [
        ['a11y-intro', '웹 접근성이란?', '#intro'], ['a11y-alt', '이미지 alt', '#alt'],
        ['a11y-controls', 'Button과 Link', '#controls'], ['a11y-labels', 'Label과 Input', '#labels'],
        ['a11y-keyboard', '키보드 접근성', '#keyboard'], ['a11y-focus', 'Focus', '#focus'],
        ['a11y-contrast', '색상 대비', '#contrast'], ['a11y-heading', 'Heading 구조', '#heading'],
        ['a11y-aria', 'ARIA 기초', '#aria'], ['a11y-checklist', '접근성 체크리스트', '#checklist']
      ]) },
      { id: 'developer-tools', label: '개발 도구', children: anchors('dev-tools.html', [
        ['tool-px-rem', 'PX → REM 변환기', '#px-rem'], ['tool-rem-px', 'REM → PX 변환기', '#rem-px'],
        ['tool-clamp', 'CSS Clamp 생성기', '#clamp'], ['tool-aspect', 'Aspect Ratio 계산기', '#aspect-ratio'],
        ['tool-url', 'URL Encode / Decode', '#url'],
        ['tool-base64', 'Base64 변환', '#base64'],
        ['tool-json', 'JSON Formatter', '#json'],
        ['tool-lorem', 'Lorem Ipsum 생성기', '#lorem'],
        ['tool-minify', 'CSS Minify', '#minify']
      ]) },
      { id: 'examples', label: '실전 예제', children: [
          item('examples-overview', '실전 예제 전체 보기', 'examples.html'),
          item('example-buttons', '버튼', 'example-buttons.html'),
          item('example-cards', '카드', 'example-cards.html'),
          item('example-header', '헤더와 내비게이션', 'example-header-navigation.html'),
          item('example-forms', '입력 폼', 'example-forms.html'),
          item('example-content', '소개·콘텐츠 섹션', 'example-content-sections.html'),
          item('example-hero', 'Hero Section', 'example-patterns.html#hero'),
          item('example-footer', 'Footer', 'example-patterns.html#footer'),
          item('example-login', 'Login', 'example-patterns.html#login'),
          item('example-portfolio', 'Portfolio', 'example-patterns.html#portfolio'),
          item('example-landing', 'Landing Page', 'example-patterns.html#landing')
        ] }
    ];
  }

  function renderMenuItems(items, activePage, parentId) {
    return (items || []).map(function (item) {
      const current = item.id === activePage;
      const children = item.children || [];
      const submenuId = `submenu-${parentId}-${item.id}`;
      let trigger;

      if (item.href) {
        trigger = `<a class="site-nav-link${current ? ' is-current' : ''}" data-menu-id="${escapeHTML(item.id)}" href="${escapeHTML(resolveMenuHref(item.href))}"${current ? ' aria-current="page"' : ''}>${escapeHTML(item.label)}</a>`;
      } else if (children.length) {
        const status = item.status ? `<span class="menu-status">${escapeHTML(item.status)}</span>` : '';
        trigger = `<button class="menu-group-toggle" type="button" aria-expanded="false" aria-controls="${escapeHTML(submenuId)}"><span>${escapeHTML(item.label)}</span>${status}<span class="submenu-caret" aria-hidden="true">⌄</span></button>`;
      } else {
        trigger = `<span class="menu-static" aria-disabled="true"><span>${escapeHTML(item.label)}</span><span class="menu-status">${escapeHTML(item.status || '준비 중')}</span></span>`;
      }

      const submenu = children.length
        ? `<ul class="submenu-list" id="${escapeHTML(submenuId)}" hidden>${renderMenuItems(children, activePage, item.id)}</ul>`
        : '';
      return `<li class="menu-item${children.length ? ' has-submenu' : ''}">${trigger}${submenu}</li>`;
    }).join('');
  }

  // 상단 네비게이션은 페이지와 해시를 기준으로 현재 위치를 표시합니다.
  function getActivePage(config) {
    const pageName = decodeURIComponent(window.location.pathname.split('/').pop() || '');
    const section = decodeURIComponent(window.location.hash.slice(1));
    const hashPages = {
      'index.html': { 'panel-color': 'tools', 'panel-gradient': 'gradient', 'panel-shadow': 'shadow', 'panel-corners': 'corners', 'panel-borders': 'borders' },
      'image-tools.html': Object.fromEntries(['compress', 'resize', 'crop', 'convert', 'rotate', 'flip', 'quality'].map(name => [name, `image-${name}`])),
      'javascript.html': Object.fromEntries(['intro', 'variables', 'operators', 'conditionals', 'loops', 'functions', 'arrays', 'objects', 'dom', 'events', 'html-css', 'practice'].map(name => [name, `js-${name}`])),
      'ui-components.html': Object.fromEntries(['button', 'card', 'badge', 'tabs', 'accordion', 'modal', 'dropdown', 'tooltip', 'toggle', 'progress', 'alert', 'loading'].map(name => [name, `component-${name}`])),
      'accessibility.html': Object.fromEntries(['intro', 'alt', 'controls', 'labels', 'keyboard', 'focus', 'contrast', 'heading', 'aria', 'checklist'].map(name => [name, `a11y-${name}`])),
      'dev-tools.html': {
        'px-rem': 'tool-px-rem', 'rem-px': 'tool-rem-px', clamp: 'tool-clamp', 'aspect-ratio': 'tool-aspect',
        url: 'tool-url', base64: 'tool-base64', json: 'tool-json', lorem: 'tool-lorem', minify: 'tool-minify'
      },
      'example-patterns.html': {
        hero: 'example-hero', footer: 'example-footer', login: 'example-login',
        portfolio: 'example-portfolio', landing: 'example-landing'
      }
    };
    const overviewPages = {
      'html.html': 'html-overview',
      'css.html': 'css-overview',
      'layout.html': 'layout-overview',
      'animation.html': 'animation-overview',
      'examples.html': 'examples-overview'
    };
    return hashPages[pageName]?.[section] || overviewPages[pageName] || config.activePage;
  }

  function renderHeader(config) {
    const activePage = getActivePage(config);
    const menu = renderMenuItems(createPrimaryMenu(), activePage, 'primary');
    return `<header class="site-header">
      <div class="site-header-inner">
        <a class="brand" href="${escapeHTML(resolveMenuHref(config.homeHref || 'index.html'))}" aria-label="${escapeHTML(config.siteName)} 홈">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span class="brand-copy"><strong>${escapeHTML(config.siteName)}</strong><span>HTML &amp; CSS 노트</span></span>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
          <span class="menu-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span>
          <span class="sr-only visually-hidden">메뉴 열기</span>
        </button>
        <nav class="site-nav" id="primary-navigation" aria-label="주 메뉴"><ul class="menu-list">${menu}</ul></nav>
      </div>
    </header>`;
  }

  function renderFooter(config) {
    return `<footer class="site-footer">
      <a class="footer-brand" href="${escapeHTML(resolveMenuHref(config.homeHref || 'index.html'))}">${escapeHTML(config.siteName)}</a>
      <p class="footer-description">${escapeHTML(config.footerDescription)}</p>
      <p class="footer-privacy">${escapeHTML(config.footerPrivacy)}</p>
    </footer>`;
  }

  // 같은 페이지에서 해시로 이동해도 현재 메뉴 항목 표시를 갱신합니다.
  function updateCurrentLink(config) {
    const currentUrl = new URL(window.location.href);
    let matched = false;
    $('#primary-navigation .site-nav-link').each(function () {
      const linkUrl = new URL(this.href, window.location.href);
      const isCurrent = linkUrl.pathname === currentUrl.pathname && linkUrl.hash === currentUrl.hash;
      $(this).toggleClass('is-current', isCurrent).attr('aria-current', isCurrent ? 'page' : null);
      matched = matched || isCurrent;
    });

    if (!matched) {
      const activePage = getActivePage(config);
      $('#primary-navigation .site-nav-link').each(function () {
        const linkUrl = new URL(this.href, window.location.href);
        const isCurrent = linkUrl.pathname === currentUrl.pathname
          && !currentUrl.hash && this.dataset.menuId === activePage;
        $(this).toggleClass('is-current', isCurrent).attr('aria-current', isCurrent ? 'page' : null);
      });
    }
  }

  // 쿠팡 파트너스 와이드 배너 및 마퀴 안내 공통 컴포넌트 마크업
  function renderCoupangBanner() {
    return `<aside class="coupang-banner-area" aria-label="쿠팡 파트너스 배너">
      <!-- PC 버전 배너 (너비 680px) -->
      <div class="coupang-banner coupang-banner--pc" id="coupang-banner-pc"></div>

      <!-- 모바일 버전 배너 (너비 280px) -->
      <div class="coupang-banner coupang-banner--mo" id="coupang-banner-mo"></div>

      <!-- 쿠팡 파트너스 안내 문구 (오른쪽에서 왼쪽으로 흐르는 마퀴 효과, 폰트 10px) -->
      <div class="coupang-notice-bar" aria-label="쿠팡 파트너스 안내 문구">
        <div class="coupang-notice-track">
          <div class="coupang-notice-content">
            <span class="coupang-notice-item">이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
            <span class="coupang-notice-dot" aria-hidden="true">&bull;</span>
            <span class="coupang-notice-item" aria-hidden="true">이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
            <span class="coupang-notice-dot" aria-hidden="true">&bull;</span>
          </div>
          <div class="coupang-notice-content" aria-hidden="true">
            <span class="coupang-notice-item">이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
            <span class="coupang-notice-dot">&bull;</span>
            <span class="coupang-notice-item">이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</span>
            <span class="coupang-notice-dot">&bull;</span>
          </div>
        </div>
      </div>
    </aside>`;
  }

  // 쿠팡 파트너스 g.js 동적 로드 및 배너 초기화
  function initCoupangBanner() {
    const pcContainer = document.getElementById('coupang-banner-pc');
    const moContainer = document.getElementById('coupang-banner-mo');
    if (!pcContainer || !moContainer) return;
    if (pcContainer.children.length > 0 || moContainer.children.length > 0) return;

    function buildAds() {
      if (typeof PartnersCoupang === 'undefined' || !PartnersCoupang.G) return;
      try {
        new PartnersCoupang.G({
          id: 1044377,
          template: "carousel",
          trackingCode: "AF3447005",
          width: "680",
          height: "140",
          tsource: "",
          container: pcContainer
        });
      } catch (err) {
        console.error('쿠팡 파트너스 PC 배너 초기화 오류:', err);
      }

      try {
        new PartnersCoupang.G({
          id: 1044385,
          template: "carousel",
          trackingCode: "AF3447005",
          width: "280",
          height: "140",
          tsource: "",
          container: moContainer
        });
      } catch (err) {
        console.error('쿠팡 파트너스 모바일 배너 초기화 오류:', err);
      }
    }

    if (window.PartnersCoupang && window.PartnersCoupang.G) {
      buildAds();
    } else {
      const existingScript = document.querySelector('script[src*="ads-partners.coupang.com/g.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', buildAds);
      } else {
        const script = document.createElement('script');
        script.src = 'https://ads-partners.coupang.com/g.js';
        script.async = true;
        script.onload = buildAds;
        script.onerror = function () {
          console.error('쿠팡 파트너스 g.js 스크립트 로드 실패');
        };
        document.head.appendChild(script);
      }
    }
  }

  // 공통 컴포넌트는 JSON 설정 데이터를 읽어 헤더, 배너, 푸터를 한 번에 구성합니다.
  function mount(config) {
    $('#site-header').html(renderHeader(config));

    // 공통 광고 배너 컴포넌트 마운트
    const showBanner = config.showCoupangBanner !== false;
    if (showBanner) {
      if ($('#site-ad').length) {
        $('#site-ad').html(renderCoupangBanner());
      } else {
        $('#site-header').after('<div id="site-ad">' + renderCoupangBanner() + '</div>');
      }
      initCoupangBanner();
    }

    $('#site-footer').html(renderFooter(config));
  }

  $(function () {
    const configElement = document.getElementById('site-config');
    if (!configElement) return;

    try {
      const config = JSON.parse(configElement.textContent);
      mount(config);
      updateCurrentLink(config);
      window.addEventListener('hashchange', () => updateCurrentLink(config));
    } catch (error) {
      console.error('사이트 공통 컴포넌트 설정을 읽을 수 없습니다.', error);
    }
  });

  $(document)
    .off('.siteComponents')
    .on('click.siteComponents', '.menu-toggle', function () {
      const expanded = $(this).attr('aria-expanded') === 'true';
      $(this).attr('aria-expanded', String(!expanded));
      $(this).find('.visually-hidden').text(expanded ? '메뉴 열기' : '메뉴 닫기');
      $('#primary-navigation').toggleClass('is-open', !expanded);
    })
    .on('click.siteComponents', '.menu-group-toggle', function () {
      const expanded = $(this).attr('aria-expanded') === 'true';
      const button = this;

      function closeGroup(groupButton) {
        $(groupButton).attr('aria-expanded', 'false');
        $(`#${$(groupButton).attr('aria-controls')}`).prop('hidden', true)
          .find('.menu-group-toggle[aria-expanded="true"]').each(function () {
            $(this).attr('aria-expanded', 'false');
            $(`#${$(this).attr('aria-controls')}`).prop('hidden', true);
          });
      }

      // 다른 메뉴를 열 때 이전에 열린 메뉴는 접고, 현재 메뉴의 조상만 유지합니다.
      $('.menu-group-toggle[aria-expanded="true"]').each(function () {
        if (this !== button && !$.contains(this, button)) closeGroup(this);
      });

      const $submenu = $(`#${$(button).attr('aria-controls')}`);
      $(button).attr('aria-expanded', String(!expanded));
      $submenu.prop('hidden', expanded);
      if (expanded) closeGroup(button);
    })
    .on('keydown.siteComponents', function (event) {
      if (event.key !== 'Escape') return;
      const $openGroup = $('.menu-group-toggle[aria-expanded="true"]').last();
      if ($openGroup.length) {
        $openGroup.attr('aria-expanded', 'false');
        $(`#${$openGroup.attr('aria-controls')}`).prop('hidden', true);
        $openGroup.trigger('focus');
        return;
      }
      const $toggle = $('.menu-toggle[aria-expanded="true"]');
      if (!$toggle.length) return;
      $toggle.attr('aria-expanded', 'false').find('.visually-hidden').text('메뉴 열기');
      $('#primary-navigation').removeClass('is-open');
      $toggle.trigger('focus');
    });

})(jQuery);