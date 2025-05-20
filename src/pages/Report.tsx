
import React from "react";
import { AlertTriangle } from "lucide-react";
import ReportForm from "@/components/forms/ReportForm";

const Report = () => {
  return (
    <div className="page-container">
      <div className="page-header border-b border-border">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h1 className="text-xl font-bold">Report Incident</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Report an emergency or hazardous situation
        </p>
      </div>

      <div className="py-4">
        <ReportForm />
      </div>
    </div>
  );
};

export default Report;
