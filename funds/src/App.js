import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider'
import contract from "@truffle/contract";
import { loadContract } from './utilis/load-contract';

function App() {

  const [web3Api, setweb3Api] = useState({ provider: null, web3: null, contract: null })
  const [account, setaccount] = useState(0)
  const [balance, setbalance] = useState(0)
  const [reload, shouldreload] = useState(false)

  const reloadEffect = () => shouldreload(!reload)

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      console.log('11', provider);
      const contract = await loadContract("Funder", provider)

      if (provider) {
        provider.request({ method: "eth_requestAccounts" })
        setweb3Api({ web3: new Web3(provider), provider, contract })
      } else {
        console.error('Please install MetaMask!')
      }
    }
    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setbalance(web3.utils.fromWei(balance, "ether"))
    }
    web3Api.contract && loadBalance()
  }, [web3Api, reload])

  useEffect(() => {
    const getAccounts = async () => {
      const account = await web3Api.web3.eth.getAccounts()
      setaccount(account[0])
    }
    web3Api.web3 && getAccounts()
  }, [web3Api.web3])

  const transferFunds = async () => {
    const { web3, contract } = web3Api
    await contract.transfer({ from: account, value: web3.utils.toWei(String(2), "ether") })
    shouldreload()
  }

  const withdrawFunds = async () => {
    const { web3, contract } = web3Api
    const withdrawFunds = web3.utils.toWei(String(2), "ether")
    await contract.withdraw(withdrawFunds, { from: account })
    shouldreload()
  }

  return (
    <>
      <div class="card text-center">
        <div class="card-header">Funding</div>
        <div class="card-body">
          <h5 class="card-title">Balance: {balance} </h5>
          <p class="card-text">
            Account : {account ? account : "Not Connected"}
          </p>
          &nbsp;
          {/* <button type="button" class="btn btn-info m-2" onClick={async () => {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            console.log({ accounts });
          }} >
            Connect To MetaMask
          </button> */}
          <button type="button" class="btn btn-success" onClick={transferFunds} >
            Transfer
          </button>
          &nbsp;
          <button type="button" class="btn btn-primary" onClick={withdrawFunds} >
            Withdraw
          </button>
        </div>
        <div class="card-footer text-muted"> Aman Bhardwaj </div>
      </div>
    </>
  );
}

export default App;
