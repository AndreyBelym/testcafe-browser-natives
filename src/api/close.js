import findWindow from './find-window';
import OS from '../utils/os';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';


export default async function (pageUrl) {
    var windowDescription = await findWindow(pageUrl);

    if (!windowDescription)
        return;

    var closeWindowArguments = void 0;

    if (OS.win)
        closeWindowArguments = [windowDescription.hwnd];
    else if (OS.mac)
        closeWindowArguments = [windowDescription.windowName, windowDescription.processName];
    else
        closeWindowArguments = [windowDescription.windowID];

    await execFile(BINARIES.close, closeWindowArguments);
}
