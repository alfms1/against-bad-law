(() => {
  const STYLE = {
    green: '#2e7d32',
    red: '#c62828',
    gray: '#999',
    black: '#000'
  };

  const STORAGE_KEY = 'voteBtnPos';

  const getPos = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { left: 20, top: 100 };
    } catch {
      return { left: 20, top: 100 };
    }
  };

  const setPos = (pos) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  };

  const waitForElements = (selectors, callback) => {
    const ready = () => selectors.every(sel => document.querySelector(sel));
    if (ready()) return callback();

    const observer = new MutationObserver(() => {
      if (ready()) {
        observer.disconnect();
        callback();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  const createPanel = () => {
    const pos = getPos();

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      position: 'fixed',
      left: `${pos.left}px`,
      top: `${pos.top}px`,
      display: 'flex',
      gap: '8px',
      zIndex: 9999,
      touchAction: 'none'
    });

    const yesBtn = createButton('찬성', STYLE.gray);
    const noBtn = createButton('반대', STYLE.gray);

    yesBtn.addEventListener('click', () => fillForm(true, yesBtn, noBtn));
    noBtn.addEventListener('click', () => fillForm(false, yesBtn, noBtn));

    panel.append(yesBtn, noBtn);
    document.body.appendChild(panel);
    initDrag(panel);
  };

  const createButton = (text, bg) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: bg,
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '14px',
      touchAction: 'none'
    });
    return btn;
  };

  const fillForm = (agree, yesBtn, noBtn) => {
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    const input = document.querySelector('#catpchaAnswer');

    if (sj) sj.value = agree ? '찬성합니다' : '반대합니다';
    if (cn) cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
    if (input) input.focus();

    yesBtn.style.backgroundColor = agree ? STYLE.green : STYLE.gray;
    noBtn.style.backgroundColor = !agree ? STYLE.red : STYLE.gray;
  };

  const initDrag = (target) => {
    let startX, startY, originX, originY, dragging = false;

    target.addEventListener('touchstart', e => {
      const t = e.touches[0];
      const r = target.getBoundingClientRect();
      startX = t.clientX;
      startY = t.clientY;
      originX = r.left;
      originY = r.top;
      dragging = true;
    }, { passive: false });

    target.addEventListener('touchmove', e => {
      if (!dragging) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const x = Math.max(0, Math.min(originX + dx, innerWidth - target.offsetWidth));
      const y = Math.max(0, Math.min(originY + dy, innerHeight - target.offsetHeight));
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
      setPos({ left: x, top: y });
      e.preventDefault();
    }, { passive: false });

    target.addEventListener('touchend', () => dragging = false);
  };

  waitForElements(['#txt_sj', '#txt_cn'], createPanel);
})();


