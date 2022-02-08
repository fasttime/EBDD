import { clean, lint, makeBrowserSpecRunner, makeLib }  from './dev/impl.mjs';
import { fork }                                         from 'child_process';
import gulp                                             from 'gulp';
import { createRequire }                                from 'module';

const { parallel, series } = gulp;

export function test(callback)
{
    const { resolve } = createRequire(import.meta.url);
    const nycPath = resolve('nyc/bin/nyc');
    const mochaPath = resolve('mocha/bin/mocha');
    const forkArgs =
    [
        '--include=src',
        '--reporter=html',
        '--reporter=text-summary',
        mochaPath,
        '--check-leaks',
        '--require=ts-node/register',
        'test/spec/**/*.spec.ts',
    ];
    const childProcess = fork(nycPath, forkArgs);
    childProcess.on('exit', code => callback(code && 'Test failed'));
}

export { clean, lint, makeBrowserSpecRunner, makeLib };

export default series(parallel(clean, lint), test, parallel(makeLib, makeBrowserSpecRunner));
