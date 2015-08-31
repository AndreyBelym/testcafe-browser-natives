import OS from './utils/os';
import toAbsPath from './utils/to-abs-path';


var BINARIES = void 0;

if (OS.win) {
    BINARIES = {
        findWindow: toAbsPath('../bin/win/find-window.exe'),
        close:      toAbsPath('../bin/win/close.exe'),
        screenshot: toAbsPath('../bin/win/screenshot.exe'),
        resize:     toAbsPath('../bin/win/resize.exe')
    };
}
else if (OS.mac) {
    BINARIES = {
        open:       toAbsPath('../bin/mac/open.scpt'),
        findWindow: toAbsPath('../bin/mac/find-window.scpt'),
        close:      toAbsPath('../bin/mac/close.scpt'),
        screenshot: toAbsPath('../bin/mac/screenshot'),
        resize:     toAbsPath('../bin/mac/resize.scpt')
    };
}
else if (OS.linux) {
    BINARIES = {
        findWindow: toAbsPath('../bin/lin/find-window.sh'),
        close:      toAbsPath('../bin/lin/close.sh'),
        screenshot: toAbsPath('../bin/lin/screenshot.sh'),
        resize:     toAbsPath('../bin/lin/resize.sh')
    };
}

export default BINARIES;
