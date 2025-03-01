import { FC, useEffect, useCallback } from "react";
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, TransactionSignature } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import { AiOutlineClose } from "react-icons/ai";

//INTERNAL IMPORT
import { InputView } from "../index";
import Branding from "../../components/Branding";

export const AirdropView: FC = ({ setOpenAirdrop }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const balance = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58());
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  const onClick = useCallback(async () => {
    if (!publicKey) {
      console.log("error", "Wallet not connected!");
      notify({
        type: "error",
        message: "error",
        description: "Wallet not connected!",
      });
      return;
    }

    let signature: TransactionSignature = "";

    try {
      signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      notify({
        type: "success",
        message: "Airdrop successful!",
        txid: signature,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      getUserSOLBalance(publicKey, connection);
    } catch (error: any) {
      notify({
        type: "error",
        message: `Airdrop failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log("error", `Airdrop failed! ${error?.message}`, signature);
    }
  }, [publicKey, connection, getUserSOLBalance]);

  //COMPONENT
  const CloseModal = () => (
    <a
      onClick={() => setOpenAirdrop(false)}
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
                  <img src={"assets/images/logout.svg"} alt="" class="h-40" />
                </div>
                <div class="mt-5 w-full text-center">
                  <div class="mb-6 text-center">
                    <button
                      onClick={onClick}
                      disabled={!publicKey}
                      class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                    >
                      <span class="fw-bold">Airdrop 1</span>{" "}
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
