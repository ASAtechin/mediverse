"use client";

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    createdAt: string | Date;
}

export function AttachmentsList({ attachments }: { attachments: Attachment[] }) {
    if (!attachments || attachments.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-slate-500">{format(new Date(file.createdAt), 'PP')}</p>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <ExternalLink className="h-4 w-4" /> Open
                        </a>
                    </Button>
                </div>
            ))}
        </div>
    );
}
