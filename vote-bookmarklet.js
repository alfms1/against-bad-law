(function() {
  const links = [...document.querySelectorAll('a[href*="forInsert.do"]')];
  if (!links.length) return alert("🔍 투표 가능한 법안 링크가 없습니다.");

  const vote = prompt("찬성 또는 반대 중 선택하세요 (agree/disagree)", "agree");
  if (!vote || !["agree", "disagree"].includes(vote)) return alert("❌ 입력 오류 또는 취소됨");

  const urls = links.map(link => {
    const url = new URL(link.href, location.origin);
    url.searchParams.set("vote", vote);
    return url.href;
  });

  let index = 0;
  const openNext = () => {
    if (index >= urls.length) return alert("✅ 모든 법안 열기 완료!");
    window.open(urls[index++], "_blank");
    setTimeout(openNext, 3000);  // 3초 간격
  };

  alert(`📬 ${urls.length}개의 법안 링크를 ${vote === 'agree' ? '찬성' : '반대'}로 엽니다`);
  openNext();
})();

