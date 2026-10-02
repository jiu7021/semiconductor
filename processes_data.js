/**
 * ═══════════════════════════════════════════════════════════════════════
 * Virtual Fab & Packaging Twin — Process Specifications & Engineering Dataset
 * 14 Core Semiconductor Processes: Front-End (FEOL/BEOL) & Advanced Packaging
 * Includes CTQ Process Control Points & MOSFET Structural EE Analysis
 * ═══════════════════════════════════════════════════════════════════════
 */

const FAB_PROCESSES = {
  // ─────────────────────────────────────────────────────────────────
  // 01. 웨이퍼 제조 & 세정 (CZ 잉곳 성장 ➔ 와이어 슬라이싱 ➔ SC-1 세정)
  // ─────────────────────────────────────────────────────────────────
  'p01': {
    id: 'p01',
    category: 'front',
    subCategory: 'FEOL (기판 제조 및 세정)',
    stepNum: '01',
    nameKo: '웨이퍼 제조 & 세정',
    nameEn: 'Wafer Manufacturing (CZ Ingot) & Wet Cleaning',
    cuteName: '💎 01. 웨이퍼 제조 & 세정',
    cuteSummary: '1420°C 잉곳 인상 ➔ 와이어 슬라이싱 ➔ 래핑/식각 ➔ CMP 양면 연마로 거울면을 만든 뒤 SC-1 메가소닉 세정으로 완성해요!',
    mosfetRole: 'MOSFET 바디 기판 (P-Si Substrate / Bulk Body)',
    vendorLeader: 'SK실트론 / SUMCO · TEL · SCREEN',
    keyEquipment: 'CZ 잉곳 인상기 & CELLESTA 매엽식 세정기 (Dual Tool)',
    tag: 'FEOL Substrate',
    color: '#38bdf8',
    summary: '1420°C 실리콘 융액에서 잉곳을 회전 인상(CZ)하고 다이아몬드 와이어로 775µm 원판을 절단합니다. 절단 직후의 울퉁불퉁한 표면과 톱질 손상층은 모따기(Chamfering) ➔ 래핑(Lapping) ➔ 화학 식각(Wet Etch) ➔ 최종 양면 CMP 연마(Polishing)를 거쳐 원자 수준 거울면(Ra < 0.1nm)으로 평탄화한 후, SC-1 약액과 메가소닉 초음파로 나노 파티클을 99.8% 박리하여 완벽한 무결점 기판을 완성합니다.',
    
    equipModelType: 'wafer_prep_cleaning_dual',
    microModelType: 'p01_micro',
    
    telemetry: [
      { name: '파티클 제거율 (PRE)', val: 99.85, unit: '%', min: 95, max: 100, target: 99.8, status: 'ok' },
      { name: '금속 불순물 농도', val: 0.18, unit: '×10¹⁰ atoms/cm²', min: 0, max: 1.0, target: 0.2, status: 'ok' },
      { name: '케미컬 온도 (SC-1)', val: 65.2, unit: '°C', min: 55, max: 75, target: 65.0, status: 'ok' },
      { name: '메가소닉 주파수', val: 0.98, unit: 'MHz', min: 0.8, max: 1.2, target: 1.0, status: 'ok' }
    ],

    // 🎯 공정 핵심 품질 관리 포인트 (CTQ / Control Points)
    controlPoints: [
      {
        param: '산소/탄소 불순물 농도 (Oi/Cs)',
        target: 'Oi ≈ 1.0×10¹⁸ atoms/cm³, Cs < 1.0×10¹⁶ atoms/cm³',
        tool: 'FT-IR (적외선 흡수 분광기)',
        purpose: '적절한 산소 침전물은 중금속 결함을 포획(내부 게터링)하지만, 과도하면 열처리 중 전위 루프 및 적층 결함을 유발하므로 정밀 제어 필수'
      },
      {
        param: '원자 단위 파티클 결함수',
        target: '≥ 19nm 입자 < 10 ea/wafer',
        tool: 'KLA-Tencor Surfscan (레이저 산란 결함 검사기)',
        purpose: '19nm 이상 파티클은 게이트 산화막 절연 파괴(Pin-hole) 및 패턴 브릿지 쇼트 결함의 95% 이상을 유발하므로 99.8% 이상 제거'
      },
      {
        param: '표면 미세 거칠기 (RMS Ra)',
        target: 'Ra < 0.1 nm (원자 2~3개 층 이내)',
        tool: 'AFM (원자간력 현미경)',
        purpose: '실리콘 표면 원자 평탄도가 떨어지면 반전층 전자의 표면 거칠기 산란(Surface Roughness Scattering)으로 전자 이동도(μn)가 급락함'
      },
      {
        param: '금속 불순물 오염도 (Fe, Cu, Ni)',
        target: '< 1.0×10⁹ atoms/cm²',
        tool: 'TXRF (전반사 X선 형광 분석기)',
        purpose: '전이금속은 실리콘 밴드갭 중앙에 깊은 에너지 준위(Deep-level trap)를 만들어 소수 캐리어 수명(τ)을 단축시키고 접합 누설전류를 폭증시킴'
      }
    ],

    // ⚡ 전기공학도 맞춤: MOSFET 소자 구조 & 공정 원리 분석
    eeAnalysis: {
      targetPart: 'P-type 단결정 실리콘 기판 (MOSFET의 뿌리가 되는 Body / Substrate)',
      whyWeDoThis: '실리콘 단결정 잉곳을 고순도로 성장시키고 정밀 절단·세정하여, 수백억 개의 트랜지스터가 세워질 결함 없는 완벽한 원자 거울면을 제공하기 위해 수행합니다.',
      structuralRole: '기판은 MOSFET의 4대 단자 중 바디(Body, B) 역할을 하며, 소스와 드레인 사이에 전자가 지나갈 채널(Channel)이 형성될 장소를 제공합니다. P형 도펀트(Boron, 10¹⁵ cm⁻³)가 균일하게 분포하여 이상적인 에너지 밴드 벤딩의 기준점이 됩니다.',
      electricalMechanism: '기판의 도핑 농도는 페르미 준위(Ef)와 공핍층 폭(Wdep)을 결정하여 소자의 기본 문턱전압(Vth0)과 바디 효과(Body Effect)를 결정합니다. 완벽한 세정으로 계면 결함(Dit)이 최소화되어야 게이트 전압을 걸었을 때 누설 없이 급격한 온/오프 스위칭(SS ≈ 60 mV/dec)이 가능해집니다.',
      defectImpact: '세정이 불량하여 금속 파티클이나 유기물이 1개라도 남으면, 그 위에 자라는 게이트 산화막에 핀홀(Pinhole)이 뚫려 게이트 누설전류(Ileak)가 폭증하고 칩 전체가 동작 불능(Dead Chip)이 됩니다.',
      keyMetricsSummary: [
        { label: '바디 불순물 농도 (NA)', spec: '1.0×10¹⁵ cm⁻³ (균일도 ±1%)' },
        { label: '계면 결함 밀도 (Dit)', spec: '< 1×10¹⁰ cm⁻²·eV⁻¹ (계면 트랩 극소화)' },
        { label: '절연 파괴 전하 (Qbd)', spec: '> 15 C/cm² (10년 신뢰성 보장)' }
      ]
    },

    vendorFrontier: {
      leader: 'SCREEN Semiconductor Solutions & TEL (Tokyo Electron)',
      flagshipTech: 'Single-Wafer Cryogenic Supercritical CO₂ Drying & Megasonic Cleaning',
      details: '선단 공정 종횡비가 10:1을 초과하는 미세 FinFET 및 3D 낸드 패턴에서는 세정액 표면장력으로 패턴 쓰러짐이 발생합니다. 초임계 CO₂ 및 극저온 에어로졸 스프레이를 도입하여 표면장력을 제로화하는 무손상 세정 기술이 핵심입니다.'
    },

    fdcAlert: {
      signature: 'SC-1 MegaSonic 진동자 임피던스 편차 감지 (+4.8%)',
      recoveryAction: 'R2R 초음파 주파수 자동 미세조정 (Auto Frequency Sweep)',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 02. 열산화 (Thermal Oxidation)
  // ─────────────────────────────────────────────────────────────────
  'p02': {
    id: 'p02',
    category: 'front',
    subCategory: 'FEOL (절연막 형성)',
    stepNum: '02',
    nameKo: '열산화 & 확산',
    nameEn: 'Thermal Oxidation & Diffusion',
    cuteName: '🔥 02. 게이트 절연막 열산화',
    cuteSummary: '1050°C 뜨거운 가마에서 순수한 산소를 불어넣어 전기가 새지 않는 완벽한 유리 보호막(SiO₂)을 키워요!',
    mosfetRole: '게이트 산화막 절연층 (Gate Dielectric / SiO₂)',
    vendorLeader: 'TEL (Tokyo Electron) · Kokusai Electric',
    keyEquipment: 'TELINDY 고온 수직 확산로 (Vertical Furnace)',
    tag: 'FEOL Gate Oxide',
    color: '#00f0ff',
    summary: '1050°C 고온 퍼니스에서 건식 O₂ 가스를 반응시켜 실리콘 원자 격자와 산소가 직접 결합(Deal-Grove 모델)하여, 결함이 극히 적은 최고 품질의 게이트 절연막(SiO₂)을 성장시키는 핵심 공정입니다.',
    
    equipModelType: 'vertical_diffusion_furnace',
    microModelType: 'p02_micro',

    telemetry: [
      { name: '노내 공정 온도', val: 1048.5, unit: '°C', min: 900, max: 1150, target: 1050.0, status: 'ok' },
      { name: '산화막 두께 (Tox)', val: 20.08, unit: 'nm', min: 18.0, max: 22.0, target: 20.0, status: 'ok' },
      { name: '웨이퍼내 두께 균일도', val: 0.72, unit: '%', min: 0, max: 1.5, target: 0.8, status: 'ok' },
      { name: 'O₂/H₂ 가스 유량비', val: 1.95, unit: 'sccm ratio', min: 1.8, max: 2.2, target: 2.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '산화막 두께 균일도 (WIWNU)',
        target: 'Tox = 20.0 nm ± 0.15 nm (편차 < 0.8%)',
        tool: '분광 타원해석기 (Spectroscopic Ellipsometer)',
        purpose: '게이트 절연막 두께가 1nm만 달라져도 커패시턴스(Cox)가 변하여 칩 내 수억 개 트랜지스터의 문턱전압(Vth) 편차가 발생하므로 엄격 통제'
      },
      {
        param: '굴절률 (Refractive Index n)',
        target: 'n = 1.458 ± 0.002 (@ 632.8 nm)',
        tool: '엘립소미트리',
        purpose: 'SiO₂의 완전한 화학양론비(Si:O = 1:2)를 검증하여 절연막 내 잉여 실리콘이나 결함 산소 클러스터가 없음을 확인'
      },
      {
        param: '계면 포획 전하 밀도 (Dit)',
        target: 'Dit < 5.0×10⁹ cm⁻²·eV⁻¹',
        tool: '고주파 C-V 플로터 (Quasi-static C-V Profiler)',
        purpose: 'Si/SiO₂ 계면의 댕글링 본드(Dangling Bond)가 전자를 가두면 이동도 저하 및 문턱전압 불안정성(PBTI/NBTI)을 유발하므로 N₂/H₂ 후열처리로 수소화 종단'
      },
      {
        param: '절연 파괴 전계 강도 (Ebd)',
        target: 'Ebd > 11.5 MV/cm (TDDB 내구성)',
        tool: '인라인 프로브 TDDB 신뢰성 시험기',
        purpose: '게이트에 전압이 인가될 때 산화막이 파괴되지 않고 10년 이상의 수명을 보장하기 위한 유전 파괴 내력 보증'
      }
    ],

    eeAnalysis: {
      targetPart: '게이트 산화막 (Gate Dielectric, Tox = 20nm)',
      whyWeDoThis: '게이트 금속 전극과 아래의 실리콘 채널 사이에 전자가 직접 흐르지 못하도록 완벽한 절연 벽을 세워, 순수한 정전기적 전계(Electric Field)만으로 채널을 제어하기 위해 수행합니다.',
      structuralRole: 'MOSFET(금속-산화물-반도체)의 중심에서 "O(Oxide)"에 해당하며, 게이트 전극에 전압을 가했을 때 실리콘 채널에 전자를 끌어모으는 평행판 커패시터(Cox = εox / Tox)를 형성합니다.',
      electricalMechanism: '절연막 두께(Tox)가 얇을수록 단위면적당 게이트 커패시턴스(Cox)가 커져 게이트가 채널 전하를 강력하게 장악합니다. 이는 드레인 전류(Ion)를 증가시키고 서브스레숄드 스윙(SS)을 낮추어 적은 전압으로도 트랜지스터를 매우 빠르고 확실하게 켤 수 있게 만듭니다.',
      defectImpact: '산화막 두께가 균일하지 않으면 칩 내부 트랜지스터마다 Vth가 제각각 달라져 클럭 타이밍 오류가 발생하고, 절연막 내 결함이 많으면 게이트 누설전류(Igate)가 흘러 대기 전력 소모가 극심해집니다.',
      keyMetricsSummary: [
        { label: '게이트 커패시턴스 (Cox)', spec: '1.73 fF/µm² (Cox = εox / Tox)' },
        { label: '절연 파괴 전계 (Ebd)', spec: '> 11 MV/cm (고전압 파괴 억제)' },
        { label: '계면 결함 준위 (Dit)', spec: '< 5×10⁹ eV⁻¹cm⁻² (이동도 손실 차단)' }
      ]
    },

    vendorFrontier: {
      leader: 'TEL (Tokyo Electron) & Kokusai Electric',
      flagshipTech: 'Fast Thermal Processing (FTP) & In-situ Steam Generation (ISSG)',
      details: '급속 승온·강온이 가능한 초박막 ISSG 산화 기술은 수소와 산소를 저압 챔버 내에서 직접 반응시켜 라디칼 산소(O*)를 생성함으로써, 패턴 모서리 디싱 없는 원자 수준 계면 조밀도를 실현합니다.'
    },

    fdcAlert: {
      signature: '석영 튜브 Zone-3 히터 승온 레이트 미세 지연 (-1.2°C/min)',
      recoveryAction: 'PID 열제어 루프 파라미터 자동 보정 및 N₂ 퍼지 유량 리셋',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 03. 포토리소그래피 (Photolithography / EUV)
  // ─────────────────────────────────────────────────────────────────
  'p03': {
    id: 'p03',
    category: 'front',
    subCategory: 'FEOL (패터닝 노광)',
    stepNum: '03',
    nameKo: '포토리소그래피 (EUV)',
    nameEn: 'EUV Photolithography',
    cuteName: '⚡ 03. 초미세 회로 사진 찍기 (EUV 노광)',
    cuteSummary: '분홍색 산화막 위에 노란색 PR을 바르고, EUV 빛을 쬔 부위가 초록색으로 변색되어 씻겨 나가면 중앙에만 노란색 PR 기둥이 남아요!',
    mosfetRole: '게이트 감광액 마스크 기둥 (Gate PR Mask on Pink SiO₂)',
    vendorLeader: 'ASML (독점 공급) · Zeiss 광학계',
    keyEquipment: 'ASML Twinscan EXE:5000 High-NA (0.55 NA) EUV Scanner',
    tag: 'FEOL Litho',
    color: '#f59e0b',
    summary: '02단계에서 형성된 분홍색 산화막(SiO₂) 위에 노란색 감광제(PR)를 균일하게 도포한 뒤, 중앙 차광막(Chrome) 마스크를 통해 13.5nm EUV 빛을 비춥니다. 빛을 받은 좌우 노란색 PR만 초록색으로 광화학 변색을 일으키며, 현상액(TMAH)으로 변색된 초록색 PR만 깨끗이 씻어내어 분홍색 산화막은 온전히 보존한 채 중앙에만 노란색 PR 마스크 기둥을 남기는 공정입니다.',
    
    equipModelType: 'asml_euv_scanner',
    microModelType: 'p03_micro',

    telemetry: [
      { name: '임계 선폭 (CD 3-sigma)', val: 8.12, unit: 'nm', min: 7.0, max: 9.5, target: 8.0, status: 'ok' },
      { name: '오버레이 정렬 오차', val: 0.88, unit: 'nm', min: 0, max: 1.5, target: 1.0, status: 'ok' },
      { name: 'EUV 도즈 에너지', val: 42.5, unit: 'mJ/cm²', min: 38, max: 48, target: 42.0, status: 'ok' },
      { name: '스테이지 가속도', val: 12.4, unit: 'G', min: 10, max: 15, target: 12.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '임계 선폭 균일도 (CD Uniformity 3σ)',
        target: 'CD 3σ < 0.45 nm (목표 CD 8.0 nm)',
        tool: 'CD-SEM (임계치수 주사전자현미경)',
        purpose: '게이트 선폭(Lg)이 균일하지 않으면 칩 내부 트랜지스터 간 스위칭 속도가 달라져 클럭 스큐가 발생하고, 짧은 채널에서는 DIBL 누설전류 폭증'
      },
      {
        param: '오버레이 층간 정렬 오차 (Overlay Error)',
        target: 'Overlay < 1.1 nm (3σ 기준)',
        tool: '광학 오버레이 스캐너 (Archer AIM)',
        purpose: '하부 소스/드레인 확산 영역과 상부 게이트 전극의 위치가 어긋나면 기생 오버랩 커패시턴스(Cov)가 비대칭이 되어 고속 동작 시 왜곡 발생'
      },
      {
        param: '초점 심도 마진 (Depth of Focus, DOF)',
        target: 'DOF ≥ 80 nm (High-NA 초점 마진)',
        tool: '인라인 광학 초점 센서 (Leveling Sensor)',
        purpose: '웨이퍼 국소 단차로 인해 노광 광선이 초점 심도를 벗어나면 패턴이 뭉개지거나 단선(Open)되는 브릿지 결함 발생'
      },
      {
        param: '선폭 거칠기 (LER / LWR)',
        target: 'Line Edge Roughness < 1.1 nm',
        tool: '고분해능 리뷰 CD-SEM',
        purpose: '게이트 측벽이 울퉁불퉁하면 국소 전계 집중으로 인해 문턱전압 산포가 급증하고 서브스레숄드 특성이 열화됨'
      }
    ],

    eeAnalysis: {
      targetPart: '게이트 감광액 마스크 기둥 (Yellow PR Mask on Pink SiO₂)',
      whyWeDoThis: '하부의 분홍색 산화막과 실리콘 기판을 식각으로부터 보호하면서, 게이트 전극이 들어설 정확한 선폭(Lg) 위치에만 보호벽(노란색 PR 마스크)을 세우기 위해 수행합니다.',
      structuralRole: '분홍색 산화막은 아직 전혀 깎이지 않고 그대로 보존되어 있으며, 그 위에 노란색 PR 마스크 기둥만 서 있습니다. 다음 식각 공정에서 이 노란색 PR이 없는 좌우의 분홍색 산화막만 깎여나가게 됩니다.',
      electricalMechanism: '게이트 길이(Lg)는 전자가 소스에서 드레인으로 이동하는 채널의 비행 거리(Channel Length)를 결정합니다. Lg가 짧아질수록 전자의 주행 시간(Transit Time = Lg / v_drift)이 단축되어 트랜지스터의 동작 주파수(fT)가 기하급수적으로 빨라지고, 채널 저항이 줄어 온전류(Ion)가 증가합니다.',
      defectImpact: '노광 불량으로 선폭이 과도하게 얇아지면 드레인 유기 장벽 저하(DIBL)와 펀치스루(Punch-through) 현상이 발생하여 전압을 끄지 못하고 전류가 계속 새어나가 칩이 전소될 수 있습니다.',
      keyMetricsSummary: [
        { label: '게이트 선폭 (Lg)', spec: '8.0 nm ± 0.4 nm (동작 주파수 결정)' },
        { label: '오버레이 정렬도 (Overlay)', spec: '< 1.1 nm (기생 커패시턴스 대칭성)' },
        { label: '주행 시간 지연 (Transit Time)', spec: '< 0.1 ps (초고속 스위칭 구현)' }
      ]
    },

    vendorFrontier: {
      leader: 'ASML (네덜란드 벨트호벤 본사)',
      flagshipTech: 'High-NA (0.55 NA) Anamorphic Mirror Optics & Multi-Beam CD-SEM',
      details: '렌즈 개구수(NA)를 0.33에서 0.55로 올린 High-NA 시스템은 반사경에 비스듬히 입사하는 빛의 쉐도잉(Shadowing)을 극복하기 위해 X축과 Y축의 축소 배율을 4배/8배로 다르게 설계한 아나모픽 광학계가 최초 적용되었습니다.'
    },

    fdcAlert: {
      signature: '웨이퍼 척 수평도 틸트 오차 +1.4nm (Slit Scan 경계)',
      recoveryAction: '압전 피에조 액추에이터 다이내믹 레벨링 실시간 보정',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 04. 플라즈마 건식 식각 (Plasma Etch)
  // ─────────────────────────────────────────────────────────────────
  'p04': {
    id: 'p04',
    category: 'front',
    subCategory: 'FEOL (패턴 식각)',
    stepNum: '04',
    nameKo: '플라즈마 건식 식각',
    nameEn: 'Plasma Dry Etching',
    cuteName: '✂️ 04. 플라즈마 정밀 조각 (식각)',
    cuteSummary: '중앙의 노란색 PR 마스크가 덮인 분홍색 산화막은 보호하고, 노출된 좌우 산화막만 CF₄ 플라즈마로 수직 90도로 깎은 뒤 잔류 PR을 날려 깨끗한 산화막 기둥을 완성해요!',
    mosfetRole: '수직 90° 분홍색 게이트 절연막 기둥 (SiO₂ Insulator Pillar)',
    vendorLeader: 'Lam Research · TEL · AMAT',
    keyEquipment: 'Lam Sense.i ICP/CCP 초고밀도 유도결합 플라즈마 식각 챔버',
    tag: 'FEOL Etch',
    color: '#0a84ff',
    summary: '중앙에 남아있는 노란색 감광액(PR) 패턴을 마스크 삼아, CF₄/Ar 반응성 가스 플라즈마 양이온으로 양옆의 노출된 분홍색 산화막(SiO₂)을 하부 실리콘 기판 표면까지 수직 90도로 깎아냅니다(C₄F₈ 측벽 보호막으로 언더컷 방지). 식각이 완료되면 산소(O₂) 플라즈마 애싱으로 상부의 노란색 PR을 깨끗이 태워 없앰으로써, 중앙에 오직 분홍색 게이트 산화막 기둥만 우뚝 서게 만듭니다.',
    
    equipModelType: 'lam_plasma_etcher',
    microModelType: 'p04_micro',

    telemetry: [
      { name: '식각 선택비 (SiO₂:Si)', val: 42.4, unit: 'ratio', min: 35, max: 55, target: 40.0, status: 'ok' },
      { name: '수직 측벽 각도', val: 89.8, unit: 'deg (°)', min: 89.0, max: 90.5, target: 90.0, status: 'ok' },
      { name: 'RF 바이어스 파워', val: 1845, unit: 'W', min: 1600, max: 2100, target: 1850, status: 'ok' },
      { name: 'EPD 종말점 신호', val: 99.4, unit: '% match', min: 95, max: 100, target: 99.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '식각 선택비 (Selectivity SiO₂ 대 Si/PR)',
        target: 'Selectivity > 40:1 (하부 기판 침식 방지)',
        tool: 'OES (발광 분석 광학 종말점 검출기)',
        purpose: '산화막만 깎아내고 아래 실리콘 기판은 상처 없이 보존해야 채널 표면 결함과 누설전류를 방지할 수 있음'
      },
      {
        param: '수직 식각 측벽 각도 (Profile Taper Angle)',
        target: 'Angle = 89.8° ± 0.3° (완전 수직 90° 지향)',
        tool: '단면 FIB-SEM (집속이온빔 주사전자현미경)',
        purpose: '측벽이 비스듬해지면 게이트 바닥 면적이 줄어들어 유효 게이트 길이가 변동하고, 보잉(Bowing) 발생 시 이웃 소자와 절연 파괴'
      },
      {
        param: '마이크로 로딩 효과 (Micro-loading Effect)',
        target: '조밀 패턴 vs 고립 패턴 식각율 편차 < 2.0%',
        tool: '인라인 광학 단차 측정기 (Scatterometry)',
        purpose: '패턴 밀도가 높은 메모리 영역과 낮은 로직 영역 사이의 식각 속도 차이를 없애 칩 전체 깊이를 균일하게 유지'
      },
      {
        param: '플라즈마 유기 손상 (Plasma-Induced Damage, PID)',
        target: '게이트 안테나 전하 축적 파괴 Zero',
        tool: 'C-V 플로터 및 게이트 누설 테스트',
        purpose: '플라즈마 속 전하가 게이트 산화막에 축적되어 절연 파열(TDDB 수명 저하)을 일으키는 안테나 효과 차단'
      }
    ],

    eeAnalysis: {
      targetPart: '수직 90° 분홍색 게이트 산화막 기둥 (SiO₂ Gate Dielectric Pillar)',
      whyWeDoThis: '03번 포토 공정에서 빛을 받지 않아 살아남은 중앙 노란색 PR을 방패 삼아, 좌우의 불필요한 분홍색 산화막을 기판 표면까지 깎아내어 다음 공정(이온 주입)에서 채널을 가려줄 완벽한 셀프 얼라인 마스크 기둥을 만들기 위해 수행합니다.',
      structuralRole: '중앙 PR 마스크가 보호하는 중앙 분홍색 산화막은 그대로 살아남고, 좌우 노출된 산화막만 수직 90도로 깎여 하부 회색 실리콘 기판이 드러납니다. 그 후 산소(O₂) 애싱으로 노란색 PR을 태우면, 오직 중앙에 분홍색 게이트 산화막 기둥만 남습니다.',
      electricalMechanism: '식각 측벽이 정확히 90도를 이루어야 채널 가장자리의 전계 집중 현상이 억제되고, 서브스레숄드 스윙(SS)이 이상적인 60 mV/dec에 근접합니다. 또한 다음 단계에서 이 산화막 기둥이 채널로 들어가는 이온을 물리적으로 100% 차단하는 천연 차폐막이 됩니다.',
      defectImpact: '과도 식각(Over-etch)으로 실리콘 기판이 깊게 파이면 채널 전자 이동도가 반토막 나고, 덜 깎이면 잔류 산화막으로 인해 이온이 기판에 침투하지 못해 소스/드레인이 만들어지지 않습니다.',
      keyMetricsSummary: [
        { label: '서브스레숄드 스윙 (SS)', spec: '65 mV/dec (가파른 스위칭 효율)' },
        { label: '식각 선택비 (Selectivity)', spec: '> 40:1 (채널 손상 원천 방지)' },
        { label: '측벽 수직도 (Taper Angle)', spec: '90.0° ± 0.3° (전계 집중 방지)' }
      ]
    },

    vendorFrontier: {
      leader: 'Lam Research & Tokyo Electron',
      flagshipTech: 'Atomic Layer Etching (ALE) & Cryogenic Sub-Zero (-60°C) Etch',
      details: '원자 단위로 1개 층씩 화학 흡착과 이온 탈착을 분리 진행하는 ALE 기술과 극저온(-60°C) 상태에서 측벽 보호막 증착 속도를 높여 100:1 이상의 초고종횡비(HAR) 수직 홀을 파내는 극저온 식각이 양산 적용되고 있습니다.'
    },

    fdcAlert: {
      signature: '챔버 내부 압력 미세 요동 (+1.8 mTorr, CF₄ 가스 라인)',
      recoveryAction: '가스 질량유량계(MFC) 밸브 자동 펄스 캘리브레이션',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 05. 이온 주입 & RTA (Ion Implantation & Anneal)
  // ─────────────────────────────────────────────────────────────────
  'p05': {
    id: 'p05',
    category: 'front',
    subCategory: 'FEOL (도핑 접합 형성)',
    stepNum: '05',
    nameKo: '이온 주입 & RTA',
    nameEn: 'Ion Implantation & Rapid Thermal Anneal',
    cuteName: '🎯 05. 전자 저장소 주입 & 굽기 (S/D 도핑)',
    cuteSummary: '중앙의 분홍색 산화막 기둥이 채널을 가려주는 사이, 노출된 좌우 기판에만 비소(As⁺)가 꽂히고 1050°C 열처리로 완벽한 n⁺ 소스/드레인이 완성돼요!',
    mosfetRole: 'n⁺ 소스(Source) 및 드레인(Drain) 셀프 얼라인 접합',
    vendorLeader: 'AMAT (Applied Materials) · Axcelis',
    keyEquipment: 'AMAT Varian 고전류 고에너지 이온 주입기 & RTA 열처리로',
    tag: 'FEOL S/D',
    color: '#ff9f0a',
    summary: '04단계에서 완성된 중앙의 "분홍색 산화막 기둥" 자체가 채널 위를 가려주는 천연 방패(Self-Aligned Shadow Mask) 역할을 합니다! 웨이퍼 전체에 고에너지 비소(As⁺) 이온을 쏟아부어도 중앙 채널로는 이온이 통과하지 못하고, 좌우 노출된 실리콘에만 깊숙이 침투합니다. 이후 1050°C 순간 열처리(RTA)로 실리콘 결정을 치료하고 전자를 활성화하여 n⁺ 소스/드레인을 형성합니다.',
    
    equipModelType: 'amat_ion_implanter',
    microModelType: 'p05_micro',

    telemetry: [
      { name: '도펀트 주입 도즈량', val: 4.02, unit: '×10¹⁵ ions/cm²', min: 3.8, max: 4.2, target: 4.0, status: 'ok' },
      { name: '가속 빔 에너지', val: 39.8, unit: 'keV', min: 38, max: 42, target: 40.0, status: 'ok' },
      { name: '웨이퍼 틸트/트위스트', val: 7.02, unit: 'deg (°)', min: 6.8, max: 7.2, target: 7.0, status: 'ok' },
      { name: 'RTA 플래시 피크온도', val: 1052.4, unit: '°C', min: 1030, max: 1070, target: 1050.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '도펀트 주입 도즈 정밀도 (Dose Accuracy)',
        target: 'Dose = 4.0×10¹⁵ cm⁻² ± 0.8% 이내',
        tool: 'Therma-Wave 광음향 반사율 측정기 & 면저항기(Rs)',
        purpose: '도즈량이 부족하면 소스/드레인 기생 직렬 저항(Rsd)이 커져 온전류가 줄어들고, 과다하면 도펀트 석출로 결함 유발'
      },
      {
        param: '접합 깊이 제어 (Junction Depth Xj)',
        target: '초미세 얕은 접합 Xj < 15 nm (채널 하부 침투 방지)',
        tool: 'SIMS (2차 이온 질량 분석기)',
        purpose: '접합이 너무 깊으면 소스와 드레인의 공핍층이 맞닿아 게이트 제어를 무력화하는 펀치스루(Punch-through) 발생'
      },
      {
        param: '채널링 방지 틸트 각도 (Channeling Prevention)',
        target: 'Tilt = 7.0° ± 0.1°, Twist = 22.0° ± 0.5°',
        tool: '웨이퍼 정전척 고정밀 인코더 센서',
        purpose: '실리콘 결정 격자 축과 이온 빔이 일치하면 이온이 원자 사이 틈으로 깊숙이 파고드는 채널링 테일(Channeling Tail) 억제'
      },
      {
        param: '도펀트 전기적 활성화율 (Activation Rate)',
        target: '격자 치환 활성화율 > 95% (면저항 Rs < 120 Ω/sq)',
        tool: '4점 탐침 면저항 측정기 (4-Point Probe)',
        purpose: '주입된 이온이 실리콘 격자 자리로 들어가 전자를 내놓아야만 저저항 금속성 반도체로 기능할 수 있음'
      }
    ],

    eeAnalysis: {
      targetPart: 'n⁺ 소스(Source) 및 n⁺ 드레인(Drain) 영역 (Self-Aligned)',
      whyWeDoThis: '왜 전체에 이온을 쏴도 소스/드레인에만 딱 들어갈까요? 바로 04단계에서 만든 "중앙 분홍색 산화막 기둥"이 채널을 막아주는 물리적 방패(Self-Aligned)가 되기 때문입니다! 따라서 별도의 마스크 정렬 오차 없이 양옆에 소스와 드레인이 0.1nm의 정밀도로 완벽하게 형성됩니다.',
      structuralRole: '중앙 산화막 아래의 실리콘은 p형 순수 채널로 보존되고, 좌우 노출된 실리콘에만 고농도 전자(As⁺)가 주입되어 소스(전자 공급원)와 드레인(전자 수집처)이 완성됩니다.',
      electricalMechanism: '소스와 드레인에 전자가 풍부한 n⁺ 영역을 형성하면 p형 기판과 사이에 역방향 p-n 접합 다이오드가 형성되어, 평소에는 전류가 흐르지 않다가 게이트 전압이 걸릴 때만 채널을 통해 막대한 전자 전류(Ion)가 도통됩니다. 기생 직렬 저항(Rsd)을 극소화하여 전류 구동 능력을 극대화합니다.',
      defectImpact: 'RTA 열처리가 불충분하면 실리콘 격자에 깨진 결함이 그대로 남아 결함 준위 재결합으로 누설전류가 10,000배 폭증하고, 칩이 배터리를 순식간에 방전시킵니다.',
      keyMetricsSummary: [
        { label: '기생 직렬 저항 (Rsd)', spec: '< 150 Ω·µm (온전류 드롭 최소화)' },
        { label: '접합 깊이 (Xj)', spec: '< 15 nm (단채널 펀치스루 차단)' },
        { label: '도펀트 농도 (Nd)', spec: '10²⁰ cm⁻³ (금속성 전도도 부여)' }
      ]
    },

    vendorFrontier: {
      leader: 'Applied Materials & Axcelis Technologies',
      flagshipTech: 'Cryo-Implant & Millisecond Laser Spike Annealing (LSA)',
      details: '웨이퍼를 영하 -100°C 극저온으로 얼려 이온을 때려 실리콘을 완전한 비정질로 만든 후, 밀리초 단위 레이저 펄스(LSA)로 표면만 1300°C로 순간 녹여 열확산 없는 완벽한 원자 단위 초단접합(USJ)을 구현합니다.'
    },

    fdcAlert: {
      signature: '이온 빔 플럭스 중화기(Plasma Flood Gun) 방전 전류 -3.2%',
      recoveryAction: '플러드 건 아크 방전 전압 자동 스윕 및 표면 차지업 해소',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 06. ALD 박막 증착 (Atomic Layer Deposition)
  // ─────────────────────────────────────────────────────────────────
  'p06': {
    id: 'p06',
    category: 'front',
    subCategory: 'FEOL (High-k / Metal Gate 완성)',
    stepNum: '06',
    nameKo: '원자층 증착 (ALD)',
    nameEn: 'Atomic Layer Deposition (High-k)',
    cuteName: '✨ 06. 원자 한 층씩 쌓기 (MOSFET 완성!)',
    cuteSummary: '한 통에 다 넣는 게 아니에요! [1] 중앙 산화막 위에 황금빛 메탈 게이트 ➔ [2] 양옆 쇼트 방지 절연 스페이서 ➔ [3] S/D 금속 패드를 순서대로 쌓아 3단자 MOSFET을 완성해요!',
    mosfetRole: 'High-k 유전체 & 황금빛 메탈 게이트 (완전한 3단자 MOSFET 완성!)',
    vendorLeader: 'ASM International · TEL · 원익IPS',
    keyEquipment: 'ASM Pulsar ALD 초정밀 원자층 증착 모듈',
    tag: 'FEOL High-k Gate',
    color: '#30d158',
    summary: '한 통에 다 넣고 쌓는 것이 아니라, 3단계의 독립된 챔버에서 순서대로 증착합니다! ① [ALD 챔버] 중앙 산화막 위에 EOT 0.7nm High-k(HfO₂)와 황금빛 메탈 게이트(TiN/W 금속 전극)를 원자 단위로 적층하고, ② [CVD 챔버] 게이트 양측벽에 질화실리콘(Si₃N₄)을 덮고 깎아 게이트와 소스/드레인의 전기적 쇼트를 방지하는 "측벽 스페이서"를 세우며, ③ [스퍼터링 챔버] 노출된 소스/드레인 표면에 니켈/코발트를 증착하고 열처리하여 초저저항 "실리사이드(Silicide) 금속 접촉 패드"를 형성함으로써 3개 단자(게이트-소스-드레인)가 완비된 완전한 MOSFET 스위치를 완성합니다.',
    
    equipModelType: 'asm_ald_reactor',
    microModelType: 'p06_micro',

    telemetry: [
      { name: 'High-k EOT 두께', val: 0.71, unit: 'nm', min: 0.65, max: 0.75, target: 0.70, status: 'ok' },
      { name: '단차 피복력 (Conformality)', val: 99.4, unit: '%', min: 98, max: 100, target: 99.0, status: 'ok' },
      { name: 'TiN 유효 일함수 (eWF)', val: 4.15, unit: 'eV (nMOS)', min: 4.05, max: 4.25, target: 4.15, status: 'ok' },
      { name: '게이트 누설전류 (Jg)', val: 0.82, unit: 'A/cm² (@ 1V)', min: 0, max: 2.0, target: 1.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '등가 산화막 두께 (EOT, Equivalent Oxide Thickness)',
        target: 'EOT = 0.70 nm ± 0.02 nm (원자 2개 두께 수준)',
        tool: 'XPS (X선 광전자 분광기) & C-V 특성 분석기',
        purpose: '물리적 두께는 3nm로 두껍게 쌓아 터널링 누설을 차단하면서도, 전기적으로는 SiO₂ 0.7nm에 달하는 초고용량 커패시턴스를 실현'
      },
      {
        param: '단차 피복력 (Conformality / Step Coverage)',
        target: '3차원 채널 단차 피복비 > 98.5%',
        tool: 'HR-TEM (고분해능 투과전자현미경)',
        purpose: '입체 구조의 채널 모서리나 측벽에 절연막이 얇게 발리면 전계 집중으로 모서리 절연 파괴(Corner Breakdown) 발생'
      },
      {
        param: '탄소/염소 불순물 농도 (Residual Impurity)',
        target: 'Carbon, Chlorine < 0.05 at%',
        tool: 'SIMS 화학 성분 깊이 분석기',
        purpose: '전구체에서 떨어져 나오지 못한 잔류 탄소나 염소는 고정 전하(Qox)로 작용하여 문턱전압을 불규칙하게 흔들어놓음'
      },
      {
        param: '메탈 게이트 일함수 안정성 (Work Function Target)',
        target: 'nMOS 4.15 eV, pMOS 5.05 eV (변위 < 15 meV)',
        tool: 'Kelvin Probe Force Microscopy (KPFM)',
        purpose: '금속 게이트의 일함수가 정확해야 별도의 고농도 채널 도핑 없이도 목표 문턱전압(Vth)을 정밀하게 맞출 수 있음'
      }
    ],

    eeAnalysis: {
      targetPart: '황금빛 메탈 게이트(Gate), High-k 절연막, 측벽 스페이서, S/D 전극 패드',
      whyWeDoThis: '"어떻게 딱 원하는 자리에만 메탈 게이트, 스페이서, 전극 패드를 만드는가?": 반도체 자체 정렬(Self-Aligned)의 마법 3단계입니다! ① [메탈 게이트]: 전면 증착 후 포토/식각으로 깎거나 게이트 홀에만 ALD로 채워넣어 황금빛 금속(TiN/W) 기둥을 세웁니다. ② [측벽 스페이서 에치백]: 질화막(Si₃N₄)을 전면에 바른 뒤 마스크 없이 수직 식각하면, 평평한 바닥은 다 깎이지만 기둥 옆면은 수직 두께가 두꺼워 기둥 벽면에만 절연 스페이서가 저절로 남습니다! ③ [살리사이드(Salicide)]: 니켈(Ni)을 전면에 깔고 열처리하면 노출된 실리콘(S/D)과만 화학 반응하여 초저저항 합금(NiSi)을 형성하고, 스페이서 위의 미반응 니켈만 산(Acid)으로 씻어내어 S/D 표면에만 완벽한 전극 패드가 남습니다.',
      structuralRole: '기판(P-Si 바닥) + 중앙 게이트 전극(황금빛 메탈) + 게이트 절연막(High-k / 산화막) + 양옆 절연 스페이서 + 좌우 n⁺ 소스/드레인 전극 단자가 모두 결합되어 완벽한 3단자 MOSFET 소자가 비로소 온전한 모습을 드러냅니다.',
      electricalMechanism: '유전율이 높은 HfO₂(κ=22)는 물리적으로 두꺼워도 전기적으로는 매우 얇은 것처럼 작동(EOT = 0.7nm)합니다. 따라서 양자 터널링 게이트 누설전류(Ileak)를 10,000배 차단하면서도 막강한 전계로 채널을 장악하여, 게이트에 0.7V만 걸어도 채널에 순식간에 전자 반전층이 형성되어 온전류(Ion)가 힘차게 뿜어져 나옵니다.',
      defectImpact: 'ALD 퍼지 공정이 불량하여 전구체 반응 가스가 서로 엉키면 절연막 내부 결함으로 전하 트래핑(Charge Trapping)이 생겨, 칩을 쓸수록 문턱전압이 저절로 올라가 칩이 느려지다 멈추는 열화(BTI 현상)가 발생합니다.',
      keyMetricsSummary: [
        { label: '게이트 누설전류 (Ileak)', spec: '< 10⁻¹² A/µm (대기 전력 99% 차단)' },
        { label: 'EOT (등가 두께)', spec: '0.70 nm (초강력 채널 장악력)' },
        { label: '온/오프 전류비 (Ion/Ioff)', spec: '> 10⁷ (완벽한 디지털 스위칭)' }
      ]
    },

    vendorFrontier: {
      leader: 'ASM International & Tokyo Electron',
      flagshipTech: 'Thermal & Plasma-Enhanced ALD (PEALD) Multi-Layer Stacking',
      details: '플라즈마를 인시츄로 점화하여 증착 온도를 250°C 이하로 낮춘 PEALD 기술은 열에 민감한 첨단 로직 공정에서 막질의 밀도와 유전율을 비약적으로 끌어올리는 표준 공정으로 자리잡았습니다.'
    },

    fdcAlert: {
      signature: 'Hf 전구체 캐니스터 밸브 스위칭 펄스 미세 지연 (2.2ms)',
      recoveryAction: '전구체 인젝션 초고속 압전 솔레노이드 밸브 자가 교정',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 07. BEOL 15층 구리 배선 (BEOL Interconnects)
  // ─────────────────────────────────────────────────────────────────
  'p07': {
    id: 'p07',
    category: 'front',
    subCategory: 'BEOL (다층 금속 배선망)',
    stepNum: '07',
    nameKo: 'BEOL 15층 배선',
    nameEn: 'BEOL 15-Layer Interconnects',
    cuteName: '🏢 07. 15층 고속도로 구리 배선 빌딩',
    cuteSummary: '칩 하나에는 2개가 아니라 수백억 개가 있어요! 2개로 NOT 게이트를 만들고, 4~6개로 NAND/AND를 만들어 15층 입체 고속도로로 연결해요!',
    mosfetRole: '수백억 개 트랜지스터 간 로직 결합(M1 인버터) 및 15층 글로벌 신호/전원 분배망',
    vendorLeader: 'AMAT (Applied Materials) · Lam Research',
    keyEquipment: 'AMAT Endura PVD/ECD 구리 전해도금 및 듀얼 다마신 증착기',
    tag: 'BEOL Dual Damascene',
    color: '#00f0ff',
    summary: '다이 하나에 트랜지스터가 2개만 있는 것이 결코 아닙니다! 실제 칩 하나에는 100억~500억 개의 트랜지스터가 집적되어 있으며, 화면의 2개(TR-1, TR-2)는 이웃한 소자가 어떻게 연결되는지 보여주는 초미세 줌인 예시입니다. 2개를 M1 구리선으로 연결하면 0을 1로 바꾸는 NOT 게이트(인버터)가 되고, 4개를 묶으면 NAND/NOR, 6개를 묶으면 AND/OR 게이트가 만들어집니다. 15개 층의 입체 구리 배선망은 이 수십억 개의 게이트들이 서로 엉켜 쇼트나지 않도록 1층(로컬 로직 게이트) ➔ 중간층(ALU 연산 버스) ➔ 최상층(전원 VDD/VSS 및 클럭 그리드)으로 질서정연하게 연결합니다.',
    
    equipModelType: 'amat_endura_cu_stack',
    microModelType: 'beol_playback',

    telemetry: [
      { name: '적층 배선 층수', val: 15, unit: 'Layers (M1~M15)', min: 1, max: 15, target: 15, status: 'ok' },
      { name: 'Cu 전해도금 무보이드율', val: 99.98, unit: '%', min: 99.5, max: 100, target: 100.0, status: 'ok' },
      { name: 'Low-k 유전율 (k-value)', val: 2.22, unit: 'dielectric k', min: 2.0, max: 2.4, target: 2.2, status: 'ok' },
      { name: '층간 비아 접촉 저항 (Rc)', val: 2.15, unit: 'Ω/via', min: 1.5, max: 3.5, target: 2.2, status: 'ok' }
    ],

    controlPoints: [
      {
        param: 'Cu 듀얼 다마신 슈퍼필링 (Superfilling Void-Free)',
        target: '비아 및 트렌치 내부 보이드 100% Zero',
        tool: '인라인 고에너지 X-ray 검사기 및 단면 TEM',
        purpose: '구리 도금 시 아래에서부터 차오르지 못하고 위가 먼저 막히면 내부에 빈 공간(Seam/Void)이 생겨 고전류 인가 시 배선 단선'
      },
      {
        param: '비아 접촉 저항 (Via Contact Resistance Rc)',
        target: 'Rc < 2.5 Ω/via (체인 저항 균일도 ±3%)',
        tool: '인라인 비아 체인 전기적 자동 테스터',
        purpose: '비아 바닥에 잔류 절연막이나 산화 구리가 남아 저항이 높아지면 신호 지연(RC Delay)이 증가하고 발열로 칩 성능 제한'
      },
      {
        param: 'Low-k 절연 파괴 내구성 (TDDB Reliability)',
        target: '수명 > 10년 (@ 125°C, 동작 전압)',
        tool: '패키지 레벨 고온 전압 스트레스 시험기',
        purpose: '배선 간격을 좁히기 위해 도입한 다공성 저유전체(SiOCH, k=2.2)가 구리 이온 확산으로 쇼트되지 않도록 TaN 확산 방지막 밀폐'
      },
      {
        param: '일렉트로마이그레이션 (EM) 전류 밀도 한계',
        target: 'Jmax < 1.5 MA/cm² (블랙 법칙 만족)',
        tool: '가속 수명 수명 시험 장비 (Wafer Level Reliability)',
        purpose: '고속으로 흐르는 전자 바람(Electron Wind)이 구리 원자를 밀어내어 배선이 끊어지는 EM 현상을 방지'
      }
    ],

    eeAnalysis: {
      targetPart: '인접 트랜지스터 간 M1 연결선 및 M2~M15 초고속 15층 구리 다층 배선망',
      whyWeDoThis: '"다이 하나에 모스펫 2개로 모든 경우의 수를 잇는 것인가?": 다이 하나에 2개만 있는 것이 아닙니다! 실제 칩에는 손톱만 한 크기에 수백억 개의 트랜지스터가 빽빽하게 깔려 있습니다. 트랜지스터 2개를 묶으면 NOT 게이트(3D 뷰의 M1 브릿지), 4개를 묶으면 NAND/NOR 게이트, 6개를 묶으면 AND/OR 게이트나 SRAM 메모리 1비트가 됩니다. 이런 게이트 수만 개가 묶여 32비트 덧셈기가 되고, 수억 개가 묶여 CPU 코어가 됩니다. 1층 평면에서는 전선끼리 교차하면 합선되므로, 15개 층의 입체 고속도로를 빌딩처럼 쌓아 칩 전체를 완벽한 컴퓨터 두뇌로 엮는 것입니다!',
      structuralRole: '하층부(M1~M4)는 이웃 트랜지스터끼리 연결하는 로컬 로직 게이트 결합선, 중층부(M5~M10)는 연산 장치와 캐시 메모리를 잇는 64비트 고속 데이터 버스, 상층부(M11~M15)는 칩 전체에 안정적인 전원(VDD/VSS)과 5GHz 클럭을 분배하는 거대 파워 그리드(PDN)입니다.',
      electricalMechanism: '회로 동작 속도는 트랜지스터 자체의 속도뿐 아니라 배선의 신호 지연 시간(τ = 0.89 · Rwire · Cwire)에 지배받습니다. 알루미늄 대신 비저항이 낮은 구리(Cu, 1.7 µΩ·cm)를 쓰고 저유전율(Low-k, k=2.2) 절연막을 채택하여 신호 전달 속도를 극대화하고 동적 소비 전력(P = C·V²·f)을 획기적으로 낮춥니다.',
      defectImpact: '배선 도금에 미세한 보이드가 생기거나 층간 비아가 제대로 뚫리지 않으면 신호선이 끊어져(Open) 칩의 특정 연산 유닛이 영구 사망합니다.',
      keyMetricsSummary: [
        { label: '배선 비저항 (Resistivity)', spec: '1.7 µΩ·cm (초저저항 구리 배선)' },
        { label: 'RC 신호 지연시간 (Delay)', spec: '< 5 ps/stage (초고속 신호 전송)' },
        { label: '층간 절연율 (k-value)', spec: '2.2 (기생 커패시턴스 40% 감축)' }
      ]
    },

    vendorFrontier: {
      leader: 'Applied Materials & Lam Research',
      flagshipTech: 'Cobalt (Co) & Ruthenium (Ru) Barrierless Metalization',
      details: '3nm 이하 최선단 공정 M0/M1 배선에서는 구리의 산란 현상으로 저항이 급증함에 따라, 확산 방지막이 필요 없는 루테늄(Ru) 및 몰리브덴(Mo) 신소재 배선이 도입되고 있습니다.'
    },

    fdcAlert: {
      signature: 'Cu 도금액 레벨러(Leveler) 유기 첨가제 농도 -1.8%',
      recoveryAction: 'CVS(순환전압전류법) 인라인 분석기 자동 피드백 약액 보충',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 08. CMP 평탄화 (Chemical Mechanical Planarization)
  // ─────────────────────────────────────────────────────────────────
  'p08': {
    id: 'p08',
    category: 'front',
    subCategory: 'BEOL (글로벌 표면 평탄화)',
    stepNum: '08',
    nameKo: 'CMP 평탄화',
    nameEn: 'Chemical Mechanical Planarization',
    cuteName: '🧼 08. 나노 거울 연마 (CMP 평탄화)',
    cuteSummary: '울퉁불퉁 솟아오른 구리 언덕을 나노 슬러리와 연마 패드로 갈아내어 1nm 오차 없는 평평한 거울면을 만들어요!',
    mosfetRole: '배선 층간 완벽 평탄화 (Zero Dishing for Next Litho)',
    vendorLeader: 'AMAT (Applied Materials) · Ebara',
    keyEquipment: 'AMAT Reflexion LK Prime 다자유도 회전식 CMP 연마 설비',
    tag: 'BEOL CMP',
    color: '#00f0ff',
    summary: '배선 도금 후 불균일하게 솟아오른 구리 과도금 언덕을 나노 실리카 슬러리의 화학적 에칭과 폴리우레탄 패드의 기계적 마찰(Preston 법칙)을 통해 원자 수준으로 균일하게 깎아내어 단차 없는 완벽한 평면을 만드는 공정입니다.',
    
    equipModelType: 'amat_cmp_polisher',
    microModelType: 'p08_micro',

    telemetry: [
      { name: 'Cu 디싱 깊이 (Dishing)', val: 4.8, unit: 'nm', min: 0, max: 8.5, target: 5.0, status: 'ok' },
      { name: '산화막 침식 (Erosion)', val: 3.2, unit: 'nm', min: 0, max: 6.0, target: 3.5, status: 'ok' },
      { name: '헤드 다운포스 압력', val: 2.18, unit: 'psi', min: 1.8, max: 2.5, target: 2.2, status: 'ok' },
      { name: '와전류 EPD 종말점', val: 99.7, unit: '% accuracy', min: 98, max: 100, target: 99.5, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '구리 디싱 깊이 (Dishing Depth)',
        target: '광역 Cu 라인 디싱 < 6.5 nm',
        tool: 'AFM 단차 원자 현미경 & 고분해능 옵티컬 프로파일러',
        purpose: '연마 패드가 구리선을 과도하게 파고들면 배선 단면적이 줄어들어 배선 저항이 상승하고 단선 위험 초래'
      },
      {
        param: '절연막 침식 깊이 (Oxide Erosion)',
        target: '밀집 배선 영역 절연막 깎임 < 4.5 nm',
        tool: '분광 엘립소미트리 박막 두께 측정기',
        purpose: '절연막이 과도하게 깎이면 층간 절연 두께가 얇아져 상하 배선 간 커패시턴스가 폭증하고 항복 전압 저하'
      },
      {
        param: '웨이퍼 내 연마율 편차 (WIWNU)',
        target: 'Within-Wafer Non-Uniformity < 2.5%',
        tool: '전수 49포인트 인라인 와전류 센서',
        purpose: '웨이퍼 중앙과 가장자리의 연마량이 다르면 가장자리 칩들의 배선 두께가 달라져 수율 불량 발생'
      },
      {
        param: '마이크로 스크래치 결함 수',
        target: '웨이퍼당 마이크로 스크래치 Zero',
        tool: 'KLA 암시야 레이저 표면 결함 검사기',
        purpose: '슬러리 입자가 응집되어 표면을 긁으면 배선 간 미세 쇼트(Short) 결함이 발생하여 칩 작동 불가'
      }
    ],

    eeAnalysis: {
      targetPart: '최상층 금속 배선 및 층간 절연막 동일 평면 (Planar Surface)',
      whyWeDoThis: '각 층의 배선을 깔고 난 뒤 발생하는 수십 나노미터의 울퉁불퉁한 요철을 평평하게 밀어버려, 다음 층 포토 노광 시 빛의 초점 심도(DOF)를 확보하고 배선 쇼트를 방지하기 위해 수행합니다.',
      structuralRole: '15층 배선 빌딩을 흔들림 없이 수직으로 올리기 위한 완벽한 바닥 평탄화 작업이며, 금속선과 절연체가 동일 평면(Co-planar)을 이루게 만듭니다.',
      electricalMechanism: '표면이 평평해야 배선 간격과 절연 두께가 설계치와 100% 일치하게 되어, 배선 간 기생 커패시턴스 편차와 신호 간섭(Crosstalk Noise)을 제거할 수 있습니다. 또한 디싱(Dishing)을 통제해야 배선 단면적이 보존되어 저항 증가로 인한 전압 강하(IR Drop)를 막을 수 있습니다.',
      defectImpact: '평탄화가 불량하여 단차가 남으면 다음 층 포토 공정에서 빛의 초점이 빗나가 패턴이 뭉개져 쇼트가 나고, 덜 깎인 구리 찌꺼기가 남아 인접 배선들이 합선됩니다.',
      keyMetricsSummary: [
        { label: '표면 평탄도 단차 (Step Height)', spec: '< 1.0 nm (원자 수준 제로 단차)' },
        { label: '포토 초점 마진 (DOF Margin)', spec: '> 85 nm (다음 층 노광 보장)' },
        { label: '배선 저항 산포 (Resistance Var)', spec: '< 2.0% (균일한 클럭 속도)' }
      ]
    },

    vendorFrontier: {
      leader: 'Applied Materials & Ebara Corporation',
      flagshipTech: 'Multi-Zone Carrier Head & In-situ Eddy Current / Optical Dual EPD',
      details: '웨이퍼 뒷면을 수십 개의 독립 에어백으로 나누어 국소 압력을 실시간 가변 제어하는 멀티존 캐리어 헤드와, 연마 중 구리 박막의 와전류를 측정하여 0.5nm 두께 잔류 시점을 실시간 포착하는 듀얼 종말점 검출 기술이 탑재됩니다.'
    },

    fdcAlert: {
      signature: '플래튼-헤드 마찰 계수 미세 상승 (+3.4%, 패드 수명 잔여 12%)',
      recoveryAction: '다이아몬드 컨디셔너 패드 드레싱 깊이 및 슬러리 유량 자동 최적화',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 09. 웨이퍼 테스트 (EDS / Probe Test)
  // ─────────────────────────────────────────────────────────────────
  'p09': {
    id: 'p09',
    category: 'back',
    subCategory: 'Package (전기적 양품 선별)',
    stepNum: '09',
    nameKo: '웨이퍼 테스트 (EDS)',
    nameEn: 'Electrical Die Sorting (EDS)',
    cuteName: '📍 09. 트랜지스터 건강검진 (EDS 전수검사)',
    cuteSummary: '미세 바늘(프로브)로 전압을 찔러 넣어 칩 속 수백억 개 트랜지스터가 정상 동작하는지 꼼꼼히 검사해요!',
    mosfetRole: '전체 MOSFET Vth/Ion 전기적 특성 및 게이트 파괴 전수 판정',
    vendorLeader: 'TEL · FormFactor · 테크윙',
    keyEquipment: 'TEL Precio 프로버 & Advantest 고속 자동 테스트 시스템(ATE)',
    tag: 'EDS Test',
    color: '#0a84ff',
    summary: '완성된 웨이퍼 상의 모든 다이에 초미세 텅스텐/MEMS 프로브 카드 바늘을 접촉시켜 전압을 인가하고, MOSFET의 문턱전압(Vth), 온/오프 전류, 게이트 절연 파괴(BVox) 및 메모리 셀 통전 상태를 전수 검사하여 완전 양품 다이(KGD)를 선별하는 공정입니다.',
    
    equipModelType: 'tel_eds_prober',
    microModelType: 'p09_micro',

    telemetry: [
      { name: '웨이퍼 수율 (Gross Yield)', val: 94.2, unit: '% KGD', min: 85, max: 98, target: 93.0, status: 'ok' },
      { name: '프로브 니들 접촉 저항', val: 0.045, unit: 'Ω/pin', min: 0.02, max: 0.1, target: 0.05, status: 'ok' },
      { name: '테스트 속도 (동시 측정)', val: 1024, unit: 'Dies parallel', min: 512, max: 2048, target: 1024, status: 'ok' },
      { name: '테스트 인가 전압 (Vdd)', val: 0.75, unit: 'V', min: 0.7, max: 0.85, target: 0.75, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '프로브 핀 접촉 저항 (Contact Resistance Rc)',
        target: 'Rc < 0.08 Ω/pin (산화막 침투 스크러빙)',
        tool: '인라인 오믹 접촉 저항 검증기',
        purpose: '바늘 끝에 산화 피막이나 이물질이 끼어 접촉 저항이 높아지면 정상 다이를 불량 다이로 오판하여 수율 손실 유발'
      },
      {
        param: '알루미늄/구리 패드 손상 깊이 (Scrub Mark)',
        target: '패드 두께 대비 손상 깊이 < 20%',
        tool: '광학 3D 공초점 레이저 현미경',
        purpose: '바늘이 패드를 너무 깊게 파고들면 후속 패키징 공정에서 마이크로범프 형성 및 와이어 본딩 접합력 저하'
      },
      {
        param: '문턱전압 산포도 (Vth Distribution Variance)',
        target: '칩간 Vth 편차 σ(Vth) < 15 mV',
        tool: 'ATE 고정밀 파라메트릭 계측기',
        purpose: '트랜지스터 동작 전압 산포를 검사하여 고성능 다이와 저전력 다이를 비닝(Binning) 분류'
      },
      {
        param: '게이트 산화막 절연 파괴 전압 (BVox Test)',
        target: '인가 전압에서 누설전류 < 10 pA',
        tool: '피코암페어(pA) 미세 전류 측정기',
        purpose: '출하 전 잠재적인 게이트 산화막 결함을 걸러내어 초기 고장(Infant Mortality)을 100% 차단'
      }
    ],

    eeAnalysis: {
      targetPart: '웨이퍼 내 모든 집적회로 패드 및 MOSFET 소자 전반',
      whyWeDoThis: '비싼 패키징(HBM 적층, 2.5D 인터포저 실장) 공정에 들어가기 전에, 불량 다이를 사전에 걸러내어(Known Good Die, KGD) 패키징 비용 낭비를 막기 위해 수행합니다.',
      structuralRole: '패키지 외부 핀과 연결될 금속 패드에 직접 전기 신호를 주입하여, 칩 내부의 트랜지스터 회로가 설계 사양대로 정확히 스위칭하는지 검증하는 마지막 전공정 관문입니다.',
      electricalMechanism: '게이트-소스 전압(Vgs)을 스윕하면서 드레인 전류(Ids)를 측정하여 Vth, 포화 온전류(Ion), 대기 누설전류(Ioff)를 계측합니다. 불량 비트가 발견되면 레이저 수리(Laser Repair)로 예비 회로(Redundancy)로 경로를 우회시켜 수율을 극대화합니다.',
      defectImpact: '검사에서 결함 다이를 놓치면 8단으로 쌓아 올리는 HBM에서 1개의 불량 칩 때문에 나머지 7개의 정상 칩까지 통째로 폐기해야 하는 막대한 손실이 발생합니다.',
      keyMetricsSummary: [
        { label: '양품 수율 (KGD Yield)', spec: '> 93% (불량 칩 사전 박멸)' },
        { label: '접촉 저항 (Rc)', spec: '< 0.08 Ω (정밀 측정 오차 제로화)' },
        { label: '누설전류 판정 한계', spec: '< 10 pA (완벽한 오프 상태 검증)' }
      ]
    },

    vendorFrontier: {
      leader: 'Tokyo Electron & FormFactor & Advantest',
      flagshipTech: 'MEMS Micro-Spring Full-Wafer Contact Probe Card (100,000 pins)',
      details: '웨이퍼 전체 300mm 면적을 단 한 번의 터치다운으로 동시 검사하는 10만 핀급 MEMS 초정밀 탄성 마이크로 스프링 프로브 카드 기술로 테스트 처리량을 4배 이상 높였습니다.'
    },

    fdcAlert: {
      signature: '핀 블록 2번 접촉 저항 통계적 시프트 (+0.038 Ω/pin)',
      recoveryAction: '프로브 팁 인시츄 세라믹 샌드 블록 자동 클리닝 동작',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 10. 백그라인딩 & 다이싱 (Backgrinding & Dicing)
  // ─────────────────────────────────────────────────────────────────
  'p10': {
    id: 'p10',
    category: 'back',
    subCategory: 'Package (웨이퍼 박형화 및 분할)',
    stepNum: '10',
    nameKo: '백그라인딩 & 다이싱',
    nameEn: 'Backside Thinning & Stealth Dicing',
    cuteName: '🪚 10. 칩 얇게 갈고 자르기 (다이싱)',
    cuteSummary: '웨이퍼 뒷면을 30µm(종이보다 얇게!) 갈아내어 열을 잘 빼내게 만들고, 레이저로 개별 칩을 예쁘게 잘라내요!',
    mosfetRole: 'MOSFET 하부 실리콘 벌크 박형화 (30µm 초박형) 및 칩 분할',
    vendorLeader: 'DISCO Corporation (글로벌 독점 수준)',
    keyEquipment: 'DISCO DFD6362 완전자동 다이싱 쏘 & 레이저 스텔스 다이서',
    tag: 'Backgrind & Dicing',
    color: '#38bdf8',
    summary: '회로 전면을 테이프로 보호하고 웨이퍼를 반전시켜 다이아몬드 휠로 후면 벌크 실리콘을 775µm에서 30µm 두께로 초박형화한 뒤, 칩 내부로 적외선(IR) 레이저를 집속하여 표면 손상 없이 크랙을 유도하는 스텔스 다이싱(SD)으로 개별 칩을 분리하는 공정입니다.',
    
    equipModelType: 'disco_dicing_grinder',
    microModelType: 'p10_micro',

    telemetry: [
      { name: '웨이퍼 잔여 두께', val: 30.2, unit: 'µm', min: 28.0, max: 32.0, target: 30.0, status: 'ok' },
      { name: '전체 두께 편차 (TTV)', val: 0.95, unit: 'µm', min: 0, max: 1.5, target: 1.0, status: 'ok' },
      { name: '다이아몬드 휠 회전수', val: 5980, unit: 'RPM', min: 5800, max: 6200, target: 6000, status: 'ok' },
      { name: '치핑 결함 크기 (Chipping)', val: 1.8, unit: 'µm', min: 0, max: 5.0, target: 2.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '웨이퍼 전체 두께 편차 (TTV, Total Thickness Var)',
        target: 'TTV < 1.2 µm (목표 두께 30 µm 기준)',
        tool: '비접촉식 정전용량식 두께 측정 게이지',
        purpose: '두께가 불균일하면 후속 HBM 적층 시 칩이 기울어져 범프 접합 불량(Non-wet) 및 패키지 휨 발생'
      },
      {
        param: '다이 측면 치핑 크기 (Edge Chipping Size)',
        target: 'Chipping < 3.0 µm (미세 크랙 완전 억제)',
        tool: '고배율 광학 엣지 인스펙션 장비',
        purpose: '절단 모서리에 미세 균열이 있으면 열충격이나 패키지 성형 압력을 받을 때 균열이 칩 내부로 전파되어 파괴'
      },
      {
        param: '스텔스 다이싱 레이저 개질층 깊이 정밀도',
        target: '레이저 개질 중심선 오차 < ± 1.0 µm',
        tool: '적외선(IR) 내부 단면 투과 검사기',
        purpose: '레이저 초점이 활성 회로층이나 TSV 금속에 닿지 않고 실리콘 기판 한가운데에만 정확히 개질층을 형성'
      },
      {
        param: '후면 미세 연마 거칠기 (Roughness Ra)',
        target: '연삭 후 폴리싱 Ra < 1.5 nm (거울면 연마)',
        tool: 'AFM 원자간력 현미경',
        purpose: '연삭 자국(Grinding Mark)이 남으면 미세 결함이 응력 집중점으로 작용하여 초박막 칩이 쉽게 깨짐(Bending Strength 저하)'
      }
    ],

    eeAnalysis: {
      targetPart: 'MOSFET 하부 실리콘 벌크 기판 (775µm ➔ 30µm 박형화)',
      whyWeDoThis: '실리콘 기판 자체는 전기적으로 저항체이자 열 장벽입니다. 쓸모없이 두꺼운 실리콘 후면을 갈아내어 관통 전극(TSV) 깊이를 단축하고 열 방출 경로를 극대화하기 위해 수행합니다.',
      structuralRole: '칩의 두께를 A4 복사지 두께(100µm)의 1/3도 안 되는 30µm 수준으로 깎아내어, 8장~16장의 칩을 위로 층층이 쌓아도 전체 패키지 높이가 표준 규격(720µm)을 넘지 않도록 만듭니다.',
      electricalMechanism: '기판 두께가 얇아지면 트랜지스터에서 발생한 뜨거운 열이 패키지 외부로 빠져나가는 열저항(Rth)이 급감합니다. 또한 TSV의 물리적 길이가 짧아져 TSV 저항과 기생 커패시턴스가 비약적으로 줄어들어 신호 왜곡을 방지합니다.',
      defectImpact: '연삭 중 웨이퍼가 휘거나(Warpage) 깨지면 웨이퍼 한 장당 수천만 원에 달하는 고부가가치 칩 전체가 폐기되고, 칩 가장자리에 미세 크랙이 남으면 조립 후 칩이 쪼개집니다.',
      keyMetricsSummary: [
        { label: '잔여 실리콘 두께', spec: '30 µm (HBM 적층 필수 규격)' },
        { label: '열 방출 저항 (Rth)', spec: '기존 대비 80% 감소 (쿨링 극대화)' },
        { label: 'TSV 신호 지연 단축', spec: '< 0.05 ps (초단축 수직 경로)' }
      ]
    },

    vendorFrontier: {
      leader: 'DISCO Corporation (일본 도쿄 본사)',
      flagshipTech: 'Stealth Dicing Before Grinding (DBG) & Plasma Dicing',
      details: '웨이퍼 후면 연삭 전에 레이저로 미리 칩 내부에 분할선을 넣고 갈아내며 자연스럽게 칩으로 분리시키는 DBG 공정과, 화학 플라즈마로 절단 부스러기(Chipping)를 완전히 제로화하는 플라즈마 다이싱 기술이 도입되었습니다.'
    },

    fdcAlert: {
      signature: '스핀들 진동 주파수 스펙트럼 이상 신호 (+2.2 kHz, 휠 마모)',
      recoveryAction: '다이아몬드 그라인딩 휠 자동 드레싱 및 공급 수압 승압',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 11. 플립칩 본딩 (Flip-Chip Die Attach)
  // ─────────────────────────────────────────────────────────────────
  'p11': {
    id: 'p11',
    category: 'back',
    subCategory: 'Package (마이크로범프 실장)',
    stepNum: '11',
    nameKo: '다이 어태치 & 본딩',
    nameEn: 'Flip-Chip Die Attach & Microbump Bonding',
    cuteName: '🧩 11. 칩 뒤집어 범프 붙이기 (플립칩)',
    cuteSummary: '거추장스러운 금선(와이어)을 없애고, 칩을 거꾸로 뒤집어 미세 솔더볼(범프)로 기판에 착 붙여요!',
    mosfetRole: 'MOSFET 단자에서 패키지 기판으로의 초저인덕턴스 직결',
    vendorLeader: '한미반도체 · 신카와(Shinkawa) · 베시(Besi)',
    keyEquipment: '한미반도체 Dual TC 본더 & Besi 초정밀 플립칩 플래서',
    tag: 'Flip-Chip',
    color: '#8b5cf6',
    summary: '다이싱된 개별 칩을 180도 뒤집어 25µm 피치의 무연 솔더(Sn-Ag-Cu) 마이크로범프를 패키지 기판 패드에 정렬하고, 열압착(TCB) 툴로 260°C 열과 압력을 가해 금속간 화합물(IMC)로 야금학적 솔더 접합을 완성하는 공정입니다.',
    
    equipModelType: 'hanmi_tc_bonder',
    microModelType: 'p11_micro',

    telemetry: [
      { name: '본딩 정렬 오차 (Alignment)', val: 0.85, unit: 'µm', min: 0, max: 1.5, target: 1.0, status: 'ok' },
      { name: '본딩 헤드 피크온도', val: 262.5, unit: '°C', min: 250, max: 275, target: 260.0, status: 'ok' },
      { name: '본딩 가압 하중', val: 14.8, unit: 'N', min: 12, max: 18, target: 15.0, status: 'ok' },
      { name: '기생 인덕턴스 (Lparasitic)', val: 0.082, unit: 'nH', min: 0.05, max: 0.15, target: 0.08, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '범프 높이 동평탄도 (Coplanarity)',
        target: '전체 마이크로범프 높이 편차 < 1.5 µm',
        tool: '광학 3D 공초점 범프 검사기',
        purpose: '범프 높낮이가 다르면 특정 범프는 기판에 닿지 않아 단선(Open)되고, 높은 범프는 옆으로 눌려 합선(Short) 발생'
      },
      {
        param: '솔더 접합 보이드율 (Solder Void Ratio)',
        target: '접합 단면적 대비 보이드 면적 < 3.0%',
        tool: '고해상도 3D X-ray 엑스레이 단층 검사기',
        purpose: '솔더 내부 공극(Void)은 전류 집중으로 인한 국소 발열(Hot-spot)을 유발하고 고전력 구동 시 조기 파괴 원인이 됨'
      },
      {
        param: '금속간 화합물 두께 (IMC Thickness)',
        target: 'Cu₆Sn₅ / Cu₃Sn 두께 1.0 ~ 2.0 µm',
        tool: '단면 SEM 분석',
        purpose: 'IMC는 필수적인 접합층이지만 과도하게 두꺼워지면 취성(Brittle)이 강해져 열충격 시 계면 크랙 파괴 발생'
      },
      {
        param: '칩 기울어짐 각도 (Die Tilt)',
        target: '대각선 방향 기울어짐 < 0.05°',
        tool: '레이저 평탄도 프로파일러',
        purpose: '칩이 한쪽으로 기울어지면 열압착 응력이 불균등해져 실리콘 다이 코너가 파손될 위험 존재'
      }
    ],

    eeAnalysis: {
      targetPart: '칩 전면 25µm 마이크로범프 및 패키지 랜드 단자',
      whyWeDoThis: '기존의 얇은 금선(와이어본딩)은 길이가 길어 높은 기생 인덕턴스를 유발하므로, 칩을 뒤집어 기판에 직결함으로써 고주파 신호 손실을 없애기 위해 수행합니다.',
      structuralRole: '칩 내부의 MOSFET 트랜지스터들이 패키지 기판과 가장 짧은 물리적 거리(25µm)로 연결되게 만들어 전원과 신호의 통로 역할을 합니다.',
      electricalMechanism: '와이어본딩(L ≈ 2.0 nH) 대비 플립칩 마이크로범프는 기생 인덕턴스를 0.1 nH 미만으로 95% 이상 격감시킵니다. 인덕턴스가 줄어들면 고속 전류 스위칭(di/dt) 시 발생하는 전원 노이즈(Ground Bounce = L · di/dt)가 사라져, 전압 강하 없이 초고주파 통신이 가능해집니다.',
      defectImpact: '솔더가 덜 녹거나 불순물로 인해 접합이 불량하면(Cold Solder), 특정 입출력 핀이 단선되어 칩의 데이터 버스가 먹통이 됩니다.',
      keyMetricsSummary: [
        { label: '기생 인덕턴스 (L)', spec: '< 0.1 nH (와이어본딩 대비 95% 감소)' },
        { label: '입출력 I/O 밀도', spec: '10배 이상 증가 (초고밀도 단자 배치)' },
        { label: '전원 노이즈 (Bounce)', spec: '전압 변동 80% 억제 (신호 무결성)' }
      ]
    },

    vendorFrontier: {
      leader: '한미반도체 & Besi (BE Semiconductor)',
      flagshipTech: 'Thermal Compression (TC) Bonder with Non-Conductive Film (NCF)',
      details: '열과 압력을 동시에 가하면서 솔더 접합과 언더필 수지를 한 번에 경화시키는 TC-NCF 기술과, 진공 챔버 내에서 가접합 후 리플로우하는 고속 갠트리 플립칩 기술이 시장을 주도하고 있습니다.'
    },

    fdcAlert: {
      signature: '본딩 가압 센서 3번 로드셀 하중 편차 (+1.4 N)',
      recoveryAction: '로드셀 영점 자동 캘리브레이션 및 압전 서보 압력 균등 배분',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 12. 몰딩 & SLT 테스트 (EMC Molding & SLT)
  // ─────────────────────────────────────────────────────────────────
  'p12': {
    id: 'p12',
    category: 'back',
    subCategory: 'Package (수지 밀봉 및 최종 테스트)',
    stepNum: '12',
    nameKo: '몰딩 & SLT 테스트',
    nameEn: 'EMC Molding & System-Level Test',
    cuteName: '🍫 12. 에폭시 초콜릿 옷 입히기 (몰딩)',
    cuteSummary: '단단한 블랙 에폭시 수지(EMC)로 칩 주위를 빈틈없이 감싸 충격과 습기로부터 보호하고 최종 성능을 검사해요!',
    mosfetRole: 'MOSFET 소자 및 회로 기계적/환경적 완전 밀봉 보호',
    vendorLeader: 'TOWA (글로벌 독점) · 한미반도체 · Advantest',
    keyEquipment: 'TOWA 초정밀 컴프레션 몰딩기 & Advantest SLT 핸들러',
    tag: 'EMC Molding & SLT',
    color: '#ff9f0a',
    summary: '플립칩 실장된 다이 주변과 미세 갭에 구형 실리카 필러가 함유된 액상 에폭시 몰딩 컴파운드(EMC)를 100 bar 고압으로 기포(Void) 없이 사출 밀봉한 후, 고온 경화하고 실제 시스템 보드 환경에서 최종 기능과 신뢰성을 전수 검사하는 공정입니다.',
    
    equipModelType: 'towa_molding_press',
    microModelType: 'p12_micro',

    telemetry: [
      { name: '언더필 무기포율 (Void-Free)', val: 99.96, unit: '%', min: 99.0, max: 100, target: 100.0, status: 'ok' },
      { name: '패키지 휨 (Warpage)', val: 24.5, unit: 'µm', min: 0, max: 45.0, target: 25.0, status: 'ok' },
      { name: '금형 체결 온도', val: 175.2, unit: '°C', min: 165, max: 185, target: 175.0, status: 'ok' },
      { name: 'SLT 시스템 통과율', val: 98.4, unit: '% Pass', min: 95, max: 100, target: 98.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '언더필 마이크로 보이드 (Underfill Void)',
        target: '범프 사이 25µm 갭 내부 보이드 100% Zero',
        tool: '초음파 탐상 검사기 (C-SAM, Acoustic Microscopy)',
        purpose: '언더필 내부에 미세 공기방울이 남으면 고온 동작 시 열팽창으로 터지거나 솔더가 흘러들어 쇼트 유발'
      },
      {
        param: '패키지 열팽창 휨 (Package Warpage)',
        target: '상온 및 260°C 리플로우 시 Warpage < 40 µm',
        tool: '모아레 섀도우(Shadow Moire) 3D 열변형 측정기',
        purpose: '실리콘 칩(CTE 2.6)과 EMC(CTE 10), 기판(CTE 15) 간 열팽창계수 차이로 칩이 바나나처럼 휘면 메인보드 실장 불가'
      },
      {
        param: '계면 박리 (Delamination Resistance)',
        target: 'JEDEC MSL-1 등급 (습도 85%, 85°C 168시간 무박리)',
        tool: 'C-SAM 비파괴 초음파 영상 검사',
        purpose: '칩과 몰드 수지 사이가 벌어지면 외부 습기가 침투하여 알루미늄 배선 부식 및 팝콘 현상 파괴 초래'
      },
      {
        param: '방열 열전도율 (Thermal Conductivity κ)',
        target: 'EMC 수지 열전도도 κ > 3.2 W/m·K',
        tool: '레이저 플래시 열물성 분석기 (LFA)',
        purpose: '고전력 칩의 열을 상부 히트싱크로 신속히 전달하기 위해 알루미나/실리카 고열전도 필러 최적 충진'
      }
    ],

    eeAnalysis: {
      targetPart: '패키지 전체 외피 및 마이크로범프 언더필 보호재',
      whyWeDoThis: '외부 습기, 부식성 가스, 물리적 충격, 열 스트레스로부터 연약한 실리콘 트랜지스터와 미세 솔더 접합부를 영구히 보호하기 위해 수행합니다.',
      structuralRole: '외부 충격 흡수 갑옷 역할을 함과 동시에, 칩과 기판 사이의 열팽창계수 불일치로 인해 범프에 가해지는 극심한 기계적 전단 응력(Shear Stress)을 언더필 수지가 분산 흡수합니다.',
      electricalMechanism: '완벽한 절연성을 가진 EMC 수지가 외부 먼지나 습기로 인한 누설전류 통로를 원천 차단하고, 유전 손실을 줄여 고주파 신호의 품질을 유지시킵니다. 또한 높은 열전도율로 동작 온도를 낮춰 MOSFET의 온전류(Ion) 감소를 방어합니다.',
      defectImpact: '몰딩에 기포가 남거나 박리가 생기면, SMT 리플로우 납땜 고온(260°C)에서 갇힌 수분이 순간 기화하며 칩이 폭발하듯 찢어지는 팝콘 크랙(Popcorn Crack)이 발생합니다.',
      keyMetricsSummary: [
        { label: '신뢰성 수명 등급', spec: 'MSL-1 (수분 침투 제로 무제한 수명)' },
        { label: '패키지 휨 (Warpage)', spec: '< 35 µm (메인보드 결합 보장)' },
        { label: '열전도율 (Conductivity)', spec: '> 3.2 W/m·K (신속한 방열)' }
      ]
    },

    vendorFrontier: {
      leader: 'TOWA Corporation (일본)',
      flagshipTech: 'Compression Molding with Ultra-Fine Granule EMC (Void-Free)',
      details: '수지를 밀어 넣는 기존 트랜스퍼 방식 대신, 금형에 액상 수지를 담고 칩을 위에서 눌러 담그는 컴프레션 몰딩 기술은 초미세 범프 사이의 유동 저항을 제로화하여 대면적 HBM 및 칩렛 패키징의 절대적 표준이 되었습니다.'
    },

    fdcAlert: {
      signature: '몰드 금형 상부 캐비티 진공 압력 미세 도달 지연 (-0.8초)',
      recoveryAction: '진공 펌프 배기 라인 필터 펄스 퍼지 및 진공 밸브 리셋',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 13. HBM 3D 적층 & TSV (HBM 3D Stacking)
  // ─────────────────────────────────────────────────────────────────
  'p13': {
    id: 'p13',
    category: 'back',
    subCategory: 'HBM (3D 초고대역폭 메모리)',
    stepNum: '13',
    nameKo: 'HBM 3D 적층 & TSV',
    nameEn: 'HBM 3D TSV Stacking (MR-MUF)',
    cuteName: '🥞 13. HBM 팬케이크 8단 수직 적층',
    cuteSummary: 'D램 8장을 아파트처럼 높이 쌓고 1024개의 구리 기둥(TSV)으로 뚫어 1.2 TB/s의 초광대역 메모리 큐브를 완성해요!',
    mosfetRole: '1024-bit 초광대역 TSV 수직 신호 버스 직결',
    vendorLeader: 'SK하이닉스 (HBM3e/4 독주) · 삼성전자 · 한미반도체',
    keyEquipment: '한미반도체 Dual TC 본더 & SK하이닉스 Advanced MR-MUF 시스템',
    tag: '★ HBM 3D TSV',
    color: '#00f0ff',
    summary: '베이스 로직 다이 위에 30µm로 박형화된 8장의 D램 코어 다이를 수직으로 1단씩 열압착(TCB) 적층하고, 칩을 관통하는 1024개의 초미세 실리콘 관통 전극(TSV)으로 직결한 뒤, 액상 에폭시 수지(MR-MUF)를 모세관 현상으로 한 번에 주입하여 1.2 TB/s 초광대역 메모리 큐브를 완성하는 국가 핵심 기술 공정입니다.',
    
    equipModelType: 'hbm_3d_stacker',
    microModelType: 'hbm_playback',

    telemetry: [
      { name: '적층 다이 층수', val: 8, unit: 'Dies (8-Hi)', min: 4, max: 16, target: 8, status: 'ok' },
      { name: 'TSV 버스 대역폭', val: 1.18, unit: 'TB/s (1024-bit)', min: 1.0, max: 1.3, target: 1.2, status: 'ok' },
      { name: '다이 적층 정렬 오차', val: 0.72, unit: 'µm', min: 0, max: 1.2, target: 0.8, status: 'ok' },
      { name: 'MR-MUF 열방열 개선율', val: 2.52, unit: '배 (vs TC-NCF)', min: 2.0, max: 3.0, target: 2.5, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '8단 다이 간 수직 정렬도 (Die-to-Die Alignment)',
        target: 'X/Y 정렬 오차 < 0.8 µm (1024개 핀 일치)',
        tool: 'IR 적외선 투시 서브미크론 정렬 센서',
        purpose: '8장의 다이가 위아래로 조금이라도 어긋나면 1024개의 미세 TSV 범프가 빗나가 오픈 결함 또는 쇼트 발생'
      },
      {
        param: '1024-bit TSV 전기적 통전 수율 (TSV Yield)',
        target: 'TSV 오픈/쇼트 결함률 Zero (100% 도통)',
        tool: '인라인 BIST (내장 자가 테스트) & 바운더리 스캔',
        purpose: '1024개의 데이터 라인 중 단 1가닥만 끊어져도 메모리 버스 전체의 대역폭이 붕괴되므로 리던던시 비아 자동 절체'
      },
      {
        param: 'MR-MUF 언더필 모세관 충진율 (Gap Fill)',
        target: '15 µm 좁은 다이 간극 무공극 충진 100%',
        tool: '3D C-SAM 및 고해상도 X-ray 단층기',
        purpose: '다이 사이에 빈틈이 생기면 열이 빠져나가지 못해 D램 셀 온도가 치솟아 리프레시(Refresh) 주기 단축 및 데이터 유실'
      },
      {
        param: 'KOZ (Keep-Out Zone) 스트레스 제어',
        target: '구리 TSV 주변 트랜지스터 이동도 변동 < 3%',
        tool: '마이크로 라만(Micro-Raman) 응력 분석기',
        purpose: '구리와 실리콘의 열팽창 차이로 생기는 기계적 스트레스가 주변 MOSFET의 특성을 왜곡하므로 완충 라이너(SiO₂/폴리머) 설계'
      }
    ],

    eeAnalysis: {
      targetPart: '8개 D램 다이를 관통하는 1024개 구리 기둥(TSV) 및 마이크로범프',
      whyWeDoThis: '기존 2D 구조에서는 메모리와 GPU 간 배선이 길어 데이터 병목 현상(Memory Wall)이 발생하므로, 칩을 위로 쌓아 배선 길이를 1/1000로 줄이고 대역폭을 극한으로 끌어올리기 위해 수행합니다.',
      structuralRole: '기판 실리콘을 물리적으로 관통하는 1024개의 수직 구리 고속도로(TSV, 직경 5µm)를 구축하여, 8장의 메모리 다이가 단 하나의 초거대 메모리처럼 일체화되어 동작하게 만듭니다.',
      electricalMechanism: '수 밀리미터에 달하던 배선 길이가 수십 마이크로미터로 단축되어 배선 저항(R)과 기생 커패시턴스(C)가 사라집니다. 그 결과 1024비트의 초광대역 버스를 1.2V의 낮은 전압으로 구동하면서도 무려 1.2 TB/s라는 경이로운 대역폭으로 AI 가속기에 데이터를 쏟아붓습니다.',
      defectImpact: '다이 적층 시 정렬이 틀어져 TSV 접합이 끊어지면 HBM 전체가 폐기되고, MR-MUF 수지에 기포가 생기면 방열이 막혀 고온에서 D램 데이터가 증발해버립니다.',
      keyMetricsSummary: [
        { label: '데이터 대역폭 (Bandwidth)', spec: '1.2 TB/s (초당 4K 영화 300편 전송)' },
        { label: '버스 폭 (Bus Width)', spec: '1024-bit 초병렬 채널 (GPU 직결)' },
        { label: '동작 전력 효율', spec: '기존 대비 65% 절감 (초단거리 구동)' }
      ]
    },

    vendorFrontier: {
      leader: 'SK하이닉스 (글로벌 점유율 1위)',
      flagshipTech: 'Advanced MR-MUF (액상 수지 일괄 주입) & 하이브리드 본딩 (Cu-Cu)',
      details: '삼성전자의 필름 압착(TC-NCF) 방식과 달리, 다이를 가접합 후 고열전도 액상 에폭시를 모세관으로 흘려 넣는 SK하이닉스의 Advanced MR-MUF는 방열 효율을 2.5배 높여 엔비디아 AI 가속기(H100/B200)에 독점 납품하는 핵심 원동력이 되었습니다. 차세대 HBM4에서는 범프 없이 구리와 구리를 직접 붙이는 하이브리드 본딩이 도입됩니다.'
    },

    fdcAlert: {
      signature: '본더 헤드 진공 압력 미세 리크 감지 (-0.5 kPa, 다이 픽업단)',
      recoveryAction: '진공 패드 고무 실링 인시츄 자동 정렬 및 파큠 승압',
      severity: 'auto'
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 14. 2.5D 인터포저 & 칩렛 (2.5D Interposer CoWoS)
  // ─────────────────────────────────────────────────────────────────
  'p14': {
    id: 'p14',
    category: 'back',
    subCategory: 'Package (이종 집적 칩렛 패키징)',
    stepNum: '14',
    nameKo: '2.5D 인터포저 & 칩렛',
    nameEn: '2.5D Silicon Interposer & Chiplet Integration',
    cuteName: '🤝 14. 실리콘 고속도로 위 GPU-HBM 동거 (2.5D)',
    cuteSummary: '거대한 실리콘 판(인터포저) 위에 AI GPU와 HBM을 1mm 거리로 나란히 올려 빛의 속도로 대화하게 만들어요!',
    mosfetRole: 'GPU와 HBM 간 초미세 RDL 인터페이스 고속 연결',
    vendorLeader: 'TSMC (CoWoS 독점) · 삼성전자 (I-Cube) · 인텔 (EMIB)',
    keyEquipment: 'TSMC CoWoS-S 실리콘 인터포저 본딩 및 RDL 제조 라인',
    tag: '★ 2.5D CoWoS',
    color: '#c084fc',
    summary: '서브마이크론(0.4µm) 선폭의 초미세 다층 배선(RDL)이 형성된 대형 실리콘 인터포저 위에 거대한 AI GPU 로직 다이와 여러 개의 HBM3e 큐브를 나란히 올려 마이크로범프로 실장하고, 하부는 대형 C4 범프로 메인보드 패키지 기판과 연결하는 최고난도 이종 집적 칩렛 공정입니다.',
    
    equipModelType: 'cowos_interposer_integrator',
    microModelType: 'interposer_playback',

    telemetry: [
      { name: '인터포저 면적 크기', val: 3.3, unit: 'x Reticle Size', min: 2.0, max: 4.5, target: 3.3, status: 'ok' },
      { name: 'RDL 배선 선폭 (L/S)', val: 0.42, unit: 'µm L/S', min: 0.35, max: 0.55, target: 0.4, status: 'ok' },
      { name: 'GPU-HBM 신호 지연', val: 0.12, unit: 'ns', min: 0.08, max: 0.2, target: 0.1, status: 'ok' },
      { name: 'Eye Diagram 지터 마진', val: 78.5, unit: '% UI Open', min: 70, max: 95, target: 80.0, status: 'ok' }
    ],

    controlPoints: [
      {
        param: '서브마이크론 RDL 오픈/쇼트 결함률',
        target: '0.4 µm 라인/스페이스 배선 결함률 Zero',
        tool: '초고속 광학 E-beam 검사기 및 고주파 TDR 분석기',
        purpose: '면적이 손바닥만 한 실리콘 인터포저 내부의 수만 가닥 배선 중 단 1개라도 쇼트나 단선이 나면 초고가 GPU와 HBM 전체가 파기됨'
      },
      {
        param: 'GPU-HBM 채널 간 타이밍 스큐 (Timing Skew)',
        target: '8192개 데이터 라인 간 스큐 < 5.0 ps',
        tool: '고속 오실로스코프 Eye Diagram 분석기',
        purpose: '초병렬 채널에서 신호가 도달하는 시간 차이가 5ps를 초과하면 병렬 데이터 샘플링 시 지터(Jitter) 오류 발생'
      },
      {
        param: 'C4 범프 및 BGA 볼 접합 신뢰성',
        target: '온도 사이클 시험(-40°C ~ 125°C) 1,000회 무파괴',
        tool: '열충격 챔버 및 저항 실시간 모니터링 시스템',
        purpose: '대형 패키지가 열을 받아 팽창/수축할 때 바닥면의 큰 솔더볼이 피로 파괴되지 않도록 응력 완화 구조 설계'
      },
      {
        param: '대면적 인터포저 휨 제어 (Large Warpage)',
        target: '인터포저 대각선 휨 < 50 µm',
        tool: '3D 레이저 섀도우 모아레 측정기',
        purpose: '레티클 면적의 3.3배가 넘는 거대한 실리콘 인터포저가 휘어지면 칩 실장 시 범프 접합 불량 발생'
      }
    ],

    eeAnalysis: {
      targetPart: '실리콘 인터포저 기판 및 초미세 RDL 배선망',
      whyWeDoThis: '단일 실리콘 칩으로 만들 수 있는 물리적 크기의 한계(Reticle Limit, 약 858 mm²)를 극복하고, 서로 다른 최적의 공정 노드로 제조된 GPU와 HBM을 단일 패키지로 묶기 위해 수행합니다.',
      structuralRole: '기존 PCB 기판 위에 바로 얹으면 배선이 너무 굵어 수천 가닥의 신호선을 연결할 수 없기 때문에, 웨이퍼 수준의 나노미터 배선이 가능한 실리콘 인터포저를 징검다리로 깔아주는 구조입니다.',
      electricalMechanism: 'GPU와 HBM 사이의 물리적 거리가 1mm 미만으로 좁혀져, 배선 지연 시간(Latency)이 0.1ns 미만으로 단축됩니다. 이는 PCB 배선 대비 통신 속도를 수십 배 끌어올리면서도 신호 감쇄가 없어 신호 무결성(Signal Integrity)을 보장하고 소비 전력을 획기적으로 낮춥니다.',
      defectImpact: '인터포저 RDL 배선에 결함이 발생하면 1장에 4천만 원을 호가하는 엔비디아 H100 GPU와 최고급 HBM 8개가 결합된 채 즉시 불량 처리되어 천문학적인 금전 손실이 발생합니다.',
      keyMetricsSummary: [
        { label: '배선 미세도 (Line/Space)', spec: '0.4 µm (일반 PCB 대비 100배 정밀)' },
        { label: '통신 지연시간 (Latency)', spec: '< 0.15 ns (거의 즉각적인 메모리 액세스)' },
        { label: '신호 무결성 (Eye Margin)', spec: '> 75% (노이즈 없는 깨끗한 파형)' }
      ]
    },

    vendorFrontier: {
      leader: 'TSMC (CoWoS-S / CoWoS-L) & 삼성전자 (I-Cube)',
      flagshipTech: 'CoWoS (Chip-on-Wafer-on-Substrate) with 3.3x Reticle Interposer',
      details: '현재 AI 반도체 시장의 최대 병목은 TSMC의 CoWoS 생산 능력입니다. 엔비디아 블랙웰(B200)을 위해 레티클 한계의 3.3배에 달하는 초대형 인터포저를 양산하는 CoWoS-L 기술과, 유리를 기판으로 사용하는 차세대 글래스 인터포저 연구가 활발히 진행 중입니다.'
    },

    fdcAlert: {
      signature: '인터포저 칩 마운트 갠트리 X축 서보 모터 미세 엔코더 떨림 (0.04µm)',
      recoveryAction: '자기부상 리니어 모터 드라이브 인덕턴스 자동 동기화 튜닝',
      severity: 'auto'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// 트랜지스터 소자 진화 비교 데이터셋 (Planar vs FinFET vs GAA Nanosheet)
// ═══════════════════════════════════════════════════════════════════
const TRANSISTOR_EVOLUTION_DATA = {
  'planar': {
    id: 'planar',
    nameKo: '2D 평면형 MOSFET (Planar FET)',
    nameEn: 'Planar MOSFET (Single Gate)',
    gateType: '1면 단일 제어 (Top Gate)',
    gateCoveragePct: 33,
    era: '1960년대 ~ 2011년 (28nm 노드 한계 도달)',
    color: '#38bdf8',
    summary: '실리콘 기판 표면에 평평하게 소스-채널-드레인을 형성하고 그 위에만 게이트를 얹은 고전적 2D 트랜지스터입니다. 게이트 길이가 20nm 이하로 줄어들면서 드레인 전계가 채널 깊숙한 바닥으로 침투하여 게이트가 통제할 수 없는 기판 바닥 누설전류(Subsurface Leakage / Punch-through)가 폭증하는 단채널 효과(SCE)의 벽에 부딪혔습니다.',
    keyMetrics: [
      { label: '게이트 장악력', spec: '1면 (상단 33%)' },
      { label: '오프 누설전류 (Ioff)', spec: '> 2.5×10⁻⁹ A (심각한 대기 전력 누설)' },
      { label: '스위칭 기울기 (SS)', spec: '92 mV/dec (이상적 60 대비 완만)' },
      { label: '드레인 유기 장벽 저하 (DIBL)', spec: '125 mV/V (드레인 전압에 채널 장벽 무너짐)' }
    ],
    telemetry: [
      { name: '게이트 전계 장악도', val: 33.3, unit: '% (1면)', min: 0, max: 100, target: 100, status: 'warn' },
      { name: '서브스레숄드 스윙 (SS)', val: 92.0, unit: 'mV/dec', min: 60, max: 120, target: 60.0, status: 'crit' },
      { name: 'DIBL 장벽 저하율', val: 125.0, unit: 'mV/V', min: 0, max: 150, target: 20.0, status: 'crit' },
      { name: '상대 구동전류 (Ion)', val: 1.0, unit: 'x (기준)', min: 0.5, max: 4.0, target: 3.5, status: 'warn' }
    ],
    controlPoints: [
      {
        param: '게이트 절연막 누설 (Gate Dielectric Leakage)',
        target: 'Tox < 1.2 nm 영역에서 양자 터널링 전류 급증',
        tool: '수은 프로브(Mercury Probe) 및 C-V 계측기',
        purpose: '채널 장악력을 높이려고 SiO₂ 두께를 무작정 얇게 하면 전자가 게이트를 직접 뚫고 지나가는 양자 터널링 누설 발생'
      },
      {
        param: '접합 누설 및 펀치스루 (Punch-through)',
        target: '채널 길이 Lg < 28nm 영역에서 드레인 공핍층이 소스에 직접 닿음',
        tool: '반도체 파라미터 분석기 (Agilent B1500A)',
        purpose: '게이트 전압이 0V여도 기판 깊은 곳(바닥)을 통해 전류가 계속 흘러 스위치 오프 불능 상태 초래'
      },
      {
        param: '채널 도핑 농도 한계 (Halo / Pocket Doping)',
        target: 'B/In 도펀트 농도 > 5×10¹⁸ cm⁻³',
        tool: 'SIMS (2차 이온 질량 분석기)',
        purpose: '바닥 누설을 막으려고 채널에 불순물을 과도하게 주입하면 불순물 산란으로 전자 이동도(Mobility)가 반토막 남'
      }
    ],
    eeAnalysis: {
      targetPart: '평면 Si 기판 표면 채널 및 게이트 상단 계면 (2D Planar Surface)',
      whyWeDoThis: '초기 반도체 산업에서 포토리소그래피와 이온주입으로 가장 쉽게 만들 수 있는 2차원 평면 구조였기 때문입니다.',
      structuralRole: '게이트 전극이 채널의 맨 윗면(1면)에만 얹혀 있어, 채널 상부 표면만 전계(Electric Field)로 누를 수 있고 깊은 바닥은 전계가 닿지 않습니다.',
      electricalMechanism: '게이트에 +전압을 인가하면 상부 산화막 바로 아래에만 전자 반전층(Inversion Layer)이 얇게 형성됩니다. 하지만 소자와 드레인 사이 거리가 좁아지면(단채널 효과), 드레인의 높은 +전압 전계가 기판 바닥으로 침투하여 게이트의 허락 없이도 전자를 끌어당겨 누설전류(Ioff)가 폭증합니다.',
      defectImpact: '미세화 시 대기 전력 소모가 기하급수적으로 증가하여 스마트폰 배터리가 몇 시간 만에 방전되고 칩이 과열로 타버리는 발열 장벽(Power Dissipation Wall)에 부딪혀 28nm에서 진화가 중단되었습니다.',
      keyMetricsSummary: [
        { label: '게이트 제어 면적', spec: '1면 (상단만 제어)' },
        { label: '바닥 누설전류 경로', spec: '기판 하부(Subsurface) 무방비 노출' },
        { label: '스케일링 한계 노드', spec: '28nm (단채널 물리 한계)' }
      ]
    },
    vendorFrontier: {
      leader: '레거시 성숙 공정 파운드리 (TSMC 28nm, UMC, DB하이텍)',
      flagshipTech: '28nm High-k Metal Gate (HKMG) Planar',
      details: 'Planar 구조는 28nm 공정에서 마지막 HKMG 기술을 적용한 뒤 미세화 한계에 도달했습니다. 현재는 디스플레이 구동칩(DDI), 전력관리반도체(PMIC) 등 저비용 레거시 칩에만 주로 쓰입니다.'
    }
  },

  'finfet': {
    id: 'finfet',
    nameKo: '3D 핀펫 (FinFET: Fin Field-Effect Transistor)',
    nameEn: '3D FinFET (Tri-Gate)',
    gateType: '3면 입체 제어 (Tri-Gate: Left, Top, Right)',
    gateCoveragePct: 75,
    era: '2011년 (인텔 22nm 최초 도입) ~ 현재 (3nm까지 선단 주력)',
    color: '#f59e0b',
    summary: '실리콘 채널을 상어 지느러미(Fin)처럼 수직으로 우뚝 세우고, 게이트가 핀의 3면(좌, 상, 우)을 입체적으로 감싸안은 혁신적인 3D 구조입니다. 평면 면적을 넓히지 않고도 핀 높이(H_fin)를 이용해 유효 채널 폭(Weff = 2H + W)을 2.5배 이상 확보하여 구동전류가 급증하고 단채널 효과를 획기적으로 억제했습니다. 그러나 핀의 바닥 뿌리가 실리콘 기판과 물리적으로 연결되어 있어 3nm 이하에서는 바닥 누설을 막기 어렵습니다.',
    keyMetrics: [
      { label: '게이트 장악력', spec: '3면 (좌/상/우 75%)' },
      { label: '오프 누설전류 (Ioff)', spec: '~ 8.5×10⁻¹² A (평면 대비 1/100 수준 개선)' },
      { label: '스위칭 기울기 (SS)', spec: '68 mV/dec (칼 같은 스위칭)' },
      { label: '드레인 유기 장벽 저하 (DIBL)', spec: '42 mV/V (단채널 대폭 개선)' }
    ],
    telemetry: [
      { name: '게이트 전계 장악도', val: 75.0, unit: '% (3면)', min: 0, max: 100, target: 100, status: 'ok' },
      { name: '서브스레숄드 스윙 (SS)', val: 68.0, unit: 'mV/dec', min: 60, max: 120, target: 60.0, status: 'ok' },
      { name: 'DIBL 장벽 저하율', val: 42.0, unit: 'mV/V', min: 0, max: 150, target: 20.0, status: 'ok' },
      { name: '상대 구동전류 (Ion)', val: 2.4, unit: 'x (평면 대비)', min: 0.5, max: 4.0, target: 3.5, status: 'ok' }
    ],
    controlPoints: [
      {
        param: '핀 측벽 수직 프로파일 (Fin Profile Tilt Angle)',
        target: '수직도 88° ~ 90° (테이퍼 완벽 억제)',
        tool: 'CD-SEM 및 3D AFM',
        purpose: '핀의 양 측벽이 비스듬해지면 상단과 하단의 문턱전압(Vth)이 달라져 채널 전도가 불균일해짐'
      },
      {
        param: '핀 두께 균일도 (Fin Width Variation, Wfin)',
        target: 'Wfin = 6nm ± 0.3nm (원자 1~2개 층 편차 이내)',
        tool: '투과 전자현미경 (HR-TEM / STEM)',
        purpose: '핀 폭이 5nm 이하로 얇아지면 양자 가둠 효과(Quantum Confinement)로 문턱전압 편차가 극도로 심해짐'
      },
      {
        param: '핀 바닥 기판 분리 (Sub-Fin Punch-through Stop)',
        target: '핀 바닥 웰 도핑 농도 > 1×10¹⁸ cm⁻³',
        tool: 'SSR (주사 정전용량 현미경)',
        purpose: '게이트가 닿지 않는 핀 뿌리 쪽으로 전류가 새는 서브핀(Sub-fin) 누설전류를 차단하기 위한 웰 농도 유지'
      }
    ],
    eeAnalysis: {
      targetPart: '수직 돌출 실리콘 핀 채널 및 3면 High-k 메탈 게이트 (3D Vertical Fin)',
      whyWeDoThis: '28nm에서 막힌 평면 스케일링 한계를 돌파하고, 3차원 입체 전계 제어로 누설전류를 통제하기 위해 도입되었습니다.',
      structuralRole: '채널이 바닥에 납작 엎드린 게 아니라 위로 솟아올라 있어, 게이트 금속이 왼쪽 벽, 천장, 오른쪽 벽의 3방향에서 채널을 완전히 포위합니다.',
      electricalMechanism: '양 측벽에서 동시에 전계가 가해져 채널 내부의 전위(Potential)를 완전히 장악합니다. 드레인 전압이 아무리 높아져도 양옆의 게이트 전계가 장벽을 꽉 쥐고 있어 DIBL이 억제되고, 3개 면 전체에 전자 전도 채널이 형성되므로 구동전류(Ion)가 2.4배 이상 증가합니다.',
      defectImpact: '단, 핀의 바닥(Root)은 여전히 실리콘 기판과 한 몸으로 붙어 있습니다. 3nm 이하 극한 공정에서는 핀 폭을 더 이상 좁히기 어렵고, 바닥 기판과의 접합부를 통해 전기가 새어나가는 서브핀 누설(Sub-fin Leakage)이 다시 임계치에 도달합니다.',
      keyMetricsSummary: [
        { label: '게이트 제어 면적', spec: '3면 (좌·상·우 포위)' },
        { label: '바닥 누설전류 경로', spec: '핀 바닥 뿌리(Sub-fin Root) 잔존' },
        { label: '선단 적용 노드', spec: '14nm ~ 3nm (현존 주요 AP/GPU)' }
      ]
    },
    vendorFrontier: {
      leader: 'TSMC (N7, N5, N3B/N3E) & 인텔 (Intel 7 / Intel 4)',
      flagshipTech: 'Self-Aligned Quadruple Patterning (SAQP) FinFET',
      details: 'TSMC는 16nm부터 3nm(N3E)까지 핀펫 아키텍처를 극한까지 최적화하여 애플 A/M 시리즈, 엔비디아 H100/B200 GPU를 독점 생산했습니다. 그러나 2nm부터는 핀펫의 물리적 한계로 GAA 나노시트로 전환합니다.'
    }
  },

  'gaa': {
    id: 'gaa',
    nameKo: '차세대 GAA 나노시트 (Gate-All-Around / MBCFET)',
    nameEn: 'GAA Nanosheet (All-Around 360° Gate)',
    gateType: '4면 360° 전방위 완벽 제어 (All-Around 4-Face)',
    gateCoveragePct: 100,
    era: '2022년 (삼성 3nm 세계 최초 양산) ~ 미래 (TSMC 2nm, 인텔 18A, HBM4 베이스 다이)',
    color: '#ec4899',
    summary: '종이 리본 형태의 얇고 넓은 실리콘 나노시트(Nanosheet)를 3~4단으로 공중에 띄우고, 게이트 금속이 상·하·좌·우 360도 전방위를 완벽하게 둘러싼 궁극의 트랜지스터입니다. Si/SiGe를 층층이 쌓은 뒤 SiGe만 화학적으로 쏙 녹여내어 틈새를 만들고, ALD(원자층 증착)로 나노시트 사이와 바닥까지 게이트 금속을 밀어 넣어 바닥 누설 통로를 원천 봉쇄했습니다. HBM4에서 2048비트 버스와 초저전력 연산 로직을 탑재하는 베이스 다이에 필수 적용됩니다.',
    keyMetrics: [
      { label: '게이트 장악력', spec: '4면 360° (상·하·좌·우 100% 밀봉)' },
      { label: '오프 누설전류 (Ioff)', spec: '< 1.2×10⁻¹³ A (이론 한계 수준 극소화)' },
      { label: '스위칭 기울기 (SS)', spec: '61 mV/dec (열역학 이론 한계 60에 근접)' },
      { label: '드레인 유기 장벽 저하 (DIBL)', spec: '12 mV/V (단채널 현상 완전 정복)' }
    ],
    telemetry: [
      { name: '게이트 전계 장악도', val: 100.0, unit: '% (4면 360°)', min: 0, max: 100, target: 100, status: 'ok' },
      { name: '서브스레숄드 스윙 (SS)', val: 61.2, unit: 'mV/dec', min: 60, max: 120, target: 60.0, status: 'ok' },
      { name: 'DIBL 장벽 저하율', val: 12.0, unit: 'mV/V', min: 0, max: 150, target: 20.0, status: 'ok' },
      { name: '상대 구동전류 (Ion)', val: 3.8, unit: 'x (평면 대비)', min: 0.5, max: 4.0, target: 3.5, status: 'ok' }
    ],
    controlPoints: [
      {
        param: 'SiGe 희생층 선택적 식각비 (Si vs SiGe Selectivity)',
        target: '선택 식각비 > 150:1 (Si 나노시트 손상 제로)',
        tool: '매엽식 등방성 건식 가스 에처 (Applied Materials Producer Selectra)',
        purpose: 'SiGe만 완전히 녹여내고 Si 나노시트의 두께와 표면 거칠기를 원자 수준으로 보존해야 함'
      },
      {
        param: '이너 스페이서 형성 (Inner Spacer Dielectric Formation)',
        target: '공동(Cavity) 내 SiN 스페이서 균일 충진 (두께 편차 < 0.2nm)',
        tool: 'ALD 초박막 증착기 & EPD 센서',
        purpose: '나노시트 양 끝단 소스/드레인 에피와 게이트 금속 사이의 기생 커패시턴스(Cgd, Cgs)를 차단하는 핵심 절연벽'
      },
      {
        param: '서브 나노 갭 게이트 ALD 충진 (Gate Gap Fill)',
        target: '8nm 좁은 나노시트 틈새 Void-Free 완벽 충진',
        tool: 'ALD High-k / Metal Gate 챔버 (TEL & Lam)',
        purpose: '나노시트 사이의 미세 터널 내부에 하이케이 유전막과 TiN 일함수 조절 금속이 기포 없이 360도 균일 증착되어야 함'
      },
      {
        param: '바닥 유전체 격리 (Bottom Dielectric Isolation, BDI)',
        target: '기판과 최하단 나노시트 사이 절연막 두께 > 15nm',
        tool: 'TEM 단면 계측',
        purpose: '최하단 채널과 벌크 실리콘 기판 사이를 산화막으로 물리적으로 단절하여 기판 누설전류 완전 제로화'
      }
    ],
    eeAnalysis: {
      targetPart: '다층 실리콘 나노시트 리본 및 360° All-Around Metal Gate (GAA / MBCFET)',
      whyWeDoThis: '핀펫의 3nm 이하 바닥 누설 한계를 극복하고, 유효 채널 폭을 자유자재로 조절하여 성능과 전력 효율을 동시에 극대화하기 위해 수행합니다.',
      structuralRole: '실리콘 채널이 공중에 3단으로 붕 떠 있고, 게이트 금속이 상·하·좌·우 4개 면 전체를 원통 파이프처럼 완벽히 둘러쌉니다. 나노시트 아래 바닥면까지 게이트 금속이 파고들어 채널 하부를 강력히 통제합니다.',
      electricalMechanism: '4면 전체에서 전계가 가해져 채널 체적(Volume) 전체의 전하를 100% 장악(Full Depletion)합니다. 서브스레숄드 스윙(SS)이 상온 물리 한계인 60 mV/dec에 근접한 61 mV/dec를 달성하여 낮은 전압(0.65V)에서도 광속 스위칭이 가능하며, 대기 누설전류(Ioff)는 10⁻¹³ A 이하로 억제됩니다.',
      defectImpact: '희생층 SiGe 식각 시 잔여물이 남으면 게이트 금속 충진 불량(Void)이 발생하여 특정 나노시트가 동작하지 않거나 게이트 절연 파괴(Breakdown)가 발생합니다.',
      keyMetricsSummary: [
        { label: '게이트 제어 면적', spec: '4면 360° (완벽 밀봉)' },
        { label: '바닥 누설전류 경로', spec: '바닥 유전체 격리(BDI)로 원천 차단' },
        { label: '차세대 선단 노드', spec: '3nm / 2nm / HBM4 베이스 다이' }
      ]
    },
    vendorFrontier: {
      leader: '삼성전자 파운드리 (3nm MBCFET 세계 최초 양산) & TSMC (2nm N2 Nanosheet 양산 예정)',
      flagshipTech: 'Multi-Bridge-Channel FET (MBCFET) & Nanosheet with Backside Power Delivery (BSPDN)',
      details: '삼성전자가 2022년 3nm에 세계 최초로 GAA를 적용했고, TSMC는 2025년 2nm(N2)부터 GAA를 전면 도입합니다. 특히 SK하이닉스는 차세대 HBM4의 베이스 다이(Base Die)를 TSMC의 최선단 파운드리 공정으로 생산하기로 공식 파트너십을 체결했습니다.'
    },

    // 💡 SK하이닉스 & 반도체 취업 맞춤형 심층 분석: 왜 HBM4 베이스 다이에 파운드리 GAA를 쓰는가?
    hynixStrategy: {
      title: 'SK하이닉스 HBM4 베이스 다이(Base Die)와 파운드리 GAA 협력의 본질',
      whyOutsource: 'SK하이닉스가 기술력이 없어서 파운드리에 수주를 주는 것이 결코 아닙니다! D램 메모리 공정과 초미세 로직 파운드리 공정의 근본적인 생태계 차이와 천문학적 경제성 때문입니다.',
      points: [
        {
          head: '1. D램 팹과 파운드리 팹은 아키텍처 자체가 완전히 다릅니다',
          desc: 'SK하이닉스의 이천/청주 팹은 초미세 원통형 커패시터(Capacitor, 종횡비 100:1)를 빽빽하게 채워 넣는 1T-1C 메모리 생산에 특화되어 있습니다. 반면 3nm GAA는 커패시터가 전혀 없는 대신 15~18층의 초복잡 금속 배선(BEOL)과 수억 개의 로직 표준 셀(Standard Cell Library)이 필요한 완전히 다른 세상의 공정입니다.'
        },
        {
          head: '2. 30조 원이 넘는 로직 팹 건설(CAPEX) 중복 투자 방지',
          desc: '3nm GAA 전용 팹 1기를 짓는 데는 최소 25조~30조 원이 투입됩니다. 오직 HBM 바닥의 베이스 다이 1장을 만들기 위해 메모리 전문 기업이 30조 원을 들여 로직 팹을 짓는 것은 천문학적인 자본 낭비입니다. 이미 3nm GAA 설비를 완비한 파운드리(TSMC)를 활용하는 것이 압도적으로 경제적입니다.'
        },
        {
          head: '3. HBM4 규격 대격변: 1024비트 ➔ 2048비트 폭증 & 온다이 연산 로직',
          desc: 'HBM3e까지는 베이스 다이가 단순히 신호를 전달하는 역할이라 하이닉스의 자체 D램 공정(20nm~1a nm)으로도 충분했습니다. 하지만 HBM4는 버스 폭이 2048비트로 2배 폭증하고 고객사(엔비디아 등)가 맞춤형 연산 로직, 암호화, 고속 BIST 테스트 블록을 베이스 다이에 직접 내장하길 요구합니다. 이를 감당하려면 극저전력·초미세 로직 공정(3nm/5nm)이 필수적입니다.'
        },
        {
          head: '4. 엔비디아-TSMC-SK하이닉스 AI 삼각 동맹 (CoWoS 원팀)',
          desc: '엔비디아의 GPU는 TSMC에서 제조되어 TSMC의 CoWoS 인터포저 위에서 HBM과 합체됩니다. 하이닉스가 TSMC 3nm로 베이스 다이를 만들고 그 위에 하이닉스만의 독보적 MR-MUF 기술로 1c D램을 쌓아 올리면, TSMC의 CoWoS 패키징 공정과 100% 오차 없는 완벽한 결합이 완성됩니다.'
        }
      ]
    }
  }
};

// 14개 전체 공정 순차 정렬 ID 리스트
const ALL_PROCESS_IDS = [
  'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07',
  'p08', 'p09', 'p10', 'p11', 'p12', 'p13', 'p14'
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FAB_PROCESSES, ALL_PROCESS_IDS, TRANSISTOR_EVOLUTION_DATA };
}

