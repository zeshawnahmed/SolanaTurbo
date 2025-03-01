import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  HomeView,
  ToolView,
  FeatureView,
  OfferView,
  FaqView,
  CreateView,
  ToeknMetadata,
  ContactView,
  AirdropView,
  DonateView,
} from "../views";

const Home: NextPage = (props) => {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openTokenMetaData, setOpenTokenMetaData] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [openAirdrop, setOpenAirdrop] = useState(false);
  const [openSendTransaction, setOpenSendTransaction] = useState(false);
  return (
    <>
      <Head>
        <title>Solana Token Creator</title>
        <meta name="description" content="Solana token creator" />
      </Head>
      <HomeView setOpenCreateModal={setOpenCreateModal} />
      <ToolView
        setOpenCreateModal={setOpenCreateModal}
        setOpenTokenMetaData={setOpenTokenMetaData}
        setOpenContact={setOpenContact}
        setOpenAirdrop={setOpenAirdrop}
        setOpenSendTransaction={setOpenSendTransaction}
      />
      <FeatureView
        setOpenCreateModal={setOpenCreateModal}
        setOpenTokenMetaData={setOpenTokenMetaData}
        setOpenContact={setOpenContact}
        setOpenAirdrop={setOpenAirdrop}
        setOpenSendTransaction={setOpenSendTransaction}
      />
      <OfferView />
      <FaqView />
      {/* // */}
      {openCreateModal && (
        <div className="new_loader relative h-full   bg-slate-900">
          <CreateView setOpenCreateModal={setOpenCreateModal} />
        </div>
      )}

      {openTokenMetaData && (
        <div className="new_loader relative h-full bg-slate-900">
          <ToeknMetadata setOpenTokenMetaData={setOpenTokenMetaData} />
        </div>
      )}

      {openContact && (
        <div className="new_loader relative h-full bg-slate-900">
          <ContactView setOpenContact={setOpenContact} />
        </div>
      )}
      {openAirdrop && (
        <div className="new_loader relative h-full bg-slate-900">
          <AirdropView setOpenAirdrop={setOpenAirdrop} />
        </div>
      )}
      {openSendTransaction && (
        <div className="new_loader relative h-full bg-slate-900">
          <DonateView setOpenSendTransaction={setOpenSendTransaction} />
        </div>
      )}
    </>
  );
};

export default Home;
