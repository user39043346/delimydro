CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY,
    image_path      VARCHAR(128),
    username        VARCHAR(128) NOT NULL UNIQUE,
    password_hash   VARCHAR(128),
    code            VARCHAR(128) NOT NULL UNIQUE
);
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_code ON users(code);
CREATE INDEX idx_users_up ON users(username, password_hash);


CREATE TABLE IF NOT EXISTS friends (
    payer_id    UUID REFERENCES users(id),
    debtor_id   UUID REFERENCES users(id),
    balance     INTEGER,
    CONSTRAINT pid_did PRIMARY KEY (payer_id, debtor_id)
);
CREATE INDEX idx_friends_id1_id2 ON friends(payer_id, debtor_id);
CREATE INDEX idx_friends_id2 ON friends(debtor_id);


CREATE TABLE IF NOT EXISTS groups (
    id          UUID PRIMARY KEY,
    name        VARCHAR(128) NOT NULL,
    image_path  VARCHAR(128),
    invite_code VARCHAR(128) NOT NULL UNIQUE,
    type        INTEGER
);
CREATE INDEX idx_groups_id ON groups(id);


CREATE TABLE IF NOT EXISTS user_group (
    user_id     UUID REFERENCES users(id),
    group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
    balance     INTEGER,
    CONSTRAINT uid_gid PRIMARY KEY (user_id, group_id) 
);
CREATE INDEX idx_user_group_gid_uid ON user_group(group_id, user_id);
CREATE INDEX idx_user_group_uid ON user_group(user_id);


CREATE TABLE IF NOT EXISTS debts (
    id          UUID PRIMARY KEY,
    group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
    payer_id    UUID REFERENCES users(id),
    debtor_id   UUID REFERENCES users(id),
    amount      INTEGER,
    type        INTEGER
);
CREATE INDEX idx_debts_gid_type ON debts(group_id, type);
CREATE INDEX idx_debts_debtor_payer ON debts(debtor_id, payer_id);
CREATE INDEX idx_debts_payer ON debts(payer_id);


CREATE TABLE IF NOT EXISTS expenses (
    id          UUID PRIMARY KEY,
    group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
    payer_id    UUID REFERENCES users(id),
    debtor_id   UUID REFERENCES users(id),
    total_paid  INTEGER,
    name        VARCHAR(128) NOT NULL,
    type        INTEGER,
    time        TIMESTAMP
);
CREATE INDEX idx_expenses_id ON expenses(id);
CREATE INDEX idx_expenses_gid ON expenses(group_id);
CREATE INDEX idx_expenses_pid ON expenses(payer_id);


CREATE TABLE IF NOT EXISTS expense_items (
    expense_id  UUID REFERENCES expenses(id) ON DELETE CASCADE,
    payer_id    UUID REFERENCES users(id),
    debtor_id   UUID REFERENCES users(id),
    amount      INTEGER,
    CONSTRAINT eid_uid PRIMARY KEY (expense_id, payer_id, debtor_id)
);
CREATE INDEX idx_expense_items_eid ON expense_items(expense_id);
