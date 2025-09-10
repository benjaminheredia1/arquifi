// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title KokiLottery
 * @dev Lottery contract for KoquiFI ecosystem
 * @author KoquiFI Team
 */
contract KokiLottery is VRFConsumerBaseV2, ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    // Chainlink VRF
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable KEY_HASH;
    uint32 private immutable CALLBACK_GAS_LIMIT = 100000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 5;
    
    // Lottery state
    struct Lottery {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 totalPrize;
        uint256[] winningNumbers;
        address[] winners;
        bool isActive;
        bool isCompleted;
        mapping(uint256 => address[]) ticketsByNumber;
        mapping(address => uint256[]) userTickets;
    }
    
    // State variables
    IERC20 public immutable kokiToken;
    uint256 public currentLotteryId;
    uint256 public constant TICKET_PRICE = 10 * 10**18; // 10 KOKI
    uint256 public constant MAX_NUMBER = 50;
    uint256 public constant MIN_NUMBER = 1;
    uint256 public constant LOTTERY_DURATION = 7 days;
    uint256 public constant WINNER_COUNT = 5;
    
    // Mappings
    mapping(uint256 => Lottery) public lotteries;
    mapping(uint256 => uint256) public vrfRequestToLottery;
    
    // Events
    event LotteryCreated(uint256 indexed lotteryId, uint256 startTime, uint256 endTime);
    event TicketPurchased(uint256 indexed lotteryId, address indexed buyer, uint256 number);
    event LotteryDrawn(uint256 indexed lotteryId, uint256[] winningNumbers, address[] winners);
    event PrizeClaimed(uint256 indexed lotteryId, address indexed winner, uint256 amount);
    event VRFRequested(uint256 indexed lotteryId, uint256 requestId);
    
    constructor(
        address _kokiToken,
        address _vrfCoordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        kokiToken = IERC20(_kokiToken);
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        KEY_HASH = _keyHash;
        
        // Create first lottery
        _createNewLottery();
    }
    
    /**
     * @dev Create a new lottery
     */
    function _createNewLottery() internal {
        currentLotteryId++;
        Lottery storage lottery = lotteries[currentLotteryId];
        
        lottery.id = currentLotteryId;
        lottery.startTime = block.timestamp;
        lottery.endTime = block.timestamp + LOTTERY_DURATION;
        lottery.ticketPrice = TICKET_PRICE;
        lottery.isActive = true;
        lottery.isCompleted = false;
        
        emit LotteryCreated(currentLotteryId, lottery.startTime, lottery.endTime);
    }
    
    /**
     * @dev Buy a lottery ticket
     * @param number Number to buy (1-50)
     */
    function buyTicket(uint256 number) external nonReentrant whenNotPaused {
        require(number >= MIN_NUMBER && number <= MAX_NUMBER, "Invalid number");
        require(lotteries[currentLotteryId].isActive, "Lottery not active");
        require(block.timestamp < lotteries[currentLotteryId].endTime, "Lottery ended");
        
        // Transfer KOKI tokens
        kokiToken.safeTransferFrom(msg.sender, address(this), TICKET_PRICE);
        
        // Update lottery state
        Lottery storage lottery = lotteries[currentLotteryId];
        lottery.totalTickets++;
        lottery.totalPrize += TICKET_PRICE;
        lottery.ticketsByNumber[number].push(msg.sender);
        lottery.userTickets[msg.sender].push(number);
        
        emit TicketPurchased(currentLotteryId, msg.sender, number);
    }
    
    /**
     * @dev Draw lottery numbers (only owner)
     */
    function drawLottery() external onlyOwner {
        require(lotteries[currentLotteryId].isActive, "Lottery not active");
        require(block.timestamp >= lotteries[currentLotteryId].endTime, "Lottery not ended");
        
        // Request random numbers from Chainlink VRF
        uint256 requestId = COORDINATOR.requestRandomWords(
            KEY_HASH,
            COORDINATOR.createSubscription(),
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );
        
        vrfRequestToLottery[requestId] = currentLotteryId;
        emit VRFRequested(currentLotteryId, requestId);
    }
    
    /**
     * @dev Callback function for VRF
     * @param requestId Request ID from VRF
     * @param randomWords Array of random numbers
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 lotteryId = vrfRequestToLottery[requestId];
        Lottery storage lottery = lotteries[lotteryId];
        
        // Generate winning numbers
        uint256[] memory winningNumbers = new uint256[](WINNER_COUNT);
        for (uint256 i = 0; i < WINNER_COUNT; i++) {
            winningNumbers[i] = (randomWords[i] % MAX_NUMBER) + 1;
        }
        
        // Find winners
        address[] memory winners = new address[](WINNER_COUNT);
        for (uint256 i = 0; i < WINNER_COUNT; i++) {
            uint256 number = winningNumbers[i];
            if (lottery.ticketsByNumber[number].length > 0) {
                uint256 winnerIndex = randomWords[i] % lottery.ticketsByNumber[number].length;
                winners[i] = lottery.ticketsByNumber[number][winnerIndex];
            }
        }
        
        // Update lottery state
        lottery.winningNumbers = winningNumbers;
        lottery.winners = winners;
        lottery.isActive = false;
        lottery.isCompleted = true;
        
        emit LotteryDrawn(lotteryId, winningNumbers, winners);
        
        // Create new lottery
        _createNewLottery();
    }
    
    /**
     * @dev Claim prize
     * @param lotteryId Lottery ID to claim from
     */
    function claimPrize(uint256 lotteryId) external nonReentrant {
        require(lotteries[lotteryId].isCompleted, "Lottery not completed");
        
        // Check if user is a winner
        bool isWinner = false;
        for (uint256 i = 0; i < lotteries[lotteryId].winners.length; i++) {
            if (lotteries[lotteryId].winners[i] == msg.sender) {
                isWinner = true;
                break;
            }
        }
        require(isWinner, "Not a winner");
        
        // Calculate prize amount
        uint256 prizeAmount = lotteries[lotteryId].totalPrize / lotteries[lotteryId].winners.length;
        
        // Transfer prize
        kokiToken.safeTransfer(msg.sender, prizeAmount);
        
        emit PrizeClaimed(lotteryId, msg.sender, prizeAmount);
    }
    
    /**
     * @dev Get lottery information
     * @param lotteryId Lottery ID
     * @return Lottery information
     */
    function getLotteryInfo(uint256 lotteryId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 ticketPrice,
        uint256 totalTickets,
        uint256 totalPrize,
        uint256[] memory winningNumbers,
        address[] memory winners,
        bool isActive,
        bool isCompleted
    ) {
        Lottery storage lottery = lotteries[lotteryId];
        return (
            lottery.id,
            lottery.startTime,
            lottery.endTime,
            lottery.ticketPrice,
            lottery.totalTickets,
            lottery.totalPrize,
            lottery.winningNumbers,
            lottery.winners,
            lottery.isActive,
            lottery.isCompleted
        );
    }
    
    /**
     * @dev Get user tickets for a lottery
     * @param lotteryId Lottery ID
     * @param user User address
     * @return Array of ticket numbers
     */
    function getUserTickets(uint256 lotteryId, address user) external view returns (uint256[] memory) {
        return lotteries[lotteryId].userTickets[user];
    }
    
    /**
     * @dev Get tickets for a specific number
     * @param lotteryId Lottery ID
     * @param number Number to check
     * @return Array of ticket holders
     */
    function getTicketsByNumber(uint256 lotteryId, uint256 number) external view returns (address[] memory) {
        return lotteries[lotteryId].ticketsByNumber[number];
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = kokiToken.balanceOf(address(this));
        kokiToken.safeTransfer(owner(), balance);
    }
}