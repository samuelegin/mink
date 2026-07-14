// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PaymentRegistry
/// @notice Lightweight, permissionless on-chain receipt log for Mink payments.
/// @dev No handle registration or ownership — handles are display-only strings
///      supplied by the caller (sourced from the backend) purely for event
///      readability. This contract never custodies funds; it's called *after*
///      the actual transfer has settled via Particle's Universal Account, so
///      it exists to give every payment a public, verifiable on-chain receipt
///      on Arbitrum rather than to move value itself.
contract PaymentRegistry {
    error ZeroAmount();
    error ZeroAddress();

    struct Stats {
        uint256 totalSentWei;
        uint256 totalReceivedWei;
        uint256 sentCount;
        uint256 receivedCount;
    }

    mapping(address => Stats) public statsOf;
    uint256 public totalPayments;
    uint256 public totalVolumeWei;

    event PaymentLogged(
        address indexed from,
        address indexed to,
        uint256 amount,
        string fromHandle,
        string toHandle,
        string note,
        uint256 timestamp
    );

    /// @notice Record a completed payment. Callable by anyone, but `msg.sender`
    ///         is always the recorded sender — you cannot log a payment on
    ///         someone else's behalf. `amount` is denominated however the
    ///         caller wants (e.g. USDC base units); this contract only stores
    ///         and emits it, it does not interpret decimals.
    function logPayment(
        address to,
        uint256 amount,
        string calldata fromHandle,
        string calldata toHandle,
        string calldata note
    ) external {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        Stats storage senderStats = statsOf[msg.sender];
        senderStats.totalSentWei += amount;
        senderStats.sentCount += 1;

        Stats storage receiverStats = statsOf[to];
        receiverStats.totalReceivedWei += amount;
        receiverStats.receivedCount += 1;

        totalPayments += 1;
        totalVolumeWei += amount;

        emit PaymentLogged(msg.sender, to, amount, fromHandle, toHandle, note, block.timestamp);
    }

    function getStats(address account) external view returns (Stats memory) {
        return statsOf[account];
    }
}
