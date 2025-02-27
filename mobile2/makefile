genProto:
	protoc --dart_out=grpc:./lib/_gen -I ./proto proto/v1/boxkey/boxkey.proto
	protoc --dart_out=grpc:./lib/_gen -I ./proto proto/v1/user/user.proto
		protoc --dart_out=grpc:./lib/_gen -I ./proto proto/v1/box/box.proto

watch:
	dart run build_runner watch