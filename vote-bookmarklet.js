(() => {
  // 1. 오늘 마감된 span을 모두 찾고
  const todayRows = [...document.querySelectorAll('tr')].filter(tr =>
    tr.querySelector('span.red')?.textContent.includes('오늘 마감')
  );

  if (!todayRows.length) return alert('오늘 마감된 법안이 없습니다.');

  const links = [];

  // 2. 각 tr에서 '바로입력탭' 링크 추출
  todayRows.forEach(tr => {
    const voteLink = tr.querySelector('a[href*="forInsert.do"]');
    if (!voteLink) return;

    const wrapper = document.createElement('div');
    wrapper.style.margin = '4px 0';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '6px';

    const agreeBtn = document.createElement('button');
    agreeBtn.textContent = '찬성';
    agreeBtn.style.background = '#2e7d32';
    agreeBtn.style.color = 'white';
    agreeBtn.onclick = () => voteLink.dataset.vote = 'agree';

    const disagreeBtn = document.createElement('button');
    disagreeBtn.textContent = '반대';
    disagreeBtn.style.background = '#c62828';
    disagreeBtn.style.color = 'white';
    disagreeBtn.onclick = () => voteLink.dataset.vote = 'disagree';

    voteLink.textContent = voteLink.textContent || '[투표 링크]';
    wrapper.appendChild(voteLink.cloneNode(true)); // 표시용 링크
    wrapper.appendChild(agreeBtn);
    wrapper.appendChild(disagreeBtn);

    tr.parentNode.insertBefore(wrapper, tr.nextSibling);

    links.push(voteLink);
  });

  // 3. 시작 버튼
  const startBtn = document.createElement('button');
  startBtn.textContent = '선택한 링크 순차 실행';
  Object.assign(startBtn.style, {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 9999,
    padding: '10px',
    background: '#333',
    color: '#fff'
  });

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
      }, 500);
    };
    openNext();
  };

  document.body.appendChild(startBtn);
})();
