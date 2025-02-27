import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_template/user_interface/router/router.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/standalone.dart' as tz;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // FCM の通知権限リクエスト
  final messaging = FirebaseMessaging.instance;
  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    announcement: false,
    badge: true,
    carPlay: false,
    criticalAlert: false,
    provisional: false,
    sound: true,
  );
  // print('User granted permission: ${settings.authorizationStatus}');

  // // トークンを取得して表示（デバッグ用）
  // String? fcmToken = await messaging.getToken();
  // print('FCM TOKEN: $fcmToken');
  runApp(
    ProviderScope(
      child: const MyApp(),
    ),
  );
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light.copyWith(
    statusBarColor: Colors.transparent, // ステータスバーの背景色を透明に
  ));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      // MaterialAppにrouterを追加。
      routerConfig: router, //goRouterを基盤に設定する。
      title: 'freepostion',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
    );
  }
}
