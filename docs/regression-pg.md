# PostgreSQL 全链路回归指南 (V0.2)

> 当前开发机未安装 PostgreSQL 二进制（`psql/initdb/postgres` 均不在 PATH，
> Homebrew/usr/local 下也没有）。本指南给出可复现的完整回归步骤；仓库内的
> SQL 已通过类型检查与代码评审（join 查询、`array_position` 排序、
> `participant_roles` JSONB、territories 均已在 `db/schema.sql` 对齐）。

## 1. 准备

```bash
# 任选其一：安装本地 PG（macOS）
brew install postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
# 或使用 Docker
docker run -d --name aghm-pg -p 5433:5432 -e POSTGRES_PASSWORD=postgres postgres:16
```

## 2. 建库 + 建表 + 灌数据

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5433/aghm"
createdb "$DATABASE_URL" || true
npm run seed:db -- --schema     # 应用 db/schema.sql 并 upsert 149 实体
npm run validate:seed           # 种子完整性（与模式无关，仍应通过）
```

## 3. 启动应用并全链路回归

```bash
DATABASE_URL="$DATABASE_URL" npm run build
DATABASE_URL="$DATABASE_URL" npx next start -p 3000
```

然后逐项核对（与 seed 模式输出逐字段一致）：

```bash
# 1) 页面
for p in / /map /people /chat /events/e-751-talas; do curl -s -o /dev/null -w "$p %{http_code}\n" "http://localhost:3000$p"; done
# 2) 列表 API（数量一致：events=49, people=25, civs=12, locations=20, relationships=40, territories=11）
curl -s http://localhost:3000/api/events | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('events:',JSON.parse(d).length))"
curl -s http://localhost:3000/api/territories?year=751 | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('territories@751:',JSON.parse(d).map(t=>t.name).join(',')))"
# 3) 联表消费：参与人姓名 + 角色（order 与 participants 数组一致）
curl -s http://localhost:3000/api/events/e-755-anlushan | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log('participants:',j.participants.join(','));console.log('names:',j.participantsNames.join(','));console.log('roles:',JSON.stringify(j.participantRoles))})"
# 4) 过滤：personId / locationId / 年份 / 文明
curl -s "http://localhost:3000/api/events?personId=p-li-bai"
curl -s "http://localhost:3000/api/events?locationId=loc-talas"
# 5) AI 上下文链路（与 seed 模式回答一致）
curl -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Why does this event matter?"}],"context":{"year":751,"eventId":"e-751-talas"}}'
# 6) 三条 Demo 链路（同 README）
```

## 4. 通过标准

- 第 3 节所有 URL 返回 200，API 数量与 seed 模式一致
- `participantRoles` 与 `participantsNames` 与 seed 模式一致（含 `instigator/witness`）
- chat 的 links/actions 与 seed 模式一致
- 无 500 / 无 console error（`grep -i error` 服务日志为空）

## 5. 已知差异（预期内）

| 项 | seed 模式 | PG 模式 |
|---|---|---|
| `participantsNames` 顺序 | 种子数组顺序 | 同（`array_position` 对齐） |
| `participantRoles` | 种子默认 | 来自 `events_people.role` |
| territories | 内存种子 | 同一张 `territories` 表 |
