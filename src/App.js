import React, { useEffect, useState } from "react";
import "./App.css";
import { PeraWalletConnect } from "@perawallet/connect";
import axios from "axios";
import Button from "@mui/material/Button";

// Create the PeraWalletConnect instance outside of the component
const peraWallet = new PeraWalletConnect();

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    });
  }, []);

  const [data, setData] = useState(accountAddress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        if (isConnectedToPeraWallet) {
          let url =
            "https://algoindexer.algoexplorerapi.io/v2/accounts/" +
            accountAddress;

          const response = await axios.get(url);
          const responseFormatted = await response.data;
          const responseAccount = responseFormatted["account"];

          const amountFormatted = responseAccount.amount / 1000000;
          console.log(amountFormatted);

          setData(amountFormatted);
          setError(null);
        }
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [accountAddress, isConnectedToPeraWallet]);

  return (
    <main className="App">
      <Button
        variant="outlined"
        onClick={
          isConnectedToPeraWallet
            ? handleDisconnectWalletClick
            : handleConnectWalletClick
        }
      >
        {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
      </Button>

      <div>
        <h2>
          {isConnectedToPeraWallet
            ? `Your Wallet Address is ${accountAddress}`
            : "Connect first, dummy."}
        </h2>
        <h3>Algo Balance:</h3>

        {loading && <div>A moment please...</div>}
        {error && (
          <div>{`There is a problem fetching the post data - ${error}`}</div>
        )}

        <div>{isConnectedToPeraWallet ? `${data}` : " --- "}</div>
      </div>
    </main>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        setAccountAddress(newAccounts[0]);
      })
      .reject((error) => {
        // You MUST handle the reject because once the user closes the modal, peraWallet.connect() promise will be rejected.
        // For the async/await syntax you MUST use try/catch
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          // log the necessary errors
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();

    setAccountAddress(null);
  }
}

export default App;
