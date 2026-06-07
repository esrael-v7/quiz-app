CREATE TABLE IF NOT EXISTS sync_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_modified_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sync_records_user ON sync_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_records_modified ON sync_records(last_modified_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON sync_records TO quiz_app_client;
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_records TO quiz_admin_user;
