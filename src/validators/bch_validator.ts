import cryptoUtils from '../crypto/utils.js'
import bech32 from '../crypto/bech32.js'
import {Address, NetworkType} from '../types.js'
import BTCValidator from './bitcoin_validator.js'
import {getAddress} from '../helpers.js'

function validateAddress(address: string, opts: BCHValidatorOpts) {
    const regexp = new RegExp(opts.regexp);
    let raw_address: string;

    const res = address.split(':');
    if (res.length === 1) {
        raw_address = address
    } else {
        if (res[0] !== 'bitcoincash') {
            return false;
        }
        raw_address = res[1];
    }

    if (!regexp.test(raw_address)) {
        return false;
    }

    if (raw_address.toLowerCase() != raw_address && raw_address.toUpperCase() != raw_address) {
        return false;
    }

    const decoded = cryptoUtils.base32.b32decode(raw_address);

    const prefix = opts.networkType === NetworkType.MainNet
        ? 'bitcoincash'
        : 'bchtest'

    try {
        if (bech32.verifyChecksum(prefix, decoded, bech32.encodings.BECH32)) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

interface BCHValidatorOpts {
    addressTypes: string[]
    expectedLength?: number
    bech32Hrp?: [string],
    hashFunction?: 'blake256' | 'blake256keccak256' | 'keccak256' | 'sha256',
    regexp?: RegExp,
    networkType: NetworkType,
}

const DefaultBCHValidatorOpts: Partial<BCHValidatorOpts> = {
//     addressTypes: {mainnet: ['00', '05'], testnet: ['6f', 'c4', '3c', '26']},
//     bech32Hrp: {mainnet: ['bc'], testnet: ['tb']},
    regexp: /^[qQpP][0-9a-zA-Z]{41}$/,
}

export default (opts: BCHValidatorOpts) => ({
    isValidAddress: function (address: Address) {
        const addr = getAddress(address)
        const _opts = {...DefaultBCHValidatorOpts, ...opts}
        return validateAddress(addr, _opts) || BTCValidator(opts).isValidAddress(address);
    }
})
