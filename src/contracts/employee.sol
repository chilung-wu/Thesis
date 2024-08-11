// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeContract {
    address public employee;
    string private jsonData; // Variable to store JSON data

    modifier onlyEmployee() {
        require(msg.sender == employee, "Not authorized");
        _;
    }

    constructor(address _employee) {
        employee = _employee;
    }

    // Function to upload JSON data
    function uploadData(string calldata _jsonData) public onlyEmployee {
        jsonData = _jsonData;
    }

    // Function to retrieve JSON data
    function retrieveData() public onlyEmployee view returns (string memory) {
        require(bytes(jsonData).length > 0, "No data available");
        return jsonData;
    }
}
