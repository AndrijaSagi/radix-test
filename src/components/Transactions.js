import React from 'react';
import './Transactions.css';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

const Transactions = () => {

  const [from] = useState(localStorage.getItem('address'));
  const [search, setSearch] = useState('');
  const [transactionDetails, setTransactionDetails] = useState('');
  const [transactions] = useState(localStorage.getItem(from));

  async function getTransactionStatus(url = '', data = {}) {
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

  async function getTransactionDetails(data = {}) {
    // Default options are marked with *
    const response = await fetch('https://nebunet-gateway.radixdlt.com/transaction/committed-details', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }


  return (
    <div className="Transactions">  
      <Stack spacing={2} divider={<Divider orientation="horizontal" flexItem />}>
        {from && transactions ? JSON.parse(transactions).map((item, index) => <div key={index}>
            <p style={{fontSize: 15+ 'px'}}>Transaction Hash: {item}</p>
            <input type="radio" value={item} name="hash"   
              onChange={(e) => {
                
                getTransactionStatus('https://nebunet-gateway.radixdlt.com/transaction/status', { intent_hash_hex: e.target.value })
                .then((data) => {
                    const hex = data.known_payloads[0].payload_hash_hex
                    console.log(data)
                    const request = {
                        type: 'payload_hash',
                        value_hex: `${hex}`
                    }
                      getTransactionDetails(
                        {transaction_identifier: request}).then((newdata) => {
                        setTransactionDetails(newdata)
                        console.log(newdata)
                      })
                });
              }}  
            />
          </div>
          
          ) :<Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
          >
            <div>
            <TextField
              fullWidth
              id="outlined-required"
              label="Enter the transaction hex"
              onChange={(e) => {
                console.log(e.target.value);
                setSearch(e.target.value);
              }}  
            />
          </div>
          <Button variant="contained" disabled={search === ''}
            onClick={() => {
                getTransactionStatus('https://nebunet-gateway.radixdlt.com/transaction/status', { intent_hash_hex: search })
                .then((data) => {
                    if(data.known_payloads[0]){
                    const hex = data.known_payloads[0].payload_hash_hex
                    console.log(data)
                    const request = {
                        type: 'payload_hash',
                        value_hex: `${hex}`
                    }
                      getTransactionDetails(
                        {transaction_identifier: request}).then((newdata) => {
                        setTransactionDetails(newdata)
                        console.log(newdata)
                      })
                    }
                    else {
                        setTransactionDetails('')
                    }
                });
                
              }} 
            >Search Transaction
        </Button>
        </Box>}
            {transactionDetails && <div>
                <p style={{fontSize: 15+ 'px'}}>Status: {transactionDetails.details.receipt.status}</p>
                <p style={{fontSize: 15+ 'px'}}>Confirmed At: {transactionDetails.transaction.confirmed_at}</p>
                <p style={{fontSize: 15+ 'px'}}>From: {transactionDetails.transaction.fee_paid.address}</p>
                <p style={{fontSize: 15+ 'px'}}>Fee: {transactionDetails.transaction.fee_paid.value}</p>
            </div>}
            {search && !transactionDetails ? <p style={{fontSize: 15+ 'px'}}>No Data</p> : ''}
      </Stack>
    </div>
  )
};

export default Transactions;