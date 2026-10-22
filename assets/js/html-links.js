$(function () {
  // 실습의 기본값은 한 번만 정의하고,
  // 사용자가 입력을 바꾸면 미리보기와 코드가 같은 상태를 반영합니다.
  const defaultLinksPractice = {
    linkText: '스타일 노트 보러가기',
    linkHref: 'https://example.com',
    imageAlt: '스타일 노트 포스터',
    imageSrc: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
  };

  const $linkText = $('#link-text');
  const $linkHref = $('#link-href');
  const $imageAlt = $('#image-alt');
  const $imageSrc = $('#image-src');
  const $previewContent = $('#preview-content');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');

  // 사용자 입력값은 HTML 코드 안에 그대로 삽입되지 않도록
  // 화면에 보이는 텍스트처럼 안전하게 변환합니다.
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

  // 현재 실습 상태를 객체로 모아
  // 미리보기와 코드 생성이 같은 데이터를 사용하도록 합니다.
  function getPracticeValues() {
    return {
      linkText: $linkText.val(),
      linkHref: $linkHref.val(),
      imageAlt: $imageAlt.val(),
      imageSrc: $imageSrc.val()
    };
  }

  // 실제 브라우저처럼 링크와 이미지를 화면에 보여 줍니다.
  function createPreview(values) {
    const safeLinkText = escapeHtml(values.linkText || defaultLinksPractice.linkText);
    const safeLinkHref = escapeHtml(values.linkHref || defaultLinksPractice.linkHref);
    const safeImageAlt = escapeHtml(values.imageAlt || defaultLinksPractice.imageAlt);
    const safeImageSrc = escapeHtml(values.imageSrc || defaultLinksPractice.imageSrc);

    $previewContent.empty();

    const $link = $('<a>', {
      href: safeLinkHref,
      class: 'preview-link',
      text: safeLinkText
    });

    const $imageWrapper = $('<div>', { class: 'preview-image-wrapper' });
    const $image = $('<img>', {
      src: safeImageSrc,
      alt: safeImageAlt,
      class: 'preview-image'
    });

    const $caption = $('<p>', {
      class: 'preview-caption',
      text: '이미지 대체 텍스트: ' + (values.imageAlt || defaultLinksPractice.imageAlt)
    });

    $imageWrapper.append($image);
    $previewContent.append($link, $imageWrapper, $caption);
  }

  // 입력값을 HTML 문자열로 조합해 코드 영역에 표시합니다.
  function createHtmlCode(values) {
    const safeLinkText = escapeHtml(values.linkText || defaultLinksPractice.linkText);
    const safeLinkHref = escapeHtml(values.linkHref || defaultLinksPractice.linkHref);
    const safeImageAlt = escapeHtml(values.imageAlt || defaultLinksPractice.imageAlt);
    const safeImageSrc = escapeHtml(values.imageSrc || defaultLinksPractice.imageSrc);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>링크와 이미지 예시</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    a {
      display: inline-block;
      margin-bottom: 18px;
      color: #5034ad;
      font-weight: 700;
      text-decoration: none;
    }
    img {
      display: block;
      width: 100%;
      max-width: 480px;
      border-radius: 12px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <a href="${safeLinkHref}">${safeLinkText}</a>
  <img src="${safeImageSrc}" alt="${safeImageAlt}">
</body>
</html>`;
  }

  // 입력값이 바뀔 때마다 미리보기와 코드 확인을 같은 상태로 갱신합니다.
  function renderPractice() {
    const values = getPracticeValues();
    createPreview(values);

    const htmlCode = createHtmlCode(values);
    $generatedHtml.val(htmlCode);
  }

  // 사용자 입력이 바뀌면 바로 렌더링합니다.
  $('#link-text, #link-href, #image-alt, #image-src').on('input', function () {
    renderPractice();
  });

  // 코드 복사 버튼은 사용자가 쉽게 붙여넣을 수 있도록 안내 메시지를 보여 줍니다.
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

  // 실습 초기화는 기본값으로 되돌립니다.
  function resetPractice() {
    $linkText.val(defaultLinksPractice.linkText);
    $linkHref.val(defaultLinksPractice.linkHref);
    $imageAlt.val(defaultLinksPractice.imageAlt);
    $imageSrc.val(defaultLinksPractice.imageSrc);
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  // 페이지 로드 시 기본 상태를 적용합니다.
  renderPractice();
});
