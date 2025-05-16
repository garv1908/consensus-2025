// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/YourContract.sol";

contract ContractScript is Script {
    address rulesEngineAddress;

    function setUp() public {
        // Read from environment variables
        rulesEngineAddress = vm.envAddress("RULES_ENGINE_ADDRESS");
    }

    function run() public {
        // Load deployer's private key from .env
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        // Broadcast the deployment
        vm.startBroadcast(deployerPrivateKey);

        // Deploy your contract
        YourContract yourContract = new YourContract();

        // Set the Rules Engine address in your contract (if needed)
        yourContract.setRulesEngineAddress(rulesEngineAddress);

        vm.stopBroadcast();

        console.log("YourContract deployed at:", address(yourContract));
    }
}
