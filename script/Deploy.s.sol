// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/KokiToken.sol";
import "../contracts/KokiLottery.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy KokiToken
        KokiToken kokiToken = new KokiToken();
        console.log("KokiToken deployed at:", address(kokiToken));
        
        // Deploy KokiLottery
        // Note: You'll need to set up Chainlink VRF for Base Sepolia
        // For now, using placeholder values
        address vrfCoordinator = 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f; // Base Sepolia VRF
        bytes32 keyHash = 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314; // Base Sepolia key hash
        
        KokiLottery lottery = new KokiLottery(
            address(kokiToken),
            vrfCoordinator,
            keyHash
        );
        console.log("KokiLottery deployed at:", address(lottery));
        
        // Transfer some tokens to lottery contract for initial prizes
        kokiToken.transfer(address(lottery), 10000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("Deployment completed!");
        console.log("KokiToken:", address(kokiToken));
        console.log("KokiLottery:", address(lottery));
    }
}
