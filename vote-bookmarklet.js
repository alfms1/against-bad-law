(() => {
  console.log('Bad-Law.js 스크립트 시작...');
  
  // URL에서 opinion 파라미터 확인 (Y=찬성, N=반대)
  const opinionParam = new URLSearchParams(location.search).get("opinion");
  const agree = opinionParam === "Y";
  const isValid = opinionParam === "Y" || opinionParam === "N";
  
  console.log('URL 파라미터 opinion:', opinionParam, '찬성여부:', agree, '유효성:', isValid);
  
  if (!isValid) {
    console.log('유효하지 않은 opinion 파라미터 - 기본 스크립트 종료');
    return;
  }

  function fillForm() {
    console.log('폼 자동 입력 시작...');
    
    // 제목 입력
    const sj = document.querySelector('#txt_sj');
    if (sj) {
      sj.value = agree ? '찬성합니다' : '반대합니다';
      console.log('제목 입력 완료:', sj.value);
    } else {
      console.log('제목 입력란을 찾을 수 없습니다 (#txt_sj)');
    }
    
    // 내용 입력
    const cn = document.querySelector('#txt_cn');
    if (cn) {
      cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
      console.log('내용 입력 완료:', cn.value);
    } else {
      console.log('내용 입력란을 찾을 수 없습니다 (#txt_cn)');
    }
    
    // 캡차 입력란에 포커스
    const input = document.querySelector('#catpchaAnswer');
    if (input) {
      input.focus();
      console.log('캡차 입력란에 포커스 설정');
    } else {
      console.log('캡차 입력란을 찾을 수 없습니다 (#catpchaAnswer)');
      
      // 다른 가능한 캡차 입력란 찾기
      const altInputs = document.querySelectorAll('input[type="text"]');
      console.log('찾은 텍스트 입력란들:', altInputs.length);
      altInputs.forEach((inp, idx) => {
        console.log(`입력란 ${idx}:`, inp.id, inp.name, inp.placeholder);
      });
    }
  }

  function createButtons() {
    // 기존 버튼이 있으면 제거
    const existing = document.querySelector('#vote-assistant-buttons');
    if (existing) existing.remove();
    
    const wrap = document.createElement('div');
    wrap.id = 'vote-assistant-buttons';
    Object.assign(wrap.style, {
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
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
      font-size: 14px;
    `;

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 입력';
    retryBtn.style.cssText = `
      padding: 8px 12px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    retryBtn.onclick = () => {
      fillForm();
      console.log('수동으로 다시 입력 실행');
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖ 닫기';
    closeBtn.style.cssText = `
      padding: 8px 12px;
      background: #666;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    closeBtn.onclick = () => wrap.remove();

    wrap.appendChild(statusBtn);
    wrap.appendChild(retryBtn);
    wrap.appendChild(closeBtn);
    document.body.appendChild(wrap);
    
    console.log('버튼 생성 완료');
  }

  function waitAndFill() {
    console.log('페이지 로딩 대기 중...');
    
    let attempts = 0;
    const maxAttempts = 20; // 최대 10초 대기
    
    const checkAndFill = () => {
      attempts++;
      console.log(`시도 ${attempts}/${maxAttempts}`);
      
      const sj = document.querySelector('#txt_sj');
      const cn = document.querySelector('#txt_cn');
      
      if (sj && cn) {
        console.log('입력란 발견! 자동 입력 시작');
        fillForm();
        createButtons();
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkAndFill, 500);
      } else {
        console.log('최대 시도 횟수 초과. 수동으로 입력해주세요.');
        createButtons(); // 버튼은 생성
      }
    };
    
    checkAndFill();
  }

  // 페이지 상태에 따라 다른 방식으로 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndFill);
  } else {
    waitAndFill();
  }

  // 추가 안전장치: window.onload 이벤트
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('window.onload 이벤트에서 재시도');
      const sj = document.querySelector('#txt_sj');
      if (sj && !sj.value) {
        fillForm();
      }
      if (!document.querySelector('#vote-assistant-buttons')) {
        createButtons();
      }
    }, 1000);
  });

  console.log('Bad-Law.js 초기화 완료');
})();
