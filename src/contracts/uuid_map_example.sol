// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeContract {
    address public employee;
    mapping(string => string) private jsonData; // Mapping from UUID to JSON data

    modifier onlyEmployee() {
        require(msg.sender == employee, "Not authorized");
        _;
    }

    constructor(address _employee) {
        employee = _employee;
    }

    // Function to upload JSON data with a UUID
    function uploadData(string calldata _uuid, string calldata _jsonData) public onlyEmployee {
        require(bytes(jsonData[_uuid]).length == 0, "Data already exists for this UUID");
        jsonData[_uuid] = _jsonData;
    }

    // Function to retrieve JSON data by UUID
    function retrieveData(string calldata _uuid) public view onlyEmployee returns (string memory) {
        require(bytes(jsonData[_uuid]).length > 0, "No data available for this UUID");
        return jsonData[_uuid];
    }
}
