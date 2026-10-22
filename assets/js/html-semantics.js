$(function () {
  const defaultPractice = {
    siteName: '스타일 노트',
    navLabel: '학습 메뉴',
    mainTitle: '오늘의 학습',
    articleText: '시맨틱 태그를 사용하면 문서 구조를 명확하게 이해할 수 있습니다.',
    footerText: '© 2026 스타일 노트'
  };

  const $siteName = $('#site-name');
  const $navLabel = $('#nav-label');
  const $mainTitle = $('#main-title');
  const $articleText = $('#article-text');
  const $footerText = $('#footer-text');
  const $previewContent = $('#preview-content');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');

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

  function getPracticeValues() {
    return {
      siteName: $siteName.val(),
      navLabel: $navLabel.val(),
      mainTitle: $mainTitle.val(),
      articleText: $articleText.val(),
      footerText: $footerText.val()
    };
  }

  function createPreview(values) {
    const $block = $('<div>', { class: 'semantic-block' });
    const $header = $('<header>', { text: values.siteName || defaultPractice.siteName });
    const $nav = $('<nav>', { text: values.navLabel || defaultPractice.navLabel });
    const $main = $('<main>', { text: values.mainTitle || defaultPractice.mainTitle });
    const $section = $('<section>', { text: values.articleText || defaultPractice.articleText });
    const $footer = $('<footer>', { text: values.footerText || defaultPractice.footerText });

    $block.append($header, $nav, $main, $section, $footer);
    $previewContent.empty().append($block);
  }

  function createHtmlCode(values) {
    const safeSiteName = escapeHtml(values.siteName || defaultPractice.siteName);
    const safeNavLabel = escapeHtml(values.navLabel || defaultPractice.navLabel);
    const safeMainTitle = escapeHtml(values.mainTitle || defaultPractice.mainTitle);
    const safeArticleText = escapeHtml(values.articleText || defaultPractice.articleText);
    const safeFooterText = escapeHtml(values.footerText || defaultPractice.footerText);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>시맨틱 태그 예시</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    header, nav, main, section, article, footer {
      border: 1px solid #ddd7ea;
      border-radius: 10px;
      background: #fff;
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    header, nav, footer {
      background: #f0ecfb;
      color: #5034ad;
      font-weight: 700;
    }
    h1, p {
      margin: 0;
    }
  </style>
</head>
<body>
  <header>${safeSiteName}</header>
  <nav>${safeNavLabel}</nav>
  <main>
    <h1>${safeMainTitle}</h1>
    <article>
      <p>${safeArticleText}</p>
    </article>
  </main>
  <footer>${safeFooterText}</footer>
</body>
</html>`;
  }

  function renderPractice() {
    const values = getPracticeValues();
    createPreview(values);
    const htmlCode = createHtmlCode(values);
    $generatedHtml.val(htmlCode);
  }

  $('#site-name, #nav-label, #main-title, #article-text, #footer-text').on('input', function () {
    renderPractice();
  });

  async function copyHtmlCode() {
    const text = $generatedHtml.val();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $copyStatus.text('HTML 코드를 복사했습니다.');
    } catch (error) {
      $generatedHtml.focus();
      $generatedHtml[0].select();
      try {
        const copied = document.execCommand('copy');
        $copyStatus.text(copied ? 'HTML 코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      } catch (copyError) {
        $copyStatus.text('코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      }
    }
  }

  $('#copy-html-code').on('click', function () {
    copyHtmlCode();
  });

  function resetPractice() {
    $siteName.val(defaultPractice.siteName);
    $navLabel.val(defaultPractice.navLabel);
    $mainTitle.val(defaultPractice.mainTitle);
    $articleText.val(defaultPractice.articleText);
    $footerText.val(defaultPractice.footerText);
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  renderPractice();
});
