import 'package:flutter/material.dart';

class NetworkError extends StatelessWidget {
  final VoidCallback onReload;
  final String message;
  final Color buttonColor;
  final Color textColor;

  const NetworkError({
    Key? key,
    required this.onReload,
    this.message = 'インターネット接続エラーが発生しました\nもう一度お試しください',
    this.buttonColor = const Color(0xFFC08B7B),
    this.textColor = Colors.white,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            message,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: onReload,
            style: ElevatedButton.styleFrom(
              backgroundColor: buttonColor,
              foregroundColor: textColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30.0),
              ),
              padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
            ),
            child: const Text('リロード', style: TextStyle(fontSize: 16)),
          ),
        ],
      ),
    );
  }
}
