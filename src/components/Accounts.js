import React from 'react';
import './Accounts.css';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import { getMethods } from '@radixdlt/connect-button';
import WalletSdk, {
  ManifestBuilder,
  Decimal,
  Expression,
  Enum,
  U8,
  TypeId
} from '@radixdlt/wallet-sdk'

const walletSdk = WalletSdk({ dAppId: 'dashboard', networkId: 11 })

const Accounts = (accounts, address = '') => {

  const [from, setFrom] = useState('');
  const [details, setDetails] = useState('');
  const [toToken, setToToken] = useState('');
  const [amountToken, setAmountToken] = useState('');

  accounts.func(address = from);

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

  const manifestToken = new ManifestBuilder()
  .createResource(
    Enum('Fungible', U8(0)),
    Array(TypeId.Tuple),
    Array(TypeId.Tuple),
    Enum('Some', Enum('Fungible', Decimal(1.0)))
  )
  // .withdrawFromAccountByAmount('account_tdx_b_1qlgm5udxrzhfal5n45q85wlgnhma3stj5gs6ulkal97qa3xdx9', 10, "resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x")
  // .takeFromWorktopByAmount(10, "resource_tdx_b_1qzkcyv5dwq3r6kawy6pxpvcythx8rh8ntum6ws62p95s9hhz9x", "xrd_bucket")
  // // .callMethod(from, "buy_gumball", [Bucket("xrd_bucket")])
  // .callMethod('account_tdx_b_1quxmuxrqtfv9zxtmnfpffhwv2ytl2urr77g7h7v8fa6qtyuujz', "deposit_batch", [Expression("ENTIRE_WORKTOP")])
  .callMethod(toToken, "deposit_batch", [Expression("ENTIRE_WORKTOP")])
  .build()
  .toString();

  console.log(manifestToken)
  

  const sendToken = (address) =>
  getMethods().sendTransaction({
    version: 1,
    transactionManifest: `
    CREATE_RESOURCE Enum("Fungible",0u8) Array<Tuple>() Array<Tuple>() Enum("Some",Enum("Fungible",Decimal("${amountToken}")));
    CALL_METHOD ComponentAddress("${toToken}") "deposit_batch" Expression("ENTIRE_WORKTOP");`,
  })

  return (
    <div className="Accounts">
      <Stack spacing={2} divider={<Divider orientation="horizontal" flexItem />}>
        {accounts.accounts.length ?
        accounts.accounts.map((item, index) => <div key={index}>
            <p style={{fontSize: 15+ 'px'}}>Account Name: {item.label}</p>
            <p style={{fontSize: 15 + 'px'}}>Account Address: {item.address}</p>
            <input type="radio" value={item.address} name="address" checked={localStorage.getItem('address') === item.address ? true : false}   
              onChange={(e) => {
                setFrom(e.target.value);
                localStorage.setItem('address', e.target.value)
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
      </Stack>
    </div> 
  )
};

export default Accounts;