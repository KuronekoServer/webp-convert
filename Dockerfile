# ベースイメージを指定
FROM node:latest

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# ローカルのpackage.jsonとpackage-lock.jsonをコンテナ内の作業ディレクトリにコピー
COPY package*.json ./

# npmパッケージのインストール
RUN npm install

# ローカルのソースコードをコンテナ内の作業ディレクトリにコピー
COPY . .

# コンテナのポートを公開
EXPOSE 12901

# アプリケーションの起動コマンドを指定
CMD [ "node", "app.js" ]
