// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ClientContract_OZ.sol";
import "./@openzeppelin/contracts/access/AccessControl.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

contract ManagementContract_OZ is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    mapping(address => ClientContract_OZ) public clientContracts;

    event ClientContractCreated(address indexed client, address contractAddress);

    constructor() {
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant admin role to manager for role management
    }

    // Modified function to create a new ClientContract for a given client or return the existing one
    function createClientContract(address _client) public returns (address) {
        require(hasRole(MANAGER_ROLE, msg.sender), "Not authorized");

        // Check if a client contract already exists
        if(address(clientContracts[_client]) != address(0)) {
            // Client contract already exists, return its address
            return address(clientContracts[_client]);
        }

        // Otherwise, create a new ClientContract for the client
        ClientContract_OZ newContract = new ClientContract_OZ(_client);
        clientContracts[_client] = newContract;

        emit ClientContractCreated(_client, address(newContract));

        // Return the address of the new contract
        return address(newContract);
    }

    // Function to get the contract address of an client's contract
    function getClientContractAddress(address _client) public view returns (address) {
        require(address(clientContracts[_client]) != address(0), "Client contract does not exist");
        return address(clientContracts[_client]);
    }
}
