const contractAddress = '0x5F518437b8C09037b0f1d1E3b7a91FEA2D526520'
const contractABI = [{"inputs":[],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"move","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"computerMove","type":"uint256"},{"indexed":false,"internalType":"enum RockPaperScissors.Results","name":"result","type":"uint8"}],"name":"GamePlayed","type":"event"},{"inputs":[{"internalType":"uint256","name":"_move","type":"uint256"}],"name":"playGame","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const provider = new ethers.providers.Web3Provider(window.ethereum, 97)
let signer;
let contract;

const event = "GamePlayed"

provider.send("eth_requestAccounts", []).then(()=>{
    provider.listAccounts().then( (accounts) => {
        signer = provider.getSigner(accounts[0]); 
        
        contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        )
    }
    )
}
)

async function startGame(_move){
    const ammountInEther = document.getElementById("bet-ammount").value;
    const resultOutput = document.getElementById('game-result')
    if(ammountInEther == null || ammountInEther == undefined || ammountInEther <= 0){
        alert("You should put your bet to start playing!")
        return
    }
    const ammountInWei = ethers.utils.parseEther(ammountInEther.toString())

    let result = await contract.playGame(_move, {value: ammountInWei})
    resultOutput.innerText = "Waiting for tx to confirm...⌛"
    const waiting = await result.wait()

    handleEvent()
}

async function handleEvent(){
    let queryResult =  await contract.queryFilter('GamePlayed', await provider.getBlockNumber() - 5000, await provider.getBlockNumber());
    let queryResultRecent = queryResult[queryResult.length-1]

    let playerMove = await queryResultRecent.args.move.toString();
    let computerMove = await queryResultRecent.args.computerMove.toString();
    let outcome = await queryResultRecent.args.result.toString();

    let playerMoveString = getMoveByNumber(playerMove)
    let computerMoveString = getMoveByNumber(computerMove)

    let resultString = `<strong>Your Move</strong>: ${playerMoveString}<br><strong>Computer Move</strong>: ${computerMoveString}<br><strong>Result</strong>: ${outcome == 0 ? "Draw 🤝" : (outcome == 1 ? "Win 🥰" : "Lose 😢")}`
    const resultOutput = document.getElementById('game-result')
    resultOutput.innerHTML = resultString
}

function getMoveByNumber(number){
    if(number == 0){
        return "Rock 🪨"
    }
    if(number == 1){
        return "Paper 🧻"
    }
    if(number == 2){
        return "Scissors ✂"
    }
}