
import { Button } from "@/components/ui/button";

export const CoverPhotoSection = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Change Cover Photo</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-bb-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-gray-700">Your Cover Photo will be used to customize the header of your profile.</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        <div className="space-y-4">
          <p className="text-gray-500">Drop your image here</p>
          <Button variant="outline" className="border-gray-300">Select your file</Button>
          <p className="text-xs text-orange-500">For best results, upload an image that is 1950px by 450px or larger.</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">If you'd like to delete your current cover photo, use the delete Cover Photo button.</p>
        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Delete My Cover Photo</Button>
      </div>
    </div>
  );
};