$(function () {
  // 실습의 기본값은 한 번만 정의하고,
  // 사용자가 입력을 바꾸면 미리보기와 코드가 같은 상태를 반영합니다.
  const defaultTextPractice = {
    headingLevel: 'h1',
    heading: 'HTML 공부 노트',
    firstSentence: 'HTML에서는 제목과 문단을 서로 다른 태그로 표현합니다.',
    secondSentence: '태그의 의미를 이해하면 더 읽기 좋은 문서를 만들 수 있습니다.',
    strongText: '중요한 내용',
    emText: '강조할 표현',
    useLineBreak: true
  };

  const $headingLevel = $('#heading-level');
  const $headingText = $('#heading-text');
  const $firstSentence = $('#first-sentence');
  const $secondSentence = $('#second-sentence');
  const $strongText = $('#strong-text');
  const $emText = $('#em-text');
  const $useLineBreak = $('#use-line-break');
  const $browserTitle = $('#preview-title');
  const $headingGuide = $('#heading-guide');
  const $previewContent = $('#preview-content');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');

  // HTML 코드 안에 들어가는 값은 보이기만 하는 문자열로 처리해,
  // 사용자가 태그를 넣어도 실행되지 않도록 안전하게 변환합니다.
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

  // 입력한 값들을 하나의 객체로 모아서
  // 실제 렌더링과 코드 생성이 같은 데이터를 사용하도록 합니다.
  function getPracticeValues() {
    return {
      headingLevel: $headingLevel.val() || defaultTextPractice.headingLevel,
      heading: $headingText.val(),
      firstSentence: $firstSentence.val(),
      secondSentence: $secondSentence.val(),
      strongText: $strongText.val(),
      emText: $emText.val(),
      useLineBreak: $useLineBreak.is(':checked')
    };
  }

  // 선택한 제목 단계에 맞는 안내 문구를 보여 줍니다.
  function updateHeadingGuide(level) {
    $headingGuide.html('현재 제목 태그: <strong>' + escapeHtml(level) + '</strong>');
  }

  // 사용자가 입력한 값으로 실제 브라우저처럼 보이는 구조를 만듭니다.
  function createPreview(values) {
    const headingTag = values.headingLevel;
    const $heading = $('<' + headingTag + '>', {
      text: values.heading || defaultTextPractice.heading
    });

    const $sentenceParagraph = $('<p>');
    const sentenceParts = [];

    if (values.firstSentence) {
      sentenceParts.push(escapeHtml(values.firstSentence));
    }

    if (values.useLineBreak && values.secondSentence) {
      sentenceParts.push('<br>');
    }

    if (values.secondSentence) {
      sentenceParts.push(escapeHtml(values.secondSentence));
    }

    $sentenceParagraph.html(sentenceParts.join(''));

    const $highlightParagraph = $('<p>');
    const extraParts = [];

    if (values.strongText) {
      extraParts.push('<strong>' + escapeHtml(values.strongText) + '</strong>');
    }

    if (values.emText) {
      extraParts.push('<em>' + escapeHtml(values.emText) + '</em>');
    }

    if (extraParts.length) {
      $highlightParagraph.html(extraParts.join(' '));
    }

    $previewContent.empty();
    $previewContent.append($heading, $sentenceParagraph);

    if (extraParts.length) {
      $previewContent.append($highlightParagraph);
    }
  }

  // 입력값을 HTML 문자열로 생성해 코드 카드에 표시합니다.
  function createHtmlCode(values) {
    const headingTag = values.headingLevel;
    const safeHeading = escapeHtml(values.heading || defaultTextPractice.heading);
    const safeFirstSentence = escapeHtml(values.firstSentence || '');
    const safeSecondSentence = escapeHtml(values.secondSentence || '');
    const safeStrong = escapeHtml(values.strongText || '');
    const safeEm = escapeHtml(values.emText || '');

    const paragraphContent = [safeFirstSentence, values.useLineBreak && safeSecondSentence ? '<br>' : '', safeSecondSentence]
      .filter(Boolean)
      .join('');

    const highlightTags = [];
    if (safeStrong) {
      highlightTags.push(`<strong>${safeStrong}</strong>`);
    }
    if (safeEm) {
      highlightTags.push(`<em>${safeEm}</em>`);
    }

    const highlightMarkup = highlightTags.length ? `<p>${highlightTags.join(' ')}</p>` : '';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${safeHeading}</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    h1, h2, h3, h4, h5, h6 {
      margin: 0 0 14px;
      color: #5034ad;
      line-height: 1.2;
    }
    p {
      margin: 0 0 12px;
      font-size: 1rem;
      line-height: 1.7;
      color: #4a4559;
    }
    strong {
      color: #402e8c;
    }
    em {
      color: #6a4ee1;
      font-style: italic;
    }
  </style>
</head>
<body>
  <${headingTag}>${safeHeading}</${headingTag}>
  <p>${paragraphContent}</p>
  ${highlightMarkup}
</body>
</html>`;
  }

  // 입력값이 바뀔 때마다 미리보기와 생성 코드를 같은 상태로 갱신합니다.
  function renderPractice() {
    const values = getPracticeValues();
    const headingLevel = values.headingLevel || defaultTextPractice.headingLevel;

    updateHeadingGuide(headingLevel);
    $browserTitle.text(values.heading || defaultTextPractice.heading);
    createPreview(values);

    const htmlCode = createHtmlCode(values);
    $generatedHtml.val(htmlCode);
  }

  // 사용자가 선택한 제목 단계와 입력값이 바뀌면 바로 결과를 갱신합니다.
  $('#heading-level, #heading-text, #first-sentence, #second-sentence, #strong-text, #em-text, #use-line-break').on('input change', function () {
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

  // 실습 초기화는 기본값으로만 되돌립니다.
  function resetPractice() {
    $headingLevel.val(defaultTextPractice.headingLevel);
    $headingText.val(defaultTextPractice.heading);
    $firstSentence.val(defaultTextPractice.firstSentence);
    $secondSentence.val(defaultTextPractice.secondSentence);
    $strongText.val(defaultTextPractice.strongText);
    $emText.val(defaultTextPractice.emText);
    $useLineBreak.prop('checked', defaultTextPractice.useLineBreak);
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  // 페이지 로드 시 기본 상태를 화면에 반영합니다.
  renderPractice();
});
