# CI/CD の設定

github actions を利用している。現在は ios のみに対応しているが、android にも対応する。

## check.yml

- pull request のタイミングで flutter analyze とする
- [Problem Matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)、[Danger action](https://github.com/marketplace/actions/danger-action) を使って、analyze が出力する (info|warning|error) を GitHub の File chaged に表示します

<img src="https://github.com/user-attachments/assets/99c2d6f3-4101-40b6-b99a-c150abbb1e28" width="300" height="300">

## bump.yml 　（個人開発用)

- GitHub の画面上からアプリのバージョン（pubspec.yaml の version:）をインクリメント（更新）するワークフローです

## bump pull request.yml (チーム開発用)

> [!WARNING]
> githun のレポジトリー権限で引っかかる可能性がある。setting->action->general->Workflow permissions を Read and write permissions をチェックを入れる

- アプリバージョンの更新を含む release ブランチと Pull Request を作成する
- releases/1.0.0+1 のようなブランチを作成する
チーム開発や Protected branch を使っている環境を想定したワークフロー

  <img src="https://github.com/user-attachments/assets/0f2966b3-3bfa-4140-a758-04f835609f23" width="300" height="300">

## tagging-when-merged.yml

main に bump ppull request で出した pull request を merge するとリリースのタグを生成する
<img width="500" alt="スクリーンショット 2024-08-06 8 26 17" src="https://github.com/user-attachments/assets/d527536c-b23c-475e-9e0c-e25ae44e9cd9">

## build.yaml

> [!CAUTION]
> 実際は、tag が生成されたタイミングで build されるが、うまく CI が回らないため issue として残しておく。

ios の apple store connect にアプリをあげる githubaction
[ios/ExportOptions.plist](../ios/ExportOptions.plist)を変更

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>destination</key>
	<string>export</string>
	<key>method</key>
	<string>app-store</string>
	<key>provisioningProfiles</key>
	<dict>
		<key>com.example.flutterTemplate0510</key>    　// バンドルid
		<string>flutter_temp0804-2</string>           // provisioning profile
	</dict>
	<key>signingCertificate</key>
	<string>Apple Distribution</string>
	<key>signingStyle</key>
	<string>manual</string>
	<key>stripSwiftSymbols</key>
	<true/>
	<key>teamID</key>
	<string>FNUWZDVK8P</string>                          // 認証鍵を持っている人の名前
	<key>uploadBitcode</key>
	<false/>
	<key>exportSymbols</key>
	<true/>
</dict>
</plist>
```

こちらの providisoing 　 profile と Bundle Indentifer と同じになる。
<img width="1000" height="300" alt="スクリーンショット 2024-08-04 17 44 11" src="https://github.com/user-attachments/assets/082f3ab1-1049-4e0d-8daf-f12ddbce0f18">

## latest_develop.yml

- main に merge されたタイミングで develop にその変更を反映する。
- 実際には、develop から生やした relese/v12.04.1 から main に merge するがその際に version が develop が反映されないため行う。

## 参考記事

[iod-build 参考記事](https://zenn.dev/pressedkonbu/articles/254ca2fc3cd1ab)
[flutter の workflow 参考記事](https://zenn.dev/yorifuji/articles/flutter-github-actions-template)
