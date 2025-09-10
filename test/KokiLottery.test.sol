// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/KokiToken.sol";
import "../contracts/KokiLottery.sol";

contract KokiLotteryTest is Test {
    KokiToken public kokiToken;
    KokiLottery public lottery;
    
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy KokiToken
        kokiToken = new KokiToken();
        
        // Deploy KokiLottery with mock VRF
        lottery = new KokiLottery(
            address(kokiToken),
            address(0x123), // Mock VRF coordinator
            bytes32(0x456)  // Mock key hash
        );
        
        // Transfer tokens to users
        kokiToken.transfer(user1, 1000 * 10**18);
        kokiToken.transfer(user2, 1000 * 10**18);
        
        vm.stopPrank();
    }
    
    function testInitialState() public {
        assertEq(lottery.currentLotteryId(), 1);
        assertTrue(lottery.lotteries(1).isActive);
        assertEq(lottery.TICKET_PRICE(), 10 * 10**18);
    }
    
    function testBuyTicket() public {
        vm.startPrank(user1);
        
        // Approve tokens
        kokiToken.approve(address(lottery), 10 * 10**18);
        
        // Buy ticket
        lottery.buyTicket(25);
        
        // Check lottery state
        (,,,uint256 ticketPrice, uint256 totalTickets, uint256 totalPrize,,,,,) = lottery.getLotteryInfo(1);
        assertEq(totalTickets, 1);
        assertEq(totalPrize, 10 * 10**18);
        
        // Check user tickets
        uint256[] memory userTickets = lottery.getUserTickets(1, user1);
        assertEq(userTickets.length, 1);
        assertEq(userTickets[0], 25);
        
        vm.stopPrank();
    }
    
    function testMultipleTickets() public {
        vm.startPrank(user1);
        kokiToken.approve(address(lottery), 50 * 10**18);
        
        // Buy multiple tickets
        lottery.buyTicket(1);
        lottery.buyTicket(25);
        lottery.buyTicket(50);
        
        uint256[] memory userTickets = lottery.getUserTickets(1, user1);
        assertEq(userTickets.length, 3);
        
        vm.stopPrank();
    }
    
    function testInvalidNumber() public {
        vm.startPrank(user1);
        kokiToken.approve(address(lottery), 10 * 10**18);
        
        // Try to buy invalid number
        vm.expectRevert("Invalid number");
        lottery.buyTicket(0);
        
        vm.expectRevert("Invalid number");
        lottery.buyTicket(51);
        
        vm.stopPrank();
    }
    
    function testInsufficientBalance() public {
        address poorUser = address(0x999);
        
        vm.startPrank(poorUser);
        kokiToken.approve(address(lottery), 10 * 10**18);
        
        // Try to buy ticket without tokens
        vm.expectRevert();
        lottery.buyTicket(25);
        
        vm.stopPrank();
    }
    
    function testLotteryEnd() public {
        vm.startPrank(user1);
        kokiToken.approve(address(lottery), 10 * 10**18);
        lottery.buyTicket(25);
        vm.stopPrank();
        
        // Fast forward time to end lottery
        vm.warp(block.timestamp + 7 days + 1);
        
        // Try to buy ticket after lottery ended
        vm.startPrank(user2);
        kokiToken.approve(address(lottery), 10 * 10**18);
        
        vm.expectRevert("Lottery ended");
        lottery.buyTicket(30);
        
        vm.stopPrank();
    }
    
    function testPause() public {
        vm.startPrank(owner);
        lottery.pause();
        vm.stopPrank();
        
        vm.startPrank(user1);
        kokiToken.approve(address(lottery), 10 * 10**18);
        
        vm.expectRevert();
        lottery.buyTicket(25);
        
        vm.stopPrank();
    }
}
