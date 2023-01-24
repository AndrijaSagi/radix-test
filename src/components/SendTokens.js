import React from 'react';
import './CreateTokens.css';
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
  ResourceAddress,
  Expression,
} from '@radixdlt/wallet-sdk'

const SendTokens = () => {

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
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [transaction, setTransaction] = useState('');
  const [error, setError] = useState('');

  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const sendTx = (address) =>
  getMethods().sendTransaction({
    version: 1,
    transactionManifest: manifest,
  })

  return (
    <div className="SendToken">
      {/* <Box>
      <p>Send from account: {localStorage.getItem('address')}</p>
      </Box> */}
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
            <Button variant="contained" disabled={from === '' || to === '' || amount === ''}
              onClick={() => {
                sendTx(from).then((response) => {
                  if(response.value)
                  {
                    setTransaction(response.value.transactionIntentHash)
                    setOpen(true)
                  }
                }).catch((error) => {
                  console.error(`onRejected function called: ${error.message}`);
                  setError(error.message)
                  setOpen(true)
                })
              }}
              >Send Transaction
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
                {transaction ? `You've successfully sent ${amount} XRDs` : 'Something went wrong'}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {transaction ? <p>Transaction hash: {transaction}</p> : <p>Error: {error}</p>}
              </Typography>
            </Box>
          </Modal>
    </div>
  )
};

export default SendTokens;