(() => {
  console.log('Bad-Law.js 시작');
  
  // opinion 파라미터 확인 (Y=찬성, N=반대)
  const opinionParam = new URLSearchParams(location.search).get("opinion");
  const agree = opinionParam === "Y";
  const isValid = opinionParam === "Y" || opinionParam === "N";
  
  console.log('opinion 파라미터:', opinionParam, '찬성여부:', agree, '유효성:', isValid);
  
  if (!isValid) {
    console.log('유효하지 않은 파라미터');
    return;
  }

  function fillForm() {
    console.log('폼 자동 입력 시작');
    
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    const input = document.querySelector('#catpchaAnswer');
    
    if (sj) {
      sj.value = agree ? '찬성합니다' : '반대합니다';
      console.log('제목 입력 완료:', sj.value);
    } else {
      console.log('제목 입력란 없음');
    }
    
    if (cn) {
      cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
      console.log('내용 입력 완료:', cn.value);
    } else {
      console.log('내용 입력란 없음');
    }
    
    if (input) {
      input.focus();
      console.log('캡차 포커스 완료');
    } else {
      console.log('캡차 입력란 없음');
    }
  }

  function createButtons() {
    // 기존 버튼 제거
    const existing = document.querySelector('#auto-input-buttons');
    if (existing) existing.remove();
    
    const wrap = document.createElement('div');
    wrap.id = 'auto-input-buttons';
    Object.assign(wrap.style, {
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: '9999',
      background: 'white',
      padding: '15px',
      border: '2px solid #333',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });

    const statusBtn = document.createElement('button');
    statusBtn.textContent = agree ? '✅ 찬성 자동입력됨' : '❌ 반대 자동입력됨';
    statusBtn.style.cssText = `
      padding: 10px 15px;
      background: ${agree ? '#2e7d32' : '#c62828'};
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      display: block;
      margin-bottom: 8px;
    `;

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 입력';
    retryBtn.style.cssText = `
      padding: 6px 12px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    retryBtn.onclick = () => {
      fillForm();
      console.log('수동 재입력 실행');
    };

    wrap.appendChild(statusBtn);
    wrap.appendChild(retryBtn);
    document.body.appendChild(wrap);
    
    console.log('버튼 생성 완료');
  }

  // 페이지 로딩 대기
  let attempts = 0;
  const waitAndFill = () => {
    attempts++;
    console.log(`자동 입력 시도 ${attempts}/20`);
    
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    
    if (sj && cn) {
      console.log('입력란 발견! 자동 입력 실행');
      fillForm();
      createButtons();
    } else if (attempts < 20) {
      setTimeout(waitAndFill, 500);
    } else {
      console.log('입력란을 찾지 못했습니다');
      createButtons(); // 버튼은 생성
    }
  };

  // 페이지 상태에 따른 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndFill);
  } else {
    waitAndFill();
  }

  // 추가 안전장치
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('window.load에서 재시도');
      const sj = document.querySelector('#txt_sj');
      if (sj && !sj.value) {
        fillForm();
      }
      if (!document.querySelector('#auto-input-buttons')) {
        createButtons();
      }
    }, 1000);
  });

  console.log('Bad-Law.js 초기화 완료');
})();
