import ebdd                                     from '../../src/ebdd';
import Mocha, { type MochaGlobals, interfaces } from 'mocha';
import type { SinonStub }                       from 'sinon';

export const EMPTY_OBJ = Object.create(null) as Record<PropertyKey, any>;

export interface CallCountingStub<TArgs extends any[] = any[], TReturnValue = any>
extends SinonStub<TArgs, TReturnValue>
{
    nextCallIndex?: number;
}

export function isArrayBased(array: unknown[]): boolean
{
    if (!(array instanceof Array))
        return false;
    const { length } = array;
    array.push(null);
    if (array.length !== length + 1)
        return false;
    array.pop();
    if (array.length !== length)
        return false;
    return true;
}

export function loadEBDD(): MochaGlobals
{
    const context = { } as MochaGlobals;
    interfaces.ebdd = ebdd;
    try
    {
        const mocha = new Mocha({ ui: 'ebdd' });
        mocha.suite.emit('pre-require', context, '', mocha);
    }
    finally
    {
        delete (interfaces as Partial<typeof interfaces>).ebdd;
    }
    return context;
}
