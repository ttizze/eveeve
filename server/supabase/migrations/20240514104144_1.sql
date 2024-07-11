CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_system BOOLEAN NOT NULL DEFAULT FALSE
);

-- システムユーザーの挿入
INSERT INTO users (id, email, is_system) 
VALUES ('00000000-0000-0000-0000-000000000000', 'system@example.com', TRUE);


-- トリガーを修正して、is_system = FALSEの場合のみ外部キー制約をチェック
CREATE OR REPLACE FUNCTION check_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.is_system THEN
    PERFORM id FROM auth.users WHERE id = NEW.id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid user ID for non-system user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_valid_user_id
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_user_id();

-- auth.usersテーブルの変更をリッスンする関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, total_points)
  VALUES (NEW.id, NEW.email, 'free', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLSの設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user data." ON users
  FOR SELECT USING (auth.uid() = id OR is_system);

CREATE POLICY "Users can update own user data." ON users
  FOR UPDATE USING (auth.uid() = id);
  
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL UNIQUE
);

-- source_text テーブル
CREATE TABLE source_texts (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    page_id INT NOT NULL,
    text_hash BYTEA NOT NULL,
    FOREIGN KEY (page_id) REFERENCES pages(id)
);

-- translate_text テーブル
CREATE TABLE translate_texts (
    id SERIAL PRIMARY KEY,
    language TEXT NOT NULL,
    text TEXT NOT NULL,
    source_text_id INT NOT NULL,
    page_id INT NOT NULL,
    user_id UUID NOT NULL,
    point INT NOT NULL DEFAULT 0,
    edit_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (source_text_id) REFERENCES source_texts(id),
    FOREIGN KEY (page_id) REFERENCES pages(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- votes テーブル
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    translate_text_id INT NOT NULL,
    vote_value INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (translate_text_id) REFERENCES translate_texts(id)
);

-- api_usage テーブル
CREATE TABLE api_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    date_time TIMESTAMP NOT NULL,
    amount_used INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE articles (
  url TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- text_hashにインデックスを作成
CREATE INDEX idx_source_texts_text_hash ON source_texts (text_hash);

-- text_hashを自動的に生成するトリガー関数
CREATE OR REPLACE FUNCTION generate_text_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.text_hash := encode(digest(NEW.text, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_text_hash
BEFORE INSERT OR UPDATE ON source_texts
FOR EACH ROW
EXECUTE FUNCTION generate_text_hash();