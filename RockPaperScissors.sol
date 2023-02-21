// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RockPaperScissors{
    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    enum Results {Draw, Win, Lose}

    address owner; 

    event GamePlayed(address player, uint256 amount, uint move, uint computerMove, Results result); 

    constructor() payable {
        owner = msg.sender;
    }

    function playGame(uint _move) public payable{
        require(_move < 3, "You can only choose rock, paper or scissors");
        require(msg.value>0, "Please add your bet"); 
        require(msg.value*2 <= address(this).balance, "Contract balance is insuffieient ");

        uint computerMove = generateRandomNumber()%3;
        Results res = Results.Lose;
        if(_move == computerMove){
            res = Results.Draw;
        } else if(_move == 0 && computerMove == 2 || _move == 1 && computerMove == 0 || _move == 2 && computerMove == 1){
            res = Results.Win;
        }

        emit GamePlayed(msg.sender, msg.value, _move, computerMove, res);

        if (res == Results.Win){
            payable(msg.sender).transfer(msg.value*2);
        }
        else if(res == Results.Draw){
            payable(msg.sender).transfer(msg.value);
        }
        
    }

    function generateRandomNumber() private view returns (uint) {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
        return randomNumber;
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}
