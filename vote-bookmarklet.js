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

javascript:(async function() {
const currentDomain = window.location.hostname;

// VForKorea 사이트에서의 동작
if (currentDomain === 'vforkorea.com') {

// 기존 패널 제거
const existingPanel = document.querySelector('#vote-control-panel');
if (existingPanel) existingPanel.remove();

// 로딩 알림 표시
const loadingNotification = document.createElement('div');
Object.assign(loadingNotification.style, {
  position: 'fixed',
  top: '20px',
  right: '20px',
  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
  color: 'white',
  padding: '15px 20px',
  borderRadius: '8px',
  zIndex: '999999',
  fontFamily: 'Arial, sans-serif',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  fontSize: '14px'
});
loadingNotification.innerHTML = '🔄 모든 법안 로딩 중...';
document.body.appendChild(loadingNotification);

// 1. 모든 법안 로딩 함수
async function loadAllBills() {
  let previousCount = 0;
  let currentCount = 0;
  let noChangeCount = 0;
  
  while (noChangeCount < 3) {
    // 현재 법안 수 확인
    currentCount = document.querySelectorAll('tr[data-idx]').length;
    
    // 페이지 끝까지 스크롤
    window.scrollTo(0, document.body.scrollHeight);
    
    // 잠시 대기 (새 콘텐츠 로딩 시간)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 변화가 없으면 카운트 증가
    if (currentCount === previousCount) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
    }
    
    previousCount = currentCount;
    
    // 로딩 상태 업데이트
    loadingNotification.innerHTML = `🔄 법안 로딩 중... (${currentCount}개 발견)`;
  }
  
  return currentCount;
}

// 모든 법안 로딩 후 분류
const totalLoaded = await loadAllBills();
loadingNotification.innerHTML = `✅ 총 ${totalLoaded}개 법안 로딩 완료!`;

// 2. 모든 법안 데이터 수집 및 날짜별 분류
const allBills = [];
const billsByDate = {}; // 날짜별 법안 저장

document.querySelectorAll('tr[data-idx]').forEach(tr => {
  const titleElement = tr.querySelector('.content .t');
  const voteLink = tr.querySelector('a[href*="forInsert.do"]');
  
  if (!titleElement || !voteLink) return;
  
  const title = titleElement.textContent.trim();
  let dateCategory = '📋 마감 정보 없음';
  let isToday = false;
  let dateSpan = null;
  let spanClass = 'none';
  
  // 해당 행의 모든 td 요소를 확인
  const tds = tr.querySelectorAll('td');
  
  for (let td of tds) {
    // 각 td 안에서 span 요소들 확인
    const redSpan = td.querySelector('span.red');
    const orangeSpan = td.querySelector('span.orange');
    const graySpan = td.querySelector('span.gray');
    
    if (redSpan) {
      const dateText = redSpan.textContent.trim();
      if (dateText === '오늘 마감') {
        dateCategory = '🔥 오늘 마감';
        isToday = true;
      } else if (dateText && dateText.trim() !== '') {
        dateCategory = `🔴 ${dateText}`;
      }
      dateSpan = redSpan;
      spanClass = 'red';
      break;
    } else if (orangeSpan) {
      const dateText = orangeSpan.textContent.trim();
      if (dateText === '내일 마감') {
        dateCategory = '⏰ 내일 마감';
      } else if (dateText && dateText.trim() !== '') {
        dateCategory = `🟠 ${dateText}`;
      }
      dateSpan = orangeSpan;
      spanClass = 'orange';
      break;
    } else if (graySpan) {
      const dateText = graySpan.textContent.trim();
      if (dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD 형식의 날짜
        dateCategory = `📅 ${dateText}`;
      } else if (dateText && dateText.trim() !== '') {
        dateCategory = `⚫ ${dateText}`;
      }
      dateSpan = graySpan;
      spanClass = 'gray';
      break;
    }
  }
  
  const billData = {
    title: title,
    link: voteLink.href,
    element: tr,
    dateCategory: dateCategory,
    isToday: isToday,
    originalDateText: dateSpan ? dateSpan.textContent.trim() : '',
    spanClass: spanClass
  };
  
  allBills.push(billData);
  
  // 날짜별로 분류
  if (!billsByDate[dateCategory]) {
    billsByDate[dateCategory] = [];
  }
  billsByDate[dateCategory].push(billData);
});

// 로딩 알림 제거
setTimeout(() => {
  if (document.body.contains(loadingNotification)) {
    document.body.removeChild(loadingNotification);
  }
}, 2000);

// 3. 날짜 카테고리 정렬 (우선순위: 오늘 마감 → 내일 마감 → 날짜 → 기타)
const sortedDateCategories = Object.keys(billsByDate).sort((a, b) => {
  // 1순위: 오늘 마감
  if (a === '🔥 오늘 마감') return -1;
  if (b === '🔥 오늘 마감') return 1;
  
  // 2순위: 내일 마감
  if (a === '⏰ 내일 마감') return -1;
  if (b === '⏰ 내일 마감') return 1;
  
  // 3순위: YYYY-MM-DD 형식 날짜들 (날짜 순으로 정렬)
  const aIsDate = a.startsWith('📅 ');
  const bIsDate = b.startsWith('📅 ');
  
  if (aIsDate && bIsDate) {
    const aDate = a.substring(2); // '📅 ' 제거
    const bDate = b.substring(2);
    return aDate.localeCompare(bDate);
  }
  
  if (aIsDate && !bIsDate) return -1;
  if (!aIsDate && bIsDate) return 1;
  
  // 4순위: 기타 텍스트들 (알파벳 순)
  return a.localeCompare(b);
});

// 4. 컨트롤 패널 생성 (모바일 최적화)
const controlPanel = document.createElement('div');
controlPanel.id = 'vote-control-panel';
const isMobile = window.innerWidth <= 768;
Object.assign(controlPanel.style, {
position: 'fixed',
top: isMobile ? '10px' : '20px',
right: isMobile ? '10px' : '20px',
left: isMobile ? '10px' : 'auto',
width: isMobile ? 'auto' : '400px',
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

// 5. 헤더 및 날짜 필터 드롭다운
const header = document.createElement('div');

// 드롭다운 옵션 생성
const dropdownOptions = sortedDateCategories.map(category => {
  const count = billsByDate[category].length;
  return `<option value="${category}">${category} (${count}개)</option>`;
}).join('');

header.innerHTML = `
<h3 style="margin: 0 0 15px 0; color: #333;">📝 법안 선택 시스템</h3>
<div style="margin-bottom: 15px;">
<label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">마감일별 필터:</label>
<select id="bill-filter" style="
  width: 100%; 
  padding: 8px; 
  border: 2px solid #ddd; 
  border-radius: 6px; 
  font-size: 14px;
  margin-bottom: 10px;
">
  ${dropdownOptions}
  <option value="all">🗂️ 전체 법안 (${allBills.length}개)</option>
</select>
</div>
<div style="margin-bottom: 15px;">
<button id="select-all-agree" style="padding: 5px 10px; margin-right: 5px; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer;">전체 찬성</button>
<button id="select-all-disagree" style="padding: 5px 10px; margin-right: 5px; background: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">전체 반대</button>
<button id="clear-all" style="padding: 5px 10px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">초기화</button>
</div>
`;
controlPanel.appendChild(header);

// 6. 법안 목록 컨테이너
const billsList = document.createElement('div');
billsList.id = 'bills-list';
controlPanel.appendChild(billsList);

// 7. 실행 버튼들
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

// 8. 현재 표시된 법안들과 상태 관리
let currentBills = [];
let billStates = {}; // 법안별 투표 상태 저장

// 9. 법안 목록 렌더링 함수
function renderBills(billsToShow) {
  currentBills = billsToShow;
  billsList.innerHTML = '';
  
  if (!billsToShow.length) {
    billsList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">해당하는 법안이 없습니다.</div>';
    return;
  }
  
  billsToShow.forEach((bill, index) => {
    const shortTitle = bill.title.length > 50 ? bill.title.substring(0, 50) + '...' : bill.title;
    const currentVote = billStates[bill.link];
    
    const billItem = document.createElement('div');
    Object.assign(billItem.style, {
      marginBottom: '12px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      background: bill.isToday ? '#fff3e0' : '#f9f9f9'
    });

    billItem.innerHTML = `
    <div style="
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.3;
    ">
    ${bill.isToday ? '🔥 ' : ''}${shortTitle}
    </div>
    <div style="
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
    ">
    ${bill.dateCategory}
    </div>
    <div style="
      display: flex;
      gap: 8px;
      align-items: center;
    ">
    <button class="vote-btn agree" data-bill-id="${bill.link}" style="
      padding: 4px 12px;
      background: #2e7d32;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      opacity: ${currentVote === 'agree' ? '1' : (currentVote === 'disagree' ? '0.5' : '1')};
    ">
    찬성
    </button>
    <button class="vote-btn disagree" data-bill-id="${bill.link}" style="
      padding: 4px 12px;
      background: #c62828;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      opacity: ${currentVote === 'disagree' ? '1' : (currentVote === 'agree' ? '0.5' : '1')};
    ">
    반대
    </button>
    <span class="vote-status" data-bill-id="${bill.link}" style="
      margin-left: 8px;
      font-weight: bold;
      font-size: 12px;
      color: ${currentVote === 'agree' ? '#2e7d32' : (currentVote === 'disagree' ? '#c62828' : '#666')};
    ">
    ${currentVote === 'agree' ? '찬성' : (currentVote === 'disagree' ? '반대' : '미선택')}
    </span>
    </div>
    `;

    billsList.appendChild(billItem);
  });
}

// 10. 초기 렌더링 (오늘 마감 법안 먼저 표시, 없으면 첫 번째 카테고리)
const initialBills = billsByDate['🔥 오늘 마감'] || billsByDate[sortedDateCategories[0]] || [];
renderBills(initialBills);

// 11. 이벤트 리스너들

// 필터 변경
document.getElementById('bill-filter').addEventListener('change', (e) => {
  const filterValue = e.target.value;
  if (filterValue === 'all') {
    renderBills(allBills);
  } else {
    renderBills(billsByDate[filterValue] || []);
  }
});

// 개별 투표 버튼
controlPanel.addEventListener('click', (e) => {
if (e.target.classList.contains('vote-btn')) {
const billId = e.target.dataset.billId;
const voteType = e.target.classList.contains('agree') ? 'agree' : 'disagree';

// 상태 저장
billStates[billId] = voteType;

// 즉시 렌더링 업데이트
renderBills(currentBills);
}
});

// 전체 선택 버튼들
document.getElementById('select-all-agree').onclick = () => {
currentBills.forEach((bill) => {
billStates[bill.link] = 'agree';
});
renderBills(currentBills);
};

document.getElementById('select-all-disagree').onclick = () => {
currentBills.forEach((bill) => {
billStates[bill.link] = 'disagree';
});
renderBills(currentBills);
};

document.getElementById('clear-all').onclick = () => {
currentBills.forEach((bill) => {
delete billStates[bill.link];
});
renderBills(currentBills);
};

// 패널 닫기
document.getElementById('close-panel').onclick = () => {
controlPanel.remove();
};

// 의견 등록 시작
document.getElementById('start-opinion-registration').onclick = () => {
// 선택된 법안들만 필터링
const selectedBills = allBills.filter(bill => billStates[bill.link]);

if (!selectedBills.length) {
alert('선택된 법안이 없습니다.');
return;
}

// 찬성과 반대 법안 분리
const agreeBills = selectedBills.filter(bill => billStates[bill.link] === 'agree');
const disagreeBills = selectedBills.filter(bill => billStates[bill.link] === 'disagree');

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

${agreeBills.length > 0 ? `
<div style="
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #4caf50;
">
<h4 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 16px;">
✅ 찬성 법안 (${agreeBills.length}개)
</h4>
<div style="margin-bottom: 10px;">
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
제목:
</label>
<input type="text" id="modal-agree-title" 
       style="
         width: 100%;
         padding: 8px;
         border: 2px solid #ddd;
         border-radius: 6px;
         font-size: 14px;
       "
       value="이 법안에 찬성합니다">
</div>
<div>
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
내용:
</label>
<textarea id="modal-agree-content" 
          style="
            width: 100%;
            height: 80px;
            padding: 8px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
          ">국민의 의견을 충분히 수렴한 좋은 입법이라고 생각합니다.</textarea>
</div>
</div>
` : ''}

${disagreeBills.length > 0 ? `
<div style="
  background: #ffebee;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #f44336;
">
<h4 style="margin: 0 0 10px 0; color: #c62828; font-size: 16px;">
❌ 반대 법안 (${disagreeBills.length}개)
</h4>
<div style="margin-bottom: 10px;">
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
제목:
</label>
<input type="text" id="modal-disagree-title" 
       style="
         width: 100%;
         padding: 8px;
         border: 2px solid #ddd;
         border-radius: 6px;
         font-size: 14px;
       "
       value="이 법안을 반대합니다">
</div>
<div>
<label style="
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
">
내용:
</label>
<textarea id="modal-disagree-content" 
          style="
            width: 100%;
            height: 80px;
            padding: 8px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
          ">국민의 의견을 충분히 수렴하지 않은 졸속 입법을 반대합니다.</textarea>
</div>
</div>
` : ''}

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
  const agreeTitleInput = document.getElementById('modal-agree-title')?.value.trim() || '';
  const agreeContentInput = document.getElementById('modal-agree-content')?.value.trim() || '';
  const disagreeTitleInput = document.getElementById('modal-disagree-title')?.value.trim() || '';
  const disagreeContentInput = document.getElementById('modal-disagree-content')?.value.trim() || '';

  // 선택된 법안이 있는데 해당 메시지가 비어있으면 경고
  if (agreeBills.length > 0 && (!agreeTitleInput || !agreeContentInput)) {
    alert('찬성 법안의 제목과 내용을 모두 입력해주세요.');
    return;
  }
  
  if (disagreeBills.length > 0 && (!disagreeTitleInput || !disagreeContentInput)) {
    alert('반대 법안의 제목과 내용을 모두 입력해주세요.');
    return;
  }

  modalOverlay.remove();

  // 찬성 법안들 처리
  if (agreeBills.length > 0) {
    localStorage.setItem('autoFillData_agree', JSON.stringify({
      title: agreeTitleInput,
      content: agreeContentInput,
      timestamp: Date.now()
    }));

    agreeBills.forEach((bill) => {
      const url = new URL(bill.link);
      url.searchParams.set('autoTitle', encodeURIComponent(agreeTitleInput));
      url.searchParams.set('autoContent', encodeURIComponent(agreeContentInput));
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
      title: disagreeTitleInput,
      content: disagreeContentInput,
      timestamp: Date.now()
    }));

    disagreeBills.forEach((bill) => {
      const url = new URL(bill.link);
      url.searchParams.set('autoTitle', encodeURIComponent(disagreeTitleInput));
      url.searchParams.set('autoContent', encodeURIComponent(disagreeContentInput));
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
};

// 취소 버튼
document.getElementById('modal-cancel').onclick = () => modalOverlay.remove();
};
}

// 국회 의견 등록 사이트에서의 동작
else if (currentDomain === 'pal.assembly.go.kr') {

// LocalStorage에서 데이터 읽기
const storedAgreeData = localStorage.getItem('autoFillData_agree');
const storedDisagreeData = localStorage.getItem('autoFillData_disagree');

let autoTitle = '';
let autoContent = '';

// URL 파라미터에서 voteType 확인
const urlParams = new URLSearchParams(location.search);
const voteType = urlParams.get('voteType');

// voteType에 따라 적절한 데이터 로드
if (voteType === 'agree' && storedAgreeData) {
const data = JSON.parse(storedAgreeData);
autoTitle = data.title || '';
autoContent = data.content || '';
} else if (voteType === 'disagree' && storedDisagreeData) {
const data = JSON.parse(storedDisagreeData);
autoTitle = data.title || '';
autoContent = data.content || '';
}

// URL 파라미터에서도 읽기 (최종 백업)
if (!autoTitle || !autoContent) {
autoTitle = autoTitle || decodeURIComponent(urlParams.get('autoTitle') || '');
autoContent = autoContent || decodeURIComponent(urlParams.get('autoContent') || '');
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

if (titleField && autoTitle) {
titleField.value = autoTitle;
titleField.dispatchEvent(new Event('input', { bubbles: true }));
titleField.dispatchEvent(new Event('keyup', { bubbles: true }));
}

if (contentField && autoContent) {
contentField.value = autoContent;
contentField.dispatchEvent(new Event('input', { bubbles: true }));
contentField.dispatchEvent(new Event('keyup', { bubbles: true }));
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
  
  // 5자리 숫자 입력 완료시
  if (/^\d{5}$/.test(value) && !isSubmitting) {
    isSubmitting = true;
    
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
          
          // 제출 후 결과 확인 (3초 대기)
          setTimeout(() => {
            checkSubmissionResult();
          }, 3000);
          
        } else {
          // 대체 제출 방법
          const submitBtn = document.getElementById('btn_opnReg');
          if (submitBtn) {
            submitBtn.click();
            
            setTimeout(() => {
              checkSubmissionResult();
            }, 3000);
          }
        }
        
      } catch (e) {
        isSubmitting = false;
        captchaField.style.background = '#ffebee';
        captchaField.style.borderColor = '#f44336';
      }
    }, 1200);
  }
});

// 제출 결과 확인 함수
function checkSubmissionResult() {
  // 1단계: 정확한 에러 메시지 확인 (최우선)
  let errorMessage = null;
  
  // 모든 텍스트 요소 검사
  const allElements = document.querySelectorAll('*');
  for (let element of allElements) {
    const text = (element.textContent || element.innerText || '').trim();
    
    // 정확한 국회 사이트 에러 메시지들
    if (text === '중복 방지 문자가 일치하지 않습니다.' ||
        text.includes('중복 방지 문자가 일치하지 않습니다') ||
        text.includes('방지 문자가 일치하지') ||
        text.includes('일치하지 않습니다')) {
      errorMessage = text;
      break;
    }
    
    // 기타 캡차 관련 에러들
    const errorPatterns = [
      '방지문자', '보안문자', '인증문자',
      '틀렸', '잘못', '올바르지', '정확하지',
      '다시 입력', '재입력'
    ];
    
    const hasError = errorPatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (hasError && text.length > 5 && text.length < 100) {
      errorMessage = text;
      break;
    }
  }
  
  // 3단계: 성공 확인 (에러가 없을 때만!)
  let successMessage = null;
  
  if (!errorMessage) {
    // URL 변경 확인
    const currentUrl = window.location.href;
    if (currentUrl.includes('complete') || currentUrl.includes('success')) {
      successMessage = 'URL 변경으로 성공 감지';
    }
    
    // 성공 메시지 확인
    if (!successMessage) {
      for (let element of allElements) {
        const text = (element.textContent || element.innerText || '').trim();
        
        // 성공 메시지들 (에러 키워드가 없는 경우만)
        if ((text.includes('완료') || text.includes('성공') || 
             text.includes('등록되었습니다') || text.includes('접수되었습니다')) &&
            !text.includes('중복 방지') && !text.includes('일치하지') && 
            !text.includes('틀렸') && text.length < 100) {
          successMessage = text;
          break;
        }
      }
    }
  }
  
  // 4단계: 최종 결정 (에러 메시지가 있으면 무조건 실패!)
  if (errorMessage) {
    // ❌ "중복 방지 문자가 일치하지 않습니다" 감지 - 탭 유지!
    isSubmitting = false;
    
    // 캡차 필드 초기화
    if (captchaField) {
      captchaField.value = '';
      captchaField.style.background = '#ffebee';
      captchaField.style.borderColor = '#f44336';
      
      setTimeout(() => {
        captchaField.focus();
        captchaField.style.background = '#fff3e0';
        captchaField.style.borderColor = '#ff9800';
      }, 1000);
    }
    
    // 명확한 실패 알림
    showCaptchaErrorNotification(errorMessage);
    
  } else if (successMessage) {
    // 에러 없고 성공 메시지만 있으면 탭 닫기!
    showSuccessNotification();
    
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        window.location.href = 'about:blank';
      }
    }, 1500);
    
  } else {
    // 아직 결과가 불분명하면 조금 더 기다리기
    setTimeout(() => {
      checkSubmissionResult();
    }, 3000);
  }
}

// 성공 알림 함수
function showSuccessNotification() {
  const notification = document.createElement('div');
  Object.assign(notification.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
    color: 'white',
    padding: '20px 30px',
    borderRadius: '12px',
    zIndex: '999999',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold'
  });
  
  notification.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
    <div>제출 성공!</div>
    <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">탭이 자동으로 닫힙니다...</div>
  `;
  
  document.body.appendChild(notification);
}

captchaField._smartCaptchaSet = true;
}
}

// 초기 성공 알림
const notification = document.createElement('div');
Object.assign(notification.style, {
position: 'fixed',
top: '20px',
right: '20px',
background: 'linear-gradient(135deg, #4CAF50, #45a049)',
color: 'white',
padding: '20px',
borderRadius: '12px',
zIndex: '10000',
fontFamily: 'Arial, sans-serif',
boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
maxWidth: '300px'
});

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
}

// 기타 사이트
else {
alert('이 북마클릿은 VForKorea와 국회 의견 등록 사이트에서만 작동합니다.');
}
})();
