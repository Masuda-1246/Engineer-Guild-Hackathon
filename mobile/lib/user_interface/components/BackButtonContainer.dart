import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class BackButtonContainer extends StatelessWidget {
  final WebViewController controller;
  final Color iconColor;
  final double iconSize;
  final String url;

  const BackButtonContainer({
    Key? key,
    required this.controller,
    this.iconColor = const Color(0xFF06C9B3),
    this.iconSize = 30.0,
    required this.url,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(5.0),
        child: Align(
          alignment: Alignment.topLeft,
          child: Row(
              mainAxisSize: MainAxisSize.min, // 必要最小限のサイズに設定
              children: <Widget>[
                IconButton(
                  icon:
                      Icon(Icons.arrow_back, color: iconColor, size: iconSize),
                  onPressed: () async {
                    if (await controller.canGoBack()) {
                      if (url.startsWith(
                              "https://shopify.com/authentication/70293192937/") ||
                          url.startsWith(
                              "https://shop.app/checkout/70293192937/") ||
                          url.startsWith(
                              "https://watashigayarimashita.vercel.app/checkouts/")) {
                        controller.loadRequest(Uri.parse(
                            "https://watashigayarimashita.vercel.app/"));
                      } else {
                        controller.goBack();
                      }
                      // await Future.delayed(
                      //     const Duration(milliseconds: 200)); // 少し遅延を入れる
                      // controller.reload();
                    }
                  },
                ),
                Text('Back',
                    style:
                        TextStyle(color: iconColor, fontSize: 18)) // テキストスタイル
              ]),
        ),
      ),
    );
  }
}
