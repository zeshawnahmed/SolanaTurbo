import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountInstruction,
  PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";
import { FC, useCallback, useState } from "react";
import { notify } from "../../utils/notifications";
import { ClipLoader } from "react-spinners";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import { AiOutlineClose } from "react-icons/ai";
import { InputView } from "../index";
import CreateSVG from "../../components/SVG/CreateSVG";
import Branding from "../../components/Branding";

const PINATA_AIP = process.env.NEXT_PUBLIC_PINATA_AIP_KEY;
const PINATA_SECRECT = process.env.NEXT_PUBLIC_PINATA_SECRECT_KEY;

export const CreateView: FC = ({ setOpenCreateModal }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();

  const [tokenMintAddress, setTokenMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  const handlePayFee = async () => {
    if (!publicKey) return;
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("C7fGEja2rSDavTZPK3apRqzpSqEeNq6Sj5dsDAT6iMQ4"),
          lamports: 0.4 * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setHasPaid(true);
      notify({ type: "success", message: "Fee paid successfully" });
    } catch (error) {
      console.error("Fee payment failed", error);
      notify({ type: "error", message: "Fee payment failed" });
    }
  };

  return (
    <div class="mb-6 text-center">
      <button
        onClick={handlePayFee}
        class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
      >
        Pay 0.4 SOL Fee
      </button>
      <button
        disabled={!hasPaid}
        class={`${hasPaid ? "bg-primary-600/90" : "bg-gray-400"} group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500`}
      >
        Create Token
      </button>
    </div>
  );
};
