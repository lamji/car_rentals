"use client";

import { User, Edit, Phone, MapPin, LogOut, ArrowLeft, Trash } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export function ProfilePage() {
  const { userProfile, handleLogout, handleDelete } = useProfile();
  const router = useRouter();
  
  return (
    <div className="relative flex items-center justify-center" style={{ height: '80vh' }}>
      <button 
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
      <div className="w-full max-w-4xl bg-white flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center">
          {/* add avatar with circle border */}
          <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
            <User className="w-12 h-12 text-gray-600" />
          </div>
          {/* add name */}
          <h1 className="text-2xl">{userProfile.fullName}</h1>
          {/* add email */}
          <p className="text-muted-foreground">{userProfile.email}</p>
          {/* add edit button */}
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded-full border-2 border-primary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          {/* List items with icon and value */}
          <div className="mt-8 w-full max-w-md space-y-4">
            <div className="p-4 rounded-lg w-80 bg-gray-800 space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-white mr-2" />
                <span className="text-white font-medium text-xs md:text-base">{userProfile.mobileNumber}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-white mr-2" />
                <span className="text-white font-medium text-xs md:text-base">{userProfile.address.street}, {userProfile.address.city}, {userProfile.address.province} {userProfile.address.postalCode}, {userProfile.address.country}</span>
              </div>
            </div>

            {/* add logout button */}
            <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full border-2 border-red-600 flex items-center space-x-2 w-full">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* add delete account button */}
            <button onClick={handleDelete} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full border-2 border-red-600 flex items-center space-x-2 w-full">
              <Trash className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
