import 'package:freezed_annotation/freezed_annotation.dart';

part "web_view.freezed.dart";

@freezed
class WebView with _$WebView {
  const factory WebView({
    required bool showBackButton,
    required bool isLoading,
    required bool networkError,
    required String url,
  }) = _WebView;
}
