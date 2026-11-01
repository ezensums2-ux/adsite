/**
 * 3D 길 건너기 게임 (Crossy Road Clone)
 * 원작: Hunor Marton Borbely (Crossy Road with three.js)
 * 기술 스택: Three.js, Orthographic Camera, Low-poly Voxel, Web Audio API
 */

(function () {
  'use strict';

  // Three.js 가 로드될 때까지 대기
  function checkThree(callback) {
    if (window.THREE) {
      callback();
    } else {
      setTimeout(() => checkThree(callback), 50);
    }
  }

  checkThree(initCrossyGame);

  function initCrossyGame() {
    const container = document.getElementById('crossy-canvas-container');
    if (!container) return;

    // ==========================================
    // 1. 게임 전역 상수 & 상태
    // ==========================================
    const zoom = 2;
    const positionWidth = 42; // 각 그리드 타일의 크기
    const columns = 17; // 타일 열의 총 개수 (-8 ~ +8)
    const minCol = -8;
    const maxCol = 8;
    const boardWidth = positionWidth * columns; // 714
    const stepTime = 160; // 점프 애니메이션 시간(ms)
    const jumpHeight = 24; // 점프 높이 (z축)

    // 차량 색상 팔레트
    const vehicleColors = [
      0xd93a3a, // 레드
      0x2563eb, // 블루
      0xf59e0b, // 옐로/오렌지
      0x10b981, // 에메랄드
      0x8b5cf6, // 퍼플
      0xec4899, // 핑크
      0x06b6d4  // 시안
    ];

    // 오디오 컨텍스트 (Web Audio API)
    let audioCtx = null;
    let soundEnabled = true;

    function initAudio() {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playTone(freq, type, duration, gainStart = 0.15) {
      if (!soundEnabled || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainStart, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {
        // 무시
      }
    }

    function soundJump() {
      if (!soundEnabled || !audioCtx) return;
      playTone(420, 'sine', 0.12, 0.15);
    }

    function soundCrash() {
      if (!soundEnabled || !audioCtx) return;
      playTone(110, 'sawtooth', 0.35, 0.25);
    }

    function soundRecord() {
      if (!soundEnabled || !audioCtx) return;
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => playTone(f, 'triangle', 0.18, 0.18), i * 90);
      });
    }

    // ==========================================
    // 2. Three.js Scene, Camera, Renderer, Light
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdcebf5);
    scene.fog = new THREE.Fog(0xdcebf5, 600, 1600);

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 460;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -600,
      1600
    );

    // 아이소메트릭 쿼터뷰 앵글 (Hunor Marton 원작 뷰포트)
    const baseCameraOffset = new THREE.Vector3(-140, -320, 310);
    camera.position.copy(baseCameraOffset);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 조명
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(-160, -260, 420);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 400;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 1000;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // ==========================================
    // 3. 3D 모델링 팩토리 (Voxel Art)
    // ==========================================

    // 공용 재질 (메모리 최적화)
    const matWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const matRed = new THREE.MeshLambertMaterial({ color: 0xd92626 });
    const matBeak = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const matBlack = new THREE.MeshLambertMaterial({ color: 0x1e1e24 });
    const matDarkWheel = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const matCabin = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const matTrunk = new THREE.MeshLambertMaterial({ color: 0x4d2926 });
    const matTreeLeaves1 = new THREE.MeshLambertMaterial({ color: 0x4f8e32 });
    const matTreeLeaves2 = new THREE.MeshLambertMaterial({ color: 0x3d7824 });
    const matGrass = new THREE.MeshLambertMaterial({ color: 0x86c232 });
    const matRoad = new THREE.MeshLambertMaterial({ color: 0x393c43 });
    const matStripe = new THREE.MeshLambertMaterial({ color: 0xadb5bd });

    const sharedMaterials = new Set([
      matWhite, matRed, matBeak, matBlack, matDarkWheel,
      matCabin, matTrunk, matTreeLeaves1, matTreeLeaves2,
      matGrass, matRoad, matStripe
    ]);

    // 닭(플레이어) 모델
    function createChickenModel() {
      const chicken = new THREE.Group();

      // 몸통
      const bodyGeo = new THREE.BoxGeometry(15 * zoom, 15 * zoom, 20 * zoom);
      const body = new THREE.Mesh(bodyGeo, matWhite);
      body.position.z = 10 * zoom;
      body.castShadow = true;
      body.receiveShadow = true;
      chicken.add(body);

      // 머리 위 볏 (Comb)
      const combGeo = new THREE.BoxGeometry(4 * zoom, 8 * zoom, 5 * zoom);
      const comb = new THREE.Mesh(combGeo, matRed);
      comb.position.set(0, 1 * zoom, 22.5 * zoom);
      comb.castShadow = true;
      chicken.add(comb);

      // 턱 볏 (Wattle)
      const wattleGeo = new THREE.BoxGeometry(3 * zoom, 3 * zoom, 4 * zoom);
      const wattle = new THREE.Mesh(wattleGeo, matRed);
      wattle.position.set(0, 8.5 * zoom, 11 * zoom);
      wattle.castShadow = true;
      chicken.add(wattle);

      // 부리 (Beak)
      const beakGeo = new THREE.BoxGeometry(4 * zoom, 5 * zoom, 4 * zoom);
      const beak = new THREE.Mesh(beakGeo, matBeak);
      beak.position.set(0, 9 * zoom, 15 * zoom);
      beak.castShadow = true;
      chicken.add(beak);

      // 눈 (Eyes)
      const eyeGeo = new THREE.BoxGeometry(1.5 * zoom, 2 * zoom, 2 * zoom);
      const leftEye = new THREE.Mesh(eyeGeo, matBlack);
      leftEye.position.set(-8 * zoom, 3.5 * zoom, 16 * zoom);
      chicken.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo, matBlack);
      rightEye.position.set(8 * zoom, 3.5 * zoom, 16 * zoom);
      chicken.add(rightEye);

      // 날개 (Wings)
      const wingGeo = new THREE.BoxGeometry(2 * zoom, 9 * zoom, 8 * zoom);
      const leftWing = new THREE.Mesh(wingGeo, matWhite);
      leftWing.position.set(-8.5 * zoom, -1 * zoom, 10 * zoom);
      leftWing.castShadow = true;
      chicken.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, matWhite);
      rightWing.position.set(8.5 * zoom, -1 * zoom, 10 * zoom);
      rightWing.castShadow = true;
      chicken.add(rightWing);

      // 다리 (Legs)
      const legGeo = new THREE.BoxGeometry(2 * zoom, 2 * zoom, 5 * zoom);
      const leftLeg = new THREE.Mesh(legGeo, matBeak);
      leftLeg.position.set(-4 * zoom, 0, 2.5 * zoom);
      leftLeg.castShadow = true;
      chicken.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, matBeak);
      rightLeg.position.set(4 * zoom, 0, 2.5 * zoom);
      rightLeg.castShadow = true;
      chicken.add(rightLeg);

      return chicken;
    }

    // 나무 모델
    function createTreeModel() {
      const tree = new THREE.Group();

      // 줄기
      const trunkGeo = new THREE.BoxGeometry(12 * zoom, 12 * zoom, 16 * zoom);
      const trunk = new THREE.Mesh(trunkGeo, matTrunk);
      trunk.position.z = 8 * zoom;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // 잎 (크기 랜덤성 부여)
      const leafHeight = (30 + Math.random() * 20) * zoom;
      const leafGeo = new THREE.BoxGeometry(26 * zoom, 26 * zoom, leafHeight);
      const leafMat = Math.random() > 0.5 ? matTreeLeaves1 : matTreeLeaves2;
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.z = 16 * zoom + leafHeight / 2;
      leaves.castShadow = true;
      leaves.receiveShadow = true;
      tree.add(leaves);

      return tree;
    }

    // 자동차 모델
    function createCarModel(colorHex, direction) {
      const car = new THREE.Group();
      const carMat = new THREE.MeshLambertMaterial({ color: colorHex });

      // 차체 본체
      const bodyLength = 52 * zoom;
      const bodyWidth = 24 * zoom;
      const bodyHeight = 12 * zoom;
      const body = new THREE.Mesh(new THREE.BoxGeometry(bodyLength, bodyWidth, bodyHeight), carMat);
      body.position.z = 10 * zoom;
      body.castShadow = true;
      body.receiveShadow = true;
      car.add(body);

      // 지붕/캐빈
      const cabinLength = 28 * zoom;
      const cabinWidth = 20 * zoom;
      const cabinHeight = 11 * zoom;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinLength, cabinWidth, cabinHeight), matCabin);
      cabin.position.set(-2 * zoom * direction, 0, 21.5 * zoom);
      cabin.castShadow = true;
      cabin.receiveShadow = true;
      car.add(cabin);

      // 바퀴 4개
      const wheelGeo = new THREE.BoxGeometry(8 * zoom, 3 * zoom, 8 * zoom);
      const xOffsets = [-16 * zoom, 16 * zoom];
      const yOffsets = [-12.5 * zoom, 12.5 * zoom];

      xOffsets.forEach(x => {
        yOffsets.forEach(y => {
          const wheel = new THREE.Mesh(wheelGeo, matDarkWheel);
          wheel.position.set(x, y, 4 * zoom);
          wheel.castShadow = true;
          car.add(wheel);
        });
      });

      // 헤드라이트 (앞쪽)
      const lightGeo = new THREE.BoxGeometry(2 * zoom, 4 * zoom, 4 * zoom);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xfff176 });
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

      const frontX = direction > 0 ? (bodyLength / 2 + 1) : -(bodyLength / 2 + 1);
      const backX = -frontX;

      [-6 * zoom, 6 * zoom].forEach(y => {
        const head = new THREE.Mesh(lightGeo, headMat);
        head.position.set(frontX, y, 10 * zoom);
        car.add(head);

        const tail = new THREE.Mesh(lightGeo, tailMat);
        tail.position.set(backX, y, 10 * zoom);
        car.add(tail);
      });

      return car;
    }

    // 트럭 모델
    function createTruckModel(colorHex, direction) {
      const truck = new THREE.Group();
      const cabMat = new THREE.MeshLambertMaterial({ color: colorHex });

      // 운전석 캐빈
      const cabLength = 26 * zoom;
      const cabWidth = 24 * zoom;
      const cabHeight = 22 * zoom;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(cabLength, cabWidth, cabHeight), cabMat);
      const cabX = direction > 0 ? 28 * zoom : -28 * zoom;
      cab.position.set(cabX, 0, 15 * zoom);
      cab.castShadow = true;
      cab.receiveShadow = true;
      truck.add(cab);

      // 화물 컨테이너
      const cargoLength = 62 * zoom;
      const cargoWidth = 26 * zoom;
      const cargoHeight = 26 * zoom;
      const cargo = new THREE.Mesh(new THREE.BoxGeometry(cargoLength, cargoWidth, cargoHeight), matCabin);
      const cargoX = direction > 0 ? -16 * zoom : 16 * zoom;
      cargo.position.set(cargoX, 0, 17 * zoom);
      cargo.castShadow = true;
      cargo.receiveShadow = true;
      truck.add(cargo);

      // 바퀴 6개
      const wheelGeo = new THREE.BoxGeometry(8 * zoom, 3 * zoom, 8 * zoom);
      const xOffsets = direction > 0 ? [-34 * zoom, -6 * zoom, 28 * zoom] : [34 * zoom, 6 * zoom, -28 * zoom];
      const yOffsets = [-13 * zoom, 13 * zoom];

      xOffsets.forEach(x => {
        yOffsets.forEach(y => {
          const wheel = new THREE.Mesh(wheelGeo, matDarkWheel);
          wheel.position.set(x, y, 4 * zoom);
          wheel.castShadow = true;
          truck.add(wheel);
        });
      });

      return truck;
    }

    // ==========================================
    // 4. 레인(Lane) 클래스 및 맵 제너레이터
    // ==========================================
    const laneWidth = boardWidth + 300 * zoom;

    class Lane {
      constructor(index) {
        this.index = index;
        this.mesh = new THREE.Group();
        this.mesh.position.y = index * positionWidth * zoom;
        this.trees = new Set();
        this.vehicles = [];

        // 레인 종류 결정
        if (index <= 3) {
          this.type = 'forest'; // 시작 4개 레인은 나무 없는 안전한 잔디밭
        } else {
          const rand = Math.random();
          if (rand < 0.35) {
            this.type = 'forest';
          } else if (rand < 0.72) {
            this.type = 'car';
          } else {
            this.type = 'truck';
          }
        }

        this.init();
      }

      init() {
        // 지면 생성
        const isRoad = this.type === 'car' || this.type === 'truck';
        const groundMat = isRoad ? matRoad : matGrass;
        const groundGeo = new THREE.BoxGeometry(laneWidth, positionWidth * zoom, 3 * zoom);
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.z = -1.5 * zoom;
        ground.receiveShadow = true;
        this.mesh.add(ground);

        // 차도일 경우 차선 점선 표시
        if (isRoad) {
          const stripeCount = 13;
          const stripeGeo = new THREE.BoxGeometry(16 * zoom, 3 * zoom, 0.4 * zoom);
          for (let i = 0; i < stripeCount; i++) {
            const stripe = new THREE.Mesh(stripeGeo, matStripe);
            stripe.position.x = (i - (stripeCount - 1) / 2) * 55 * zoom;
            stripe.position.y = (positionWidth * zoom) / 2;
            stripe.position.z = 0.2 * zoom;
            this.mesh.add(stripe);
          }
        }

        // 장애물 / 차량 배치
        if (this.type === 'forest') {
          // 안전 레인이 아닌 경우 나무 무작위 배치
          if (this.index > 3) {
            const numTrees = Math.floor(Math.random() * 4) + 1;
            const availableCols = [];
            for (let c = minCol; c <= maxCol; c++) availableCols.push(c);

            // 항상 최소 2칸 이상의 통로는 보장되도록 랜덤 선택
            for (let i = 0; i < numTrees; i++) {
              if (availableCols.length <= 3) break;
              const idx = Math.floor(Math.random() * availableCols.length);
              const col = availableCols.splice(idx, 1)[0];
              this.trees.add(col);

              const tree = createTreeModel();
              tree.position.x = col * positionWidth * zoom;
              this.mesh.add(tree);
            }
          }
        } else if (this.type === 'car') {
          this.direction = Math.random() > 0.5 ? 1 : -1;
          this.speed = (1.8 + Math.random() * 1.6 + Math.min(this.index * 0.03, 1.8)) * zoom;
          const carCount = Math.random() > 0.4 ? 2 : 1;
          const carSpacing = (boardWidth / carCount);

          for (let i = 0; i < carCount; i++) {
            const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];
            const car = createCarModel(color, this.direction);
            const initialX = (i * carSpacing - boardWidth / 2) + (Math.random() * 60 - 30);
            car.position.x = initialX;
            this.mesh.add(car);
            this.vehicles.push({
              mesh: car,
              x: initialX,
              halfWidth: 26 * zoom,
              halfDepth: 12 * zoom
            });
          }
        } else if (this.type === 'truck') {
          this.direction = Math.random() > 0.5 ? 1 : -1;
          this.speed = (1.4 + Math.random() * 1.2 + Math.min(this.index * 0.02, 1.4)) * zoom;
          const truckCount = Math.random() > 0.65 ? 2 : 1;
          const truckSpacing = (boardWidth / truckCount);

          for (let i = 0; i < truckCount; i++) {
            const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];
            const truck = createTruckModel(color, this.direction);
            const initialX = (i * truckSpacing - boardWidth / 2) + (Math.random() * 60 - 30);
            truck.position.x = initialX;
            this.mesh.add(truck);
            this.vehicles.push({
              mesh: truck,
              x: initialX,
              halfWidth: 46 * zoom,
              halfDepth: 13 * zoom
            });
          }
        }

        scene.add(this.mesh);
      }

      update(delta) {
        if (this.vehicles.length === 0) return;
        const limit = boardWidth / 2 + 150 * zoom;

        for (let i = 0; i < this.vehicles.length; i++) {
          const v = this.vehicles[i];
          v.x += this.speed * this.direction * delta * 60;

          if (this.direction > 0 && v.x > limit) {
            v.x = -limit;
          } else if (this.direction < 0 && v.x < -limit) {
            v.x = limit;
          }
          v.mesh.position.x = v.x;
        }
      }

      dispose() {
        this.mesh.traverse(child => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material && !sharedMaterials.has(child.material)) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        scene.remove(this.mesh);
      }
    }

    // ==========================================
    // 5. 플레이어 & 게임 루프 상태
    // ==========================================
    let chicken;
    let lanes = [];
    let currentLane = 0;
    let currentCol = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('crossy_road_best') || '0', 10);
    let isGameOver = false;
    let isMoving = false;
    let moveStartTime = 0;
    let startPos = new THREE.Vector3();
    let targetPos = new THREE.Vector3();
    let moveQueue = [];
    let isSquished = false;

    // UI 엘리먼트 캐싱
    const scoreEl = document.getElementById('crossy-score');
    const highScoreEl = document.getElementById('crossy-high-score');
    const overlayEl = document.getElementById('game-over-overlay');
    const finalScoreEl = document.getElementById('modal-final-score');
    const modalBestScoreEl = document.getElementById('modal-best-score');
    const recordBadgeEl = document.getElementById('modal-record-badge');
    const retryBtn = document.getElementById('btn-retry');
    const soundBtn = document.getElementById('btn-sound-toggle');
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    const resetBtn = document.getElementById('btn-quick-reset');

    // 하이 스코어 초기 표시
    if (highScoreEl) highScoreEl.textContent = highScore;

    function resetGame() {
      // 기존 레인 제거
      lanes.forEach(l => l.dispose());
      lanes = [];

      // 치킨 제거
      if (chicken) scene.remove(chicken);

      // 치킨 재생성
      chicken = createChickenModel();
      chicken.position.set(0, 0, 0);
      chicken.rotation.set(0, 0, 0);
      chicken.scale.set(1, 1, 1);
      scene.add(chicken);

      // 상태 초기화
      currentLane = 0;
      currentCol = 0;
      score = 0;
      isGameOver = false;
      isMoving = false;
      isSquished = false;
      moveQueue = [];

      if (scoreEl) scoreEl.textContent = '0';
      if (overlayEl) overlayEl.classList.remove('is-active');

      // 초기 레인 26개 생성
      for (let i = 0; i < 26; i++) {
        lanes.push(new Lane(i));
      }

      // 카메라 초기화
      camera.position.set(baseCameraOffset.x, baseCameraOffset.y, baseCameraOffset.z);
      dirLight.position.set(-160, -260, 420);
    }

    // 새 레인 추가 및 오래된 레인 정리 (버그 완벽 수정!)
    function extendMapIfNeeded() {
        // lanes 배열의 마지막 인덱스를 매 루프마다 다시 확인하여 무한 루프 방지
        while (lanes.length > 0 && (lanes[lanes.length - 1].index - currentLane < 25)) {
          const nextIndex = lanes[lanes.length - 1].index + 1;
          lanes.push(new Lane(nextIndex));
        }

          // 플레이어보다 15칸 이상 뒤쳐진 레인 제거
          while (lanes.length > 0 && (currentLane - lanes[0].index > 15)) {
            const oldLane = lanes.shift();
            oldLane.dispose();
          }
        }

        // ==========================================
        // 6. 플레이어 이동 및 점프 애니메이션
        // ==========================================
        function requestMove(dir) {
          if (isGameOver) return;
          initAudio();

          if (isMoving) {
            if (moveQueue.length < 1) moveQueue.push(dir);
            return;
          }

          executeMove(dir);
        }

        function executeMove(dir) {
          let nextCol = currentCol;
          let nextLane = currentLane;
          let targetRotation = 0;

          if (dir === 'forward') {
            nextLane++;
            targetRotation = 0; // 전진 (위쪽)
          } else if (dir === 'backward') {
            nextLane--;
            targetRotation = Math.PI; // 후진
          } else if (dir === 'left') {
            nextCol--;
            targetRotation = Math.PI / 2; // 좌회전
          } else if (dir === 'right') {
            nextCol++;
            targetRotation = -Math.PI / 2; // 우회전
          }

          // 1) 좌우 경계 검사
          if (nextCol < minCol || nextCol > maxCol) return;

          // 2) 뒤쪽 최소 레인 제한 (카메라 밖으로 사라지지 않게)
          if (nextLane < 0 || (currentLane - nextLane > 3)) return;

          // 3) 나무 장애물 검사
          const targetLaneObj = lanes.find(l => l.index === nextLane);
          if (targetLaneObj && targetLaneObj.trees.has(nextCol)) {
            // 나무와 부딪히면 회전만 살짝 반영
            chicken.rotation.z = targetRotation;
            return;
          }

          // 이동 승인!
          isMoving = true;
          moveStartTime = performance.now();
          startPos.copy(chicken.position);
          targetPos.set(
            nextCol * positionWidth * zoom,
            nextLane * positionWidth * zoom,
            0
          );

          currentCol = nextCol;
          currentLane = nextLane;
          chicken.rotation.z = targetRotation;

          soundJump();

          // 스코어 갱신
          if (currentLane > score) {
            score = currentLane;
            if (scoreEl) scoreEl.textContent = score;

            if (score > highScore) {
              highScore = score;
              localStorage.setItem('crossy_road_best', String(highScore));
              if (highScoreEl) highScoreEl.textContent = highScore;
            }
          }

          extendMapIfNeeded();
        }

        // ==========================================
        // 7. 정밀 충돌 감지 (Hit Detection)
        // ==========================================
        function checkCollision() {
          if (isGameOver || isSquished) return;

          const px = chicken.position.x;
          const py = chicken.position.y;
          const pz = chicken.position.z;

          // 현재 닭의 실제 월드 y좌표를 바탕으로 인접한 레인 검색
          const approxLaneIndex = Math.round(py / (positionWidth * zoom));
          const playerLaneObj = lanes.find(l => l.index === approxLaneIndex);
          if (!playerLaneObj || playerLaneObj.vehicles.length === 0) return;

          const laneCenterY = playerLaneObj.mesh.position.y;
          // y 방향으로도 차선 중심으로부터 닭이 일정 범위 안에 있을 때만 판정
          if (Math.abs(py - laneCenterY) > positionWidth * zoom * 0.45) return;

          const chickenHalfWidth = 9 * zoom;

          for (let i = 0; i < playerLaneObj.vehicles.length; i++) {
            const v = playerLaneObj.vehicles[i];
            const distX = Math.abs(px - v.x);

                // x축 가로 겹침 검사
                if (distX < (chickenHalfWidth + v.halfWidth * 0.85)) {
                  // z 높이가 지면 근처(차량 높이)일 때만 충돌 판정
                  if (pz < 24 * zoom) {
                    triggerGameOver();
                    break;
                  }
                }
              }
            }

            function triggerGameOver() {
              isGameOver = true;
              isSquished = true;
              soundCrash();

              // 닭 찌그러짐 (Squish) 효과
              chicken.scale.set(1.3, 1.3, 0.08);

              const isNewRecord = score > 0 && score >= highScore;
              if (isNewRecord) {
                setTimeout(soundRecord, 250);
              }

              setTimeout(() => {
                if (finalScoreEl) finalScoreEl.textContent = score;
                if (modalBestScoreEl) modalBestScoreEl.textContent = highScore;
                if (recordBadgeEl) {
                  recordBadgeEl.style.display = isNewRecord ? 'inline-flex' : 'none';
                }
                if (overlayEl) overlayEl.classList.add('is-active');
              }, 550);
            }

            // ==========================================
            // 8. 렌더 루프 (Animation Loop)
            // ==========================================
            let lastTime = performance.now();

            function animate(now) {
              requestAnimationFrame(animate);

              const delta = Math.min((now - lastTime) / 1000, 0.1);
              lastTime = now;

              // 1) 레인 차량 업데이트
              for (let i = 0; i < lanes.length; i++) {
                lanes[i].update(delta);
              }

              // 2) 점프 애니메이션 처리
              if (isMoving) {
                const elapsed = now - moveStartTime;
                const progress = Math.min(elapsed / stepTime, 1);

                // Ease Out / In 포물선
                chicken.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, progress);
                chicken.position.y = THREE.MathUtils.lerp(startPos.y, targetPos.y, progress);
                chicken.position.z = Math.sin(progress * Math.PI) * (jumpHeight * zoom);

                if (progress >= 1) {
                  chicken.position.copy(targetPos);
                  isMoving = false;

                  // 다음 입력 큐 실행
                  if (moveQueue.length > 0) {
                    const nextDir = moveQueue.shift();
                    executeMove(nextDir);
                  }
                }
              }

              // 3) 충돌 체크
              checkCollision();

              // 4) 카메라 & 조명 부드러운 추적
              const targetCamY = chicken.position.y + baseCameraOffset.y;
              camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
              dirLight.position.y = THREE.MathUtils.lerp(dirLight.position.y, chicken.position.y - 260, 0.1);

              renderer.render(scene, camera);
            }

            // ==========================================
            // 9. 사용자 입력 & 이벤트 리스너
            // ==========================================

            // 키보드 입력
            window.addEventListener('keydown', function (e) {
              if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                // 게임 영역 스크롤 방지
                e.preventDefault();
              }

              if (isGameOver) {
                if (e.key === ' ' || e.key === 'Enter') {
                  resetGame();
                }
                return;
              }

              switch (e.key) {
                case 'ArrowUp':
                case 'KeyW':
                case 'w':
                case 'W':
                  requestMove('forward');
                  break;
                case 'ArrowDown':
                case 'KeyS':
                case 's':
                case 'S':
                  requestMove('backward');
                  break;
                case 'ArrowLeft':
                case 'KeyA':
                case 'a':
                case 'A':
                  requestMove('left');
                  break;
                case 'ArrowRight':
                case 'KeyD':
                case 'd':
                case 'D':
                  requestMove('right');
                  break;
              }
            });

            // 온스크린 가상 D-Pad 버튼
            const dpadButtons = [
              { id: 'dpad-up', dir: 'forward' },
              { id: 'dpad-down', dir: 'backward' },
              { id: 'dpad-left', dir: 'left' },
              { id: 'dpad-right', dir: 'right' }
            ];

            dpadButtons.forEach(({ id, dir }) => {
              const btn = document.getElementById(id);
              if (!btn) return;

              const trigger = (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                requestMove(dir);
                setTimeout(() => btn.classList.remove('pressed'), 120);
              };

              btn.addEventListener('pointerdown', trigger);
            });

            // 모바일 터치 스와이프 제스처
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;

            container.addEventListener('touchstart', function (e) {
              if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = performance.now();
              }
            }, { passive: true });

            container.addEventListener('touchend', function (e) {
              if (e.changedTouches.length === 1) {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                const deltaY = e.changedTouches[0].clientY - touchStartY;
                const deltaTime = performance.now() - touchStartTime;

                // 짧은 탭(Tap)인 경우 앞으로 전진
                if (Math.hypot(deltaX, deltaY) < 18 && deltaTime < 250) {
                  requestMove('forward');
                  return;
                }

                // 스와이프 방향 판별
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  if (deltaX > 25) requestMove('right');
                  else if (deltaX < -25) requestMove('left');
                } else {
                  if (deltaY < -25) requestMove('forward');
                  else if (deltaY > 25) requestMove('backward');
                }
              }
            }, { passive: true });

            // 툴바 액션
            if (retryBtn) {
              retryBtn.addEventListener('click', resetGame);
            }
            if (resetBtn) {
              resetBtn.addEventListener('click', resetGame);
            }

            if (soundBtn) {
              soundBtn.addEventListener('click', function () {
                soundEnabled = !soundEnabled;
                soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
                soundBtn.setAttribute('aria-label', soundEnabled ? '소리 끄기' : '소리 켜기');
              });
            }

            if (fullscreenBtn) {
              fullscreenBtn.addEventListener('click', function () {
                const card = document.querySelector('.game-card');
                if (!card) return;
                if (!document.fullscreenElement) {
                  card.requestFullscreen().catch(() => { });
                } else {
                  document.exitFullscreen().catch(() => { });
                }
              });
            }

            // 반응형 리사이즈 핸들러
            function handleResize() {
              if (!container) return;
              const width = container.clientWidth;
              const height = container.clientHeight;
              const newAspect = width / height;

              camera.left = (-frustumSize * newAspect) / 2;
              camera.right = (frustumSize * newAspect) / 2;
              camera.top = frustumSize / 2;
              camera.bottom = -frustumSize / 2;
              camera.updateProjectionMatrix();

              renderer.setSize(width, height);
            }

            window.addEventListener('resize', handleResize);
            document.addEventListener('fullscreenchange', () => {
              setTimeout(handleResize, 100);
            });

            // 첫 실행 시작
            resetGame();
            animate(performance.now());
          }
        }) ();
