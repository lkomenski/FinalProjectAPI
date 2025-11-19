import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import VendorForm from "./VendorForm";
import VendorDetailModal from "./VendorDetailModal";
import TokenModal from "../Components/TokenModal";
import "../Styles/Dashboard.css";

export default function VendorManagement() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailVendorId, setDetailVendorId] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSort, setVendorSort] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      const data = await fetchData("vendors");
      setVendors(data || []);
      setFilteredVendors(data || []);
    } catch (err) {
      setError(err.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  // Vendor filtering
  useEffect(() => {
    let list = [...vendors];

    if (vendorFilter === "active") list = list.filter(v => v.isActive);
    if (vendorFilter === "inactive") list = list.filter(v => !v.isActive);

    if (vendorSearch.trim() !== "") {
      const s = vendorSearch.toLowerCase();
      list = list.filter(v =>
        v.vendorName.toLowerCase().includes(s) ||
        v.vendorCity.toLowerCase().includes(s) ||
        v.vendorContactFName.toLowerCase().includes(s) ||
        v.vendorContactLName.toLowerCase().includes(s)
      );
    }

    if (vendorSort) list.sort((a, b) => (a[vendorSort] > b[vendorSort] ? 1 : -1));

    setFilteredVendors(list);
    setCurrentPage(1); // Reset to first page when filters change
  }, [vendors, vendorSearch, vendorSort, vendorFilter]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  async function toggleVendorStatus(id, activate) {
    const endpoint = activate
      ? `http://localhost:5077/api/vendors/activate/${id}`
      : `http://localhost:5077/api/vendors/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    loadVendors();
  }

  async function generateToken(vendorId) {
    try {
      const response = await fetch(`http://localhost:5077/api/vendors/generate-token/${vendorId}`, { method: "POST" });
      const data = await response.json();
      
      if (response.ok) {
        // Show token in modal instead of alert
        setTokenData({
          registrationToken: data.registrationToken,
          tokenExpiry: data.tokenExpiry,
          hoursUntilExpiry: data.hoursUntilExpiry,
          vendorID: data.vendorID,
          vendorName: data.vendorName,
          firstName: data.firstName,
          lastName: data.lastName,
          vendorEmail: data.vendorEmail
        });
        setShowTokenModal(true);
        setShowDetailModal(false); // Close detail modal when showing token
      } else {
        alert(`Failed to generate token: ${data}`);
      }
    } catch (err) {
      alert("Failed to generate token");
    }
  }

  function handleFormClose() {
    setSelectedVendor(null);
    setIsAddingVendor(false);
    loadVendors();
  }

  function openVendorDetail(vendorId) {
    setDetailVendorId(vendorId);
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setDetailVendorId(null);
    loadVendors(); // Reload in case any changes were made
  }

  function closeTokenModal() {
    setShowTokenModal(false);
    setTokenData(null);
    loadVendors(); // Reload vendors after token generation
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Vendor Management</span>
      </div>

      <h2 className="dashboard-title">Vendor Management</h2>

      <div className="filters-row" style={{ marginTop: '30px' }}>
        <input 
          className="dashboard-input" 
          placeholder="Search vendors..." 
          value={vendorSearch}
          onChange={(e) => setVendorSearch(e.target.value)} 
        />

        <select className="dashboard-select" value={vendorSort} onChange={(e) => setVendorSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="vendorName">Name</option>
          <option value="vendorCity">City</option>
          <option value="vendorState">State</option>
          <option value="isActive">Status</option>
        </select>

        <select className="dashboard-select" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="">Show All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          className="dashboard-btn dashboard-btn-success"
          onClick={() => { setSelectedVendor(null); setIsAddingVendor(true); }}
        >
          + Add Vendor
        </button>
      </div>

      {/* Vendor List */}
      <div style={{ marginTop: '20px' }}>
        {currentVendors.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No vendors found.</p>
        ) : (
          currentVendors.map((v) => (
            <div 
              key={v.vendorID} 
              className="dashboard-list-item"
              onClick={() => openVendorDetail(v.vendorID)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <strong>{v.vendorName}</strong>
                <p>{v.vendorCity}, {v.vendorState}</p>
                <p>Contact: {v.vendorContactFName} {v.vendorContactLName}</p>
                <span className={v.isActive ? "text-green-700" : "text-red-600"}>
                  {v.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="pagination-info">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} vendors
      </div>

      {(isAddingVendor || selectedVendor) && (
        <VendorForm
          vendor={selectedVendor}
          onClose={handleFormClose}
        />
      )}

      {showDetailModal && detailVendorId && (
        <VendorDetailModal
          vendor={vendors.find(v => v.vendorID === detailVendorId)}
          onClose={closeDetailModal}
          onEdit={() => {
            const vendor = vendors.find(v => v.vendorID === detailVendorId);
            setSelectedVendor(vendor);
            setIsAddingVendor(false);
            setShowDetailModal(false);
          }}
          onToggleStatus={toggleVendorStatus}
          onGenerateToken={generateToken}
        />
      )}

      {showTokenModal && tokenData && (
        <TokenModal
          tokenData={tokenData}
          onClose={closeTokenModal}
        />
      )}
    </div>
  );
}
