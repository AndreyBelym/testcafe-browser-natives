import childProc from 'child_process';
import OS from 'os-family';
import promisify from './promisify';


const OSASCRIPT_PATH = '/usr/bin/osascript';


var execFilePromise = promisify(childProc.execFile);
var execPromise     = promisify(childProc.exec);

function endsWith (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

//API
export async function execFile (filePath, args) {
    return OS.mac && endsWith(filePath, '.scpt') ?
           await execFilePromise(OSASCRIPT_PATH, [filePath].concat(args)) :
           await execFilePromise(filePath, args);
}

export async function exec (command) {
    return execPromise(command, { env: process.env });
}

export async function execWinShellUtf8 (command) {
    var setCodePageCmd     = `FOR /F  "tokens=2 delims=:,." %i in ('chcp') do (chcp 65001`;
    var restoreCodePageCmd = 'chcp %i)';

    // NOTE: To avoid terminal errors, we need to restore the original code page after the command is executed.
    return await exec(`${setCodePageCmd} & ${command} & ${restoreCodePageCmd}`);
}

export function spawn (command) {
    return new Promise((resolve, reject) => {
        const cp = childProc.spawn(command, { shell: true, stdio: 'inherit' });

        setTimeout(() => resolve(), 3000);

        cp.on('error', e => reject(new Error(`Error creating process ${command}: ${e.stack}`)));

        cp.on('exit', code => code ? reject(new Error(`Process ${command} exited, code ${code}`)) : resolve());
    });
}
