// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceFeedMock is AggregatorV3Interface {
    struct Entry {
        int256 answer;
        uint256 stamp;
    }

    uint8 private _decimals;
    uint256 private _version;
    string private _description;
    Entry[] private _entries;

    constructor(int256 _answer, string memory _descr, uint8 _decs, uint256 _v) {
        _description = _descr;
        _decimals = _decs;
        _version = _v;
        _entries.push(Entry({answer: _answer, stamp: block.timestamp}));
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function getRoundData(
        uint80 /*_roundId*/
    )
    public
    view
    override
    returns (uint80 roundId, int256 ans, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        if (roundId == 0 || roundId > _entries.length) {
            return (0, 0, 0, 0, 0);
        } else {
            Entry storage entry = _entries[roundId - 1];
            return (roundId, entry.answer, entry.stamp, entry.stamp, roundId);
        }
    }

    function latestRoundData()
    external
    view
    override
    returns (uint80 roundId, int256 ans, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return getRoundData(uint80(_entries.length));
    }

    function setAnswer(int256 _answer) external {
        require(_entries.length < (1 << 80), "PriceFeedMock: rounds array is full");
        _entries.push(Entry({answer: _answer, stamp: block.timestamp}));
    }
}
