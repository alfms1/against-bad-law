(() => {
  const voteParam = new URLSearchParams(location.search).get("vote");
  const agree = voteParam === "agree";
  const isValid = voteParam === "agree" || voteParam === "disagree";
  if (!isValid) return;

  function fillForm() {
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    const input = document.querySelector('#catpchaAnswer');
    if (sj) sj.value = agree ? '찬성합니다' : '반대합니다';
    if (cn) cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
    if (input) input.focus();
  }

  function createButtons() {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'fixed',
      top: '80px',
      left: '10px',
      zIndex: 9999,
      display: 'flex',
      gap: '10px',
    });

    const btn = document.createElement('button');
    btn.textContent = agree ? '찬성 자동입력됨' : '반대 자동입력됨';
    btn.style.padding = '8px 12px';
    btn.style.backgroundColor = agree ? '#2e7d32' : '#c62828';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.fontWeight = 'bold';

    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      fillForm();
      createButtons();
    }, 500);
  });
})();


