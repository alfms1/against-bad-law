(() => {
  console.log('스크립트 시작...');
  
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
      <button id="start-voting" style="width: 100%; padding: 12px; background: #1976d2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 8px;">📝 선택한 법안에 의견 등록하기</button>
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

  // 7. 의견 등록 실행 (여기가 핵심 수정 부분!)
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
      
      // 🔥 새 창에 자동 입력 스크립트 주입 (핵심 추가 부분!)
      setTimeout(() => {
        try {
          if (win && !win.closed && win.document) {
            console.log('새 창에 자동 입력 스크립트 주입 중...');
            
            const script = win.document.createElement('script');
            script.textContent = `
              (() => {
                console.log('자동 입력 스크립트 실행됨');
                
                const opinionParam = new URLSearchParams(location.search).get("opinion");
                const agree = opinionParam === "Y";
                const isValid = opinionParam === "Y" || opinionParam === "N";
                
                console.log('opinion 파라미터:', opinionParam, '찬성여부:', agree);
                
                if (!isValid) {
                  console.log('유효하지 않은 opinion 파라미터');
                  return;
                }

                function fillForm() {
                  console.log('폼 입력 시작...');
                  
                  const sj = document.querySelector('#txt_sj');
                  const cn = document.querySelector('#txt_cn');
                  const captcha = document.querySelector('#catpchaAnswer');
                  
                  if (sj) {
                    sj.value = agree ? '찬성합니다' : '반대합니다';
                    console.log('제목 입력:', sj.value);
                  } else {
                    console.log('제목 입력란(#txt_sj)을 찾을 수 없음');
                  }
                  
                  if (cn) {
                    cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
                    console.log('내용 입력:', cn.value);
                  } else {
                    console.log('내용 입력란(#txt_cn)을 찾을 수 없음');
                  }
                  
                  if (captcha) {
                    captcha.focus();
                    console.log('캡차 입력란에 포커스');
                  } else {
                    console.log('캡차 입력란(#catpchaAnswer)을 찾을 수 없음');
                  }
                  
                  // 상태 표시 박스 생성
                  const statusBox = document.createElement('div');
                  statusBox.style.cssText = \`
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: \${agree ? '#4caf50' : '#f44336'};
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  \`;
                  statusBox.innerHTML = \`
                    <div>\${agree ? '✅ 찬성 의견' : '❌ 반대 의견'} 자동 입력됨</div>
                    <div style="font-size: 12px; margin-top: 5px;">캡차를 입력하고 등록하세요</div>
                    <button onclick="this.parentElement.remove()" style="margin-top: 8px; padding: 4px 8px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>
                  \`;
                  document.body.appendChild(statusBox);
                }

                // 페이지 로딩 대기
                let attempts = 0;
                const waitForElements = () => {
                  attempts++;
                  const sj = document.querySelector('#txt_sj');
                  const cn = document.querySelector('#txt_cn');
                  
                  console.log(\`시도 \${attempts}: 제목 입력란 \${sj ? '발견' : '없음'}, 내용 입력란 \${cn ? '발견' : '없음'}\`);
                  
                  if (sj && cn) {
                    fillForm();
                  } else if (attempts < 20) {
                    setTimeout(waitForElements, 500);
                  } else {
                    console.log('입력란을 찾을 수 없습니다. 수동으로 입력해주세요.');
                  }
                };

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', waitForElements);
                } else {
                  waitForElements();
                }
              })();
            `;
            
            win.document.head.appendChild(script);
            console.log('스크립트 주입 완료');
          } else {
            console.log('새 창 접근 실패 - CORS 제한일 수 있음');
          }
        } catch (e) {
          console.log('스크립트 주입 실패:', e.message);
        }
      }, 2000);
      
      const checkClosed = setInterval(() => {
        if (win.closed) {
          clearInterval(checkClosed);
          currentIndex++;
          setTimeout(openNext, 1000); // 1초 대기 후 다음 진행
        }
      }, 500);
    };

    document.body.appendChild(statusDiv);
    openNext();
  };

  console.log('스크립트 설정 완료. 우측 상단의 패널을 확인하세요.');
})();
