MAIN_APP_BIN_DIR=${DEST}/Contents/MacOS
SERVICE_APP_BIN_DIR=${DEST}/Contents/XPCServices/TestCafe Browser Tools Service.app/Contents/MacOS

all: clean build
clean:
	rm "${MAIN_APP_BIN_DIR}/testcafe-browser-tools" || true
	rm "${SERVICE_APP_BIN_DIR}/testcafe-browser-tools-service" || true
build:
	mkdir "${MAIN_APP_BIN_DIR}" || true
	mkdir "${SERVICE_APP_BIN_DIR}" || true
	clang -o "${MAIN_APP_BIN_DIR}/testcafe-browser-tools" -framework Cocoa testcafe-browser-tools.m
	clang -o "${SERVICE_APP_BIN_DIR}/testcafe-browser-tools-service" -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*.o testcafe-browser-tools-service.m
