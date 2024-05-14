import { Row,Col } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {AiOutlineQrcode,AiTwotoneContainer,AiOutlineKey,AiOutlineUser} from 'react-icons/ai';
import WalletResetPasswordModal from "../component/WalletResetPasswordModal";
import { useTranslation } from 'react-i18next';
import Wallet from '../../utils/wallet';
import {SERVER_URL} from "../../constants/env";
    
function WalletProfile() {
  const [t,i18n] = useTranslation();
  const [use,setUser] = useState(JSON.parse(localStorage.getItem("userInfo")));
  const [showModal,setShowModal] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("");
  const [publicKey, setPublicKey]=useState(localStorage.getItem("publicKey"));
  const [ethPrice, setEthPrice] = useState(0);
  const wallet = new Wallet();
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setConnectedAccount("");
    } else {
      setConnectedAccount(accounts[0]);
    }
  };

  const connectMetamask = async () => {
    const accountAddress = await wallet.connectColdWallet();

    if(accountAddress) {
      setConnectedAccount(accountAddress);
    } else {
      alert("Failed to connect wallet");
    }
  }

  const getCurrentEthPrice = async () => {
    const response = await axios.post(SERVER_URL + "wallets/gettokenprice", {
      symbol: "eth",
      publicKey: publicKey
    });

    if(response.data.data) {
      setEthPrice(response.data.data);
    }
  }

  useEffect(async () => {
    const accountAddress = await wallet.checkWalletConnection();
    if(accountAddress) setConnectedAccount(accountAddress);

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(getCurrentEthPrice, [])


  return (
    <Col span={22} offset={1} className="mt-8 myColor1 text-sm">
      <Row>
        <Col span={20}>
         {t('Email Address')} 
        </Col>
        <Col span={4} className="text-center text-overflow">
          {t('Edit Password')}
        </Col>
      </Row>

      <Row className="text-lg font-bold ">
        <Col span={20}>
          {t(use.email)}
        </Col>
        <Col span={4} className="text-center">
          <a onClick={()=>setShowModal(true)}><AiOutlineKey size={20} className="inline mr-2"/></a>
        </Col>
      </Row>

      <Row className="text-lg font-bold mt-10 ">
        <Col span={20}>
         {t('Current ETH Price:')} 
        </Col>
        <Col span={4} className="text-center text-overflow">
          {formatter.format(ethPrice)}
        </Col>
      </Row>

      <Row>
        <Col span={10}>
          <button
            onClick={connectMetamask}
            className="my-10 myButton myBule text-white px-3 xl:px-6 font-bold"
          > 
            {connectedAccount === "" ? t('Connect Wallet') : t('Connected')} 
          </button>
        </Col>
        <Col span={14} className="text-center text-overflow my-11 font-bold ">
          {connectedAccount != "" ? `Connected account: ${connectedAccount}` : "No account connected"}
        </Col>
      </Row>

      {
        showModal?
          <WalletResetPasswordModal  setModalShow={setShowModal} title="Reset Password"/>
        : null
      }
    </Col>
  );
}

export default WalletProfile;