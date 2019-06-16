#!/usr/bin/env node

const iteropt = require("iteropt");
const execute = require("../lib/pool-execute");
const {CLIError} = iteropt;

try {
    const argv = process.argv.slice(2);
    const options = readopts(argv);

    switch (argv.length) {
        case 0: throw new CLIError("mising required DNS pool");
        case 1: throw new CLIError("missing required command");
    }

    options.pool = argv.shift();
    options.cmd = argv.shift();
    options.cmdargs = argv.splice(0, argv.length);

    execute(options).catch(console.error);
} catch (err) {
    if (err instanceof iteropt.CLIError) {
        console.error(err.message);
        console.error("try: pool --help");
        process.exit(1);
    } else {
        throw err;
    }
}

function readopts(argv) {
    const options = {verbosity: 0};

    for (let [opt, optval] of iteropt(argv)) {
        switch (opt) {
            case "--help":
                showhelp();
                process.exit();
                break;
            case "-v":
            case "--verbose":
                options.verbosity++;
                break;
            case "-q":
            case "--quiet":
                options.verbosity--;
                break;
            default:
                throw new iteropt.CLIError(`unknown option ${opt}`);
        }
    }

    return options;
}

function showhelp() {
    console.log(
`Usage:
  pool [-vq] <pool> <cmd> [<cmdarg> ...]
  pool --help

Execute a command for a pool of hosts.  The IP address of each host is injected
into the command arguments wherever a "{}" token is encountered.

ARGUMENTS

  pool      DNS pool resolved to lookup host IP addresses.
  cmd       Command to run for each IP address.
  cmdarg    Argument passed to command.

OPTIONS

  --help            Show this help.
  -v|--verbose      Display more output.
  -q|--quiet        Display less output.`
    );
}
