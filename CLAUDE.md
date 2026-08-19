@AGENTS.md

## Design Systems (3 hệ thống song song — đọc trước khi dùng skill UI)

Project này có **3 hệ thống CSS/design độc lập, không tương thích lẫn nhau**. Trước khi sửa UI hoặc dùng bất kỳ skill thiết kế nào (`frontend-design`, `ui-styling`, `ui-ux-pro-max`, `design`...), xác định file đang sửa thuộc hàng nào rồi chỉ dùng đúng pattern/token của hàng đó:

| Khu vực / route | Hệ thống | File style | Token/class đại diện |
|---|---|---|---|
| `/`, `/invite/[token]` (`vanilla-birthday-experience.tsx` + `vanilla-birthday-runtime.js`) | **Vanilla CSS trong Shadow DOM** | `public/birthday-card/style.css` | `--ink`, `--berry`, `--pink`, `--peach`, `--cream`, `--paper`, `--shadow`; class kiểu `.enter-button`, `.guest-form`, `.delivery__content`, `.field--wide` |
| `/wishes` (`vanilla-wishes-experience.tsx` + `vanilla-wishes-runtime.js`) | **Vanilla CSS trong Shadow DOM** (Shadow root riêng) | file CSS tương ứng nạp trong Shadow root của runtime đó | tương tự trên; class Tailwind như `bg-[#071321]` chỉ áp cho `<div>` host bên ngoài, không lọt vào bên trong |
| `/register`, `/journey`, `/permission` và các `flow/steps/*`, `primary-button.tsx`, `field-shell.tsx`, `footer-note.tsx` | **Tailwind v4 + theme tokens** | `src/app/globals.css` (`@theme` map `--theme-*` → `--color-*`) | `bg-accent`, `text-fg-muted`, `text-danger`... (không dùng bảng màu Tailwind mặc định như `bg-blue-500`) |
| `register-form.tsx` (bản React cũ, không phải bản đang chạy ở `/`), `birthday-waiting-page.tsx`, `src/components/admin/*` | **CSS Modules** | `birthday-card.module.css`, `birthday-waiting-page.module.css`, `admin/admin.module.css` | `styles.xxx` |

**Luật bắt buộc:**
1. Không bao giờ thêm class Tailwind vào bên trong `MARKUP`/Shadow DOM của `vanilla-*-experience.tsx` — **Tailwind không xuyên được Shadow DOM**, mọi class Tailwind gắn ở đó vô tác dụng. Sửa style cho 2 luồng vanilla chỉ bằng cách sửa trực tiếp file CSS tương ứng (vd `public/birthday-card/style.css`), dùng đúng token/naming đã có — không tự bịa token màu mới.
2. Ở luồng Tailwind (`globals.css`), chỉ dùng token đã khai báo trong `@theme`, không dùng bảng màu Tailwind mặc định — tránh lệch tông với `--theme-primary` và các biến theme khác.
3. Không tự ý cài/khởi tạo shadcn/ui (không có `components.json`, project chưa dùng shadcn) dù skill UI có thể gợi ý mặc định shadcn+Tailwind.
4. Khi một skill thiết kế UI đề xuất màu sắc/spacing/component mẫu cho khu vực thuộc luồng vanilla (`/`, `/wishes`): áp dụng đề xuất đó **thủ công vào đúng file CSS của luồng đó** theo token sẵn có, không copy nguyên class/markup Tailwind hay component shadcn mẫu vào trong Shadow DOM.
5. Sau khi sửa CSS/markup ở luồng vanilla, luôn chạy `next dev` và xem trực tiếp trong trình duyệt trước khi báo hoàn thành — Shadow DOM không thể kiểm chứng chỉ bằng đọc code.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **birthday-web** (420 symbols, 859 relationships, 32 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/birthday-web/context` | Codebase overview, check index freshness |
| `gitnexus://repo/birthday-web/clusters` | All functional areas |
| `gitnexus://repo/birthday-web/processes` | All execution flows |
| `gitnexus://repo/birthday-web/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
