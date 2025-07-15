// ==UserScript==
// @name         Vote Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  찬성/반대 버튼
// @match        https://pal.asseㄱmbly.go.kr/napal/lgsltpa/lgsltpaOpn/*
// @grant        none
// ==/UserScript==

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'voteFormButtonPosition';
  const BUTTON_SIZE = 48;
  const BUTTON_SPACING = 16;
  const DEFAULT_POSITION = { left: 20, top: 100 };

  const { left, top } = loadPosition();
  const container = createContainer(left, top);
  const approveBtn = createButton('찬성', '#2e7d32');
  const rejectBtn = createButton('반대', '#c62828');

  container.append(approveBtn, rejectBtn);
  document.body.appendChild(container);

  approveBtn.addEventListener('click', () => submitVote(true));
  rejectBtn.addEventListener('click', () => submitVote(false));

  initDrag(container);
  watchCaptcha();
  scrollTo('#txt_sj', 60);
  adjustHeight('#txt_cn', 36);

  function createContainer(x, y) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      display: 'flex',
      gap: `${BUTTON_SPACING}px`,
      zIndex: 9999,
      touchAction: 'none'
    });
    return el;
  }

  function createButton(label, color) {
    const btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      width: `${BUTTON_SIZE}px`,
      height: `${BUTTON_SIZE}px`,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: color,
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '14px',
      touchAction: 'none'
    });
    return btn;
  }

  function submitVote(isApprove) {
    const sj = document.querySelector('#txt_sj');
    const cn = document.querySelector('#txt_cn');
    const input = document.querySelector('#catpchaAnswer');
    if (!sj || !cn) return;
    sj.value = isApprove ? '찬성합니다' : '반대합니다';
    cn.value = isApprove ? '이 법률안을 찬성합니다.' : '이 법률안을 반대합니다.';
    if (input) input.focus();
  }

  function watchCaptcha() {
    const input = document.querySelector('#catpchaAnswer');
    const submit = document.querySelector('#btn_opnReg');
    if (!input || !submit) return;
    const handler = () => {
      const value = input.value.trim();
      if (/^\d{5}$/.test(value)) {
        submit.click();
        input.removeEventListener('input', handler);
      }
    };
    input.addEventListener('input', handler);
  }

  function scrollTo(selector, offset = 0) {
    const el = document.querySelector(selector);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function adjustHeight(selector, height) {
    const el = document.querySelector(selector);
    if (el) el.style.height = `${height}px`;
  }

  function initDrag(target) {
    let startX, startY, originX, originY, dragging;
    target.addEventListener('touchstart', e => {
      const t = e.touches[0], r = target.getBoundingClientRect();
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
      const x = clamp(originX + dx, 0, window.innerWidth - target.offsetWidth);
      const y = clamp(originY + dy, 0, window.innerHeight - target.offsetHeight);
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
      savePosition(x, y);
      e.preventDefault();
    }, { passive: false });

    target.addEventListener('touchend', () => dragging = false);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function savePosition(left, top) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, top }));
  }

  function loadPosition() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_POSITION;
    } catch {
      return DEFAULT_POSITION;
    }
  }

});

