"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RxData {
    id: string;
    patientName: string;
    doctorName: string;
    date: string;
    medications: any[];
    clinicName: string;
}

export function DownloadRxButton({ data }: { data: RxData }) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text(data.clinicName, 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text("Prescription", 105, 30, { align: "center" });

        // Patient Details
        doc.setFontSize(10);
        doc.text(`Patient: ${data.patientName}`, 14, 45);
        doc.text(`Doctor: ${data.doctorName}`, 14, 50);
        doc.text(`Date: ${data.date}`, 160, 45);

        // Medications Table
        const tableColumn = ["Medicine", "Dosage", "Frequency", "Duration", "Instruction"];
        const tableRows = data.medications.map((med) => [
            med.medicine,
            med.dosage,
            med.frequency,
            med.duration,
            med.instruction || "-"
        ]);

        autoTable(doc, {
            startY: 60,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202] }
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.text("Signature: ___________________", 140, finalY);

        doc.save(`Rx_${data.patientName.replace(/\s+/g, '_')}_${data.date}.pdf`);
    };

    return (
        <Button size="sm" variant="outline" onClick={generatePDF} className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
        </Button>
    );
}
