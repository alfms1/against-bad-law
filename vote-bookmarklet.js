javascript:(function() {
  const currentDomain = window.location.hostname;
  console.log('🎯 범용 북마클릿 실행 - 도메인:', currentDomain);
  
  // VForKorea 사이트에서의 동작
  if (currentDomain === 'vforkorea.com') {
    console.log('📍 VForKorea 사이트 감지 - 의견 등록 시스템 실행');
    
    // 기존 패널 제거
    const existingPanel = document.querySelector('#vote-control-panel');
    if (existingPanel) existingPanel.remove();
    
    // 1. 오늘 마감된 행들 찾기
    const todayRows = [...document.querySelectorAll('tr[data-idx]')].filter(tr => {
      const redSpan = tr.querySelector('td span.red');
      const isToday = redSpan && redSpan.textContent.trim() === '오늘 마감';
      if (isToday) {
        console.log('오늘 마감 법안 발견:', tr.querySelector('.content .t')?.textContent);
      }
      return isToday;
    });

    console.log(`총 ${todayRows.length}개의 오늘 마감 법안을 찾았습니다.`);

    if (!todayRows.length) {
      alert('오늘 마감된 법안이 없습니다.');
      return;
    }

    // 2. 모바일 감지 개선
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isVerySmall = window.innerWidth <= 480;
    
    console.log('📱 디바이스 정보:', { 
      width: window.innerWidth, 
      isMobile, 
      isVerySmall, 
      userAgent: navigator.userAgent 
    });

    // 3. 컨트롤 패널 생성 (모바일 최적화 강화)
    const controlPanel = document.createElement('div');
    controlPanel.id = 'vote-control-panel';
    
    // 모바일에서 더 강력한 스타일링
    const panelStyles = {
      position: 'fixed',
      top: isMobile ? '5px' : '20px',
      right: isMobile ? '5px' : '20px',
      left: isMobile ? '5px' : 'auto',
      width: isMobile ? 'auto' : '350px',
      maxHeight: isMobile ? '90vh' : '80vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'white',
      border: '3px solid #333',
      borderRadius: '12px',
      padding: isMobile ? '12px' : '15px',
      zIndex: '999999', // z-index 더 높게
      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
      fontFamily: 'Arial, sans-serif, "Apple SD Gothic Neo", "Noto Sans KR"',
      fontSize: isMobile ? (isVerySmall ? '14px' : '16px') : '14px',
      lineHeight: '1.4',
      // 모바일에서 스크롤 차단 방지
      transform: 'translateZ(0)',
      // 터치 이벤트 최적화
      touchAction: 'manipulation'
    };
    
    Object.assign(controlPanel.style, panelStyles);
    
    // 모바일에서 body 스크롤 방지 (선택적)
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      // 패널이 제거될 때 스크롤 복원을 위한 함수
      controlPanel._restoreScroll = () => {
        document.body.style.overflow = '';
      };
    }

    // 4. 헤더 (모바일 최적화)
    const header = document.createElement('div');
    header.innerHTML = `
      <h3 style="margin: 0 0 12px 0; color: #333; font-size: ${isMobile ? '18px' : '16px'};">📝 오늘 마감 법안 (${todayRows.length}건)</h3>
      <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
        <button id="select-all-agree" style="flex: 1; min-width: ${isMobile ? '80px' : '70px'}; padding: ${isMobile ? '8px 6px' : '5px 10px'}; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">전체 찬성</button>
        <button id="select-all-disagree" style="flex: 1; min-width: ${isMobile ? '80px' : '70px'}; padding: ${isMobile ? '8px 6px' : '5px 10px'}; background: #c62828; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">전체 반대</button>
        <button id="clear-all" style="flex: ${isMobile ? '1' : '0'}; min-width: ${isMobile ? '60px' : '50px'}; padding: ${isMobile ? '8px 6px' : '5px 10px'}; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">${isMobile ? '초기화' : '초기화'}</button>
      </div>
    `;
    controlPanel.appendChild(header);

    // 5. 각 법안별 컨트롤 생성
    const billsList = document.createElement('div');
    const bills = [];

    todayRows.forEach((tr, index) => {
      const titleElement = tr.querySelector('.content .t');
      const voteLink = tr.querySelector('a[href*="forInsert.do"]');
      
      if (!titleElement || !voteLink) {
        console.warn('필요한 요소를 찾을 수 없습니다:', tr);
        return;
      }

      const title = titleElement.textContent.trim();
      const shortTitle = title.length > (isMobile ? 40 : 50) ? title.substring(0, isMobile ? 40 : 50) + '...' : title;

      const billItem = document.createElement('div');
      billItem.style.cssText = `
        margin-bottom: 10px;
        padding: ${isMobile ? '12px' : '10px'};
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f9f9f9;
      `;

      billItem.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; font-size: ${isMobile ? '14px' : '13px'}; line-height: 1.3; word-break: keep-all;">
          ${shortTitle}
        </div>
        <div style="display: flex; gap: ${isMobile ? '10px' : '8px'}; align-items: center; flex-wrap: wrap;">
          <button class="vote-btn agree" data-index="${index}" style="flex: 1; min-width: 60px; padding: ${isMobile ? '8px 12px' : '4px 12px'}; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">찬성</button>
          <button class="vote-btn disagree" data-index="${index}" style="flex: 1; min-width: 60px; padding: ${isMobile ? '8px 12px' : '4px 12px'}; background: #c62828; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">반대</button>
          <span class="vote-status" data-index="${index}" style="flex: 1; text-align: center; font-weight: bold; font-size: ${isMobile ? '13px' : '12px'}; min-width: 50px;">미선택</span>
        </div>
      `;

      billsList.appendChild(billItem);

      bills.push({
        title: title,
        link: voteLink.href,
        vote: null,
        element: billItem
      });
    });

    controlPanel.appendChild(billsList);

    // 6. 실행 버튼들 (모바일 최적화)
    const actionButtons = document.createElement('div');
    actionButtons.innerHTML = `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
        <button id="start-opinion-registration" style="width: 100%; padding: ${isMobile ? '15px' : '12px'}; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: ${isMobile ? '16px' : '14px'}; font-weight: bold; margin-bottom: 10px; touch-action: manipulation;">🚀 의견 등록 시작</button>
        <button id="close-panel" style="width: 100%; padding: ${isMobile ? '12px' : '8px'}; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: ${isMobile ? '14px' : '12px'}; touch-action: manipulation;">패널 닫기</button>
        <div style="margin-top: 10px; font-size: ${isMobile ? '12px' : '11px'}; color: #666; text-align: center; line-height: 1.3;">
          각 사이트에서 북마클릿을 다시 클릭하여 자동 입력하세요.
        </div>
      </div>
    `;
    controlPanel.appendChild(actionButtons);
    
    // 패널을 body에 추가하기 전에 확인
    document.body.appendChild(controlPanel);
    
    // 패널이 제대로 추가되었는지 확인
    console.log('📋 패널 추가 상태:', {
      panelExists: !!document.querySelector('#vote-control-panel'),
      panelVisible: controlPanel.offsetWidth > 0 && controlPanel.offsetHeight > 0,
      panelPosition: controlPanel.getBoundingClientRect()
    });

    // 마지막 선택 추적 변수
    let lastSelectedVote = null;

    // 7. 이벤트 리스너들 (터치 이벤트 개선)
    
    // 개별 투표 버튼 (터치 이벤트 추가)
    controlPanel.addEventListener('click', handleVoteClick);
    if (isMobile) {
      controlPanel.addEventListener('touchend', handleVoteClick);
    }
    
    function handleVoteClick(e) {
      e.preventDefault();
      if (e.target.classList.contains('vote-btn')) {
        const index = parseInt(e.target.dataset.index);
        const voteType = e.target.classList.contains('agree') ? 'agree' : 'disagree';
        
        bills[index].vote = voteType;
        lastSelectedVote = voteType;
        console.log('마지막 선택:', lastSelectedVote);
        
        const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
        statusSpan.textContent = voteType === 'agree' ? '찬성' : '반대';
        statusSpan.style.color = voteType === 'agree' ? '#2e7d32' : '#c62828';

        const billDiv = e.target.closest('div[style*="margin-bottom: 10px"]');
        const buttons = billDiv.querySelectorAll('.vote-btn');
        buttons.forEach(btn => {
          btn.style.opacity = btn === e.target ? '1' : '0.5';
          btn.style.transform = btn === e.target ? 'scale(1.05)' : 'scale(1)';
        });
        
        // 모바일에서 햅틱 피드백 (지원되는 경우)
        if (isMobile && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }

    // 전체 선택 버튼들
    document.getElementById('select-all-agree').onclick = () => {
      lastSelectedVote = 'agree';
      console.log('전체 찬성 선택, 마지막 선택:', lastSelectedVote);
      
      bills.forEach((bill, index) => {
        bill.vote = 'agree';
        const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
        statusSpan.textContent = '찬성';
        statusSpan.style.color = '#2e7d32';
        
        const billDiv = bill.element;
        const buttons = billDiv.querySelectorAll('.vote-btn');
        buttons.forEach(btn => {
          btn.style.opacity = btn.classList.contains('agree') ? '1' : '0.5';
          btn.style.transform = btn.classList.contains('agree') ? 'scale(1.05)' : 'scale(1)';
        });
      });
      
      if (isMobile && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    document.getElementById('select-all-disagree').onclick = () => {
      lastSelectedVote = 'disagree';
      console.log('전체 반대 선택, 마지막 선택:', lastSelectedVote);
      
      bills.forEach((bill, index) => {
        bill.vote = 'disagree';
        const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
        statusSpan.textContent = '반대';
        statusSpan.style.color = '#c62828';
        
        const billDiv = bill.element;
        const buttons = billDiv.querySelectorAll('.vote-btn');
        buttons.forEach(btn => {
          btn.style.opacity = btn.classList.contains('disagree') ? '1' : '0.5';
          btn.style.transform = btn.classList.contains('disagree') ? 'scale(1.05)' : 'scale(1)';
        });
      });
      
      if (isMobile && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    document.getElementById('clear-all').onclick = () => {
      lastSelectedVote = null;
      console.log('초기화, 마지막 선택:', lastSelectedVote);
      
      bills.forEach((bill, index) => {
        bill.vote = null;
        const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
        statusSpan.textContent = '미선택';
        statusSpan.style.color = '#666';
        
        const billDiv = bill.element;
        const buttons = billDiv.querySelectorAll('.vote-btn');
        buttons.forEach(btn => {
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1)';
        });
      });
      
      if (isMobile && navigator.vibrate) navigator.vibrate(100);
    };

    // 패널 닫기 (스크롤 복원 포함)
    document.getElementById('close-panel').onclick = () => {
      if (controlPanel._restoreScroll) {
        controlPanel._restoreScroll();
      }
      controlPanel.remove();
    };

    // 의견 등록 시작 (기존 로직 유지)
    document.getElementById('start-opinion-registration').onclick = () => {
      const selectedBills = bills.filter(bill => bill.vote !== null);
      
      if (!selectedBills.length) {
        alert('선택된 법안이 없습니다.');
        return;
      }

      // 찬성과 반대 법안 분리
      const agreeBills = selectedBills.filter(bill => bill.vote === 'agree');
      const disagreeBills = selectedBills.filter(bill => bill.vote === 'disagree');
      
      // 주요 선택에 따라 기본값 결정
      const isMainlyAgree = agreeBills.length >= disagreeBills.length;
      const defaultTitle = isMainlyAgree ? '이 법안에 찬성합니다' : '이 법안을 반대합니다';
      const defaultContent = isMainlyAgree ? 
        '국민의 의견을 충분히 수렴한 좋은 입법이라고 생각합니다.' : 
        '국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다.';

      // 입력 모달 생성 (모바일 최적화)
      const modalOverlay = document.createElement('div');
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: ${isMobile ? '10px' : '20px'};
        box-sizing: border-box;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        padding: ${isMobile ? '20px' : '30px'};
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        max-width: ${isMobile ? '100%' : '500px'};
        width: ${isMobile ? '100%' : '90%'};
        font-family: Arial, sans-serif;
        max-height: 90vh;
        overflow-y: auto;
        transform: translateZ(0);
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #333; text-align: center; font-size: ${isMobile ? '20px' : '18px'};">📝 의견 입력</h3>
        ${agreeBills.length > 0 && disagreeBills.length > 0 ? 
          `<div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: ${isMobile ? '15px' : '14px'};">
            ℹ️ 찬성 ${agreeBills.length}개, 반대 ${disagreeBills.length}개 법안이 선택되었습니다.
          </div>` : ''
        }
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555; font-size: ${isMobile ? '16px' : '14px'};">제목:</label>
          <input type="text" id="modal-title" placeholder="예: 이 법안을 반대합니다" 
                 style="width: 100%; padding: ${isMobile ? '12px' : '10px'}; border: 2px solid #ddd; border-radius: 8px; font-size: ${isMobile ? '16px' : '14px'}; box-sizing: border-box;"
                 value="${defaultTitle}">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #555; font-size: ${isMobile ? '16px' : '14px'};">내용:</label>
          <textarea id="modal-content" placeholder="예: 국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다"
                    style="width: 100%; height: ${isMobile ? '120px' : '100px'}; padding: ${isMobile ? '12px' : '10px'}; border: 2px solid #ddd; border-radius: 8px; font-size: ${isMobile ? '16px' : '14px'}; resize: vertical; box-sizing: border-box;">${defaultContent}</textarea>
        </div>
        <div style="display: flex; gap: 10px; ${isMobile ? 'flex-direction: column' : ''};">
          <button id="modal-ok" style="flex: 1; background: #4caf50; color: white; border: none; padding: ${isMobile ? '15px' : '12px 24px'}; border-radius: 8px; cursor: pointer; font-size: ${isMobile ? '16px' : '14px'}; font-weight: bold; touch-action: manipulation;">확인 (${selectedBills.length}개 법안)</button>
          <button id="modal-cancel" style="flex: ${isMobile ? '1' : '0'}; background: #f44336; color: white; border: none; padding: ${isMobile ? '15px' : '12px 24px'}; border-radius: 8px; cursor: pointer; font-size: ${isMobile ? '16px' : '14px'}; font-weight: bold; touch-action: manipulation;">취소</button>
        </div>
      `;

      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);

      // 확인 버튼 (기존 로직 유지)
      document.getElementById('modal-ok').onclick = () => {
        const titleInput = document.getElementById('modal-title').value.trim();
        const contentInput = document.getElementById('modal-content').value.trim();
        
        if (!titleInput || !contentInput) {
          alert('제목과 내용을 모두 입력해주세요.');
          return;
        }
        
        modalOverlay.remove();
        
        // 찬성 법안들 처리
        if (agreeBills.length > 0) {
          const agreeTitle = '이 법안에 찬성합니다';
          const agreeContent = '국민의 의견을 충분히 수렴한 좋은 입법이라고 생각합니다.';
          
          localStorage.setItem('autoFillData_agree', JSON.stringify({
            title: agreeTitle,
            content: agreeContent,
            timestamp: Date.now()
          }));
          
          agreeBills.forEach((bill) => {
            const url = new URL(bill.link);
            url.searchParams.set('autoTitle', encodeURIComponent(agreeTitle));
            url.searchParams.set('autoContent', encodeURIComponent(agreeContent));
            url.searchParams.set('voteType', 'agree');
            
            const link = document.createElement('a');
            link.href = url.toString();
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }
        
        // 반대 법안들 처리
        if (disagreeBills.length > 0) {
          localStorage.setItem('autoFillData_disagree', JSON.stringify({
            title: titleInput,
            content: contentInput,
            timestamp: Date.now()
          }));
          
          disagreeBills.forEach((bill) => {
            const url = new URL(bill.link);
            url.searchParams.set('autoTitle', encodeURIComponent(titleInput));
            url.searchParams.set('autoContent', encodeURIComponent(contentInput));
            url.searchParams.set('voteType', 'disagree');
            
            const link = document.createElement('a');
            link.href = url.toString();
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }
        
        alert(`법안 처리 완료!\n찬성: ${agreeBills.length}개\n반대: ${disagreeBills.length}개\n\n각 창에서 북마클릿을 클릭하세요!`);
      };

      // 취소 버튼
      document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();
    };

    console.log('✅ VForKorea 의견 등록 시스템 준비 완료 (모바일 최적화)');
    
    // 성공 알림 (모바일용)
    if (isMobile) {
      const successNotification = document.createElement('div');
      successNotification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px;
        border-radius: 8px;
        z-index: 999998;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
      `;
      successNotification.textContent = '📱 모바일 최적화 패널이 로드되었습니다!';
      document.body.appendChild(successNotification);
      
      setTimeout(() => {
        successNotification.remove();
      }, 3000);
    }
  }
  
  // 국회 의견 등록 사이트에서의 동작 (기존 로직 유지)
  else if (currentDomain === 'pal.assembly.go.kr') {
    console.log('📍 국회 의견 등록 사이트 감지 - 자동 입력 실행');
    
    // LocalStorage에서 데이터 읽기
    const storedData = localStorage.getItem('autoFillData');
    const storedAgreeData = localStorage.getItem('autoFillData_agree');
    const storedDisagreeData = localStorage.getItem('autoFillData_disagree');
    
    let autoTitle = '';
    let autoContent = '';
    
    // URL 파라미터에서 voteType 확인
    const urlParams = new URLSearchParams(location.search);
    const voteType = urlParams.get('voteType');
    
    console.log('🔍 감지된 투표 타입:', voteType);
    
    // voteType에 따라 적절한 데이터 로드
    if (voteType === 'agree' && storedAgreeData) {
      const data = JSON.parse(storedAgreeData);
      autoTitle = data.title || '';
      autoContent = data.content || '';
      console.log('📦 찬성 데이터 로드:', { autoTitle, autoContent });
    } else if (voteType === 'disagree' && storedDisagreeData) {
      const data = JSON.parse(storedDisagreeData);
      autoTitle = data.title || '';
      autoContent = data.content || '';
      console.log('📦 반대 데이터 로드:', { autoTitle, autoContent });
    } else if (storedData) {
      const data = JSON.parse(storedData);
      autoTitle = data.title || '';
      autoContent = data.content || '';
      console.log('📦 기존 데이터 로드:', { autoTitle, autoContent });
    }
    
    // URL 파라미터에서도 읽기 (최종 백업)
    if (!autoTitle || !autoContent) {
      autoTitle = autoTitle || decodeURIComponent(urlParams.get('autoTitle') || '');
      autoContent = autoContent || decodeURIComponent(urlParams.get('autoContent') || '');
      console.log('🔗 URL 파라미터에서 데이터 로드:', { autoTitle, autoContent });
    }
    
    if (!autoTitle && !autoContent) {
      alert('자동 입력할 데이터가 없습니다.\nVForKorea에서 먼저 의견을 설정해주세요.');
      return;
    }
    
    // 자동 입력 실행
    function executeAutoFill() {
      const titleField = document.querySelector('#txt_sj');
      const contentField = document.querySelector('#txt_cn');
      const captchaField = document.querySelector('#catpchaAnswer');
      
      console.log('📋 필드 확인:', {
        titleField: !!titleField,
        contentField: !!contentField,
        captchaField: !!captchaField
      });
      
      if (titleField && autoTitle) {
        titleField.value = autoTitle;
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('keyup', { bubbles: true }));
        console.log('✅ 제목 입력 완료');
      }
      
      if (contentField && autoContent) {
        contentField.value = autoContent;
        contentField.dispatchEvent(new Event('input', { bubbles: true }));
        contentField.dispatchEvent(new Event('keyup', { bubbles: true }));
        console.log('✅ 내용 입력 완료');
      }
      
      // 모바일 감지
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (captchaField) {
        captchaField.focus();
        captchaField.style.border = '3px solid #ff4444';
        captchaField.style.background = '#fffacd';
        
        // 캡차 자동 제출 설정 (중복 방지)
        if (!captchaField._autoSubmitSet) {
          captchaField.addEventListener('input', function() {
            const value = this.value;
            if (/^\d+$/.test(value) && value.length === 5) {
              console.log('🚀 캡차 완료, 자동 제출');
              setTimeout(() => {
                try {
                  trimAllInputText();
                  if (!validate()) return;
                  $('.loading_bar').show();
                  checkWebFilter($('#frm'));
                  
                  // 제출 후 창 닫기
                  setTimeout(() => {
                    console.log('🚪 창 닫기 시도');
                    window.close();
                  }, 2000);
                  
                } catch (e) {
                  console.warn('자동 제출 실패, 수동 버튼 클릭');
                  document.getElementById('btn_opnReg').click();
                  
                  // 수동 클릭 후에도 창 닫기
                  setTimeout(() => {
                    window.close();
                  }, 2000);
                }
              }, 500);
            }
          });
          captchaField._autoSubmitSet = true;
        }
      }
      
      // 성공 알림 (모바일 최적화)
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: ${isMobile ? '10px' : '20px'};
        right: ${isMobile ? '10px' : '20px'};
        left: ${isMobile ? '10px' : 'auto'};
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: ${isMobile ? '15px' : '20px'};
        border-radius: 12px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        max-width: ${isMobile ? 'auto' : '300px'};
        font-size: ${isMobile ? '14px' : '13px'};
      `;
      
      notification.innerHTML = `
        <div style="font-size: ${isMobile ? '18px' : '16px'}; font-weight: bold; margin-bottom: 10px;">
          🎯 자동 입력 완료!
        </div>
        <div style="opacity: 0.9; line-height: 1.4;">
          <div><strong>제목:</strong> ${autoTitle.substring(0, isMobile ? 15 : 20)}...</div>
          <div style="margin-top: 5px;"><strong>내용:</strong> ${autoContent.substring(0, isMobile ? 20 : 30)}...</div>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: ${isMobile ? '13px' : '12px'};">
          ⚡ <strong>캡차 5자리를 입력하면 자동 제출 후 창이 닫힙니다!</strong>
        </div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; cursor: pointer; font-size: ${isMobile ? '20px' : '16px'}; touch-action: manipulation;">✕</button>
      `;
      
      document.body.appendChild(notification);
    }
    
    // 페이지 로딩 완료 후 실행
    if (document.readyState === 'complete') {
      executeAutoFill();
    } else {
      window.addEventListener('load', executeAutoFill);
      setTimeout(executeAutoFill, 2000);
    }
    
    console.log('✅ 국회 사이트 자동 입력 준비 완료 (모바일 최적화)');
  }
  
  // 기타 사이트
  else {
    console.log('❓ 지원하지 않는 사이트:', currentDomain);
    
    // 모바일 친화적인 알림
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일에서는 더 상세한 안내
      const alertDiv = document.createElement('div');
      alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 3px solid #ff6b6b;
        border-radius: 12px;
        padding: 20px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 90%;
        text-align: center;
      `;
      
      alertDiv.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #ff6b6b; font-size: 18px;">⚠️ 지원하지 않는 사이트</h3>
        <p style="margin: 0 0 15px 0; color: #333; line-height: 1.4; font-size: 14px;">
          이 북마클릿은 다음 사이트에서만 작동합니다:<br>
          • <strong>VForKorea.com</strong> (법안 선택)<br>
          • <strong>pal.assembly.go.kr</strong> (의견 입력)
        </p>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 13px;">
          현재 사이트: <strong>${currentDomain}</strong>
        </p>
        <button onclick="this.parentElement.remove()" style="background: #4CAF50; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; touch-action: manipulation;">확인</button>
      `;
      
      document.body.appendChild(alertDiv);
    } else {
      alert('이 북마클릿은 VForKorea와 국회 의견 등록 사이트에서만 작동합니다.\n\n현재 사이트: ' + currentDomain);
    }
  }
})();
