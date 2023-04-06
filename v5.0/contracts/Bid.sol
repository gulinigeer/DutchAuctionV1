// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Bid is ERC20 {
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    uint256 chainId;
        assembly {
            chainId := chainid()
        }

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    _mint(msg.sender, 50000 * 10 ** uint(decimals()));
    }

    using ECDSA for bytes32;

    mapping(address => uint256) nonces;
    bytes32 public DOMAIN_SEPARATOR;

    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual {
        require(block.timestamp <= deadline, "ERC20Permit: expired deadline");

        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline));

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address signer = hash.recover(v, r, s);
        require(signer == owner, "ERC20Permit: invalid signature");

        _approve(owner, spender, value);
    }

}