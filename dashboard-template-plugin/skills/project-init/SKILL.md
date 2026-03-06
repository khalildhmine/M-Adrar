---
name: project-init
description: >
  This skill should be used when the user asks to "initialize project",
  "create domain glossary", "generate project overview", "set up domain documents",
  "init-project", or when docs/domain/glossary.md or docs/domain/project.md
  is missing. Creates domain terminology glossary and project overview documents
  through an interview-based workflow.
version: 0.1.0
---

# Project Init Skill

## 트리거 조건

다음 중 하나라도 해당되면 이 스킬 실행을 제안한다:
- `docs/domain/glossary.md`가 존재하지 않음
- `docs/domain/project.md`가 존재하지 않음
- 사용자가 `/init-project` 커맨드를 실행

## 워크플로우

### Phase 1: 프로젝트 개관 수집

사용자에게 다음을 순차적으로 질문한다 (한 번에 하나씩):

1. **서비스 한 줄 요약** — 이 프로젝트는 무엇인가?
2. **타겟 사용자** — 누가 사용하는가?
3. **핵심 가치** — 사용자에게 제공하는 핵심 가치 3가지
4. **주요 액터** — 시스템에서 구분되는 사용자 역할 (예: 관리자, 일반 사용자, 게스트)
5. **핵심 도메인** — 주요 비즈니스 도메인 영역 (예: 주문, 결제, 배송)
6. **MVP 범위** — 첫 출시에 포함되는 기능과 제외되는 기능

### Phase 2: 도메인 용어 수집

Phase 1에서 파악된 도메인을 기반으로:

1. 각 도메인 영역별 **핵심 용어**를 사용자에게 확인
2. 한글 용어 + 영문 대응 + DB 테이블/컬럼명 매핑을 수집
3. 카테고리 분류: 액터, 핵심 도메인, (해당 시) 주문/결제, 배송, 사용자 퍼널, 인증, 관리자 대시보드, 다국어, 기술 용어

### Phase 3: 문서 생성

`references/project-template.md`와 `references/glossary-template.md`를 기반으로:

1. `docs/domain/project.md` 생성
2. `docs/domain/glossary.md` 생성
3. 생성된 문서를 사용자에게 보여주고 수정 사항 반영

### Phase 4: 연동 확인

1. `docs/architecture/development-rules.md`에 도메인 문서 참조 추가 여부 확인
2. 커밋 제안

## 에이전트 연동

fullstack-dev 에이전트는 코드 작업 시 `docs/domain/glossary.md`를 참조하여:
- 변수명, 함수명, 테이블명에 용어집 용어를 일관되게 사용
- 새로운 도메인 용어 발견 시 glossary.md 업데이트 제안
