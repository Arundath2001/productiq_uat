import ExcelJS from 'exceljs';

export const exportVoyageData = async (data, voyageName = null, voyageId = null, voyageDetails = null) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return;
    }

    const groupedByCompany = data.reduce((acc, item) => {
        let company = (item.clientCompany || 'Unknown').toString().trim();
        const productCode = (item.productCode || '').toString().trim();

        if (!productCode) {
            return acc;
        }

        if (company === productCode) {
            company = productCode;
        }

        if (!acc[company]) {
            acc[company] = {};
        }

        const formatMixGoniName = (rawName, goniNumber) => {
            if (!rawName) return '';
            let name = rawName.trim();
            let num = goniNumber;

            if (num == null) {
                const match = name.match(/[-_\s](\d+)$/);
                if (match) {
                    num = parseInt(match[1], 10);
                }
            }

            const upper = name.toUpperCase();

            if (upper.includes('M+B') || upper.includes('M + B')) {
                name = 'M + B / M';
            } else if (upper.includes('T-MIX') || upper.includes('T MIX') || upper.includes('MIXED/T') || upper.includes('T/M') || upper.startsWith('T')) {
                name = 'T / M';
            } else if (upper.includes('M-MIX') || upper.includes('M MIX') || upper.includes('MIXED/M') || upper.includes('M/M') || upper.startsWith('M')) {
                name = 'M / M';
            }

            if (num != null) {
                name = `${name} - ${num}`;
            }

            return name;
        };

        const isMix = item.goniCompanyCode === "ALL COMPANY" || 
                      (item.goniName && (item.goniName.includes("MIX") || item.goniName.includes("M/M") || item.goniName.includes("T/M") || (item.goniCompanyCode && item.goniCompanyCode !== company)));

        const mixNameKey = isMix && item.goniName ? formatMixGoniName(item.goniName, item.goniNumber) : null;

        if (!acc[company][productCode]) {
            acc[company][productCode] = {
                clientCompany: company,
                productCode: productCode,
                quantity: 1,
                weight: parseFloat(item.weight) || 0,
                regularCartons: (!isMix && item.goniNumber != null) ? [item.goniNumber] : [],
                mixCartons: mixNameKey ? { [mixNameKey]: 1 } : {}
            };
        } else {
            acc[company][productCode].quantity += 1;
            acc[company][productCode].weight += parseFloat(item.weight) || 0;

            if (!isMix && item.goniNumber != null) {
                if (!acc[company][productCode].regularCartons.includes(item.goniNumber)) {
                    acc[company][productCode].regularCartons.push(item.goniNumber);
                }
            } else if (mixNameKey) {
                const currentCount = acc[company][productCode].mixCartons[mixNameKey] || 0;
                acc[company][productCode].mixCartons[mixNameKey] = currentCount + 1;
            }
        }

        return acc;
    }, {});

    const smartProductCodeSort = (a, b) => {
        const codeA = a.productCode.toString().trim();
        const codeB = b.productCode.toString().trim();

        const firstCharA = codeA.charAt(0).toUpperCase();
        const firstCharB = codeB.charAt(0).toUpperCase();

        if (firstCharA !== firstCharB) {
            return firstCharA.localeCompare(firstCharB);
        }

        if (codeA.length !== codeB.length) {
            return codeA.length - codeB.length;
        }

        return codeA.localeCompare(codeB, undefined, {
            sensitivity: 'base',
            numeric: true,
            caseFirst: 'upper'
        });
    };

    const customCompanySort = (a, b) => {
        const specialCompanies = ['FL', 'BLACK TIGER'];

        const aIsSpecial = specialCompanies.includes(a);
        const bIsSpecial = specialCompanies.includes(b);

        if (aIsSpecial && bIsSpecial) {
            if (a === 'FL' && b === 'BLACK TIGER') return -1;
            if (a === 'BLACK TIGER' && b === 'FL') return 1;
            return 0;
        }

        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;

        const firstCharA = a.charAt(0).toUpperCase();
        const firstCharB = b.charAt(0).toUpperCase();

        if (firstCharA !== firstCharB) {
            return firstCharA.localeCompare(firstCharB);
        }

        const numericPartA = a.substring(1);
        const numericPartB = b.substring(1);

        const numA = parseInt(numericPartA, 10);
        const numB = parseInt(numericPartB, 10);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        return a.localeCompare(b, undefined, {
            sensitivity: 'base',
            numeric: true
        });
    };

    const filteredData = [];
    const sortedCompanies = Object.keys(groupedByCompany).sort(customCompanySort);

    sortedCompanies.forEach(company => {
        const companyProducts = Object.values(groupedByCompany[company])
            .map(item => ({
                ...item,
                weight: Math.round(item.weight * 100) / 100
            }))
            .sort(smartProductCodeSort);

        filteredData.push(...companyProducts);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Voyage Data');

    worksheet.columns = [
        { key: 'sl', width: 6 },
        { key: 'mark', width: 14 },
        { key: 'partNo', width: 16 },
        { key: 'desc', width: 22 },
        { key: 'qty', width: 10 },
        { key: 'bshRef', width: 16 },
        { key: 'aswaqInv', width: 14 },
        { key: 'weight', width: 14 },
        { key: 'pricePerKg', width: 14 },
        { key: 'shippingCost', width: 14 },
        { key: 'totalCtn', width: 24 },
        { key: 'totalNoCtn', width: 18 }
    ];

    // Helper functions for formatting dates
    const formatDateDDMMYYYY = (d) => {
        if (!d) {
            const today = new Date();
            return `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
        }
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    const formatDateDDMMYY = (d) => {
        if (!d) return "";
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        const yy = String(date.getFullYear()).slice(-2);
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${yy}`;
    };

    // Extract voyage metadata
    const rawAirline = voyageDetails?.airlineId?.airlineName || voyageDetails?.airlineName || "FLY DUBAI";
    const airlineUpper = rawAirline.toString().toUpperCase();

    const arabicAirlineMap = {
        "FLY DUBAI": "فلاي دبي",
        "FLYDUBAI": "فلاي دبي",
        "EMIRATES": "طيران الإمارات",
        "AIR ARABIA": "العربية للطيران",
        "TURKISH AIRLINES": "الخطوط التركية",
        "LIBYAN AIRLINES": "الخطوط الجوية الليبية",
        "AFRIQIYAH AIRWAYS": "الخطوط الإفريقية",
        "EGYPTAIR": "مصر للطيران",
        "ROYAL JORDANIAN": "الملكية الأردنية",
        "BERNIQ AIRWAYS": "برنيق للطيران"
    };
    const airlineArabic = arabicAirlineMap[airlineUpper] || airlineUpper;

    const rawAirport = voyageDetails?.landingAirportId?.airportName || voyageDetails?.airportName || "BENGHAZI";
    const airportUpper = rawAirport.toString().toUpperCase();

    const voyageNum = voyageDetails?.voyageNumber || voyageName || "000263B/26";
    const dateStr = formatDateDDMMYYYY(voyageDetails?.dispatchDate || voyageDetails?.expectedDispatchDate || voyageDetails?.createdAt);
    const etaFormatted = formatDateDDMMYY(voyageDetails?.eta);
    const etaLandingText = etaFormatted ? `ETA: ${etaFormatted} LANDING: ${airportUpper}` : `LANDING: ${airportUpper}`;

    // --- ROW 1: TOP HEADER BAR ---
    // A1:F1 for English (Left aligned), G1:L1 for Arabic (Right aligned)
    worksheet.mergeCells('A1:F1');
    const cellA1 = worksheet.getCell('A1');
    cellA1.value = `BY AIR - ${airlineUpper}`;
    cellA1.font = { bold: true, underline: true, size: 12, name: 'Calibri' };
    cellA1.alignment = { horizontal: 'left', vertical: 'middle' };

    worksheet.mergeCells('G1:L1');
    const cellG1 = worksheet.getCell('G1');
    cellG1.value = `(عن طريق الجو - ${airlineArabic})`;
    cellG1.font = { bold: true, underline: true, size: 12, name: 'Calibri' };
    cellG1.alignment = { horizontal: 'right', vertical: 'middle' };

    const topRow1 = worksheet.getRow(1);
    topRow1.height = 28;

    for (let c = 1; c <= 12; c++) {
        const cell = worksheet.getCell(1, c);
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: c === 1 ? 'thin' : undefined },
            right: { style: c === 12 ? 'thin' : undefined }
        };
    }

    // --- ROW 2: VOYAGE METADATA ---
    // Cell 1 (A2:C2): DATE (تاريخ) : 15/09/2026
    worksheet.mergeCells('A2:C2');
    const cellA2 = worksheet.getCell('A2');
    cellA2.value = {
        richText: [
            { text: 'DATE (تاريخ) : ', font: { bold: true, size: 10, name: 'Calibri' } },
            { text: dateStr, font: { bold: true, underline: true, size: 10, name: 'Calibri' } }
        ]
    };
    cellA2.alignment = { horizontal: 'left', vertical: 'middle' };

    // Cell 2 (D2:G2): ETA & LANDING AIRPORT (RED text)
    worksheet.mergeCells('D2:G2');
    const cellD2 = worksheet.getCell('D2');
    cellD2.value = etaLandingText;
    cellD2.font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FFFF0000' } };
    cellD2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Cell 3 (H2:J2): VOYAGE NUMBER Label
    worksheet.mergeCells('H2:J2');
    const cellH2 = worksheet.getCell('H2');
    cellH2.value = 'VOYAGE NUMBER (رقم الرحلة) : ';
    cellH2.font = { bold: true, underline: true, size: 10, name: 'Calibri' };
    cellH2.alignment = { horizontal: 'right', vertical: 'middle' };

    // Cell 4 (K2:L2): Voyage Number Value
    worksheet.mergeCells('K2:L2');
    const cellK2 = worksheet.getCell('K2');
    cellK2.value = voyageNum;
    cellK2.font = { bold: true, underline: true, size: 10, name: 'Calibri' };
    cellK2.alignment = { horizontal: 'center', vertical: 'middle' };

    const topRow2 = worksheet.getRow(2);
    topRow2.height = 24;

    for (let c = 1; c <= 12; c++) {
        const cell = worksheet.getCell(2, c);
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    // --- ROW 3: COLUMN HEADERS ---
    const headers = [
        'SL',
        'MARK\n(علامة)',
        'PART NO',
        'DESC. (وصف)',
        'QTY(\nكمية)',
        'BSH/REF\nNO:',
        'ASWAQ INV NO:\n(فاتورة أسواق رقم)',
        'WEIGHT IN\nKG\n(الوزن)\n(بالكيلو)',
        'PRICE PER\nKG(السعر\nللكيلو)',
        'TOTAL\nSHIPPING\nCOST (إجمالي\nتكلفة الشحن)',
        'CTN NO:(رقم\nالكرتون)',
        'TOTAL NO\nOF\nCTN:(العدد\nالإجمالي\nللكرتون)'
    ];

    const headerRow = worksheet.getRow(3);
    headerRow.values = headers;
    headerRow.height = 75;

    headerRow.eachCell((cell, colNumber) => {
        let fontColor = 'FF000000'; // Default black

        // Red color for price and shipping cost columns
        if (colNumber === 9 || colNumber === 10) {
            fontColor = 'FFFF0000'; // Red
        }

        // Green color only for TOTAL NO OF CTN (column 12)
        if (colNumber === 12) {
            fontColor = 'FF008000'; // Green
        }

        cell.font = {
            bold: true,
            size: 10,
            name: 'Calibri',
            color: { argb: fontColor }
        };
        cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
            readingOrder: 'contextDependent'
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' } // White background for all
        };
    });

    let currentCompany = null;
    let serialNumber = 1;
    let dataRowCount = 1; // Track data rows for formula references

    filteredData.forEach((item, index) => {
        const isNewCompany = currentCompany !== item.clientCompany;

        if (isNewCompany && currentCompany !== null) {
            const blankRow = worksheet.addRow({
                sl: '',
                mark: '',
                partNo: '',
                desc: '',
                qty: '',
                bshRef: '',
                aswaqInv: '',
                weight: '',
                pricePerKg: '',
                shippingCost: '',
                totalCtn: '',
                totalNoCtn: ''
            });

            blankRow.height = 20;
            blankRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = {
                    horizontal: 'center',
                    vertical: 'middle',
                    readingOrder: 'contextDependent'
                };
                cell.font = {
                    size: 10,
                    name: 'Calibri'
                };
            });
        }

        currentCompany = item.clientCompany;

        const regCartons = (item.regularCartons || []).slice().sort((a, b) => a - b);
        const mixCartonEntries = Object.entries(item.mixCartons || {});

        let ctnNoStr = '';
        let totalNoCtnStr = '';

        const regCtnCount = regCartons.length;
        const totalMixPcs = mixCartonEntries.reduce((sum, [, count]) => sum + count, 0);

        const formatNumberRanges = (nums) => {
            if (!nums || nums.length === 0) return '';
            const sorted = Array.from(new Set(nums))
                .map(n => parseInt(n, 10))
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);
            if (sorted.length === 0) return nums.join(',');

            const ranges = [];
            let start = sorted[0];
            let prev = sorted[0];

            for (let i = 1; i <= sorted.length; i++) {
                if (i < sorted.length && sorted[i] === prev + 1) {
                    prev = sorted[i];
                } else {
                    if (start === prev) {
                        ranges.push(`${start}`);
                    } else if (prev === start + 1) {
                        ranges.push(`${start},${prev}`);
                    } else {
                        ranges.push(`${start}-${prev}`);
                    }
                    if (i < sorted.length) {
                        start = sorted[i];
                        prev = sorted[i];
                    }
                }
            }
            return ranges.join(',');
        };

        const ctnParts = [];
        if (regCtnCount > 0) {
            ctnParts.push(formatNumberRanges(regCartons));
        }
        if (mixCartonEntries.length > 0) {
            const mixStr = mixCartonEntries.map(([name, pcs]) => `${name}[${pcs}PC]`).join(', ');
            ctnParts.push(mixStr);
        }
        ctnNoStr = ctnParts.join(', ');

        if (regCtnCount > 0 && totalMixPcs > 0) {
            totalNoCtnStr = `${regCtnCount}CTN + ${totalMixPcs}PC IN MIX`;
        } else if (regCtnCount > 0) {
            totalNoCtnStr = regCtnCount.toString();
        } else if (totalMixPcs > 0) {
            totalNoCtnStr = `${totalMixPcs}PC IN MIX`;
        }

        const dataRow = worksheet.addRow({
            sl: serialNumber++,
            mark: item.productCode,
            partNo: 'PKT FROM OUTSIDE ONLINE',
            desc: '',
            qty: item.quantity,
            bshRef: 'OUTSIDE',
            aswaqInv: 'ONLY SHPNG',
            weight: item.weight,
            pricePerKg: '',
            shippingCost: '',
            totalCtn: ctnNoStr,
            totalNoCtn: totalNoCtnStr
        });

        dataRow.height = 25;

        // Merge cells C and D (partNo and desc)
        worksheet.mergeCells(`C${dataRow.number}:D${dataRow.number}`);

        // Add formula to shipping cost column (column J, which is column 10)
        const shippingCostCell = dataRow.getCell(10);
        shippingCostCell.value = {
            formula: `IF(ISNUMBER(I${dataRow.number}), H${dataRow.number}*I${dataRow.number}, 0)`,
            result: 0
        };

        // Add 3-decimal format to weight column (column H, which is column 8)
        const weightCell = dataRow.getCell(8);
        weightCell.numFmt = '#,##0.000';

        // Add currency format to price per kg column (column I, which is column 9)
        const pricePerKgCell = dataRow.getCell(9);
        pricePerKgCell.numFmt = '$#,##0.00';

        // Add currency format to shipping cost column (column J, which is column 10)
        shippingCostCell.numFmt = '$#,##0.00';

        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
                readingOrder: 'contextDependent'
            };

            let fontSize = 10;
            let fontColor = 'FF000000'; // Default black

            // Red color for price and shipping cost columns
            if (colNumber === 9 || colNumber === 10) {
                fontColor = 'FFFF0000'; // Red
            }

            // Green color only for TOTAL NO OF CTN (column 12)
            if (colNumber === 12) {
                fontColor = 'FF008000'; // Green
            }

            cell.font = {
                size: fontSize,
                name: 'Calibri',
                color: { argb: fontColor }
            };
        });
    });

    // --- BOTTOM SUMMARY ROWS (FULL TABLE WIDTH: COLUMNS 1 TO 12) ---
    const startDataRow = 4;
    const endDataRow = worksheet.lastRow ? worksheet.lastRow.number : 3;

    if (endDataRow >= startDataRow) {
        // 1. TOTAL WEIGHT & TOTAL SHIPPING COST ROW
        const totalWeightRow = worksheet.addRow([]);
        const totalWeightRowNum = totalWeightRow.number;
        totalWeightRow.height = 28;

        // Merge A to G (Cols 1-7) for TOTAL WEIGHT label
        worksheet.mergeCells(`A${totalWeightRowNum}:G${totalWeightRowNum}`);
        const totalWeightLabelCell = worksheet.getCell(`A${totalWeightRowNum}`);
        totalWeightLabelCell.value = 'TOTAL WEIGHT';
        totalWeightLabelCell.font = { bold: true, size: 10, name: 'Calibri' };
        totalWeightLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Column H (Col 8: Total Weight SUM)
        const totalWeightSumCell = worksheet.getCell(`H${totalWeightRowNum}`);
        totalWeightSumCell.value = {
            formula: `SUM(H${startDataRow}:H${endDataRow})`,
            result: 0
        };
        totalWeightSumCell.numFmt = '#,##0.000';
        totalWeightSumCell.font = { bold: true, size: 10, name: 'Calibri' };
        totalWeightSumCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Column I (Col 9: empty)
        const emptyColI = worksheet.getCell(`I${totalWeightRowNum}`);
        emptyColI.value = '';

        // Column J (Col 10: Total Shipping Cost SUM)
        const totalShippingSumCell = worksheet.getCell(`J${totalWeightRowNum}`);
        totalShippingSumCell.value = {
            formula: `SUM(J${startDataRow}:J${endDataRow})`,
            result: 0
        };
        totalShippingSumCell.numFmt = '$#,##0.00';
        totalShippingSumCell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FFFF0000' } };
        totalShippingSumCell.alignment = { horizontal: 'right', vertical: 'middle' };

        // Merge K to L (Cols 11-12: empty right side to fill full table width)
        worksheet.mergeCells(`K${totalWeightRowNum}:L${totalWeightRowNum}`);
        const emptyRightCell = worksheet.getCell(`K${totalWeightRowNum}`);
        emptyRightCell.value = '';

        // Apply borders for Total Weight row (Cols 1 to 12)
        for (let col = 1; col <= 12; col++) {
            const cell = worksheet.getCell(totalWeightRowNum, col);
            cell.border = {
                top: { style: 'medium' },
                bottom: { style: 'medium' },
                left: { style: col === 1 || col === 8 || col === 10 || col === 11 ? 'medium' : 'thin' },
                right: { style: col === 7 || col === 8 || col === 10 || col === 12 ? 'medium' : 'thin' }
            };
        }

        // 2. TOTAL PACKAGE ROW (Cols 1 to 12)
        const allGonies = new Set();
        data.forEach(item => {
            if (item.goniNumber != null) allGonies.add(item.goniNumber.toString());
            if (item.goniName) allGonies.add(item.goniName.toString());
        });
        const totalPkgCount = allGonies.size || data.length;

        const totalPkgRow = worksheet.addRow([]);
        const totalPkgRowNum = totalPkgRow.number;
        totalPkgRow.height = 25;

        // Merge A to G (Cols 1-7) for TOTAL PACKAGE label
        worksheet.mergeCells(`A${totalPkgRowNum}:G${totalPkgRowNum}`);
        const totalPkgCell = worksheet.getCell(`A${totalPkgRowNum}`);
        totalPkgCell.value = 'TOTAL PACKAGE (مجموعة كاملة)';
        totalPkgCell.font = { bold: true, size: 10, name: 'Calibri' };
        totalPkgCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Merge H to L (Cols 8-12) for TOTAL PACKAGE count
        worksheet.mergeCells(`H${totalPkgRowNum}:L${totalPkgRowNum}`);
        const totalCountCell = worksheet.getCell(`H${totalPkgRowNum}`);
        totalCountCell.value = `TOTAL PACKAGES = ${totalPkgCount}`;
        totalCountCell.font = { bold: true, size: 10, name: 'Calibri' };
        totalCountCell.alignment = { horizontal: 'center', vertical: 'middle' };

        for (let col = 1; col <= 12; col++) {
            const cell = worksheet.getCell(totalPkgRowNum, col);
            cell.border = {
                top: { style: 'medium' },
                bottom: { style: 'medium' },
                left: { style: col === 1 || col === 8 ? 'medium' : 'thin' },
                right: { style: col === 7 || col === 12 ? 'medium' : 'thin' }
            };
        }
    }

    let filename = 'voyage_data.xlsx';
    if (voyageName) {
        const cleanVoyageName = voyageName.replace(/[<>:"/\\|?*]/g, '_');
        filename = `${cleanVoyageName}_data.xlsx`;
    } else if (voyageId) {
        filename = `voyage_${voyageId}_data.xlsx`;
    }

    try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        throw new Error(`Failed to generate Excel file: ${error.message}`);
    }
};