import { ConnectWallet } from "@thirdweb-dev/react";
import { favicon } from "./public";

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
                <h1>
                    <img
                        src={ favicon }
                        alt="BunCoin Logo"
                        classname="w-16 h-16 object-containt"
                    />
                    BunSwap
                </h1>
            </div>
            <ConnectWallet/>
        </div>
    )
}
