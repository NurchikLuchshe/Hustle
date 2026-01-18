import { useToast as useToastOriginal } from "@/components/ui/use-toast";

export { useToast };

function useToast() {
    return useToastOriginal();
}
