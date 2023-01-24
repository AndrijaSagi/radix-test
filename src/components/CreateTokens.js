import React from 'react';
import './SendTokens.css';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
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

const CreateTokens = () => {

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const [from, setFrom] = useState(localStorage.getItem('address'));
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState('');
  const [error, setError] = useState('');
  const [toToken, setToToken] = useState('');
  const [nameToken, setNameToken] = useState('');
  const [descriptionToken, setDescriptionToken] = useState('');
  const [symbolToken, setSymbolToken] = useState('');
  const [amountToken, setAmountToken] = useState('');
  const [transactions, setTransactions] = useState(localStorage.getItem(from));

  const handleClose = () => setOpen(false);

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

  const sendToken = (address) =>
  getMethods().sendTransaction({
    version: 1,
    transactionManifest: `
    CREATE_RESOURCE Enum("Fungible",0u8)  Array<Tuple>(Tuple("name", "${nameToken}"), Tuple("description", "${descriptionToken}"), Tuple("symbol", "${symbolToken}")) Array<Tuple>() Enum("Some",Enum("Fungible",Decimal("${amountToken}")));
    CALL_METHOD ComponentAddress("${toToken}") "deposit_batch" Expression("ENTIRE_WORKTOP");`,
  })

  return (
    <div className="CreateTokens">
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
                fullWidth
                id="outlined-required"
                label="Enter the name of the token"
                onChange={(e) => {
                  console.log(e.target.value);
                  setNameToken(e.target.value);
                }}  
              />

            </div>
            <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the description of the token"
                onChange={(e) => {
                  console.log(e.target.value);
                  setDescriptionToken(e.target.value);
                }}  
              />

            </div>
            <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the symbol of the token"
                onChange={(e) => {
                  console.log(e.target.value);
                  setSymbolToken(e.target.value);
                }}  
              />

            </div>
            <div>
              <TextField
                fullWidth
                id="outlined-required"
                label="Enter the amount you want to send"
                onChange={(e) => {
                  console.log(e.target.value);
                  setAmountToken(e.target.value);
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
                  setToToken(e.target.value);
                }}  
              />

            </div>
            <Button variant="contained" disabled={from === '' || toToken === '' || amountToken === '' || nameToken === '' || amountToken === '' || descriptionToken === ''}
              onClick={() => {
                sendToken(from).then((response) => {
                    
                  if(response.value)
                  {
                    setTransaction(response.value.transactionIntentHash)
                    setOpen(true)
                    const allTransactions = JSON.parse(localStorage.getItem(from)) || [];
                    allTransactions.push(response.value.transactionIntentHash); 
                    localStorage.setItem(from, JSON.stringify(allTransactions));
                  }
                }).catch((error) => {
                  console.error(`onRejected function called: ${error.message}`);
                  setError(error.message)
                  setOpen(true)
                })
              }}
              >Send Token
          </Button>
          </Box>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {transaction ? `You've successfully sent ${amountToken} ${symbolToken}s` : 'Something went wrong'}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {transaction ? `Transaction hash: ${transaction}` : `Error: ${error}`}
              </Typography>
            </Box>
          </Modal>
    </div>
  )
};

export default CreateTokens;