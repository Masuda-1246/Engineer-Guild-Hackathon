import 'package:flutter_template/domain/web_view.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part "web_view_usecase.g.dart";

@riverpod
class WebViewUseCase extends _$WebViewUseCase {
  @override
  WebView build() {
    return const WebView(
      showBackButton: false,
      isLoading: true,
      networkError: false,
      url: "",
    );
  }

  void changeUrl(String url) {
    state = state.copyWith(url: url);
  }

  void showBackButton() {
    state = state.copyWith(showBackButton: true);
  }

  void hideBackButton() {
    state = state.copyWith(showBackButton: false);
  }

  void finsLoading() {
    state = state.copyWith(isLoading: false);
  }

  void startLoading() {
    state = state.copyWith(isLoading: true);
  }

  void networkError() {
    state = state.copyWith(networkError: true);
  }

  void clearNetworkError() {
    state = state.copyWith(networkError: false);
  }
}
