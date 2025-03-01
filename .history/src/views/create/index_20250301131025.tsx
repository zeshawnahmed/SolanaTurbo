import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,  // <-- Make sure this is included
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
//UI PART/
import { AiOutlineClose } from "react-icons/ai";
import { InputView } from "../index";
import { FC } from "react";
import CreateSVG from "../../components/SVG/CreateSVG";
import Branding from "../../components/Branding";

const PINATA_AIP = process.env.NEXT_PUBLIC_PINATA_AIP_KEY;
const PINATA_SECRECT = process.env.NEXT_PUBLIC_PINATA_SECRECT_KEY;

export const CreateView: FC = ({ setOpenCreateModal }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();

  const [tokenUri, setTokenUri] = useState("");
  const [tokenMintAddress, setTokenMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [hasPaid, setHasPaid] = useState(false);

const handleFeePayment = async () => {
  if (!publicKey) return;
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey("C7fGEja2rSDavTZPK3apRqzpSqEeNq6Sj5dsDAT6iMQ4"),
      lamports: 0.4 * LAMPORTS_PER_SOL,
    })
  );
  try {
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);
    setHasPaid(true);
    notify({ type: "success", message: "Fee paid successfully!" });
  } catch (error) {
    notify({ type: "error", message: "Payment failed!" });
  }
};


  const [token, setToken] = useState({
    name: "",
    symbol: "",
    decimals: "",
    amount: "",
    image: "",
    description: "",
  });

  const handleFormFieldChange = (fieldName, e) => {
    setToken({ ...token, [fieldName]: e.target.value });
  };

  const createToken = useCallback(
    async (token) => {
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const mintKeypair = Keypair.generate();
      const tokenATA = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      try {
        const metadataUrl = await uploadMetadata(token);
        console.log(metadataUrl);

        const createMetadataInstruction =
          createCreateMetadataAccountV3Instruction(
            {
              metadata: PublicKey.findProgramAddressSync(
                [
                  Buffer.from("metadata"),
                  PROGRAM_ID.toBuffer(),
                  mintKeypair.publicKey.toBuffer(),
                ],
                PROGRAM_ID
              )[0],
              mint: mintKeypair.publicKey,
              mintAuthority: publicKey,
              payer: publicKey,
              updateAuthority: publicKey,
            },
            {
              createMetadataAccountArgsV3: {
                data: {
                  name: token.name,
                  symbol: token.symbol,
                  uri: metadataUrl,
                  creators: null,
                  sellerFeeBasisPoints: 0,
                  uses: null,
                  collection: null,
                },
                isMutable: false,
                collectionDetails: null,
              },
            }
          );

        const createNewTokenTransaction = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports: lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            Number(token.decimals),
            publicKey,
            publicKey,
            TOKEN_PROGRAM_ID
          ),
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenATA,
            publicKey,
            mintKeypair.publicKey
          ),
          createMintToInstruction(
            mintKeypair.publicKey,
            tokenATA,
            publicKey,
            Number(token.amount) * Math.pow(10, Number(token.decimals))
          ),
          createMetadataInstruction
        );
        const signature = await sendTransaction(
          createNewTokenTransaction,
          connection,
          {
            signers: [mintKeypair],
          }
        );

        setTokenMintAddress(mintKeypair.publicKey.toString());
        notify({
          type: "success",
          message: "Token creation successful",
          txid: signature,
        });
      } catch (error: any) {
        notify({ type: "error", message: "Token creation failed" });
      }
      setIsLoading(false);
    },
    [publicKey, connection, sendTransaction]
  );

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgUrl = await uploadImagePinata(file);
      setToken({ ...token, image: imgUrl });
    }
  };

  //---UPLOAD TO IPFS FUNCTION
  const uploadImagePinata = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: PINATA_AIP,
            pinata_secret_api_key: PINATA_SECRECT,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

        return ImgHash;
      } catch (error: any) {
        notify({ type: "error", message: "Upload image failed" });
      }
      setIsLoading(false);
    }
  };

  const uploadMetadata = async (token) => {
    setIsLoading(true);
    const { name, symbol, description, image } = token;
    console.log(name, symbol, description, image);
    if (!name || !symbol || !description || !image)
      return console.log("Data Missing");

    const data = JSON.stringify({
      name: name,
      symbol: symbol,
      description: description,
      image: image,
    });

    try {
      const response = await axios({
        method: "POST",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: PINATA_AIP,
          pinata_secret_api_key: PINATA_SECRECT,
          "Content-Type": "application/json",
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      return url;
    } catch (error: any) {
      notify({ type: "error", message: "Upload failed" });
    }
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <div className="absolute top-0 left-0 z-50 flex h-screen w-full items-center justify-center bg-black/[.3] backdrop-blur-[10px]">
          <ClipLoader />
        </div>
      )}

      {!tokenMintAddress ? (
        <section class="flex h-full  w-full items-center py-6 px-0  lg:p-10">
          <div class="container ">
            <div class="bg-default-950/40 mx-auto max-w-5xl rounded-2xl backdrop-blur-2xl">
              <div class="grid gap-10 lg:grid-cols-2">
                <div class="ps-4 hidden py-4 pt-10 lg:block">
                  <div class="upload relative  w-full overflow-hidden rounded-xl">
                    {token.image ? (
                      <img src={token.image} alt="token" className="w-2/5" />
                    ) : (
                      <label for="file" class="custum-file-upload ">
                        <div class="icon">
                          <CreateSVG />
                        </div>
                        <div class="text">
                          <span>Click to upload image</span>
                        </div>
                        <input
                          id="file"
                          onChange={handleImageChange}
                          type="file"
                        />
                      </label>
                    )}
                  </div>
                  <textarea
                    onChange={(e) => handleFormFieldChange("description", e)}
                    class="border-default-200 relative mt-48 block w-full w-full rounded border-white/10 bg-transparent py-1.5 px-3 text-white/80 focus:border-white/25 focus:ring-transparent"
                    rows="6"
                    placeholder="Description of your token..."
                  ></textarea>
                </div>

                <div class="lg:ps-0 flex flex-col p-10">
                  <div class="pb6 my-auto ">
                    <h4 class="mb-4 mt-48 lg:mt-0 text-2xl font-bold text-white">
                      Solana Token Creator
                    </h4>
                    <p class="text-default-300 mb-8 max-w-sm ">
                      Kindly provide all the details about your token
                    </p>

                    <div class="text-start">
                      {token.image ? (
                        <div class="flex lg:hidden  items-start justify-center">
                          <img
                            src={token.image}
                            className="w-2/5"
                            alt="token"
                          />
                        </div>
                      ) : (
                        <div class="messageBox">
                          <div class="fileUploadWrapper">
                            <label for="file">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 337 337"
                              >
                                <circle
                                  stroke-width="20"
                                  stroke="#6c6c6c"
                                  fill="none"
                                  r="158.5"
                                  cy="168.5"
                                  cx="168.5"
                                ></circle>
                                <path
                                  stroke-linecap="round"
                                  stroke-width="25"
                                  stroke="#6c6c6c"
                                  d="M167.759 79V259"
                                ></path>
                                <path
                                  stroke-linecap="round"
                                  stroke-width="25"
                                  stroke="#6c6c6c"
                                  d="M79 167.138H259"
                                ></path>
                              </svg>
                              <span class="tooltip">Add an image</span>
                            </label>
                            <input
                              onChange={handleImageChange}
                              type="file"
                              id="file"
                              name="file"
                            />
                          </div>
                        </div>
                      )}

                      <textarea
                        onChange={(e) =>
                          handleFormFieldChange("description", e)
                        }
                        class="border-default-200 mt-4 relative lg:hidden  block w-full w-full rounded border-white/10 bg-transparent py-1.5 px-3 text-white/80 focus:border-white/25 focus:ring-transparent"
                        rows="3"
                        placeholder="Description of your token..."
                      ></textarea>

                      <InputView
                        name="Name"
                        placeholder=" name"
                        clickhandle={(e) => handleFormFieldChange("name", e)}
                      />
                      <InputView
                        name="Synbol"
                        placeholder=" synbol"
                        clickhandle={(e) => handleFormFieldChange("symbol", e)}
                      />
                      <InputView
                        name="Decimals"
                        placeholder="decimals"
                        clickhandle={(e) =>
                          handleFormFieldChange("decimals", e)
                        }
                      />
                      <InputView
                        name="Amount"
                        placeholder=" amount"
                        clickhandle={(e) => handleFormFieldChange("amount", e)}
                      />

                      <div class="mb-6 text-center">
  <button
    onClick={handleFeePayment}
    class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
  >
    Pay 0.4 SOL Fee
  </button>
  <button
    onClick={() => createToken(token)}
    disabled={!hasPaid}
    class={`${
      hasPaid ? "bg-primary-600/90" : "bg-gray-400"
    } group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500`}
    type="submit"
  >
    <span class="fw-bold">Create Token (Click X below to Return to Home Page)</span>
  </button>
</div>

                    </div>
                  </div>
                  <div>
                    <div class="text-center">
                      <ul class="flex flex-wrap items-center justify-center gap-2">
                        <li>
                          <a
                            onClick={() => setOpenCreateModal(false)}
                            class="group inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-2xl transition-all duration-500 hover:bg-blue-600/60"
                          >
                            <i class="mdi mdi-facebook text-2xl text-white group-hover:text-white">
                              <AiOutlineClose />
                            </i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section class="flex w-full items-center py-6 px-0 lg:h-screen lg:p-10">
          <div class="container">
            <div class="bg-default-950/40 mx-auto max-w-5xl overflow-hidden rounded-2xl backdrop-blur-2xl">
              <div class="grid gap-10 lg:grid-cols-2">
                {/* //FIRST */}
                <Branding
                  image="auth-img"
                  title="to build your marketing strategy"
                  message="Try all paid functions for free. just register and
                            create your first widget, it simple and fast."
                />
                {/* //SECOND */}
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
                    <h4 class="mb-4 text-2xl font-bold text-white">
                      Link to your new token.
                    </h4>
                    <p class="text-default-300 mx-auto mb-5 max-w-sm">
                      You are now successfully Create your solana token.
                    </p>
                    <div class="flex items-start justify-center">
                      <img
                        src={token.image || "assets/images/logo.png"}
                        alt=""
                        class="h-40"
                      />
                    </div>
                    <div class="mt-5 w-full text-center">
                      <p class="text-default-300 text-base font-medium leading-6">
                        <InputView
                          name="Token Address"
                          placeholder={tokenMintAddress}
                        />
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            navigator.clipboard.writeText(tokenMintAddress)
                          }
                        >
                          Copy
                        </span>
                      </p>
                      <div class="mb-6 text-center">
                        <a
                          href={`https://explorer.solana.com/address/${tokenMintAddress}?cluster=${networkConfiguration}`}
                          target="_blank"
                          rel="noreferrer"
                          class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                        >
                          <span class="fw-bold">View On Solana</span>{" "}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
