"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewHeaderProps {
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function ReviewHeader({ onRegenerate, isGenerating }: ReviewHeaderProps) {
  const router = useRouter();
  
  const handleSave = () => {
    toast.success("SOAP note saved successfully!");
  };
  
  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}...`);
    // In a real app, this would trigger a download
  };
  
  const handleApprove = () => {
    toast.success("SOAP note approved and saved to patient record");
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Review Generated Note</h1>
          <p className="text-muted-foreground">
            Review and edit the AI-generated SOAP note before saving
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/consultation/new")}>
            <Icons.x className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <Button variant="outline" disabled={isGenerating} onClick={onRegenerate}>
            {isGenerating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Icons.plus className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icons.fileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("PDF")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("Word")}>
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("EMR")}>
                Send to EMR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={handleApprove}>
            <Icons.check className="mr-2 h-4 w-4" />
            Approve & Save
          </Button>
        </div>
      </div>
    </div>
  );
}