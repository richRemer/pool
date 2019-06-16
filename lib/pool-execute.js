const {promisify} = require("util");
const {spawn} = require("child_process");
const dns = require("dns");
const resolve = promisify(dns.resolve4);
const {entries} = Object;

/**
 * @param {object} options
 * @param {string} options.pool
 * @param {string} options.cmd
 * @param {string[]} [options.cmdargs]
 * @param {number} [options.verbosity]
 * @param {Readable} [options.stdin]
 * @param {Writable} [options.stdout]
 * @param {Writable} [options.stderr]
 */
async function poolExecute({pool, cmd, cmdargs=[], verbosity=0,
    stdin=process.stdin, stdout=process.stdout, stderr=process.stderr}) {

    if (verbosity < 1) console.info = () => {};
    if (verbosity < 0) console.warn = () => {};
    if (verbosity < -1) console.error = () => {};

    const command = cmd + (cmdargs.length ? " " + cmdargs.join(" ") : "");
    let errors = 0;

    console.info(`resolving ${pool}`);
    const addresses = await resolve(pool);

    if (!addresses.length) {
        console.warn(`resolved ${pool} is empty`);
        return;
    }

    console.info(`resolved ${pool} to ${addresses.length} IP addresses`);
    const results = addresses.map(execute);

    for (let [i, result] of entries(results)) if (await result) {
        console.error(`'${command}' exited with status ${await result} for ${addresses[i]}`);
        errors++;
    }

    if (errors) {
        throw new Error(`${errors} commands exited with error(s)`);
    }

    async function execute(address) {
        const args = cmdargs.map(arg => arg.replace(/\{\}/g, address));
        const stdio = [stdin, stdout, stderr];
        const process = spawn(cmd, args, {stdio});

        return new Promise((resolve, reject) => {
            process.on("close", resolve);
        });
    }
}

module.exports = poolExecute;
