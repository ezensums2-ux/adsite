$(function () {
  const defaultValues = {
    tagColor: '#2d6a4f',
    classColor: '#6d4fcf',
    idColor: '#d97706',
    parentColor: '#1d4ed8',
    childColor: '#7c3aed',
    inherit: true
  };

  const $tagColor = $('#tag-color');
  const $classColor = $('#class-color');
  const $idColor = $('#id-color');
  const $parentColor = $('#parent-color');
  const $childColor = $('#child-color');
  const $inheritColor = $('#inherit-color');
  const $previewContent = $('#preview-content');
  const $generatedCss = $('#generated-css');
  const $copyStatus = $('#css-copy-status');

  function getValues() {
    return {
      tagColor: $tagColor.val() || defaultValues.tagColor,
      classColor: $classColor.val() || defaultValues.classColor,
      idColor: $idColor.val() || defaultValues.idColor,
      parentColor: $parentColor.val() || defaultValues.parentColor,
      childColor: $childColor.val() || defaultValues.childColor,
      inherit: $inheritColor.is(':checked')
    };
  }

  function buildCssSnippet(values) {
    const childColorValue = values.inherit ? 'inherit' : values.childColor;

    return `/* 같은 속성 충돌 */
p {
  color: ${values.tagColor};
}

.feature {
  color: ${values.classColor};
}

#hero {
  color: ${values.idColor};
}

/* 상속 */
.parent-box {
  color: ${values.parentColor};
}

.child-box {
  color: ${childColorValue};
}`;
  }

  function buildPreviewMarkup(values) {
    const childColorValue = values.inherit ? 'inherit' : values.childColor;
    return `
      <div class="priority-preview">
        <p class="priority-label">선택자 우선순위</p>
        <p class="priority-text" style="color:${values.idColor};">태그 &lt; 클래스 &lt; 아이디</p>
      </div>
      <div class="inherit-preview">
        <div class="parent-box" style="color:${values.parentColor};">
          부모 텍스트
          <span class="child-box" style="color:${childColorValue};">자식 텍스트</span>
        </div>
      </div>
    `;
  }

  function renderPractice() {
    const values = getValues();
    const cssSnippet = buildCssSnippet(values);
    const previewMarkup = buildPreviewMarkup(values);

    $previewContent.html(previewMarkup);
    $generatedCss.val(cssSnippet);
  }

  $('#tag-color, #class-color, #id-color, #parent-color, #child-color, #inherit-color').on('input change', function () {
    renderPractice();
  });

  async function copyCssCode() {
    const text = $generatedCss.val();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $copyStatus.text('CSS 코드를 복사했습니다.');
    } catch (error) {
      $generatedCss.focus();
      $generatedCss[0].select();
      try {
        const copied = document.execCommand('copy');
        $copyStatus.text(copied ? 'CSS 코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      } catch (copyError) {
        $copyStatus.text('코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      }
    }
  }

  $('#copy-css-code').on('click', function () {
    copyCssCode();
  });

  function resetPractice() {
    $tagColor.val(defaultValues.tagColor);
    $classColor.val(defaultValues.classColor);
    $idColor.val(defaultValues.idColor);
    $parentColor.val(defaultValues.parentColor);
    $childColor.val(defaultValues.childColor);
    $inheritColor.prop('checked', defaultValues.inherit);
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  renderPractice();
});
