(() => {
  console.log('🎯 새로운 의견 등록 스크립트 시작...');
  
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

  // 2. 컨트롤 패널 생성
  const controlPanel = document.createElement('div');
  controlPanel.id = 'vote-control-panel';
  Object.assign(controlPanel.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '350px',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'white',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '15px',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px'
  });

  // 3. 헤더
  const header = document.createElement('div');
  header.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #333;">📝 오늘 마감 법안 (${todayRows.length}건)</h3>
    <div style="margin-bottom: 15px;">
      <button id="select-all-agree" style="padding: 5px 10px; margin-right: 5px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">전체 찬성</button>
      <button id="select-all-disagree" style="padding: 5px 10px; margin-right: 5px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">전체 반대</button>
      <button id="clear-all" style="padding: 5px 10px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">초기화</button>
    </div>
  `;
  controlPanel.appendChild(header);

  // 4. 각 법안별 컨트롤 생성
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
    const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

    const billItem = document.createElement('div');
    billItem.style.cssText = `
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #f9f9f9;
    `;

    billItem.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px; line-height: 1.3;">
        ${shortTitle}
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="vote-btn agree" data-index="${index}" style="padding: 4px 12px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">찬성</button>
        <button class="vote-btn disagree" data-index="${index}" style="padding: 4px 12px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">반대</button>
        <span class="vote-status" data-index="${index}" style="margin-left: 8px; font-weight: bold; font-size: 12px;">미선택</span>
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

  // 5. 실행 버튼들
  const actionButtons = document.createElement('div');
  actionButtons.innerHTML = `
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
      <button id="start-opinion-registration" style="width: 100%; padding: 12px; background: #1976d2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 8px;">🚀 의견 등록 시작</button>
      <button id="close-panel" style="width: 100%; padding: 8px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">패널 닫기</button>
      <div style="margin-top: 8px; font-size: 11px; color: #666; text-align: center;">
        새 창에서 Ctrl+V로 자동 입력 후 캡차만 입력하세요.
      </div>
    </div>
  `;
  controlPanel.appendChild(actionButtons);

  document.body.appendChild(controlPanel);

  // 6. 이벤트 리스너들
  
  // 개별 투표 버튼
  controlPanel.addEventListener('click', (e) => {
    if (e.target.classList.contains('vote-btn')) {
      const index = parseInt(e.target.dataset.index);
      const voteType = e.target.classList.contains('agree') ? 'agree' : 'disagree';
      
      bills[index].vote = voteType;
      
      const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
      statusSpan.textContent = voteType === 'agree' ? '찬성' : '반대';
      statusSpan.style.color = voteType === 'agree' ? '#2e7d32' : '#c62828';

      const billDiv = e.target.closest('div[style*="margin-bottom: 12px"]');
      const buttons = billDiv.querySelectorAll('.vote-btn');
      buttons.forEach(btn => {
        btn.style.opacity = btn === e.target ? '1' : '0.5';
      });
    }
  });

  // 전체 선택 버튼들
  document.getElementById('select-all-agree').onclick = () => {
    bills.forEach((bill, index) => {
      bill.vote = 'agree';
      const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
      statusSpan.textContent = '찬성';
      statusSpan.style.color = '#2e7d32';
      
      const billDiv = bill.element;
      const buttons = billDiv.querySelectorAll('.vote-btn');
      buttons.forEach(btn => {
        btn.style.opacity = btn.classList.contains('agree') ? '1' : '0.5';
      });
    });
  };

  document.getElementById('select-all-disagree').onclick = () => {
    bills.forEach((bill, index) => {
      bill.vote = 'disagree';
      const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
      statusSpan.textContent = '반대';
      statusSpan.style.color = '#c62828';
      
      const billDiv = bill.element;
      const buttons = billDiv.querySelectorAll('.vote-btn');
      buttons.forEach(btn => {
        btn.style.opacity = btn.classList.contains('disagree') ? '1' : '0.5';
      });
    });
  };

  document.getElementById('clear-all').onclick = () => {
    bills.forEach((bill, index) => {
      bill.vote = null;
      const statusSpan = controlPanel.querySelector(`span[data-index="${index}"]`);
      statusSpan.textContent = '미선택';
      statusSpan.style.color = '#666';
      
      const billDiv = bill.element;
      const buttons = billDiv.querySelectorAll('.vote-btn');
      buttons.forEach(btn => {
        btn.style.opacity = '1';
      });
    });
  };

  // 패널 닫기
  document.getElementById('close-panel').onclick = () => {
    controlPanel.remove();
  };

  // 7. 🚀 새로운 의견 등록 시스템
  document.getElementById('start-opinion-registration').onclick = () => {
    const selectedBills = bills.filter(bill => bill.vote !== null);
    
    if (!selectedBills.length) {
      alert('선택된 법안이 없습니다.');
      return;
    }

    // 입력 모달 생성
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 20000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 90%;
      font-family: Arial, sans-serif;
    `;

    modal.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">📝 의견 입력</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">제목:</label>
        <input type="text" id="modal-title" placeholder="예: 이 법안을 반대합니다" 
               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;"
               value="이 법안을 반대합니다">
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">내용:</label>
        <textarea id="modal-content" placeholder="예: 국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다"
                  style="width: 100%; height: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;">국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다.</textarea>
      </div>
      <div style="text-align: center;">
        <button id="modal-ok" style="background: #4caf50; color: white; border: none; padding: 12px 24px; border-radius: 6px; margin-right: 10px; cursor: pointer; font-size: 14px; font-weight: bold;">확인 (${selectedBills.length}개 법안)</button>
        <button id="modal-cancel" style="background: #f44336; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">취소</button>
      </div>
      <div style="margin-top: 15px; padding: 10px; background: #f0f8ff; border-radius: 6px; font-size: 12px; color: #666;">
        💡 모든 선택된 법안에 동일한 제목과 내용으로 의견이 등록됩니다.
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    setTimeout(() => document.getElementById('modal-title').focus(), 100);

    // 확인 버튼
    document.getElementById('modal-ok').onclick = () => {
      const titleInput = document.getElementById('modal-title').value.trim();
      const contentInput = document.getElementById('modal-content').value.trim();
      
      if (!titleInput) {
        alert('제목을 입력해주세요.');
        document.getElementById('modal-title').focus();
        return;
      }
      
      if (!contentInput) {
        alert('내용을 입력해주세요.');
        document.getElementById('modal-content').focus();
        return;
      }
      
      modalOverlay.remove();
      startOpinionProcess(selectedBills, titleInput, contentInput);
    };

    // 취소 버튼
    document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();

    // ESC로 닫기
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        modalOverlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    });
  };

  // 8. 🎯 실제 의견 등록 프로세스
  function startOpinionProcess(selectedBills, titleInput, contentInput) {
    let currentIndex = 0;
    
    // 🔧 수정된 북마클릿 코드 (이중 인코딩 문제 해결)
    const bookmarkletCode = `javascript:(function(){
      console.log('🎯 자동 의견 입력 시작');
      
      const urlParams = new URLSearchParams(location.search);
      let autoTitle = urlParams.get('autoTitle') || '';
      let autoContent = urlParams.get('autoContent') || '';
      
      // 이중 인코딩 문제 해결
      try {
        autoTitle = decodeURIComponent(autoTitle);
      } catch(e) {
        console.log('제목 디코딩 오류:', e);
      }
      
      try {
        autoContent = decodeURIComponent(autoContent);
      } catch(e) {
        console.log('내용 디코딩 오류:', e);
      }
      
      console.log('제목:', autoTitle);
      console.log('내용:', autoContent);
      
      function fillForm() {
        const titleField = document.querySelector('#txt_sj');
        const contentField = document.querySelector('#txt_cn');
        const captchaField = document.querySelector('#catpchaAnswer');
        
        if (titleField && autoTitle) {
          titleField.value = autoTitle;
          titleField.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ 제목 입력 완료');
        }
        
        if (contentField && autoContent) {
          contentField.value = autoContent;
          contentField.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('✅ 내용 입력 완료');
        }
        
        if (captchaField) {
          captchaField.focus();
          captchaField.style.border = '3px solid #ff4444';
          console.log('✅ 캡차 포커스');
        }
        
        const notification = document.createElement('div');
        notification.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          z-index: 10000;
          font-family: Arial, sans-serif;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          min-width: 300px;
        \`;
        
        notification.innerHTML = \`
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
            🎯 자동 입력 완료!
          </div>
          <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
            <div><strong>제목:</strong> \${autoTitle}</div>
            <div style="margin-top: 5px;"><strong>내용:</strong> \${autoContent.substring(0, 50)}\${autoContent.length > 50 ? '...' : ''}</div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 12px;">
            ⚡ <strong>캡차를 입력</strong>하고 <strong>등록 버튼</strong>을 누르세요!
          </div>
          <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 8px; border-radius: 50%; cursor: pointer; font-size: 12px;">✕</button>
        \`;
        
        document.body.appendChild(notification);
      }
      
      let attempts = 0;
      const tryFill = () => {
        attempts++;
        const titleField = document.querySelector('#txt_sj');
        const contentField = document.querySelector('#txt_cn');
        
        if (titleField && contentField && autoTitle && autoContent) {
          fillForm();
        } else if (attempts < 30) {
          setTimeout(tryFill, 300);
        }
      };
      
      tryFill();
    })();`;

    // 클립보드에 복사
    navigator.clipboard.writeText(bookmarkletCode).catch(() => {
      console.log('클립보드 복사 실패');
    });

    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #333;
      padding: 20px;
      border-radius: 8px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      min-width: 350px;
    `;
    
    const updateStatus = () => {
      statusDiv.innerHTML = `
        <h4>📝 의견 등록 진행 중...</h4>
        <p><strong>진행률:</strong> ${currentIndex}/${selectedBills.length}</p>
        <p><strong>현재:</strong> ${selectedBills[currentIndex]?.title.substring(0, 40)}...</p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 12px;">
          💡 새 창에서 <strong>주소창을 클릭</strong>하고 <strong>Ctrl+V</strong> 후 <strong>Enter</strong>를 누르세요!
        </div>
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">중단</button>
      `;
    };

    const openNext = () => {
      if (currentIndex >= selectedBills.length) {
        statusDiv.innerHTML = `
          <h4>✅ 모든 의견 등록이 완료되었습니다!</h4>
          <p>총 <strong>${selectedBills.length}개</strong> 법안에 의견을 등록했습니다.</p>
          <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 12px;">
            <div><strong>제목:</strong> ${titleInput}</div>
            <div style="margin-top: 5px;"><strong>내용:</strong> ${contentInput}</div>
          </div>
          <button onclick="this.parentElement.remove()" style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px;">확인</button>
        `;
        return;
      }

      updateStatus();
      
      const bill = selectedBills[currentIndex];
      
      // 🔧 수정된 URL 생성 (이중 인코딩 문제 해결)
      const baseUrl = bill.link;
      const url = new URL(baseUrl);
      url.searchParams.set('autoTitle', titleInput);
      url.searchParams.set('autoContent', contentInput);
      const fullUrl = url.toString();
      
      console.log(`${currentIndex + 1}번째 의견 등록:`, bill.title);
      console.log('새로운 URL:', fullUrl);
      
      const win = window.open(fullUrl, `opinion_${currentIndex}`, 'width=1200,height=800');
      
      // 🔧 수정된 창 닫힘 감지 (confirm 팝업 제거)
      const checkClosed = setInterval(() => {
        if (win.closed) {
          clearInterval(checkClosed);
          currentIndex++;
          setTimeout(openNext, 1000);
        }
      }, 500);
    };

    document.body.appendChild(statusDiv);
    openNext();
  }

  console.log('🎯 새로운 스크립트 설정 완료!');
})();
