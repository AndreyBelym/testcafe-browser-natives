MAIN_APP_BIN_DIR=${DEST}/Contents/MacOS
SERVICE_APP_BIN_DIR=${DEST}/Contents/XPCServices/TestCafe Browser Tools Service.app/Contents/MacOS

all: clean build
clean:
	rm "${SERVICE_APP_BIN_DIR}/testcafe-browser-tools-service" || true
build:
	mkdir "${DEST}" || true
	clang -o "${SERVICE_APP_BIN_DIR}/testcafe-browser-tools-service" -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*.o testcafe-browser-tools-service.m
