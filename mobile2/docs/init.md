# ios の場合

## アプリ名の変更

1. アプリのバンドル ID を設定する
   `freeposition`に全検索をかけて`アプリ名`

```例：
- PRODUCT_BUNDLE_IDENTIFIER = com.manamu.watashigayarimasita;
+ PRODUCT_BUNDLE_IDENTIFIER = com.manamu.アプリ名;
```

> [!TIP]
> 命名規則は、会社ドメインまたは、プロジェクトドメインに合わせて設定した方がいよい。あなたの会社のウェブサイトが example.com の場合、バンドル識別子は com.example.appname のようになります。
