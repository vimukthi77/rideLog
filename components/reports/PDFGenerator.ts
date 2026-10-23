import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface GeneratePDFParams {
  vehicle: any;
  rides: any[];
  summary: any;
  fromDate?: string;
  toDate?: string;
}

export async function generateVehicleLogbookPDF({
  vehicle,
  rides,
  summary,
  fromDate,
  toDate,
}: GeneratePDFParams) {
  // Create A4 Landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Try to load logo as image or fallback
  let logoLoaded = false;
  try {
    const img = new Image();
    img.src = '/logo.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    // Add logo to top left
    doc.addImage(img, 'PNG', 14, 10, 48, 12);
    logoLoaded = true;
  } catch (e) {
    // Fallback text if logo fails to load in browser context
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(27, 38, 44);
    doc.text('LAKDHANAVI LIMITED', 14, 16);
  }

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(27, 38, 44); // #1B262C
  doc.text('Lakdhanavi Limited', 68, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 76, 117); // #0F4C75
  doc.text('Sahasdhanavi 350MW CCPP EPC Project', 68, 19);
  doc.setTextColor(127, 140, 141);
  doc.text('Kerawalapitiya, Sri Lanka • Transport Department Logbook', 68, 24);

  // Right-aligned report metadata block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 38, 44);
  const regNo = vehicle ? vehicle.vehicleRegNo : 'All Fleet Vehicles';
  const vehName = vehicle ? ` (${vehicle.vehicleType} - ${vehicle.vehicleName})` : '';
  doc.text(`Vehicle Reg. No: ${regNo}${vehName}`, pageWidth - 14, 14, { align: 'right' });

  const monthStr = fromDate
    ? `${format(new Date(fromDate), 'MMM yyyy')}`
    : `${format(new Date(), 'MMMM yyyy')}`;
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Period: ${monthStr}`, pageWidth - 14, 19, { align: 'right' });
  doc.text(`Date Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 14, 24, { align: 'right' });

  // Divider line
  doc.setDrawColor(50, 130, 184); // #3282B8
  doc.setLineWidth(0.8);
  doc.line(14, 28, pageWidth - 14, 28);

  // Table Data preparation
  const tableRows = rides.map((r, index) => {
    const rideDate = r.date ? format(new Date(r.date), 'MM-dd') : '--';
    const officer = r.authorizingOfficer || '--';
    const sTime = r.startTime || '--';
    const eTime = r.endTime || (r.status === 'ongoing' ? 'Ongoing' : '--');
    const sMileage = r.startMileageKM !== undefined ? r.startMileageKM : '--';
    const eMileage = r.endMileageKM !== undefined ? r.endMileageKM : '--';
    const kmDone = r.noOfKMDone !== undefined ? r.noOfKMDone : '--';
    const driver = r.driver?.fullName || '--';
    const passenger = r.passenger?.fullName || '--';
    const places = r.placesVisited || '--';
    const ot = r.otHours || 0;

    return [
      rideDate,
      officer,
      sTime,
      eTime,
      sMileage,
      eMileage,
      kmDone,
      driver,
      passenger,
      places,
      ot,
    ];
  });

  // Table Columns matching paper logbook
  const headers = [
    [
      'Date',
      'Initials of\nOfficer Auth.',
      'Start\nTime',
      'End\nTime',
      'Start Mileage\nKM Reading',
      'End Mileage\nKM Reading',
      'No of KM\nDone',
      'Driver Name',
      'Name of Person\nTraveling (Resp.)',
      'Places Visited',
      'OT\nHours',
    ],
  ];

  autoTable(doc, {
    startY: 32,
    head: headers,
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [27, 38, 44], // #1B262C
      lineColor: [50, 130, 184], // #3282B8
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [27, 38, 44], // #1B262C
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [235, 245, 255], // Light blue #BBE1FA tint
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 18 },
      7: { cellWidth: 30 },
      8: { cellWidth: 32 },
      9: { cellWidth: 'auto' },
      10: { halign: 'center', cellWidth: 14 },
    },
    margin: { left: 14, right: 14 },
  });

  // Position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary Box below table
  doc.setDrawColor(50, 130, 184);
  doc.setFillColor(245, 250, 255);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 76, 117);
  doc.text(`Total KM Done: ${summary.totalKMDone || 0} KM`, 20, finalY + 8);
  doc.text(`Total Trips: ${summary.totalTrips || 0}`, 90, finalY + 8);
  doc.text(`Last Meter Reading: ${summary.lastMeterReading || 0} KM`, 160, finalY + 8);

  // Footer Section
  const footerY = pageHeight - 16;
  doc.setLineWidth(0.4);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(127, 140, 141);
  doc.text('Checked By: __________________________', 14, footerY + 2);
  doc.text('Transport Officer: __________________________', 100, footerY + 2);
  doc.text('This is a digitally generated report from Lakdhanavi Ride Recording System', pageWidth - 14, footerY + 2, {
    align: 'right',
  });

  // Save the PDF
  const filename = `Lakdhanavi_Logbook_${regNo.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}
