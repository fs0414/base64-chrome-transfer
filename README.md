# Base64 Decoder Chrome Extension

DenoとTypeScriptで作成したBase64デコーダーのChrome拡張機能です。

## 機能

- Base64エンコードされた文字列をデコード
- JSON形式とコロン区切り形式に対応
- オブジェクト名、ID、パディング情報を解析
- TypeScriptによる型安全な実装

## ファイル構成

```
base64-chrome-transfer/
├── manifest.json      # Chrome拡張機能の設定
├── popup.html         # ポップアップUI
├── popup.ts           # メインロジック（TypeScript）
├── popup.js           # ビルド済みJavaScript
├── decoder.ts         # デコーダー実装
├── style.css          # スタイル
├── build.ts           # ビルドスクリプト
├── icon.svg           # アイコン（SVG）
└── create-icons.ts    # アイコン作成補助スクリプト
```

## セットアップ

1. **Denoのインストール**
   ```bash
   mise use deno@latest
   ```

2. **ビルド**
   ```bash
   eval "$(mise env)" && deno run --allow-read --allow-write build.ts
   ```

3. **Chrome拡張機能として読み込み**
   1. Chromeで `chrome://extensions/` を開く
   2. 「デベロッパーモード」を有効にする
   3. 「パッケージ化されていない拡張機能を読み込む」をクリック
   4. このディレクトリを選択

## 使用方法

1. Chromeツールバーの拡張機能アイコンをクリック
2. Base64エンコードされた文字列を入力
3. 「デコード」ボタンをクリック
4. 結果が表示されます

## サポート形式

### コロン区切り形式
```
ObjectName:12345:padding
```

### JSON形式
```json
{"objectName": "User", "id": 789, "padding": "none"}
```

## テスト用データ

コンソールに以下のサンプルデータが表示されます：

```javascript
// シンプルなコロン区切り
btoa('TestObject:12345:somePadding')

// JSON形式
btoa(JSON.stringify({ objectName: 'User', id: 789, padding: 'none' }))
```

## 開発

### 再ビルド
```bash
eval "$(mise env)" && deno run --allow-read --allow-write build.ts
```

### アイコン作成
```bash
eval "$(mise env)" && deno run create-icons.ts
```

## 特徴

- **TypeScript**: 型安全性とコード品質の向上
- **Deno**: 外部依存なしの標準ライブラリ使用
- **モジュラー設計**: 機能拡張が容易
- **エラーハンドリング**: 不正な入力に対する適切な処理