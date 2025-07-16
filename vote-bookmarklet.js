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
          각 사이트에서 북마클릿을 다시 클릭하여 자동 입력하세요.
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

    // 의견 등록 시작
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
      `;

      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);

      // 확인 버튼
      document.getElementById('modal-ok').onclick = () => {
        const titleInput = document.getElementById('modal-title').value.trim();
        const contentInput = document.getElementById('modal-content').value.trim();
        
        if (!titleInput || !contentInput) {
          alert('제목과 내용을 모두 입력해주세요.');
          return;
        }
        
        modalOverlay.remove();
        
        // LocalStorage에 데이터 저장
        localStorage.setItem('autoFillData', JSON.stringify({
          title: titleInput,
          content: contentInput,
          timestamp: Date.now()
        }));
        
        // 각 법안의 링크를 순차적으로 열기
        selectedBills.forEach((bill, index) => {
          setTimeout(() => {
            console.log(`${index + 1}번째 법안 열기:`, bill.title);
            window.open(bill.link, `opinion_${index}`, 'width=1200,height=800');
          }, index * 1000); // 1초 간격으로 열기
        });
        
        alert(`${selectedBills.length}개의 창이 열립니다.\n각 창에서 북마클릿을 다시 클릭하여 자동 입력하세요!`);
      };

      // 취소 버튼
      document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();
    };

    console.log('✅ VForKorea 의견 등록 시스템 준비 완료');
  }
  
  // 국회 의견 등록 사이트에서의 동작
  else if (currentDomain === 'pal.assembly.go.kr') {
    console.log('📍 국회 의견 등록 사이트 감지 - 자동 입력 실행');
    
    // LocalStorage에서 데이터 읽기
    const storedData = localStorage.getItem('autoFillData');
    let autoTitle = '';
    let autoContent = '';
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        autoTitle = data.title || '';
        autoContent = data.content || '';
        console.log('📦 저장된 데이터 로드:', { autoTitle, autoContent });
      } catch (e) {
        console.warn('저장된 데이터 파싱 실패:', e);
      }
    }
    
    // URL 파라미터에서도 읽기 (백업)
    if (!autoTitle || !autoContent) {
      const urlParams = new URLSearchParams(location.search);
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
                } catch (e) {
                  console.warn('자동 제출 실패, 수동 버튼 클릭');
                  document.getElementById('btn_opnReg').click();
                }
              }, 500);
            }
          });
          captchaField._autoSubmitSet = true;
        }
      }
      
      // 성공 알림
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 12px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        max-width: 300px;
      `;
      
      notification.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          🎯 자동 입력 완료!
        </div>
        <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
          <div><strong>제목:</strong> ${autoTitle.substring(0, 20)}...</div>
          <div style="margin-top: 5px;"><strong>내용:</strong> ${autoContent.substring(0, 30)}...</div>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 12px;">
          ⚡ <strong>캡차 5자리를 입력하면 자동으로 제출됩니다!</strong>
        </div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; cursor: pointer; font-size: 16px;">✕</button>
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
    
    console.log('✅ 국회 사이트 자동 입력 준비 완료');
  }
  
  // 기타 사이트
  else {
    console.log('❓ 지원하지 않는 사이트:', currentDomain);
    alert('이 북마클릿은 VForKorea와 국회 의견 등록 사이트에서만 작동합니다.');
  }
})();
