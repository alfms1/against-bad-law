(() => {
  const links = [...document.querySelectorAll('a')]
    .filter(a => a.textContent.includes('오늘마감'));

  if (!links.length) return alert('오늘 마감된 법안이 없습니다.');

  links.forEach(link => {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '4px 0';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '6px';

    const agreeBtn = document.createElement('button');
    agreeBtn.textContent = '찬성';
    agreeBtn.style.background = '#2e7d32';
    agreeBtn.style.color = 'white';
    agreeBtn.onclick = () => link.dataset.vote = 'agree';

    const disagreeBtn = document.createElement('button');
    disagreeBtn.textContent = '반대';
    disagreeBtn.style.background = '#c62828';
    disagreeBtn.style.color = 'white';
    disagreeBtn.onclick = () => link.dataset.vote = 'disagree';

    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);
    wrapper.appendChild(agreeBtn);
    wrapper.appendChild(disagreeBtn);
  });

  const startBtn = document.createElement('button');
  startBtn.textContent = '선택한 링크 순차 실행';
  startBtn.style.position = 'fixed';
  startBtn.style.bottom = '20px';
  startBtn.style.left = '20px';
  startBtn.style.zIndex = 9999;
  startBtn.style.padding = '10px';
  startBtn.style.background = '#333';
  startBtn.style.color = '#fff';

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
