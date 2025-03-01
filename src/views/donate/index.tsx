import { FC, useEffect, useCallback, useState } from "react";
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { notify } from "../../utils/notifications";
import { AiOutlineClose } from "react-icons/ai";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";

//INTERNAL IMPORT
import { InputView } from "../index";
import Branding from "../../components/Branding";

const RECEIVER = process.env.NEXT_PUBLIC_RECEIVER;

export const DonateView: FC = ({ setOpenSendTransaction }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0.0");

  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  const solInputValidation = async (e) => {
    const monstrosity = /((^\.(\d+)?$)|(^\d+(\.\d*)?$)|(^$))/;
    const res = new RegExp(monstrosity).exec(e.target.value);
    res && setAmount(e.target.value);
  };

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: "error", message: `Wallet not connected!` });
      console.log("error", `Send Transaction: Wallet not connected!`);
      return;
    }

    const creatorAddress = new PublicKey(RECEIVER);
    let signature: TransactionSignature = "";

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: creatorAddress,
          lamports: LAMPORTS_PER_SOL * Number(amount),
        })
      );

      signature = await sendTransaction(transaction, connection);

      notify({
        type: "success",
        message: "Transaction successful!",
        txid: signature,
      });
    } catch (error: any) {
      notify({
        type: "error",
        message: `Transaction failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log("error", `Transaction failed! ${error?.message}`, signature);
      return;
    }
  }, [publicKey, amount, sendTransaction, connection]);

  //COMPONENT
  const CloseModal = () => (
    <a
      onClick={() => setOpenSendTransaction(false)}
      class="group mt-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-2xl transition-all duration-500 hover:bg-blue-600/60"
    >
      <i class="mdi mdi-facebook text-2xl text-white group-hover:text-white">
        <AiOutlineClose />
      </i>
    </a>
  );

  return (
    <section class="flex w-full items-center py-6 px-0 lg:h-screen lg:p-10">
      <div class="container">
        <div class="bg-default-950/40 mx-auto max-w-5xl overflow-hidden rounded-2xl backdrop-blur-2xl">
          <div class="grid gap-10 lg:grid-cols-2">
            <Branding
              image="auth-img"
              title="to build your marketing strategy"
              message="Try all paid functions for free. just register and
                            create your first widget, it simple and fast."
            />

            <div class="lg:ps-0 flex h-full flex-col p-10">
              <div class="pb-10">
                <a href="index.html" class="flex">
                  <img
                    src={"assets/images/logo1.png"}
                    alt="dark logo"
                    class="h-10"
                  />
                </a>
              </div>
              <div class="my-auto pb-6 text-center">
                <h4 class="mb-4 text-2xl font-bold text-white">
                  {wallet && (
                    <p>SOL Balance: {(balance || 0).toLocaleString()}</p>
                  )}
                </h4>
                <p class="text-default-300 mx-auto mb-5 max-w-sm">
                  You are now successfully Create your solana token.
                </p>
                <div class="flex items-start justify-center">
                  <img src={"assets/images/logo1.png"} alt="" class="h-40" />
                </div>
                <div class="text-start">
                  <InputView
                    name="Amount"
                    placeholder=" amount"
                    clickhandle={(e) => solInputValidation(e)}
                  />
                </div>
                <div class="mt-5 w-full text-center">
                  <div class="mb-6 text-center">
                    <button
                      onClick={onClick}
                      disabled={!publicKey}
                      class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                    >
                      <span class="fw-bold">Donate</span>{" "}
                    </button>
                    <CloseModal />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
