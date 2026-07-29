import React, { useEffect, useState } from "react";
import { useProductType } from "../../store/useProductTypeStore";
import PageHeader from "../../components/PageHeader";
import { Loader2, PackageOpen, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import InputLine from "../../components/InputLine";
import SolidButton from "../../components/SolidButton";
import ConfirmAlert from "../../components/ConfirmAlert";

const ProductType = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemName, setItemName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState("");
  const [deleteItemName, setDeleteItemName] = useState("");

  const {
    getProductType,
    productTypes,
    productTypeError,
    productTypeLoading,
    createError,
    createProductType,
    isCreate,
    deleteError,
    isDelete,
    deleteProductType,
  } = useProductType();

  useEffect(() => {
    getProductType(searchQuery);
  }, [searchQuery]);

  const handleDeleteItem = async () => {
    try {
      await deleteProductType(deleteItemId);
      setShowConfirm(false);
      setDeleteItemId("");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCreateItem = () => {
    setShowCreateForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProductType(itemName);
      setItemName("");
      setShowCreateForm(false);
    } catch (error) {}
  };

  const handleShowConfirm = (itemTypeId, itemName) => {
    setDeleteItemId(itemTypeId);
    setDeleteItemName(itemName);
    setShowConfirm(true);
  };

  const handleCloseForm = () => {
    setItemName("");
    setDeleteItemId("");
    setDeleteItemName("");
    setShowCreateForm(false);
  };

  const renderContent = () => {
    if (productTypeLoading && productTypes.length === 0) {
      return (
        <div className="flex justify-center items-center h-[90vh]">
          <Loader2 className="size-8 animate-spin" />
        </div>
      );
    }

    if (!productTypeLoading && productTypes.length === 0) {
      return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <EmptyState
            Icon={PackageOpen}
            title="No Products found"
            description={
              searchQuery
                ? "No product type match your search criteria. Try adjusting your filters."
                : "Start by creating your first product type to manage your product type."
            }
          />
        </div>
      );
    }

    return (
      <div className="mt-4">
        {productTypes.map((product) => (
          <div
            key={product._id}
            className="bg-white px-4 justify-between items-center flex mb-2.5 py-3 rounded-xl shadow-sm hover:shadow-gray-500"
          >
            <p>{product.itemName}</p>

            <div
              onClick={() => handleShowConfirm(product._id, product.itemName)}
            >
              <Trash2 className="size-4 text-gray-500 hover:text-red-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        onCreate={handleCreateItem}
        createButtonText="Create Product"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {renderContent()}

      {showCreateForm && (
        <div className="fixed flex inset-0 items-center justify-center bg-[#B9B9B969] z-5">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <h3 className="text-center mb-2.5">ENTER PRODUCT TYPE DETAILS</h3>
            <div className="h-0.5 bg-gray-700 mb-6" />

            <form onSubmit={handleSubmit}>
              <InputLine
                label="Item Name"
                name="Item Name"
                placeholder="Enter Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />

              <div className="flex gap-4 justify-center mt-4">
                <SolidButton
                  buttonName="Cancel"
                  variant="outline"
                  onClick={handleCloseForm}
                  disabled={isCreate}
                />

                <SolidButton
                  buttonName="Create"
                  type="submit"
                  disabled={isCreate}
                  isLoading={isCreate}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#B9B9B969] bg-opacity-50 z-50">
          <ConfirmAlert
            alertInfo={`You want to delete ${deleteItemName} ?`}
            handleClose={() => setShowConfirm(false)}
            handleSubmit={handleDeleteItem}
            isDeleting={isDelete}
          />
        </div>
      )}
    </div>
  );
};

export default ProductType;
