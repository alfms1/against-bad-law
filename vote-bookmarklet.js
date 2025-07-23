// 캡차 에러 전용 알림
function showCaptchaErrorNotification(errorMsg) {
  const notification = document.createElement('div');
  Object.assign(notification.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    padding: '25px',
    borderRadius: '15px',
    zIndex: '999999',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
    fontSize: '16px',
    maxWidth: '400px',
    border: '3px solid #fff',
    textAlign: 'center',
    animation: 'shake 0.5s ease-in-out'
  });
  
  // CSS 애니메이션 추가
  if (!document.querySelector('#captcha-error-style')) {
    const style = document.createElement('style');
    style.id = 'captcha-error-style';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
        25% { transform: translate(-50%, -50%) rotate(-2deg); }
        75% { transform: translate(-50%, -50%) rotate(2deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 15px;">❌</div>
    <div style="font-weight: bold; margin-bottom: 15px; font-size: 20px;">
      캡차 입력 오류!
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
      <strong>"${errorMsg}"</strong>
    </div>
    <div style="font-size: 15px; line-height: 1.4; margin-bottom: 20px;">
      캡차 필드가 초기화되었습니다.<br>
      새로운 5자리 숫자를 입력해주세요.
    </div>
    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; font-size: 13px;">
      🔄 탭이 유지되어 즉시 재입력 가능합니다
    </div>
    <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; cursor: pointer; font-size: 20px; opacity: 0.8; width: 30px; height: 30px;">✕</button>
  `;
  
  document.body.appendChild(notification);
  
  // 7초 후 자동 제거
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 7000);
}

javascript:(function() {
const currentDomain = window.location.hostname;
// console.log('🎯 범용 북마클릿 실행 - 도메인:', currentDomain);

// VForKorea 사이트에서의 동작
if (currentDomain === 'vforkorea.com') {
// console.log('📍 VForKorea 사이트 감지 - 의견 등록 시스템 실행');

// 기존 패널 제거
const existingPanel = document.querySelector('#vote-control-panel');
if (existingPanel) existingPanel.remove();

// 1. 오늘 마감된 행들 찾기
const todayRows = [...document.querySelectorAll('tr[data-idx]')].filter(tr => {
const redSpan = tr.querySelector('td span.red');
const isToday = redSpan && redSpan.textContent.trim() === '오늘 마감';
// if (isToday) {
// console.log('오늘 마감 법안 발견:', tr.querySelector('.content .t')?.textContent);
// }
return isToday;
});

// console.log(`총 ${todayRows.length}개의 오늘 마감 법안을 찾았습니다.`);

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
// console.warn('필요한 요소를 찾을 수 없습니다:', tr);
return;
}

const title = titleElement.textContent.trim();
const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

const billItem = document.createElement('div');
Object.assign(billItem.style, {
  marginBottom: '12px',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  background: '#f9f9f9'
});

billItem.innerHTML = `
<div style="
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.3;
">
${shortTitle}
</div>
<div style="
  display: flex;
  gap: 8px;
  align-items: center;
">
<button class="vote-btn agree" data-index="${index}" style="
  padding: 4px 12px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
">
찬성
</button>
<button class="vote-btn disagree" data-index="${index}" style="
  padding: 4px 12px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
">
반대
</button>
<span class="vote-status" data-index="${index}" style="
  margin-left: 8px;
  font-weight: bold;
  font-size: 12px;
">
미선택
</span>
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
<div style="
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
">
<button id="start-opinion-registration" style="
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
">
🚀 의견 등록 시작
</button>
<button id="close-panel" style="
  width: 100%;
  padding: 8px;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
">
패널 닫기
</button>
<div style="
  margin-top: 8px;
  font-size: 11px;
  color: #666;
  text-align: center;
">
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
      btn.style.opacity = '1'; // 모든 버튼의 불투명도를 1로 재설정
      // 버튼 스타일 원상복구
      if (btn.classList.contains('agree')) {
        btn.style.background = '#2e7d32';
        btn.style.color = 'white';
      } else if (btn.classList.contains('disagree')) {
        btn.style.background = '#c62828';
        btn.style.color = 'white';
      }
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
Object.assign(modalOverlay.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.7)',
  zIndex: '20000',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const modal = document.createElement('div');
Object.assign(modal.style, {
  background: 'white',
  padding: `${isMobile ? '20px' : '30px'}`,
  borderRadius: '12px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  maxWidth: `${isMobile ? '95%' : '500px'}`,
  width: '90%',
  fontFamily: 'Arial, sans-serif',
  maxHeight: '80vh',
  overflowY: 'auto'
});

modal.innerHTML = `
<h3 style="
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
">
📝 의견 입력
</h3>
${agreeBills.length > 0 && disagreeBills.length > 0 ? 
`<div style="
  background: #e3f2fd;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
">
  ℹ️ 찬성 ${agreeBills.length}개, 반대 ${disagreeBills.length}개 법안이 선택되었습니다.
</div>` : ''
}
<div style="margin-bottom: 15px;">
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
제목:
</label>
<input type="text" id="modal-title" placeholder="예: 이 법안을 반대합니다" 
       style="
         width: 100%;
         padding: 10px;
         border: 2px solid #ddd;
         border-radius: 6px;
         font-size: 14px;
       "
       value="${defaultTitle}">
</div>
<div style="margin-bottom: 20px;">
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
내용:
</label>
<textarea id="modal-content" placeholder="예: 국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다"
          style="
            width: 100%;
            height: 100px;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
          ">${defaultContent}</textarea>
</div>
<div style="
  background: #fff3e0;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 13px;
  border-left: 4px solid #ff9800;
">
<strong>✨ 스마트 캡차 처리:</strong><br>
• 캡차 5자리 입력 후 성공하면 → 탭 자동 닫기<br>
• 실패하면 → 탭 유지하여 다시 입력 가능
</div>
<div style="text-align: center;">
<button id="modal-ok" style="
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
">
확인 (${selectedBills.length}개 법안)
</button>
<button id="modal-cancel" style="
  background: #f44336;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
">
취소
</button>
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

  // --- alert 후킹 시작 ---
  let alertTriggered = false;
  const originalAlert = window.alert;
  window.alert = function(msg) {
    alertTriggered = true;
    // pal.assembly.go.kr 등에서 alert 발생 시 자동으로 창 닫기
    setTimeout(() => {
      window.alert = originalAlert; // 원복
      try { window.close(); } catch (e) { window.location.href = 'about:blank'; }
    }, 100);
    return originalAlert.call(this, msg);
  };
  // --- alert 후킹 끝 ---

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

  //alert(`법안 처리 완료!\n찬성: ${agreeBills.length}개\n반대: ${disagreeBills.length}개\n\n각 창에서 북마클릿을 클릭하세요!`);

  // 혹시 alert가 한 번도 발생하지 않았다면 원복
  setTimeout(() => { window.alert = originalAlert; }, 2000);
};

// 취소 버튼
document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();
};

// console.log('✅ VForKorea 의견 등록 시스템 준비 완료');
}

// 국회 의견 등록 사이트에서의 동작 (스마트 캡차 처리 포함)
else if (currentDomain === 'pal.assembly.go.kr') {
// console.log('🏛️ 국회 의견 등록 사이트 감지 - 스마트 자동 입력 실행');

// LocalStorage에서 데이터 읽기
const storedData = localStorage.getItem('autoFillData');
const storedAgreeData = localStorage.getItem('autoFillData_agree');
const storedDisagreeData = localStorage.getItem('autoFillData_disagree');

let autoTitle = '';
let autoContent = '';

// URL 파라미터에서 voteType 확인
const urlParams = new URLSearchParams(location.search);
const voteType = urlParams.get('voteType');

// console.log('🔍 감지된 투표 타입:', voteType);

// voteType에 따라 적절한 데이터 로드
if (voteType === 'agree' && storedAgreeData) {
const data = JSON.parse(storedAgreeData);
autoTitle = data.title || '';
autoContent = data.content || '';
// console.log('📦 찬성 데이터 로드:', { autoTitle, autoContent });
} else if (voteType === 'disagree' && storedDisagreeData) {
const data = JSON.parse(storedDisagreeData);
autoTitle = data.title || '';
autoContent = data.content || '';
// console.log('📦 반대 데이터 로드:', { autoTitle, autoContent });
} else if (storedData) {
const data = JSON.parse(storedData);
autoTitle = data.title || '';
autoContent = data.content || '';
// console.log('📦 기존 데이터 로드:', { autoTitle, autoContent });
}

// URL 파라미터에서도 읽기 (최종 백업)
if (!autoTitle || !autoContent) {
autoTitle = autoTitle || decodeURIComponent(urlParams.get('autoTitle') || '');
autoContent = autoContent || decodeURIComponent(urlParams.get('autoContent') || '');
// console.log('🔗 URL 파라미터에서 데이터 로드:', { autoTitle, autoContent });
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

// console.log('📋 필드 확인:', {
// titleField: !!titleField,
// contentField: !!contentField,
// captchaField: !!captchaField
// });

if (titleField && autoTitle) {
titleField.value = autoTitle;
titleField.dispatchEvent(new Event('input', { bubbles: true }));
titleField.dispatchEvent(new Event('keyup', { bubbles: true }));
// console.log('✅ 제목 입력 완료');
}

if (contentField && autoContent) {
contentField.value = autoContent;
contentField.dispatchEvent(new Event('input', { bubbles: true }));
contentField.dispatchEvent(new Event('keyup', { bubbles: true }));
// console.log('✅ 내용 입력 완료');
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
  // console.log('🔤 캡차 입력 중:', value);
  
  // 5자리 숫자 입력 완료시
  if (/^\d{5}$/.test(value) && !isSubmitting) {
    isSubmitting = true;
    // console.log('🎯 캡차 5자리 완료, 제출 시도:', value);
    
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
          // console.log('❌ 유효성 검사 실패');
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
          // console.log('📤 폼 제출 완료 - 결과 대기 중...');
          
          // 제출 후 결과 확인 (3초 대기)
          setTimeout(() => {
            checkSubmissionResult();
          }, 3000);
          
        } else {
          // 대체 제출 방법
          const submitBtn = document.getElementById('btn_opnReg');
          if (submitBtn) {
            submitBtn.click();
            // console.log('🖱️ 수동 버튼 클릭으로 제출');
            
            setTimeout(() => {
              checkSubmissionResult();
            }, 3000);
          }
        }
        
      } catch (e) {
        // console.error('❌ 제출 중 오류:', e);
        isSubmitting = false;
        captchaField.style.background = '#ffebee';
        captchaField.style.borderColor = '#f44336';
      }
    }, 500);
  }
