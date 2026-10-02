/**
 * ═══════════════════════════════════════════════════════════════════════
 * Virtual Fab & Packaging Twin — Main Application Orchestrator
 * State Management, Telemetry Binding, and FDC Console Logic
 * ═══════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Application State
  const state = {
    currentView: 'overview', // 'overview' vs 'deepdive' vs 'evolution'
    currentProcessId: 'p01', // 웨이퍼 제조 & 세정 기본 시작
    current3DMode: 'equip',  // 대표 장비 외형 모드 기본 활성화
    currentEvolutionSubMode: 'gaa', // 'planar' vs 'finfet' vs 'gaa'
    activeLoop: 'feol',
    alarms: [
      { id: 'al-01', time: '18:24:12', type: 'auto', title: 'HBM 12단 본딩 헤드 4축 틸트 편차 (0.35µm ➔ 0.42µm)', sub: 'SK하이닉스 MR-MUF 라인 피에조 서보 자동 보정 실행 완료', procId: 'p13' },
      { id: 'al-02', time: '18:21:05', type: 'warn', title: 'AMAT CMP 2번 연마 패드 그루브 잔여 깊이 480µm 진입', sub: '소모품 한계(400µm) 접근으로 차기 교대조(Shift B) 정기 PM 자동 예약', procId: 'p08' },
      { id: 'al-03', time: '18:18:40', type: 'auto', title: 'ASML High-NA EUV 웨이퍼 척 0.24µrad 레벨링 드리프트', sub: 'Twinscan 피에조 듀얼 스테이지 실시간 수평도 피드백 복원', procId: 'p03' },
      { id: 'al-04', time: '18:15:22', type: 'auto', title: 'Lam 식각 챔버 스로틀 밸브 θ=28.4° ➔ 30.1° 개도율 보정', sub: '플라즈마 폴리머 증착에 따른 나비에-스토크스 APC 무중단 배기 제어', procId: 'p04' }
    ]
  };

  // DOM Elements
  const overviewView = document.getElementById('view-fab-overview');
  const deepdiveView = document.getElementById('view-deep-dive');
  const crumbCurrent = document.getElementById('crumb-cur');
  const btnViewOverview = document.getElementById('btn-top-overview');
  const btnViewCockpit = document.getElementById('btn-top-cockpit');
  const btnViewEvolution = document.getElementById('btn-top-evolution');
  const btnModeEvo = document.getElementById('btn-3d-evo');
  const evolutionSubbar = document.getElementById('evolution-subbar');
  const btnEvoCutaway = document.getElementById('btn-evo-cutaway');
  const btnEvoFlow = document.getElementById('btn-evo-flow');
  const btnModePat = document.getElementById('btn-3d-pat');
  const patterningSubbar = document.getElementById('patterning-subbar');
  const hudPatterningCard = document.getElementById('hud-patterning-card');

  // Initialize Three.js Engine
  setTimeout(() => {
    Fab3DEngine.init('fab-3d-canvas', 'canvas-3d-wrapper');
    Fab3DEngine.switchProcess(state.currentProcessId);
    Fab3DEngine.setRenderMode(state.current3DMode);
  }, 100);

  // ─────────────────────────────────────────────────────────────────
  // 1. 네비게이션 & 뷰 라우팅
  // ─────────────────────────────────────────────────────────────────
  function switchView(viewName, processId = null) {
    if (viewName === 'evolution') {
      activateEvolutionMode(state.currentEvolutionSubMode || 'gaa');
      return;
    }

    state.currentView = viewName;
    if (processId) {
      state.currentProcessId = processId;
    }

    // Hide evolution and patterning subbar when in standard views
    if (evolutionSubbar) evolutionSubbar.style.display = 'none';
    if (patterningSubbar) patterningSubbar.style.display = 'none';
    if (hudPatterningCard) hudPatterningCard.style.display = 'none';
    if (btnViewEvolution) btnViewEvolution.classList.remove('active');
    if (btnModeEvo) btnModeEvo.classList.remove('active');
    if (btnModePat) btnModePat.classList.remove('active');
    stopPatAutoPlay();

    // Sidebar active item update
    document.querySelectorAll('.nav-item').forEach(item => {
      const target = item.getAttribute('data-target');
      if (viewName === 'overview' && target === 'overview') {
        item.classList.add('active');
      } else if (viewName === 'deepdive' && target === state.currentProcessId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (viewName === 'overview') {
      overviewView.style.display = 'flex';
      deepdiveView.style.display = 'none';
      btnViewOverview.classList.add('active');
      btnViewCockpit.classList.remove('active');
      crumbCurrent.textContent = '팹 전경 요약 (Virtual Fab Map)';
    } else {
      overviewView.style.display = 'none';
      deepdiveView.style.display = 'block';
      btnViewOverview.classList.remove('active');
      btnViewCockpit.classList.add('active');

      if (state.current3DMode === 'evolution') {
        state.current3DMode = 'equip';
      }

      const proc = FAB_PROCESSES[state.currentProcessId];
      if (proc) {
        crumbCurrent.textContent = `${proc.stepNum}. ${proc.nameKo} (${proc.tag})`;
        updateDeepDiveCockpit(proc);
        Fab3DEngine.switchProcess(proc.id);
        Fab3DEngine.setRenderMode(state.current3DMode);
        requestAnimationFrame(() => {
          Fab3DEngine.resize();
        });
      }
    }
  }

  // Sidebar clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      if (target === 'overview') {
        switchView('overview');
      } else if (target === 'evolution') {
        switchView('evolution');
      } else {
        switchView('deepdive', target);
      }
    });
  });

  // Topbar View Mode Buttons
  btnViewOverview.addEventListener('click', () => switchView('overview'));
  btnViewCockpit.addEventListener('click', () => switchView('deepdive', state.currentProcessId));
  if (btnViewEvolution) {
    btnViewEvolution.addEventListener('click', () => switchView('evolution'));
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. 공정 루프 스위처 & 건축 평면도 지도 (Architectural Fab Map)
  // ─────────────────────────────────────────────────────────────────
  const blueprintSvg = document.getElementById('fab-blueprint-svg');
  const flowFeol = document.getElementById('flow-feol');
  const flowBeol = document.getElementById('flow-beol');
  const flowHbm = document.getElementById('flow-hbm');

  function activateLoop(loopKey) {
    state.activeLoop = loopKey;
    const loop = FAB_LOOPS[loopKey];
    if (!loop) return;

    // Loop switcher button UI
    document.querySelectorAll('.loop-switch-btn').forEach(btn => {
      if (btn.getAttribute('data-loop') === loopKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle SVG flow lines
    if (flowFeol) flowFeol.style.display = (loopKey === 'feol') ? 'block' : 'none';
    if (flowBeol) flowBeol.style.display = (loopKey === 'beol') ? 'block' : 'none';
    if (flowHbm) flowHbm.style.display = (loopKey === 'hbm') ? 'block' : 'none';

    // Highlight map bay rooms on blueprint
    document.querySelectorAll('.map-bay-group').forEach(bay => {
      const pid = bay.getAttribute('data-pid');
      if (loop.path.includes(pid)) {
        if (loop.zoneFocus === 'zone-b') {
          bay.classList.add('active-flow-back');
          bay.classList.remove('active-flow');
        } else {
          bay.classList.add('active-flow');
          bay.classList.remove('active-flow-back');
        }
      } else {
        bay.classList.remove('active-flow');
        bay.classList.remove('active-flow-back');
      }
    });
  }

  document.querySelectorAll('.loop-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activateLoop(btn.getAttribute('data-loop'));
    });
  });

  // Map Bay Clicks (Directly inspect in 3D deep dive cockpit)
  document.querySelectorAll('.map-bay-group, .fab-station-card').forEach(bay => {
    bay.addEventListener('click', () => {
      const pid = bay.getAttribute('data-pid');
      state.currentProcessId = pid;
      updateStepNavUI(pid);
      switchView('deepdive', pid);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 2-1. 2D 스마트 팹 순차 네비게이션 & 투어 컨트롤러
  // ─────────────────────────────────────────────────────────────────
  const ALL_PROCESS_IDS = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14'];
  const btnStepPrev = document.getElementById('btn-step-prev');
  const btnStepNext = document.getElementById('btn-step-next');
  const btnStepTour = document.getElementById('btn-step-tour');
  const btnStepDive = document.getElementById('btn-step-dive');
  const stepNavNum = document.getElementById('step-nav-num');
  const stepNavName = document.getElementById('step-nav-name');
  const stepNavVendor = document.getElementById('step-nav-vendor');

  let tourInterval = null;

  function updateStepNavUI(pid) {
    const proc = FAB_PROCESSES[pid];
    if (!proc) return;
    const idx = ALL_PROCESS_IDS.indexOf(pid);

    if (stepNavNum) stepNavNum.textContent = `STEP ${String(idx + 1).padStart(2, '0')} / 14`;
    if (stepNavName) stepNavName.textContent = proc.cuteName ? `${proc.cuteName} (${proc.nameEn})` : `${proc.stepNum}. ${proc.nameKo} (${proc.nameEn})`;
    if (stepNavVendor) stepNavVendor.textContent = `${proc.keyEquipment} · ${proc.vendorLeader}`;

    document.querySelectorAll('.map-bay-group, .fab-station-card').forEach(bay => {
      if (bay.getAttribute('data-pid') === pid) {
        bay.classList.add('active-step');
      } else {
        bay.classList.remove('active-step');
      }
    });
  }

  function advanceStep(delta) {
    let curIdx = ALL_PROCESS_IDS.indexOf(state.currentProcessId);
    if (curIdx === -1) curIdx = 0;
    let nextIdx = (curIdx + delta + ALL_PROCESS_IDS.length) % ALL_PROCESS_IDS.length;
    state.currentProcessId = ALL_PROCESS_IDS[nextIdx];
    updateStepNavUI(state.currentProcessId);

    if (state.currentView === 'deepdive') {
      switchView('deepdive', state.currentProcessId);
    }
  }

  if (btnStepPrev) btnStepPrev.addEventListener('click', () => advanceStep(-1));
  if (btnStepNext) btnStepNext.addEventListener('click', () => advanceStep(1));

  if (btnStepTour) {
    btnStepTour.addEventListener('click', () => {
      if (tourInterval) {
        clearInterval(tourInterval);
        tourInterval = null;
        btnStepTour.classList.remove('active');
        btnStepTour.textContent = '▶ 공정 자동 순회 (Tour)';
      } else {
        btnStepTour.classList.add('active');
        btnStepTour.textContent = '⏸ 투어 일시정지';
        tourInterval = setInterval(() => {
          advanceStep(1);
        }, 2600);
      }
    });
  }

  if (btnStepDive) {
    btnStepDive.addEventListener('click', () => {
      switchView('deepdive', state.currentProcessId);
    });
  }

  // Initial step nav UI sync
  updateStepNavUI(state.currentProcessId);

  // Map Zoom View Buttons
  const btnMapAll = document.getElementById('btn-map-all');
  const btnMapZoneA = document.getElementById('btn-map-zone-a');
  const btnMapZoneB = document.getElementById('btn-map-zone-b');

  function setMapView(box, activeBtn) {
    if (blueprintSvg) {
      blueprintSvg.setAttribute('viewBox', box);
    }
    [btnMapAll, btnMapZoneA, btnMapZoneB].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  function filterPipelineZones(zone) {
    const feol = document.getElementById('zone-section-feol');
    const beol = document.getElementById('zone-section-beol');
    const pkg = document.getElementById('zone-section-pkg');
    if (!feol || !beol || !pkg) return;

    if (zone === 'all') {
      feol.style.display = 'block';
      beol.style.display = 'block';
      pkg.style.display = 'block';
    } else if (zone === 'a') {
      feol.style.display = 'block';
      beol.style.display = 'block';
      pkg.style.display = 'none';
    } else if (zone === 'b') {
      feol.style.display = 'none';
      beol.style.display = 'none';
      pkg.style.display = 'block';
    }
  }

  if (btnMapAll) btnMapAll.addEventListener('click', () => {
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.remove('active'));
    btnMapAll.classList.add('active');
    filterPipelineZones('all');
  });
  if (btnMapZoneA) btnMapZoneA.addEventListener('click', () => {
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.remove('active'));
    btnMapZoneA.classList.add('active');
    filterPipelineZones('a');
  });
  if (btnMapZoneB) btnMapZoneB.addEventListener('click', () => {
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.remove('active'));
    btnMapZoneB.classList.add('active');
    filterPipelineZones('b');
  });

  // ─────────────────────────────────────────────────────────────────
  // 3. 3D 콕핏 렌더 모드, 타임라인 재생 컨트롤러 & 텔레메트리 바인딩
  // ─────────────────────────────────────────────────────────────────
  const btnModeEquip = document.getElementById('btn-3d-equip');
  const btnModeMicro = document.getElementById('btn-3d-micro');
  const btnResetCamera = document.getElementById('btn-3d-reset');

  btnModeEquip.addEventListener('click', () => {
    state.current3DMode = 'equip';
    stopPatAutoPlay();
    if (state.currentView !== 'deepdive') {
      state.currentView = 'deepdive';
      overviewView.style.display = 'none';
      deepdiveView.style.display = 'block';
      btnViewOverview.classList.remove('active');
      btnViewCockpit.classList.add('active');
    }
    btnModeEquip.classList.add('active');
    btnModeMicro.classList.remove('active');
    if (btnModePat) btnModePat.classList.remove('active');
    if (btnModeEvo) btnModeEvo.classList.remove('active');
    if (btnViewEvolution) btnViewEvolution.classList.remove('active');
    if (evolutionSubbar) evolutionSubbar.style.display = 'none';
    if (patterningSubbar) patterningSubbar.style.display = 'none';
    if (hudPatterningCard) hudPatterningCard.style.display = 'none';

    const proc = FAB_PROCESSES[state.currentProcessId];
    if (proc) {
      if (crumbCurrent) crumbCurrent.textContent = `${proc.stepNum}. ${proc.nameKo} (${proc.tag})`;
      updateDeepDiveCockpit(proc);
      Fab3DEngine.switchProcess(proc.id);
      Fab3DEngine.setRenderMode('equip');
      updateHudLabels();
    }
  });

  btnModeMicro.addEventListener('click', () => {
    state.current3DMode = 'micro';
    stopPatAutoPlay();
    if (state.currentView !== 'deepdive') {
      state.currentView = 'deepdive';
      overviewView.style.display = 'none';
      deepdiveView.style.display = 'block';
      btnViewOverview.classList.remove('active');
      btnViewCockpit.classList.add('active');
    }
    btnModeMicro.classList.add('active');
    btnModeEquip.classList.remove('active');
    if (btnModePat) btnModePat.classList.remove('active');
    if (btnModeEvo) btnModeEvo.classList.remove('active');
    if (btnViewEvolution) btnViewEvolution.classList.remove('active');
    if (evolutionSubbar) evolutionSubbar.style.display = 'none';
    if (patterningSubbar) patterningSubbar.style.display = 'none';
    if (hudPatterningCard) hudPatterningCard.style.display = 'none';

    const proc = FAB_PROCESSES[state.currentProcessId];
    if (proc) {
      if (crumbCurrent) crumbCurrent.textContent = `${proc.stepNum}. ${proc.nameKo} (${proc.tag})`;
      updateDeepDiveCockpit(proc);
      Fab3DEngine.switchProcess(proc.id);
      Fab3DEngine.setRenderMode('micro');
      updateHudLabels();
    }
  });

  if (btnModePat) {
    btnModePat.addEventListener('click', () => {
      activatePatterningLoopMode(currentPatStepIndex || 0);
    });
  }

  // 🔄 단위 패터닝 7단계 서브바 버튼 리스너
  document.querySelectorAll('.pat-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      stopPatAutoPlay();
      const sIdx = parseInt(btn.getAttribute('data-pat-step'), 10);
      setPatterningStep(sIdx);
    });
  });

  const btnPatPlay = document.getElementById('btn-pat-play');
  if (btnPatPlay) {
    btnPatPlay.addEventListener('click', () => {
      if (patAutoPlayTimer) {
        stopPatAutoPlay();
      } else {
        btnPatPlay.classList.add('active');
        btnPatPlay.textContent = '⏸ 일시정지';
        patAutoPlayTimer = setInterval(() => {
          let nextIdx = (currentPatStepIndex + 1) % PATTERNING_LOOP_STEPS.length;
          setPatterningStep(nextIdx);
        }, 3800);
      }
    });
  }

  const btnPatPrevStep = document.getElementById('btn-pat-prev-step');
  const btnPatNextStep = document.getElementById('btn-pat-next-step');
  const btnPatClose = document.getElementById('btn-pat-close');
  const btnPatToggleDetails = document.getElementById('btn-pat-toggle-details');

  if (btnPatPrevStep) {
    btnPatPrevStep.addEventListener('click', () => {
      stopPatAutoPlay();
      setPatterningStep(currentPatStepIndex - 1);
    });
  }
  if (btnPatNextStep) {
    btnPatNextStep.addEventListener('click', () => {
      stopPatAutoPlay();
      setPatterningStep(currentPatStepIndex + 1);
    });
  }
  if (btnPatToggleDetails && hudPatterningCard) {
    btnPatToggleDetails.addEventListener('click', () => {
      const isCollapsed = hudPatterningCard.classList.toggle('collapsed');
      btnPatToggleDetails.textContent = isCollapsed ? '📖 해설 펼치기 ▾' : '📖 해설 접기 ▴';
    });
  }
  if (btnPatClose) {
    btnPatClose.addEventListener('click', () => {
      stopPatAutoPlay();
      if (hudPatterningCard) hudPatterningCard.style.display = 'none';
    });
  }

  const btnPatHelp = document.getElementById('btn-pat-help');
  const modalPat = document.getElementById('modal-patterning-principle');
  const btnModalClose = document.getElementById('btn-modal-close');

  if (btnPatHelp && modalPat) {
    btnPatHelp.addEventListener('click', () => {
      modalPat.style.display = 'flex';
    });
  }
  if (btnModalClose && modalPat) {
    btnModalClose.addEventListener('click', () => {
      modalPat.style.display = 'none';
    });
  }
  if (modalPat) {
    modalPat.addEventListener('click', (e) => {
      if (e.target === modalPat) {
        modalPat.style.display = 'none';
      }
    });
  }

  if (btnModeEvo) {
    btnModeEvo.addEventListener('click', () => {
      activateEvolutionMode(state.currentEvolutionSubMode || 'gaa');
    });
  }

  // ⚡ 소자 진화 전용 서브바 버튼 리스너
  document.querySelectorAll('.evo-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const evoMode = btn.getAttribute('data-evo');
      activateEvolutionMode(evoMode);
    });
  });

  if (btnEvoCutaway) {
    btnEvoCutaway.addEventListener('click', () => {
      const isCut = Fab3DEngine.toggleCutaway();
      if (isCut) {
        btnEvoCutaway.classList.add('active');
        btnEvoCutaway.textContent = '👁️ 일반 외형 모드';
      } else {
        btnEvoCutaway.classList.remove('active');
        btnEvoCutaway.textContent = '🔍 X-Ray 투시 모드';
      }
    });
  }

  if (btnEvoFlow) {
    btnEvoFlow.addEventListener('click', () => {
      const isFlow = Fab3DEngine.toggleCurrentFlow();
      if (isFlow) {
        btnEvoFlow.classList.add('active');
        btnEvoFlow.textContent = '⚡ 전자·누설전류 ON';
      } else {
        btnEvoFlow.classList.remove('active');
        btnEvoFlow.textContent = '⏸ 전자·누설전류 OFF';
      }
    });
  }

  btnResetCamera.addEventListener('click', () => {
    Fab3DEngine.resetCamera();
  });

  // ⚡ 3D 타임라인 재생/일시정지/스크러버 컨트롤러
  const btnPbPlay = document.getElementById('btn-pb-play');
  const btnPbPrev = document.getElementById('btn-pb-prev');
  const btnPbNext = document.getElementById('btn-pb-next');
  const timelineSlider = document.getElementById('timeline-slider');
  const timelineStageText = document.getElementById('timeline-stage-text');
  const timelinePctText = document.getElementById('timeline-pct-text');

  if (btnPbPlay) {
    btnPbPlay.addEventListener('click', () => {
      const isPlaying = Fab3DEngine.togglePlay();
      btnPbPlay.textContent = isPlaying ? '⏸' : '▶';
    });
  }

  if (btnPbPrev) {
    btnPbPrev.addEventListener('click', () => {
      Fab3DEngine.setProgress(0.0);
    });
  }

  if (btnPbNext) {
    btnPbNext.addEventListener('click', () => {
      Fab3DEngine.setProgress(1.0);
    });
  }

  if (timelineSlider) {
    timelineSlider.addEventListener('input', (e) => {
      const p = parseFloat(e.target.value) / 1000;
      Fab3DEngine.setProgress(p);
    });
  }

  // Speed selection
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const spd = parseFloat(btn.getAttribute('data-spd'));
      Fab3DEngine.setSpeed(spd);
    });
  });

  // Hook progress updates from 3D engine to UI
  let isUserInteractingSlider = false;
  if (timelineSlider) {
    timelineSlider.addEventListener('mousedown', () => { isUserInteractingSlider = true; });
    timelineSlider.addEventListener('mouseup', () => { isUserInteractingSlider = false; });
  }

  Fab3DEngine.onProgressUpdate((progress, stageText) => {
    if (!isUserInteractingSlider && timelineSlider) {
      timelineSlider.value = Math.round(progress * 1000);
    }
    if (timelinePctText) {
      timelinePctText.textContent = `${Math.round(progress * 100)}%`;
    }
    if (timelineStageText) {
      timelineStageText.textContent = stageText;
    }
  });

  function updateHudLabels() {
    const proc = FAB_PROCESSES[state.currentProcessId];
    if (!proc) return;

    if (btnModePat && btnModePat.classList.contains('active')) return;
    if (btnModeEvo && btnModeEvo.classList.contains('active')) return;

    if (btnModeEquip && btnModeMicro) {
      if (state.current3DMode === 'equip') {
        btnModeEquip.classList.add('active');
        btnModeMicro.classList.remove('active');
      } else {
        btnModeMicro.classList.add('active');
        btnModeEquip.classList.remove('active');
      }
    }

    const hudModeTitle = document.getElementById('hud-mode-title');
    const hudEquipName = document.getElementById('hud-equip-name');
    const hudVendorName = document.getElementById('hud-vendor-name');

    if (hudModeTitle) {
      hudModeTitle.textContent = (state.current3DMode === 'equip') ? '대표 장비 외형' : '단면 미세 시뮬레이션';
    }
    if (hudEquipName) {
      hudEquipName.textContent = proc.keyEquipment;
    }
    if (hudVendorName) {
      hudVendorName.textContent = proc.vendorLeader;
    }
  }

  function updateDeepDiveCockpit(proc) {
    // Top Hero Labels
    const procTitle = document.getElementById('dd-proc-title');
    const procSub = document.getElementById('dd-proc-sub');
    const procTag = document.getElementById('dd-proc-tag');

    if (procTitle) procTitle.textContent = `${proc.stepNum}. ${proc.nameKo} (${proc.nameEn})`;
    if (procSub) procSub.textContent = proc.cuteSummary || proc.summary;
    if (procTag) procTag.textContent = proc.tag;

    updateHudLabels();

    // 텔레메트리 게이지 업데이트
    const telemContainer = document.getElementById('telemetry-rows-container');
    if (telemContainer && proc.telemetry) {
      telemContainer.innerHTML = '';
      proc.telemetry.forEach(t => {
        const pct = Math.min(100, Math.max(0, ((t.val - t.min) / (t.max - t.min)) * 100));
        const row = document.createElement('div');
        row.className = 'telemetry-row';
        row.innerHTML = `
          <div class="telem-header">
            <span class="telem-name">${t.name}</span>
            <div class="telem-val-wrap font-mono">
              <span class="telem-val">${t.val}</span>
              <span class="telem-unit">${t.unit}</span>
            </div>
          </div>
          <div class="telem-bar-track">
            <div class="telem-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="telem-meta">
            <span>Min: ${t.min}</span>
            <span>Target: ${t.target}</span>
            <span>Max: ${t.max}</span>
          </div>
        `;
        telemContainer.appendChild(row);
      });
    }

    // 🎯 공정 핵심 품질 관리 지표 (CTQ / Control Points) 렌더링
    const ctqContainer = document.getElementById('ctq-grid-container');
    if (ctqContainer && proc.controlPoints) {
      ctqContainer.innerHTML = '';
      proc.controlPoints.forEach(cp => {
        const card = document.createElement('div');
        card.className = 'ctq-item-card';
        card.innerHTML = `
          <div class="ctq-item-head">
            <span class="ctq-item-param">${cp.param}</span>
            <span class="ctq-item-target">${cp.target}</span>
          </div>
          <span class="ctq-item-tool">${cp.tool}</span>
          <div class="ctq-item-purpose">${cp.purpose}</div>
        `;
        ctqContainer.appendChild(card);
      });
    }

    // ⚡ 전기공학도 맞춤: MOSFET 소자 구조 & 공정 원리 분석 렌더링
    const eeContainer = document.getElementById('ee-analysis-container');
    if (eeContainer && proc.eeAnalysis) {
      const ee = proc.eeAnalysis;
      let metricsHtml = '';
      if (ee.keyMetricsSummary) {
        metricsHtml = `
          <div class="ee-metrics-summary-grid">
            ${ee.keyMetricsSummary.map(m => `
              <div class="ee-metric-pill">
                <span class="ee-m-label">${m.label}</span>
                <span class="ee-m-spec">${m.spec}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      eeContainer.innerHTML = `
        <div class="ee-part-badge">
          <span class="ee-part-icon">🎯</span>
          <span>대상 소자 부위: ${ee.targetPart}</span>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title">🛠️ 공정 수행 목적 &amp; 물리적 원리</div>
          <p class="ee-sec-desc">${ee.whyWeDoThis}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title">🏛️ MOSFET 구조에서의 역할</div>
          <p class="ee-sec-desc">${ee.structuralRole}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title mechanism">💡 전기적 동작 메커니즘 (Vth / 채널 / 스위칭 / 지연)</div>
          <p class="ee-sec-desc">${ee.electricalMechanism}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title warning">⚠️ 공정 불량 시 발생하는 소자 결함 &amp; 전기적 참사</div>
          <p class="ee-sec-desc">${ee.defectImpact}</p>
        </div>

        ${metricsHtml}
      `;
    }

    // 🏢 글로벌 장비사 및 최신 기술 동향 카드
    const vhTitle = document.getElementById('vh-title');
    const vhTech = document.getElementById('vh-tech');
    const vhDesc = document.getElementById('vh-desc');

    if (vhTitle) vhTitle.textContent = proc.vendorFrontier.leader;
    if (vhTech) vhTech.textContent = proc.vendorFrontier.flagshipTech;
    if (vhDesc) vhDesc.textContent = proc.vendorFrontier.details;
  }

  // ─────────────────────────────────────────────────────────────────
  // 3-1. 🔬 트랜지스터 소자 진화 전용 콕핏 활성화 & UI 바인딩
  // ─────────────────────────────────────────────────────────────────
  function activateEvolutionMode(subMode = 'gaa') {
    state.currentView = 'evolution';
    state.current3DMode = 'evolution';
    state.currentEvolutionSubMode = subMode;

    stopPatAutoPlay();
    if (patterningSubbar) patterningSubbar.style.display = 'none';
    if (hudPatterningCard) hudPatterningCard.style.display = 'none';
    if (btnModePat) btnModePat.classList.remove('active');

    // View toggling: show deepdive view container (which hosts the 3D canvas)
    overviewView.style.display = 'none';
    deepdiveView.style.display = 'block';

    // Topbar
    btnViewOverview.classList.remove('active');
    btnViewCockpit.classList.remove('active');
    if (btnViewEvolution) btnViewEvolution.classList.add('active');

    // Sidebar: activate EVO nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-target') === 'evolution') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 3D mode buttons
    btnModeEquip.classList.remove('active');
    btnModeMicro.classList.remove('active');
    if (btnModePat) btnModePat.classList.remove('active');
    if (btnModeEvo) btnModeEvo.classList.add('active');

    // Evolution subbar
    if (evolutionSubbar) {
      evolutionSubbar.style.display = 'flex';
      document.querySelectorAll('.evo-pill-btn').forEach(btn => {
        if (btn.getAttribute('data-evo') === subMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const evoData = (typeof TRANSISTOR_EVOLUTION_DATA !== 'undefined') ? TRANSISTOR_EVOLUTION_DATA[subMode] : null;
    if (crumbCurrent && evoData) {
      crumbCurrent.textContent = `소자 진화 3D / ${evoData.nameKo}`;
    }

    // Three.js Engine Switch
    Fab3DEngine.setEvolutionSubMode(subMode);
    requestAnimationFrame(() => {
      Fab3DEngine.resize();
    });

    // Update Deep Dive Cockpit UI with Evolution Data
    if (evoData) {
      updateEvolutionCockpitUI(evoData);
    }
  }

  function updateEvolutionCockpitUI(evoData) {
    if (!evoData) return;

    // Top Hero Labels
    const procTitle = document.getElementById('dd-proc-title');
    const procSub = document.getElementById('dd-proc-sub');
    const procTag = document.getElementById('dd-proc-tag');

    if (procTitle) procTitle.textContent = `${evoData.nameKo} (${evoData.gateType})`;
    if (procSub) procSub.textContent = evoData.summary;
    if (procTag) procTag.textContent = `소자 진화 · ${evoData.era}`;

    // HUD Labels
    const hudModeTitle = document.getElementById('hud-mode-title');
    const hudEquipName = document.getElementById('hud-equip-name');
    const hudVendorName = document.getElementById('hud-vendor-name');

    if (hudModeTitle) hudModeTitle.textContent = `소자 진화 3D (${evoData.gateType})`;
    if (hudEquipName) hudEquipName.textContent = `${evoData.nameEn}`;
    if (hudVendorName) hudVendorName.textContent = evoData.vendorFrontier ? evoData.vendorFrontier.leader : '글로벌 파운드리 / IDM';

    // Telemetry Gauges
    const telemContainer = document.getElementById('telemetry-rows-container');
    if (telemContainer && evoData.telemetry) {
      telemContainer.innerHTML = '';
      evoData.telemetry.forEach(t => {
        const pct = Math.min(100, Math.max(0, ((t.val - t.min) / (t.max - t.min)) * 100));
        const row = document.createElement('div');
        row.className = 'telemetry-row';
        row.innerHTML = `
          <div class="telem-header">
            <span class="telem-name">${t.name}</span>
            <div class="telem-val-wrap font-mono">
              <span class="telem-val">${t.val}</span>
              <span class="telem-unit">${t.unit}</span>
            </div>
          </div>
          <div class="telem-bar-track">
            <div class="telem-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="telem-meta">
            <span>Min: ${t.min}</span>
            <span>Target: ${t.target}</span>
            <span>Max: ${t.max}</span>
          </div>
        `;
        telemContainer.appendChild(row);
      });
    }

    // CTQ Control Points
    const ctqContainer = document.getElementById('ctq-grid-container');
    if (ctqContainer && evoData.controlPoints) {
      ctqContainer.innerHTML = '';
      evoData.controlPoints.forEach(cp => {
        const card = document.createElement('div');
        card.className = 'ctq-item-card';
        card.innerHTML = `
          <div class="ctq-item-head">
            <span class="ctq-item-param">${cp.param}</span>
            <span class="ctq-item-target">${cp.target}</span>
          </div>
          <span class="ctq-item-tool">${cp.tool}</span>
          <div class="ctq-item-purpose">${cp.purpose}</div>
        `;
        ctqContainer.appendChild(card);
      });
    }

    // EE Analysis
    const eeContainer = document.getElementById('ee-analysis-container');
    if (eeContainer && evoData.eeAnalysis) {
      const ee = evoData.eeAnalysis;
      let metricsHtml = '';
      if (ee.keyMetricsSummary) {
        metricsHtml = `
          <div class="ee-metrics-summary-grid">
            ${ee.keyMetricsSummary.map(m => `
              <div class="ee-metric-pill">
                <span class="ee-m-label">${m.label}</span>
                <span class="ee-m-spec">${m.spec}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      let hynixHtml = '';
      if (evoData.hynixStrategy) {
        const hs = evoData.hynixStrategy;
        hynixHtml = `
          <div class="hynix-strategy-card">
            <div class="hynix-strategy-head">
              <span style="font-size: 20px;">💡</span>
              <div class="hynix-strategy-title">${hs.title}</div>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 14px; line-height: 1.6;">
              ${hs.whyOutsource}
            </p>
            <div class="hynix-points-grid">
              ${hs.points.map(pt => `
                <div class="hynix-point-card">
                  <div class="hynix-point-head">${pt.head}</div>
                  <div class="hynix-point-desc">${pt.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      eeContainer.innerHTML = `
        <div class="ee-part-badge">
          <span class="ee-part-icon">🎯</span>
          <span>소자 게이트 제어 방식: ${ee.targetPart}</span>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title">🛠️ 아키텍처 도입 배경 &amp; 해결 과제</div>
          <p class="ee-sec-desc">${ee.whyWeDoThis}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title">🏛️ 소자 구조적 특성 &amp; 게이트 장악력</div>
          <p class="ee-sec-desc">${ee.structuralRole}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title mechanism">💡 전기적 동작 메커니즘 (Vth / 채널 반전층 / 전류 구동력)</div>
          <p class="ee-sec-desc">${ee.electricalMechanism}</p>
        </div>

        <div class="ee-section-block">
          <div class="ee-sec-title warning">⚠️ 바닥 누설전류(Subsurface Leakage) 및 미세화 한계</div>
          <p class="ee-sec-desc">${ee.defectImpact}</p>
        </div>

        ${metricsHtml}
        ${hynixHtml}
      `;
    }

    // Vendor Frontier
    const vhTitle = document.getElementById('vh-title');
    const vhTech = document.getElementById('vh-tech');
    const vhDesc = document.getElementById('vh-desc');

    if (evoData.vendorFrontier) {
      if (vhTitle) vhTitle.textContent = evoData.vendorFrontier.leader;
      if (vhTech) vhTech.textContent = evoData.vendorFrontier.flagshipTech;
      if (vhDesc) vhDesc.textContent = evoData.vendorFrontier.details;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // ⚡ 단위 패터닝 7단계 루프 ("왜 특정 부위에만 형성되는가?")
  // ─────────────────────────────────────────────────────────────────
  const PATTERNING_LOOP_STEPS = [
    {
      step: 1,
      title: '① [스택 전면증착] 웨이퍼 전체에 SiO₂ 산화막 + 금색 게이트 금속(TiN/Poly) 2중 도포',
      pid: 'p02',
      progress: 1.0,
      badge: 'STEP 1 / 8 · Blanket Stack Deposition',
      status: '금속을 특정 부위에만 바를 수는 없습니다! 일단 웨이퍼 전면에 분홍색 SiO₂ 절연막을 깔고, 그 바로 위에 금색 게이트 도체(TiN/Poly)를 통째로 덮어버립니다 (웨이퍼 표면 전체가 금색!).',
      mechanism: '★ "원래 금색 전체 도포하고 깎는다": 맞습니다! 나노미터 노즐은 불가능하므로, 전체를 금색으로 덮은 뒤 포토-식각으로 깎아내는 서브트랙티브(Subtractive) 방식을 씁니다.',
      eePoint: '산화막 두께(Tox)와 금속의 일함수(Φm)가 여기서 동시에 결정되어 MOSFET의 핵심 문턱전압(Vth)을 결정합니다.'
    },
    {
      step: 2,
      title: '② [포토 패터닝] 금색 금속 위에 PR 도포 ➔ EUV 노광 ➔ 현상으로 중앙 게이트 PR 방패 형성',
      pid: 'p03',
      progress: 0.65,
      badge: 'STEP 2 / 8 · Spin Coating & EUV',
      status: '웨이퍼 전체를 덮은 금색 금속 위에 노란 감광액(PR)을 바르고, EUV 빛을 쪼여 중앙 게이트 자리에만 노란 PR 방패 기둥을 남깁니다.',
      mechanism: '빛을 쬔 좌/우 PR은 현상액에 녹아 씻겨 나가고, 마스크로 가려준 중앙 8nm 채널 부위만 노란색 PR 방패가 우뚝 남습니다.',
      eePoint: '이 노광 공정에서 결정된 PR 선폭이 바로 트랜지스터의 채널 길이 Lg가 되며 전자의 주행 시간을 결정합니다.'
    },
    {
      step: 3,
      title: '③ [게이트 기둥식각] [금속 + 산화막]을 한꺼번에 수직 식각 ➔ 우뚝 솟은 게이트 기둥 완성!',
      pid: 'p04',
      progress: 0.85,
      badge: 'STEP 3 / 8 · Plasma Etch & Ashing',
      status: '진공 챔버에서 플라즈마로 PR 방패 없는 좌/우의 [금색 금속 + 분홍 산화막]을 한 칼에 바닥 실리콘 나올 때까지 싹 깎아내고 PR 방패를 태워 없앱니다.',
      mechanism: '바닥 실리콘 위에 [산화막 + 금색 메탈]로 이루어진 80nm 높이의 게이트 기둥 하나가 우뚝 솟았습니다! 좌/우는 바닥 실리콘이 훤히 노출된 상태입니다.',
      eePoint: '식각 선택비: 하부 실리콘 기판을 파먹지 않고 게이트 스택만 깔끔히 깎아야 소스/드레인 접합 손상을 막습니다.'
    },
    {
      step: 4,
      title: '④ [질화막 전면코팅] 게이트 기둥 위에 Si₃N₄ 질화막 10nm 균일 전면 코팅 (옆구리는 100nm 깊이)',
      pid: 'p06',
      progress: 0.35,
      badge: 'STEP 4 / 8 · Conformal Si₃N₄ Deposition',
      status: '★ "옆에 기둥 세우는 것도 전체 다 덮는다": 맞습니다! 게이트 기둥이 세워진 웨이퍼 전체에 하늘색 Si₃N₄ 질화막을 10nm 두께로 균일하게 싹 덮어버립니다.',
      mechanism: '평평한 바닥도 10nm, 게이트 꼭대기도 10nm 코팅됩니다. 하지만 게이트 옆구리는 80nm 높이의 수직 절벽을 감싸고 있으므로, 위에서 내려다본 수직 깊이는 약 100nm처럼 깊어집니다!',
      eePoint: '균일 증착(Conformality): ALD/CVD로 수직 절벽에도 10nm가 100% 균일하게 붙어야 균일한 방패막이 형성됩니다.'
    },
    {
      step: 5,
      title: '⑤ [방패막 에치백] 마스크 없이 수직 10nm만 깎기 ➔ 옆구리에만 초승달 방패막(Spacer) 완성!',
      pid: 'p06',
      progress: 0.55,
      badge: 'STEP 5 / 8 · Maskless Spacer Etch-back',
      status: '★ "양옆은 100이고 다른 덴 10이니까 10만 깎는다": 바로 이 원리입니다! 포토마스크 없이 위에서 아래로 플라즈마를 쏴서 딱 10nm 두께만큼만 균일하게 깎아냅니다.',
      mechanism: '바닥(10nm)과 게이트 머리(10nm)는 플라즈마에 맞아 다 깎여나가지만, 옆구리(100nm)는 10nm만 깎이고 90nm가 그대로 남아 초승달 모양 방패막(Spacer)이 완성됩니다!',
      eePoint: '사이드월 스페이서(Spacer)의 두께가 다음 단계 이온주입을 채널 밖으로 밀어내어, 열처리 때 도펀트가 채널 밑으로 퍼져 소스-드레인이 쇼트(Punch-through) 나는 참사를 100% 차단합니다.'
    },
    {
      step: 6,
      title: '⑥ [자가정합 주입] [게이트 + 스페이서]를 천연 방패 삼아 좌/우에 n⁺ 소스/드레인 형성',
      pid: 'p05',
      progress: 0.85,
      badge: 'STEP 6 / 8 · Self-Aligned S/D Implant',
      status: '웨이퍼 전체에 고에너지 비소(As⁺) 이온 빔 샤워를 무차별 난사합니다! 중앙 [게이트 + 스페이서]가 채널을 완벽 차단하여 노출된 양옆 실리콘에만 n⁺ 소스/드레인이 박힙니다.',
      mechanism: '스페이서 방패막 덕분에 1050°C RTA 열처리를 해도 도펀트가 채널 밑으로 기어들어가지 않아 완벽한 무결점 소스/드레인 접합이 완성됩니다.',
      eePoint: '자가 정합(Self-Alignment): 사람이 조준할 필요 없이 게이트+스페이서 구조물 자체가 마스크가 되어 기생 오버랩 커패시턴스를 최소화합니다.'
    },
    {
      step: 7,
      title: '⑦ [실리사이드] 소스/드레인 표면에 초저저항 금속-실리콘 합금막(NiSi) 구축',
      pid: 'p06',
      progress: 0.75,
      badge: 'STEP 7 / 8 · Salicide Ohmic Contact',
      status: '★ "단자 만들기 1단계": 실리콘에 그냥 전선을 대면 쇼트키 장벽 때문에 전기가 막히므로, 소스/드레인 실리콘 표면에 니켈(Ni)을 증착하고 500°C로 구워 NiSi 옴 접촉층을 만듭니다.',
      mechanism: '금속과 반도체 계면의 장벽을 파괴하고, 전자가 저항 없이 쑥쑥 통과할 수 있는 초저저항 옴 접촉(Ohmic Contact)을 구축합니다.',
      eePoint: '접촉 저항(Rc)을 90% 이상 격감시켜 고주파 스위칭 시 발생하는 신호 왜곡과 RC 지연을 방지합니다.'
    },
    {
      step: 8,
      title: '⑧ [컨택 단자완성] ILD 절연막 매립 ➔ 수직 구멍 뚫기 ➔ 텅스텐(W) 못 박아 3단자 완성!',
      pid: 'p06',
      progress: 0.98,
      badge: 'STEP 8 / 8 · Contact Plugs & 3-Terminal',
      status: '★ "단자 만들기 2단계": 트랜지스터를 산화막(ILD)으로 파묻고, 소스/드레인/게이트에 수직 우물 구멍(Contact Hole)을 뚫어 텅스텐(W) 플러그 못을 박아 [S], [G], [D] 3단자를 완성합니다!',
      mechanism: '텅스텐 플러그 못 머리 위에 Metal 1(M1) 구리 배선이 닿으면서, 드디어 게이트 전압으로 켜고 끄는 완전한 3단자 스위칭 MOSFET이 완성됩니다!',
      eePoint: '이제 소스의 전자가 게이트 전압 제어에 따라 채널을 지나 드레인으로 흐르는 완벽한 3단자 반도체 전기 동작이 가능해집니다!'
    }
  ];

  let currentPatStepIndex = 0;
  let patAutoPlayTimer = null;

  function stopPatAutoPlay() {
    if (patAutoPlayTimer) {
      clearInterval(patAutoPlayTimer);
      patAutoPlayTimer = null;
      const btnPatPlay = document.getElementById('btn-pat-play');
      if (btnPatPlay) {
        btnPatPlay.classList.remove('active');
        btnPatPlay.textContent = '▶ 연속 재생';
      }
    }
  }

  function setPatterningStep(idx) {
    if (idx < 0) idx = 0;
    if (idx >= PATTERNING_LOOP_STEPS.length) idx = PATTERNING_LOOP_STEPS.length - 1;
    currentPatStepIndex = idx;
    const stepData = PATTERNING_LOOP_STEPS[idx];

    // 1. Update pill button active states
    document.querySelectorAll('.pat-pill-btn').forEach(b => {
      const bIdx = parseInt(b.getAttribute('data-pat-step'), 10);
      if (bIdx === idx) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // 2. Switch 3D process & stage
    state.currentProcessId = stepData.pid;
    state.current3DMode = 'patterning';
    updateStepNavUI(stepData.pid);
    updateDeepDiveCockpit(FAB_PROCESSES[stepData.pid]);

    if (btnModePat) btnModePat.classList.add('active');
    btnModeMicro.classList.remove('active');
    btnModeEquip.classList.remove('active');
    if (btnModeEvo) btnModeEvo.classList.remove('active');
    if (evolutionSubbar) evolutionSubbar.style.display = 'none';
    if (patterningSubbar) patterningSubbar.style.display = 'flex';

    Fab3DEngine.setPatterningStep(idx);

    // 3. Update HUD card contents
    const hudPatCard = document.getElementById('hud-patterning-card');
    const patStepBadge = document.getElementById('pat-step-badge');
    const patStepTitle = document.getElementById('pat-step-title');
    const patStatusText = document.getElementById('pat-status-text');
    const patMechText = document.getElementById('pat-mechanism-text');
    const patEeText = document.getElementById('pat-ee-text');

    if (hudPatCard) hudPatCard.style.display = 'flex';
    if (patStepBadge) patStepBadge.textContent = stepData.badge;
    if (patStepTitle) patStepTitle.textContent = stepData.title;
    if (patStatusText) patStatusText.textContent = stepData.status;
    if (patMechText) patMechText.textContent = stepData.mechanism;
    if (patEeText) patEeText.textContent = stepData.eePoint;

    // 4. Update HUD
    const hudModeTitle = document.getElementById('hud-mode-title');
    if (hudModeTitle) {
      hudModeTitle.textContent = `단위 패터닝: ${stepData.badge}`;
    }

    if (crumbCurrent) {
      crumbCurrent.textContent = `단위 패터닝 루프 / ${stepData.title}`;
    }
  }

  function activatePatterningLoopMode(stepIndex = 0) {
    if (state.currentView !== 'deepdive') {
      state.currentView = 'deepdive';
      overviewView.style.display = 'none';
      deepdiveView.style.display = 'block';
      btnViewOverview.classList.remove('active');
      btnViewCockpit.classList.add('active');
    }

    if (evolutionSubbar) evolutionSubbar.style.display = 'none';
    if (btnModeEvo) btnModeEvo.classList.remove('active');
    if (btnViewEvolution) btnViewEvolution.classList.remove('active');
    if (btnModePat) btnModePat.classList.add('active');
    btnModeMicro.classList.remove('active');
    btnModeEquip.classList.remove('active');

    setPatterningStep(stepIndex);
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. 플로팅 FDC 관제 콘솔 (#fab-console)
  // ─────────────────────────────────────────────────────────────────
  const fabConsole = document.getElementById('fab-console');
  const fabLauncher = document.getElementById('fab-launcher');
  const fabMinBtn = document.getElementById('fab-min-btn');
  const fabCloseBtn = document.getElementById('fab-close-btn');

  function openConsole() {
    fabConsole.classList.remove('hidden');
    fabLauncher.style.display = 'none';
  }

  function closeConsole() {
    fabConsole.classList.add('hidden');
    fabLauncher.style.display = 'flex';
  }

  fabLauncher.addEventListener('click', openConsole);
  fabMinBtn.addEventListener('click', closeConsole);
  fabCloseBtn.addEventListener('click', closeConsole);

  function renderAlarms(filter = 'all') {
    const listEl = document.getElementById('console-feed');
    if (!listEl) return;

    listEl.innerHTML = '';
    const filtered = (filter === 'all') ? state.alarms : state.alarms.filter(a => a.type === filter);

    let critCount = 0, warnCount = 0, autoCount = 0;
    state.alarms.forEach(a => {
      if (a.type === 'crit') critCount++;
      if (a.type === 'warn') warnCount++;
      if (a.type === 'auto') autoCount++;
    });

    const critEl = document.getElementById('fc-crit');
    const warnEl = document.getElementById('fc-warn');
    const autoEl = document.getElementById('fc-auto');
    const cntBadge = document.getElementById('fc-cnt');
    const launcherBadge = document.getElementById('fab-badge');

    if (critEl) critEl.textContent = critCount;
    if (warnEl) warnEl.textContent = warnCount;
    if (autoEl) autoEl.textContent = autoCount;
    if (cntBadge) cntBadge.textContent = state.alarms.length;
    if (launcherBadge) launcherBadge.textContent = `정상 (${state.alarms.length})`;

    filtered.forEach(alarm => {
      const item = document.createElement('div');
      item.className = `fc-feed-item ${alarm.type}`;
      item.innerHTML = `
        <div class="fc-item-head">
          <span class="fc-item-title">${alarm.title}</span>
          <span class="fc-item-time font-mono">${alarm.time}</span>
        </div>
        <div class="fc-item-sub">${alarm.sub}</div>
      `;
      listEl.appendChild(item);
    });
  }

  // FDC Tabs
  document.querySelectorAll('.fc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('on'));
      tab.classList.add('on');
      renderAlarms(tab.getAttribute('data-f'));
    });
  });

  // Initial setup
  renderAlarms('all');
  activateLoop('hbm');
  switchView('overview');
});
