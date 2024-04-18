import { ConnectWallet } from "@thirdweb-dev/react";

export default function Navbar() {
    return (
        <div style={{
            display: "flex",
            padding: "1em",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0px",
            background: "#2596be",
        }}>
            <div style={{
                marginLeft: "20px",
                color: "white",
                }}>
                <h1>BunSwap</h1>
            </div>
            <ConnectWallet/>
        </div>
    )
}