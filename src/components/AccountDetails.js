import React from 'react';
import './AccountDetails.css';
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
  Enum,
  U8,
  TypeId,
  Tuple
} from '@radixdlt/wallet-sdk'

const AccountDetails = (address) => {

  const [details, setDetails] = useState('');

  useEffect(() => {
      getFungibles('https://nebunet-gateway.radixdlt.com/entity/fungibles', { address: localStorage.getItem('address') })
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
  }, [])

  async function getFungibles(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
    
  async function getEntityDetails(data = {}) {
    const response = await fetch('https://nebunet-gateway.radixdlt.com/entity/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
    
  return (
    <div className="AccountDetails">
      <Box
        component="form"
        sx={{'& .MuiTextField-root': { m: 1, width: '25ch' },}}
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
    </div>
  )
};

export default AccountDetails;