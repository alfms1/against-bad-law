(() => {
  // 1. 오늘 마감된 항목 찾기 (span.red → a 링크)
  const todaySpans = [...document.querySelectorAll('span.red')]
    .filter(span => span.textContent.includes('오늘 마감'));

  const links = todaySpans
    .map(span => span.closest('a'))
    .filter(a => a && a.href);

  if (!links.length) return alert('오늘 마감된 법안이 없습니다.');

  // 2. 찬반 버튼 생성 및 링크 옆에 배치
  links.forEach(link => {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '4px 0';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '6px';
    wrapper.style.alignItems = 'center';

    const clonedLink = link.cloneNode(true); // 링크 복제 (버튼 안 깨지게)
    const agreeBtn = document.createElement('button');
    agreeBtn.textContent = '찬성';
    agreeBtn.style.background = '#2e7d32';
    agreeBtn.style.color = 'white';
    agreeBtn.style.padding = '4px 8px';
    agreeBtn.onclick = () => link.dataset.vote = 'agree';

    const disagreeBtn = document.createElement('button');
    disagreeBtn.textContent = '반대';
    disagreeBtn.style.background = '#c62828';
    disagreeBtn.style.color = 'white';
    disagreeBtn.style.padding = '4px 8px';
    disagreeBtn.onclick = () => link.dataset.vote = 'disagree';

    link.style.display = 'none'; // 기존 링크는 숨김
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(clonedLink);
    wrapper.appendChild(agreeBtn);
    wrapper.appendChild(disagreeBtn);
  });

  // 3. 실행 버튼
  const startBtn = document.createElement('button');
  startBtn.textContent = '선택한 링크 순차 실행';
  startBtn.style.position = 'fixed';
  startBtn.style.bottom = '20px';
  startBtn.style.left = '20px';
  startBtn.style.zIndex = 9999;
  startBtn.style.padding = '10px';
  startBtn.style.background = '#333';
  startBtn.style.color = '#fff';
  startBtn.style.border = 'none';
  startBtn.style.borderRadius = '6px';

  startBtn.onclick = () => {
    const selected = links.filter(a => a.dataset.vote);
    if (!selected.length) return alert('선택된 항목이 없습니다.');

    let index = 0;

    const openNext = () => {
      const a = selected[index];
      const href = a.href + `?vote=${a.dataset.vote}`;
      const win = window.open(href, '_blank');

      const checkClosed = setInterval(() => {
        if (win.closed) {
          clearInterval(checkClosed);
          index++;
          if (index < selected.length) openNext();
        }
      }, 800); // 약간의 딜레이도 포함
    };

    openNext();
  };

  document.body.appendChild(startBtn);
})();

