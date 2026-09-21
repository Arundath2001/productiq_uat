import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import images from "../lib/images";

const BillOfLadingPDF = ({ billData }) => {
  const maxItemsPerPage = 10;

  const totalGrossWeight = billData.items.reduce(
    (sum, item) => sum + parseFloat(item.grossWeight || 0),
    0,
  );

  const totalCBM = billData.items.reduce(
    (sum, item) => sum + parseFloat(item.measurement || 0),
    0,
  );

  const uniqueContainers = new Set(
    billData.items
      .map((item) => item.marksNos)
      .filter((mark) => mark && mark.trim() !== ""),
  );

  const totalContainers = uniqueContainers.size;

  const totalPieces = billData.items.reduce(
    (sum, item) => sum + parseFloat(item.noofPieces || 0),
    0,
  );

  const firstPageItems = billData.items.slice(0, maxItemsPerPage);
  const remainingItems = billData.items.slice(maxItemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderPdf = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainText}>BILL OF LADING</Text>

        <View style={styles.topRow}>
          <View style={styles.topRight}>
            <View>
              <View style={styles.addressColumn}>
                <Text style={styles.label}>Shipper</Text>
                <Text style={styles.pdfData}>{billData.shipper}</Text>
              </View>

              <View style={styles.addressColumn}>
                <Text style={styles.label}>
                  Consignee (if "to order" so indicate):
                </Text>
                <Text style={styles.pdfData}>{billData.consignee}</Text>
              </View>
            </View>

            <View>
              <View style={styles.addressColumn}>
                <Text style={styles.label}>Notify Address:</Text>
                <Text style={styles.pdfData}>{billData.notifyAddress}</Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={[styles.column]}>
                <Text style={styles.label}>Pre Carriage By:</Text>
                <Text style={styles.pdfData}>
                  {billData.preCarriageBy ? billData.preCarriageBy : "NIL"}
                </Text>
              </View>

              <View style={[styles.column]}>
                <Text style={styles.label}>Place of Receipt:</Text>
                <Text style={styles.pdfData}>{billData.placeReceipt}</Text>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>No. of Original & Copy:</Text>
                <Text style={styles.pdfData}>{billData.originalAndCopy}</Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={[styles.column]}>
                <Text style={styles.label}>Port of Loading:</Text>
                <Text style={styles.pdfData}>{billData.portLoading}</Text>
              </View>

              <View style={[styles.column]}>
                <Text style={styles.label}>Port of Discharge :</Text>
                <Text style={styles.pdfData}>{billData.portDischarge}</Text>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Fax Number:</Text>
                <Text style={styles.pdfData}>{billData.fax}</Text>
              </View>
            </View>

            <View style={[styles.rowCont, { borderBottomWidth: 0 }]}>
              <View style={[styles.column]}>
                <Text style={styles.label}>Vessel :</Text>
                <Text style={styles.pdfData}>{billData.vessel}</Text>
              </View>

              <View style={[styles.column]}>
                <Text style={styles.label}>Place of Final Delivery:</Text>
                <Text style={styles.pdfData}>{billData.portDelivery}</Text>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Voy No :</Text>
                <Text style={styles.pdfData}>{billData.voyNo}</Text>
              </View>
            </View>
          </View>

          <View style={styles.logoCont}>
            <View style={styles.logoTop}>
              <View style={styles.billNoSection}>
                <Text style={styles.label}>
                  BL No:
                  <Text style={styles.pdfData}>{billData.billNo}</Text>
                </Text>
              </View>

              <View style={styles.hblSection}>
                <Text style={styles.label}>
                  Booking No:{" "}
                  <Text style={styles.pdfData}>{billData.codeName}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.logoAddress}>
              <Image src={images.bolLogo} style={styles.logo} />

              <View style={[styles.iconRow, { paddingHorizontal: 20 }]}>
                <Text style={styles.whiteText}>
                  {billData.branchId?.address || `ASWAQ FORWARDER SEA SHIPPING LINES AGENTS CO. L.L.C		
SHED NO. S-06 STREET NO.3
RAS AL KHOR INDUSTRIAL AREA 2
DUBAI, UAE`}
                </Text>
              </View>

              <View style={styles.iconRow}>
                <Text style={styles.whiteText}>
                  {/* Tel: (04) 557 4061, Mob: +971 56 784 1517,
                  {"\n"} */}
                  Email: aswaqforwarderdocumentation@aswaqlogistic.com {"\n"}
                  aswaqforwarder@aswaqlogistic.com{"\n"}
                  aswaqforwarderoperation@aswaqlogistic.com
                </Text>
              </View>
            </View>

            <View style={[styles.addressColumn]}>
              <Text style={styles.label}>Agent at Destination</Text>
              <Text style={styles.pdfData}>{billData.agentDestination}</Text>
            </View>

            <View style={[styles.rowCont, { borderBottomWidth: 0 }]}>
              <View style={[styles.column]}>
                <Text style={styles.label}>Freight Payable at :</Text>
                <Text style={styles.pdfData}>{billData.freightPayableAt}</Text>
              </View>

              <View style={[styles.column]}>
                <Text style={styles.label}>Freight Status:</Text>
                <Text style={styles.pdfData}>{billData.freightStatus}</Text>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>Type of Service :</Text>
                <Text style={styles.pdfData}>{billData.typeofService}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NEW TABLE DESIGN */}
        <View>
          <View style={styles.tableContainer}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.colMarksHeader}>
                <Text style={styles.tableHeaderText}>Mark and Nos.</Text>
              </View>
              <View style={styles.colPackagesHeader}>
                <Text style={styles.tableHeaderText}>
                  No. of Packages{"\n"}Container Type
                </Text>
              </View>
              <View style={styles.colDescriptionHeader}>
                <Text style={styles.tableHeaderText}>
                  Quantity and Description of Goods
                </Text>
              </View>
              <View style={styles.colWeightHeader}>
                <Text style={styles.tableHeaderText}>
                  Gross Weight{"\n"}(Kg)
                </Text>
              </View>
              <View style={styles.colMeasurementHeader}>
                <Text style={styles.tableHeaderText}>
                  Measurement{"\n"}(m³ CBM)
                </Text>
              </View>
            </View>

            {/* Data Rows */}
            <View>
              {firstPageItems.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.colMarks}>
                    <Text style={styles.cellText}>
                      {item.marksNos}
                      {item.sealNo && `\nSEAL# ${item.sealNo}`}
                    </Text>
                  </View>
                  <View style={styles.colPackages}>
                    <Text style={styles.cellText}>{item.ctnType}</Text>
                  </View>
                  <View style={styles.colDescription}>
                    <Text style={styles.cellTextLeft}>
                      {item.quantityDescription}
                    </Text>
                    {item?.hsCode && (
                      <Text style={styles.cellTextLeft}>
                        HS CODE:{item.hsCode}
                      </Text>
                    )}
                  </View>
                  <View style={styles.colWeight}>
                    <Text style={styles.cellText}>{item.grossWeight} Kg</Text>
                  </View>
                  <View style={styles.colMeasurement}>
                    <Text style={styles.cellText}>{item.measurement}</Text>
                  </View>
                </View>
              ))}

              {billData.negotiable && (
                <View style={styles.negoOverlay}>
                  <Text style={styles.negotiable}>NOT NEGOTIABLE</Text>
                </View>
              )}
            </View>

            {/* Totals Row */}
            <View style={[styles.tableRow, styles.totalsRow]}>
              <View style={styles.colMarks}>
                <Text style={[styles.cellText, styles.totalText]}>
                  TOTAL CNTR: {totalContainers}
                </Text>
              </View>
              <View style={styles.colPackages}>
                <Text style={[styles.cellText, styles.totalText]}></Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={[styles.cellTextLeft, styles.totalText]}>
                  TOTAL
                  {billData?.qtyType !== "-" && ` ${billData.qtyType}`}:{" "}
                  {totalPieces}
                  {billData?.qtyType !== "-" && ` ${billData.qtyType}`}
                </Text>
              </View>
              <View style={styles.colWeight}>
                <Text style={[styles.cellText, styles.totalText]}>
                  TOTAL: {totalGrossWeight.toFixed(2)} Kg
                </Text>
              </View>
              <View style={styles.colMeasurement}>
                <Text style={[styles.cellText, styles.totalText]}>
                  TOTAL: {totalCBM.toFixed(2)} m³
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              {billData.Negotiable && (
                <Text style={styles.negoText}>NOT NEGOTIABLE</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.shippedOnBoardWrap}>
            {billData.shipOnDate && (
              <View style={styles.shippedOnBoardContainer}>
                <Text style={styles.shippedOnBoardLabel}>SHIPPED ON BOARD</Text>
                <Text style={styles.shippedOnBoardDate}>
                  {formatDate(billData.shipDate)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.centeredText}>
            Particulars above declared shipper
          </Text>

          <View style={styles.recievedView}>
            <Text style={styles.recievedText}>
              Received the goods in apparent good order and condition and, as
              far as ascertained by reasonable means of checking, as specified
              above unless otherwise stated. These Carrier, in accordance with
              provisions contained in this document. a)Undertakes to perform or
              to procure the performance of the entire transport from the place
              at which goods are taken in charge to the place designated for
              delivery in this document, and b)Assumes liability as prescribed
              in this document for such transport. One of the Bs/L must be
              surrendered duly endorsed in exchange for the goods or delivery
              order. IN WITNESS whereof Original Bs/L have been signed, if not
              otherwise stated above, one of which being accomplished the
              other(s) to be void.
            </Text>
          </View>

          <View style={styles.fullCont}>
            <View style={styles.leftSection}>
              <View style={styles.bottomBox}>
                <Text style={styles.label}>"FREE OUT"</Text>
                <Text style={styles.smallText}>
                  CARRIER IS NOT RESPONSIBLE FOR DAMAGE-SHORTAGE-SHORT CONTENTS.
                  {"\n"}WEIGHT, DESCRIPTION AND CONTENT OF CARGO AS DECLARED BY
                  SHIPPERS.{"\n"}SHIPPER LOAD STOW AND COUNT.
                  {"\n"}
                  CONTENTS UNKNOWN TO THE CARRIERS.{"\n"}ALL RELOADING EXPENSES
                  OF EMPTY CONTAINERS AT PORT OF DISCHARGE ON {"\n"}
                  RECEIVER'S / CONSIGNEE ACCOUNT.{"\n"}DEMURRAGE SCALE PER TEU.
                  FIRST : {billData.freeDays}
                  {"\n"}
                  FROM 11TH TO 20TH DAY: US$ 8.00 / DAY PER TEU{"\n"}FROM 20TH
                  DAY UP TO BACK EMPTY: US$ 16.00 / DAY PER TEU
                </Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.label}>
                Date: <Text style={styles.pdfData}>{billData.issueDate}</Text>
              </Text>
              <Text style={styles.label}>
                Place of Issue:{" "}
                <Text style={styles.pdfData}>{billData.issuePlace}</Text>
              </Text>

              <Text style={styles.label}>Signed By</Text>

              {!billData.draft && (
                <Image src={images.seal} style={styles.seal} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.draftOverlay}>
          <Text style={styles.draftText}>
            {billData.blType.replace(" ", "\n")}
          </Text>
        </View>
      </Page>

      {remainingItems.length > 0 && (
        <Page size="A4" style={styles.page2}>
          <View style={styles.section}>
            <Text style={styles.page2MainHead}>ATTACHED SHEET II</Text>
            <Text style={styles.blDetailsText}>BL DETAILS : </Text>
            <View style={styles.rowCont}>
              <View>
                <Text style={styles.label}>BL Number</Text>
                <Text style={styles.pdfData}>{billData.billNo}</Text>
              </View>
              <View>
                <Text style={styles.label}>Vessel Name</Text>
                <Text style={styles.pdfData}>{billData.oceanVessel}</Text>
              </View>
              <View>
                <Text style={styles.label}>Voyage</Text>
                <Text style={styles.pdfData}>{billData.voyageNumber}</Text>
              </View>
            </View>

            <View>
              <View style={styles.tableContainer}>
                {/* Header Row */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.colMarksHeader}>
                    <Text style={styles.tableHeaderText}>Mark and Nos.</Text>
                  </View>
                  <View style={styles.colPackagesHeader}>
                    <Text style={styles.tableHeaderText}>
                      No. of Packages{"\n"}Container Type
                    </Text>
                  </View>
                  <View style={styles.colDescriptionHeader}>
                    <Text style={styles.tableHeaderText}>
                      Quantity and Description of Goods
                    </Text>
                  </View>
                  <View style={styles.colWeightHeader}>
                    <Text style={styles.tableHeaderText}>
                      Gross Weight{"\n"}(Kg)
                    </Text>
                  </View>
                  <View style={styles.colMeasurementHeader}>
                    <Text style={styles.tableHeaderText}>
                      Measurement{"\n"}(m³ CBM)
                    </Text>
                  </View>
                </View>

                {/* Data Rows */}
                {remainingItems.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.colMarks}>
                      <Text style={styles.cellText}>
                        {item.marksNos}
                        {item.sealNo && `\nSEAL# ${item.sealNo}`}
                      </Text>
                    </View>
                    <View style={styles.colPackages}>
                      <Text style={styles.cellText}>{item.ctnType}</Text>
                    </View>
                    <View style={styles.colDescription}>
                      <Text style={styles.cellTextLeft}>
                        {item.quantityDescription}
                      </Text>
                    </View>
                    <View style={styles.colWeight}>
                      <Text style={styles.cellText}>{item.grossWeight} Kg</Text>
                    </View>
                    <View style={styles.colMeasurement}>
                      <Text style={styles.cellText}>{item.measurement}</Text>
                    </View>
                  </View>
                ))}

                {/* Totals Row */}
                <View style={[styles.tableRow, styles.totalsRow]}>
                  <View style={styles.colMarks}>
                    <Text style={[styles.cellText, styles.totalText]}>
                      TOTAL CNTR: {totalContainers}
                    </Text>
                  </View>
                  <View style={styles.colPackages}>
                    <Text style={[styles.cellText, styles.totalText]}></Text>
                  </View>
                  <View style={styles.colDescription}>
                    <Text style={[styles.cellTextLeft, styles.totalText]}>
                      <Text style={[styles.cellTextLeft, styles.totalText]}>
                        TOTAL
                        {billData?.qtyType !== "-" &&
                          ` ${billData.qtyType}`}: {totalPieces}
                        {billData?.qtyType !== "-" && ` ${billData.qtyType}`}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.colWeight}>
                    <Text style={[styles.cellText, styles.totalText]}>
                      TOTAL: {totalGrossWeight.toFixed(2)} Kg
                    </Text>
                  </View>
                  <View style={styles.colMeasurement}>
                    <Text style={[styles.cellText, styles.totalText]}>
                      TOTAL: {totalCBM.toFixed(2)} m³
                    </Text>
                  </View>
                </View>
              </View>
              {!billData.draft && (
                <Image
                  style={[styles.seal, styles.seal2]}
                  source={images.seal}
                />
              )}
            </View>
          </View>

          <View style={styles.draftOverlay}>
            <Text style={styles.draftText}>
              {billData.draft ? "DRAFT" : "ORIGINAL"}
            </Text>
          </View>
        </Page>
      )}

      <Page size="A4" style={styles.blTerms}>
        <Image src={images.blTerms} style={styles.termsPageImg} />
      </Page>
    </Document>
  );

  return (
    <div>
      <PDFDownloadLink
        document={renderPdf}
        fileName={`${billData.billNo}${billData.blType}.pdf`}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-3 inline-block transition-colors"
      >
        {({ loading }) =>
          loading
            ? "Preparing PDF..."
            : `Download BL-${billData.billNo}-${billData.blType}`
        }
      </PDFDownloadLink>

      <PDFViewer width="100%" height="700px">
        {renderPdf}
      </PDFViewer>
    </div>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: "100%",
  },
  logo: {
    width: 110,
    height: 90,
    marginBottom: 10,
  },
  logoCont: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    width: "50%",
  },
  logoTop: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  billNoSection: {
    width: "50%",
    borderRightWidth: 1,
    padding: 4,
  },
  hblSection: {
    padding: 4,
  },
  logoAddress: {
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  icon: {
    width: 10,
    height: 10,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  whiteText: {
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  topRow: {
    flexDirection: "row",
  },
  mainText: {
    color: "#114FA2",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 8,
  },
  topRight: {
    flex: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    width: "50%",
  },
  label: {
    fontSize: 8,
    color: "#114FA2",
  },
  rowCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 0,
    borderBottomWidth: 1,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // NEW REDESIGNED TABLE STYLES
  tableContainer: {
    backgroundColor: "#EBF6FF",
    // marginTop: 5,
    borderBottomWidth: 1,
    borderColor: "#000000",
  },

  tableRow: {
    flexDirection: "row",
    minHeight: 22,
  },

  tableHeader: {
    backgroundColor: "#EBF6FF",
    // borderBottomWidth: 1,
    // borderColor: "#114FA2",
    minHeight: 28,
  },

  tableHeaderText: {
    fontSize: 7,
    color: "#114FA2",
    fontWeight: "bold",
    textAlign: "center",
  },

  // Optimized Column widths - Maximum space for description
  colMarks: {
    width: "12%",
    padding: 4,
    justifyContent: "center",
  },

  colPackages: {
    width: "14%",
    padding: 4,
    justifyContent: "center",
  },

  colDescription: {
    width: "50%", // Maximum width for description
    padding: 4,
    justifyContent: "center",
  },

  colWeight: {
    width: "12%",
    padding: 4,
    justifyContent: "center",
  },

  colMeasurement: {
    width: "12%",
    padding: 4,
    justifyContent: "center",
  },

  // Header-specific column styles with borders
  colMarksHeader: {
    width: "12%",
    // borderRightWidth: 1,
    // borderColor: "#114FA2",
    padding: 4,
    justifyContent: "center",
  },

  colPackagesHeader: {
    width: "14%",
    // borderRightWidth: 1,
    // borderColor: "#114FA2",
    padding: 4,
    justifyContent: "center",
  },

  colDescriptionHeader: {
    width: "50%",
    // borderRightWidth: 1,
    // borderColor: "#114FA2",
    padding: 4,
    justifyContent: "center",
  },

  colWeightHeader: {
    width: "12%",
    // borderRightWidth: 1,
    // borderColor: "#114FA2",
    padding: 4,
    justifyContent: "center",
  },

  colMeasurementHeader: {
    width: "12%",
    padding: 4,
    justifyContent: "center",
  },

  cellText: {
    fontSize: 7,
    color: "#000000",
    textAlign: "center",
  },

  cellTextLeft: {
    fontSize: 7,
    color: "#000000",
    textAlign: "left",
  },

  totalsRow: {
    backgroundColor: "#EBF6FF",
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#000000",
    minHeight: 25,
  },

  totalText: {
    fontWeight: "bold",
    color: "#114FA2",
    fontSize: 6,
  },

  bottomContainer: {
    width: "100%",
    marginTop: "auto",
  },
  fullCont: {
    flexDirection: "row",
    width: "100%",
  },
  leftSection: {
    width: "50%",
  },
  rightSection: {
    width: "50%",
    padding: 10,
    borderLeftWidth: 1,
    borderTopWidth: 1,
  },
  bottomBox: {
    borderTop: 1,
    padding: 10,
  },
  bottomBoxSmall: {
    borderWidth: 1,
    padding: 10,
  },

  pdfData: {
    fontSize: 8,
    color: "#000000",
    fontWeight: "900",
    marginTop: 5,
  },
  smallText: {
    fontSize: 7,
    color: "#000000",
    lineHeight: 1.5,
    marginTop: 10,
  },
  centeredText: {
    textAlign: "center",
    fontSize: 10,
    color: "#000000",
    fontWeight: "bold",
  },
  ptoText: {
    textAlign: "right",
    fontSize: 8,
    color: "#114FA2",
  },
  draftOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: {
    fontSize: 60,
    textAlign: "center",
    fontWeight: "bold",
    transform: "rotate(-45deg)",
    opacity: 0.1,
  },
  negoOverlay: {
    position: "absolute",
    top: 0,
    left: 380,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  negotiable: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    transform: "rotate(-50deg)",
    opacity: 0.1,
  },
  negoText: {
    fontSize: 20,
    color: "gray",
    fontWeight: "bold",
    textAlign: "center",
    transform: "rotate(-40deg)",
    opacity: 0.5,
  },
  recievedText: {
    fontSize: 8,
  },
  recievedView: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTop: 1,
  },
  seal: {
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  freight: {
    padding: 10,
  },
  page2: {
    padding: 20,
    flex: 1,
    height: "100%",
  },
  page2MainHead: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  blDetailsText: {
    fontSize: 10,
    marginBottom: 10,
  },
  seal2: {
    position: "absolute",
    top: 120,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addressColumn: {
    wordBreak: "break-word",
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  columnRight: {
    width: "50%",
    padding: 5,
  },
  blTerms: {
    padding: 0,
  },
  termsPageImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  shippedOnBoardWrap: {
    alignItems: "flex-end",
  },
  shippedOnBoardContainer: {
    alignItems: "center",
    paddingRight: 20,
    paddingBottom: 5,
    marginTop: 5,
  },
  shippedOnBoardLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#114FA2",
    fontFamily: "Times-Bold",
  },
  shippedOnBoardDate: {
    fontSize: 7,
    color: "#114FA2",
    marginTop: 2,
    fontFamily: "Times-Bold",
  },
  section: {
    marginBottom: 10,
  },
});

export default BillOfLadingPDF;
