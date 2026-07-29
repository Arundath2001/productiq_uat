import ExcelJS from "exceljs";

export const generateSeaContainerExcel = async (data) => {
    try {
        console.log("Export data received:", data);

        const { seaVoyageInfo, seaContainerInfo, batchAssignments } = data;

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Container Details");

        // Set page setup for printing
        worksheet.pageSetup = {
            paperSize: 9,
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
        };

        // Define column widths
        worksheet.columns = [
            { width: 12 }, // A - ملاحظات / NOTES
            { width: 12 }, // B - مبلغ اسواق / ASWAQ AMOUNT
            { width: 15 }, // C - رقم فاتورة اسواق / ASWAQ INVOICE NUMBER
            { width: 15 }, // D - رقم فاتورة الإصدار / ISSUE INVOICE NUMBER
            { width: 12 }, // E - تكلفة الشحن / COST OF SHIPMENT
            { width: 12 }, // F - الحجم في CBM / SIZE IN CBM
            { width: 18 }, // G - رقم مذكرة التسليم / DELIVERY NOTE NUMBER
            { width: 12 }, // H - عدد الكرتون / NUMBER OF CARTON
            { width: 18 }, // I - موعد التسليم في دبي / DELIVERY DATE IN DUBAI
            { width: 18 }, // J - اسم الزبون / CUSTOMER NAME
            { width: 12 }, // K - رقم الكود / CODE NO
        ];

        // Row 1: Title
        const titleRow = worksheet.getRow(1);
        titleRow.height = 25;
        worksheet.mergeCells("A1:K1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "BY SEA SHIPMENT - عن طريق الشحن البحري";
        titleCell.font = { size: 13, bold: true };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
        };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 2: Container Number and Company
        const row2 = worksheet.getRow(2);
        row2.height = 20;
        worksheet.mergeCells("A2:H2");
        const containerCell = worksheet.getCell("A2");
        containerCell.value = `CONTAINER NUMBER رقم حاوية : ${seaContainerInfo.containerNumber}`;
        containerCell.font = { size: 10, bold: true };
        containerCell.alignment = { horizontal: "left", vertical: "middle" };
        containerCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("I2:K2");
        const companyCell = worksheet.getCell("I2");
        companyCell.value = seaContainerInfo.containerCompanyName;
        companyCell.font = { size: 10, bold: true };
        companyCell.alignment = { horizontal: "center", vertical: "middle" };
        companyCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 3: Cut off date and Voyage info
        const row3 = worksheet.getRow(3);
        row3.height = 20;

        // Merge cells A3 and B3 for the label
        worksheet.mergeCells("A3:B3");
        const cutoffLabelCell = worksheet.getCell("A3");
        cutoffLabelCell.value = "CUT OFF DATE : تعدى التاريخ";
        cutoffLabelCell.font = { size: 9, bold: true };
        cutoffLabelCell.alignment = { horizontal: "center", vertical: "middle" };
        cutoffLabelCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Get current date for cut off date - DD/MM/YYYY format
        const today = new Date();
        const cutOffDate = `${String(today.getDate()).padStart(2, "0")}/${String(
            today.getMonth() + 1
        ).padStart(2, "0")}/${today.getFullYear()}`;

        const dateCell = worksheet.getCell("C3");
        dateCell.value = cutOffDate;
        dateCell.font = { size: 10, bold: true };
        dateCell.alignment = { horizontal: "center", vertical: "middle" };
        dateCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
        };
        dateCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Empty cells D3-F3
        ["D3", "E3", "F3"].forEach((cellAddr) => {
            const c = worksheet.getCell(cellAddr);
            c.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        worksheet.mergeCells("G3:K3");
        const voyageCell = worksheet.getCell("G3");
        voyageCell.value = `VOYAGE NO : ${seaVoyageInfo.seaVoyageName} - ${seaVoyageInfo.seaVoyageNumber} - ${seaVoyageInfo.lineName}`;
        voyageCell.font = { size: 10, bold: true };
        voyageCell.alignment = { horizontal: "center", vertical: "middle" };
        voyageCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 4: Arrival date
        const row4 = worksheet.getRow(4);
        row4.height = 20;
        worksheet.mergeCells("A4:F4");
        const arrivalCell = worksheet.getCell("A4");
        arrivalCell.value = "DATE OF ARRIVAL IN LIBYA : تاريخ الوصول إلى ليبيا";
        arrivalCell.font = { size: 9, bold: true };
        arrivalCell.alignment = { horizontal: "left", vertical: "middle" };
        arrivalCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("G4:K4");
        const misurataCell = worksheet.getCell("G4");
        misurataCell.value = "MISURATA";
        misurataCell.font = { size: 10, bold: true };
        misurataCell.alignment = { horizontal: "center", vertical: "middle" };
        misurataCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 5: Handover date
        const row5 = worksheet.getRow(5);
        row5.height = 20;
        worksheet.mergeCells("A5:K5");
        const handoverCell = worksheet.getCell("A5");
        handoverCell.value = "DATE OF HAND OVER TO CUSTOMER :تاريخ التسليم للعميل";
        handoverCell.font = { size: 9, bold: true };
        handoverCell.alignment = { horizontal: "left", vertical: "middle" };
        handoverCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 6: Empty row
        const row6 = worksheet.getRow(6);
        row6.height = 5;
        ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].forEach((col) => {
            const cell = worksheet.getCell(`${col}6`);
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Row 7: Arabic Headers
        const row7 = worksheet.getRow(7);
        row7.height = 30;
        const arabicHeaders = [
            "ملاحظات",
            "مبلغ اسواق",
            "رقم فاتورة اسواق",
            "رقم فاتورة الإصدار",
            "تكلفة الشحن",
            "الحجم في CBM",
            "رقم مذكرة التسليم",
            "عدد الكرتون",
            "موعد التسليم في دبي",
            "اسم الزبون",
            "رقم الكود",
        ];

        arabicHeaders.forEach((header, index) => {
            const cell = row7.getCell(index + 1);
            cell.value = header;
            cell.font = { size: 9, bold: true };
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Row 8: English Headers
        const row8 = worksheet.getRow(8);
        row8.height = 30;
        const englishHeaders = [
            "NOTES",
            "ASWAQ\nAMOUNT",
            "ASWAQ\nINVOICE\nNUMBER",
            "ISSUE\nINVOICE\nNUMBER",
            "COST OF\nSHIPMENT",
            "SIZE IN CBM",
            "DELIVERY NOTE\nNUMBER",
            "NUMBER OF\nCARTON",
            "DELIVERY DATE IN\nDUBAI",
            "CUSTOMER NAME",
            "CODE NO:",
        ];

        englishHeaders.forEach((header, index) => {
            const cell = row8.getCell(index + 1);
            cell.value = header;
            cell.font = { size: 9, bold: true };
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF5F5F5" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Group batch assignments by productCode
        const groupedData = {};
        batchAssignments.forEach((batch) => {
            const code = batch.productCode || "";
            if (!groupedData[code]) {
                groupedData[code] = {
                    productCode: code,
                    deliveryNotes: [],
                    dates: [],
                    totalCartons: 0,
                    totalCBM: 0,
                };
            }

            if (
                batch.deliveryPaperNumber &&
                !groupedData[code].deliveryNotes.includes(batch.deliveryPaperNumber)
            ) {
                groupedData[code].deliveryNotes.push(batch.deliveryPaperNumber);
            }

            const createdDate = new Date(batch.createdAt);
            const formattedDate = `${String(createdDate.getDate()).padStart(
                2,
                "0"
            )}-${String(createdDate.getMonth() + 1).padStart(
                2,
                "0"
            )}-${createdDate.getFullYear()}`;

            if (!groupedData[code].dates.includes(formattedDate)) {
                groupedData[code].dates.push(formattedDate);
            }

            groupedData[code].totalCartons += batch.quantityLoaded || 0;
            groupedData[code].totalCBM += batch.totalCBM || 0;
        });

        const groupedArray = Object.values(groupedData);
        let grandTotalCBM = 0;
        let grandTotalCartons = 0;

        // Add data rows
        groupedArray.forEach((group, index) => {
            const rowNumber = 9 + index;
            const dataRow = worksheet.getRow(rowNumber);
            dataRow.height = 20;

            grandTotalCBM += group.totalCBM;
            grandTotalCartons += group.totalCartons;

            const rowData = [
                "",
                "",
                "",
                "",
                "",
                group.totalCBM.toFixed(2),
                group.deliveryNotes.join(", "),
                group.totalCartons,
                group.dates.join(", "),
                "",
                group.productCode,
            ];

            rowData.forEach((value, colIndex) => {
                const cell = dataRow.getCell(colIndex + 1);
                cell.value = value;
                cell.font = { size: 9 };
                cell.alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true,
                };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // Add TOTAL row
        const totalRowNumber = 9 + groupedArray.length;
        const totalRow = worksheet.getRow(totalRowNumber);
        totalRow.height = 22;

        // Merge A to E for "TOTAL"
        worksheet.mergeCells(`A${totalRowNumber}:E${totalRowNumber}`);
        const totalLabelCell = worksheet.getCell(`A${totalRowNumber}`);
        totalLabelCell.value = "TOTAL";
        totalLabelCell.font = { size: 11, bold: true };
        totalLabelCell.alignment = { horizontal: "center", vertical: "middle" };
        totalLabelCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Total CBM
        const totalCBMCell = worksheet.getCell(`F${totalRowNumber}`);
        totalCBMCell.value = grandTotalCBM.toFixed(2);
        totalCBMCell.font = { size: 10, bold: true };
        totalCBMCell.alignment = { horizontal: "center", vertical: "middle" };
        totalCBMCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Empty cell G
        const cellG = worksheet.getCell(`G${totalRowNumber}`);
        cellG.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Total Cartons in column H (below NUMBER OF CARTON)
        const totalCartonsCell = worksheet.getCell(`H${totalRowNumber}`);
        totalCartonsCell.value = `${grandTotalCartons}CTN`;
        totalCartonsCell.font = { size: 10, bold: true };
        totalCartonsCell.alignment = { horizontal: "center", vertical: "middle" };
        totalCartonsCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Empty cells I, J, K
        ["I", "J", "K"].forEach((col) => {
            const cell = worksheet.getCell(`${col}${totalRowNumber}`);
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Generate file name
        const fileName = `${seaContainerInfo.containerNumber}_${seaVoyageInfo.seaVoyageName}_${seaVoyageInfo.seaVoyageNumber}.xlsx`;

        console.log("Generating file:", fileName);

        // Write and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);

        console.log("Excel file generated successfully");
    } catch (error) {
        console.error("Error generating Excel:", error);
        alert("Error generating Excel file. Check console for details.");
    }
};