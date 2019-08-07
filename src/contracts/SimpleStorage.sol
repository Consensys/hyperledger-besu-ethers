// Taken from the Solidity documentation
// https://solidity.readthedocs.io/en/v0.5.10/introduction-to-smart-contracts.html#storage-example

pragma solidity >=0.4.0 <0.7.0;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
