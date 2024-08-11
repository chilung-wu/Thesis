// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./employee.sol";

contract ManagementContract {
    address public manager;
    mapping(address => EmployeeContract) public employeeContracts;

    event EmployeeContractCreated(address indexed employee, address contractAddress);

    modifier onlyManager() {
        require(msg.sender == manager, "Not authorized");
        _;
    }

    constructor() {
        manager = msg.sender;
    }

    // Function to create a new EmployeeContract for a given employee
    function createEmployeeContract(address _employee) public onlyManager {
        require(address(employeeContracts[_employee]) == address(0), "Employee contract already exists");

        EmployeeContract newContract = new EmployeeContract(_employee);
        employeeContracts[_employee] = newContract;
        emit EmployeeContractCreated(_employee, address(newContract));
    }

    // Function to get the contract address of an employee's contract
    function getEmployeeContractAddress(address _employee) public view returns (address) {
        require(address(employeeContracts[_employee]) != address(0), "Employee contract does not exist");
        return address(employeeContracts[_employee]);
    }
}
