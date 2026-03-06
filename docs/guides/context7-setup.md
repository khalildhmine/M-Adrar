# Context7 MCP 설정 가이드

## 개요

Context7은 라이브러리의 최신 공식 문서를 실시간으로 조회할 수 있는 MCP 서버다.
Claude Code에서 `use context7` 키워드로 최신 API 문서를 참조하며 개발할 수 있다.

## 설정 방법

### 1. Claude Code MCP 설정

`~/.claude/settings.json`에 다음을 추가한다:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

또는 프로젝트 단위로 `.claude/settings.json`에 설정할 수 있다.

### 2. 사용 방법

Claude Code에서 질문할 때 `use context7`을 포함하면 최신 문서를 참조한다:

```
Next.js 16 App Router에서 dynamic route 사용법 알려줘 use context7
```

### 3. 대상 라이브러리

이 프로젝트에서 주로 조회하는 라이브러리:

| 라이브러리 | 용도 | Context7 ID 예시 |
|-----------|------|-----------------|
| Next.js | App Router, RSC, Route Handler | `vercel/next.js` |
| Supabase | Auth, Postgres, RLS | `supabase/supabase` |
| Drizzle ORM | 타입 안전 SQL 쿼리 빌더 | `drizzle-team/drizzle-orm` |
| TailwindCSS | 유틸리티 CSS | `tailwindlabs/tailwindcss` |
| shadcn/ui | UI 컴포넌트 | `shadcn-ui/ui` |
| React Hook Form | 폼 상태 관리 | `react-hook-form/react-hook-form` |
| Zod | 스키마 검증 | `colinhacks/zod` |

### 4. 활용 팁

- API가 자주 변경되는 Next.js, Supabase는 `use context7`을 습관적으로 사용
- 새로운 라이브러리 도입 시 `resolve-library-id`로 Context7 ID 확인 가능
- 오프라인 환경에서는 동작하지 않으므로 fallback으로 공식 문서 URL을 참조
