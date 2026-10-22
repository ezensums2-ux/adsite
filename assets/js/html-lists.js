$(function () {
  // 실습 기본값은 한 번만 정해 두고,
  // 사용자가 입력을 바꾸면 미리보기와 코드가 같은 상태를 반영합니다.
  const defaultListsPractice = {
    listType: 'ul',
    listItems: ['HTML', 'CSS', 'JavaScript'],
    tableCaption: '학습 계획표',
    tableColumns: ['과목', '설명'],
    tableRows: [
      ['HTML', '구조를 설계합니다.'],
      ['CSS', '모습을 꾸미며 스타일을 적용합니다.'],
      ['JavaScript', '상호작용을 넣습니다.']
    ]
  };

  const $listType = $('#list-type');
  const $listItems = $('#list-items');
  const $tableCaption = $('#table-caption');
  const $tableColumns = $('#table-cols');
  const $tableRows = $('#table-rows');
  const $previewContent = $('#preview-content');
  const $generatedHtml = $('#generated-html');
  const $copyStatus = $('#html-copy-status');

  // 사용자 입력은 HTML 코드 안에서 실행되지 않도록 안전하게 처리합니다.
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

  // 입력값을 배열로 정리해 실제 렌더링과 코드 생성에 같은 데이터를 사용합니다.
  function getPracticeValues() {
    const listValues = ($listItems.val() || '')
      .split(/\n+/)
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);

    const columns = ($tableColumns.val() || '')
      .split(',')
      .map(function (cell) {
        return cell.trim();
      })
      .filter(Boolean);

    const rows = ($tableRows.val() || '')
      .split(/\n+/)
      .map(function (line) {
        return line.split(',').map(function (cell) {
          return cell.trim();
        }).filter(Boolean);
      })
      .filter(function (row) {
        return row.length;
      });

    return {
      listType: $listType.val() || defaultListsPractice.listType,
      listItems: listValues.length ? listValues : defaultListsPractice.listItems,
      tableCaption: $tableCaption.val() || defaultListsPractice.tableCaption,
      tableColumns: columns.length ? columns : defaultListsPractice.tableColumns,
      tableRows: rows.length ? rows : defaultListsPractice.tableRows
    };
  }

  // 사용자가 선택한 값으로 목록과 표를 실제 브라우저처럼 렌더링합니다.
  function createPreview(values) {
    const $listTag = $(values.listType === 'ol' ? '<ol>' : '<ul>', {
      class: 'preview-list'
    });

    values.listItems.forEach(function (item) {
      const $listItem = $('<li>', { text: item });
      $listTag.append($listItem);
    });

    const $table = $('<table>', { class: 'preview-table' });
    const $caption = $('<p>', {
      class: 'preview-caption',
      text: values.tableCaption || defaultListsPractice.tableCaption
    });

    const $headerRow = $('<tr>');
    values.tableColumns.forEach(function (header) {
      $headerRow.append($('<th>', { text: header }));
    });
    $table.append($headerRow);

    values.tableRows.forEach(function (row) {
      const $row = $('<tr>');
      row.forEach(function (cell) {
        $row.append($('<td>', { text: cell }));
      });
      $table.append($row);
    });

    $previewContent.empty();
    $previewContent.append($listTag, $caption, $table);
  }

  // 적용된 값을 HTML 문자열로 만들어 코드 카드에 표시합니다.
  function createHtmlCode(values) {
    const listTag = values.listType === 'ol' ? 'ol' : 'ul';
    const listMarkup = values.listItems.map(function (item) {
      return `  <li>${escapeHtml(item)}</li>`;
    }).join('\n');

    const headerMarkup = values.tableColumns.map(function (header) {
      return `    <th>${escapeHtml(header)}</th>`;
    }).join('\n');

    const tableRowsMarkup = values.tableRows.map(function (row) {
      const cellsMarkup = row.map(function (cell) {
        return `      <td>${escapeHtml(cell)}</td>`;
      }).join('\n');
      return `  <tr>\n${cellsMarkup}\n  </tr>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>목록과 표 예시</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: sans-serif;
      background: #f7f4ff;
      color: #252431;
    }
    ul, ol {
      margin: 0 0 20px;
      padding-left: 1.2rem;
      line-height: 1.8;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      max-width: 480px;
      background: #fff;
    }
    th, td {
      border: 1px solid #e9e6ef;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #f0ecfb;
      color: #5034ad;
    }
  </style>
</head>
<body>
  <${listTag}>
${listMarkup}
  </${listTag}>

  <p>${escapeHtml(values.tableCaption || defaultListsPractice.tableCaption)}</p>
  <table>
    <tr>
${headerMarkup}
    </tr>
${tableRowsMarkup}
  </table>
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

  // 입력값 변경 시 실시간 업데이트
  $('#list-type, #list-items, #table-caption, #table-cols, #table-rows').on('input change', function () {
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

  // 실습 초기화는 기본값으로 되돌립니다.
  function resetPractice() {
    $listType.val(defaultListsPractice.listType);
    $listItems.val(defaultListsPractice.listItems.join('\n'));
    $tableCaption.val(defaultListsPractice.tableCaption);
    $tableColumns.val(defaultListsPractice.tableColumns.join(','));
    $tableRows.val(defaultListsPractice.tableRows.map(function (row) {
      return row.join(',');
    }).join('\n'));
    $copyStatus.text('');
    renderPractice();
  }

  $('#reset-practice').on('click', function () {
    resetPractice();
  });

  // 페이지 로드 시 기본 상태를 적용합니다.
  renderPractice();
});
