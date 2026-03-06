import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), "utf8");
}

function exists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

test("Drizzle 계층 파일이 존재해야 한다", () => {
  assert.equal(exists("src/lib/drizzle/env.ts"), true, "env.ts 누락");
  assert.equal(exists("src/lib/drizzle/schema.ts"), true, "schema.ts 누락");
  assert.equal(exists("src/lib/drizzle/client.ts"), true, "client.ts 누락");
  assert.equal(exists("src/lib/drizzle/index.ts"), true, "index.ts 누락");
});

test("Drizzle 스키마에 기존 테이블 정의가 있어야 한다", () => {
  const schema = read("src/lib/drizzle/schema.ts");
  assert.match(schema, /pgTable\(\s*"academies"/, "academies 테이블 정의 누락");
  assert.match(schema, /pgTable\(\s*"academy_members"/, "academy_members 테이블 정의 누락");
  assert.match(schema, /pgTable\(\s*"academy_enrollments"/, "academy_enrollments 테이블 정의 누락");
});

test("Drizzle 클라이언트는 server-only를 import해야 한다", () => {
  const client = read("src/lib/drizzle/client.ts");
  assert.match(client, /import "server-only"/, "server-only import 누락");
});

test("Drizzle 환경변수 파일이 DATABASE_URL을 검증해야 한다", () => {
  const env = read("src/lib/drizzle/env.ts");
  assert.match(env, /DATABASE_URL/, "DATABASE_URL 검증 누락");
});

test("drizzle.config.ts가 존재하고 DIRECT_DATABASE_URL을 사용해야 한다", () => {
  assert.equal(exists("drizzle.config.ts"), true, "drizzle.config.ts 누락");
  const config = read("drizzle.config.ts");
  assert.match(config, /DIRECT_DATABASE_URL/, "DIRECT_DATABASE_URL 사용 누락");
});

test("아키텍처 문서에 Drizzle 규칙이 반영되어야 한다", () => {
  const devRules = read("docs/architecture/development-rules.md");
  assert.match(devRules, /Drizzle ORM/, "development-rules.md에 Drizzle 언급 누락");

  const bestCase = read("docs/architecture/nextjs-best-case-rules.md");
  assert.match(bestCase, /Drizzle/, "nextjs-best-case-rules.md에 Drizzle 언급 누락");
  assert.match(bestCase, /DATA-003/, "DATA-003 섹션 누락");

  const structure = read("docs/architecture/current-implemented-structure.md");
  assert.match(structure, /Drizzle ORM 보조 계층/, "current-implemented-structure.md에 Drizzle 섹션 누락");
});

test(".env.example에 DATABASE_URL이 있어야 한다", () => {
  const envExample = read(".env.example");
  assert.match(envExample, /DATABASE_URL/, "DATABASE_URL 누락");
  assert.match(envExample, /DIRECT_DATABASE_URL/, "DIRECT_DATABASE_URL 누락");
});
