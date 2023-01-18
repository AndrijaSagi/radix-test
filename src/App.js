import './App.css';
import Accounts from './components/Accounts';
import { useEffect, useState } from 'react';
import { configure, getMethods } from '@radixdlt/connect-button';
import {
  ManifestBuilder,
  Decimal,
  ResourceAddress,
  Bucket,
  Expression,
} from '@radixdlt/wallet-sdk'
// import '@radixdlt/connect-button/style';

function App() {
  const [accounts, setAccounts] = useState('');
  const [address, setAddress] = useState();
  useEffect(()=>{
    configure({
      dAppId: 'dashboard',
      networkId: 11,
      logLevel: 'DEBUG',
      onConnect: ({ setState, getWalletData }) => {
        getWalletData({
          oneTimeAccountsWithoutProofOfOwnership: {},
        }).map(({ oneTimeAccounts }) => {
          setState({ connected: true });
          setAccounts(oneTimeAccounts);
          console.log(oneTimeAccounts)
          return oneTimeAccounts[0].address;
        // }).andThen(sendTx)
        })
      },
      onDisconnect: ({ setState }) => {
        setState({ connected: false });
        setAccounts('');
      },
      onCancel() {
        console.log('Cancel Clicked');
      },
      onDestroy() {
        console.log('Button Destroyed');
        // setAccounts(''); add this later on
      },
    });

    // const handleChangeAddress = (e) => {
    //   setAddress(e.target.value);
    //   console.log(address)
    // }
    // const manifest = new ManifestBuilder()
    // .callMethod(
    //   'component_tdx_a_1qguw8y8g437nnkusxukllha7l7c0cy658g34jyucm7tqkjanvl',
    //   'withdraw_by_amount',
    //   [
    //     Decimal('1'),
    //     ResourceAddress(
    //       'resource_tdx_a_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqegh4k9'
    //     ),
    //   ]
    // )
    // .takeFromWorktop(
    //   'resource_tdx_a_1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzqegh4k9',
    //   'xrd_bucket'
    // )
    // .callMethod(
    //   'component_tdx_a_1qfdcf5nvl9qkfv743p7dzj7zse5ex50p3cqnelg6puuqd4m540',
    //   'buy_gumball',
    //   [Bucket('xrd_bucket')]
    // )
    // .callMethod(
    //   'component_tdx_a_1qguw8y8g437nnkusxukllha7l7c0cy658g34jyucm7tqkjanvl',
    //   'deposit_batch',
    //   [Expression('ENTIRE_WORKTOP')]
    // )
    // .build()
    // .toString()
  // Send manifest to extension for signing
  // const result = await walletSdk
  //   .sendTransaction({
  //     transactionManifest: manifest,
  //     version: 1,
  //   })
    
    const sendTx = (address) =>
      getMethods().sendTransaction({
        version: 1,
        transactionManifest: `
          CREATE_RESOURCE Enum("Fungible", 18u8) Map<String, String>("description", "Dedo test token", "name", "Dedo", "symbol", "DEDO") Map<Enum, Tuple>() Some(Enum("Fungible", Decimal("15000")));
          CALL_METHOD ComponentAddress("${address}") "deposit_batch" Expression("ENTIRE_WORKTOP");`,
      })
}, [])

  return (
    <div className="App">
      <div>
        <radix-connect-button></radix-connect-button>
      </div>
      <Accounts accounts={accounts}/>
    </div>
  );
}

export default App;
