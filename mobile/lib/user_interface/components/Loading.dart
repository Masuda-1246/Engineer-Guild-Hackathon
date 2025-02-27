import 'package:flutter/material.dart';

class Loading extends StatelessWidget {
  final Color color;

  const Loading({
    Key? key,
    this.color = const Color(0xFF06C9B3), // デフォルトカラーを設定
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: CircularProgressIndicator(
        color: color,
      ),
    );
  }
}
