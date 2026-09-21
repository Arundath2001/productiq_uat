import BillOfLading from "../models/billOfLading.model.js";
import ExcelJS from "exceljs";

const manifestColumns = [
    { key: "address", width: 44 },
    { key: "billNo", width: 20 },
    { key: "container", width: 24 },
    { key: "packages", width: 16 },
    { key: "description", width: 26 },
    { key: "grossWeight", width: 16 },
    { key: "hsCode", width: 14 },
];

const manifestFont = { name: "Arial", size: 11, bold: true };

const emptyValue = (value) => value ?? "";

const sumNumbers = (items = [], field) =>
    items.reduce((sum, item) => sum + (parseFloat(item?.[field]) || 0), 0);

const styleRange = (worksheet, fromRow, toRow, fromCol = 1, toCol = 7) => {
    for (let rowNumber = fromRow; rowNumber <= toRow; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        for (let colNumber = fromCol; colNumber <= toCol; colNumber += 1) {
            const cell = row.getCell(colNumber);
            cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
            cell.font = manifestFont;
            cell.border = {};
        }
    }
};

const buildManifestWorkbook = async (bills) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ProductIQ";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Cargo Manifest", {
        pageSetup: {
            paperSize: 9,
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2,
            },
        },
        views: [{ showGridLines: false }],
    });

    worksheet.columns = manifestColumns;

    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "CARGO MANIFEST";
    titleCell.font = { name: "Arial", size: 14, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 24;

    worksheet.mergeCells("A3:C4");
    const companyCell = worksheet.getCell("A3");
    companyCell.value = ((process.env.APP_NAME || "Aswaq Forwarder").toUpperCase() + " SEA\n") + "SHIPPING LINES AGENTS CO. L.L.C";
    companyCell.font = manifestFont;
    companyCell.alignment = { wrapText: true, vertical: "top" };

    const firstBill = bills[0] || {};

    worksheet.getCell("A6").value = "Vessel Name";
    worksheet.getCell("A7").value = emptyValue(firstBill.vessel);
    worksheet.getCell("B6").value = "Voyage";
    worksheet.getCell("B7").value = emptyValue(firstBill.voyNo);

    worksheet.getCell("A9").value = "Master BL:";
    worksheet.getCell("A10").value = "DB659162";
    worksheet.getCell("B9").value = "PORT OF LOADING";
    worksheet.getCell("B10").value = emptyValue(firstBill.portLoading);
    worksheet.getCell("C9").value = "DESTINATION";
    worksheet.getCell("C10").value = emptyValue(firstBill.portDischarge);

    [6, 7, 9, 10].forEach((rowNumber) => {
        worksheet.getRow(rowNumber).eachCell((cell) => {
            cell.font = {
                name: "Arial",
                size: 11,
                bold: true,
                color: rowNumber === 7 || rowNumber === 10 ? { argb: "FFFF0000" } : { argb: "FF000000" },
            };
            cell.alignment = { wrapText: true, vertical: "top" };
        });
    });

    const headerRowNumber = 12;
    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.values = [
        "ADDRESS OF SHIPPER (SH)\nCONSIGNEE (COO AND)",
        "BILL OF LADING NUMBE",
        "CONTAINER DETAILS",
        "NBR & KIND\nOF PACKAGE",
        "DESCRIPTION\nOF GOODS",
        "GROSS WEIGHT",
        "HS CODE",
    ];
    headerRow.height = 42;
    headerRow.eachCell((cell) => {
        cell.font = manifestFont;
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        cell.border = {
            top: { style: "medium" },
            bottom: { style: "medium" },
        };
    });

    let currentRow = headerRowNumber + 1;

    bills.forEach((bill, billIndex) => {
        const actualItems = bill.items || [];
        const items = actualItems.length ? actualItems : [{}];
        const firstItemRow = currentRow;

        items.forEach((item) => {
            const row = worksheet.getRow(currentRow);
            row.values = [
                "",
                `${emptyValue(bill.billNo)}\n\nBL TYPE: ${emptyValue(bill.blType)}\nPAYMENT TYPE: COLLECT`,
                `${emptyValue(item.marksNos)}\n\n1x40 HC\nSEAL: ${emptyValue(item.sealNo)}\nFREE TIME: ${emptyValue(bill.freeDays)}`,
                `${emptyValue(item.noofPieces)}${bill.qtyType && bill.qtyType !== "-" ? ` ${bill.qtyType}` : ""}`,
                emptyValue(item.quantityDescription),
                emptyValue(item.grossWeight),
                emptyValue(item.hsCode),
            ];
            row.height = 72;
            currentRow += 1;
        });

        const footerRowNumber = currentRow;
        const totalPkgs = sumNumbers(actualItems, "noofPieces");
        const totalGW = sumNumbers(actualItems, "grossWeight");
        const qtyType = bill.qtyType && bill.qtyType !== "-" ? ` ${bill.qtyType}` : "";

        worksheet.getRow(footerRowNumber).values = [
            "",
            "",
            "Total No. of Containers\n" + `${actualItems.length} CONTAINER${actualItems.length !== 1 ? "S" : ""}`,
            "Total No. of Pkgs\n" + `${totalPkgs}${qtyType}`,
            "TOTAL N.W:\n" + `${totalGW} KGS`,
            "TOTAL G.W\n" + `${totalGW} KGS`,
            "",
        ];
        worksheet.mergeCells(footerRowNumber, 6, footerRowNumber, 7);
        worksheet.getRow(footerRowNumber).height = 42;

        worksheet.mergeCells(firstItemRow, 1, footerRowNumber, 1);
        const addressCell = worksheet.getCell(firstItemRow, 1);
        addressCell.value = `Shipper:\n${emptyValue(bill.shipper)}\n\nCONSIGNEE:\n${emptyValue(bill.consignee)}\n\nNOTIFY:\n${emptyValue(bill.notifyAddress)}`;

        styleRange(worksheet, firstItemRow, footerRowNumber);

        for (let colNumber = 1; colNumber <= 7; colNumber += 1) {
            const footerCell = worksheet.getRow(footerRowNumber).getCell(colNumber);
            footerCell.border = {
                bottom: { style: "medium" },
            };
        }

        currentRow += 1;

        if (billIndex < bills.length - 1) {
            worksheet.mergeCells(currentRow, 1, currentRow, 7);
            const separatorCell = worksheet.getCell(currentRow, 1);
            separatorCell.border = { bottom: { style: "medium" } };
            worksheet.getRow(currentRow).height = 24;
            currentRow += 1;
        }
    });

    return workbook;
};

export const saveBillOFLading = async (req, res) => {
    try {
        const data = req.body;

        data.branchId = req.user?.branchId;

        const newBill = new BillOfLading(data);
        await newBill.save();
        res.status(201).json({ message: "Bill of Lading saved successfully", bill: newBill });
    } catch (error) {
        res.status(500).json({ message: "Error saving Bill of Lading", error: error.message });
    }
};

export const getAllBills = async (req, res) => {
    try {
        const branchId = req.user?.branchId;
        const bills = await BillOfLading.find({ branchId }).populate('branchId', 'branchName address');
        res.status(200).json(bills);
    } catch (error) {
        console.error("Error fetching Bills of Lading:", error);
        res.status(500).json({ message: "Error fetching Bills of Lading", error: error.message });
    }
};

export const getBillById = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await BillOfLading.findById(id).populate('branchId', 'branchName address');

        if (!bill) {
            return res.status(404).json({ message: "Bill of Lading not found" });
        }

        res.status(200).json(bill);
    } catch (error) {
        console.error("Error fetching Bill of Lading:", error);
        res.status(500).json({ message: "Error fetching Bill of Lading", error: error.message });
    }
};

export const updateBillOfLading = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedBill = await BillOfLading.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBill) {
            return res.status(404).json({ message: "Bill of Lading not found" });
        }

        res.status(200).json({ message: "Bill of Lading updated successfully", bill: updatedBill });
    } catch (error) {
        console.error("Error updating Bill of Lading:", error);
        res.status(500).json({ message: "Error updating Bill of Lading", error: error.message });
    }
};

export const deleteBillOfLading = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBill = await BillOfLading.findByIdAndDelete(id);

        if (!deletedBill) {
            return res.status(404).json({ message: "Bill of Lading not found" });
        }

        res.status(200).json({ message: "Bill of Lading deleted successfully" });
    } catch (error) {
        console.error("Error deleting Bill of Lading:", error);
        res.status(500).json({ message: "Error deleting Bill of Lading", error: error.message });
    }
};

export const downloadManifest = async (req, res) => {
    try {

        const { billId, billIds } = req.query;

        let bills;

        if (billIds) {
            const idArray = billIds.split(",").map((id) => id.trim());
            bills = await BillOfLading.find({ _id: { $in: idArray } }).lean();
        } else {
            const bill = await BillOfLading.findById(billId).lean();
            bills = bill ? [bill] : [];
        }

        if (!bills.length) {
            return res.status(404).json({ success: false, message: "Bill of Lading not found" });
        }

        const workbook = await buildManifestWorkbook(bills);
        const excelData = await workbook.xlsx.writeBuffer();
        const filename = billIds ? "manifests.xlsx" : "manifest.xlsx";

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': excelData.length,
        });

        return res.end(excelData);


    } catch (error) {
        console.error('downloadManifest error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate manifest Excel',
            error: error.message,
        });
    }
}
