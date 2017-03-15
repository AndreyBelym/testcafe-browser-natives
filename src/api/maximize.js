import OS from 'os-family';
import findWindow from './find-window';
import { execFile } from '../utils/exec';
import BINARIES from '../binaries';

function getBoundsFromString (boundsString) {
    return boundsString.replace(/\n/g, '').split(', ');
}

async function getWindowBounds (windowId, bundleId) {
    var boundsString = await execFile(BINARIES.getWindowBounds, [windowId, bundleId]);

    return getBoundsFromString(boundsString);
}

async function getWindowMaxBounds (windowId, bundleId) {
    var windowBounds    = await getWindowBounds(windowId, bundleId);
    var maxBoundsString = await execFile(BINARIES.getWindowMaxBounds, windowBounds);

    return getBoundsFromString(maxBoundsString);
}

async function maximizeWindowMac (windowDescription) {
    var { windowId, bundleId } = windowDescription;
    var windowBounds           = await getWindowMaxBounds(windowId, bundleId);

    await execFile(BINARIES.setWindowBounds, [windowId, bundleId].concat(windowBounds));
}
/**
 * Maximizes the specified browser window.
 * @function
 * @async
 * @name maximize
 * @param {string} pageTitle - The title of the web page opened in the window that should be maximized.
 **/
export default async function (pageTitle) {
    var windowDescription = await findWindow(pageTitle);

    if (!windowDescription)
        return;

    var commandArguments = void 0;

    if (OS.win)
        commandArguments = [windowDescription.hwnd];
    else if (OS.linux)
        commandArguments = [windowDescription.windowId];
    else if (OS.mac) {
        await maximizeWindowMac(windowDescription);

        return;
    }
    else
        return;

    await execFile(BINARIES.maximize, commandArguments);
}
