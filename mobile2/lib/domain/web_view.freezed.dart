// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'web_view.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

/// @nodoc
mixin _$WebView {
  bool get showBackButton => throw _privateConstructorUsedError;
  bool get isLoading => throw _privateConstructorUsedError;
  bool get networkError => throw _privateConstructorUsedError;
  String get url => throw _privateConstructorUsedError;

  /// Create a copy of WebView
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WebViewCopyWith<WebView> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WebViewCopyWith<$Res> {
  factory $WebViewCopyWith(WebView value, $Res Function(WebView) then) =
      _$WebViewCopyWithImpl<$Res, WebView>;
  @useResult
  $Res call(
      {bool showBackButton, bool isLoading, bool networkError, String url});
}

/// @nodoc
class _$WebViewCopyWithImpl<$Res, $Val extends WebView>
    implements $WebViewCopyWith<$Res> {
  _$WebViewCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WebView
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? showBackButton = null,
    Object? isLoading = null,
    Object? networkError = null,
    Object? url = null,
  }) {
    return _then(_value.copyWith(
      showBackButton: null == showBackButton
          ? _value.showBackButton
          : showBackButton // ignore: cast_nullable_to_non_nullable
              as bool,
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      networkError: null == networkError
          ? _value.networkError
          : networkError // ignore: cast_nullable_to_non_nullable
              as bool,
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$WebViewImplCopyWith<$Res> implements $WebViewCopyWith<$Res> {
  factory _$$WebViewImplCopyWith(
          _$WebViewImpl value, $Res Function(_$WebViewImpl) then) =
      __$$WebViewImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {bool showBackButton, bool isLoading, bool networkError, String url});
}

/// @nodoc
class __$$WebViewImplCopyWithImpl<$Res>
    extends _$WebViewCopyWithImpl<$Res, _$WebViewImpl>
    implements _$$WebViewImplCopyWith<$Res> {
  __$$WebViewImplCopyWithImpl(
      _$WebViewImpl _value, $Res Function(_$WebViewImpl) _then)
      : super(_value, _then);

  /// Create a copy of WebView
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? showBackButton = null,
    Object? isLoading = null,
    Object? networkError = null,
    Object? url = null,
  }) {
    return _then(_$WebViewImpl(
      showBackButton: null == showBackButton
          ? _value.showBackButton
          : showBackButton // ignore: cast_nullable_to_non_nullable
              as bool,
      isLoading: null == isLoading
          ? _value.isLoading
          : isLoading // ignore: cast_nullable_to_non_nullable
              as bool,
      networkError: null == networkError
          ? _value.networkError
          : networkError // ignore: cast_nullable_to_non_nullable
              as bool,
      url: null == url
          ? _value.url
          : url // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc

class _$WebViewImpl implements _WebView {
  const _$WebViewImpl(
      {required this.showBackButton,
      required this.isLoading,
      required this.networkError,
      required this.url});

  @override
  final bool showBackButton;
  @override
  final bool isLoading;
  @override
  final bool networkError;
  @override
  final String url;

  @override
  String toString() {
    return 'WebView(showBackButton: $showBackButton, isLoading: $isLoading, networkError: $networkError, url: $url)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WebViewImpl &&
            (identical(other.showBackButton, showBackButton) ||
                other.showBackButton == showBackButton) &&
            (identical(other.isLoading, isLoading) ||
                other.isLoading == isLoading) &&
            (identical(other.networkError, networkError) ||
                other.networkError == networkError) &&
            (identical(other.url, url) || other.url == url));
  }

  @override
  int get hashCode =>
      Object.hash(runtimeType, showBackButton, isLoading, networkError, url);

  /// Create a copy of WebView
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WebViewImplCopyWith<_$WebViewImpl> get copyWith =>
      __$$WebViewImplCopyWithImpl<_$WebViewImpl>(this, _$identity);
}

abstract class _WebView implements WebView {
  const factory _WebView(
      {required final bool showBackButton,
      required final bool isLoading,
      required final bool networkError,
      required final String url}) = _$WebViewImpl;

  @override
  bool get showBackButton;
  @override
  bool get isLoading;
  @override
  bool get networkError;
  @override
  String get url;

  /// Create a copy of WebView
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WebViewImplCopyWith<_$WebViewImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
