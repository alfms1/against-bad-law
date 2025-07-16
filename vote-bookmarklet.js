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

    // 2. 컨트롤 패널 생성 (모바일 최적화)
    const controlPanel = document.createElement('div');
    controlPanel.id = 'vote-control-panel';
    const isMobile = window.innerWidth <= 768;
    Object.assign(controlPanel.style, {
      position: 'fixed',
      top: isMobile ? '10px' : '20px',
      right: isMobile ? '10px' : '20px',
      left: isMobile ? '10px' : 'auto',
      width: isMobile ? 'auto' : '350px',
      maxHeight: '80vh',
      overflowY: 'auto',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      zIndex: '10000',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? '16px' : '14px'
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
          ✨ 캡차 5자리 입력시 성공하면 자동으로 탭이 닫힙니다!
        </div>
      </div>
    `;
    controlPanel.appendChild(actionButtons);
    document.body.appendChild(controlPanel);

    // 마지막 선택 추적 변수
    let lastSelectedVote = null;

    // 6. 이벤트 리스너들
    
    // 개별 투표 버튼
    controlPanel.addEventListener('click', (e) => {
      if (e.target.classList.contains('vote-btn')) {
        const index = parseInt(e.target.dataset.index);
        const voteType = e.target.classList.contains('agree') ? 'agree' : 'disagree';
        
        bills[index].vote = voteType;
        lastSelectedVote = voteType;
        
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

      // 찬성과 반대 법안 분리
      const agreeBills = selectedBills.filter(bill => bill.vote === 'agree');
      const disagreeBills = selectedBills.filter(bill => bill.vote === 'disagree');
      
      // 주요 선택에 따라 기본값 결정
      const isMainlyAgree = agreeBills.length >= disagreeBills.length;
      const defaultTitle = isMainlyAgree ? '이 법안에 찬성합니다' : '이 법안을 반대합니다';
      const defaultContent = isMainlyAgree ? 
        '국민의 의견을 충분히 수렴한 좋은 입법이라고 생각합니다.' : 
        '국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다.';

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
        padding: ${isMobile ? '20px' : '30px'};
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        max-width: ${isMobile ? '95%' : '500px'};
        width: 90%;
        font-family: Arial, sans-serif;
        max-height: 80vh;
        overflow-y: auto;
      `;

      modal.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">📝 의견 입력</h3>
        ${agreeBills.length > 0 && disagreeBills.length > 0 ? 
          `<div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 14px;">
            ℹ️ 찬성 ${agreeBills.length}개, 반대 ${disagreeBills.length}개 법안이 선택되었습니다.
          </div>` : ''
        }
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">제목:</label>
          <input type="text" id="modal-title" placeholder="예: 이 법안을 반대합니다" 
                 style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;"
                 value="${defaultTitle}">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">내용:</label>
          <textarea id="modal-content" placeholder="예: 국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다"
                    style="width: 100%; height: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;">${defaultContent}</textarea>
        </div>
        <div style="background: #fff3e0; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 13px; border-left: 4px solid #ff9800;">
          <strong>✨ 스마트 캡차 처리:</strong><br>
          • 캡차 5자리 입력 후 성공하면 → 탭 자동 닫기<br>
          • 실패하면 → 탭 유지하여 다시 입력 가능
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

    console.log('✅ VForKorea 의견 등록 시스템 준비 완료');
  }
  
  // 국회 의견 등록 사이트에서의 동작 (스마트 캡차 처리 포함)
  else if (currentDomain === 'pal.assembly.go.kr') {
    console.log('📍 국회 의견 등록 사이트 감지 - 스마트 자동 입력 실행');
    
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
      
      if (captchaField) {
        captchaField.focus();
        captchaField.style.border = '3px solid #ff4444';
        captchaField.style.background = '#fffacd';
        captchaField.style.fontSize = '18px';
        captchaField.style.fontWeight = 'bold';
        captchaField.style.textAlign = 'center';
        
        // 스마트 캡차 처리 설정 (중복 방지)
        if (!captchaField._smartCaptchaSet) {
          let isSubmitting = false; // 중복 제출 방지
          
          captchaField.addEventListener('input', function() {
            const value = this.value.trim();
            console.log('🔤 캡차 입력 중:', value);
            
            // 5자리 숫자 입력 완료시
            if (/^\d{5}$/.test(value) && !isSubmitting) {
              isSubmitting = true;
              console.log('🎯 캡차 5자리 완료, 제출 시도:', value);
              
              // 시각적 피드백
              this.style.background = '#e8f5e8';
              this.style.borderColor = '#4caf50';
              
              setTimeout(() => {
                try {
                  // 기존 함수들 호출 (사이트 내장 함수)
                  if (typeof trimAllInputText === 'function') {
                    trimAllInputText();
                  }
                  
                  if (typeof validate === 'function' && !validate()) {
                    console.log('❌ 유효성 검사 실패');
                    isSubmitting = false;
                    captchaField.style.background = '#ffebee';
                    captchaField.style.borderColor = '#f44336';
                    return;
                  }
                  
                  // 로딩 표시
                  if (typeof $ !== 'undefined' && $('.loading_bar').length) {
                    $('.loading_bar').show();
                  }
                  
                  // 제출 시도
                  if (typeof checkWebFilter === 'function' && typeof $ !== 'undefined') {
                    checkWebFilter($('#frm'));
                    console.log('📤 폼 제출 완료 - 결과 대기 중...');
                    
                    // 제출 후 결과 확인 (3초 대기)
                    setTimeout(() => {
                      checkSubmissionResult();
                    }, 3000);
                    
                  } else {
                    // 대체 제출 방법
                    const submitBtn = document.getElementById('btn_opnReg');
                    if (submitBtn) {
                      submitBtn.click();
                      console.log('🖱️ 수동 버튼 클릭으로 제출');
                      
                      setTimeout(() => {
                        checkSubmissionResult();
                      }, 3000);
                    }
                  }
                  
                } catch (e) {
                  console.error('❌ 제출 중 오류:', e);
                  isSubmitting = false;
                  captchaField.style.background = '#ffebee';
                  captchaField.style.borderColor = '#f44336';
                }
              }, 500);
            }
          });
          
          // 제출 결과 확인 함수
          function checkSubmissionResult() {
            // 먼저 에러 메시지부터 확인 (우선순위 높음)
            const errorChecks = [
              // 방지문자 오류 메시지들
              () => {
                const alerts = document.querySelectorAll('.alert, .error, .message, div, span');
                for (let alert of alerts) {
                  const text = alert.textContent || alert.innerText || '';
                  if (text.includes('방지문자') || text.includes('보안문자') || 
                      text.includes('틀렸') || text.includes('잘못') || 
                      text.includes('올바르지') || text.includes('다시') ||
                      text.includes('확인') && text.includes('문자')) {
                    console.log('🚫 방지문자 오류 감지:', text.trim());
                    return text.trim();
                  }
                }
                return null;
              },
              // JavaScript alert 메시지 확인
              () => {
                // 기존에 alert가 실행되었는지 확인하는 방법
                const originalAlert = window.alert;
                let alertMessage = null;
                window.alert = function(msg) {
                  alertMessage = msg;
                  console.log('🚨 Alert 메시지 감지:', msg);
                  return originalAlert.call(this, msg);
                };
                return alertMessage;
              },
              // 폼 유효성 검사 실패
              () => {
                const captchaInput = document.querySelector('#catpchaAnswer');
                if (captchaInput && captchaInput.style.borderColor === 'red') {
                  return '캡차 필드 에러 스타일 감지';
                }
                return null;
              }
            ];
            
            // 에러 확인
            let errorMessage = null;
            for (let check of errorChecks) {
              try {
                const result = check();
                if (result) {
                  errorMessage = result;
                  break;
                }
              } catch (e) {
                console.log('에러 체크 중 예외:', e);
              }
            }
            
            // 성공 확인 (에러가 없을 때만)
            const successChecks = [
              // URL 변경 확인 (등록 완료 페이지로 이동)
              () => {
                const url = window.location.href;
                return url.includes('complete') || url.includes('success') || 
                       url.includes('finish') || url.includes('done');
              },
              // 성공 메시지 확인
              () => {
                const successElements = document.querySelectorAll('.alert-success, .success, .complete');
                for (let elem of successElements) {
                  const text = elem.textContent || elem.innerText || '';
                  if (text.includes('완료') || text.includes('성공') || 
                      text.includes('등록') && text.includes('되었습니다')) {
                    return text.trim();
                  }
                }
                return null;
              },
              // 폼이 사라졌는지 확인
              () => {
                const form = document.querySelector('#frm');
                const captcha = document.querySelector('#catpchaAnswer');
                return !form || !captcha || captcha.disabled;
              }
            ];
            
            let isSuccess = false;
            if (!errorMessage) {
              for (let check of successChecks) {
                try {
                  if (check()) {
                    isSuccess = true;
                    break;
                  }
                } catch (e) {
                  console.log('성공 체크 중 예외:', e);
                }
              }
            }
            
            console.log('🔍 제출 결과 상세 확인:', { 
              errorMessage, 
              isSuccess,
              currentUrl: window.location.href,
              pageTitle: document.title
            });
            
            if (errorMessage) {
              // ❌ 명확한 에러 - 탭 유지
              console.log('❌ 제출 실패 (에러 메시지 감지) - 탭 유지');
              isSubmitting = false;
              
              if (captchaField) {
                // 캡차 필드 초기화하고 포커스
                captchaField.value = '';
                captchaField.style.background = '#ffebee';
                captchaField.style.borderColor = '#f44336';
                setTimeout(() => {
                  captchaField.focus();
                  captchaField.style.background = '#fff3e0';
                  captchaField.style.borderColor = '#ff9800';
                }, 1000);
              }
              
              // 실패 알림 표시 (구체적인 에러 메시지 포함)
              showRetryNotification(errorMessage);
              
            } else if (isSuccess) {
              // 🎉 성공 - 탭 닫기
              console.log('🎉 제출 성공! 탭을 닫습니다...');
              
              // 성공 알림 표시
              showSuccessNotification();
              
              setTimeout(() => {
                try {
                  window.close();
                  console.log('🚪 탭 닫기 성공');
                } catch (e) {
                  console.log('🚪 탭 닫기 실패 (브라우저 제한)');
                  // 탭 닫기가 안 되면 페이지 이동
                  window.location.href = 'about:blank';
                }
              }, 1500);
              
            } else {
              // 🤔 애매한 상황 - 좀 더 기다려보기
              console.log('🤔 결과 불분명 - 추가 대기 중...');
              setTimeout(() => {
                checkSubmissionResult(); // 재귀 호출로 다시 확인
              }, 2000);
            }
          }
          
          // 성공 알림 함수
          function showSuccessNotification() {
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: linear-gradient(135deg, #4CAF50, #45a049);
              color: white;
              padding: 20px 30px;
              border-radius: 12px;
              z-index: 999999;
              font-family: Arial, sans-serif;
              box-shadow: 0 8px 25px rgba(0,0,0,0.3);
              text-align: center;
              font-size: 16px;
              font-weight: bold;
            `;
            
            notification.innerHTML = `
              <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
              <div>제출 성공!</div>
              <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">탭이 자동으로 닫힙니다...</div>
            `;
            
            document.body.appendChild(notification);
          }
          
          // 재시도 알림 함수 (에러 메시지 포함)
          function showRetryNotification(errorMsg = '') {
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #f44336, #d32f2f);
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              z-index: 999999;
              font-family: Arial, sans-serif;
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              font-size: 14px;
              max-width: 350px;
              border: 2px solid #fff;
            `;
            
            const shortError = errorMsg.length > 50 ? errorMsg.substring(0, 50) + '...' : errorMsg;
            
            notification.innerHTML = `
              <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">❌</span>
                방지문자 오류!
              </div>
              ${errorMsg ? `<div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px; background: rgba(255,255,255,0.1); padding: 6px; border-radius: 4px;">${shortError}</div>` : ''}
              <div style="font-size: 13px; opacity: 0.9;">
                캡차 필드가 초기화되었습니다.<br>
                올바른 5자리 숫자를 다시 입력해주세요.
              </div>
              <button onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: white; cursor: pointer; font-size: 16px; opacity: 0.7;">✕</button>
            `;
            
            document.body.appendChild(notification);
            
            // 5초 후 자동 제거
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 5000);
          }
          
          captchaField._smartCaptchaSet = true;
        }
      }
      
      // 초기 성공 알림
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
          🎯 스마트 자동 입력 완료!
        </div>
        <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
          <div><strong>제목:</strong> ${autoTitle.substring(0, 20)}...</div>
          <div style="margin-top: 5px;"><strong>내용:</strong> ${autoContent.substring(0, 30)}...</div>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 12px;">
          ✨ <strong>캡차 5자리 입력시:</strong><br>
          • 성공 → 탭 자동 닫기<br>
          • 실패 → 탭 유지하여 재입력
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
    
    console.log('✅ 국회 사이트 스마트 자동 입력 준비 완료');
  }
  
  // 기타 사이트
  else {
    console.log('❓ 지원하지 않는 사이트:', currentDomain);
    alert('이 북마클릿은 VForKorea와 국회 의견 등록 사이트에서만 작동합니다.');
  }
})();
