// ==UserScript==

// @name         Vote Assistant

// @namespace    https://vforkorea.com/

// @version      1.0.2

// @description  찬반 버튼

// @match        https://vforkorea.com/assem/

// @match        https://pal.assembly.go.kr/napal/lgsltpa/lgsltpaOpn/*

// @grant        none

// ==/UserScript==



(() => {

  const STYLE = {

    green: '#2e7d32',

    red: '#c62828',

    gray: '#999',

    black: '#000'

  };



  const STORAGE = {

    keyPos: 'voteBtnPos',

    keyAuto: 'autoOpposeEnabled',

    getPos() {

      try {

        return JSON.parse(localStorage.getItem(this.keyPos)) || { left: 20, top: 100 };

      } catch {

        return { left: 20, top: 100 };

      }

    },

    setPos(pos) {

      localStorage.setItem(this.keyPos, JSON.stringify(pos));

    },

    isAutoEnabled() {

      return localStorage.getItem(this.keyAuto) === '1';

    },

    setAutoEnabled(val) {

      localStorage.setItem(this.keyAuto, val ? '1' : '0');

    }

  };



  const PAGE = {

    isVforKorea: location.hostname.includes('vforkorea.com'),

    isInsert: location.pathname.includes('forInsert.do'),

    isUpdate: location.pathname.includes('forUpdate.do'),

    getVoteParam() {

      return new URLSearchParams(location.search).get('vote') || 'agree';

    },

    needAuto() {

      return this.isInsert && STORAGE.isAutoEnabled() && ['agree', 'disagree'].includes(this.getVoteParam());

    }

  };



  function findVoteFromElement(element) {

    let el = element;



    while (el && el !== document.body) {

      if (el.matches?.("p.comment.Y")) return "agree";

      if (el.matches?.("p.comment.N")) return "disagree";



      const y = el.querySelector?.("p.comment.Y");

      const n = el.querySelector?.("p.comment.N");

      if (y) return "agree";

      if (n) return "disagree";



      const siblings = el.parentElement?.children || [];

      for (const sib of siblings) {

        if (sib.matches?.("p.comment.Y")) return "agree";

        if (sib.matches?.("p.comment.N")) return "disagree";

      }



      el = el.parentElement;

    }

    return null;

  }



  function updateVoteLink(link) {

    const vote = findVoteFromElement(link);

    if (!vote) return;



    const url = new URL(link.href, location.origin);

    if (url.searchParams.get("vote") !== vote) {

      url.searchParams.set("vote", vote);

      link.href = url.toString();

    }

  }



  function updateAllVoteLinks() {

    document.querySelectorAll("a[href*='forInsert.do']").forEach(updateVoteLink);

  }



  function observeVoteLinks() {

    updateAllVoteLinks();



    const observer = new MutationObserver(mutations => {

      for (const m of mutations) {

        if (m.type === 'childList') {

          m.addedNodes.forEach(node => {

            if (node.nodeType === 1) {

              node.querySelectorAll?.("a[href*='forInsert.do']").forEach(updateVoteLink);

            }

          });

        } else if (m.type === 'attributes' && m.target.matches("a[href*='forInsert.do']")) {

          updateVoteLink(m.target);

        }

      }

    });



    observer.observe(document.body, {

      childList: true,

      subtree: true,

      attributes: true,

      attributeFilter: ['href']

    });



    let retryCount = 0;

    const interval = setInterval(() => {

      updateAllVoteLinks();

      if (++retryCount >= 10) clearInterval(interval);

    }, 2000);

  }



  function waitForElements(selectors, callback) {

    const ready = () => selectors.every(sel => document.querySelector(sel));

    if (ready()) return callback();



    const observer = new MutationObserver(() => {

      if (ready()) {

        observer.disconnect();

        callback();

      }

    });

    observer.observe(document.body, { childList: true, subtree: true });

  }



  function setHeight(selector, px) {

    const el = document.querySelector(selector);

    if (el) el.style.height = `${px}px`;

  }



  function scrollTo(selector, offset = 0) {

    const el = document.querySelector(selector);

    if (el) {

      const top = el.getBoundingClientRect().top + scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });

    }

  }



  function fillForm(agree, focus = true) {

    const sj = document.querySelector('#txt_sj');

    const cn = document.querySelector('#txt_cn');

    const input = document.querySelector('#catpchaAnswer');

    if (sj) sj.value = agree ? '찬성합니다' : '반대합니다';

    if (cn) cn.value = agree ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';

    if (input && focus) input.focus();

    updateButtonColors(agree);

  }



  let yesBtn, noBtn;



  function updateButtonColors(state) {

    if (!yesBtn || !noBtn) return;

    yesBtn.style.backgroundColor = state === true ? STYLE.green : STYLE.gray;

    noBtn.style.backgroundColor = state === false ? STYLE.red : STYLE.gray;

  }



  function updateButtonsFromInput() {

    const val = document.querySelector('#txt_sj')?.value.trim();

    if (val?.includes('찬성')) updateButtonColors(true);

    else if (val?.includes('반대')) updateButtonColors(false);

    else updateButtonColors(null);

  }



  function setupCaptchaSubmit() {

    const input = document.querySelector('#catpchaAnswer');

    const submit = document.querySelector('#btn_opnReg');

    if (!input || !submit) return;

    input.addEventListener('input', () => {

      if (/^\d{5}$/.test(input.value.trim())) submit.click();

    });

  }



  function createPanel() {

    const pos = STORAGE.getPos();

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



    const autoBtn = createButton('자동', STORAGE.isAutoEnabled() ? STYLE.black : STYLE.gray);

    yesBtn = createButton('찬성', STYLE.gray);

    noBtn = createButton('반대', STYLE.gray);



    autoBtn.addEventListener('click', () => {

      const next = !STORAGE.isAutoEnabled();

      STORAGE.setAutoEnabled(next);

      autoBtn.style.backgroundColor = next ? STYLE.black : STYLE.gray;

    });



    yesBtn.addEventListener('click', () => fillForm(true, true));

    noBtn.addEventListener('click', () => fillForm(false, true));



    panel.append(autoBtn, yesBtn, noBtn);

    document.body.appendChild(panel);

    initDrag(panel);

  }



  function createButton(text, bg) {

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

  }



  function initDrag(target) {

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

      STORAGE.setPos({ left: x, top: y });

      e.preventDefault();

    }, { passive: false });



    target.addEventListener('touchend', () => dragging = false);

  }



  if (PAGE.isVforKorea) {

    observeVoteLinks();

  } else if (PAGE.isInsert) {

    waitForElements(['#txt_sj', '#txt_cn', '#catpchaAnswer'], () => {

      if (PAGE.needAuto()) {

        const agree = PAGE.getVoteParam() === 'agree';

        const sj = document.querySelector('#txt_sj');

        const cn = document.querySelector('#txt_cn');

        const empty = !sj?.value.trim() && !cn?.value.trim();

        if (empty) fillForm(agree, false);

      }

      setHeight('#txt_cn', 36);

      scrollTo('#txt_sj', 60);

      createPanel();

      updateButtonsFromInput();

      setupCaptchaSubmit();

    });

  } else if (PAGE.isUpdate) {

    waitForElements(['#txt_sj', '#txt_cn'], () => {

      setHeight('#txt_cn', 36);

      scrollTo('#txt_sj', 60);

      createPanel();

      updateButtonsFromInput();

    });

  }

})();

