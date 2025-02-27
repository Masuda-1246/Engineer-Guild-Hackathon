# ディレクトリー構成

## 以下は lib ファルダーの構成

基本的に開発する時は、[lib](../lib)を変更する。

```
.
├── domain
│   └── todo
│       ├── repository
│       │   ├── todo_mock_repository.dart
│       │   ├── todo_repository.dart
│       │   └── todo_sharepreference.dart
│       ├── todo.dart
│       └── todo.freezed.dart
├── main.dart
├── usecase
│   └── todo
│       ├── todo_usecase.dart
│       └── todo_usecase.g.dart
└── user_interface
    ├── common
    │   └── constants
    │       └── auth0.dart
    ├── pages
    │   ├── auth_page.dart
    │   ├── detail_page.dart
    │   ├── home_page.dart
    │   ├── login_page.dart
    │   ├── sessions.dart
    │   ├── splash_page.dart
    │   └── todo_paga.dart
    ├── router
    │   └── router.dart
    └── widgets
```

# 各ディレクトリーの振る舞い

### lib

- [README](../README.md)にもある通り、開発時は基本的に[lib](../lib/)配下に変更を加える

### docs

- エンジニア向けのドキュメントはここに追加していく
- GitHub 上で辿りやすいように[README のインデックス](../README.md#インデックス)にリンクを貼ること

### domain/〇〇.dart

- 基本的に〇〇の domain の model を書く。
- [freezard](https://pub.dev/packages/freezed)を使用して、モデルを自動生成する。
- [クラス自動生成ツール](https://app.quicktype.io/)

### domain/repository

- api や db,localstorage のなどのデータソースのやり取りを書くフォルダー

### domain/repository/〇〇\_reposiroty.dart

- 実装したい抽象クラスを記載。

### domain/repository/〇〇\_sharepreference_reposiroty.dart

- localstorage を叩く際に実装
- 必ず domain/repository/〇〇\_reposiroty.dart の抽象クラスを実装する実装クラス

### domain/repository/〇〇\_mock_reposiroty.dart

- まだ api や localstorage が決まっていない時に mock として叩く方法

### usecase/〇〇/〇〇\_uescase.dart

- usecase 層
- 具体的な業務処理やデータの操作ロジックを書く

### user_interface/〇〇/page

- 画面

### user_interface/〇〇/router

- router による画面遷移を記述

### common/constant

- 固定 url やテーマ設定、api の client 設定を記載する場所
  > [!CAUTION]
  > key などを載せているときは、必ず gitignore にすること

### widgets

- アプリで使用する共通で再利用する UI を管理します。

### main.dart

アプリの一番上位(エントリーポイント)となるファイルです。
以下のようなことを行うことが多いです。

- 画面を縦に固定する
- Firebase の初期化処理
- env ファイルの読み込み
- riverpod のスコープ設定
