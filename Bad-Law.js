(() => {
  // URL에서 opinion 파라미터 확인 (Y=찬성, N=반대)
  const urlParams = new URLSearchParams(location.search);
  const opinionParam = urlParams.get("opinion");
  const agree = opinionParam === "Y";
  const isValid = opinionParam === "Y" || opinionParam === "N";

  // 파라미터가 없으면 기본값으로 반대 설정
  // if (!isValid) {
  //   // return; // 일단 주석처리해서 강제로 실행
  // }

  function fillForm() {
    // 모든 입력란 찾기
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    const captcha = document.querySelector('#catpchaAnswer');
    
    if (sj) {
      const titleText = (isValid && agree) ? '찬성합니다' : '반대합니다';
      sj.value = titleText;
      // 이벤트 발생시키기
      sj.dispatchEvent(new Event('input', { bubbles: true }));
      sj.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (cn) {
      const contentText = (isValid && agree) ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
      cn.value = contentText;
      // 이벤트 발생시키기
      cn.dispatchEvent(new Event('input', { bubbles: true }));
      cn.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (captcha) {
      captcha.focus();
    } else {
      // 다른 캡차 입력란 찾기 시도
      const altCaptcha = document.querySelector('input[name="catpchaAnswer"]');
      if (altCaptcha) {
        altCaptcha.focus();
      }
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
    Object.assign(statusBtn.style, {
      padding: '10px 15px',
      background: agree ? '#2e7d32' : '#c62828',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      display: 'block',
      marginBottom: '8px'
    });

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 입력';
    Object.assign(retryBtn.style, {
      padding: '6px 12px',
      background: '#1976d2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    });
    retryBtn.onclick = () => {
      fillForm();
    };

    wrap.appendChild(statusBtn);
    wrap.appendChild(retryBtn);
    document.body.appendChild(wrap);
  }

  // 페이지 로딩 대기
  let attempts = 0;
  const waitAndFill = () => {
    attempts++;
    
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    
    if (sj && cn) {
      fillForm();
      createButtons();
    } else if (attempts < 20) {
      setTimeout(waitAndFill, 500);
    } else {
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
      const sj = document.querySelector('#txt_sj');
      if (sj && !sj.value) {
        fillForm();
      }
      if (!document.querySelector('#auto-input-buttons')) {
        createButtons();
      }
    }, 1000);
  });
})();
