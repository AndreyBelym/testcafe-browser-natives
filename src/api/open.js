import path from 'path';
import Mustache from 'mustache';
import OS from '../utils/os';
import { exec } from '../utils/exec';
import exists from '../utils/fs-exists-promised';
import { MESSAGES, getText } from '../messages';

/**
 * Opens the web page in a new instance of the browser.
 * @function
 * @async
 * @name open
 * @param {BrowserInfo} browserInfo - Provides information on the browser where the web page should be opened.
 * @param {string} pageUrl - Specifies the web page URL.
 */
export default async function (browserInfo, pageUrl) {
    if (!OS.win || !browserInfo.winOpenCmdTemplate) {
        if (!browserInfo.path)
            throw new Error(getText(MESSAGES.browserPathNotSet));

        var fileExists = await exists(browserInfo.path);

        if (!fileExists)
            throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));
    }

    var command = '';

    if (OS.win) {
        var browserDirPath      = path.dirname(browserInfo.path);
        var browserExecFileName = path.basename(browserInfo.path);

        if (browserInfo.winOpenCmdTemplate) {
            command = Mustache.render(browserInfo.winOpenCmdTemplate, {
                pageUrl: pageUrl
            });
        }
        else
            command = `start /D "${browserDirPath}" ${browserExecFileName} ${browserInfo.cmd} ${pageUrl}`;
    }
    else if (OS.mac) {
        command = Mustache.render(browserInfo.macOpenCmdTemplate, {
            path:    browserInfo.path,
            cmd:     browserInfo.cmd,
            pageUrl: pageUrl
        });
    }
    else
        return; //TODO: support OS.linux

    try {
        await exec(command);
    }
    catch (err) {
        throw new Error(getText(MESSAGES.unableToRunBrowser, browserInfo.path));
    }
}
