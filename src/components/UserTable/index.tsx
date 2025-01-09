import { useEffect, useState } from "react";
import './UserTable.css';

type History = {
  _id: string;
  wallet_id: string;
  amount: number;
};

export default function UserTable() {
  const [data, setData] = useState<History[]>([]);
  const [filteredData, setFilteredData] = useState<History[]>([]); 
  const [isMSS, setIsMSS] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5); 
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<number>(0);

  // Toggle the MSS/BNS switch
  const toggleSwitch = () => {
    setIsMSS((prev) => !prev);
  };

  // Fetch history data on initial load
  useEffect(() => {
    const fetchHistory = async () => {
      const token = sessionStorage.getItem("token"); 
      
      if (!token) {
        console.error("No token found.");
        return;
      }

      try {
        const response = await fetch("https://musksimpson-backend.onrender.com/api/v1/histories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch history data.");
        }

        const result = await response.json();
        setData(result.messages);
        setFilteredData(result.messages);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    const filtered = data.filter((item) =>
      item.wallet_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); 
  }, [searchTerm, data]);

  // Convert BNB to MSS or vice versa
  function switchCoin(amountOfBNB: number) {
    const bnbConversionRate = 84000000000;
    const amountOfMSS: number = amountOfBNB * bnbConversionRate;
    return isMSS ? `${amountOfMSS} MSS` : `${amountOfBNB} BNB`;
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Open modal to edit item
  const openEditModal = (walletId: string, amount: number) => {
    setSelectedWalletId(walletId);
    setNewAmount(amount);
    setIsModalOpen(true);
  };

  // Handle editing item amount
  const handleEdit = async () => {
    const token = sessionStorage.getItem("token");
    if (!token || !selectedWalletId) {
      console.error("No token or wallet ID found.");
      return;
    }

    try {
      const response = await fetch(`https://musksimpson-backend.onrender.com/api/v1/histories/${selectedWalletId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: newAmount }),
      });

      if (!response.ok) {
        throw new Error("Failed to update history data.");
      }

      const updatedData = await response.json();
      const updatedHistory = updatedData.messages;
      const newData = data.map((item) =>
        item.wallet_id === selectedWalletId ? { ...item, amount: updatedHistory.amount } : item
      );
      
      setData(newData);
      setFilteredData(newData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error editing history:", error);
    }
  };

  // Handle deleting item
  const handleDelete = async (walletId: string) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found.");
      return;
    }

    try {
      const response = await fetch(`https://musksimpson-backend.onrender.com/api/v1/histories/${walletId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete history data.");
      }

      const newData = data.filter((item) => item.wallet_id !== walletId);
      setData(newData);
      setFilteredData(newData);
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  if (data.length === 0) {
    return <h1>Loading...</h1>;
  } else {
    return (
      <div className="user-table">
        <div className="header">
          <h2>History</h2>
          <div className="switch-container">
            <label className="switch">
              <input type="checkbox" checked={isMSS} onChange={toggleSwitch} />
              <span className="slider"></span>
            </label>
            <p>{isMSS ? "MSS" : "BNB"}</p>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Wallet ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Wallet ID</th>
              <th>Transfer Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((element: any) => (
              <tr key={element._id}>
                <td>{element.wallet_id}</td>
                <td>{switchCoin(element.amount)}</td>
                <td>
                  <button className="edit" onClick={() => openEditModal(element.wallet_id, element.amount)}>
                    Edit
                  </button>
                  <button className="delete" onClick={() => handleDelete(element.wallet_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={currentPage === number ? "active" : ""}
            >
              {number}
            </button>
          ))}
        </div>

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Amount</h3>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
              />
              <button onClick={handleEdit}>Submit</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
