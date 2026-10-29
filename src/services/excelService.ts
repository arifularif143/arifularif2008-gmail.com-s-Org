import * as XLSX from 'xlsx';
import { ServiceJob, DeviceType, JobStatus, Branch } from '../types';

export interface ImportSummary {
  totalProcessed: number;
  importedCount: number;
  duplicateCount: number;
  sheetBreakdown: Record<string, number>;
  records: ServiceJob[];
  warnings: string[];
}

// Convert Excel dates (which can be numbers or strings) to YYYY-MM-DD
function formatExcelDate(rawDate: any): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  if (typeof rawDate === 'number') {
    // Excel serial date to JS date
    const dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
  }
  const dateStr = String(rawDate).trim();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return dateStr;
}

export const parseExcelServiceHistory = async (
  file: File, 
  existingJobs: ServiceJob[],
  branches: Branch[]
): Promise<ImportSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedJobs: ServiceJob[] = [];
        const existingJobNumbers = new Set(existingJobs.map(j => j.jobNumber.toLowerCase().trim()));
        let duplicateCount = 0;
        let totalProcessed = 0;
        const sheetBreakdown: Record<string, number> = {};
        const warnings: string[] = [];

        // Known branch map (slug to name or name to slug)
        const branchNameToIdMap: Record<string, string> = {};
        branches.forEach(b => {
          branchNameToIdMap[b.name.toLowerCase().trim()] = b.id;
          branchNameToIdMap[b.id.toLowerCase().trim()] = b.id;
        });

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          
          let sheetImportCount = 0;

          // Resolve branch ID for this sheet
          const normalizedSheet = sheetName.toLowerCase().trim();
          let branchId = branchNameToIdMap[normalizedSheet] || branches[0]?.id || 'divce-mama';

          rows.forEach((row, rowIndex) => {
            totalProcessed++;

            // Detect customer name (support English & Bengali variants)
            const customerName = (
              row['Name'] || 
              row['Customer Name'] || 
              row['Customer'] || 
              row['গ্রাহক'] || 
              row['নাম']
            );

            if (!customerName || String(customerName).trim() === '') {
              return; // Skip empty rows
            }

            const rawJobNum = (
              row['Job Number'] || 
              row['Job No'] || 
              row['Job #'] || 
              row['জব নং'] || 
              row['Token']
            );
            
            const rawBrand = String(row['Brand'] || row['ব্র্যান্ড'] || 'Generic').trim();
            const rawProblem = String(row['Problem'] || row['সমস্যা'] || row['Fault'] || 'General Service').trim();
            const serialOrModel = String(row['Serial / Model'] || row['Model'] || row['Serial'] || '').trim();
            const takaRaw = row['Taka'] || row['Cost'] || row['টাকা'] || row['Amount'] || 0;
            const taka = Number(String(takaRaw).replace(/[^0-9.]/g, '')) || 0;
            const receiveDate = formatExcelDate(row['Receive Date'] || row['Date'] || row['তারিখ']);
            const deliveryDateRaw = row['Delivery Date'] || row['ডেলিভারি তারিখ'];
            const deliveryDate = deliveryDateRaw ? formatExcelDate(deliveryDateRaw) : null;
            const deliveryName = row['Delivery Name'] || row['গ্রহীতার নাম'] ? String(row['Delivery Name'] || row['গ্রহীতার নাম']).trim() : null;
            const rawStatus = String(row['Status / Repair Result'] || row['Status'] || row['Result'] || 'Received').trim();

            // Unique Job Number or generate fallback
            let jobNumber = rawJobNum ? String(rawJobNum).trim() : `MT-IMP-${Math.floor(1000 + Math.random() * 9000)}`;

            if (existingJobNumbers.has(jobNumber.toLowerCase())) {
              duplicateCount++;
              warnings.push(`সারি ${rowIndex + 2} (${sheetName}): জব নং "${jobNumber}" ইতোমধ্যে বিদ্যমান থাকায় বাদ দেওয়া হলো।`);
              return;
            }

            // Status mapping
            let status: JobStatus = 'Received';
            const sLower = rawStatus.toLowerCase();
            if (sLower.includes('deliver')) status = 'Delivered';
            else if (sLower.includes('ready')) status = 'Ready for Delivery';
            else if (sLower.includes('under repair') || sLower.includes('repairing') || sLower.includes('working')) status = 'Under Repair';
            else if (sLower.includes('part') || sLower.includes('waiting')) status = 'Waiting for Parts';
            else if (sLower.includes('unrepair') || sLower.includes('not repair') || sLower.includes('cancel')) status = 'Unrepairable';
            else if (sLower.includes('return')) status = 'Returned Without Repair';
            else if (sLower.includes('completed') || sLower.includes('done') || sLower.includes('ok')) status = 'Repair Completed';

            // Device Type inference
            let deviceType: DeviceType = 'Laptop';
            const textToTest = `${serialOrModel} ${rawBrand} ${rawProblem}`.toLowerCase();
            if (textToTest.includes('monitor') || textToTest.includes('display') || textToTest.includes('lg 24') || textToTest.includes('dell 22')) {
              deviceType = 'Monitor';
            } else if (textToTest.includes('desktop') || textToTest.includes('cpu') || textToTest.includes('casing') || textToTest.includes('motherboard b')) {
              deviceType = 'Desktop';
            }

            const isDelivered = status === 'Delivered';
            const totalPaid = isDelivered ? taka : 0;
            const remainingBalance = isDelivered ? 0 : taka;
            const now = new Date().toISOString();

            const job: ServiceJob = {
              id: crypto.randomUUID(),
              jobNumber,
              branchId,
              receiveDate,
              customerId: crypto.randomUUID(),
              customerName: String(customerName).trim(),
              customerPhone: String(row['Phone'] || row['Mobile'] || row['ফোন'] || '01700000000').trim(),
              customerAddress: String(row['Address'] || row['ঠিকানা'] || '').trim(),
              deviceType,
              brand: rawBrand,
              modelNumber: serialOrModel,
              serialNumber: '',
              problemDescription: rawProblem,
              receivedBy: 'Excel Import',
              status,
              statusHistory: [
                {
                  status,
                  timestamp: now,
                  updatedBy: 'Excel Import',
                  note: `Imported from sheet tab: ${sheetName}`
                }
              ],
              estimatedCost: taka,
              finalCost: taka,
              totalPaid,
              remainingBalance,
              paymentStatus: isDelivered ? 'Paid' : 'Unpaid',
              paymentHistory: isDelivered && taka > 0 ? [{
                id: crypto.randomUUID(),
                receiptNumber: `PAY-IMP-${Math.floor(100 + Math.random() * 900)}`,
                amount: taka,
                date: deliveryDate ? `${deliveryDate}T12:00:00.000Z` : now,
                method: 'Cash',
                receivedBy: 'Imported Record',
                note: 'ডেলিভারি পরিশোধ (Imported Paid)'
              }] : [],
              deliveryDate,
              deliveredBy: isDelivered ? 'Excel Record' : null,
              deliveryName: deliveryName || (isDelivered ? String(customerName).trim() : null),
              deliveryNotes: null,
              createdAt: now,
              updatedAt: now
            };

            importedJobs.push(job);
            existingJobNumbers.add(jobNumber.toLowerCase());
            sheetImportCount++;
          });

          sheetBreakdown[sheetName] = sheetImportCount;
        });

        resolve({
          totalProcessed,
          importedCount: importedJobs.length,
          duplicateCount,
          sheetBreakdown,
          records: importedJobs,
          warnings
        });

      } catch (err: any) {
        reject(new Error(`এক্সেল প্রসেস ব্যর্থ হয়েছে: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('ফাইলটি পড়া সম্ভব হয়নি।'));
    reader.readAsArrayBuffer(file);
  });
};

export const exportJobsToExcel = (jobs: ServiceJob[], branches: Branch[], fileNamePrefix = 'Master_Technology_Services') => {
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create consolidated main sheet
  const mainSheetData = jobs.map(job => ({
    'Receive Date': job.receiveDate,
    'Name': job.customerName,
    'Phone': job.customerPhone,
    'Brand': job.brand,
    'Problem': job.problemDescription,
    'Serial / Model': job.modelNumber || job.serialNumber || '',
    'Taka': job.finalCost,
    'Job Number': job.jobNumber,
    'Status / Repair Result': job.status,
    'Delivery Date': job.deliveryDate || '',
    'Paid Date': job.paymentHistory.length ? job.paymentHistory[job.paymentHistory.length - 1].date.split('T')[0] : '',
    'Delivery Name': job.deliveryName || '',
    'Branch': branchMap.get(job.branchId) || job.branchId
  }));

  const mainWorksheet = XLSX.utils.json_to_sheet(mainSheetData);
  XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'All_Services');

  // Also create individual sheets per branch matching legacy structure!
  branches.forEach(branch => {
    const branchJobs = jobs.filter(j => j.branchId === branch.id);
    if (branchJobs.length > 0) {
      const branchSheetData = branchJobs.map(job => ({
        'Receive Date': job.receiveDate,
        'Name': job.customerName,
        'Phone': job.customerPhone,
        'Brand': job.brand,
        'Problem': job.problemDescription,
        'Serial / Model': job.modelNumber || job.serialNumber || '',
        'Taka': job.finalCost,
        'Job Number': job.jobNumber,
        'Status / Repair Result': job.status,
        'Delivery Date': job.deliveryDate || '',
        'Paid Date': job.paymentHistory.length ? job.paymentHistory[job.paymentHistory.length - 1].date.split('T')[0] : '',
        'Delivery Name': job.deliveryName || ''
      }));

      const branchSheet = XLSX.utils.json_to_sheet(branchSheetData);
      // Clean sheet name to max 31 chars valid in excel
      const safeSheetName = branch.name.replace(/[\\/?*[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, branchSheet, safeSheetName);
    }
  });

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
};

export const downloadExcelTemplate = () => {
  const workbook = XLSX.utils.book_new();

  const sampleRows = [
    {
      'Receive Date': '2026-10-29',
      'Name': 'Md. Rahim Uddin',
      'Phone': '01712345678',
      'Brand': 'HP',
      'Problem': 'No display & motherboard short',
      'Serial / Model': 'ProBook 450 G8 / S/N 5CD9281',
      'Taka': 3500,
      'Job Number': 'MT-26-0101',
      'Status / Repair Result': 'Received',
      'Delivery Date': '',
      'Paid Date': '',
      'Delivery Name': ''
    },
    {
      'Receive Date': '2026-10-28',
      'Name': 'Kazi Noman',
      'Phone': '01912345678',
      'Brand': 'Dell',
      'Problem': 'Display broken',
      'Serial / Model': 'Inspiron 3501',
      'Taka': 4200,
      'Job Number': 'MT-26-0102',
      'Status / Repair Result': 'Delivered',
      'Delivery Date': '2026-10-29',
      'Paid Date': '2026-10-29',
      'Delivery Name': 'Kazi Noman'
    }
  ];

  // Create sample tabs matching the legacy shops
  const sheetNames = ['Divce MAMA', 'Peragong', 'Daffodil', 'Gulsan trest', 'HS-E', 'JARA Computer'];
  sheetNames.forEach(name => {
    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  XLSX.writeFile(workbook, 'Master_Technology_Service_Template.xlsx');
};
