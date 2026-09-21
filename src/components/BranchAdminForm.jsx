import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import Tooltip from "./Tooltip";
import InputLine from "./InputLine";
import CheckDropdown from "./CheckDropdown";
import PasswordField from "./PasswordField";
import SquareButton from "./SquareButton";
import { useBranch } from "../store/useBranchStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const BranchAdminForm = ({ setShowAdminForm, branchName, branchId, isSuperAdminView, onSuccess }) => {
  const { addBranchAdmin, isLoading: storeLoading, getBranchAdmin, getBranches, branchDetails } = useBranch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    adminRoles: [],
    accessibleBranches: [],
    primaryBranch: branchId || ""
  });

  useEffect(() => {
    if (isSuperAdminView && (!branchDetails || branchDetails.length === 0)) {
      getBranches();
    }
  }, [isSuperAdminView]);

  const handleCloseAdminForm = () => {
    setShowAdminForm(false);
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleRoleChange = (selectedRoles) => {
    setFormData((prev) => ({
      ...prev,
      adminRoles: selectedRoles,
    }));
  };

  const handleBranchChange = (selectedBranches) => {
    setFormData((prev) => ({
      ...prev,
      accessibleBranches: selectedBranches.map(b => b.value),
      primaryBranch: selectedBranches.length > 0 ? selectedBranches[0].value : ""
    }));
  };

  const handleSubmitForm = async () => {
    try {
      setLoading(true);
      if (isSuperAdminView) {
        if (formData.accessibleBranches.length === 0) {
          toast.error("Please select at least one branch");
          setLoading(false);
          return;
        }
        await axiosInstance.post("/auth/create-admin", {
          ...formData,
          branchId: formData.primaryBranch
        });
        toast.success("Administrator created successfully");
        if (onSuccess) onSuccess();
      } else {
        await addBranchAdmin(branchName, formData);
        await getBranchAdmin(branchId);
        handleCloseAdminForm();
      }
    } catch (error) {
      console.error("Failed to add admin:", error);
      if (isSuperAdminView) {
        toast.error(error.response?.data?.message || "Failed to create administrator");
      }
    } finally {
      setLoading(false);
    }
  };

  const branchOptions = branchDetails?.map(b => ({ label: b.branchName, value: b._id })) || [];
  const roleOptions = ["air_cargo_admin", "ship_cargo_admin", "superadmin", "invoice", "approve", "shipment", "bl"];

  return (
    <div className="bg-white p-5 rounded max-w-3xl w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex-1 text-center">
          {isSuperAdminView ? "Add System Administrator" : `Add Branch Admin Form - ${branchName}`}
        </h3>
        <Tooltip text="close">
          <button
            onClick={handleCloseAdminForm}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-2.5 mt-4">
        <InputLine
          label="Admin Name"
          placeholder="Enter Admin Name"
          value={formData.username}
          onChange={handleInputChange("username")}
        />
        <CheckDropdown
          label="Admin Role"
          placeholder="Select Roles"
          options={roleOptions}
          value={formData.adminRoles}
          onSelectionChange={handleRoleChange}
        />
        
        {isSuperAdminView && (
          <CheckDropdown
            label="Accessible Branches"
            placeholder="Select Branches"
            options={branchOptions}
            value={branchOptions.filter(opt => formData.accessibleBranches.includes(opt.value))}
            onSelectionChange={handleBranchChange}
          />
        )}

        <PasswordField
          placeholder="Enter the Password"
          value={formData.password}
          onChange={handleInputChange("password")}
        />
      </div>
      <div className="flex gap-2.5 justify-end mt-5">
        <SquareButton
          buttonName="Cancel"
          variant="cancel"
          onClick={handleCloseAdminForm}
        />
        <SquareButton
          buttonName={(loading || storeLoading) ? "Creating..." : "Submit"}
          onClick={handleSubmitForm}
          disabled={loading || storeLoading}
        />
      </div>
    </div>
  );
};

export default BranchAdminForm;
