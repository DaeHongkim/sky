# LOTTE-style One-page Site (scaffold)

롯데그룹 홈페이지(lotte.co.kr) 메인 페이지 구조를 참고해 만든 **순수 HTML/CSS/JS** 원페이지 데모입니다.
이 폴더는 저장소 루트의 Next.js 앱(`sky`)과는 완전히 독립된 정적 사이트이며, 빌드 없이 바로 브라우저로 열거나
아무 정적 서버로 서빙하면 됩니다.

## 실행 방법

```bash
cd lotte-onepage
python3 -m http.server 8080
# http://localhost:8080 접속
```

(`index.html`을 파일로 그냥 더블클릭해서 열어도 대부분 동작하지만, `fetch`/모듈 관련 이슈를 피하려면 로컬 서버 사용을 권장합니다.)

## 폴더 구조

```
lotte-onepage/
├─ index.html          전체 마크업 (헤더, 도트 내비, GNB 오버레이, 8개 섹션, 푸터)
├─ css/style.css        전체 스타일 + 반응형(1200 / 768px 브레이크포인트)
├─ js/main.js           햄버거 메뉴, 도트 내비 활성화, IntersectionObserver 페이드인/켄번즈, 언어선택, LOTTE Family 셀렉트
├─ assets/
│  ├─ images/           배경/카드 플레이스홀더 JPG (Pillow로 자동 생성됨, 아래 참고)
│  ├─ videos/           hero-bg.mp4 / csv-bg.mp4 / about-bg.mp4 자리만 잡아둔 폴더 (실제 영상 파일 없음 → poster 이미지로 자동 대체됨)
│  ├─ icons/logo.svg    원형 레드 배지 로고
│  └─ gen_placeholders.py  플레이스홀더 이미지를 재생성하는 1회성 스크립트 (`pip install pillow` 후 `python3 assets/gen_placeholders.py`)
└─ README.md
```

## ⚠️ 실사용 전 반드시 교체해야 하는 것

1. **모든 이미지/영상** — `assets/images/*.jpg`, `assets/videos/*.mp4`는 전부 자동 생성된 단색 플레이스홀더입니다.
   기획서 4장 "이미지/미디어 에셋 리스트"의 "내용 요약"에 맞는 실제 촬영본 또는 라이선스가 확보된 스톡 이미지로 교체하세요.
   **롯데 원본 사진/영상을 그대로 사용하지 마세요.**
2. **브랜드 컬러** — `css/style.css`의 `--red: #e4032e;`는 추정값입니다. 실제 로고 파일에서 컬러피커로 정확한 값을 뽑아 교체하세요.
3. **아이콘 세트** — `index.html` 상단 `<svg style="display:none">` 안의 심볼들은 자리만 잡아둔 모노라인 아이콘입니다. 브랜드 아이콘 세트로 교체하세요.
4. **웹접근성 인증마크** — 푸터의 `.accessibility-badge`는 실제 인증기관 마크가 아닌 텍스트 플레이스홀더입니다. 실제 인증을 받은 경우 공식 배지 이미지로 교체하세요.
5. **링크** — GNB 서브메뉴, 링크 로우, LOTTE Family 셀렉트는 전부 `#` 더미 링크입니다. 실제 페이지/계열사 URL로 교체하세요.
6. **언어 선택 / LOTTE Family "이동"** — 현재는 실제 페이지 이동 없이 상태 표시만 하는 데모 동작입니다(`js/main.js`). 다국어 라우팅 및 계열사 사이트 연결 로직으로 교체하세요.

## 참고

- 원본 사이트: https://www.lotte.co.kr (분석 기준일: 2026-09-03)
- 실제 서비스 오픈 전 반드시 롯데 측 실제 사진/영상이 아닌 자체 소유 또는 라이선스가 확보된 이미지로 전량 교체하세요.
