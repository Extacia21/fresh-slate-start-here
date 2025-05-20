
import React from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ReportForm from "@/components/forms/ReportForm";

const Report = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container pb-24">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Report an Emergency</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
        <AlertTriangle className="text-yellow-600 mt-0.5 mr-3 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-medium text-yellow-800">Important Notice</h3>
          <p className="text-sm text-yellow-700">
            In case of immediate danger, please call emergency services directly. 
            This form is for reporting non-urgent safety concerns.
          </p>
        </div>
      </div>

      <ReportForm />
    </div>
  );
};

export default Report;
