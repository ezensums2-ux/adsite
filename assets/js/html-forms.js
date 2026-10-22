$(function () {
  const defaultPractice = {
    userName: '홍길동',
    userEmail: 'hong@example.com',
    interest: 'HTML',
    message: '오늘은 폼과 버튼을 연습하고 있습니다.',
    agree: true,
    submitText: '제출하기'
  };

  const $userName = $('#user-name');
  const $userEmail = $('#user-email');
  const $interest = $('#interest');
  const $message = $('#message');
  const $agree = $('#agree');
  const $previewContent = $('#preview-content');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');
  const $submitButton = $('#submit-button');

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
      userName: $userName.val(),
      userEmail: $userEmail.val(),
      interest: $interest.val(),
      message: $message.val(),
      agree: $agree.is(':checked'),
      submitText: $submitButton.text()
    };
  }

  function createPreview(values) {
    const $form = $('<div>', { class: 'preview-form' });

    const rows = [
      ['이름', values.userName || defaultPractice.userName],
      ['이메일', values.userEmail || defaultPractice.userEmail],
      ['관심 분야', values.interest || defaultPractice.interest],
      ['메모', values.message || defaultPractice.message]
    ];

    rows.forEach(function (row) {
      const $row = $('<div>', { class: 'preview-form-row' });
      const $label = $('<label>', { text: row[0] });
      const $value = $('<p>', { text: row[1] });
      $row.append($label, $value);
      $form.append($row);
    });

    const $status = $('<div>', { class: 'preview-form-row' });
    $status.append($('<strong>', { text: values.agree ? '동의 완료' : '동의 필요' }));
    $form.append($status);

    const $button = $('<button>', {
      class: 'preview-button',
      type: 'button',
      text: values.submitText || defaultPractice.submitText
    });

    $form.append($button);
    $previewContent.empty().append($form);
  }

  function createHtmlCode(values) {
    const safeName = escapeHtml(values.userName || defaultPractice.userName);
    const safeEmail = escapeHtml(values.userEmail || defaultPractice.userEmail);
    const safeInterest = escapeHtml(values.interest || defaultPractice.interest);
    const safeMessage = escapeHtml(values.message || defaultPractice.message);
    const submitText = escapeHtml(values.submitText || defaultPractice.submitText);
    const agreeText = values.agree ? '동의함' : '동의하지 않음';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>폼 예시</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    form {
      display: grid;
      gap: 12px;
      max-width: 420px;
      padding: 18px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e9e6ef;
    }
    label {
      color: #5034ad;
      font-size: 12px;
      font-weight: 700;
    }
    input, textarea, select, button {
      font: inherit;
    }
    input, textarea, select {
      width: 100%;
      padding: 12px 10px;
      border: 1px solid #ddd7ea;
      border-radius: 8px;
    }
    button {
      padding: 10px 14px;
      border: 0;
      border-radius: 9px;
      background: #6546c8;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <form>
    <label>이름</label>
    <input type="text" value="${safeName}">

    <label>이메일</label>
    <input type="email" value="${safeEmail}">

    <label>관심 분야</label>
    <select>
      <option>${safeInterest}</option>
    </select>

    <label>메모</label>
    <textarea>${safeMessage}</textarea>

    <label><input type="checkbox" checked> ${agreeText}</label>
    <button type="button">${submitText}</button>
  </form>
</body>
</html>`;
  }

  function renderPractice() {
    const values = getPracticeValues();
    createPreview(values);
    const htmlCode = createHtmlCode(values);
    $generatedHtml.val(htmlCode);
  }

  $('#user-name, #user-email, #interest, #message, #agree').on('input change', function () {
    renderPractice();
  });

  $submitButton.on('click', function () {
    const nextText = $submitButton.text() === '제출하기' ? '신청하기' : '제출하기';
    $submitButton.text(nextText);
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
    $userName.val(defaultPractice.userName);
    $userEmail.val(defaultPractice.userEmail);
    $interest.val(defaultPractice.interest);
    $message.val(defaultPractice.message);
    $agree.prop('checked', defaultPractice.agree);
    $submitButton.text(defaultPractice.submitText);
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  renderPractice();
});
