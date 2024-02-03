
.PHONY: proto
proto:
	protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative proto/api/api.proto

	cd front && ./node_modules/.bin/grpc_tools_node_protoc \
		--plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
		--ts_proto_out=./src/proto/ \
		--ts_proto_opt=env=browser,outputServices=nice-grpc,outputServices=generic-definitions,outputJsonMethods=false,useExactTypes=false \
		--proto_path=../proto/api \
		../proto/api/api.proto && cd ..
