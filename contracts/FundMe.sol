// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

error FundMe__NotOwner();

/**
* @title FundMe is a contract for crowd funding
* @notice This contract is a demo sample for learning
* @dev All function calls are currently implemented without side effects
*/
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmount;
    address private immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        // require(msg.sender == i_owner, "Sender is not owner");
        _;
    }

    constructor(
        address priceFeedAddress
    ) {
        i_owner = msg.sender;

        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
    * @dev This function is used to fund the contract
    * @notice This function is payable
    */
    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "Did not send enough eth");
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] = msg.value;
    }

    /**
    * @dev This function is used to withdraw the funds
    * @notice This function is only available to the owner
    */
    function withdraw() public onlyOwner {
        for (uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
            address funder = s_funders[funderIndex];
            s_addressToAmount[funder] = 0;
        }

        s_funders = new address[](0);

        // transfer funds
        payable(msg.sender).transfer(address(this).balance);

        // send funds does not throw and revert, but returns a bool if successful;
        bool isSuccess = payable(msg.sender).send(address(this).balance);
        require(isSuccess, "Send failed");

        // call 
        (bool callSuccess,    /* bytes memory dataReturned */) = payable(msg.sender).call{
                value: address(this).balance
            }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;

        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            s_addressToAmount[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success,) = i_owner.call{value: address(this).balance}("");

        require(success, "Withdraw failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funderAddress) public view returns (uint256) {
        return s_addressToAmount[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
