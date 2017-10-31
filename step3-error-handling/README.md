# cyclejs-http Error handling Example

## Description

HTTP Driver を使って `Success` 時、 `Error` 時の処理をするサンプルです。API は [JSONPlaceholder](http://jsonplaceholder.typicode.com/) を使用します。

- [JSONPlaceholder - Fake online REST API for developers](http://jsonplaceholder.typicode.com/)

## Structure

```bash
./step3-error-handling
├── README.md
├── bs-config.js
├── package.json
├── public/
├── src/
│   ├── scripts/
│   ├── styles/
│   └── templates/
├── tsconfig.json
├── webpack.config.js
└── yarn.lock
```

## Requirement

- `Node.js v8.6.0+`
- `npm v5.3.0+`
- `Yarn v1.1.0+`

## Usage

`Yarn` コマンドを実行します。
```bash
$ yarn start
```
ビルド ( 各種トランスパイル等 ) が実行され、ローカルサーバが起動して`http://localhost:3000`が立ち上がります。yarn 起動中は `watch` 状態となっており、 `*.ts`, `*.styl`, `*.pug` ファイルを編集する度に自動的にトランスパイルが実行されます。



## Installation

```bash
$ yarn install
```
ビルド・実行に必要な Node モジュールがインストールされます。
