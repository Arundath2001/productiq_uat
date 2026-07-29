import mongoose from "mongoose";

const GoodsSchema = new mongoose.Schema({
  marksNos: { type: String },
  sealNo: { type: String },
  grossWeight: { type: String },
  measurement: { type: String },
  noofPieces: { type: String },
  ctnType: { type: String },
  hsCode: { type: String },
  quantityDescription: { type: String },
});

const BillOfLadingSchema = new mongoose.Schema({
  billNo: { type: String },
  codeName: { type: String },
  shipper: { type: String },
  consignee: { type: String },
  notifyAddress: { type: String },
  agentDestination: { type: String },
  vessel: { type: String },
  voyNo: { type: String },
  preCarriageBy: { type: String },
  originalAndCopy: { type: String },
  portLoading: { type: String },
  placeReceipt: { type: String },
  portDischarge: { type: String },
  portDelivery: { type: String },
  telephone: { type: String },
  freeDays: { type: String },
  freightStatus: { type: String },
  typeofService: { type: String },
  fax: { type: String },
  qtyType: { type: String },
  // leftSection: { type: String },
  // rightSection: { type: String },
  issuePlace: { type: String },
  issueDate: { type: String },
  oceanVessel: { type: String },
  voyageNumber: { type: String },
  freightPayableAt: { type: String },
  items: [GoodsSchema],
  draft: { type: Boolean, default: false },
  shipOnDate: { type: Boolean, default: false },
  shipDate: { type: String },
  negotiable: { type: Boolean, default: false },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
  blType: { type: String }
}, { timestamps: true });

const BillOfLading = mongoose.model("BillOfLading", BillOfLadingSchema);

export default BillOfLading;