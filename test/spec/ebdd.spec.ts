import ebdd                                                 from '../../src/ebdd';
import { EMPTY_OBJ }                                        from './utils';
import { ok, strictEqual }                                  from 'assert';
import Mocha, { type MochaGlobals, Suite, interfaces }      from 'mocha';
import { type SinonSandbox, type SinonSpy, createSandbox }  from 'sinon';

describe
(
    'EBDD initializes correctly',
    (): void =>
    {
        function test(mocha: Mocha = new Mocha(), ebddThis?: Mocha): void
        {
            const { suite } = mocha;
            suite.removeAllListeners();
            ebdd.call(ebddThis, suite);
            const listeners = suite.listeners('pre-require');

            strictEqual(listeners.length, 1);

            let bddPreRequireListener: SinonSpy | undefined;
            sandbox.stub(suite, 'on').callsFake
            (
                function (this: Suite, event: string, listener: any): Suite
                {
                    bddPreRequireListener = sandbox.spy(listener);
                    const suite = this.addListener(event, bddPreRequireListener);
                    return suite;
                },
            );
            const bddSpy = sandbox.spy(interfaces, 'bdd');
            const context = { } as MochaGlobals;
            const file = '?';
            suite.emit('pre-require', context, file, mocha);

            ok(bddSpy.calledOnce);
            ok(bddSpy.calledWithExactly(suite));
            ok(bddPreRequireListener);
            ok(bddPreRequireListener.calledOnce);
            ok(bddPreRequireListener.calledWithExactly(context, file, mocha));
            strictEqual(typeof context.only, 'function');
            strictEqual(typeof context.skip, 'function');
            strictEqual(typeof context.when, 'function');
        }

        let sandbox: SinonSandbox;

        beforeEach
        (
            (): void =>
            {
                interfaces.ebdd = ebdd;
                sandbox = createSandbox();
            },
        );

        afterEach((): void => sandbox.restore());

        after
        (
            (): void =>
            {
                delete (interfaces as Partial<typeof interfaces>).ebdd;
                ({ sandbox } = EMPTY_OBJ);
            },
        );

        it
        (
            'normally',
            (): void =>
            {
                test();
            },
        );

        // Suite.prototype.getMaxListeners does not exist in Node.js < 1.
        describe
        (
            'without getMaxListeners in suite',
            (): void =>
            {
                it
                (
                    'with _maxListeners not set',
                    function (): void
                    {
                        const { prototype } = Suite;
                        if (!('getMaxListeners' in prototype))
                            this.skip();
                        sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                        const mocha = new Mocha();
                        delete (mocha.suite as { _maxListeners?: number; })._maxListeners;
                        test(mocha);
                    },
                );

                it
                (
                    'with _maxListeners set',
                    function (): void
                    {
                        const { prototype } = Suite;
                        if (!('getMaxListeners' in prototype))
                            this.skip();
                        sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                        const mocha = new Mocha();
                        mocha.suite.setMaxListeners(10);
                        test(mocha);
                    },
                );
            },
        );

        // Suite.prototype.getMaxListeners and Suite.prototype.setMaxListeners are both missing in
        // browsers in older versions of Mocha.
        it
        (
            'without getMaxListeners and setMaxListener in suite',
            function (): void
            {
                const { prototype } = Suite;
                if (!('setMaxListeners' in prototype))
                    this.skip();
                if ('getMaxListeners' in prototype)
                    sandbox.stub(prototype, 'getMaxListeners').value(undefined);
                sandbox.stub(prototype, 'setMaxListeners').value(undefined);
                test();
            },
        );

        // In older versions of Mocha, the test UI function is called with the Mocha object as this.
        // This behavior has changhed in Mocha 6.0.1.
        // With newer versions, the Mocha object is not known until the pre-require callback runs.
        it
        (
            'when called on Mocha object',
            (): void =>
            {
                const mocha = new Mocha();
                test(mocha, mocha);
            },
        );
    },
);
