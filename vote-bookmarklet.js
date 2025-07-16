(() => {
  console.log('Vote Bookmarklet 시작...');
  
  // VFOR Korea 사이트에서만 실행
  if (!location.hostname.includes('vforkorea.com')) {
    alert('이 스크립트는 vforkorea.com에서만 작동합니다.');
    return;
  }
  
  // 1. 오늘 마감된 행들을 더 정확하게 찾기
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

  // 기존 패널이 있으면 제거
  const existing = document.querySelector('#vote-control-panel');
  if (existing) existing.remove();

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
    <h3 style="margin: 0 0 15px 0; color: #333;">오늘 마감 법안 (${todayRows.length}건)</h3>
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
      <button id="start-voting" style="width: 100%; padding: 12px; background: #1976d2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 8px;">선택한 법안에 의견 등록하기</button>
      <button id="close-panel" style="width: 100%; padding: 8px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">패널 닫기</button>
      <div style="margin-top: 8px; font-size: 11px; color: #666; text-align: center;">
        새 창에서 제목/내용이 자동 입력됩니다.<br>
        캡차만 입력하고 의견을 등록한 후 창을 닫아주세요.
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

      // 같은 법안의 다른 버튼들 스타일 업데이트
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

  // 7. 의견 등록 실행
  document.getElementById('start-voting').onclick = () => {
    const selectedBills = bills.filter(bill => bill.vote !== null);
    
    if (!selectedBills.length) {
      alert('선택된 법안이 없습니다.');
      return;
    }

    if (!confirm(`${selectedBills.length}개 법안에 의견을 등록하시겠습니까?`)) {
      return;
    }

    let currentIndex = 0;
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
    `;
    
    const updateStatus = () => {
      statusDiv.innerHTML = `
        <h4>의견 등록 진행 중...</h4>
        <p>진행률: ${currentIndex}/${selectedBills.length}</p>
        <p>현재: ${selectedBills[currentIndex]?.title.substring(0, 50)}...</p>
        <button onclick="this.parentElement.remove()">취소</button>
      `;
    };

    const openNext = () => {
      if (currentIndex >= selectedBills.length) {
        statusDiv.innerHTML = `
          <h4>✅ 모든 의견 등록이 완료되었습니다!</h4>
          <p>총 ${selectedBills.length}개 법안에 의견을 등록했습니다.</p>
          <button onclick="this.parentElement.remove()">확인</button>
        `;
        return;
      }

      updateStatus();
      
      const bill = selectedBills[currentIndex];
      const voteParam = bill.vote === 'agree' ? 'Y' : 'N';
      const fullUrl = `${bill.link}&opinion=${voteParam}`;
      
      console.log(`${currentIndex + 1}번째 의견 등록:`, bill.title, `(${bill.vote})`);
      console.log('열리는 URL:', fullUrl);
      
      const win = window.open(fullUrl, `vote_${currentIndex}`, 'width=1200,height=800');
      
      // 새 창에 Bad-Law.js 스크립트 로드
      setTimeout(() => {
        try {
          if (win && !win.closed && win.document) {
            console.log('새 창에 Bad-Law.js 로드 중...');
            
            const script = win.document.createElement('script');
            script.src = 'https://alfms1.github.io/against-bad-law/Bad-Law.js';
            script.onload = () => console.log('Bad-Law.js 로드 완료');
            script.onerror = () => console.log('Bad-Law.js 로드 실패');
            win.document.head.appendChild(script);
          }
        } catch (e) {
          console.log('스크립트 로드 실패 (CORS):', e.message);
        }
      }, 2000);
      
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
  };

  console.log('스크립트 설정 완료. 우측 상단의 패널을 확인하세요.');
})();
