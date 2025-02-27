import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_template/user_interface/pages/home_page.dart';
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        pageBuilder: (context, state) => NoTransitionPage<void>(
          key: state.pageKey,
          restorationId: state.pageKey.value,
          child: const WebViewPage(),
        ),
      ),
    ],
  );
});
