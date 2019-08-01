pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract TestContract {

    struct ChildStruct {
        uint childUint;
        uint childString;
    }

    struct ParentStruct {
        uint parentUint;
        uint parentString;
        bool parentBool;
        bytes32 parentBytes32;

        ChildStruct child;

        mapping (address => uint) balances;
    }

    uint private testUint = 1;
    string public testString = "test string";
    bool public testBool;
    address public testAddress;
    bytes32 public testBytes32;

    ParentStruct public parent;

    mapping (address => bool) addressBoolMap;
    mapping (address => ParentStruct) addressParentStructMap;

    event TestUint (
        uint testUint
    );

    event TheLot (
        uint testUint,
        string testString,
        bool testBool,
        address testAddress,
        bytes32 testBytes32,
        ChildStruct childStruct
    );

    function fireEvents() public {
        emit TheLot(
            testUint,
            testString,
            testBool,
            testAddress,
            testBytes32,
            parent.child
        );

        emit TestUint(testUint);
    }

    function setAll(
        uint _testUint,
        string memory _testString,
        bool _testBool,
        address _testAddress,
        bytes32 _testBytes32,
        ChildStruct memory child
    ) public {
        testUint = _testUint;
        testString = _testString;
        testBool = _testBool;
        testAddress = _testAddress;
        testBytes32 = _testBytes32;
        parent.child = child;
    }

    function setTestUint(uint x) public {
        testUint = x;
    }

    function getTestUint() public view returns (uint) {
        return testUint;
    }
}
