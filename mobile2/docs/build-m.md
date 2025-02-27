# ios の場合

> [!CAUTION]
> build する際は、apple developer に登録されていること

1. version を設定する
   pubspec.yaml の version を変更する(２回目以降)

2. xcode で project を開く
   1. ビルド端末が表示されている部分を「Any iOS Device (arm64)」
   2. 「Product」 > 「Archive」を実施
   3. 「Distribute App」を押す
3. web で App Store Connect を開く

# andorid の場合

1. key を作成する (会社の入力は、notion に記載)

```bash
キーストアのパスワードを入力してください:｛パスワードを入力｝
新規パスワードを再入力してください:｛パスワードを入力｝
姓名は何ですか。
  [Unknown]:  ｛姓名を入力｝
組織単位名は何ですか。
  [Unknown]:  ｛組織単位を入力｝
組織名は何ですか。
  [Unknown]:  ｛組織名を入力｝
都市名または地域名は何ですか。
  [Unknown]:  ｛都市名または地域名を入力｝
都道府県名または州名は何ですか。
  [Unknown]:  ｛都道府県名を入力｝
この単位に該当する2文字の国コードは何ですか。
  [Unknown]:  JP
CN=xxx, OU=xxx, O=xxx, L=xxx, ST=xxx, C=JPでよろしいですか。
  [いいえ]:  y

10,000日間有効な2,048ビットのRSAのキー・ペアと自己署名型証明書(SHA256withRSA)を生成しています
        ディレクトリ名: CN=xxx, OU=xxx, O=xxx, L=xxx, ST=xxx, C=JP
[C:Users\your_username\development\my_release_key.jksを格納中]
```

2. file 名を`my_release_key.jks`を変更し、`android/app/my_release_key.jks`に入れる
3. buildコマンド
```bash
flutter build appbundle --release
```

### 参考

https://qiita.com/Linda_man/items/3bb7a8b2bbdf7d8f2b33
