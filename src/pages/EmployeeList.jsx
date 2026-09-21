import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import PageHeader from "../components/PageHeader";
import { FaEllipsisV, FaPlus } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import UserForm from "../components/UserForm.jsx";
import ConfirmAlert from "../components/ConfirmAlert.jsx";
import DataTable from "../components/DataTable";

const EmployeeList = () => {
  const { getEmployee, usersData, deleteUser, authUser } = useAuthStore();
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await getEmployee(authUser.branchId, currentPage, itemsPerPage, searchQuery);
      setIsLoading(false);
    };
    fetchData();
  }, [authUser.branchId, currentPage, itemsPerPage, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleShowForm = (user = null, changePassword = false) => {
    setSelectedUser(user ? { ...user, changePassword } : null);
    setShowUserForm(true);
  };

  const handleConfirm = (userId) => {
    setSelectedUserId(userId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
      await deleteUser(selectedUserId, "employee");
      setShowConfirm(false);
      setSelectedUserId(null);
    }
  };

  const columns = [
    { header: "#", render: (_, index) => index + 1 },
    { header: "Employee Username", accessor: "username" },
    { header: "Position", accessor: "position" },
    { header: "Created Date", render: (row) => formatDate(row.createdAt) },
    { header: "Created By", render: (row) => row.createdBy?.username },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3.5">
          <Trash2
            className="cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
            size={18}
            onClick={() => handleConfirm(row._id)}
          />
          <Pencil
            className="cursor-pointer text-gray-500 hover:text-blue-500 transition-colors"
            size={18}
            onClick={() => handleShowForm(row)}
          />
        </div>
      ),
    },
  ];

  const topContent = (
    <PageHeader
      mainHead="Employee List"
      subText={`${usersData?.totalEmployees || 0} Employees`}
      searchQuery={searchQuery}
      setSearchQuery={(query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to page 1 on new search
      }}
      showDateFilter={false}
      placeholder="Search by employee username"
    />
  );

  return (
    <div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={usersData?.employees || []}
          topContent={topContent}
          serverSide={true}
          totalItems={usersData?.totalEmployees || 0}
          currentPage={currentPage}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <div
        onClick={handleShowForm}
        className="bg-black p-3 bottom-10 right-10 rounded-full fixed cursor-pointer"
      >
        <FaPlus size={25} color="#FFFFFF" />
      </div>

      {showUserForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <UserForm
            formTitile="ENTER EMPLOYEE DETAILS"
            role="employee"
            closeForm={setShowUserForm}
            userData={selectedUser}
          />
        </div>
      )}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo="You want to delete this user ?"
            handleClose={() => setShowConfirm(false)}
            handleSubmit={confirmDelete}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
