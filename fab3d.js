/**
 * ═══════════════════════════════════════════════════════════════════════
 * Virtual Fab & Packaging Twin — Three.js 3D Procedural Engine
 * High-Visibility Cleanroom Studio Lighting & Distinct Equipment Models
 * ═══════════════════════════════════════════════════════════════════════
 */

const Fab3DEngine = (function() {
  'use strict';

  let scene, camera, renderer;
  let canvas, container;
  let isInitialized = false;
  let currentProcessId = 'p01'; // Default: 01. 웨이퍼 제조 & 세정
  let renderMode = 'equip';     // Default: 'equip' (장비 뷰) vs 'micro' (단면 미세 뷰) vs 'evolution' (소자 진화 뷰)
  let evolutionSubMode = 'gaa'; // 'planar' | 'finfet' | 'gaa'
  let isCutawayActive = false;   // X-ray / Cutaway view
  let isCurrentFlowActive = true;// Animated electron carrier flow & leakage

  // 3D Object Groups
  let mainGroup = null;
  let animObjects = [];
  let animId = null;
  let lastTime = performance.now();

  // Playback & Timeline State
  const playback = {
    isPlaying: true,
    progress: 0.0, // 0.0 ~ 1.0
    speed: 1.0,    // 0.5x, 1x, 2x
    duration: 8.0  // seconds per cycle
  };

  let onProgressCallback = null;

  // Process-specific Stage Definitions
// Process-specific Stage Definitions for All 14 Processes
  const STAGE_DEFINITIONS = {
    'p01': [
      { threshold: 0.25, name: '1/4. [제조] 초크랄스키(CZ) 1420°C 석영 도가니 실리콘 융액 형성 & 종결정 인상' },
      { threshold: 0.50, name: '2/4. [제조] 300mm 단결정 실리콘 잉곳 성장 & 다이아몬드 멀티 와이어 슬라이싱' },
      { threshold: 0.75, name: '3/4. [세정] 775µm 슬라이싱 웨이퍼 1500 RPM 회전 척 안착 & SC-1 케미컬 분사' },
      { threshold: 1.00, name: '4/4. [세정] 메가소닉(Megasonic) 초음파 캐비테이션 파티클 99.8% 박리 & 거울면 완성' }
    ],
    'p02': [
      { threshold: 0.25, name: '1/4. 수직 확산로(1050°C) 웨이퍼 로딩 및 N₂ 대기 퍼지' },
      { threshold: 0.50, name: '2/4. 고순도 건식 O₂ 가스 주입 및 1050°C 고온 열산화 개시' },
      { threshold: 0.75, name: '3/4. Deal-Grove 모델 기반 P-Si 기판 위에 분홍색 게이트 산화막(SiO₂, Tox=20nm) 균일 성장' },
      { threshold: 1.00, name: '4/4. 고품질 분홍색 절연막 완성 ➔ 다음 단계(포토 공정)로 이송' }
    ],
    'p03': [
      { threshold: 0.25, name: '1/4. 분홍색 산화막 위에 노란색 감광액(PR) 균일 스핀 코팅 도포 (빛 없음)' },
      { threshold: 0.50, name: '2/4. 포토마스크 정렬 (중앙 게이트 크롬 차광막 + 좌/우 노광 개구부)' },
      { threshold: 0.75, name: '3/4. 13.5nm EUV 빛으로 좌/우 노광 ➔ 빛을 받은 좌/우 노란색 PR이 초록색(광화학 반응)으로 변색!' },
      { threshold: 1.00, name: '4/4. TMAH 현상액 세척 ➔ 반응한 초록색 PR만 깨끗이 용해 제거, 중앙 노란색 PR 기둥만 보존! (분홍색 산화막은 온전 유지)' }
    ],
    'p04': [
      { threshold: 0.25, name: '1/4. Lam Sense.i 챔버 진공 배기 & CF₄ 식각 가스 + C₄F₈ 측벽 보호 가스 투입' },
      { threshold: 0.50, name: '2/4. 중앙 노란색 PR 마스크 방패 보호 하에 좌/우 분홍색 산화막 수직 90° 식각 개시' },
      { threshold: 0.75, name: '3/4. 좌/우 산화막이 완전히 깎여나가 하부 회색 P-Si 실리콘 기판 깨끗이 노출' },
      { threshold: 1.00, name: '4/4. O₂ 플라즈마 애싱 ➔ 상부 노란색 PR 마스크 태워 제거 ➔ 중앙 수직 90° 분홍색 산화막 기둥 완성!' }
    ],
    'p05': [
      { threshold: 0.25, name: '1/4. 중앙 분홍색 산화막 기둥이 채널을 막아주는 자체 차광 방패(Self-Aligned Mask) 역할' },
      { threshold: 0.50, name: '2/4. 40 keV 비소(As⁺) 이온 빔 샤워가 산화막 없는 좌/우 실리콘에만 깊숙이 침투' },
      { threshold: 0.75, name: '3/4. 이온 충돌로 손상된 좌/우 실리콘 격자 결함층 형성 (중앙 채널은 완벽 보호)' },
      { threshold: 1.00, name: '4/4. 1050°C 밀리초 플래시 열처리(Flash RTA) ➔ 격자 치유 & n⁺ 소스(Source)/드레인(Drain) 완성!' }
    ],
    'p06': [
      { threshold: 0.25, name: '1/4. [1단계] 중앙 산화막 위에 원자층 박막(ALD)으로 High-k(HfO₂) 유전막 정밀 증착' },
      { threshold: 0.50, name: '2/4. [2단계] High-k 위에 전도성 황금빛 메탈 게이트 전극(TiN/텅스텐 W) 원자층 증착' },
      { threshold: 0.75, name: '3/4. [3단계] 게이트 양측벽에 쇼트 방지용 Si₃N₄ 절연 스페이서(Spacers) 형성' },
      { threshold: 1.00, name: '4/4. [4단계] 좌/우 S/D 표면에 저저항 금속 실리사이드(Silicide) 패드 완성 ➔ 3단자 MOSFET 완성!' }
    ],
    'p07': [
      { threshold: 0.25, name: '1/4. 기판 위에 나란히 놓인 인접 2개 트랜지스터(TR-1, TR-2) 위에 텅스텐 컨택 플러그(CA) 기립' },
      { threshold: 0.50, name: '2/4. ★ 1층(M1) 구리선: TR-1 드레인 ➔ TR-2 게이트 수평 직결 (CMOS 인버터 논리 게이트 완성!)' },
      { threshold: 0.75, name: '3/4. M2~M10 로컬 & 중간 배선 적층: 가산기(ALU), SRAM, 64-bit 고속 데이터 버스 연결' },
      { threshold: 1.00, name: '4/4. M11~M15 글로벌 전원망(VDD/VSS) 초저저항 구리 그리드 완성 & 패키지 범프 패드 형성' }
    ],
    'p08': [
      { threshold: 0.25, name: '1/4. 나노 실리카/알루미나 화학 슬러리 연마 패드 표면 균일 공급' },
      { threshold: 0.50, name: '2/4. 멀티존 웨이퍼 캐리어 헤드 하강 및 2.2 psi 다운포스 가압' },
      { threshold: 0.75, name: '3/4. 플래튼-헤드 고속 차등 회전으로 구리 과도금 언덕 평탄화' },
      { threshold: 1.00, name: '4/4. 실시간 인라인 와전류(Eddy Current) EPD 종말점 도달 (Zero Dishing)' }
    ],
    'p09': [
      { threshold: 0.25, name: '1/4. 프로브 카드 미세 텅스텐 캔틸레버 니들 Al/Cu 패드 정밀 정렬' },
      { threshold: 0.50, name: '2/4. 니들 하강 및 표면 자연산화막 관통 오믹 컨택 스크러빙(Scrubbing)' },
      { threshold: 0.75, name: '3/4. 게이트 스윕 전압 인가로 Vth, Ion, Ioff, 게이트 절연 파괴(BVox) 측정' },
      { threshold: 1.00, name: '4/4. KGD(Known Good Die) 양품 판정 및 불량 다이 매핑/잉킹 처리' }
    ],
    'p10': [
      { threshold: 0.25, name: '1/4. 전면 회로 보호용 UV 다이싱 테이프 라미네이션 및 척 고정' },
      { threshold: 0.50, name: '2/4. 6000 RPM 다이아몬드 연삭 휠로 775µm 실리콘 후면을 30µm로 초박형화' },
      { threshold: 0.75, name: '3/4. 실리콘 내부 적외선(IR) 레이저 집속 스텔스 다이싱(SD) 개질층 형성' },
      { threshold: 1.00, name: '4/4. 테이프 익스팬딩으로 30µm 초박막 개별 다이 크랙 분리 완료' }
    ],
    'p11': [
      { threshold: 0.25, name: '1/4. 고밀도 패키지 PCB 기판 플럭스 도포 및 Cu 랜드 패드 정렬' },
      { threshold: 0.50, name: '2/4. 25µm 피치 Sn-Ag-Cu 마이크로범프가 형성된 개별 다이 정밀 픽앤플레이스' },
      { threshold: 0.75, name: '3/4. 열압착(TCB) 헤드 260°C 가열 및 15N 가압으로 범프 리플로우' },
      { threshold: 1.00, name: '4/4. 솔더 합금 야금학적 금속간 화합물(IMC) 접합 완성 (기생 L < 0.1nH)' }
    ],
    'p12': [
      { threshold: 0.25, name: '1/4. 플립칩 실장 기판 몰딩 금형 체결 및 175°C 예열' },
      { threshold: 0.50, name: '2/4. 액상 에폭시 수지(EMC) 및 구형 실리카 필러 100 bar 고압 사출' },
      { threshold: 0.75, name: '3/4. 25µm 마이크로 갭 언더필(Underfill) 무기포(Void-Free) 완벽 충진' },
      { threshold: 1.00, name: '4/4. 고온 베이크 완전 경화로 습기 차단 및 열응력 완화 보호막 형성' }
    ],
    'p13': [
      { threshold: 0.20, name: '1/4. 베이스 로직 버퍼 다이 안착 및 광학 기준점(Fiducial) 서브미크론 정렬' },
      { threshold: 0.55, name: '2/4. 한미반도체 Dual TC 본더 8단 D램 순차 열압착 가압 (310°C, 15N)' },
      { threshold: 0.80, name: '3/4. SK하이닉스 Advanced MR-MUF 액상 수지 분사 및 인터다이 갭 모세관 충진' },
      { threshold: 1.00, name: '4/4. 8단 관통 1024-bit 구리 TSV 기둥 1.2 TB/s 초광대역 신호 버스 동기화' }
    ],
    'p14': [
      { threshold: 0.25, name: '1/4. 서브마이크론 초미세 RDL(0.4µm L/S) 실리콘 인터포저 웨이퍼 안착' },
      { threshold: 0.50, name: '2/4. 중앙 대형 AI GPU 로직 다이 및 좌우 HBM3e 큐브 이종(Heterogeneous) 실장' },
      { threshold: 0.75, name: '3/4. 마이크로범프 솔더링 접합 및 언더필 충진' },
      { threshold: 1.00, name: '4/4. 고밀도 인터포저 버스 8192-bit Eye Diagram 최적화 고주파 통신 개시' }
    ],
    'default': [
      { threshold: 0.25, name: '1/4. 공정 챔버 내 웨이퍼 로딩 및 레시피 환경 세팅' },
      { threshold: 0.50, name: '2/4. 에너지 빔 / 케미컬 반응을 통한 미세 물리적 변환 진행' },
      { threshold: 0.75, name: '3/4. 핵심 제어 지표 인라인 계측 및 피드백 보정' },
      { threshold: 1.00, name: '4/4. 공정 완료 및 후속 스테이션 자동 이송' }
    ]
  };

  // Orbit & Camera
  let isDragging = false;
  let dragMode = 'orbit'; // 'orbit' | 'pan'
  let prevMouseX = 0, prevMouseY = 0;
  let rotX = 0.26, rotY = -0.38;
  let targetRotX = 0.26, targetRotY = -0.38;
  let zoomDist = 20.0;
  let targetZoomDist = 20.0;
  let panTarget = null;
  let targetPanTarget = null;
  let touchStartDist = 0;

  function init(canvasId, containerId) {
    canvas = document.getElementById(canvasId);
    container = document.getElementById(containerId);
    if (!canvas || !container) return false;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js library is not loaded.');
      return false;
    }

    panTarget = new THREE.Vector3(0, 0, 0);
    targetPanTarget = new THREE.Vector3(0, 0, 0);

    try {
      scene = new THREE.Scene();
      // Crystal-clear cleanroom air (minimal fog so tools are 100% visible)
      scene.fog = new THREE.FogExp2(0x07090e, 0.003);

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 430;

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 250);
      camera.position.set(0, 0, zoomDist);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.45; // High exposure for bright metallic crispness

      // ── Cleanroom Studio 4-Point High-Visibility Lighting ──
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.4);
      scene.add(hemiLight);

      const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.8);
      mainKeyLight.position.set(12, 24, 18);
      scene.add(mainKeyLight);

      const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
      fillLight.position.set(-15, 14, 12);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.3);
      rimLight.position.set(-12, -4, -16);
      scene.add(rimLight);

      const groundUplight = new THREE.PointLight(0x38bdf8, 1.0, 40);
      groundUplight.position.set(0, -3.5, 8);
      scene.add(groundUplight);

      mainGroup = new THREE.Group();
      scene.add(mainGroup);

      setupEvents();
      buildScene();
      lastTime = performance.now();
      startAnimationLoop();

      isInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to init Three.js engine:', e);
      return false;
    }
  }

  function setupEvents() {
    // 마우스 우클릭 컨텍스트 메뉴 방지
    container.addEventListener('contextmenu', (e) => e.preventDefault());

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      // 우클릭(button 2), 휠클릭(button 1), 또는 Shift/Alt 키 누른 채 좌클릭 시 화면 이동(Pan)
      if (e.button === 2 || e.button === 1 || e.shiftKey || e.altKey) {
        dragMode = 'pan';
      } else {
        dragMode = 'orbit';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (dragMode === 'pan') {
        // 카메라 시점 기준 상/하/좌/우 화면 평면 이동 (Pan)
        const panFactor = targetZoomDist * 0.0016;
        const cosY = Math.cos(targetRotY), sinY = Math.sin(targetRotY);
        const cosX = Math.cos(targetRotX), sinX = Math.sin(targetRotX);
        const rightVec = new THREE.Vector3(cosY, 0, -sinY);
        const upVec = new THREE.Vector3(-sinY * sinX, cosX, -cosY * sinX);
        
        targetPanTarget.addScaledVector(rightVec, -dx * panFactor);
        targetPanTarget.addScaledVector(upVec, dy * panFactor);
      } else {
        // 자연스러운 3D 궤도 회전: 오른쪽을 잡고 왼쪽으로 끌면 물체가 시계방향으로 회전
        targetRotY -= dx * 0.006;
        targetRotX += dy * 0.006;
        targetRotX = Math.max(-Math.PI / 2.15, Math.min(Math.PI / 2.15, targetRotX));
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      dragMode = 'orbit';
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetZoomDist += e.deltaY * 0.015;
      targetZoomDist = Math.max(5.0, Math.min(60.0, targetZoomDist));
    }, { passive: false });

    // 더블클릭 시 시점 원위치 초기화
    container.addEventListener('dblclick', () => {
      resetCamera();
    });

    // 스마트폰/태블릿 터치 지원 (1핑거: 회전, 2핑거: 핀치 줌 & 팬)
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragMode = 'orbit';
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = true;
        dragMode = 'pan';
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
        prevMouseX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        prevMouseY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length === 1 && dragMode === 'orbit') {
        const dx = e.touches[0].clientX - prevMouseX;
        const dy = e.touches[0].clientY - prevMouseY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
        targetRotY -= dx * 0.007;
        targetRotX += dy * 0.007;
        targetRotX = Math.max(-Math.PI / 2.15, Math.min(Math.PI / 2.15, targetRotX));
      } else if (e.touches.length === 2) {
        // 핀치 줌
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const pinchDelta = touchStartDist - curDist;
        targetZoomDist += pinchDelta * 0.03;
        targetZoomDist = Math.max(5.0, Math.min(60.0, targetZoomDist));
        touchStartDist = curDist;

        // 2핑거 팬
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const dx = midX - prevMouseX;
        const dy = midY - prevMouseY;
        prevMouseX = midX;
        prevMouseY = midY;

        const panFactor = targetZoomDist * 0.0016;
        const cosY = Math.cos(targetRotY), sinY = Math.sin(targetRotY);
        const cosX = Math.cos(targetRotX), sinX = Math.sin(targetRotX);
        const rightVec = new THREE.Vector3(cosY, 0, -sinY);
        const upVec = new THREE.Vector3(-sinY * sinX, cosX, -cosY * sinX);
        targetPanTarget.addScaledVector(rightVec, -dx * panFactor);
        targetPanTarget.addScaledVector(upVec, dy * panFactor);
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDragging = false;
      dragMode = 'orbit';
    });

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function resetCamera() {
    targetRotX = 0.26;
    targetRotY = -0.38;
    targetZoomDist = 20.0;
    if (targetPanTarget) targetPanTarget.set(0, 0, 0);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3D Scene Builder & Model Generation
  // ═══════════════════════════════════════════════════════════════════════
  function buildScene() {
    while (mainGroup.children.length > 0) {
      const obj = mainGroup.children[0];
      mainGroup.remove(obj);
    }
    animObjects = [];

    if (renderMode === 'evolution') {
      buildTransistorEvolutionModel(evolutionSubMode);
      return;
    }

    if (renderMode === 'patterning') {
      buildPatterningLoopModel(patterningStep);
      return;
    }

    const proc = FAB_PROCESSES[currentProcessId];
    if (!proc) return;

    if (renderMode === 'equip') {
      buildEquipmentModel(proc);
    } else {
      buildMicroscopicModel(proc);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 공통 고시인성 클린룸 머티리얼 (Cleanroom Ivory, Stainless Steel, Glass)
  // ─────────────────────────────────────────────────────────────────
  const matWhitePanel = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.15 });
  const matSteel = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.12, metalness: 0.95 });
  const matDarkTrim = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.7 });
  const matCyanGlow = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.75 });
  const matAmberGlow = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.75 });
  const matPurpleGlow = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.85 });
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1 });
  const matChamberDark = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.8 });

  // 300mm 실리콘 웨이퍼 생성 헬퍼 (반사형 거울 광택, 노치 디테일, 다이 격자 패턴)
  function create300mmWafer(radius = 2.1) {
    const waferGroup = new THREE.Group();
    const waferGeo = new THREE.CylinderGeometry(radius, radius, 0.05, 48);
    const waferMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.95,
      roughness: 0.08,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2
    });
    const wafer = new THREE.Mesh(waferGeo, waferMat);
    waferGroup.add(wafer);

    const grid = new THREE.GridHelper(radius * 1.7, 12, 0x00f0ff, 0x1e293b);
    grid.position.y = 0.03;
    waferGroup.add(grid);

    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.22), new THREE.MeshBasicMaterial({ color: 0x0369a1 }));
    notch.position.set(radius - 0.04, 0, 0);
    waferGroup.add(notch);

    return waferGroup;
  }

  // 챔버 내부가 훤히 보이는 절개형 반응 챔버(Cutaway Chamber) 및 내부 스튜디오 조명
  function createCutawayChamber(width, height, depth) {
    const chamberGroup = new THREE.Group();
    const t = 0.25;

    // 바닥 & 천장
    const floor = new THREE.Mesh(new THREE.BoxGeometry(width, t, depth), matSteel);
    floor.position.y = -height / 2 + t / 2;
    chamberGroup.add(floor);

    const ceil = new THREE.Mesh(new THREE.BoxGeometry(width, t, depth), matWhitePanel);
    ceil.position.y = height / 2 - t / 2;
    chamberGroup.add(ceil);

    // 후면 벽 및 좌우 측벽
    const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, t), matChamberDark);
    back.position.z = -depth / 2 + t / 2;
    chamberGroup.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), matWhitePanel);
    left.position.x = -width / 2 + t / 2;
    chamberGroup.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(t, height, depth), matWhitePanel);
    right.position.x = width / 2 - t / 2;
    chamberGroup.add(right);

    // 전면 고투명 클린룸 윈도우 글래스
    const glass = new THREE.Mesh(new THREE.BoxGeometry(width - t * 2, height - t * 2, 0.06), matGlass);
    glass.position.z = depth / 2 - 0.04;
    chamberGroup.add(glass);

    // 챔버 내부를 환하게 비추는 내부 스튜디오 포인트 라이트
    const chamberLight = new THREE.PointLight(0xe0f2fe, 1.6, depth * 2.5);
    chamberLight.position.set(0, height / 3, 0);
    chamberGroup.add(chamberLight);

    return chamberGroup;
  }

  function createSignalTower(height) {
    const tower = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, height, 12);
    const pole = new THREE.Mesh(poleGeo, matSteel);
    tower.add(pole);

    // Green, Amber, Red lamps
    const green = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    green.position.y = height / 2 + 0.15;
    tower.add(green);

    const amber = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), new THREE.MeshBasicMaterial({ color: 0x451a03 }));
    amber.position.y = height / 2 + 0.45;
    tower.add(amber);

    const red = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), new THREE.MeshBasicMaterial({ color: 0x4c0519 }));
    red.position.y = height / 2 + 0.75;
    tower.add(red);

    return tower;
  }

  // ─────────────────────────────────────────────────────────────────
  // 1. 대표 장비 외형 뷰 (Equipment Models)
  // ─────────────────────────────────────────────────────────────────
  function buildEquipmentModel(proc) {
    const modelGroup = new THREE.Group();

    // 클린룸 고휘도 플린스 베이스 플랫폼 (Cleanroom Raised Floor Base)
    const baseGeo = new THREE.BoxGeometry(18, 0.6, 12);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.25
    }));
    baseMesh.position.y = -4.2;
    modelGroup.add(baseMesh);

    // 공정별 고유 설비 분기 (proc.id 100% 직결 분기)
    switch (proc.id) {
      case 'p01': buildWaferPrepAndCleaningDual(modelGroup); break;
      case 'p02': buildOxidationFurnace(modelGroup); break;
      case 'p03': buildASMLEUVScanner(modelGroup); break;
      case 'p04': buildLamEtchChamber(modelGroup); break;
      case 'p05': buildIonImplanter(modelGroup); break;
      case 'p06': buildALDChamber(modelGroup); break;
      case 'p07': buildCuElectroplatingTool(modelGroup); break;
      case 'p08': buildAMATCmpPolisher(modelGroup); break;
      case 'p09': buildEDSProberStation(modelGroup); break;
      case 'p10': buildDiscoGrinderDicing(modelGroup); break;
      case 'p11': buildFlipChipBonder(modelGroup); break;
      case 'p12': buildEMCMoldingPress(modelGroup); break;
      case 'p13': buildHanmiTCBonder(modelGroup); break;
      case 'p14': buildInterposerCoWoSStation(modelGroup); break;
      default:    buildGenericChamber(modelGroup, proc); break;
    }

    mainGroup.add(modelGroup);
  }

  // ─────────────────────────────────────────────────────────────────
  // ★ [01. 웨이퍼 제조 & 세정] 명확한 3대 연계 공정 설비 베이 (Fab Bay)
  // [설비 1] 초크랄스키(CZ) 1420°C 잉곳 성장로 ➔ [설비 2] 다이아몬드 와이어 슬라이서 ➔ [설비 3] 매엽식 스핀 세정기
  // ─────────────────────────────────────────────────────────────────
  function buildWaferPrepAndCleaningDual(group) {
    // ════ [설비 1] 좌측: 초크랄스키 (CZ) 단결정 실리콘 잉곳 성장로 (1420°C Cutaway Ingot Puller) ════
    const czGroup = new THREE.Group();
    czGroup.position.set(-5.6, 0, 0);

    // 메인 본체 캐비닛 베이스
    const czCabinet = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, 4.4), matWhitePanel);
    czCabinet.position.y = -2.8;
    czGroup.add(czCabinet);

    // 1420°C 석영 도가니 진공 챔버 (전면이 시원하게 트인 Cutaway 오픈 챔버)
    // 후면 180도 금속 외벽
    const furnaceBackWall = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 2.6, 32, 1, false, Math.PI * 0.35, Math.PI * 1.3),
      matSteel
    );
    furnaceBackWall.position.y = -0.6;
    czGroup.add(furnaceBackWall);

    // 전면 대형 투명 석영 뷰 실드 (Viewing Glass Shield)
    const furnaceFrontGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.92, 1.92, 2.6, 32, 1, true, -Math.PI * 0.35, Math.PI * 0.7),
      matGlass
    );
    furnaceFrontGlass.position.y = -0.6;
    czGroup.add(furnaceFrontGlass);

    // 고순도 석영 도가니 (Quartz Crucible, 투명 글래스)
    const crucible = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.3, 1.8, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.65 })
    );
    crucible.position.y = -0.6;
    czGroup.add(crucible);

    // 1420°C 고온 실리콘 용융액 (Molten Silicon Melt - 생생한 오렌지/황금 발광 융액)
    const meltGeo = new THREE.CylinderGeometry(1.42, 1.25, 0.8, 32);
    const meltMat = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff4500,
      emissiveIntensity: 1.8,
      roughness: 0.05
    });
    const melt = new THREE.Mesh(meltGeo, meltMat);
    melt.position.y = -0.7;
    czGroup.add(melt);

    const meltGlow = new THREE.PointLight(0xff6600, 3.5, 8.0);
    meltGlow.position.set(0, -0.3, 0.5);
    czGroup.add(meltGlow);

    // 결정화 계면 메니스커스 발광 링 (Meniscus Crystallization Interface)
    const meniscus = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.95, 32),
      new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide })
    );
    meniscus.rotation.x = Math.PI / 2;
    meniscus.position.set(0, -0.29, 0);
    czGroup.add(meniscus);

    // 도가니 외곽 고주파(RF) 유도 가열 코일 4단 (Induction Heating Coils)
    for (let c = 0; c < 4; c++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.07, 12, 32), matAmberGlow);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = -1.2 + c * 0.38;
      czGroup.add(coil);
    }

    // 상부 인상 챔버 타워 (내부 잉곳이 100% 훤히 들여다보이는 투명 석영 인상관)
    const towerBack = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.15, 4.4, 24, 1, false, Math.PI * 0.4, Math.PI * 1.2),
      matWhitePanel
    );
    towerBack.position.y = 3.2;
    czGroup.add(towerBack);

    const towerGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.17, 4.4, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8),
      matGlass
    );
    towerGlass.position.y = 3.2;
    czGroup.add(towerGlass);

    // ── 동적으로 성장하는 단결정 실리콘 잉곳 (Single-Crystal Silicon Ingot Assembly) ──
    const ingotGroup = new THREE.Group();

    // 종결정 홀더 & 넥 (Seed Chuck & Thin Neck)
    const seedChuck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16), matDarkTrim);
    seedChuck.position.y = 1.9;
    ingotGroup.add(seedChuck);

    const seedNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16), matSteel);
    seedNeck.position.y = 1.45;
    ingotGroup.add(seedNeck);

    // 콘 테이퍼 숄더 (Conical Shoulder)
    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.95,
      roughness: 0.12
    });
    const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.7, 32), shoulderMat);
    shoulder.rotation.x = Math.PI;
    shoulder.position.y = 0.8;
    ingotGroup.add(shoulder);

    // 원통형 잉곳 바디 몸통 (Ingot Body Cylinder - 동적 스케일 확장)
    const ingotBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 2.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.98, roughness: 0.1 })
    );
    ingotBody.position.y = -0.65;
    ingotGroup.add(ingotBody);

    ingotGroup.position.set(0, 0.2, 0);
    czGroup.add(ingotGroup);

    // 상부 모터 구동부 & 시그널 타워
    const motorHead = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 1.8), matDarkTrim);
    motorHead.position.y = 5.6;
    czGroup.add(motorHead);

    const czTower = createSignalTower(1.4);
    czTower.position.set(1.4, 5.4, 0.8);
    czGroup.add(czTower);

    // 3D 텍스트 레이블
    const czLabel = createTextSprite('① 1420°C CZ 단결정 잉곳 인상기', '#ff9f0a');
    czLabel.scale.set(3.4, 0.75, 1.0);
    czLabel.position.set(0, 6.8, 0);
    czGroup.add(czLabel);

    group.add(czGroup);

    // ════ [설비 2] 중앙: 다이아몬드 멀티 와이어 슬라이싱 쏘 (Multi-Wire Slicer) ════
    const sawGroup = new THREE.Group();
    sawGroup.position.set(0, 0, 0);

    const sawCabinet = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 3.6), matWhitePanel);
    sawCabinet.position.y = -2.9;
    sawGroup.add(sawCabinet);

    const sawFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.6, 2.8), matGlass);
    sawFrame.position.y = -0.6;
    sawGroup.add(sawFrame);

    // 절단 중인 실리콘 잉곳 몽둥이 (가로 거치)
    const clampIngot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 2.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    clampIngot.rotation.z = Math.PI / 2;
    clampIngot.position.set(0, -0.6, 0);
    sawGroup.add(clampIngot);

    // 고속 주행하는 다이아몬드 와이어 웹 (4가닥 초극세선)
    const wirePulleys = new THREE.Group();
    for (let w = -0.6; w <= 0.6; w += 0.4) {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      wire.position.set(w, -0.6, 0);
      wirePulleys.add(wire);
    }
    sawGroup.add(wirePulleys);

    const sawLabel = createTextSprite('② 다이아몬드 와이어 슬라이서 (775µm)', '#00f0ff');
    sawLabel.scale.set(3.4, 0.75, 1.0);
    sawLabel.position.set(0, 1.5, 0);
    sawGroup.add(sawLabel);

    group.add(sawGroup);

    // ════ [설비 3] 우측: 매엽식 고압 스프레이 & 메가소닉 세정기 (Single Scrubber) ════
    const scrubGroup = new THREE.Group();
    scrubGroup.position.set(5.6, 0, 0);

    // 세정기 캐비닛 본체 (Cleanroom Pearl White)
    const scrubCabinet = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.8, 4.6), matWhitePanel);
    scrubCabinet.position.y = -2.0;
    scrubGroup.add(scrubCabinet);

    // 세정 챔버 투명 아크릴 돔 (완전 개방형 뷰)
    const hood = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 1.6, 32, 1, true),
      matGlass
    );
    hood.position.y = 0.5;
    scrubGroup.add(hood);

    // 1500 RPM 고속 진공 회전 척 & 300mm 웨이퍼
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.35, 32), matDarkTrim);
    chuck.position.y = 0.05;
    scrubGroup.add(chuck);

    const spinWafer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.65, 1.65, 0.04, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.08 })
    );
    spinWafer.position.y = 0.25;
    scrubGroup.add(spinWafer);

    // 웨이퍼 표면 회전 약액 박막 (SC-1 Chemical Puddle Film Disc)
    const waferLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(1.62, 1.62, 0.02, 32),
      new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.55,
        roughness: 0.05
      })
    );
    waferLiquid.position.y = 0.28;
    scrubGroup.add(waferLiquid);

    // 로봇 스윙 암 1: 메가소닉(0.98MHz) 초음파 세정 노즐
    const arm1Group = new THREE.Group();
    const arm1Bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.0, 12), matSteel);
    arm1Bar.rotation.z = Math.PI / 2.3;
    arm1Bar.position.set(-0.7, 1.1, 0);
    arm1Group.add(arm1Bar);

    const megaHead = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16), matCyanGlow);
    megaHead.position.set(0, 0.65, 0);
    arm1Group.add(megaHead);

    // 메가소닉 음향 캐비테이션 에너지 빔 콘 (Acoustic Cavitation Beam)
    const megaBeam = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.45, 16),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 })
    );
    megaBeam.position.set(0, 0.35, 0);
    arm1Group.add(megaBeam);
    scrubGroup.add(arm1Group);

    // 로봇 스윙 암 2: SC-1 고압 케미컬 스프레이 분사 노즐
    const arm2Group = new THREE.Group();
    const arm2Bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.9, 12), matSteel);
    arm2Bar.rotation.z = -Math.PI / 2.4;
    arm2Bar.position.set(0.7, 1.2, 0.3);
    arm2Group.add(arm2Bar);

    // 분사되는 SC-1 케미컬 스프레이 콘 (Liquid Jet Spray Stream)
    const sprayCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 0.65, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    );
    sprayCone.rotation.x = Math.PI;
    sprayCone.position.set(0.1, 0.6, 0.3);
    arm2Group.add(sprayCone);
    scrubGroup.add(arm2Group);

    // 오퍼레이터 조작 터치스크린 HUD 콘솔
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), matCyanGlow);
    monitor.position.set(1.8, 0.3, 2.3);
    monitor.rotation.y = -0.3;
    scrubGroup.add(monitor);

    const scrubTower = createSignalTower(1.4);
    scrubTower.position.set(-1.6, 2.8, -1.6);
    scrubGroup.add(scrubTower);

    const scrubLabel = createTextSprite('③ 매엽식 스핀 세정기 (SC-1 & 메가소닉)', '#10b981');
    scrubLabel.scale.set(3.4, 0.75, 1.0);
    scrubLabel.position.set(0, 2.7, 0);
    scrubGroup.add(scrubLabel);

    group.add(scrubGroup);

    // ── 실시간 듀얼 설비 연동 애니메이션 객체 ──
    animObjects.push({
      type: 'p01_dual_playback',
      czIngotGroup: ingotGroup,
      czIngotBody: ingotBody,
      czShoulder: shoulder,
      czMeniscus: meniscus,
      czMelt: melt,
      wireSaw: wirePulleys,
      spinWafer: spinWafer,
      spinChuck: chuck,
      waferLiquid: waferLiquid,
      arm1: arm1Group,
      megaBeam: megaBeam,
      arm2: arm2Group,
      sprayCone: sprayCone
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 03. ASML High-NA EUV Scanner (Twinscan EXE:5000)
  // ─────────────────────────────────────────────────────────────────
  function buildASMLEUVScanner(group) {
    const chamber = createCutawayChamber(11.5, 8.2, 8.5);
    chamber.position.y = -0.1;
    group.add(chamber);

    // ── 1. 상부 EUV 조명계 (Illuminator Source Box) ──
    const illuminator = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 3.2), matWhitePanel);
    illuminator.position.set(0, 3.6, -1.0);
    chamber.add(illuminator);

    // ── 2. 상부 레티클(포토마스크) 스테이지 (Reticle Stage Gantry) ──
    const reticleGantry = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 4.8), matDarkTrim);
    reticleGantry.position.set(0, 2.9, 0);
    chamber.add(reticleGantry);

    // 가동형 레티클 캐리지 (Reticle Carriage, Y축 고속 스캔 주행)
    const reticleStage = new THREE.Group();
    reticleStage.position.set(0, 2.7, 0);

    // 레티클 홀더 프레임 (크롬 미러 베이스)
    const maskHolder = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 3.0), matSteel);
    reticleStage.add(maskHolder);

    // 4배 크기의 반사형 포토마스크 (Reflective Mo/Si EUV Photomask)
    const maskPlate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.04, 2.4), new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.98,
      roughness: 0.05
    }));
    maskPlate.position.y = -0.06;
    reticleStage.add(maskPlate);

    // 포토마스크 표면의 고밀도 회로 흡수체(Absorber) 나노 격자선
    for (let rz = -0.9; rz <= 0.9; rz += 0.3) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.02, 0.12), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      line.position.set(0, -0.08, rz);
      reticleStage.add(line);
    }
    chamber.add(reticleStage);

    // ── 3. 중간 자이스(Zeiss) High-NA 0.55 투영 광학 박스 (POB, 4:1 축소 반사경 컬럼) ──
    const pobCol = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 2.6, 8), matSteel);
    pobCol.position.set(0, 1.2, 0);
    chamber.add(pobCol);

    const pobWindow = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 2.2, 8), matGlass);
    pobWindow.position.set(0, 1.2, 0);
    chamber.add(pobWindow);

    // ── 4. 투영 광학계를 통과해 4x 축소된 직사각형 EUV 노광 슬릿 빔속 (EUV Exposure Slit Beam) ──
    const slitBeam = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 0.25), new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    }));
    slitBeam.position.set(0, -0.9, 0);
    chamber.add(slitBeam);

    // ── 5. 하부 Twinscan 듀얼 정전척(ESC) 및 웨이퍼 스테이지 ──
    const waferStage = new THREE.Group();
    waferStage.position.set(0, -2.1, 0);

    const escChuck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.35, 36), matDarkTrim);
    waferStage.add(escChuck);

    // 300mm 웨이퍼 + 표면 칩 다이(Die) 격자망
    const wafer = create300mmWafer(2.1);
    wafer.position.y = 0.2;
    waferStage.add(wafer);

    // 현재 노광 중인 활성 다이 하이라이트 박스 (Active Exposure Die)
    const activeDie = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.7), new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8
    }));
    activeDie.position.set(0, 0.25, 0);
    waferStage.add(activeDie);

    chamber.add(waferStage);

    const tower = createSignalTower(1.8);
    tower.position.set(4.8, 3.8, -3.0);
    group.add(tower);

    animObjects.push({
      type: 'p03_equip',
      reticleStage: reticleStage,
      waferStage: waferStage,
      slitBeam: slitBeam,
      activeDie: activeDie
    });
  }
  // ─────────────────────────────────────────────────────────────────
  // 04. Lam Sense.i 플라즈마 건식 식각 챔버
  // ─────────────────────────────────────────────────────────────────
  function buildLamEtchChamber(group) {
    const chamber = createCutawayChamber(10.5, 6.8, 7.5);
    chamber.position.y = -0.5;
    group.add(chamber);

    // 상부 RF 이중주파수(CCP) 가스 분사 샤워헤드 전극
    const showerhead = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 36), matSteel);
    showerhead.position.set(0, 2.0, 0);
    chamber.add(showerhead);

    // 하부 고진공 헬륨 백사이드 쿨링 정전척 (ESC)
    const escChuck = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.6, 36), matDarkTrim);
    escChuck.position.set(0, -2.2, 0);
    chamber.add(escChuck);

    // 정전척 위에 안착된 300mm 실리콘 웨이퍼
    const wafer = create300mmWafer(2.1);
    wafer.position.set(0, -1.85, 0);
    chamber.add(wafer);

    // 웨이퍼 직상부에서 타오르는 초고밀도 RF 플라즈마 방전체 (보라/시안 발광 글로우)
    const plasmaGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.8, 32);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });
    const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
    plasma.position.set(0, -0.9, 0);
    chamber.add(plasma);

    const plasmaLight = new THREE.PointLight(0xa855f7, 2.5, 7.0);
    plasmaLight.position.set(0, -0.9, 0);
    chamber.add(plasmaLight);

    const tower = createSignalTower(1.6);
    tower.position.set(4.2, 3.4, -2.8);
    group.add(tower);

    animObjects.push({
      type: 'p04_equip',
      plasma: plasma,
      plasmaLight: plasmaLight,
      wafer: wafer
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 08. AMAT Reflexion LK CMP 연마기
  // ─────────────────────────────────────────────────────────────────
  function buildAMATCmpPolisher(group) {
    const deck = createCutawayChamber(11.5, 6.2, 8.5);
    deck.position.y = -0.8;
    group.add(deck);

    // 회전 연마 플래튼 & 그루브 패드
    const platen = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.5, 40), matSteel);
    platen.position.set(-0.6, -1.8, 0);
    deck.add(platen);

    const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.12, 40), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.85 }));
    pad.position.set(-0.6, -1.48, 0);
    deck.add(pad);

    // 웨이퍼를 아래로 쥐고 가압하는 멀티존 연마 캐리어 헤드
    const headGroup = new THREE.Group();
    const head = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 1.2, 32), matSteel);
    headGroup.add(head);

    // 헤드 아래 장착된 300mm 웨이퍼 (페이스 다운)
    const wafer = create300mmWafer(2.1);
    wafer.rotation.x = Math.PI;
    wafer.position.y = -0.65;
    headGroup.add(wafer);

    headGroup.position.set(-1.6, 0.2, 0.4);
    deck.add(headGroup);

    // ── 슬러리 분사 암 & 액상 슬러리 스트림 (Chemical Slurry Delivery Arm) ──
    const slurryGroup = new THREE.Group();
    slurryGroup.position.set(2.2, -0.2, -1.2);

    const slurryBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.4, 16), matSteel);
    slurryBase.position.y = -0.7;
    slurryGroup.add(slurryBase);

    const slurryArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 12), matDarkTrim);
    slurryArm.rotation.z = Math.PI / 2.3;
    slurryArm.position.set(-1.1, 0.2, 0.4);
    slurryGroup.add(slurryArm);

    // 슬러리 분사 노즐 & 백색 화학 슬러리 낙하 줄기
    const slurryNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.3, 12), matCyanGlow);
    slurryNozzle.position.set(-2.2, 0.1, 0.6);
    slurryGroup.add(slurryNozzle);

    const slurryStream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, transparent: true, opacity: 0.9 })
    );
    slurryStream.position.set(-2.2, -0.6, 0.6);
    slurryGroup.add(slurryStream);

    deck.add(slurryGroup);

    // ── 다이아몬드 패드 컨디셔너 암 (Diamond Pad Conditioner) ──
    const condGroup = new THREE.Group();
    condGroup.position.set(1.8, -0.2, 1.8);

    const condBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.4, 16), matSteel);
    condBase.position.y = -0.7;
    condGroup.add(condBase);

    const condArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 12), matSteel);
    condArm.rotation.z = Math.PI / 2.2;
    condArm.position.set(-0.9, 0.1, -0.3);
    condGroup.add(condArm);

    const diamondDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.15, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
    );
    diamondDisc.position.set(-1.8, -1.2, -0.5);
    condGroup.add(diamondDisc);

    deck.add(condGroup);

    // 3D 정보 라벨
    const cmpLabel = createTextSprite('AMAT Reflexion LK (나노 슬러리 & 다이아몬드 컨디셔너)', '#00f0ff');
    cmpLabel.scale.set(4.2, 0.8, 1.0);
    cmpLabel.position.set(0, 2.8, 0);
    deck.add(cmpLabel);

    animObjects.push({
      type: 'p08_equip',
      platen: platen,
      pad: pad,
      headGroup: headGroup,
      slurryArm: slurryGroup,
      condGroup: condGroup,
      diamondDisc: diamondDisc
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 13. 한미반도체 Dual TC Bonder (HBM 3D 적층)
  // ─────────────────────────────────────────────────────────────────
  function buildHanmiTCBonder(group) {
    const chamber = createCutawayChamber(10.5, 7.2, 7.5);
    chamber.position.y = -0.3;
    group.add(chamber);

    // 하부 히팅 진공 본딩 스테이지
    const stage = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 4.2), matSteel);
    stage.position.set(0, -2.4, 0.5);
    chamber.add(stage);

    // 베이스 다이 안착
    const baseDie = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 3.2), new THREE.MeshStandardMaterial({ color: 0x0a84ff, metalness: 0.8 }));
    baseDie.position.set(0, -1.85, 0.5);
    chamber.add(baseDie);

    // 듀얼 초정밀 4축 본딩 헤드 (Dual TC Heads)
    const heads = [];
    for (let i = -1; i <= 1; i += 2) {
      const hGroup = new THREE.Group();
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 3.0, 24), matSteel);
      hGroup.add(col);

      // 열압착 가열 툴 팁 (310°C 발광 히터)
      const tip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.8
      }));
      tip.position.y = -1.7;
      hGroup.add(tip);

      // 흡착된 DRAM 다이
      const dramDie = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.7 }));
      dramDie.position.y = -1.95;
      hGroup.add(dramDie);

      hGroup.position.set(i * 2.2, 1.2, 0.5);
      chamber.add(hGroup);
      heads.push(hGroup);
    }

    const tower = createSignalTower(1.8);
    tower.position.set(4.2, 3.4, -2.8);
    group.add(tower);

    animObjects.push({
      type: 'p13_equip',
      heads: heads,
      stage: stage
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 02. 수직형 산화/열처리 확산로 (TEL TELINDY)
  // ─────────────────────────────────────────────────────────────────
  function buildOxidationFurnace(group) {
    const chamber = createCutawayChamber(9.0, 8.0, 7.0);
    chamber.position.y = -0.1;
    group.add(chamber);

    // 석영 반응관 튜브 (투명 유리 재질)
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 5.8, 32), new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1
    }));
    tube.position.set(0, 0.4, 0);
    chamber.add(tube);

    // 고온 가열 오렌지 발광 코일 (1050°C 열복사)
    const coil = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 12, 32), matAmberGlow);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0, 0.8, 0);
    chamber.add(coil);

    // 25장의 웨이퍼가 꽂혀있는 웨이퍼 보트 랙 (Wafer Boat)
    const boatGroup = new THREE.Group();
    const boatBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 4.4), matSteel);
    boatGroup.add(boatBase);

    // 7장의 실리콘 웨이퍼 수직 정렬
    for (let w = -1.8; w <= 1.8; w += 0.6) {
      const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 }));
      wMesh.rotation.x = Math.PI / 2;
      wMesh.position.set(0, 0.9, w);
      boatGroup.add(wMesh);
    }
    boatGroup.position.set(0, -1.8, 0);
    chamber.add(boatGroup);

    animObjects.push({
      type: 'p02_equip',
      boatGroup: boatGroup,
      coil: coil
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 05. 이온 주입기 (AMAT Varian VIISta)
  // ─────────────────────────────────────────────────────────────────
  function buildIonImplanter(group) {
    const chamber = createCutawayChamber(11.0, 6.5, 7.5);
    chamber.position.y = -0.6;
    group.add(chamber);

    // 7도 틸트 회전형 정전척 (ESC Chuck)
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 36), matDarkTrim);
    chuck.rotation.x = 0.15;
    chuck.position.set(1.5, -1.5, 0);
    chamber.add(chuck);

    const wafer = create300mmWafer(2.0);
    wafer.rotation.x = 0.15;
    wafer.position.set(1.5, -1.2, 0);
    chamber.add(wafer);

    // 90도 분석 전자석 빔라인 노즐
    const beamNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.5, 2.5, 24), matSteel);
    beamNozzle.rotation.z = -Math.PI / 3;
    beamNozzle.position.set(-2.8, 1.2, 0);
    chamber.add(beamNozzle);

    // 고에너지 보라색 이온 빔 콘 (Wafer를 향해 방사)
    const beamCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 4.2, 24, 1, true), new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    }));
    beamCone.rotation.z = Math.PI / 2.7;
    beamCone.position.set(-0.7, -0.2, 0);
    chamber.add(beamCone);

    animObjects.push({
      type: 'p05_equip',
      beamCone: beamCone,
      wafer: wafer
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 06. ALD 박막 증착 클러스터 (AMAT Centura ALD)
  // ─────────────────────────────────────────────────────────────────
  function buildALDChamber(group) {
    const chamber = createCutawayChamber(10.0, 6.8, 7.5);
    chamber.position.y = -0.5;
    group.add(chamber);

    // 하부 히팅 서셉터 페데스탈
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.7, 36), matDarkTrim);
    pedestal.position.set(0, -2.1, 0);
    chamber.add(pedestal);

    const wafer = create300mmWafer(2.1);
    wafer.position.set(0, -1.72, 0);
    chamber.add(wafer);

    // 상부 정밀 가스 분산 샤워헤드
    const shower = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 36), matSteel);
    shower.position.set(0, 2.0, 0);
    chamber.add(shower);

    // 전구체 반응 가스 파동 (핑크 TMA / 시안 H2O 교대 펄스)
    const cloudGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.4, 32);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45 });
    const gasCloud = new THREE.Mesh(cloudGeo, cloudMat);
    gasCloud.position.set(0, -0.8, 0);
    chamber.add(gasCloud);

    animObjects.push({
      type: 'p06_equip',
      gasCloud: gasCloud,
      wafer: wafer
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 07. Cu 듀얼 다마신 전해도금기 (AMAT Raider)
  // ─────────────────────────────────────────────────────────────────
  function buildCuElectroplatingTool(group) {
    const chamber = createCutawayChamber(10.0, 6.8, 7.5);
    chamber.position.y = -0.5;
    group.add(chamber);

    // 도금 수조 (투명 블루 CuSO4 전해액)
    const bathGeo = new THREE.CylinderGeometry(3.2, 3.0, 3.2, 36);
    const bathMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55, roughness: 0.05 });
    const bath = new THREE.Mesh(bathGeo, bathMat);
    bath.position.set(0, -1.2, 0);
    chamber.add(bath);

    // 회전 캐소드 척 (웨이퍼가 전해액 속으로 페이스 다운 침지)
    const wafer = create300mmWafer(2.1);
    wafer.rotation.x = Math.PI;
    wafer.position.set(0, -0.8, 0);
    chamber.add(wafer);

    // 하부 구리 인(Phosphorized Cu) 애노드 펠릿 바스켓
    const anode = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.4, 32), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    anode.position.set(0, -2.5, 0);
    chamber.add(anode);

    animObjects.push({
      type: 'p07_equip',
      wafer: wafer
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 09. EDS 웨이퍼 프로버 & 테스터 (TEL Precio)
  // ─────────────────────────────────────────────────────────────────
  function buildEDSProberStation(group) {
    const chamber = createCutawayChamber(10.5, 6.8, 7.5);
    chamber.position.y = -0.5;
    group.add(chamber);

    // 초정밀 X-Y-Z 스테핑 웨이퍼 척
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 36), matSteel);
    chuck.position.set(0, -2.2, 0.3);
    chamber.add(chuck);

    const wafer = create300mmWafer(2.1);
    wafer.position.set(0, -1.92, 0.3);
    chamber.add(wafer);

    // 프로브 카드 링 및 마이크로 니들 어레이
    const cardGroup = new THREE.Group();
    const cardRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 16, 32), matDarkTrim);
    cardRing.rotation.x = Math.PI / 2;
    cardGroup.add(cardRing);

    // 텅스텐 마이크로 니들 팁
    const needleTip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    needleTip.position.y = -0.5;
    cardGroup.add(needleTip);

    cardGroup.position.set(0, -0.8, 0.3);
    chamber.add(cardGroup);

    // 상부 정렬 광학 현미경 렌즈
    const microscope = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.0, 24), matSteel);
    microscope.position.set(0, 1.8, 0.3);
    chamber.add(microscope);

    animObjects.push({
      type: 'p09_equip',
      chuck: chuck,
      wafer: wafer,
      cardGroup: cardGroup
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. DISCO 백그라인딩 & 스텔스 다이싱 (DFG8540)
  // ─────────────────────────────────────────────────────────────────
  function buildDiscoGrinderDicing(group) {
    const chamber = createCutawayChamber(11.0, 6.5, 7.5);
    chamber.position.y = -0.6;
    group.add(chamber);

    // 다공성 세라믹 진공 척 (Porous Ceramic Chuck)
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 36), matDarkTrim);
    chuck.position.set(0, -2.1, 0.2);
    chamber.add(chuck);

    const wafer = create300mmWafer(2.1);
    wafer.position.set(0, -1.82, 0.2);
    chamber.add(wafer);

    // 초고속 에어베어링 스핀들 다이아몬드 컵 휠 (Diamond Grinding Wheel)
    const spindleGroup = new THREE.Group();
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 24), matSteel);
    spindleGroup.add(spindle);

    const diamondWheel = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.25, 32), new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2
    }));
    diamondWheel.position.y = -1.2;
    spindleGroup.add(diamondWheel);

    spindleGroup.position.set(-0.8, 0.2, 0.2);
    chamber.add(spindleGroup);

    animObjects.push({
      type: 'p10_equip',
      spindleGroup: spindleGroup,
      wafer: wafer
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 11. 한미반도체 고속 플립칩 본더
  // ─────────────────────────────────────────────────────────────────
  function buildFlipChipBonder(group) {
    const chamber = createCutawayChamber(10.5, 6.8, 7.5);
    chamber.position.y = -0.5;
    group.add(chamber);

    // 패키지 기판 스트립 진공 스테이지
    const stage = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.6, 3.8), matSteel);
    stage.position.set(0, -2.2, 0.4);
    chamber.add(stage);

    // 본딩 4축 헤드 & 콜릿
    const headGroup = new THREE.Group();
    const collet = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.4, 24), matSteel);
    headGroup.add(collet);

    // 픽업된 플립칩 다이
    const die = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 2.0), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.8 }));
    die.position.y = -1.35;
    headGroup.add(die);

    headGroup.position.set(0, 0.8, 0.4);
    chamber.add(headGroup);

    animObjects.push({
      type: 'p11_equip',
      headGroup: headGroup
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 12. TOWA 트랜스퍼 몰딩 프레스
  // ─────────────────────────────────────────────────────────────────
  function buildEMCMoldingPress(group) {
    const chamber = createCutawayChamber(10.5, 7.5, 7.5);
    chamber.position.y = -0.2;
    group.add(chamber);

    // 하부 몰드 베이스 & 상부 몰드 체이스
    const lowerMold = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 4.2), matSteel);
    lowerMold.position.set(0, -2.2, 0);
    chamber.add(lowerMold);

    const upperMold = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 4.2), matSteel);
    upperMold.position.set(0, 0.4, 0);
    chamber.add(upperMold);

    // 수압/서보 트랜스퍼 플런저 램
    const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 24), matDarkTrim);
    plunger.position.set(0, 2.2, 0);
    chamber.add(plunger);

    animObjects.push({
      type: 'p12_equip',
      upperMold: upperMold,
      plunger: plunger
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 14. 2.5D 인터포저 CoWoS 조립 스테이션
  // ─────────────────────────────────────────────────────────────────
  function buildInterposerCoWoSStation(group) {
    const chamber = createCutawayChamber(11.0, 7.0, 8.0);
    chamber.position.y = -0.4;
    group.add(chamber);

    // 진공 척 및 300mm 인터포저 웨이퍼
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 36), matSteel);
    chuck.position.set(0, -2.2, 0.2);
    chamber.add(chuck);

    const wafer = create300mmWafer(2.2);
    wafer.position.set(0, -1.92, 0.2);
    chamber.add(wafer);

    // 초정밀 이종 집적 픽앤플레이스 갠트리 툴
    const gantry = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.8, 2.4), matSteel);
    gantry.position.set(0, 1.4, 0.2);
    chamber.add(gantry);

    animObjects.push({
      type: 'p14_equip',
      gantry: gantry,
      wafer: wafer
    });
  }

  function buildGenericChamber(group, proc) {
    const chamber = createCutawayChamber(9.5, 6.5, 7.0);
    chamber.position.y = -0.5;
    group.add(chamber);

    const wafer = create300mmWafer(2.1);
    wafer.position.set(0, -1.8, 0);
    chamber.add(wafer);
  }

    // ─────────────────────────────────────────────────────────────────
  // 3D 텍스트 라벨 스프라이트 헬퍼 (Canvas 2D Texture)
  // ─────────────────────────────────────────────────────────────────
  function createTextSprite(text, color, bgColor) {
    color = color || '#00f0ff';
    bgColor = bgColor || 'rgba(15, 23, 42, 0.88)';
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');

    // Rounded background
    ctx.fillStyle = bgColor;
    if (ctx.roundRect) {
      ctx.roundRect(6, 6, 500, 98, 14);
    } else {
      ctx.rect(6, 6, 500, 98);
    }
    ctx.fill();

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    if (ctx.roundRect) {
      ctx.roundRect(6, 6, 500, 98, 14);
    } else {
      ctx.rect(6, 6, 500, 98);
    }
    ctx.stroke();

    // Text
    ctx.font = 'bold 30px "Pretendard", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 55);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.8, 0.82, 1.0);
    return sprite;
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. 단면 미세 뷰: 단일 웨이퍼 누적 진화형 MOSFET 전주기 라이프사이클
  // (P-Si 기판 ➔ 산화막 ➔ 포토 ➔ 식각 ➔ S/D 주입 ➔ ALD/메탈게이트 ➔ BEOL 15L ➔ CMP ➔ EDS ➔ 박형화 ➔ 패키징)
  // ─────────────────────────────────────────────────────────────────
  function buildMicroscopicModel(proc) {
    const modelGroup = new THREE.Group();

    switch (proc.id) {
      case 'p01': buildMicroP01WaferCleaning(modelGroup); break;
      case 'p02': buildMicroP02ThermalOxidation(modelGroup); break;
      case 'p03': buildMicroP03EUVLithography(modelGroup); break;
      case 'p04': buildMicroP04PlasmaEtch(modelGroup); break;
      case 'p05': buildMicroP05IonImplant(modelGroup); break;
      case 'p06': buildMicroP06ALDThinFilm(modelGroup); break;
      case 'p07': buildMicroP07BEOL15LayerStack(modelGroup); break;
      case 'p08': buildMicroP08CMPPlanarization(modelGroup); break;
      case 'p09': buildMicroP09EDSProber(modelGroup); break;
      case 'p10': buildMicroP10GrindingDicing(modelGroup); break;
      case 'p11': buildMicroP11FlipChip(modelGroup); break;
      case 'p12': buildMicroP12EMCMolding(modelGroup); break;
      case 'p13': buildMicroP13HBM3DStack(modelGroup); break;
      case 'p14': buildMicroP1425DInterposer(modelGroup); break;
      default:    buildMicroP01WaferCleaning(modelGroup); break;
    }

    mainGroup.add(modelGroup);
  }

  // 공통 기판 생성 헬퍼 (모든 FEOL 공정의 기초가 되는 동일한 P-type 실리콘 웨이퍼)
  function createBasePSiSubstrate(group, yPos) {
    yPos = (yPos !== undefined) ? yPos : -1.7;
    const subGeo = new THREE.BoxGeometry(12, 1.8, 8);
    const subMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.65
    });
    const sub = new THREE.Mesh(subGeo, subMat);
    sub.position.y = yPos;
    group.add(sub);
    return sub;
  }

  // p01. 01. 웨이퍼 제조 & 세정 단면 미세 뷰: 3단계 물리 공정 (1420°C 잉곳 성장 ➔ 와이어 슬라이싱 ➔ 메가소닉 세정)
  function buildMicroP01WaferCleaning(group) {
    // ════ [1단계: 좌측 x = -4.8] 1420°C 초크랄스키(CZ) 단결정 실리콘 잉곳 인상 ════
    const czStage = new THREE.Group();
    czStage.position.set(-4.8, -0.6, 0);

    // 고순도 석영 도가니
    const crucible = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.2, 1.5, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, transparent: true, opacity: 0.8 })
    );
    crucible.position.y = -0.4;
    czStage.add(crucible);

    // 1420°C 실리콘 융액 (Molten Silicon)
    const melt = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.15, 0.7, 24),
      new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff3b00, emissiveIntensity: 1.5, roughness: 0.05 })
    );
    melt.position.y = -0.5;
    czStage.add(melt);

    // 가열 코일 3단
    for (let c = 0; c < 3; c++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.06, 8, 24), matAmberGlow);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = -0.9 + c * 0.35;
      czStage.add(coil);
    }

    // 인상되는 단결정 잉곳 원기둥 (Ingot Rod)
    const ingotGroup = new THREE.Group();
    const seed = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12), matSteel);
    seed.position.y = 1.6;
    ingotGroup.add(seed);

    const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.7, 24), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 }));
    shoulder.rotation.x = Math.PI;
    shoulder.position.y = 0.95;
    ingotGroup.add(shoulder);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 24), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 }));
    body.position.y = -0.3;
    ingotGroup.add(body);

    ingotGroup.position.y = 0.2;
    czStage.add(ingotGroup);

    const czLabel = createTextSprite('1. CZ 1420°C 잉곳 성장', '#ff9f0a');
    czLabel.scale.set(2.8, 0.65, 1.0);
    czLabel.position.set(0, 2.6, 0);
    czStage.add(czLabel);

    group.add(czStage);

    // ════ [2단계: 중앙 x = 0] 다이아몬드 멀티 와이어 슬라이싱 (775µm 원판 절단) ════
    const sawStage = new THREE.Group();
    sawStage.position.set(0, -0.6, 0);

    const ingotBodyClamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 2.8, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.25 })
    );
    ingotBodyClamp.rotation.z = Math.PI / 2;
    ingotBodyClamp.position.set(0, 0.2, 0);
    sawStage.add(ingotBodyClamp);

    // 4가닥 고속 주행 와이어 웹
    const wires = new THREE.Group();
    for (let w = -0.8; w <= 0.8; w += 0.4) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      wire.position.set(w, 0.2, 0);
      wires.add(wire);
    }
    sawStage.add(wires);

    // 절단되어 빠져나오는 300mm 원판 웨이퍼 (두께 775µm)
    const cutWafer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.95, roughness: 0.15 })
    );
    cutWafer.rotation.z = Math.PI / 2;
    cutWafer.position.set(1.5, 0.2, 0);
    sawStage.add(cutWafer);

    const sawLabel = createTextSprite('2. 와이어 슬라이싱 (775µm)', '#00f0ff');
    sawLabel.scale.set(2.8, 0.65, 1.0);
    sawLabel.position.set(0, 2.6, 0);
    sawStage.add(sawLabel);

    group.add(sawStage);

    // ════ [3단계: 우측 x = 4.8] SC-1 메가소닉 세정 & 베어 P-Si 기판 완성 ════
    const cleanStage = new THREE.Group();
    cleanStage.position.set(4.8, -0.6, 0);

    // 회전 진공 척
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 32), matDarkTrim);
    chuck.position.y = -1.0;
    cleanStage.add(chuck);

    // 베어 P-Si 실리콘 기판 (원자 거울면)
    const waferSub = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.2 })
    );
    waferSub.position.y = -0.75;
    cleanStage.add(waferSub);

    const mirrorLayer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.39, 1.39, 0.02, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.96, roughness: 0.08 })
    );
    mirrorLayer.position.y = -0.69;
    cleanStage.add(mirrorLayer);

    // 화학 세정액 유체막
    const liquidLayer = new THREE.Mesh(
      new THREE.CylinderGeometry(1.42, 1.42, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.38, roughness: 0.05 })
    );
    liquidLayer.position.y = -0.64;
    cleanStage.add(liquidLayer);

    // 메가소닉 초음파 세정 노즐
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.5, 16), matSteel);
    nozzle.position.set(0, 0.8, 0);
    cleanStage.add(nozzle);

    const spray = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 1.4, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    spray.position.set(0, -0.1, 0);
    spray.rotation.x = Math.PI;
    cleanStage.add(spray);

    // 8개의 미세 오염 나노 파티클
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({ color: (i % 2 === 0) ? 0xef4444 : 0xf59e0b, roughness: 0.5 })
      );
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.4 + (i % 3) * 0.25;
      pMesh.position.set(Math.cos(angle) * radius, -0.62, Math.sin(angle) * radius);
      pMesh.userData = { initX: pMesh.position.x, initY: pMesh.position.y, initZ: pMesh.position.z };
      cleanStage.add(pMesh);
      particles.push(pMesh);
    }

    const cleanLabel = createTextSprite('3. SC-1 메가소닉 세정 ➔ 베어 P-Si 기판', '#10b981');
    cleanLabel.scale.set(3.4, 0.65, 1.0);
    cleanLabel.position.set(0, 2.6, 0);
    cleanStage.add(cleanLabel);

    group.add(cleanStage);

    // 상단 종합 타이틀
    const titleSprite = createTextSprite('01. 웨이퍼 제조(CZ 잉곳 성장·와이어 슬라이싱) ➔ SC-1 세정', '#00f0ff');
    titleSprite.scale.set(4.8, 0.85, 1.0);
    titleSprite.position.set(0, 3.4, 0);
    group.add(titleSprite);

    animObjects.push({
      type: 'p01_micro',
      czIngot: ingotGroup,
      czMelt: melt,
      wireSaw: wires,
      cutWafer: cutWafer,
      spinWafer: waferSub,
      mirrorLayer: mirrorLayer,
      liquid: liquidLayer,
      particles: particles
    });
  }

  // p02. 02. 열산화 게이트 절연막 단면 미세 뷰: P-Si 기판 위 SiO2 절연막 성장 (Deal-Grove)
  // p02. 02. 열산화 게이트 절연막 단면 미세 뷰: P-Si 기판 위 분홍색 SiO2 절연막 성장
  function buildMicroP02ThermalOxidation(group) {
    const sub = createBasePSiSubstrate(group, -1.7);

    // 성장하는 열산화막 (SiO2 게이트 절연막, 선명한 분홍색/마젠타 글래스)
    const oxide = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.3, 8),
      new THREE.MeshStandardMaterial({
        color: 0xec4899,
        transparent: true,
        opacity: 0.85,
        roughness: 0.15,
        metalness: 0.1
      })
    );
    oxide.position.y = -0.55;
    oxide.scale.y = 0.05;
    group.add(oxide);

    // 하강하는 산소 분자군 (O2 gas atoms)
    const oxygenAtoms = [];
    for (let i = 0; i < 14; i++) {
      const oGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const oMesh = new THREE.Mesh(oGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      oMesh.position.set(-5.0 + (i % 7) * 1.6, 1.4 + Math.floor(i / 7) * 1.0, -2.5 + Math.random() * 5.0);
      oMesh.userData = { initY: oMesh.position.y };
      group.add(oMesh);
      oxygenAtoms.push(oMesh);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('02. 열산화: P-Si 기판 위에 분홍색 게이트 산화막(SiO₂) 균일 성장', '#00f0ff');
    titleSprite.position.set(0, 2.7, 0);
    group.add(titleSprite);

    const toxSprite = createTextSprite('Tox = 20nm 분홍색 절연막 (SiO₂ / Cox = εox / Tox)', '#ec4899');
    toxSprite.scale.set(3.8, 0.7, 1.0);
    toxSprite.position.set(0, 0.2, 4.2);
    group.add(toxSprite);

    animObjects.push({
      type: 'p02_micro',
      sub: sub,
      oxide: oxide,
      oxygenAtoms: oxygenAtoms
    });
  }

  // p03. 03. 포토리소그래피 단면 미세 뷰: 분홍색 산화막 위에 노란색 PR 도포 ➔ 노광 ➔ 현상(PR만 용해)
  function buildMicroP03EUVLithography(group) {
    const sub = createBasePSiSubstrate(group, -1.7);

    // p02에서 성장한 분홍색 열산화막 (SiO2) - 전면에 온전히 깔려 있음 (두께 0.3, Y = -0.55)
    const oxide = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.3, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    oxide.position.y = -0.55;
    group.add(oxide);

    // 분홍색 산화막 위에 직접 도포된 노란색 감광제(PR) 3분할 블록 (두께 0.8, Y = 0.0)
    // 좌측 감광제 (EUV 노광 시 보라색 잠상 반응 ➔ 현상액에 용해)
    const prLeft = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.8, 7.6),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, roughness: 0.25 })
    );
    prLeft.position.set(-3.6, 0.0, 0);
    group.add(prLeft);

    // 우측 감광제 (EUV 노광 시 보라색 잠상 반응 ➔ 현상액에 용해)
    const prRight = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.8, 7.6),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, roughness: 0.25 })
    );
    prRight.position.set(3.6, 0.0, 0);
    group.add(prRight);

    // 중앙 게이트 감광제 블록 (상부 마스크 차광체로 빛 차단 ➔ 비노광 유지 ➔ 현상 후에도 온전히 보존되어 게이트 마스크 형성)
    const centerPR = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 7.6),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, roughness: 0.25 })
    );
    centerPR.position.set(0, 0.0, 0);
    group.add(centerPR);

    // 상부 포토마스크(레티클) 어셈블리 (Y = 2.4)
    const reticleGroup = new THREE.Group();
    // 중앙 크롬(Cr) 차광 패턴 (폭 1.8 = 게이트 선폭 Lg)
    const maskCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 7.8), matDarkTrim);
    maskCenter.position.set(0, 2.4, 0);
    reticleGroup.add(maskCenter);

    // 외곽 지지 프레임
    const maskFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 7.8), matDarkTrim);
    maskFrameL.position.set(-5.8, 2.4, 0);
    reticleGroup.add(maskFrameL);
    const maskFrameR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 7.8), matDarkTrim);
    maskFrameR.position.set(5.8, 2.4, 0);
    reticleGroup.add(maskFrameR);

    group.add(reticleGroup);

    // 마스크 개구부를 통과하는 좌/우 13.5nm EUV 슬릿 빔속 (초기에는 꺼짐)
    const beamL = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 1.8, 7.6),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    beamL.position.set(-3.6, 1.3, 0);
    beamL.visible = false;
    group.add(beamL);

    const beamR = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 1.8, 7.6),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    beamR.position.set(3.6, 1.3, 0);
    beamR.visible = false;
    group.add(beamR);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('03. 포토리소그래피: 노란 PR ➔ 빛 받은 부위 초록색 변색 ➔ 현상액에 용해', '#f59e0b');
    titleSprite.position.set(0, 3.5, 0);
    group.add(titleSprite);

    const prSprite = createTextSprite('노란색: 비노광 PR (마스크 보호) / 초록색: 노광 반응 PR (현상액 용해)', '#22c55e');
    prSprite.scale.set(4.2, 0.65, 1.0);
    prSprite.position.set(0, 2.7, 0);
    group.add(prSprite);

    animObjects.push({
      type: 'p03_micro',
      centerPR: centerPR,
      prLeft: prLeft,
      prRight: prRight,
      beamL: beamL,
      beamR: beamR
    });
  }

  // p04. 04. 플라즈마 건식 식각 단면 미세 뷰: 좌/우 분홍색 산화막 90도 식각 ➔ 잔류 노란색 PR 애싱 제거
  function buildMicroP04PlasmaEtch(group) {
    const sub = createBasePSiSubstrate(group, -1.7);

    // 중앙 게이트 위치의 분홍색 산화막 (SiO2)
    const centerOxide = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.3, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    centerOxide.position.set(0, -0.55, 0);
    group.add(centerOxide);

    // 중앙 산화막 위에 남아있는 노란색 PR 마스크 기둥 (차후 산소 애싱으로 태워 제거)
    const centerPR = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95, roughness: 0.25 })
    );
    centerPR.position.set(0, 0.0, 0);
    group.add(centerPR);

    // 좌/우 플라즈마에 노출되어 깎여나가는 분홍색 산화막 층
    const oxideLeft = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.3, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    oxideLeft.position.set(-3.6, -0.55, 0);
    group.add(oxideLeft);

    const oxideRight = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.3, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    oxideRight.position.set(3.6, -0.55, 0);
    group.add(oxideRight);

    // 게이트 양측벽 수직 보호막 (C4F8 고분자 폴리머 피막 - 수평 언더컷 완전 차단)
    const passL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.6, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 })
    );
    passL.position.set(-0.96, -0.4, 0);
    group.add(passL);

    const passR = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.6, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 })
    );
    passR.position.set(0.96, -0.4, 0);
    group.add(passR);

    // 좌/우 수직 하강하는 고에너지 할로겐 이온 빔 (CF4 플라즈마 양이온 화살표들)
    const ionArrowsL = [];
    const ionArrowsR = [];
    for (let i = 0; i < 5; i++) {
      const arrL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      arrL.position.set(-4.5 + i * 0.5, 1.6, -2.5 + (i % 3) * 2.5);
      group.add(arrL);
      ionArrowsL.push(arrL);

      const arrR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      arrR.position.set(2.5 + i * 0.5, 1.6, -2.5 + (i % 3) * 2.5);
      group.add(arrR);
      ionArrowsR.push(arrR);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('04. 플라즈마 식각: 좌/우 분홍색 산화막 깎아내기 ➔ 노란색 PR 애싱', '#0a84ff');
    titleSprite.position.set(0, 3.4, 0);
    group.add(titleSprite);

    const passSprite = createTextSprite('중앙 PR 마스크 보호 / 좌우 산화막 식각 ➔ 실리콘 기판 노출', '#10b981');
    passSprite.scale.set(3.8, 0.65, 1.0);
    passSprite.position.set(0, 1.6, 0);
    group.add(passSprite);

    animObjects.push({
      type: 'p04_micro',
      centerPR: centerPR,
      oxideLeft: oxideLeft,
      oxideRight: oxideRight,
      passL: passL,
      passR: passR,
      ionArrowsL: ionArrowsL,
      ionArrowsR: ionArrowsR
    });
  }

  // p05. 05. 이온 주입 & RTA 단면 미세 뷰: 산화막 자체 차폐(Self-Aligned) ➔ 좌/우 n+ 소스/드레인 완성
  function buildMicroP05IonImplant(group) {
    const sub = createBasePSiSubstrate(group, -1.7);

    // 04번 식각으로 완성된 중앙의 분홍색 게이트 산화막 기둥 (천연 이온 차폐 방패 역할!)
    const gateOx = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.3, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    gateOx.position.set(0, -0.55, 0);
    group.add(gateOx);

    // 좌측 소스 영역 (초기 레드 격자 손상 ➔ 1050°C RTA 활성화 시 고전도도 시안 n+ 영역)
    const dopantL = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 7.6),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, emissive: 0x000000 })
    );
    dopantL.position.set(-3.5, -0.65, 0);
    group.add(dopantL);

    // 우측 드레인 영역 (초기 레드 격자 손상 ➔ RTA 활성화 시 시안 n+)
    const dopantR = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 7.6),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, emissive: 0x000000 })
    );
    dopantR.position.set(3.5, -0.65, 0);
    group.add(dopantR);

    // 전면에서 수직 하강하는 비소(As+) 이온 빔 샤워 (중앙 산화막이 채널을 자체 차폐!)
    const ions = [];
    for (let i = 0; i < 18; i++) {
      const iMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff9f0a }));
      const x = -5.0 + i * 0.6;
      iMesh.position.set(x, 1.8 + Math.random() * 0.8, -3.0 + Math.random() * 6.0);
      group.add(iMesh);
      ions.push(iMesh);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('05. 셀프 얼라인(Self-Aligned) 소스/드레인 이온 주입 & 1050°C RTA 활성화', '#ff9f0a');
    titleSprite.position.set(0, 3.2, 0);
    group.add(titleSprite);

    const maskNotice = createTextSprite('중앙 분홍색 산화막이 채널을 차폐하여 좌/우에만 이온 주입!', '#38bdf8');
    maskNotice.scale.set(4.0, 0.65, 1.0);
    maskNotice.position.set(0, 1.4, 0);
    group.add(maskNotice);

    const sSprite = createTextSprite('[S] Source (n⁺)', '#00f0ff');
    sSprite.scale.set(2.4, 0.6, 1.0);
    sSprite.position.set(-3.5, 0.3, 4.2);
    group.add(sSprite);

    const dSprite = createTextSprite('[D] Drain (n⁺)', '#00f0ff');
    dSprite.scale.set(2.4, 0.6, 1.0);
    dSprite.position.set(3.5, 0.3, 4.2);
    group.add(dSprite);

    animObjects.push({
      type: 'p05_micro',
      sub: sub,
      dopantL: dopantL,
      dopantR: dopantR,
      ions: ions
    });
  }

  // p06. 06. ALD 박막 증착 단면 미세 뷰: 게이트 전극 & 금속 접촉층을 쌓아 3단자 MOSFET 완성!
  function buildMicroP06ALDThinFilm(group) {
    const sub = createBasePSiSubstrate(group, -1.7);

    // 05단계에서 완성된 n+ 소스 및 드레인 영역 (시안/에메랄드 고전도도 영역)
    const sRegion = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3, emissive: 0x004455, emissiveIntensity: 0.3 })
    );
    sRegion.position.set(-3.5, -0.65, 0);
    group.add(sRegion);

    const dRegion = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.3, emissive: 0x004455, emissiveIntensity: 0.3 })
    );
    dRegion.position.set(3.5, -0.65, 0);
    group.add(dRegion);

    // 중앙 게이트 산화막 (분홍색, Tox=20nm)
    const gateOx = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.25, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.85, roughness: 0.15 })
    );
    gateOx.position.set(0, -0.58, 0);
    group.add(gateOx);

    // ★ 여기에 뭘 쌓는가? 1. 게이트 금속 전극 (TiN / Tungsten W, 황금빛 전도체)
    const metalGate = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 7.8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 })
    );
    metalGate.position.set(0, -0.05, 0);
    group.add(metalGate);

    // ★ 여기에 뭘 쌓는가? 2. 게이트 측벽 절연 스페이서 (Si3N4 Spacers: 게이트와 S/D 쇼트 방지)
    const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 7.8), matDarkTrim);
    spL.position.set(-1.08, -0.05, 0);
    group.add(spL);
    const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 7.8), matDarkTrim);
    spR.position.set(1.08, -0.05, 0);
    group.add(spR);

    // ★ 여기에 뭘 쌓는가? 3. 소스/드레인 금속 접촉 패드 (Ohmic Silicide Contact Pads)
    const sPad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 4.0), matSteel);
    sPad.position.set(-3.5, -0.35, 0);
    group.add(sPad);

    const dPad = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 4.0), matSteel);
    dPad.position.set(3.5, -0.35, 0);
    group.add(dPad);

    // 게이트 상부 전극 패드
    const gPad = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 4.0), matSteel);
    gPad.position.set(0, 0.45, 0);
    group.add(gPad);

    // 하강하는 금속 전구체 원자들 (ALD 증착 분자)
    const precursors = [];
    for (let i = 0; i < 16; i++) {
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      pMesh.position.set(-4.0 + (i % 8) * 1.1, 1.6 + Math.floor(i / 8) * 0.7, -2.5 + Math.random() * 5.0);
      pMesh.userData = { initY: pMesh.position.y };
      group.add(pMesh);
      precursors.push(pMesh);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('06. 박막 증착 (ALD): 게이트 전극 & 접촉 금속을 쌓아 3단자 MOSFET 완성!', '#c084fc');
    titleSprite.position.set(0, 3.4, 0);
    group.add(titleSprite);

    const whatWeDoSprite = createTextSprite('산화막 위에 금속 게이트(황금색) + 소스/드레인 위에 금속 패드 증착!', '#38bdf8');
    whatWeDoSprite.scale.set(4.2, 0.65, 1.0);
    whatWeDoSprite.position.set(0, 2.7, 0);
    group.add(whatWeDoSprite);

    const termS = createTextSprite('[S] Source 전극', '#00f0ff');
    termS.scale.set(2.0, 0.55, 1.0);
    termS.position.set(-3.5, 0.2, 0);
    group.add(termS);

    const termG = createTextSprite('[G] Gate 전극', '#f59e0b');
    termG.scale.set(2.0, 0.55, 1.0);
    termG.position.set(0, 0.9, 0);
    group.add(termG);

    const termD = createTextSprite('[D] Drain 전극', '#00f0ff');
    termD.scale.set(2.0, 0.55, 1.0);
    termD.position.set(3.5, 0.2, 0);
    group.add(termD);

    animObjects.push({
      type: 'p06_micro',
      metalGate: metalGate,
      spL: spL,
      spR: spR,
      sPad: sPad,
      dPad: dPad,
      gPad: gPad,
      termS: termS,
      termG: termG,
      termD: termD,
      precursors: precursors
    });
  }

  // p07. 07. BEOL 15층 구리 다층 배선 단면 미세 뷰: 이웃한 트랜지스터들을 연결해 CMOS 논리 회로 조직!
  function buildMicroP07BEOL15LayerStack(group) {
    // 최하단 P-Si 기판 베이스 (Y = -2.8 ~ -2.0)
    const subBase = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 })
    );
    subBase.position.y = -2.5;
    group.add(subBase);

    // ★ 기판 위에 나란히 배치된 2개의 MOSFET 트랜지스터 (TR-1 & TR-2)
    // [트랜지스터 1: 좌측]
    const tr1Group = new THREE.Group();
    tr1Group.position.set(-3.2, -2.2, 0);
    const tr1S = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x00f0ff }));
    tr1S.position.set(-1.0, 0, 0);
    tr1Group.add(tr1S);
    const tr1G = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    tr1G.position.set(0, 0.05, 0);
    tr1Group.add(tr1G);
    const tr1D = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x00f0ff }));
    tr1D.position.set(1.0, 0, 0);
    tr1Group.add(tr1D);
    group.add(tr1Group);

    // [트랜지스터 2: 우측]
    const tr2Group = new THREE.Group();
    tr2Group.position.set(3.2, -2.2, 0);
    const tr2S = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x00f0ff }));
    tr2S.position.set(-1.0, 0, 0);
    tr2Group.add(tr2S);
    const tr2G = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    tr2G.position.set(0, 0.05, 0);
    tr2Group.add(tr2G);
    const tr2D = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x00f0ff }));
    tr2D.position.set(1.0, 0, 0);
    tr2Group.add(tr2D);
    group.add(tr2Group);

    // 텅스텐 컨택 플러그 (Contact Plugs CA): TR-1의 드레인과 TR-2의 게이트에서 위로 상승
    const plug1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), matSteel);
    plug1.position.set(-2.2, -1.85, 0);
    group.add(plug1);

    const plug2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), matSteel);
    plug2.position.set(3.2, -1.85, 0);
    group.add(plug2);

    // ★ 1층(M1) 배선: TR-1의 드레인(출력)과 TR-2의 게이트(입력)를 가로로 직결 연결!
    // 이것이 바로 반도체 컴퓨터의 심장인 '인버터(NOT 게이트)' 회로의 탄생!
    const m1Bridge = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.14, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x00f0ff, emissiveIntensity: 0.6 })
    );
    m1Bridge.position.set(0.5, -1.6, 0);
    group.add(m1Bridge);

    // 15개 층간 배선 레이어 (M1 ~ M15) 및 층간 절연막(ILD)
    const layers = [];
    for (let i = 0; i < 15; i++) {
      const lGroup = new THREE.Group();
      const y = -1.55 + i * 0.28;
      const isM15 = (i === 14);

      // Low-k ILD 절연막 매트릭스
      const ild = new THREE.Mesh(
        new THREE.BoxGeometry(11.5, 0.24, 7.6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.45, roughness: 0.8 })
      );
      ild.position.y = y;
      lGroup.add(ild);

      // 구리 배선 라인들 (M1~M4 미세 피치, M11~M15 전원/클럭 두꺼운 라인)
      const wireCount = (i < 4) ? 8 : (i < 10) ? 5 : 3;
      const wireThick = (i < 4) ? 0.08 : (i < 10) ? 0.12 : 0.2;
      const wireWidth = (i < 4) ? 0.4 : (i < 10) ? 0.8 : 1.6;

      for (let w = 0; w < wireCount; w++) {
        const wire = new THREE.Mesh(
          new THREE.BoxGeometry(wireWidth, wireThick, 7.2),
          new THREE.MeshStandardMaterial({
            color: isM15 ? 0xf59e0b : 0xd97706,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0xd97706,
            emissiveIntensity: 0.15
          })
        );
        wire.position.set(-4.5 + w * (9.0 / (wireCount - 1 || 1)), y, 0);
        lGroup.add(wire);
      }

      // 층간 비아(Via)
      if (i > 0) {
        for (let v = 0; v < 4; v++) {
          const via = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 8), matSteel);
          via.position.set(-3.5 + v * 2.3, y - 0.14, -2.0 + (v % 2) * 4.0);
          lGroup.add(via);
        }
      }

      group.add(lGroup);
      layers.push(lGroup);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('07. BEOL 15층 배선: 이웃 트랜지스터들을 연결해 거대 CPU/GPU 연산 회로 구축!', '#00f0ff');
    titleSprite.position.set(0, 3.4, 0);
    group.add(titleSprite);

    const m1Sprite = createTextSprite('★ 1층(M1): TR-1 드레인 ➔ TR-2 게이트 직결 (CMOS 인버터 논리 회로 완성!)', '#38bdf8');
    m1Sprite.scale.set(4.5, 0.65, 1.0);
    m1Sprite.position.set(0, 2.7, 0);
    group.add(m1Sprite);

    const m15Sprite = createTextSprite('★ 15층(M15): 칩 전체 VDD/VSS 전원망 & 클럭 그리드 ➔ 패키지 범프 연결', '#f59e0b');
    m15Sprite.scale.set(4.4, 0.65, 1.0);
    m15Sprite.position.set(0, 2.1, 0);
    group.add(m15Sprite);

    animObjects.push({
      type: 'beol_playback',
      layers: layers
    });
  }

  // p08. 08. CMP 화학기계적 연마 단면 미세 뷰: 최상층 구리 언덕 평탄화 (Zero Dishing)
  function buildMicroP08CMPPlanarization(group) {
    // 하부 다층 배선 스택 기저 (Y = -2.6 ~ -0.4)
    const baseStack = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    baseStack.position.y = -1.2;
    group.add(baseStack);

    // M15 유전체 평탄면
    const flatSurface = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.1 })
    );
    flatSurface.position.y = -0.35;
    group.add(flatSurface);

    // 도금 직후 돌출된 과도금 구리 언덕 4개 (CMP 패드에 의해 점진적 연마 제거)
    const cuMounds = [];
    for (let mx of [-4.0, -1.3, 1.3, 4.0]) {
      const mound = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 7.6),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 })
      );
      mound.position.set(mx, 0.0, 0);
      group.add(mound);
      cuMounds.push(mound);
    }

    // 상부 CMP 폴리우레탄 연마 패드 (미세 다공성 홈 구조)
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(13, 0.5, 8.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.8 })
    );
    pad.position.y = 1.6;
    group.add(pad);

    // 나노 슬러리 화학액 흐름층
    const slurry = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 0.2, 8.2),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.4 })
    );
    slurry.position.y = 0.4;
    group.add(slurry);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('08. CMP 평탄화 (과도금 구리 제거 & Zero Dishing)', '#00f0ff');
    titleSprite.position.set(0, 2.9, 0);
    group.add(titleSprite);

    const epdSprite = createTextSprite('실시간 EPD 종말점 (단차 < 1nm)', '#38bdf8');
    epdSprite.scale.set(3.0, 0.65, 1.0);
    epdSprite.position.set(0, 0.8, 4.2);
    group.add(epdSprite);

    animObjects.push({
      type: 'p08_micro',
      pad: pad,
      cuMounds: cuMounds,
      slurry: slurry
    });
  }

  // p09. 09. 웨이퍼 테스트(EDS) 단면 미세 뷰: 텅스텐 프로브 니들 스크러빙 & PASS/FAIL 판정
  function buildMicroP09EDSProber(group) {
    // 완성된 웨이퍼 다이 표면 (Y = -1.5)
    const dieSurface = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    dieSurface.position.y = -1.2;
    group.add(dieSurface);

    // 4개의 알루미늄/구리 테스트 프로브 패드
    const pads = [];
    for (let px of [-3.6, -1.2, 1.2, 3.6]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), matSteel);
      pad.position.set(px, -0.54, 0);
      group.add(pad);
      pads.push(pad);
    }

    // 4개의 캔틸레버 텅스텐 프로브 카드 니들
    const needles = [];
    for (let nx of [-3.6, -1.2, 1.2, 3.6]) {
      const nGroup = new THREE.Group();
      const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), matSteel);
      shank.rotation.z = 0.25;
      shank.position.set(0.2, 1.0, 0);
      nGroup.add(shank);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 8), matSteel);
      tip.position.set(0, 0.2, 0);
      nGroup.add(tip);
      nGroup.position.set(nx, 0.5, 0);
      group.add(nGroup);
      needles.push(nGroup);
    }

    // 대형 디지털 양품 판정 LED 디스플레이
    const passLed = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.8, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0.2 })
    );
    passLed.position.set(0, 2.0, -2.5);
    group.add(passLed);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('09. EDS 웨이퍼 프로빙 (Vth, Ion 전기적 양품 선별)', '#0a84ff');
    titleSprite.position.set(0, 3.0, 0);
    group.add(titleSprite);

    const kgdSprite = createTextSprite('Known Good Die (KGD) 양품 보증', '#30d158');
    kgdSprite.scale.set(3.2, 0.65, 1.0);
    kgdSprite.position.set(0, 1.2, 0);
    group.add(kgdSprite);

    animObjects.push({
      type: 'p09_micro',
      needles: needles,
      passLed: passLed
    });
  }

  // p10. 10. 백그라인딩 & 다이싱 단면 미세 뷰: 웨이퍼 반전, 775um ➔ 30um 박형화 & 스텔스 레이저 절단
  function buildMicroP10GrindingDicing(group) {
    // 회로 전면을 보호하는 청색 UV 다이싱 테이프 (상부 Y = 0.8)
    const tape = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    tape.position.y = 0.8;
    group.add(tape);

    // 반전된 실리콘 벌크 기판 (백그라인딩에 의해 775um에서 30um로 연삭 박형화)
    const waferBulk = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 })
    );
    waferBulk.position.y = -0.1;
    group.add(waferBulk);

    // 회전 다이아몬드 연삭 휠 (하부에서 실리콘 후면을 연삭)
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 24), matSteel);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0, -1.4, 0);
    group.add(wheel);

    // 스텔스 다이싱 레이저 크랙선 (다이 경계면 분할)
    const laserCrack = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.8, 8.2),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.0 })
    );
    laserCrack.position.set(0, 0.0, 0);
    group.add(laserCrack);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('10. 백그라인딩 (775µm➔30µm) & 스텔스 레이저 절단', '#38bdf8');
    titleSprite.position.set(0, 2.8, 0);
    group.add(titleSprite);

    const thinSprite = createTextSprite('초박형 30µm 실리콘 (HBM TSV용)', '#00f0ff');
    thinSprite.scale.set(3.0, 0.65, 1.0);
    thinSprite.position.set(0, -1.8, 4.2);
    group.add(thinSprite);

    animObjects.push({
      type: 'p10_micro',
      waferBulk: waferBulk,
      wheel: wheel,
      laserCrack: laserCrack
    });
  }

  // p11. 11. 플립칩 다이 어태치 & 본딩 단면 미세 뷰: 25um 마이크로범프 리플로우
  function buildMicroP11FlipChip(group) {
    // 패키지 PCB 기판 (하단 녹색 기판, Y = -1.8)
    const sub = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 })
    );
    sub.position.y = -1.8;
    group.add(sub);

    // 패키지 기판 구리 랜드 패드들
    for (let bx of [-3.6, -1.2, 1.2, 3.6]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), matSteel);
      pad.position.set(bx, -1.35, 0);
      group.add(pad);
    }

    // 하강하는 30um 초박형 실리콘 다이 (MOSFET 회로 내장)
    const topDie = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    topDie.position.y = 1.2;
    group.add(topDie);

    // 4개의 Sn-Ag-Cu 마이크로범프 (리플로우 용융 접합)
    const bumps = [];
    for (let bx of [-3.6, -1.2, 1.2, 3.6]) {
      const bump = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 })
      );
      bump.position.set(bx, 0.6, 0);
      group.add(bump);
      bumps.push(bump);
    }

    // 3D 정보 라벨
    const titleSprite = createTextSprite('11. 플립칩 마이크로범프 본딩 (L < 0.1nH 달성)', '#8b5cf6');
    titleSprite.position.set(0, 2.9, 0);
    group.add(titleSprite);

    const bumpSprite = createTextSprite('25µm 마이크로범프 리플로우 접합', '#c084fc');
    bumpSprite.scale.set(3.0, 0.65, 1.0);
    bumpSprite.position.set(0, -0.6, 4.2);
    group.add(bumpSprite);

    animObjects.push({
      type: 'p11_micro',
      topDie: topDie,
      bumps: bumps
    });
  }

  // p12. 12. 몰딩 & SLT 테스트 단면 미세 뷰: 액상 EMC 에폭시 보이디리스 사출 및 밀봉
  function buildMicroP12EMCMolding(group) {
    // 기판 및 안착된 실리콘 다이
    const sub = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 10), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 }));
    sub.position.y = -1.8;
    group.add(sub);

    const chip = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    chip.position.y = -1.2;
    group.add(chip);

    // 사출 충진되는 액상 EMC 에폭시 몰딩 수지 (블랙 세라믹 외피)
    const emcResin = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.1, transparent: true, opacity: 0.88 })
    );
    emcResin.position.set(0, -0.6, 0);
    emcResin.scale.x = 0.01;
    group.add(emcResin);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('12. EMC 에폭시 몰딩 (보이디리스 밀봉 & 방열 보호)', '#ff9f0a');
    titleSprite.position.set(0, 2.8, 0);
    group.add(titleSprite);

    const emcSprite = createTextSprite('구형 실리카 필러 함유 EMC 수지', '#cbd5e1');
    emcSprite.scale.set(3.0, 0.65, 1.0);
    emcSprite.position.set(0, -0.6, 4.5);
    group.add(emcSprite);

    animObjects.push({
      type: 'p12_micro',
      emcResin: emcResin
    });
  }

  // p13. 13. HBM 3D 적층 단면 미세 뷰: 베이스 다이 + 8단 D램 TSV 초광대역(1.2 TB/s) 적층
  function buildMicroP13HBM3DStack(group) {
    // 1. 베이스 로직 버퍼 다이 (Base Die)
    const baseDie = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.65, 7.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 })
    );
    baseDie.position.y = -2.8;
    group.add(baseDie);

    // 2. 8단 적층 D램 코어 다이들
    const dramDies = [];
    const tsvCols = [];
    const mufLayers = [];

    for (let i = 0; i < 8; i++) {
      const yPos = -2.8 + (i + 1) * 0.54;
      const dMesh = new THREE.Mesh(
        new THREE.BoxGeometry(8.8, 0.38, 7.0),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 })
      );
      dMesh.position.y = yPos;
      dMesh.visible = false;
      group.add(dMesh);
      dramDies.push(dMesh);

      // MR-MUF 언더필 층
      const muf = new THREE.Mesh(
        new THREE.BoxGeometry(8.9, 0.16, 7.1),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.0 })
      );
      muf.position.y = yPos - 0.27;
      group.add(muf);
      mufLayers.push(muf);

      // 1024-bit TSV 구리 컬럼들 (4개 대표 기둥)
      const colGroup = [];
      for (let tx of [-2.8, -0.9, 0.9, 2.8]) {
        const tsv = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.54, 12), matSteel);
        tsv.position.set(tx, yPos, 0);
        group.add(tsv);
        colGroup.push(tsv);
      }
      tsvCols.push(colGroup);
    }

    // 상부 열압착 본딩 툴 (TCB Tool Head)
    const bondTool = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.0, 1.2, 16), matAmberGlow);
    bondTool.position.y = 4.0;
    group.add(bondTool);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('13. HBM 8단 3D TSV 적층 (1024-bit / 1.2 TB/s)', '#00f0ff');
    titleSprite.position.set(0, 3.6, 0);
    group.add(titleSprite);

    const busSprite = createTextSprite('1024-bit TSV 초광대역 버스', '#38bdf8');
    busSprite.scale.set(3.0, 0.65, 1.0);
    busSprite.position.set(0, 0.0, 4.2);
    group.add(busSprite);

    animObjects.push({
      type: 'hbm_playback',
      dramDies: dramDies,
      mufLayers: mufLayers,
      bondTool: bondTool,
      tsvCols: tsvCols
    });
  }

  // p14. 14. 2.5D 인터포저 & 칩렛 단면 미세 뷰: 실리콘 인터포저 위에 GPU + HBM3e 이종 집적
  function buildMicroP1425DInterposer(group) {
    // 대형 패키지 BGA 유기 기판 (Y = -3.2)
    const sub = new THREE.Mesh(
      new THREE.BoxGeometry(16, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a2e26, metalness: 0.4, roughness: 0.6 })
    );
    sub.position.y = -3.2;
    group.add(sub);

    // 서브마이크론 RDL 실리콘 인터포저 기판 (Y = -2.3)
    const interposer = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.45, 10),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    interposer.position.y = -2.3;
    group.add(interposer);

    // 중앙 AI 가속기 로직 다이 (GPU / NPU)
    const gpu = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 1.2, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.85, roughness: 0.25 })
    );
    gpu.position.set(0, -1.2, 0);
    group.add(gpu);

    // 좌/우 HBM 큐브 메모리 스택 2기
    const hbms = [];
    for (let side of [-4.5, 4.5]) {
      const hbm = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 2.4, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.7, roughness: 0.3 })
      );
      hbm.position.set(side, -0.6, 0);
      group.add(hbm);
      hbms.push(hbm);
    }

    // 초미세 RDL 배선층 (GPU와 HBM 간 고속 신호 전송 라인)
    const rdl = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.06, 1.4),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    rdl.position.set(0, -2.04, 0);
    group.add(rdl);

    // 3D 정보 라벨
    const titleSprite = createTextSprite('14. 2.5D CoWoS 인터포저 이종 집적 (GPU + HBM)', '#c084fc');
    titleSprite.position.set(0, 3.6, 0);
    group.add(titleSprite);

    const gpuSprite = createTextSprite('AI GPU Host Logic', '#10b981');
    gpuSprite.scale.set(2.4, 0.6, 1.0);
    gpuSprite.position.set(0, -0.3, 3.2);
    group.add(gpuSprite);

    const hbmSprite = createTextSprite('HBM3e 3D Stack', '#8b5cf6');
    hbmSprite.scale.set(2.4, 0.6, 1.0);
    hbmSprite.position.set(-4.5, 1.0, 2.5);
    group.add(hbmSprite);

    animObjects.push({
      type: 'interposer_playback',
      gpu: gpu,
      hbms: hbms,
      rdl: rdl
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🔬 소자 진화 3D 모델 빌더 (Planar vs FinFET vs GAA Nanosheet)
  // ═══════════════════════════════════════════════════════════════════════
  function buildTransistorEvolutionModel(mode) {
    const modelGroup = new THREE.Group();
    switch (mode) {
      case 'planar':
        buildEvoPlanarModel(modelGroup);
        break;
      case 'finfet':
        buildEvoFinFetModel(modelGroup);
        break;
      case 'gaa':
      default:
        buildEvoGaaModel(modelGroup);
        break;
    }
    mainGroup.add(modelGroup);
  }

  // ─────────────────────────────────────────────────────────────────
  // ① 2D Planar MOSFET 모델 (상단 1면 게이트 제어 & 기판 바닥 누설)
  // ─────────────────────────────────────────────────────────────────
  function buildEvoPlanarModel(group) {
    // 1. P-type Silicon Substrate (기판 바닥)
    const sub = createBasePSiSubstrate(group, -1.8);

    const grid = new THREE.GridHelper(10, 10, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.89;
    group.add(grid);

    // 2. Source & Drain (n⁺ 고농도 도핑 평면 영역)
    const sMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });
    const dMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });

    const sRegion = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 6.4), sMat);
    sRegion.position.set(-3.2, -0.55, 0);
    group.add(sRegion);

    const dRegion = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 6.4), dMat);
    dRegion.position.set(3.2, -0.55, 0);
    group.add(dRegion);

    // S/D Metallic Contact Pads (Ohmic contacts)
    const sPad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 4.4), matSteel);
    sPad.position.set(-3.2, -0.1, 0);
    group.add(sPad);

    const dPad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 4.4), matSteel);
    dPad.position.set(3.2, -0.1, 0);
    group.add(dPad);

    // 3. 중앙 채널 & 반전층 (상단 1개 면에만 얇게 형성되는 전자 반전층)
    const invMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.95
    });
    const invLayer = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 6.4), invMat);
    invLayer.position.set(0, -0.24, 0);
    group.add(invLayer);

    // 4. 게이트 산화막 (SiO₂, Tox=20nm, 분홍색 투명막) - 상단 1면에만 존재
    const oxMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
      emissive: 0x831843,
      emissiveIntensity: 0.3
    });
    const gateOx = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 6.4), oxMat);
    gateOx.position.set(0, -0.09, 0);
    group.add(gateOx);

    // 5. 황금빛 메탈 게이트 (상단 1면에만 적층)
    const gateMat = isCutawayActive
      ? new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.9 })
      : new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.95 });

    const metalGate = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 6.4), gateMat);
    metalGate.position.set(0, 0.62, 0);
    group.add(metalGate);

    // 게이트 전극 상부 패드
    const gPad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 4.0), matSteel);
    gPad.position.set(0, 1.32, 0);
    group.add(gPad);

    // 측벽 절연 스페이서 (Si3N4 Spacers)
    const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 6.4), matDarkTrim);
    spL.position.set(-1.47, 0.62, 0);
    group.add(spL);
    const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 6.4), matDarkTrim);
    spR.position.set(1.47, 0.62, 0);
    group.add(spR);

    // 6. 상단 1면 전계 제어 화살표 (오직 위에서 아래로만 작용)
    for (let f = -2.0; f <= 2.0; f += 1.0) {
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 8),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      arrow.rotation.x = Math.PI;
      arrow.position.set(0, 0.12, f);
      group.add(arrow);
    }

    // 7. 동적 전자 캐리어 & 기판 바닥 누설전류 파티클
    const surfaceElectrons = [];
    for (let i = 0; i < 20; i++) {
      const eMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      eMesh.position.set(-2.5 + Math.random() * 5.0, -0.22, -2.6 + Math.random() * 5.2);
      group.add(eMesh);
      surfaceElectrons.push(eMesh);
    }

    // 🔴 붉은색 기판 깊은 바닥 누설전류 (Subsurface Leakage / Punch-through)
    const leakageParticles = [];
    const leakMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let k = 0; k < 22; k++) {
      const lp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), leakMat);
      lp.position.set(2.8 - Math.random() * 5.6, -1.1 - Math.random() * 0.6, -2.4 + Math.random() * 4.8);
      group.add(lp);
      leakageParticles.push(lp);
    }

    // 바닥 펀치스루 누설 가이드라인 (붉은 점선 트랙)
    for (let zOffset = -1.8; zOffset <= 1.8; zOffset += 1.8) {
      const curveGeo = new THREE.BoxGeometry(5.2, 0.06, 0.06);
      const curveMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 });
      const line = new THREE.Mesh(curveGeo, curveMat);
      line.position.set(0, -1.35, zOffset);
      group.add(line);
    }

    // 8. 3D 정보 라벨
    const titleSprite = createTextSprite('2D Planar MOSFET: 상단 1면만 게이트 제어 (28nm 한계)', '#38bdf8');
    titleSprite.position.set(0, 3.4, 0);
    group.add(titleSprite);

    const subSprite = createTextSprite('게이트가 위(1면)에서만 제어 ➔ 스케일 다운 시 채널 하부로 누설전류(DIBL) 발생!', '#f59e0b');
    subSprite.position.set(0, 2.7, 0);
    group.add(subSprite);

    const leakSprite = createTextSprite('🔴 바닥 누설전류 (Punch-through): 게이트 전계 미도달 ➔ 기판 깊은 곳으로 누설!', '#ef4444');
    leakSprite.position.set(0, -2.5, 0);
    group.add(leakSprite);

    const sSprite = createTextSprite('[S] Source (n⁺)', '#00f0ff');
    sSprite.position.set(-3.2, 0.45, 0);
    sSprite.scale.set(2.4, 0.55, 1);
    group.add(sSprite);

    const dSprite = createTextSprite('[D] Drain (n⁺)', '#00f0ff');
    dSprite.position.set(3.2, 0.45, 0);
    dSprite.scale.set(2.4, 0.55, 1);
    group.add(dSprite);

    const gSprite = createTextSprite('[G] Top Gate (1면)', '#f59e0b');
    gSprite.position.set(0, 1.85, 0);
    gSprite.scale.set(2.6, 0.55, 1);
    group.add(gSprite);

    animObjects.push({
      type: 'evolution_playback',
      subMode: 'planar',
      surfaceElectrons: surfaceElectrons,
      leakageParticles: leakageParticles
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ② 3D FinFET 모델 (핀의 좌·상·우 3면 게이트 감싸기 & 바닥 연결 잔존)
  // ─────────────────────────────────────────────────────────────────
  function buildEvoFinFetModel(group) {
    // 1. P-type Silicon Substrate
    const sub = createBasePSiSubstrate(group, -1.8);

    // 2. 3D Silicon Fin (수직 돌출 지느러미 핀 채널)
    const finMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.5
    });
    const fin = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 1.2), finMat);
    fin.position.set(0, 0.2, 0);
    group.add(fin);

    // 3면 반전층 (좌측벽, 천장, 우측벽 3면 글로우 스킨)
    const invTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.06, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.95 })
    );
    invTop.position.set(0, 1.31, 0);
    group.add(invTop);

    const invLeft = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.95 })
    );
    invLeft.position.set(0, 0.4, -0.61);
    group.add(invLeft);

    const invRight = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.95 })
    );
    invRight.position.set(0, 0.4, 0.61);
    group.add(invRight);

    // 3. Source & Drain (Raised Faceted Epitaxy on Left/Right ends)
    const epiMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });
    const sEpi = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.3, 2.2), epiMat);
    sEpi.position.set(-2.8, 0.25, 0);
    group.add(sEpi);

    const dEpi = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.3, 2.2), epiMat);
    dEpi.position.set(2.8, 0.25, 0);
    group.add(dEpi);

    const sPad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.8), matSteel);
    sPad.position.set(-2.8, 1.45, 0);
    group.add(sPad);

    const dPad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.8), matSteel);
    dPad.position.set(2.8, 1.45, 0);
    group.add(dPad);

    // 4. Conformal Gate Oxide (Pink 3면 절연막)
    const oxMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    const oxTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.4), oxMat);
    oxTop.position.set(0, 1.4, 0);
    group.add(oxTop);

    const oxLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 0.15), oxMat);
    oxLeft.position.set(0, 0.35, -0.72);
    group.add(oxLeft);

    const oxRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 0.15), oxMat);
    oxRight.position.set(0, 0.35, 0.72);
    group.add(oxRight);

    // 5. 3면 입체 메탈 게이트 (Tri-Gate: 말안장 형태 inverted U-shape)
    const gateMat = isCutawayActive
      ? new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.9 })
      : new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.95 });

    const gTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 3.6), gateMat);
    gTop.position.set(0, 1.9, 0);
    group.add(gTop);

    const gLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.9), gateMat);
    gLeft.position.set(0, 0.45, -1.35);
    group.add(gLeft);

    const gRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.9), gateMat);
    gRight.position.set(0, 0.45, 1.35);
    group.add(gRight);

    const gContact = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 2.4), matSteel);
    gContact.position.set(0, 2.42, 0);
    group.add(gContact);

    // 6. 3면 전계 제어 화살표 (Left, Top, Right 방향)
    for (let f = -0.8; f <= 0.8; f += 0.8) {
      const aTop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      aTop.rotation.x = Math.PI;
      aTop.position.set(f, 1.55, 0);
      group.add(aTop);

      const aLeft = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      aLeft.rotation.z = -Math.PI / 2;
      aLeft.position.set(f, 0.5, -0.9);
      group.add(aLeft);

      const aRight = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      aRight.rotation.z = Math.PI / 2;
      aRight.position.set(f, 0.5, 0.9);
      group.add(aRight);
    }

    // 7. 🟡 핀 바닥 뿌리 (Sub-Fin Root) 물리적 연결 강조 칼라
    const rootCollar = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.25, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5, transparent: true, opacity: 0.7 })
    );
    rootCollar.position.set(0, -0.8, 0);
    group.add(rootCollar);

    // 8. 동적 전자 캐리어 (3개 경로: Top, Left, Right)
    const finElectrons = [];
    for (let i = 0; i < 24; i++) {
      const eMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      const pathType = i % 3;
      if (pathType === 0) {
        eMesh.position.set(-2.2 + Math.random() * 4.4, 1.31, -0.4 + Math.random() * 0.8);
      } else if (pathType === 1) {
        eMesh.position.set(-2.2 + Math.random() * 4.4, -0.3 + Math.random() * 1.4, -0.61);
      } else {
        eMesh.position.set(-2.2 + Math.random() * 4.4, -0.3 + Math.random() * 1.4, 0.61);
      }
      group.add(eMesh);
      finElectrons.push({ mesh: eMesh, pathType: pathType });
    }

    // 뿌리 잔여 누설 미세 파티클 (붉은색)
    const rootLeakage = [];
    for (let k = 0; k < 6; k++) {
      const lp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      lp.position.set(2.0 - Math.random() * 4.0, -0.85, -0.3 + Math.random() * 0.6);
      group.add(lp);
      rootLeakage.push(lp);
    }

    // 9. 3D 정보 라벨
    const titleSprite = createTextSprite('3D FinFET: 핀의 좌·상·우 3면 게이트 감싸기 (22nm ~ 3nm)', '#f59e0b');
    titleSprite.position.set(0, 3.5, 0);
    group.add(titleSprite);

    const subSprite = createTextSprite('유효 채널 폭(Weff = 2H + W) 2.5배 확대 ➔ 구동전류 폭증 \u0026 DIBL 억제!', '#38bdf8');
    subSprite.position.set(0, 2.8, 0);
    group.add(subSprite);

    const rootSprite = createTextSprite('🟡 핀 바닥 뿌리: 기판과 여전히 연결되어 3nm 이하에서 바닥 누설 한계 봉착!', '#f59e0b');
    rootSprite.position.set(0, -2.1, 0);
    group.add(rootSprite);

    const gSprite = createTextSprite('[G] Tri-Gate (좌·상·우 3면)', '#f59e0b');
    gSprite.position.set(0, 2.85, 0);
    gSprite.scale.set(2.8, 0.55, 1);
    group.add(gSprite);

    animObjects.push({
      type: 'evolution_playback',
      subMode: 'finfet',
      finElectrons: finElectrons,
      rootLeakage: rootLeakage
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // ③ 차세대 GAA Nanosheet 모델 (4면 360° 전방위 밀봉 & 바닥 틈새 충진)
  // ─────────────────────────────────────────────────────────────────
  function buildEvoGaaModel(group) {
    // 1. P-type Silicon Substrate
    const sub = createBasePSiSubstrate(group, -1.9);

    // 2. 바닥 유전체 격리층 (Bottom Dielectric Isolation, BDI)
    // 기판과 최하단 채널 사이를 완전히 단절하여 기판 누설 제로화!
    const bdiMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.4
    });
    const bdi = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.35, 6.0), bdiMat);
    bdi.position.set(0, -0.92, 0);
    group.add(bdi);

    // 3. 3단 공중 부양 실리콘 나노시트 리본 (Suspended Silicon Nanosheets)
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x003344,
      emissiveIntensity: 0.5
    });

    const sheet1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 2.6), sheetMat);
    sheet1.position.set(0, 0.95, 0);
    group.add(sheet1);

    const sheet2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 2.6), sheetMat);
    sheet2.position.set(0, 0.25, 0);
    group.add(sheet2);

    const sheet3 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.22, 2.6), sheetMat);
    sheet3.position.set(0, -0.45, 0);
    group.add(sheet3);

    // 4. Source & Drain (Common Faceted Epitaxy merging all 3 sheets)
    const epiMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });
    const sEpi = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 3.2), epiMat);
    sEpi.position.set(-2.8, 0.25, 0);
    group.add(sEpi);

    const dEpi = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 3.2), epiMat);
    dEpi.position.set(2.8, 0.25, 0);
    group.add(dEpi);

    const sPad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.4), matSteel);
    sPad.position.set(-2.8, 1.6, 0);
    group.add(sPad);

    const dPad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.4), matSteel);
    dPad.position.set(2.8, 1.6, 0);
    group.add(dPad);

    // 5. ★★★ 4면 360° All-Around ALD 게이트 금속 (황금빛 전극) ★★★
    // SiGe 희생층을 녹여낸 틈새 사이사이와 최하단 나노시트 아래 바닥까지 게이트 금속 충진!
    const gateMat = isCutawayActive
      ? new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.9 })
      : new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.95 });

    // (1) 상단 게이트 캡 (Top Cap)
    const gTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 3.8), gateMat);
    gTop.position.set(0, 1.5, 0);
    group.add(gTop);

    // (2) 1번 틈새 게이트 (Gap 1: Sheet 1 아래 & Sheet 2 위)
    const gGap1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.48, 3.4), gateMat);
    gGap1.position.set(0, 0.6, 0);
    group.add(gGap1);

    // (3) 2번 틈새 게이트 (Gap 2: Sheet 2 아래 & Sheet 3 위)
    const gGap2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.48, 3.4), gateMat);
    gGap2.position.set(0, -0.1, 0);
    group.add(gGap2);

    // (4) ★★★ 3번 바닥 게이트 (Gap 3: Sheet 3 아래 바닥면 & BDI 위) ★★★
    // 질문에 대한 답: 웨이퍼 뒷면이 아니라, 띄워진 나노시트 아래 바닥 틈새로 ALD 금속이 충진됨!
    const gBottom = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 3.4), gateMat);
    gBottom.position.set(0, -0.73, 0);
    group.add(gBottom);

    // (5) 좌우 게이트 외벽 (Outer Flanks)
    const gFlankL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 0.6), gateMat);
    gFlankL.position.set(0, 0.38, -1.6);
    group.add(gFlankL);

    const gFlankR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 0.6), gateMat);
    gFlankR.position.set(0, 0.38, 1.6);
    group.add(gFlankR);

    // 게이트 상부 전극 단자
    const gContact = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.6), matSteel);
    gContact.position.set(0, 1.9, 0);
    group.add(gContact);

    // 6. 이너 스페이서 (Inner Spacers: 틈새 양 끝단의 유전체 절연벽)
    const spMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3 });
    [-1.2, 1.2].forEach(xPos => {
      [0.6, -0.1, -0.73].forEach(yPos => {
        const sp = new THREE.Mesh(new THREE.BoxGeometry(0.2, (yPos === -0.73 ? 0.28 : 0.48), 2.6), spMat);
        sp.position.set(xPos, yPos, 0);
        group.add(sp);
      });
    });

    // 7. 360° 전계 제어 화살표 (상단 + 하단 4면 전체에서 가압)
    [0.95, 0.25, -0.45].forEach(sheetY => {
      const aT = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      aT.rotation.x = Math.PI;
      aT.position.set(0, sheetY + 0.2, 0);
      group.add(aT);

      // ★ 바닥에서 치고 올라오는 전계 화살표!
      const aB = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      aB.position.set(0, sheetY - 0.2, 0);
      group.add(aB);
    });

    // 8. 동적 전자 캐리어 (3개 나노시트를 동시에 관통)
    const gaaElectrons = [];
    for (let i = 0; i < 36; i++) {
      const eMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff })
      );
      const sheetIdx = i % 3;
      const targetY = (sheetIdx === 0) ? 0.95 : (sheetIdx === 1) ? 0.25 : -0.45;
      eMesh.position.set(-2.0 + Math.random() * 4.0, targetY, -1.0 + Math.random() * 2.0);
      group.add(eMesh);
      gaaElectrons.push({ mesh: eMesh, sheetIdx: sheetIdx, baseTargetY: targetY });
    }

    // 9. 3D 정보 라벨
    const titleSprite = createTextSprite('차세대 GAA 나노시트: 3단 나노시트 4면 360° 완벽 밀봉 (3nm/2nm/HBM4)', '#ec4899');
    titleSprite.position.set(0, 3.6, 0);
    group.add(titleSprite);

    const howSprite = createTextSprite('★ 바닥 감싸기 실체: SiGe 선택 식각 틈새 & 나노시트 아래 바닥까지 ALD 금속 충진!', '#00f0ff');
    howSprite.position.set(0, 2.9, 0);
    group.add(howSprite);

    const hynixSprite = createTextSprite('★ HBM4 베이스 다이: 2048-bit 초광대역 \u0026 맞춤형 로직을 위해 TSMC 3nm GAA 동맹!', '#f59e0b');
    hynixSprite.position.set(0, 2.2, 0);
    group.add(hynixSprite);

    const zeroLeak = createTextSprite('🟢 바닥 누설전류 0%: 바닥 유전체 격리(BDI) \u0026 360° 게이트 전계로 완벽 밀봉!', '#10b981');
    zeroLeak.position.set(0, -2.1, 0);
    group.add(zeroLeak);

    animObjects.push({
      type: 'evolution_playback',
      subMode: 'gaa',
      gaaElectrons: gaaElectrons
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🔄 단위 패터닝 8단계 완전 물리 시뮬레이션 모델 (Subtractive Gate & Spacer Etch-Back)
  // ═══════════════════════════════════════════════════════════════════════
  let patterningStep = 0;

  function buildPatterningLoopModel(stepIdx) {
    const modelGroup = new THREE.Group();
    const sub = createBasePSiSubstrate(modelGroup, -1.7);

    // 공통 고시인성 머티리얼
    const matOxide = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.85,
      roughness: 0.15
    });
    const matGateGold = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15
    });
    const matPRYellow = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.95,
      roughness: 0.25
    });
    const matNitrideSky = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2
    });
    const matSpacerBlue = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.4,
      roughness: 0.35
    });
    const matSDCyan = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.3,
      emissive: 0x005577,
      emissiveIntensity: 0.4
    });
    const matSilicideSilver = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.15
    });

    const precursors = [];
    const plasmaIons = [];
    const euvBeams = [];
    const dopantShower = [];
    const pulseLabels = [];

    // [STEP 0] ① [스택 전면증착]: SiO2 산화막 + 금색 게이트 금속(TiN) 웨이퍼 전면 2중 도포
    if (stepIdx === 0) {
      const oxide = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 7.8), matOxide);
      oxide.position.set(0, -0.675, 0);
      modelGroup.add(oxide);

      // ★ 웨이퍼 전체를 100% 덮은 금색 게이트 금속 (TiN)
      const gateMetal = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 7.8), matGateGold);
      gateMetal.position.set(0, -0.15, 0);
      modelGroup.add(gateMetal);

      for (let i = 0; i < 16; i++) {
        const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
        pMesh.position.set(-5.0 + (i % 8) * 1.4, 2.0, -3.0 + Math.floor(i / 8) * 6.0);
        modelGroup.add(pMesh);
        precursors.push(pMesh);
      }

      const t1 = createTextSprite('① [스택 전면증착] SiO₂ 산화막 + 금색 게이트 금속(TiN) 웨이퍼 전면 2중 도포', '#f59e0b');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('★ "원래 금색 전체 도포하고 깎는다": 특정 부위만 칠할 수 없어 웨이퍼 전체를 금빛으로 도포!', '#38bdf8');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);
      pulseLabels.push(t2);

      const t3 = createTextSprite('Tox 20nm 절연막(분홍) 위에 80nm 전도성 금속(황금빛) 연속 적층 ➔ Subtractive 방식 준비', '#94a3b8');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 1.9, 0);
      modelGroup.add(t3);
    }

    // [STEP 1] ② [포토 패터닝]: 금색 금속 위에 PR 도포 ➔ EUV 노광 ➔ 현상으로 중앙 PR 방패 형성
    else if (stepIdx === 1) {
      const oxide = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 7.8), matOxide);
      oxide.position.set(0, -0.675, 0);
      modelGroup.add(oxide);

      const gateMetal = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 7.8), matGateGold);
      gateMetal.position.set(0, -0.15, 0);
      modelGroup.add(gateMetal);

      // 중앙 게이트 PR 방패 기둥
      const prCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.6), matPRYellow);
      prCenter.position.set(0, 0.65, 0);
      modelGroup.add(prCenter);

      // 좌/우 노광 반응 PR (녹색 변색 및 현상액 용해)
      const matDissolvePR = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.35,
        roughness: 0.3
      });
      const prLeft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 7.6), matDissolvePR);
      prLeft.position.set(-3.6, 0.45, 0);
      modelGroup.add(prLeft);

      const prRight = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 7.6), matDissolvePR);
      prRight.position.set(3.6, 0.45, 0);
      modelGroup.add(prRight);

      // 상부 포토마스크
      const maskCr = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 7.8), matDarkTrim);
      maskCr.position.set(0, 2.3, 0);
      modelGroup.add(maskCr);

      // EUV 슬릿 광선
      const beamL = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 1.4, 7.6),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      );
      beamL.position.set(-3.6, 1.4, 0);
      modelGroup.add(beamL);
      euvBeams.push(beamL);

      const beamR = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 1.4, 7.6),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      );
      beamR.position.set(3.6, 1.4, 0);
      modelGroup.add(beamR);
      euvBeams.push(beamR);

      const t1 = createTextSprite('② [포토 패터닝] 금색 금속 위에 PR 도포 ➔ EUV 노광 ➔ 현상액 용해', '#facc15');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('빛을 쬔 좌/우 PR은 녹아서 씻겨나가고, 마스크로 가린 중앙 PR 방패만 우뚝 잔류!', '#22c55e');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.7, 0);
      modelGroup.add(t2);

      const t3 = createTextSprite('노란색 PR 방패 아래에만 금색 금속이 보호되고, 노출된 좌/우 금속은 다음 단계에서 식각됨', '#38bdf8');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 0.0, 4.2);
      modelGroup.add(t3);
    }

    // [STEP 2] ③ [게이트 기둥식각]: [금속 + 산화막]을 한꺼번에 수직 식각 ➔ 우뚝 솟은 게이트 기둥 완성!
    else if (stepIdx === 2) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      const prRemnant = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 7.8), matPRYellow);
      prRemnant.position.set(0, 0.4, 0);
      modelGroup.add(prRemnant);

      for (let i = 0; i < 14; i++) {
        const ion = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0x0a84ff }));
        ion.rotation.x = Math.PI;
        const xSide = (i % 2 === 0 ? -1 : 1) * (2.2 + (i % 4) * 0.9);
        ion.position.set(xSide, 2.0, -3.0 + Math.floor(i / 2) * 0.9);
        modelGroup.add(ion);
        plasmaIons.push(ion);
      }

      const t1 = createTextSprite('③ [게이트 기둥식각] [금속 + 산화막] 한꺼번에 수직 식각 ➔ 기둥 완성!', '#0a84ff');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('PR 방패 없는 좌/우의 [금색 금속 + 분홍 산화막]을 바닥 실리콘까지 통째로 싹 깎아냄!', '#38bdf8');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);

      const t3 = createTextSprite('좌/우 바닥 실리콘 완전 노출 & 중앙에 [산화막 + 금색 메탈] 80nm 기둥 우뚝 독립!', '#f59e0b');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 1.8, 0);
      modelGroup.add(t3);
    }

    // [STEP 3] ④ [질화막 전면코팅]: 게이트 기둥 위에 Si3N4 질화막 10nm 균일 전면 코팅 (옆구리는 100nm 깊이)
    else if (stepIdx === 3) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      // ★ 평평한 바닥 10nm 질화막 (좌/우)
      const nitFloorL = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 7.8), matNitrideSky);
      nitFloorL.position.set(-3.5, -0.725, 0);
      modelGroup.add(nitFloorL);

      const nitFloorR = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 7.8), matNitrideSky);
      nitFloorR.position.set(3.5, -0.725, 0);
      modelGroup.add(nitFloorR);

      // ★ 게이트 꼭대기 10nm 질화막
      const nitTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 7.8), matNitrideSky);
      nitTop.position.set(0, 0.325, 0);
      modelGroup.add(nitTop);

      // ★ 게이트 양 옆구리 수직 질화막 (높이 100nm 절벽!)
      const nitWallL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.05, 7.8), matNitrideSky);
      nitWallL.position.set(-1.075, -0.275, 0);
      modelGroup.add(nitWallL);

      const nitWallR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.05, 7.8), matNitrideSky);
      nitWallR.position.set(1.075, -0.275, 0);
      modelGroup.add(nitWallR);

      const t1 = createTextSprite('④ [질화막 전면코팅] 게이트 기둥 위에 Si₃N₄ 10nm 균일 전면 코팅 (ALD)', '#38bdf8');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('★ "옆에 기둥 세우는 것도 전체 다 덮고 양옆은 100, 다른 덴 10": 바로 이 상태입니다!', '#f59e0b');
      t2.scale.set(4.8, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);
      pulseLabels.push(t2);

      const lblFloor = createTextSprite('평평한 바닥: 10nm', '#94a3b8');
      lblFloor.scale.set(2.4, 0.5, 1.0);
      lblFloor.position.set(-3.5, -0.2, 0);
      modelGroup.add(lblFloor);

      const lblTop = createTextSprite('게이트 머리: 10nm', '#94a3b8');
      lblTop.scale.set(2.4, 0.5, 1.0);
      lblTop.position.set(0, 0.8, 0);
      modelGroup.add(lblTop);

      const lblWall = createTextSprite('★ 수직 옆구리: 100nm 절벽!', '#f59e0b');
      lblWall.scale.set(2.8, 0.55, 1.0);
      lblWall.position.set(2.3, 0.2, 0);
      modelGroup.add(lblWall);
    }

    // [STEP 4] ⑤ [방패막 에치백]: 마스크 없이 수직 10nm만 깎기 ➔ 옆구리에만 초승달 방패막(Spacer) 완성!
    else if (stepIdx === 4) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      // ★ 바닥(10nm) & 꼭대기(10nm)는 깎여서 0nm로 사라지고, 옆구리(100nm)는 90nm가 남아 초승달 스페이서 완성!
      const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spL.position.set(-1.075, -0.325, 0);
      modelGroup.add(spL);

      const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spR.position.set(1.075, -0.325, 0);
      modelGroup.add(spR);

      for (let i = 0; i < 14; i++) {
        const ion = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        ion.rotation.x = Math.PI;
        ion.position.set(-5.0 + (i % 7) * 1.6, 2.1, -2.5 + Math.floor(i / 7) * 5.0);
        modelGroup.add(ion);
        plasmaIons.push(ion);
      }

      const t1 = createTextSprite('⑤ [방패막 에치백] 마스크 없이 수직 10nm만 깎기 ➔ 옆구리 방패막(Spacer) 완성!', '#10b981');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('★ "10만 깎는다": 바닥(10nm)은 날아가고 옆구리(100nm)는 90nm가 남아 방패막 완성!', '#38bdf8');
      t2.scale.set(4.8, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);
      pulseLabels.push(t2);

      const t3 = createTextSprite('마스크 0개로 게이트 양옆에 스스로 정합되는 초승달 방패막(Spacer) 기적 완성!', '#00f0ff');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 1.8, 0);
      modelGroup.add(t3);
    }

    // [STEP 5] ⑥ [자가정합 주입]: [게이트 + 스페이서]를 천연 방패 삼아 좌/우에 n⁺ 소스/드레인 형성
    else if (stepIdx === 5) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spL.position.set(-1.075, -0.325, 0);
      modelGroup.add(spL);

      const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spR.position.set(1.075, -0.325, 0);
      modelGroup.add(spR);

      const sRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      sRegion.position.set(-3.5, -0.65, 0);
      modelGroup.add(sRegion);

      const dRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      dRegion.position.set(3.5, -0.65, 0);
      modelGroup.add(dRegion);

      for (let i = 0; i < 18; i++) {
        const ion = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        ion.position.set(-5.2 + (i % 9) * 1.3, 2.0, -3.0 + Math.floor(i / 9) * 6.0);
        modelGroup.add(ion);
        dopantShower.push(ion);
      }

      const t1 = createTextSprite('⑥ [자가정합 주입] [게이트 + 스페이서] 천연 방패 ➔ 노출 실리콘에 n⁺ S/D 형성', '#00f0ff');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('스페이서 방패 덕분에 1050°C RTA 열처리 후에도 도펀트가 채널 밑으로 퍼지지 않음!', '#10b981');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);

      const t3 = createTextSprite('쇼트(Punch-through) 0% 달성 & 채널-소스 간 완벽한 자가정합(Self-Alignment) 접합', '#38bdf8');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 1.8, 0);
      modelGroup.add(t3);
    }

    // [STEP 6] ⑦ [실리사이드]: 소스/드레인 표면에 초저저항 금속-실리콘 합금막(NiSi) 구축
    else if (stepIdx === 6) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spL.position.set(-1.075, -0.325, 0);
      modelGroup.add(spL);

      const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spR.position.set(1.075, -0.325, 0);
      modelGroup.add(spR);

      const sRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      sRegion.position.set(-3.5, -0.65, 0);
      modelGroup.add(sRegion);

      const dRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      dRegion.position.set(3.5, -0.65, 0);
      modelGroup.add(dRegion);

      const sSilicide = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 7.4), matSilicideSilver);
      sSilicide.position.set(-3.5, -0.4, 0);
      modelGroup.add(sSilicide);

      const dSilicide = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 7.4), matSilicideSilver);
      dSilicide.position.set(3.5, -0.4, 0);
      modelGroup.add(dSilicide);

      const gSilicide = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 7.4), matSilicideSilver);
      gSilicide.position.set(0, 0.32, 0);
      modelGroup.add(gSilicide);

      const t1 = createTextSprite('⑦ [실리사이드] 소스/드레인 표면에 초저저항 NiSi 옴 접촉층 구축', '#a855f7');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('★ 절연체 스페이서 위에는 반응 없음 ➔ 게이트와 소스/드레인 간 쇼트(Bridge) 0%!', '#38bdf8');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);

      const t3 = createTextSprite('실리콘-금속 간 쇼트키 장벽 제거 ➔ 접촉 저항(Rc) 90% 급감으로 고속 전송 가능', '#10b981');
      t3.scale.set(4.2, 0.6, 1.0);
      t3.position.set(0, 1.8, 0);
      modelGroup.add(t3);
    }

    // [STEP 7] ⑧ [컨택 단자완성]: ILD 절연막 매립 ➔ 수직 구멍 뚫기 ➔ 텅스텐(W) 못 박아 3단자 완성!
    else if (stepIdx === 7) {
      const oxCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 7.8), matOxide);
      oxCenter.position.set(0, -0.675, 0);
      modelGroup.add(oxCenter);

      const gateCenter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 7.8), matGateGold);
      gateCenter.position.set(0, -0.15, 0);
      modelGroup.add(gateCenter);

      const spL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spL.position.set(-1.075, -0.325, 0);
      modelGroup.add(spL);

      const spR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.95, 7.8), matSpacerBlue);
      spR.position.set(1.075, -0.325, 0);
      modelGroup.add(spR);

      const sRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      sRegion.position.set(-3.5, -0.65, 0);
      modelGroup.add(sRegion);

      const dRegion = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 7.8), matSDCyan);
      dRegion.position.set(3.5, -0.65, 0);
      modelGroup.add(dRegion);

      const sSilicide = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 7.4), matSilicideSilver);
      sSilicide.position.set(-3.5, -0.4, 0);
      modelGroup.add(sSilicide);

      const dSilicide = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 7.4), matSilicideSilver);
      dSilicide.position.set(3.5, -0.4, 0);
      modelGroup.add(dSilicide);

      const gSilicide = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 7.4), matSilicideSilver);
      gSilicide.position.set(0, 0.32, 0);
      modelGroup.add(gSilicide);

      const ildGlass = new THREE.Mesh(
        new THREE.BoxGeometry(12, 1.4, 7.8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22, roughness: 0.1 })
      );
      ildGlass.position.set(0, 0.2, 0);
      modelGroup.add(ildGlass);

      const plugGeoSD = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
      const plugGeoG = new THREE.CylinderGeometry(0.35, 0.35, 0.65, 16);

      const plugS = new THREE.Mesh(plugGeoSD, matSteel);
      plugS.position.set(-3.5, 0.3, 0);
      modelGroup.add(plugS);

      const plugD = new THREE.Mesh(plugGeoSD, matSteel);
      plugD.position.set(3.5, 0.3, 0);
      modelGroup.add(plugD);

      const plugG = new THREE.Mesh(plugGeoG, matGateGold);
      plugG.position.set(0, 0.65, 0);
      modelGroup.add(plugG);

      const termS = createTextSprite('[S] Source 전극', '#00f0ff');
      termS.scale.set(2.4, 0.6, 1.0);
      termS.position.set(-3.5, 1.3, 0);
      modelGroup.add(termS);

      const termG = createTextSprite('[G] Gate 전극', '#f59e0b');
      termG.scale.set(2.4, 0.6, 1.0);
      termG.position.set(0, 1.4, 0);
      modelGroup.add(termG);

      const termD = createTextSprite('[D] Drain 전극', '#00f0ff');
      termD.scale.set(2.4, 0.6, 1.0);
      termD.position.set(3.5, 1.3, 0);
      modelGroup.add(termD);

      const t1 = createTextSprite('⑧ [컨택 단자완성] ILD 매립 ➔ 컨택 홀 식각 ➔ 텅스텐(W) 못 박아 3단자 완성!', '#10b981');
      t1.position.set(0, 3.4, 0);
      modelGroup.add(t1);

      const t2 = createTextSprite('게이트에 +0.7V를 걸면 소스에서 드레인으로 전자가 통과하는 완전한 3단자 MOSFET 완성!', '#00f0ff');
      t2.scale.set(4.6, 0.7, 1.0);
      t2.position.set(0, 2.6, 0);
      modelGroup.add(t2);
    }

    animObjects.push({
      type: 'patterning_playback',
      stepIdx: stepIdx,
      precursors: precursors,
      plasmaIons: plasmaIons,
      euvBeams: euvBeams,
      dopantShower: dopantShower,
      pulseLabels: pulseLabels
    });

    mainGroup.add(modelGroup);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Animation Loop with Multi-Stage Progress Synchronization
  // ═══════════════════════════════════════════════════════════════════════
  function startAnimationLoop() {
    function animate() {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // Update Playback Progress
      if (playback.isPlaying) {
        playback.progress += (deltaSec / playback.duration) * playback.speed;
        if (playback.progress > 1.0) {
          playback.progress = 0.0;
        }
      }

      // Trigger Progress Callback
      if (onProgressCallback) {
        const stageInfo = getCurrentStageInfo();
        onProgressCallback(playback.progress, stageInfo);
      }

      // Smooth Orbit & Pan Camera Interpolation
      panTarget.lerp(targetPanTarget, 0.1);
      rotX += (targetRotX - rotX) * 0.1;
      rotY += (targetRotY - rotY) * 0.1;
      zoomDist += (targetZoomDist - zoomDist) * 0.1;

      camera.position.x = panTarget.x + zoomDist * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = panTarget.y + zoomDist * Math.sin(rotX);
      camera.position.z = panTarget.z + zoomDist * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(panTarget);

      // Render Dynamic Multi-Stage Morphing based on playback.progress
      const p = playback.progress;

      for (const item of animObjects) {
        // ─────────────────────────────────────────────────────────────
        // 1. 설비 챔버 애니메이션 (Equipment Chamber Animations for All 14)
        // ─────────────────────────────────────────────────────────────
        if (item.type === 'p01_dual_playback') {
          // 1. CZ 잉곳 회전 및 단결정 인상 실시간 성장 시뮬레이션
          if (item.czIngotGroup) {
            item.czIngotGroup.rotation.y += 0.02;
            // p 0~0.5 구간에서 종결정이 융액에서 서서히 위로 인상되며 잉곳 몸통통이 길게 성장
            const pullProg = Math.min(1.0, p / 0.5);
            item.czIngotGroup.position.y = -0.5 + pullProg * 2.2;
            if (item.czIngotBody) {
              item.czIngotBody.scale.y = Math.max(0.05, pullProg);
              item.czIngotBody.position.y = -0.65 * pullProg;
            }
            if (item.czShoulder) {
              item.czShoulder.scale.set(Math.max(0.2, pullProg), Math.max(0.2, pullProg), Math.max(0.2, pullProg));
            }
          }
          if (item.czMeniscus) {
            item.czMeniscus.material.opacity = 0.7 + Math.sin(now * 0.01) * 0.3;
          }
          if (item.czMelt && item.czMelt.material) {
            item.czMelt.material.emissiveIntensity = 1.4 + Math.sin(now * 0.006) * 0.4;
          }

          // 2. 다이아몬드 와이어 쏘 진동
          if (item.wireSaw) {
            item.wireSaw.position.y = Math.sin(now * 0.03) * 0.12;
          }

          // 3. 매엽식 스핀 세정기: 1500 RPM 고속 회전, 약액 박막 파동 및 분사 스트림
          if (item.spinWafer) item.spinWafer.rotation.y += 0.14;
          if (item.spinChuck) item.spinChuck.rotation.y += 0.14;
          if (item.waferLiquid) {
            item.waferLiquid.rotation.y += 0.14;
            item.waferLiquid.material.opacity = (p >= 0.4) ? 0.65 + Math.sin(now * 0.02) * 0.15 : 0.2;
          }
          if (item.arm1) {
            item.arm1.rotation.y = (p >= 0.4) ? Math.sin(now * 0.003) * 0.35 : 0;
          }
          if (item.megaBeam && item.megaBeam.material) {
            item.megaBeam.material.opacity = (p >= 0.4) ? 0.45 + Math.sin(now * 0.05) * 0.35 : 0.0;
          }
          if (item.arm2) {
            item.arm2.rotation.y = (p >= 0.4) ? Math.cos(now * 0.0035) * 0.3 : 0;
          }
          if (item.sprayCone && item.sprayCone.material) {
            item.sprayCone.material.opacity = (p >= 0.4) ? 0.5 + Math.sin(now * 0.04) * 0.25 : 0.0;
          }
        }
        else if (item.type === 'p02_equip') {
          // 웨이퍼 보트 랙이 석영 노내로 진입 및 발열 코일 열복사 발광
          const boatY = -1.8 + Math.min(1.0, p * 1.8) * 1.6;
          item.boatGroup.position.y = boatY;
          item.coil.material.emissiveIntensity = 0.4 + Math.min(1.0, p * 1.4) * 0.6 + Math.sin(now * 0.006) * 0.2;
        }
        else if (item.type === 'p03_equip') {
          // ASML EUV 트윈스캔 High-NA 스캐너 물리 동작 (Step-and-Scan):
          // 1. 레티클(마스크) 스테이지와 웨이퍼 스테이지가 반대 방향으로 4:1 속도비 스캐닝
          // 2. 한 다이 노광 스캔 완료 후 웨이퍼 스테이지가 다음 다이로 Step 이동
          // 3. 13.5nm EUV 슬릿 빔 고주파 펄스 발광 및 현재 노광 중인 다이 발광
          const cycle = (p * 8) % 1.0; // 8개 다이 순차 스캔
          const dieIndex = Math.floor(p * 8);
          const scanPos = (cycle < 0.8) ? (cycle / 0.8 - 0.5) : (0.5 - (cycle - 0.8) / 0.2); // 스캔 및 플라이백
          const stepZ = ((dieIndex % 4) - 1.5) * 0.45;
          const stepX = (Math.floor(dieIndex / 4) - 0.5) * 0.7;

          if (item.reticleStage) {
            item.reticleStage.position.x = scanPos * 1.8;
          }
          if (item.waferStage) {
            item.waferStage.position.x = stepX - scanPos * 0.45;
            item.waferStage.position.z = stepZ;
          }
          if (item.slitBeam && item.slitBeam.material) {
            const isScanning = cycle < 0.8;
            item.slitBeam.material.opacity = isScanning ? (0.45 + Math.sin(now * 0.05) * 0.35) : 0.05;
          }
          if (item.activeDie && item.activeDie.material) {
            item.activeDie.material.emissiveIntensity = (cycle < 0.8) ? (0.6 + Math.sin(now * 0.03) * 0.4) : 0.1;
          }
        }
        else if (item.type === 'p04_equip') {
          // Lam 플라즈마 방전체 회전, RF 시스 진동 및 발광
          item.plasma.rotation.y += 0.025;
          const pulse = 1.0 + Math.sin(now * 0.008) * 0.08;
          item.plasma.scale.set(pulse, 1.0, pulse);
          item.plasma.material.opacity = 0.3 + (p * 0.45) + Math.sin(now * 0.01) * 0.15;
          item.plasmaLight.intensity = 1.5 + (p * 2.0) + Math.sin(now * 0.01) * 0.5;
        }
        else if (item.type === 'p05_equip') {
          // 이온 빔 주입 콘 방사 및 웨이퍼 틸트 채널링 방지 회전
          item.beamCone.material.opacity = 0.35 + Math.sin(now * 0.015) * 0.3;
          item.beamCone.rotation.z = Math.PI / 2.7 + Math.sin(now * 0.004) * 0.08;
          item.wafer.rotation.y += 0.01;
        }
        else if (item.type === 'p06_equip') {
          // ALD 샤워헤드 전구체 가스 구름 교대 펄스 (TMA 핑크 <-> H2O 시안)
          const cycle = (now * 0.004) % (Math.PI * 2);
          if (Math.sin(cycle) > 0) {
            item.gasCloud.material.color.setHex(0xf43f5e);
          } else {
            item.gasCloud.material.color.setHex(0x00f0ff);
          }
          item.gasCloud.material.opacity = 0.2 + Math.abs(Math.sin(cycle)) * 0.45;
          item.gasCloud.scale.y = 0.6 + Math.abs(Math.sin(cycle)) * 0.6;
        }
        else if (item.type === 'p07_equip') {
          // Cu 전해도금 수조 내 웨이퍼 회전 침지
          item.wafer.rotation.y += 0.03;
          item.wafer.position.y = -0.8 + Math.sin(now * 0.003) * 0.04;
        }
        else if (item.type === 'p08_equip') {
          // CMP 플래튼 & 연마 패드 고속 회전, 캐리어 헤드 편심 요동 및 가압
          item.platen.rotation.y += 0.035;
          item.pad.rotation.y += 0.035;
          item.headGroup.rotation.y -= 0.045;
          item.headGroup.position.x = -1.6 + Math.sin(now * 0.003) * 0.6;
          item.headGroup.position.y = (p > 0.08 && p < 0.92) ? -0.1 : 0.2;
          if (item.slurryArm) item.slurryArm.rotation.y = Math.sin(now * 0.002) * 0.15;
          if (item.condGroup) {
            item.condGroup.rotation.y = Math.cos(now * 0.0025) * 0.12;
            if (item.diamondDisc) item.diamondDisc.rotation.y += 0.08;
          }
        }
        else if (item.type === 'p09_equip') {
          // EDS 테스터 웨이퍼 척 다이 스텝 이동 & 프로브 카드 터치다운
          const step = Math.floor(p * 8);
          item.chuck.position.x = ((step % 4) - 1.5) * 0.35;
          item.chuck.position.z = 0.3 + (Math.floor(step / 4) - 0.5) * 0.35;
          item.wafer.position.x = item.chuck.position.x;
          item.wafer.position.z = item.chuck.position.z;
          item.cardGroup.position.y = -0.8 - (Math.sin(p * Math.PI * 16) > 0 ? 0.06 : 0.0);
        }
        else if (item.type === 'p10_equip') {
          // DISCO 다이아몬드 휠 고속 연삭 회전 및 하강 절삭
          item.spindleGroup.rotation.y += 0.18;
          item.spindleGroup.position.x = -0.8 + Math.sin(now * 0.003) * 0.7;
          item.spindleGroup.position.y = 0.2 - (p * 0.3);
          item.wafer.rotation.y += 0.015;
        }
        else if (item.type === 'p11_equip') {
          // 플립칩 본더 픽앤플레이스 헤드 하강 가압 사이클
          const cycle = (p * 3) % 1.0;
          item.headGroup.position.y = (cycle < 0.5) ? 0.8 - cycle * 1.4 : -0.6 + (cycle - 0.5) * 1.4 * 2;
        }
        else if (item.type === 'p12_equip') {
          // TOWA 몰딩 프레스 상형 클램핑 및 플런저 수지 가압 사출
          item.upperMold.position.y = (p < 0.3) ? 0.4 - (p / 0.3) * 1.4 : -1.0;
          item.plunger.position.y = (p >= 0.3) ? 2.2 - ((p - 0.3) / 0.7) * 1.8 : 2.2;
        }
        else if (item.type === 'p13_equip') {
          // 한미반도체 Dual TC 본더 교대 픽앤플레이스 열압착 본딩
          item.heads.forEach((h, i) => {
            const phase = (p * 6 + i * 0.5) % 1.0;
            h.position.y = 1.2 - Math.sin(phase * Math.PI) * 1.4;
          });
        }
        else if (item.type === 'p14_equip') {
          // 2.5D CoWoS 이종 칩렛 조립 갠트리 이송
          item.gantry.position.x = Math.sin(p * Math.PI * 4) * 1.5;
          item.gantry.position.y = 1.4 - Math.abs(Math.sin(p * Math.PI * 4)) * 0.7;
          item.wafer.rotation.y = Math.sin(p * 2) * 0.05;
        }

        // ─────────────────────────────────────────────────────────────
        // 2. 단면 미세 뷰 애니메이션: MOSFET 전주기 라이프사이클 동적 시뮬레이션
        // ─────────────────────────────────────────────────────────────
        else if (item.type === 'p01_micro') {
          // 01. 웨이퍼 제조 (CZ 1420°C 잉곳 인상 ➔ 와이어 절단 ➔ 메가소닉 세정)
          if (item.czIngot) {
            item.czIngot.rotation.y += 0.02;
            const lift = Math.min(1.0, p / 0.35) * 1.0;
            item.czIngot.position.y = 0.2 + lift;
          }
          if (item.czMelt && item.czMelt.material) {
            item.czMelt.material.emissiveIntensity = 1.2 + Math.sin(now * 0.006) * 0.3;
          }
          if (item.wireSaw) {
            item.wireSaw.position.y = Math.sin(now * 0.025) * 0.15;
          }
          if (item.cutWafer) {
            const cutProg = Math.max(0, Math.min(1.0, (p - 0.35) / 0.35));
            item.cutWafer.position.x = 0.8 + cutProg * 1.8;
            item.cutWafer.rotation.y += 0.04;
          }
          if (item.spinWafer) {
            item.spinWafer.rotation.y += 0.06;
          }
          item.particles.forEach(pMesh => {
            if (p < 0.7) {
              pMesh.position.y = pMesh.userData.initY + Math.sin(now * 0.025) * 0.02;
              pMesh.scale.set(1, 1, 1);
            } else {
              const wash = (p - 0.7) / 0.3;
              pMesh.position.y = pMesh.userData.initY + wash * 1.5;
              pMesh.position.x = pMesh.userData.initX + wash * 2.5;
              pMesh.scale.setScalar(Math.max(0.01, 1.0 - wash));
            }
          });
        }
        else if (item.type === 'p02_micro') {
          // 02. Deal-Grove 열산화막 성장 및 실리콘 격자 1050°C 열복사 발광
          const heat = Math.sin(p * Math.PI);
          item.sub.material.emissive.setHex(0xff3b00);
          item.sub.material.emissiveIntensity = heat * 0.55;
          const oxideGrowth = Math.max(0.05, Math.min(1.0, p * 1.15));
          item.oxide.scale.y = oxideGrowth;
          item.oxide.position.y = -0.8 + (oxideGrowth * 0.5) / 2;
          item.oxide.material.opacity = 0.35 + p * 0.45;
          item.oxygenAtoms.forEach((oMesh, i) => {
            const fall = ((now * 0.002 + i * 0.08) % 1.0);
            oMesh.position.y = oMesh.userData.initY - fall * 1.8;
            oMesh.visible = (oMesh.position.y > -0.8 + oxideGrowth * 0.5);
          });
        }
        else if (item.type === 'p03_micro') {
          // 03. 포토리소그래피: 균일 노란색 PR ➔ EUV 빛 받은 좌/우 부위만 초록색 변색 ➔ 현상(TMAH) 용해
          if (p < 0.22) {
            // [1단계: 노광 전] 전면 균일한 노란색 감광액 (빛 없음)
            item.beamL.visible = false;
            item.beamR.visible = false;
            item.prLeft.material.color.setHex(0xfacc15); // 노란색
            item.prRight.material.color.setHex(0xfacc15); // 노란색
            item.prLeft.scale.y = 1.0;
            item.prRight.scale.y = 1.0;
            item.prLeft.position.y = 0.0;
            item.prRight.position.y = 0.0;
            item.prLeft.visible = true;
            item.prRight.visible = true;
            item.centerPR.material.color.setHex(0xfacc15); // 노란색
            item.centerPR.visible = true;
          } else if (p < 0.55) {
            // [2단계: EUV 노광] 빛을 쬔 좌/우 PR만 초록색(0x22c55e)으로 광화학 변색!
            item.beamL.visible = true;
            item.beamR.visible = true;
            const beamPulse = 0.35 + Math.sin(now * 0.03) * 0.25;
            item.beamL.material.opacity = beamPulse;
            item.beamR.material.opacity = beamPulse;

            const expProg = Math.min(1.0, (p - 0.22) / 0.18);
            item.prLeft.material.color.lerpColors(new THREE.Color(0xfacc15), new THREE.Color(0x22c55e), expProg);
            item.prRight.material.color.lerpColors(new THREE.Color(0xfacc15), new THREE.Color(0x22c55e), expProg);

            item.prLeft.scale.y = 1.0;
            item.prRight.scale.y = 1.0;
            item.prLeft.position.y = 0.0;
            item.prRight.position.y = 0.0;
            item.prLeft.visible = true;
            item.prRight.visible = true;

            // 중앙 게이트 PR: 크롬 마스크가 빛을 막아주므로 노란색(0xfacc15) 그대로 유지!
            item.centerPR.material.color.setHex(0xfacc15);
            item.centerPR.visible = true;
          } else {
            // [3단계: 현상액 TMAH 세척] 반응한 초록색 PR만 깨끗이 녹아 사라짐
            item.beamL.visible = false;
            item.beamR.visible = false;

            const dissolve = Math.min(1.0, (p - 0.55) / 0.35);
            item.prLeft.scale.y = Math.max(0.01, 1.0 - dissolve);
            item.prRight.scale.y = Math.max(0.01, 1.0 - dissolve);
            item.prLeft.position.y = 0.0 - dissolve * 0.4;
            item.prRight.position.y = 0.0 - dissolve * 0.4;
            item.prLeft.visible = (dissolve < 0.98);
            item.prRight.visible = (dissolve < 0.98);

            // 중앙 게이트 PR 마스크는 온전히 보존되어 우뚝 서 있음!
            item.centerPR.material.color.setHex(0xfacc15);
            item.centerPR.visible = true;
          }
        }
        else if (item.type === 'p04_micro') {
          // 04. 플라즈마 건식 식각: CF4/Cl2 식각 + C4F8 측벽 보호 ➔ 90° 게이트 완성 ➔ PR 애싱 박리
          item.ionArrowsL.forEach((ion, i) => {
            ion.visible = (p < 0.7);
            const fall = (now * 0.004 + i * 0.15) % 1.0;
            ion.position.y = 2.0 - fall * 2.2;
          });
          item.ionArrowsR.forEach((ion, i) => {
            ion.visible = (p < 0.7);
            const fall = (now * 0.004 + i * 0.15) % 1.0;
            ion.position.y = 2.0 - fall * 2.2;
          });

          const etchP = Math.min(1.0, p / 0.7);
          // 좌/우 노출된 분홍색 산화막이 식각되어 기판까지 수직으로 깎임 (회색 실리콘 노출)
          if (item.oxideLeft && item.oxideRight) {
            item.oxideLeft.scale.y = Math.max(0.01, 1.0 - etchP);
            item.oxideRight.scale.y = Math.max(0.01, 1.0 - etchP);
            item.oxideLeft.position.y = -0.55 - etchP * 0.2;
            item.oxideRight.position.y = -0.55 - etchP * 0.2;
            item.oxideLeft.visible = (etchP < 0.98);
            item.oxideRight.visible = (etchP < 0.98);
          }

          // C4F8 측벽 보호막이 형성되어 언더컷 방지
          if (item.passL && item.passR) {
            item.passL.material.opacity = Math.min(0.85, etchP * 1.1);
            item.passR.material.opacity = Math.min(0.85, etchP * 1.1);
          }

          // 70% 시점 이후 O2 플라즈마 애싱으로 상부 노란색 PR 마스크 제거
          if (p >= 0.7) {
            const strip = Math.min(1.0, (p - 0.7) / 0.3);
            item.centerPR.scale.y = Math.max(0.01, 1.0 - strip);
            item.centerPR.position.y = 0.0 - strip * 0.4;
            item.centerPR.visible = (strip < 0.98);
          } else {
            item.centerPR.scale.y = 1.0;
            item.centerPR.position.y = 0.0;
            item.centerPR.visible = true;
          }
        }
        else if (item.type === 'p05_micro') {
          // 05. 셀프 얼라인(Self-Aligned) 이온 주입: 중앙 산화막이 채널을 자체 차폐, 좌/우만 주입 ➔ RTA 활성화
          item.ions.forEach((ion, i) => {
            ion.visible = (p < 0.5);
            const fall = (now * 0.0035 + i * 0.1) % 1.0;
            ion.position.y = 1.8 - fall * 2.2;
          });

          // 1050°C 밀리초 플래시 열처리(Flash RTA)
          if (p >= 0.5 && p < 0.8) {
            const flash = Math.sin((p - 0.5) / 0.3 * Math.PI);
            item.sub.material.emissive.setHex(0xff8800);
            item.sub.material.emissiveIntensity = flash * 0.85;
          } else {
            item.sub.material.emissiveIntensity = 0.0;
          }

          if (p < 0.5) {
            // 이온 충돌 격자 손상 (레드)
            item.dopantL.material.color.setHex(0xef4444);
            item.dopantR.material.color.setHex(0xef4444);
          } else {
            // RTA 활성화: 격자 재결정화 및 n+ 전도성 캐리어 활성화 (시안)
            const act = Math.min(1.0, (p - 0.5) / 0.3);
            item.dopantL.material.color.lerpColors(new THREE.Color(0xef4444), new THREE.Color(0x00f0ff), act);
            item.dopantR.material.color.lerpColors(new THREE.Color(0xef4444), new THREE.Color(0x00f0ff), act);
          }
        }
        else if (item.type === 'p06_micro') {
          // 06. 박막 증착 (ALD/CVD/실리사이드): 3개 챔버의 순차적 증착 시뮬레이션
          // 1단계(p < 0.35): 중앙 산화막 위에 ALD로 황금빛 메탈 게이트(TiN/W) 증착
          // 2단계(0.35 <= p < 0.68): 게이트 양측벽에 쇼트 방지용 Si3N4 절연 스페이서 형성
          // 3단계(p >= 0.68): 소스/드레인 표면에 저저항 금속 실리사이드(NiSi) 접촉 패드 형성 ➔ 3단자 MOSFET 완성!
          
          if (p < 0.35) {
            // [1단계] 중앙 게이트 금속(TiN/W) 증착: 황금빛 전구체가 중앙으로 낙하
            const prog = Math.min(1.0, p / 0.35);
            if (item.metalGate) {
              item.metalGate.visible = true;
              item.metalGate.scale.y = Math.max(0.01, prog);
              item.metalGate.position.y = -0.45 + prog * 0.4;
            }
            if (item.spL && item.spR) {
              item.spL.visible = false;
              item.spR.visible = false;
            }
            if (item.sPad && item.dPad && item.gPad) {
              item.sPad.visible = false;
              item.dPad.visible = false;
              item.gPad.visible = false;
            }
            if (item.termG) item.termG.visible = true;
            if (item.termS) item.termS.visible = false;
            if (item.termD) item.termD.visible = false;

            item.precursors.forEach((pMesh, i) => {
              pMesh.visible = true;
              pMesh.material.color.setHex(0xf59e0b); // 황금빛 금속 전구체
              pMesh.position.x = -0.6 + (i % 6) * 0.24;
              const fall = (now * 0.003 + i * 0.12) % 1.0;
              pMesh.position.y = 1.8 - fall * 1.8;
            });
          } else if (p < 0.68) {
            // [2단계] 메탈 게이트 완성 + Si3N4 측벽 절연 스페이서 형성
            if (item.metalGate) {
              item.metalGate.visible = true;
              item.metalGate.scale.y = 1.0;
              item.metalGate.position.y = -0.05;
            }
            const prog = (p - 0.35) / 0.33;
            if (item.spL && item.spR) {
              item.spL.visible = true;
              item.spR.visible = true;
              item.spL.scale.y = Math.max(0.01, prog);
              item.spR.scale.y = Math.max(0.01, prog);
              item.spL.position.y = -0.45 + prog * 0.4;
              item.spR.position.y = -0.45 + prog * 0.4;
            }
            if (item.sPad && item.dPad && item.gPad) {
              item.sPad.visible = false;
              item.dPad.visible = false;
              item.gPad.visible = false;
            }
            if (item.termG) item.termG.visible = true;
            if (item.termS) item.termS.visible = false;
            if (item.termD) item.termD.visible = false;

            item.precursors.forEach((pMesh, i) => {
              pMesh.visible = true;
              pMesh.material.color.setHex(0x38bdf8); // 질화막 전구체
              pMesh.position.x = (i % 2 === 0 ? -1.08 : 1.08) + ((i % 3) - 1) * 0.08;
              const fall = (now * 0.003 + i * 0.12) % 1.0;
              pMesh.position.y = 1.8 - fall * 1.8;
            });
          } else {
            // [3단계] 소스/드레인 저저항 금속 실리사이드(Silicide) 접촉 패드 형성 ➔ 3단자 MOSFET 완성!
            if (item.metalGate) {
              item.metalGate.visible = true;
              item.metalGate.scale.y = 1.0;
              item.metalGate.position.y = -0.05;
            }
            if (item.spL && item.spR) {
              item.spL.visible = true;
              item.spR.visible = true;
              item.spL.scale.y = 1.0;
              item.spR.scale.y = 1.0;
              item.spL.position.y = -0.05;
              item.spR.position.y = -0.05;
            }
            const prog = Math.min(1.0, (p - 0.68) / 0.32);
            if (item.sPad && item.dPad && item.gPad) {
              item.sPad.visible = true;
              item.dPad.visible = true;
              item.gPad.visible = true;
              item.sPad.scale.y = Math.max(0.01, prog);
              item.dPad.scale.y = Math.max(0.01, prog);
              item.gPad.scale.y = Math.max(0.01, prog);
            }
            if (item.termG) item.termG.visible = true;
            if (item.termS) item.termS.visible = true;
            if (item.termD) item.termD.visible = true;

            item.precursors.forEach((pMesh, i) => {
              pMesh.visible = (prog < 0.95);
              pMesh.material.color.setHex(0xe2e8f0); // 은백색 실리사이드 금속
              pMesh.position.x = (i % 2 === 0 ? -3.5 : 3.5) + ((i % 4) - 1.5) * 0.5;
              const fall = (now * 0.003 + i * 0.12) % 1.0;
              pMesh.position.y = 1.8 - fall * 1.8;
            });
          }
        }
        else if (item.type === 'beol_playback') {
          // 07. BEOL 15층 구리 배선 순차 적층 (M1 ~ M15)
          const visibleCount = Math.min(15, Math.max(1, Math.floor(p * 15) + 1));
          item.layers.forEach((lGroup, idx) => {
            lGroup.visible = (idx < visibleCount);
          });
        }
        else if (item.type === 'p08_micro') {
          // 08. CMP 패드 회전 하강 및 과도금 구리 언덕 평탄화 (단차 0nm 달성)
          const padY = (p < 0.2) ? 1.6 - (p / 0.2) * 0.6 : (p > 0.85) ? 1.0 + ((p - 0.85) / 0.15) * 0.6 : 1.0;
          item.pad.position.y = padY;
          item.pad.position.x = Math.sin(now * 0.003) * 0.3;
          const removal = (p < 0.2) ? 0 : Math.min(1.0, (p - 0.2) / 0.65);
          item.cuMounds.forEach(mound => {
            mound.scale.y = Math.max(0.02, 1.0 - removal);
            mound.position.y = (1.0 - removal) * 0.3 - 0.3;
          });
        }
        else if (item.type === 'p09_micro') {
          // 09. EDS 텅스텐 니들 접촉 스크러빙 및 PASS 판정 녹색 LED 점등
          if (p < 0.3) {
            item.needles.forEach(n => { n.position.y = 0.5 - (p / 0.3) * 0.5; });
          } else {
            item.needles.forEach(n => { n.position.y = 0.0; });
          }
          if (p >= 0.5) {
            item.passLed.material.opacity = 0.85 + Math.sin(now * 0.015) * 0.15;
          } else {
            item.passLed.material.opacity = 0.05;
          }
        }
        else if (item.type === 'p10_micro') {
          // 10. 백그라인딩 박형화 (775um -> 30um) 및 스텔스 레이저 분할
          const thinP = Math.min(1.0, p / 0.6);
          item.waferBulk.scale.y = Math.max(0.12, 1.0 - thinP * 0.85);
          item.waferBulk.position.y = -0.1 + thinP * 0.6;
          item.wheel.rotation.z += 0.08;
          item.wheel.position.x = -1.5 + Math.sin(now * 0.004) * 1.5;
          item.wheel.position.y = item.waferBulk.position.y - (item.waferBulk.scale.y * 1.6) - 0.4;
          item.wheel.visible = (p < 0.65);
          if (p >= 0.6) {
            item.laserCrack.material.opacity = Math.min(1.0, (p - 0.6) / 0.2);
          } else {
            item.laserCrack.material.opacity = 0.0;
          }
        }
        else if (item.type === 'p11_micro') {
          // 11. 플립칩 다이 하강 및 25um 마이크로범프 솔더 리플로우 용융 접합
          const dieY = (p < 0.4) ? 1.2 - (p / 0.4) * 0.9 : 0.3;
          item.topDie.position.y = dieY;
          item.bumps.forEach(bump => {
            bump.position.y = (p < 0.4) ? 0.6 - (p / 0.4) * 0.45 : 0.15;
            if (p >= 0.4 && p < 0.75) {
              bump.material.color.setHex(0xf59e0b); // 솔더 용융 가열 상태
              bump.scale.set(1.18, 0.75, 1.18);
            } else if (p >= 0.75) {
              bump.material.color.setHex(0x38bdf8); // 냉각 고체 접합
              bump.scale.set(1.12, 0.8, 1.12);
            } else {
              bump.material.color.setHex(0x38bdf8);
              bump.scale.set(1.0, 1.0, 1.0);
            }
          });
        }
        else if (item.type === 'p12_micro') {
          // 12. 액상 EMC 에폭시 수지 보이디리스 사출 및 칩 밀봉
          const fill = Math.min(1.0, p / 0.85);
          item.emcResin.scale.x = Math.max(0.01, fill);
          item.emcResin.position.x = -6.0 + fill * 6.0;
        }
        else if (item.type === 'hbm_playback') {
          // 13. HBM 8단 순차 적층, MR-MUF 주입 및 1024-bit TSV 신호 발광
          const totalDies = item.dramDies.length;
          const diesTarget = Math.min(totalDies, Math.max(1, Math.floor((p / 0.55) * totalDies)));
          
          item.dramDies.forEach((die, idx) => {
            die.visible = (idx < diesTarget);
          });

          if (p < 0.55) {
            const cycleProgress = (p / 0.55) * totalDies;
            const subP = cycleProgress - Math.floor(cycleProgress);
            const targetY = -2.8 + (diesTarget - 1) * 0.54 + 0.8;
            item.bondTool.position.y = (subP < 0.5) ? targetY + (1 - subP * 2) * 2.5 : targetY;
            item.bondTool.material.emissiveIntensity = (subP >= 0.5) ? 0.8 : 0.1;
          } else {
            item.bondTool.position.y = 4.5;
            item.bondTool.material.emissiveIntensity = 0.0;
          }

          const mufRatio = Math.max(0, Math.min(1, (p - 0.55) / 0.25));
          item.mufLayers.forEach((muf, idx) => {
            if (mufRatio > 0 && idx < diesTarget) {
              muf.material.opacity = mufRatio * 0.45;
              muf.scale.set(mufRatio, 1, mufRatio);
            } else {
              muf.material.opacity = 0;
            }
          });

          const isSignaling = (p >= 0.80);
          item.tsvCols.forEach((colGroup, idx) => {
            const glow = isSignaling ? (Math.sin(now * 0.015 + idx) + 1) / 2 : 0;
            colGroup.forEach(tsv => {
              tsv.material.emissive = new THREE.Color(0x00f0ff);
              tsv.material.emissiveIntensity = glow * 0.75;
            });
          });
        }
        else if (item.type === 'interposer_playback') {
          // 14. 2.5D CoWoS GPU + HBM 실리콘 인터포저 실장 및 고밀도 RDL 배선 전송
          item.rdl.material.color = (p > 0.7) ? new THREE.Color(0x00f0ff) : new THREE.Color(0x334155);
          item.rdl.scale.x = (p > 0.7) ? 1.0 : Math.max(0.05, p / 0.7);
          item.gpu.position.y = (p < 0.35) ? 2.5 - (p / 0.35) * 3.7 : -1.2;
          item.hbms.forEach((hbm, idx) => {
            const hbmStart = 0.35 + idx * 0.15;
            if (p < hbmStart) {
              hbm.position.y = 3.0;
            } else if (p < hbmStart + 0.15) {
              hbm.position.y = 3.0 - ((p - hbmStart) / 0.15) * 3.6;
            } else {
              hbm.position.y = -0.6;
            }
          });
        }
        else if (item.type === 'evolution_playback') {
          if (!isCurrentFlowActive) return;

          const speed = playback.speed * 0.04;

          if (item.subMode === 'planar') {
            // 표면 전자 이동 (Source -> Drain)
            item.surfaceElectrons.forEach(e => {
              e.position.x += speed * 1.5;
              if (e.position.x > 2.5) {
                e.position.x = -2.5;
                e.position.z = -2.6 + Math.random() * 5.2;
              }
            });

            // 기판 깊은 바닥 누설전류 이동 (Drain -> Source 펀치스루)
            item.leakageParticles.forEach(lp => {
              lp.position.x -= speed * 1.2;
              if (lp.position.x < -2.8) {
                lp.position.x = 2.8;
                lp.position.y = -1.1 - Math.random() * 0.6;
                lp.position.z = -2.4 + Math.random() * 4.8;
              }
            });
          }
          else if (item.subMode === 'finfet') {
            // 핀 3개 면을 통과하는 전자 이동
            item.finElectrons.forEach(fe => {
              fe.mesh.position.x += speed * 1.6;
              if (fe.mesh.position.x > 2.2) {
                fe.mesh.position.x = -2.2;
              }
            });

            // 핀 뿌리 잔여 누설 미세 이동
            item.rootLeakage.forEach(lp => {
              lp.position.x -= speed * 0.8;
              if (lp.position.x < -2.0) {
                lp.position.x = 2.0;
              }
            });
          }
          else if (item.subMode === 'gaa') {
            // 3단 나노시트 전체를 360° 관통하는 전자 고속 이동 (누설전류 0%)
            item.gaaElectrons.forEach(ge => {
              ge.mesh.position.x += speed * 1.8;
              if (ge.mesh.position.x > 2.0) {
                ge.mesh.position.x = -2.0;
                ge.mesh.position.z = -1.0 + Math.random() * 2.0;
              }
            });
          }
        }
        else if (item.type === 'patterning_playback') {
          // 🔄 단위 패터닝 8단계 실시간 물리 애니메이션
          if (item.precursors) {
            item.precursors.forEach((pMesh, i) => {
              const fall = (now * 0.003 + i * 0.08) % 1.0;
              pMesh.position.y = 2.4 - fall * 2.4;
            });
          }
          if (item.plasmaIons) {
            item.plasmaIons.forEach((ion, i) => {
              const fall = (now * 0.004 + i * 0.07) % 1.0;
              ion.position.y = 2.4 - fall * 2.4;
            });
          }
          if (item.euvBeams) {
            item.euvBeams.forEach(beam => {
              beam.material.opacity = 0.35 + Math.sin(now * 0.008) * 0.22;
            });
          }
          if (item.dopantShower) {
            item.dopantShower.forEach((d, i) => {
              const fall = (now * 0.005 + i * 0.06) % 1.0;
              d.position.y = 2.4 - fall * 2.4;
            });
          }
          if (item.pulseLabels) {
            item.pulseLabels.forEach(lbl => {
              lbl.scale.set(4.6 + Math.sin(now * 0.004) * 0.2, 0.7 + Math.sin(now * 0.004) * 0.04, 1.0);
            });
          }
        }
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  function getCurrentStageInfo() {
    if (renderMode === 'patterning') {
      const patTitles = [
        '① [스택 전면증착] SiO₂ 산화막 + 금색 게이트 금속(TiN) 웨이퍼 전면 2중 도포 (Subtractive 공정)',
        '② [포토 패터닝] 금색 금속 위에 PR 도포 ➔ EUV 노광 ➔ 현상으로 중앙 PR 방패 형성',
        '③ [게이트 기둥식각] [금속 + 산화막]을 한꺼번에 수직 식각 ➔ [산화막+금색] 기둥 완성!',
        '④ [질화막 전면코팅] 게이트 기둥 위에 Si₃N₄ 10nm 균일 전면 코팅 (옆구리는 100nm 깊이)',
        '⑤ [방패막 에치백] 마스크 없이 수직 10nm만 깎기 ➔ 옆구리에만 초승달 방패막(Spacer) 완성!',
        '⑥ [자가정합 주입] [게이트 + 스페이서]를 천연 방패 삼아 좌/우에 n⁺ 소스/드레인 형성',
        '⑦ [실리사이드] 소스/드레인 표면에 초저저항 금속-실리콘 합금막(NiSi) 구축',
        '⑧ [컨택 단자완성] ILD 절연막 매립 ➔ 수직 구멍 뚫기 ➔ 텅스텐(W) 못 박아 3단자 완성!'
      ];
      return patTitles[patterningStep] || '단위 패터닝 8단계 루프';
    }
    if (renderMode === 'evolution') {
      if (evolutionSubMode === 'planar') {
        return '2D Planar MOSFET: 상단 1면 게이트 제어 · 기판 깊은 곳으로 단채널 누설전류(DIBL) 발생 (28nm 한계)';
      } else if (evolutionSubMode === 'finfet') {
        return '3D FinFET: 좌/상/우 3면 입체 게이트 장악 · 유효 채널 폭 2.5배 확대 및 바닥 뿌리 잔여 누설';
      } else {
        return '차세대 GAA: 3단 공중부양 나노시트 4면 360° 완벽 밀봉 · 바닥 틈새 ALD 충진으로 누설 제로 (HBM4 베이스 다이)';
      }
    }
    const stages = STAGE_DEFINITIONS[currentProcessId] || STAGE_DEFINITIONS['default'];
    for (const st of stages) {
      if (playback.progress <= st.threshold) {
        return st.name;
      }
    }
    return stages[stages.length - 1].name;
  }

  // Public Interface
  return {
    init: init,
    switchProcess: function(processId) {
      currentProcessId = processId;
      playback.progress = 0.0;
      buildScene();
    },
    setRenderMode: function(mode) {
      if (mode !== 'equip' && mode !== 'micro' && mode !== 'evolution' && mode !== 'patterning') return;
      renderMode = mode;
      buildScene();
    },
    getRenderMode: function() {
      return renderMode;
    },
    setPatterningStep: function(stepIdx) {
      patterningStep = Math.max(0, Math.min(7, stepIdx));
      renderMode = 'patterning';
      playback.progress = 0.0;
      buildScene();
    },
    getPatterningStep: function() {
      return patterningStep;
    },
    setEvolutionSubMode: function(subMode) {
      if (subMode !== 'planar' && subMode !== 'finfet' && subMode !== 'gaa') return;
      evolutionSubMode = subMode;
      renderMode = 'evolution';
      buildScene();
    },
    getEvolutionSubMode: function() {
      return evolutionSubMode;
    },
    toggleCutaway: function() {
      isCutawayActive = !isCutawayActive;
      buildScene();
      return isCutawayActive;
    },
    getCutaway: function() {
      return isCutawayActive;
    },
    toggleCurrentFlow: function() {
      isCurrentFlowActive = !isCurrentFlowActive;
      return isCurrentFlowActive;
    },
    getCurrentFlow: function() {
      return isCurrentFlowActive;
    },
    play: function() { playback.isPlaying = true; },
    pause: function() { playback.isPlaying = false; },
    togglePlay: function() {
      playback.isPlaying = !playback.isPlaying;
      return playback.isPlaying;
    },
    setProgress: function(val) {
      playback.progress = Math.max(0, Math.min(1, val));
    },
    setSpeed: function(speed) {
      playback.speed = speed;
    },
    getProgress: function() {
      return playback.progress;
    },
    isPlaying: function() {
      return playback.isPlaying;
    },
    onProgressUpdate: function(cb) {
      onProgressCallback = cb;
    },
    getCurrentStageText: getCurrentStageInfo,
    resetCamera: resetCamera,
    resize: onWindowResize
  };
})();

