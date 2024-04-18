import { toEther, toWei, useAddress, useBalance, useContract, useContractRead, useContractWrite, useSDK, useTokenBalance } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import SwapInput from "../components/SwapInput";
import { BLOCKED_PAGES } from "next/dist/shared/lib/constants";

const Home: NextPage = () => {
  // Contracts for the DEX and the token
  const TOKEN_CONTRACT = "0x4b3A5ed554dE7A5DA38728DCBC4124e602A1cF2b";
  const DEX_CONTRACT = "0xB9723e2AB3812729E1e7Cb381AeE22680263e026";

  // SDK instance
  const sdk = useSDK();

  // Get the address of the connected account
  const address = useAddress();
  // Get contract instance for the token and the DEX
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT);
  const { contract: dexContract } = useContract(DEX_CONTRACT);
  // Get token symbol and balance
  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  // Get native balance and LP token balance
  const { data: nativeBalance } = useBalance();
  const { data: contractTokenBalance } = useTokenBalance(tokenContract, DEX_CONTRACT);

  // State for the contract balance and the values to swap
  const [contractBalance, setContractBalance] = useState<String>("0");
  const [nativeValue, setNativeValue] = useState<String>("0");
  const [tokenValue, setTokenValue] = useState<String>("0");
  const [currentFrom, setCurrentFrom] = useState<String>("native");
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  const { mutateAsync: swapNativeToken } = useContractWrite(
    dexContract,
    "swapEthToToken"
  );
  const { mutateAsync: swapTokenToNative } = useContractWrite(
    dexContract,
    "swapTokenToEth"
  );
  const { mutateAsync: approveTokenSpending } = useContractWrite(
    tokenContract,
    "approve"
  );

  // Get the amount of tokens to get based on the value to swap
  const { data: amountToGet } = useContractRead(
    dexContract,
    "getAmountOfTokens",
    currentFrom === "native"
      ? [
          toWei(nativeValue as string || "0"),
          toWei(contractBalance as string || "0"),
          contractTokenBalance?.value,
        ]
      : [
        toWei(tokenValue as string || "0"),
        contractTokenBalance?.value,
        toWei(contractBalance as string || "0"),
      ]
  );

  // Fetch the contract balance
  const fetchContractBalance = async () => {
    try {
      const balance = await sdk?.getBalance(DEX_CONTRACT);
      setContractBalance(balance?.displayValue || "0");
    } catch (error) {
      console.error(error);
    }
  };

  // Execute the swap
  // This function will swap the token to native or the native to the token
  const executeSwap = async () => {
    setIsLoading(true);
    try {
      if(currentFrom === "native") {
        await swapNativeToken({
          overrides: {
            value: toWei(nativeValue as string || "0"),
          }
        });
        alert("Swap executed successfully");
      } else {
        await approveTokenSpending({
          args: [
            DEX_CONTRACT,
            toWei(tokenValue as string || "0"),
          ]
        });
        await swapTokenToNative({
          args: [
            toWei(tokenValue as string || "0")
          ]
        });
        alert("Swap executed successfully");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to execute the swap");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the contract balance and update it every 10 seconds
  useEffect(() => {
    fetchContractBalance();
    setInterval(fetchContractBalance, 10000);
  }, []);

  // Update the amount to get based on the value
  useEffect(() => {
    if(!amountToGet) return;
    if(currentFrom === "native") {
      setTokenValue(toEther(amountToGet));
    } else {
      setNativeValue(toEther(amountToGet));
    }
  }, [amountToGet]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div style={{
          backgroundColor: "#2596be",
          padding: "2rem",
          borderRadius: "10px",
          minWidth: "500px",
        }}>
          <div style={{
            display: "flex",
            flexDirection: currentFrom === "native" ? "column" : "column-reverse",
            alignItems: "center",
            justifyContent: "center",
            margin: "10px",
          }}>
            <SwapInput
              current={currentFrom as string}
              type="native"
              max={nativeBalance?.displayValue}
              value={nativeValue as string}
              setValue={setNativeValue}
              tokenSymbol="ETH"
              tokenBalance= {nativeBalance?.displayValue}
            />
            <button 
              onClick={() => 
                  currentFrom === "native"
                  ? setCurrentFrom("token")
                  : setCurrentFrom("native")
              }
              className={styles.toggleButton}
            >↓</button>
            <SwapInput
              current={currentFrom as string}
              type="token"
              max={tokenBalance?.displayValue}
              value={tokenValue as string}
              setValue={setTokenValue}
              tokenSymbol={symbol as string}
              tokenBalance={tokenBalance?.displayValue}
            />
          </div>
          {address ? (
            <div style={{
              textAlign: "center",
              fontWeight: "bolder",
              color: "white",
              }}>
              <button
               onClick={executeSwap}
               disabled={isLoading as boolean}
               className={styles.swapButton}>
                {
                  isLoading
                  ? "Loading..."
                  : "Swap"
                }
              </button>
            </div>
          ) : (
                <div style={{
                  textAlign: "center",
                  fontWeight: "bolder",
                  color: "white",
                  }}>
                  <p>Connect your wallet</p>
                </div>
              )}
        </div>
      </div>
    </main>
  );
};

export default Home;