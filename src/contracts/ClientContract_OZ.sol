// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";


contract ClientContract_OZ is AccessControl {
    bytes32 public constant CLIENT_ROLE = keccak256("CLIENT_ROLE");
    string private jsonData; // Variable to store JSON data

    constructor(address _client) {
        _grantRole(CLIENT_ROLE, _client);
        _grantRole(DEFAULT_ADMIN_ROLE, _client); // Grant admin role to client for role management
    }

    // Function to upload JSON data
    function uploadData(string calldata _jsonData) public {
        require(hasRole(CLIENT_ROLE, msg.sender), "Not authorized");
        jsonData = _jsonData;
    }

    // Function to retrieve JSON data
    function retrieveData() public view returns (string memory) {
        require(hasRole(CLIENT_ROLE, msg.sender), "Not authorized");
        require(bytes(jsonData).length > 0, "No data available");
        return jsonData;
    }
}
