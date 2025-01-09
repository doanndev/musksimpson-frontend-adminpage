"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Thêm useRouter để chuyển hướng
import Sidebar from "@/components/Sidebar/index";
import UserTable from "@/components/UserTable/index";
import "../admin/AdminDashboard.css";

export default function AdminDashboard() {
  const [tab, setTab] = useState<number>(1);
  const [totalCoin, setTotalCoin] = useState<number>(0);
  const [valueWantSell, setValueWantSell] = useState<number>(0);
  const [valueWantReset, setValueWantReset] = useState<number>(0);
  const [valueByWalletId, setValueByWalletId] = useState<number>(0);
  const [walletId, setWalletId] = useState<string>('');
  const router = useRouter(); // Khai báo useRouter

  useEffect(() => {
    getTotalCoin();
  }, []);

  async function getTotalCoin() {
    const response = await fetch("https://musksimpson-backend.onrender.com/api/v1/total-coin");
    const result = await response.json();
    setTotalCoin(result.messages);
  }

  async function updateTotalCoin(amount: number) {
    const requestBody = {
      amount: amount
    };
    const response = await fetch('https://musksimpson-backend.onrender.com/api/v1/total-coin', {
      method: 'POST', 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    if (result.status == 'success') {
      setTotalCoin(result.amount);
    } else {
      alert(result.messages);
    }
    console.log(result);
  }

  async function resetTotalCoin(resetAmount: number) {
    const requestBody = {
      resetAmount: resetAmount
    };
    const token = sessionStorage.getItem('token');
    const response = await fetch('https://musksimpson-backend.onrender.com/api/v1/total-coin/reset', {
      method: 'POST', 
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json();
    if (result.status == 'success') {
      getTotalCoin();
    } else {
      alert(result.messages);
    }
  }

  async function getAmountByWalletId(walletId: string) {
    const response = await fetch(`https://musksimpson-backend.onrender.com/api/v1/user-order/${walletId}`);
    const result = await response.json();
    setValueByWalletId(result.amount);
  }

  // Hàm đăng xuất
  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Xóa token khỏi sessionStorage
    router.push('/'); // Chuyển hướng đến trang login
  };

  const renderTabContent = () => {
    switch (tab) {
      case 1:
        return <UserTable />;
      case 2:
        return (
          <div className="content-tab">
            <h2>Total Coin</h2>
            <div className="total-container">
              <h1>{totalCoin}</h1>
              <h3>Decrease Total Supply</h3>
              <input value={valueWantSell} onChange={(e) => setValueWantSell(Number(e.target.value))}  className="admin-input" type="text" placeholder="Enter Amount" />
              <button onClick={() => updateTotalCoin(valueWantSell)} className="admin-button">Submit</button>
              <h3>Set Total Supply</h3>
              <input value={valueWantReset} onChange={(e) => setValueWantReset(Number(e.target.value))}  className="admin-input" type="text" placeholder="Enter Amount" />
              <button onClick={() => resetTotalCoin(valueWantReset)} className="admin-button">Submit</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="content-tab">
            <h1>Get Amount By Wallet Id</h1>
            <h1>{valueByWalletId} BNB</h1>
            <input value={walletId} onChange={(e) => setWalletId(e.target.value)} className="admin-input" type="text" placeholder="Enter Wallet ID" />
            <button onClick={() => getAmountByWalletId(walletId)} className="admin-button">Submit</button>
          </div>
        );
      default:
        return <div className="content-tab">Content not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar setTab={setTab} />
      <div className="main-content">
        <button onClick={handleLogout} className="logout-button">Logout</button> 
        {renderTabContent()}
      </div>
    </div>
  );
}
