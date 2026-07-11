// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HandleRegistry {
    mapping(string => address) private handleToAddress;
    mapping(address => string) private addressToHandle;

    event HandleRegistered(string indexed handle, address indexed owner);
    event AddressUpdated(string indexed handle, address indexed oldOwner, address indexed newOwner);
    event PaymentLogged(string fromHandle, string toHandle, address indexed from, address indexed to, uint256 amount, string note);

    error HandleTaken();
    error HandleNotFound();
    error NotHandleOwner();
    error AlreadyHasHandle();
    error InvalidHandle();

    modifier onlyHandleOwner(string calldata handle) {
        if (handleToAddress[handle] != msg.sender) revert NotHandleOwner();
        _;
    }

    function _validateHandle(string calldata handle) internal pure {
        bytes memory h = bytes(handle);
        if (h.length == 0 || h.length > 32) revert InvalidHandle();
    }

    function registerHandle(string calldata handle) external {
        _validateHandle(handle);
        if (handleToAddress[handle] != address(0)) revert HandleTaken();
        if (bytes(addressToHandle[msg.sender]).length != 0) revert AlreadyHasHandle();

        handleToAddress[handle] = msg.sender;
        addressToHandle[msg.sender] = handle;

        emit HandleRegistered(handle, msg.sender);
    }

    function setAddress(string calldata handle, address newOwner) external onlyHandleOwner(handle) {
        if (newOwner == address(0)) revert InvalidHandle();
        if (bytes(addressToHandle[newOwner]).length != 0) revert AlreadyHasHandle();

        address oldOwner = handleToAddress[handle];
        handleToAddress[handle] = newOwner;
        delete addressToHandle[oldOwner];
        addressToHandle[newOwner] = handle;

        emit AddressUpdated(handle, oldOwner, newOwner);
    }

    function resolve(string calldata handle) external view returns (address) {
        address owner = handleToAddress[handle];
        if (owner == address(0)) revert HandleNotFound();
        return owner;
    }

    function handleOf(address account) external view returns (string memory) {
        return addressToHandle[account];
    }

    function isAvailable(string calldata handle) external view returns (bool) {
        return handleToAddress[handle] == address(0);
    }

    function logPayment(
        string calldata fromHandle,
        string calldata toHandle,
        uint256 amount,
        string calldata note
    ) external onlyHandleOwner(fromHandle) {
        address to = handleToAddress[toHandle];
        if (to == address(0)) revert HandleNotFound();

        emit PaymentLogged(fromHandle, toHandle, msg.sender, to, amount, note);
    }
}
