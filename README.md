# MFE User

Mora Go의 사용자 계정과 개인 학습 현황 화면을 제공하는 React 마이크로 프런트엔드입니다.

## 구현 내용

- 사용자 정보 조회, 등록 및 탈퇴 화면
- 최근 학습, 저장한 강의와 진행 상태 표시
- User API와 Lesson API를 조합한 사용자 활동 조회
- `mount()` 계약을 통한 Shell 런타임 연결
- 공통 SCSS 토큰과 버전별 ESM 원격 모듈 빌드

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:4102`에서 실행됩니다. `npm run build`는 최신 파일과 패키지 버전별 `remoteEntry.js`를 생성합니다.
