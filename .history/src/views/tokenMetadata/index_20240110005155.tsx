import { FC, useState, useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metadata, PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { AiOutlineClose } from "react-icons/ai";
import { ClipLoader } from "react-spinners";
import { notify } from "../../utils/notifications";

import { InputView } from "../index";
import Branding from "../../components/Branding";

export const ToeknMetadata: FC = ({ setOpenTokenMetaData }) => {
  const { connection } = useConnection();
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getMetadata = useCallback(
    async (form) => {
      setIsLoading(true);
      try {
        const tokenMint = new PublicKey(form);
        const metadataPDA = PublicKey.findProgramAddressSync(
          [
            Buffer.from("metadata"),
            PROGRAM_ID.toBuffer(),
            tokenMint.toBuffer(),
          ],
          PROGRAM_ID
        )[0];

        const metadataAccount = await connection.getAccountInfo(metadataPDA);
        const [metadata, _] = await Metadata.deserialize(metadataAccount.data);

        let logoRes = await fetch(metadata.data.uri);
        let logoJson = await logoRes.json();
        let { image } = logoJson;

        setTokenMetadata({ tokenMetadata, ...metadata.data });
        setLogo(image);
        setIsLoading(false);
        setLoaded(true);
        setTokenAddress("");
        notify({
          type: "success",
          message: " Successful fetch token metadata",
        });
        console.log("Successful fetch token metadata");
      } catch (error: any) {
        notify({ type: "error", message: "Token Metadata failed" });
        setIsLoading(false);
      }
    },
    [tokenAddress]
  );

  //COMPONENT
  const CloseModal = () => (
    <a
      onClick={() => setOpenTokenMetaData(false)}
      class="group mt-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-2xl transition-all duration-500 hover:bg-blue-600/60"
    >
      <i class="mdi mdi-facebook text-2xl text-white group-hover:text-white">
        <AiOutlineClose />
      </i>
    </a>
  );

  return (
    <>
      {isLoading && (
        <div className="absolute top-0 left-0 z-50 flex h-screen w-full items-center justify-center bg-black/[.3] backdrop-blur-[10px]">
          <ClipLoader />
        </div>
      )}
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

              {!loaded ? (
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
                      Link to your new token.
                    </h4>
                    <p class="text-default-300 mx-auto mb-5 max-w-sm">
                      You are now successfully Create your solana token.
                    </p>
                    <div class="flex items-start justify-center">
                      <img
                        src={"assets/images/logout.svg"}
                        alt=""
                        class="h-40"
                      />
                    </div>
                    <div class="mt-5 w-full text-center">
                      <p class="text-default-300 text-base font-medium leading-6"></p>
                      <InputView
                        name="Token Address"
                        placeholder=" address"
                        clickhandle={(e) => setTokenAddress(e.target.value)}
                      />

                      <div class="mb-6 text-center">
                        <button
                          onClick={() => getMetadata(tokenAddress)}
                          class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                        >
                          <span class="fw-bold">Get Token MetaData</span>{" "}
                        </button>
                      </div>
                      <CloseModal />
                    </div>
                  </div>
                </div>
              ) : (
                <div class="lg:ps-0 flex h-full flex-col p-10">
                  <div class="pb-10">
                    <a href="index.html" class="flex">
                      <img
                        src={"assets/images/logo.png"}
                        alt="dark logo"
                        class="h-10"
                      />
                    </a>
                  </div>
                  <div class="my-auto pb-6 text-center">
                    <div class="flex items-start justify-center">
                      <img src={logo} alt="" class="h-40" />
                    </div>
                    <div class="mt-5 w-full text-center">
                      <p class="text-default-300 text-base font-medium leading-6"></p>
                      <InputView
                        name="Token Name"
                        placeholder={tokenMetadata?.name}
                      />

                      <InputView
                        name="Symbol"
                        placeholder={tokenMetadata?.symbol || "undefined"}
                      />
                      <InputView
                        name="Token URI"
                        placeholder={tokenMetadata?.uri}
                      />

                      <div class="mb-6 text-center">
                        <a
                          href={tokenMetadata?.uri}
                          target="_blank"
                          rel="noreferrer"
                          class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                        >
                          <span class="fw-bold">Open URI</span>{" "}
                        </a>

                        <CloseModal />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
