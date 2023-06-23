import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [historyEscrows, setHistoryEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    // receive ether value and change it to wei
    const value = ethers.utils.parseUnits(document.getElementById('wei').value, "ether");
    // const value = ethers.BigNumber.from(document.getElementById('wei').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow])
  }

  useEffect(() => {
    function upload() {
        if (escrows.length > 0) {
          // send data to backend
          fetch("/trackSmart", {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(escrows[escrows.length - 1]) // body data type must match "Content-Type" header
          })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(e => console.log(e));
        }
      }
    upload();
  }, [escrows])

  // get from backend array of cumulative escrow contracts
  useEffect(() => {
    fetch("/getEscrows")
      .then(res => res.json())
      .then(data => {
        setHistoryEscrows(data.escrows)
      })
  }, [escrows])

  return (
    <>
      <div className="title">
        <h1>Escrow Contracts</h1>
      </div>
      <div className="containerContract">
        <div className="contract">
          <h1> New Contract </h1>
          <label>
            Arbiter Address
            <input type="text" id="arbiter" />
          </label>

          <label>
            Beneficiary Address
            <input type="text" id="beneficiary" />
          </label>

          <label>
            Deposit Amount (in Ether)
            <input type="text" id="wei" />
          </label>

          <div
            className="button"
            id="deploy"
            onClick={(e) => {
              e.preventDefault();
              newContract();
            }}
          >
            Deploy
          </div>

        </div>

        <div className="existing-contracts">
          <h1> Existing Contracts </h1>

          <div id="container">
            {historyEscrows?.map((escrow) => {
              return <Escrow key={escrow.address} {...escrow} signer={signer} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

// arbiter 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// beneficiary 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
