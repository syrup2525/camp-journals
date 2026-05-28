CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(80) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  camping_date DATE NOT NULL,
  place_name VARCHAR(160) NOT NULL,
  address VARCHAR(255) NOT NULL,
  short_memo TEXT NOT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_journals_camping_date (camping_date DESC),
  KEY idx_journals_user_id (user_id),
  KEY idx_journals_visibility (is_private, camping_date DESC, created_at DESC, id DESC),
  CONSTRAINT fk_journals_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  journal_id BIGINT UNSIGNED NOT NULL,
  media_type ENUM('image', 'video') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_journal_media_file_name (file_name),
  KEY idx_journal_media_journal_id (journal_id),
  CONSTRAINT fk_journal_media_journal FOREIGN KEY (journal_id) REFERENCES journals (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journal_hashtags (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  journal_id BIGINT UNSIGNED NOT NULL,
  tag VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_journal_hashtags_journal_tag (journal_id, tag),
  KEY idx_journal_hashtags_tag (tag),
  CONSTRAINT fk_journal_hashtags_journal FOREIGN KEY (journal_id) REFERENCES journals (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
