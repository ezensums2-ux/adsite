$(function () {
  const defaults = {
    type: 'solid',
    color: '#6546c8',
    endColor: '#f0abfc',
    angle: '135',
    size: 'cover',
    position: 'center',
    repeat: 'no-repeat',
    objectFit: 'cover'
  };

  const sampleImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#8b70e8"/><stop offset="1" stop-color="#f3c7ed"/></linearGradient><linearGradient id="hill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7658c9"/><stop offset="1" stop-color="#3d347d"/></linearGradient></defs><rect width="640" height="360" fill="url(#sky)"/><circle cx="470" cy="100" r="48" fill="#ffe7a3"/><path d="M0 245 110 155l92 86 105-118 116 124 82-70 135 91v92H0Z" fill="#a99ae9"/><path d="M0 282c94-66 179-24 269-62s158-17 224 13 96 28 147 12v115H0Z" fill="url(#hill)"/><path d="M0 320c118-43 190-15 284-38s195-13 356 25v53H0Z" fill="#352f68" opacity=".78"/></svg>')}`;
  const $type = $('#background-type');
  const $color = $('#background-color');
  const $endColor = $('#end-color');
  const $angle = $('#gradient-angle');
  const $size = $('#background-size');
  const $position = $('#background-position');
  const $repeat = $('#background-repeat');
  const $objectFit = $('#object-fit');
  const $endColorField = $('#end-color-field');
  const $angleField = $('#angle-field');
  const $backgroundDemo = $('#background-demo');
  const $sampleImage = $('#sample-image');
  const $imageFitLabel = $('#image-fit-label');
  const $propertyNote = $('#property-note');
  const $output = $('#generated-code');
  const $copyStatus = $('#copy-status');

  function clampNumber(input, fallback, minimum, maximum) {
    const value = Number(input);
    return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : Number(fallback);
  }

  function getValues() {
    const typeOptions = ['solid', 'linear', 'radial', 'image'];
    const sizeOptions = ['cover', 'contain', 'auto'];
    const positionOptions = ['center', 'top', 'bottom', 'left', 'right'];
    const repeatOptions = ['no-repeat', 'repeat'];
    const fitOptions = ['cover', 'contain', 'fill'];

    return {
      type: typeOptions.includes($type.val()) ? $type.val() : defaults.type,
      color: $color.val() || defaults.color,
      endColor: $endColor.val() || defaults.endColor,
      angle: clampNumber($angle.val(), defaults.angle, 0, 360),
      size: sizeOptions.includes($size.val()) ? $size.val() : defaults.size,
      position: positionOptions.includes($position.val()) ? $position.val() : defaults.position,
      repeat: repeatOptions.includes($repeat.val()) ? $repeat.val() : defaults.repeat,
      objectFit: fitOptions.includes($objectFit.val()) ? $objectFit.val() : defaults.objectFit
    };
  }

  function getBackgroundImage(values) {
    if (values.type === 'linear') return `linear-gradient(${values.angle}deg, ${values.color}, ${values.endColor})`;
    if (values.type === 'radial') return `radial-gradient(circle, ${values.color}, ${values.endColor})`;
    if (values.type === 'image') return `url("${sampleImage}")`;
    return 'none';
  }

  function createDocument(values) {
    const backgroundImage = getBackgroundImage(values);
    const usesImage = values.type === 'image';
    const backgroundColor = usesImage ? '#dcd5f2' : values.color;
    const safeSampleImage = sampleImage;

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>CSS 배경과 이미지 예시</title>
  <style>
    body {
      margin: 0;
      padding: 18px;
      font-family: sans-serif;
      color: #252431;
      background: #f7f4ff;
    }
    .demo-card {
      min-height: 160px;
      display: grid;
      align-content: end;
      padding: 18px;
      border: 1px solid #ddd7ea;
      border-radius: 12px;
      background-color: ${backgroundColor};
      background-image: ${backgroundImage};
      background-size: ${values.size};
      background-position: ${values.position};
      background-repeat: ${values.repeat};
      color: ${usesImage ? '#fff' : '#252431'};
    }
    .demo-card p {
      display: inline-block;
      width: fit-content;
      margin: 0;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgb(255 255 255 / 88%);
      color: #252431;
      font-size: 13px;
      font-weight: 700;
    }
    .image-example {
      margin-top: 18px;
    }
    .image-example h2 {
      margin: 0 0 8px;
      font-size: 13px;
    }
    .image-example img {
      display: block;
      width: 100%;
      height: 150px;
      border: 1px solid #ddd7ea;
      border-radius: 10px;
      object-fit: ${values.objectFit};
      object-position: ${values.position};
      background: #ece8f7;
    }
    .property-note {
      margin: 12px 0 0;
      color: #625e70;
      font-size: 11px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
  </style>
</head>
<body>
  <div class="demo-card">
    <p>CSS 배경 이미지</p>
  </div>
  <section class="image-example">
    <h2>콘텐츠 이미지 · object-fit: ${values.objectFit}</h2>
    <img src="${safeSampleImage}" alt="보라색 하늘과 언덕이 있는 실습용 풍경">
  </section>
  <p class="property-note">background-size: ${values.size} · background-position: ${values.position} · background-repeat: ${values.repeat}</p>
</body>
</html>`;
  }

  function render() {
    const values = getValues();
    const showGradientControls = values.type === 'linear' || values.type === 'radial';
    const usesImage = values.type === 'image';
    const backgroundColor = usesImage ? '#dcd5f2' : values.color;

    $endColorField.prop('hidden', !showGradientControls);
    $angleField.prop('hidden', values.type !== 'linear');
    $backgroundDemo.css({
      backgroundColor: backgroundColor,
      backgroundImage: getBackgroundImage(values),
      backgroundSize: values.size,
      backgroundPosition: values.position,
      backgroundRepeat: values.repeat,
      color: usesImage ? '#fff' : '#252431'
    });
    $sampleImage
      .attr('src', sampleImage)
      .css({
        objectFit: values.objectFit,
        objectPosition: values.position
      });
    $imageFitLabel.text(`콘텐츠 이미지 · object-fit: ${values.objectFit}`);
    $propertyNote.text(`background-size: ${values.size} · background-position: ${values.position} · background-repeat: ${values.repeat}`);
    $output.val(createDocument(values));
  }

  $('#background-type, #background-color, #end-color, #gradient-angle, #background-size, #background-position, #background-repeat, #object-fit').on('input change', render);

  async function copyCode() {
    const text = $output.val();
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $copyStatus.text('코드를 복사했습니다.');
    } catch (error) {
      $output.focus();
      $output[0].select();
      try {
        const copied = document.execCommand('copy');
        $copyStatus.text(copied ? '코드를 복사했습니다.' : '코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      } catch (copyError) {
        $copyStatus.text('코드가 선택됐어요. Ctrl+C로 복사해 주세요.');
      }
    }
  }

  $('#copy-code').on('click', copyCode);

  $('#reset-practice').on('click', function () {
    $type.val(defaults.type);
    $color.val(defaults.color);
    $endColor.val(defaults.endColor);
    $angle.val(defaults.angle);
    $size.val(defaults.size);
    $position.val(defaults.position);
    $repeat.val(defaults.repeat);
    $objectFit.val(defaults.objectFit);
    $copyStatus.text('');
    render();
  });

  render();
});
