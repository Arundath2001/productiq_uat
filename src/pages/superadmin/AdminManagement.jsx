import React, { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import BranchAdminForm from "../../components/BranchAdminForm";
import { useBranch } from "../../store/useBranchStore";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Loader, PencilIcon, Trash2Icon } from "lucide-react";

const AdminManagement = () => {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/branch/all-admins"); // We need to create this or just fetch manually
      setAdmins(res.data.admins);
    } catch (error) {
      console.error(error);
      // Fallback if route doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Administrator Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system administrators and their branch access
          </p>
        </div>
        <button
          onClick={() => setShowAdminForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Administrator
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-700">All Administrators</h2>
        </div>
        
        <div className="p-6 flex-1">
          {loading ? (
             <div className="flex items-center justify-center h-40">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
             </div>
          ) : admins.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Admin Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Roles</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Access</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{admin.username}</td>
                    <td className="py-3 text-sm text-gray-600">{admin.adminRoles.join(", ")}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {admin.accessibleBranches?.length || 1} Branches
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No administrators found. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>

      {showAdminForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-full max-w-lg">
             <BranchAdminForm 
               setShowAdminForm={setShowAdminForm} 
               isSuperAdminView={true}
               onSuccess={() => {
                 setShowAdminForm(false);
                 fetchAdmins();
               }}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
