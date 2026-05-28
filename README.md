# 캠핑 일지 웹 서비스

캠핑 날짜, 장소, 주소, 메모, 해시태그, 사진, 동영상을 기록하고 공개 조회할 수 있는 풀스택 웹 서비스입니다. 열람은 누구나 가능하고, 작성/수정/삭제와 미디어 관리는 로그인한 사용자만 가능합니다. 비밀글은 작성자 본인에게만 노출됩니다.

## 아키텍처

```text
camp/
  frontend/        React + TypeScript SPA, Axios, Tailwind CSS, Nginx 정적 서빙
  backend/         Node.js + TypeScript + Fastify REST API
  schema.sql       MySQL 8 초기 스키마
  docker-compose.yml
```

Backend는 MySQL에 사용자/일지/미디어 메타데이터를 저장하고, Redis에 로그인 세션을 저장합니다. 업로드된 사진과 동영상 파일은 Backend 로컬 파일 시스템의 `UPLOAD_DIR`에 저장됩니다.

## Frontend 실행

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. API 서버 주소는 `API_BASE_URL`로 지정합니다.

## Backend 실행

MySQL과 Redis를 먼저 실행하고 `schema.sql`을 적용한 뒤 Backend를 실행합니다.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

기본 API 주소는 `http://localhost:8080`입니다. 헬스 체크는 `GET /health`입니다.

## Docker Compose

Compose는 `frontend`, `backend`, `mysql`, `redis`를 함께 실행합니다.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d --build
docker compose down
docker compose down -v
```

로컬 포트:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

Compose 초기 실행 시 `schema.sql`이 MySQL 컨테이너에 자동 적용됩니다. MySQL 데이터는 `mysql_data`, 업로드 파일은 `backend_uploads`, Redis 데이터는 `redis_data` volume에 유지됩니다.

## MySQL 스키마 초기화

직접 초기화하거나 누락된 테이블을 보강할 때는 MySQL 8 데이터베이스에 루트의 `schema.sql` 하나만 적용합니다. 모든 `CREATE TABLE` 문은 `IF NOT EXISTS`를 사용하므로, 이미 존재하는 테이블은 유지되고 없는 테이블만 생성됩니다.

```bash
mysql -h localhost -P 3306 -u camp_user_id -p camp_db_name < schema.sql
```

스키마에는 `users`, `journals`, `journal_media`, `journal_hashtags` 테이블이 포함됩니다. `journals.is_private`가 `1`인 비밀글은 작성자 본인에게만 목록/상세/미디어가 노출됩니다.
이미 생성된 DB에는 `CREATE TABLE IF NOT EXISTS`가 기존 테이블 구조를 바꾸지 않으므로, 기존 데이터를 유지한 채 배포할 때는 백업 후 운영 절차에 맞게 `journals.is_private` 컬럼과 `idx_journals_visibility` 인덱스를 반영하세요.

## 기본 테스트 계정 생성

비밀번호는 bcrypt로 해시되어 저장됩니다.

로컬 실행:

```bash
cd backend
npm run create-user -- admin camp1234 "캠핑 관리자"
```

Compose 실행 후:

```bash
docker compose exec backend node dist/scripts/createUser.js admin camp1234 "캠핑 관리자"
```

## 주요 API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/journals`
- `GET /api/journals/:id`
- `POST /api/journals`
- `PUT /api/journals/:id`
- `DELETE /api/journals/:id`
- `POST /api/journals/:id/media`
- `DELETE /api/journals/:id/media/:mediaId`
- `GET /uploads/:fileName`

일지 생성/수정 요청에는 `hashtags: string[]`, `isPrivate: boolean`을 포함할 수 있습니다. 응답의 일지 객체에도 `hashtags`, `isPrivate`가 포함되며, 목록 화면에서 표시됩니다.

에러 응답은 `{ "message": "...", "code": "..." }` 형식입니다.

## 파일 업로드

허용 MIME 타입:

- `image/jpeg`
- `image/png`
- `image/webp`
- `video/mp4`
- `video/webm`
- `video/quicktime`

크기 제한:

- 이미지: 50MB
- 동영상: 200MB

운영 컨테이너 기준 저장 위치는 `/app/uploads`입니다. Docker Compose에서는 `backend_uploads` volume이 이 경로에 마운트됩니다.

## 환경 변수

Frontend:

```text
API_BASE_URL=http://localhost:8080
SITE_URL=http://localhost:3000
```

Frontend Docker 이미지는 컨테이너 시작 시 `API_BASE_URL` 환경 변수를 읽어 `/env.js`를 생성합니다. React 앱은 이 런타임 설정을 우선 사용합니다.
`SITE_URL`이 설정되어 있으면 `og:url`, `og:image`, `twitter:image`를 배포 도메인 기준 절대 URL로 바꿉니다. 카카오톡 공유 미리보기에 `camping-banner.png`를 안정적으로 표시하려면 운영 Frontend 주소를 `SITE_URL`에 지정하세요.

Backend:

```text
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=camp_db_name
DB_USER=camp_user_id
DB_PASSWORD=camp_password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
UPLOAD_DIR=./uploads
PUBLIC_UPLOAD_BASE_URL=http://localhost:8080/uploads
CORS_ORIGIN=http://localhost:3000
AUTH_COOKIE_NAME=session_name
AUTH_COOKIE_SECURE=false
AUTH_SESSION_TTL_SECONDS=28800
AUTH_SESSION_SECRET=change-this-local-session-secret-at-least-32-chars
```

## 운영 배포 주의사항

- `AUTH_SESSION_SECRET`, DB 비밀번호, Redis 비밀번호는 운영 Secret으로 교체하세요.
- HTTPS 환경에서는 `AUTH_COOKIE_SECURE=true`를 사용하세요.
- Frontend 컨테이너의 `API_BASE_URL`은 런타임 환경 변수로 주입하세요.
- 카카오톡 공유 이미지를 위해 Frontend 컨테이너의 `SITE_URL`은 `https://...` 형식의 운영 주소로 주입하세요.
- 업로드 저장소는 백업과 용량 모니터링 대상입니다.
- MySQL은 운영 백업과 권한 분리를 별도로 구성하세요.
