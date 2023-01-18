import React from 'react';
import './Accounts.css';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useState } from 'react';
import { configure, getMethods } from '@radixdlt/connect-button';
import WalletSdk, {
  ManifestBuilder,
  Decimal,
  ResourceAddress,
  Bucket,
  Expression,
  requestBuilder,
  requestItem,
} from '@radixdlt/wallet-sdk'

const walletSdk = WalletSdk({ dAppId: 'dashboard', networkId: 11 })

const Accounts = (accounts) => {

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [tabIndex, setTabIndex] = useState(1);
  const [details, setDetails] = useState('');

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  async function getFungibles(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  async function getEntityDetails(data = {}) {
    // Default options are marked with *
    const response = await fetch('https://nebunet-gateway.radixdlt.com/entity/details', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  const manifest = new ManifestBuilder()
  .callMethod(
    from,
    'withdraw_by_amount',
    [
      Decimal(amount),
      ResourceAddress(
        'resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x'
      ),
    ]
  )
  // .withdrawFromAccountByAmount('account_tdx_b_1qlgm5udxrzhfal5n45q85wlgnhma3stj5gs6ulkal97qa3xdx9', 10, "resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x")
  // .takeFromWorktopByAmount(10, "resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x", "xrd_bucket")
  // // .callMethod(from, "buy_gumball", [Bucket("xrd_bucket")])
  // .callMethod('account_tdx_b_1quxmuxrqtfv9zxtmnfpffhwv2ytl2urr77g7h7v8fa6qtyuujz', "deposit_batch", [Expression("ENTIRE_WORKTOP")])
  .callMethod(to, "deposit_batch", [Expression("ENTIRE_WORKTOP")])
  .build()
  .toString();

  console.log(manifest)
  
  const sendTx = (address) =>
  getMethods().sendTransaction({
    version: 1,
    transactionManifest: manifest,
  })

  return (
    <div className="Accounts">
      <Stack spacing={2} divider={<Divider orientation="horizontal" flexItem />}>
        {accounts.accounts.length ?
        accounts.accounts.map((item, index) => <div key={index}>
            <p style={{fontSize: 15+ 'px'}}>Account Name: {item.label}</p>
            <p style={{fontSize: 15 + 'px'}}>Account Address: {item.address}</p>
            <input type="radio" value={item.address} name="address"      
              onChange={(e) => {
                setFrom(e.target.value);
                getFungibles('https://nebunet-gateway.radixdlt.com/entity/fungibles', { address: e.target.value })
                .then((data) => {
                  if(data.fungibles.total_count > 1)
                  {
                    const fungibles = data.fungibles.items.filter(item => item.amount.address != 'resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x');
                    fungibles.forEach(element => 
                      getEntityDetails({address: element.address}).then((newdata) => {
                        const fun = data.fungibles.items.filter(item => item.amount.address === element.address);
                        newdata.metadata.items.forEach(el =>
                          fun[0].amount[el.key] = el.value
                        )
                      })
                    )
                  }
                  console.log(data);
                  setDetails(data)
                });
              }}  
            />
          </div>
        )
        : 'There are no accounts connected'}
        {from ? 
          <div>
            <Box>
              <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Send Transaction" />
                <Tab label="See Account Details" />
                <Tab label="Create and Send a Token" />
              </Tabs>
            </Box>
            {tabIndex === 0 && (
            <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
            >
            <div>
              <TextField
                id="outlined-required"
                label="Enter the amount"
                onChange={(e) => {
                  console.log(e.target.value);
                  setAmount(e.target.value);
                }}  
              />
              </div>
              <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the account address"
                onChange={(e) => {
                  console.log(e.target.value);
                  setTo(e.target.value);
                }}  
              />
            </div>
            <Button variant="contained"
              onClick={() => {
                {sendTx(from)}
              }}
              >Send Transaction
          </Button>
          </Box>
          )}
                     {tabIndex === 1 && (
            <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
            >
              { details ? 
              <div>
              <p style={{fontSize: 12 + 'px'}}>Network: {details.ledger_state ? details.ledger_state.network : 'No Data'}</p>
              <p style={{fontSize: 12 + 'px'}}>Last Update: {details.ledger_state ? details.ledger_state.proposer_round_timestamp : 'No Data'}</p>
              <p style={{fontSize: 12 + 'px'}}>State Version: {details.ledger_state ? details.ledger_state.state_version : 'No Data'}</p>
              <hr class="solid"></hr>
              {details.fungibles.items.length ?
        Array.from(details.fungibles.items).map((item, index) => <div key={index}>
            <p style={{fontSize: 12 + 'px'}}>Type: {item.amount.address === 'resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x' ? 'XRD'  : item.amount.symbol}</p>
            <p style={{fontSize: 12 + 'px'}}>Ammount: {item.amount.value}</p>
            {item.amount.description ? <p style={{fontSize: 12 + 'px'}}>Name: {item.amount.name}</p> : ''}
            {item.amount.description ? <p style={{fontSize: 12 + 'px'}}>Description: {item.amount.description}</p> : ''}
            <hr class="solid"></hr>
          </div>
        )
        : 'No Data'}
        </div>
              : 'No Data'}
          </Box>
          )}
                     {tabIndex === 2 && (
            <Box
            component="form"
            sx={{
              '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
            >
            <div>
              <TextField
                id="outlined-required"
                label="Enter the name"
                onChange={(e) => {
                  // console.log(e.target.value);
                  // setAmount(e.target.value);
                }}  
              />
              </div>
              <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the amount minted"
                onChange={(e) => {
                  // console.log(e.target.value);
                  // setTo(e.target.value);
                }}  
              />

            </div>
            <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the amount you want to send"
                onChange={(e) => {
                  // console.log(e.target.value);
                  // setTo(e.target.value);
                }}  
              />

            </div>
            <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the account address"
                onChange={(e) => {
                  // console.log(e.target.value);
                  // setTo(e.target.value);
                }}  
              />

            </div>
            <Button variant="contained"
              onClick={() => {
                {sendTx(from)}
              }}
              >Send Token
          </Button>
          </Box>
          )}
        </div>
       : ''}
      </Stack>
    </div> 
  )
};

export default Accounts;