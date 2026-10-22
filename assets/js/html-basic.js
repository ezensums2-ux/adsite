$(function () {
  // 실습의 기본값은 한 번만 정의하고,
  // 사용자가 입력을 바꾸면 전체 화면이 같은 상태를 반영하도록 유지합니다.
  const defaultPractice = {
    title: '나의 첫 HTML',
    heading: '안녕하세요!',
    paragraph: 'HTML 공부를 시작합니다.'
  };

  const $titleInput = $('#title-input');
  const $headingInput = $('#heading-input');
  const $paragraphInput = $('#paragraph-input');
  const $titlePreview = $('#preview-title');
  const $headingPreview = $('#preview-heading');
  const $paragraphPreview = $('#preview-paragraph');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');

  // 사용자가 입력한 값을 HTML 코드로 안전하게 변환합니다.
  // 문자 그대로 보이게 하면서, HTML이 해석되거나 실행되지 않도록 처리합니다.
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

  // 현재 입력값을 기반으로 완성된 HTML 문서를 생성합니다.
  function createHtmlDocument() {
    const title = $titleInput.val().trim();
    const heading = $headingInput.val();
    const paragraph = $paragraphInput.val();

    const safeTitle = escapeHtml(title || defaultPractice.title);
    const safeHeading = escapeHtml(heading || '');
    const safeParagraph = escapeHtml(paragraph || '');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 2rem;
      color: #5034ad;
    }
    p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <h1>${safeHeading}</h1>
  <p>${safeParagraph}</p>
</body>
</html>`;
  }

  // 입력값을 실시간으로 미리보기와 코드 출력에 반영합니다.
  function renderPractice() {
    const title = $titleInput.val();
    const heading = $headingInput.val();
    const paragraph = $paragraphInput.val();

    $titlePreview.text(title || defaultPractice.title);
    $headingPreview.text(heading || '');
    $paragraphPreview.text(paragraph || '');

    const documentMarkup = createHtmlDocument();
    $generatedHtml.val(documentMarkup);
  }

  // 사용자 입력값이 변할 때마다 실시간으로 갱신합니다.
  $('#title-input, #heading-input, #paragraph-input').on('input', function () {
    renderPractice();
  });

  // 코드 복사 버튼은 사용자가 쉽게 붙여넣을 수 있도록 안내 메시지를 보여줍니다.
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

  // 실습 초기화는 현재 페이지의 기본값만 되돌립니다.
  function resetPractice() {
    $titleInput.val(defaultPractice.title);
    $headingInput.val(defaultPractice.heading);
    $paragraphInput.val(defaultPractice.paragraph);
    renderPractice();
    $copyStatus.text('');
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  // 페이지 로드 시 기본 상태를 반영하고,
  // 생성된 HTML 코드와 미리보기 창이 같은 값으로 시작되게 합니다.
  renderPractice();
});
