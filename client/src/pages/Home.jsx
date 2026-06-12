import React from "react";
import { FaEdit, FaCog, FaTrash } from "react-icons/fa";
import Footer from "../components/Common/Footer";
import useHomeData from "../hooks/useHomeData";
import useHomeActions from "../hooks/useHomeActions";

import DashboardHeader from "../components/home/DashboardHeader";
import WelcomeBanner from "../components/home/WelcomeBanner";
import QuickActions from "../components/home/QuickActions";
import RecentRooms from "../components/home/RecentRooms";
import FriendsPanel from "../components/home/FriendsPanel";
import StatsCards from "../components/home/StatsCards";
import ProfileSummary from "../components/home/ProfileSummary";

import EditProfileModal from "../components/modals/EditProfileModal";
import SettingsModal from "../components/modals/SettingsModal";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";

export default function Home() {
  const homeData = useHomeData();
  const homeActions = useHomeActions(homeData);

  const {
    activeTab,
    setActiveTab,
    toast,
    user,
    friends,
    notifications,
    recentRooms,
    currentTheme,
    isLight,
    onlineCount,
    dismissNotification
  } = homeData;

  const {
    isEditModalOpen,
    setIsEditModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    newFriendName,
    setNewFriendName,
    editName,
    setEditName,
    editProfilePic,
    setEditProfilePic,
    editPassword,
    setEditPassword,
    editGender,
    setEditGender,
    editBio,
    setEditBio,
    editLocation,
    setEditLocation,
    editBirthday,
    setEditBirthday,
    editOtp,
    setEditOtp,
    isPasswordOtpSent,
    setIsPasswordOtpSent,
    otpLoading,
    otpSuccessMessage,
    setOtpSuccessMessage,
    editError,
    setEditError,
    editSuccess,
    setEditSuccess,
    settingsThemeState,
    setSettingsThemeState,
    settingsAllowJoinRequestsState,
    setSettingsAllowJoinRequestsState,
    settingsError,
    settingsSuccess,
    deleteError,
    handleImageUpload,
    handleLogout,
    handleAddFriend,
    handleRemoveFriend,
    handleRequestPasswordOTP,
    handleUpdateProfile,
    handleSaveSettings,
    handleDeleteAccount,
    handleJoinNotification
  } = homeActions;

  // Theme variable configurations
  const bgThemeClass = isLight
    ? "bg-zinc-50 text-zinc-900"
    : "bg-[#0f0f13] text-white";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const outlineBtnClass = isLight
    ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800"
    : "bg-zinc-850 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-white";

  return (
    <div
      className={`min-h-screen ${bgThemeClass} flex flex-col relative overflow-hidden transition-colors duration-300`}
    >
      {/* Decorative BG Blur */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navbar */}
      <DashboardHeader
        user={user}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLight={isLight}
        onJoinNotification={handleJoinNotification}
        onDismissNotification={dismissNotification}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenEditProfile={() => setIsEditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 relative z-10">
        {activeTab === "dashboard" ? (
          /* =================== DASHBOARD TAB =================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Area: Welcome + Actions + History (Lg: 8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              <WelcomeBanner user={user} isLight={isLight} />
              <QuickActions isLight={isLight} />
              <RecentRooms recentRooms={recentRooms} isLight={isLight} />
            </div>

            {/* Right Side Column: Friends List Dashboard Panel (Lg: 4 cols) */}
            <FriendsPanel
              friends={friends}
              onlineCount={onlineCount}
              newFriendName={newFriendName}
              setNewFriendName={setNewFriendName}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
              isLight={isLight}
            />
          </div>
        ) : (
          /* =================== PROFILE TAB =================== */
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Your Profile
                </h2>
                <p className={`${textMutedClass} text-sm mt-1`}>
                  Manage your account information and preferences.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition cursor-pointer ${
                  isLight
                    ? "bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-855"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                }`}
              >
                <FaEdit size={14} /> Edit Details
              </button>
            </div>

            {/* Profile Detail Card */}
            <ProfileSummary user={user} isLight={isLight} />

            {/* Watch History Metrics */}
            <StatsCards user={user} isLight={isLight} />

            {/* Profile Action Settings */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`flex-1 py-3.5 rounded-xl border font-semibold text-center text-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer ${outlineBtnClass}`}
              >
                <FaCog /> Settings
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex-1 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 py-3.5 rounded-xl font-semibold text-center text-sm text-red-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =================== EDIT PROFILE MODAL =================== */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isLight={isLight}
        editName={editName}
        setEditName={setEditName}
        editLocation={editLocation}
        setEditLocation={setEditLocation}
        editGender={editGender}
        setEditGender={setEditGender}
        editBirthday={editBirthday}
        setEditBirthday={setEditBirthday}
        editBio={editBio}
        setEditBio={setEditBio}
        editPassword={editPassword}
        setEditPassword={setEditPassword}
        editOtp={editOtp}
        setEditOtp={setEditOtp}
        isPasswordOtpSent={isPasswordOtpSent}
        setIsPasswordOtpSent={setIsPasswordOtpSent}
        otpLoading={otpLoading}
        otpSuccessMessage={otpSuccessMessage}
        setOtpSuccessMessage={setOtpSuccessMessage}
        editError={editError}
        setEditError={setEditError}
        editSuccess={editSuccess}
        setEditSuccess={setEditSuccess}
        editProfilePic={editProfilePic}
        handleImageUpload={handleImageUpload}
        handleRequestPasswordOTP={handleRequestPasswordOTP}
        handleUpdateProfile={handleUpdateProfile}
      />

      {/* =================== USER SETTINGS MODAL =================== */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isLight={isLight}
        settingsTheme={settingsThemeState}
        setSettingsTheme={setSettingsThemeState}
        settingsAllowJoinRequests={settingsAllowJoinRequestsState}
        setSettingsAllowJoinRequests={setSettingsAllowJoinRequestsState}
        settingsError={settingsError}
        settingsSuccess={settingsSuccess}
        handleSaveSettings={handleSaveSettings}
      />

      {/* =================== DELETE ACCOUNT CONFIRMATION MODAL =================== */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isLight={isLight}
        deleteError={deleteError}
        handleDeleteAccount={handleDeleteAccount}
      />

      <Footer theme={currentTheme} />

      {/* Toast Alert Banner */}
      {toast.message && (
        <div className="fixed bottom-5 right-5 z-[100] animate-fadeIn">
          <div
            className={`backdrop-blur-md px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl max-w-sm ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : toast.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-zinc-800/90 border-zinc-700 text-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === "success"
                  ? "bg-green-500 animate-pulse"
                  : toast.type === "error"
                    ? "bg-red-500 animate-pulse"
                    : "bg-white animate-pulse"
              }`}
            />
            <span className="text-xs font-bold leading-normal">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
