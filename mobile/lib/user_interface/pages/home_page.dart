import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_template/domain/web_view.dart';
import 'package:flutter_template/usecase/web_view_usecase.dart';
import 'package:flutter_template/user_interface/components/BackButtonContainer.dart';
import 'package:flutter_template/user_interface/components/Loading.dart';
import 'package:flutter_template/user_interface/components/NetWorkError.dart';

import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';

class WebViewPage extends ConsumerStatefulWidget {
  const WebViewPage({super.key});

  @override
  _WebViewPageState createState() => _WebViewPageState();
}

class _WebViewPageState extends ConsumerState<WebViewPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }
    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (progress < 100) {
              ref.read(webViewUseCaseProvider.notifier).startLoading();
            } else {
              ref.read(webViewUseCaseProvider.notifier).finsLoading();
            }
          },
          onPageStarted: (String url) {
            // ref.read(webViewUseCaseProvider.notifier).startLoading();
          },
          onPageFinished: (String url) {
            ref.read(webViewUseCaseProvider.notifier).changeUrl(url);
            if ((url.startsWith("https://watashigayarimashita.vercel.app/") ||
                    (url.startsWith("https://shopify.com/70293192937/"))) &&
                !url.startsWith(
                    "https://watashigayarimashita.vercel.app/checkouts/") &&
                !url.startsWith(
                    "https://watashigayarimashita.vercel.app/70293192937/") &&
                !url.startsWith(
                    "https://shopify.com/authentication/70293192937/") &&
                !url.startsWith("https://shop.app/checkout/70293192937/")) {
              ref.read(webViewUseCaseProvider.notifier).hideBackButton();
            } else {
              ref.read(webViewUseCaseProvider.notifier).showBackButton();
            }
          },
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            ref.read(webViewUseCaseProvider.notifier).networkError();
            return;
          },
        ),
      )
      ..addJavaScriptChannel(
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message.message)),
          );
        },
      )
      ..loadRequest(Uri.parse('https://watashigayarimashita.vercel.app/'));

    // if (kIsWeb || !Platform.isMacOS) {
    //   controller.setBackgroundColor(const Color(0x80000000));
    // }

    // #docregion platform_features
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    _controller = controller;
    // #enddocregion platform_features
  }

  int _selectedIndex = 0;

  final _screens = [
    "Home",
    "Cart",
    "Account",
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    if (index == 0) {
      _controller
          .loadRequest(Uri.parse('https://watashigayarimashita.vercel.app/'));
    } else if (index == 1) {
      _controller.loadRequest(
          Uri.parse('https://watashigayarimashita.vercel.app/cart'));
    } else if (index == 2) {
      _controller.loadRequest(
          Uri.parse('https://watashigayarimashita.vercel.app/account'));
    }
  }

  @override
  Widget build(BuildContext context) {
    WebView webViewState = ref.watch(webViewUseCaseProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFFFFF),
        elevation: 0,
        foregroundColor: Colors.white,
        toolbarHeight: 5,
      ),
      body: Column(
        children: [
          if (webViewState.showBackButton)
            BackButtonContainer(controller: _controller, url: webViewState.url),
          Expanded(
            child: webViewState.isLoading
                ? const Loading()
                : webViewState.networkError
                    ? NetworkError(
                        onReload: () {
                          ref
                              .read(webViewUseCaseProvider.notifier)
                              .clearNetworkError();
                          _controller.reload();
                        },
                      )
                    : WebViewWidget(controller: _controller),
          ),
        ],
      ),
      // bottomNavigationBar: BottomNavigationBar(
      //   showSelectedLabels: false, // <-- HERE
      //   showUnselectedLabels: false,
      //   currentIndex: _selectedIndex,
      //   onTap: _onItemTapped,
      //   items: const <BottomNavigationBarItem>[
      //     BottomNavigationBarItem(icon: Icon(Icons.home), label: 'ホーム'),
      //     BottomNavigationBarItem(
      //         icon: Icon(Icons.shopping_cart), label: '買い物かご'), // 新しいアイテム
      //     BottomNavigationBarItem(icon: Icon(Icons.person), label: 'アカウント'),
      //   ],
      //   type: BottomNavigationBarType.fixed,
      //   backgroundColor: Color(0xFF06C9B3), // バーの背景色
      //   selectedItemColor: Color(0xFFFFFFFF), // 選択されたアイテムの色
      //   unselectedItemColor:
      //       Color.fromARGB(255, 210, 193, 189), //  // 選択されていないアイテムの色
      // )
    );
  }
}
